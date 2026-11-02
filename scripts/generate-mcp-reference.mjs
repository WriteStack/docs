#!/usr/bin/env node
/**
 * Generates the MCP tool reference from the WriteStack MCP server's real
 * `tools/list` output:
 *
 *   content/docs/build/mcp-reference/index.mdx      all tools, grouped
 *   content/docs/build/mcp-reference/<tool>.mdx     one page per tool
 *   content/docs/build/mcp-reference/meta.json      sidebar order
 *   public/mcp-tools.json                           machine-readable list
 *
 * Source of truth: the Jest contract snapshot in the WriteStack app repo,
 *   src/app/api/mcp/_tools/__snapshots__/mcp-tools.contract.test.ts.snap
 * which records name, description, input/output schema and annotations
 * for every tool exactly as an MCP client sees them.
 *
 * Usage:
 *   npm run gen:mcp                       (expects ../WriteStack)
 *   node scripts/generate-mcp-reference.mjs /path/to/WriteStack
 *
 * Never edit the generated files by hand. Change the tool in the app, update
 * the snapshot there, then re-run this script and commit the result.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = path.resolve(
  process.argv[2] ?? process.env.WRITESTACK_APP_DIR ?? path.join(ROOT, '../WriteStack'),
);
const SNAPSHOT = path.join(
  APP_DIR,
  'src/app/api/mcp/_tools/__snapshots__/mcp-tools.contract.test.ts.snap',
);
const OUT_DIR = path.join(ROOT, 'content/docs/build/mcp-reference');
const TOOLS_JSON = path.join(ROOT, 'public/mcp-tools.json');
const URL_BASE = '/docs/build/mcp-reference';

/** Category for every tool. A tool missing here fails the run. */
const CATEGORIES = [
  {
    group: 'Notes',
    tools: [
      'list_notes',
      'get_note',
      'get_writing_style',
      'list_tags',
      'create_note',
      'create_many_notes',
      'update_note',
    ],
  },
  {
    group: 'Schedule',
    tools: [
      'get_schedule',
      'get_queue',
      'get_next_available_slots',
      'get_schedule_capacity',
      'schedule_notes',
      'schedule_notes_with_custom_dates',
    ],
  },
  {
    group: 'Articles',
    tools: [
      'list_article_newsletters',
      'list_articles',
      'get_article',
      'create_article',
      'update_article',
      'create_article_image_upload',
      'push_article_to_substack',
      'schedule_article_on_substack',
      'unschedule_article_on_substack',
      'get_article_substack_status',
    ],
  },
  {
    group: 'Statistics and activity',
    tools: ['get_notes_statistics', 'get_posts_statistics', 'list_activities'],
  },
  { group: 'Cross-posting', tools: ['list_buffer_channels'] },
  { group: 'Coach', tools: ['ask_coach'] },
  { group: 'Other', tools: ['get_feature_suggestion_link'] },
];

// ---------------------------------------------------------------------------

const loadTools = () => {
  if (!fs.existsSync(SNAPSHOT)) {
    console.error(`Snapshot not found: ${SNAPSHOT}\nPass the WriteStack app path as the first argument.`);
    process.exit(1);
  }
  const exportsObj = {};
  new Function('exports', fs.readFileSync(SNAPSHOT, 'utf8'))(exportsObj);
  const printed = Object.values(exportsObj)[0];
  // Jest's pretty-format output is JSON plus trailing commas.
  return JSON.parse(printed.replace(/,(\s*[}\]])/g, '$1'));
};

/** Escape text for MDX prose: braces and angle brackets are JSX. */
const mdx = (text = '') =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // `![alt](url)` in a description would become an MDX image import.
    .replace(/!\[/g, '!\\[');

/** Escape text for a Markdown table cell. */
const cell = (text = '') => mdx(text).replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|');

const accessOf = (annotations) => {
  if (annotations?.readOnlyHint) return 'read';
  if (annotations?.destructiveHint) return 'irreversible';
  return 'write';
};

const ACCESS_LABEL = { read: 'Read-only', write: 'Writes data', irreversible: 'Irreversible' };

const typeOf = (schema) => {
  if (!schema) return 'any';
  if (schema.anyOf) return [...new Set(schema.anyOf.map(typeOf))].join(' \\| ');
  if (Array.isArray(schema.type)) return schema.type.join(' \\| ');
  if (schema.type === 'array') return `${typeOf(schema.items)}[]`;
  if (schema.enum && !schema.type) return 'enum';
  return schema.type ?? 'any';
};

/** The object schema to expand, if any: direct, array items, or anyOf. */
const objectChild = (schema) => {
  if (!schema) return null;
  if (schema.type === 'object' && schema.properties) return { schema, suffix: '' };
  if (schema.type === 'array') {
    const inner = objectChild(schema.items);
    return inner && { ...inner, suffix: `[]${inner.suffix}` };
  }
  for (const option of schema.anyOf ?? []) {
    const found = objectChild(option);
    if (found) return found;
  }
  return null;
};

const constraintsOf = (schema) => {
  const out = [];
  const collect = (s) => {
    if (!s) return;
    if (s.enum) out.push(`One of: ${s.enum.map((v) => `\`${JSON.stringify(v)}\``).join(', ')}.`);
    if (s.minimum !== undefined) out.push(`Min ${s.minimum}.`);
    if (s.maximum !== undefined) out.push(`Max ${s.maximum}.`);
    if (s.minLength !== undefined) out.push(`Min length ${s.minLength}.`);
    if (s.maxLength !== undefined) out.push(`Max length ${s.maxLength}.`);
    if (s.minItems !== undefined) out.push(`Min items ${s.minItems}.`);
    if (s.maxItems !== undefined) out.push(`Max items ${s.maxItems}.`);
    if (s.format) out.push(`Format \`${s.format}\`.`);
    if (s.default !== undefined) out.push(`Default \`${JSON.stringify(s.default)}\`.`);
    if (s.type === 'array' && s.items && !s.items.properties) collect(s.items);
  };
  collect(schema);
  (schema?.anyOf ?? []).forEach(collect);
  return [...new Set(out)];
};

const describe = (schema) =>
  schema?.description ?? schema?.anyOf?.find((s) => s.description)?.description ?? '';

/** Flatten an object schema into table rows with dotted paths (notes[].content). */
const rows = (objectSchema, prefix = '') => {
  const required = new Set(objectSchema.required ?? []);
  const out = [];
  for (const [name, schema] of Object.entries(objectSchema.properties ?? {})) {
    const fullName = `${prefix}${name}`;
    const details = [describe(schema), ...constraintsOf(schema)].filter(Boolean).join(' ');
    out.push(
      `| \`${fullName}\` | \`${typeOf(schema)}\` | ${required.has(name) ? 'Yes' : 'No'} | ${cell(details)} |`,
    );
    const child = objectChild(schema);
    if (child) out.push(...rows(child.schema, `${fullName}${child.suffix}.`));
  }
  return out;
};

const table = (objectSchema, firstColumn) => [
  `| ${firstColumn} | Type | Required | Description |`,
  '| --- | --- | --- | --- |',
  ...rows(objectSchema),
];

/** Example arguments built from required fields only. */
const exampleFor = (schema) => {
  if (!schema) return null;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum) return schema.enum[0];
  if (schema.anyOf) return exampleFor(schema.anyOf.find((s) => s.type !== 'null') ?? schema.anyOf[0]);
  switch (Array.isArray(schema.type) ? schema.type[0] : schema.type) {
    case 'string':
      if (schema.format === 'date-time') return '2026-11-10T09:00:00Z';
      if (schema.format === 'date') return '2026-11-10';
      return '…';
    case 'integer':
    case 'number':
      return schema.minimum ?? 1;
    case 'boolean':
      return true;
    case 'array':
      return [exampleFor(schema.items)];
    case 'object': {
      const out = {};
      for (const key of schema.required ?? []) out[key] = exampleFor(schema.properties?.[key]);
      return out;
    }
    default:
      return null;
  }
};

const firstSentence = (text) => {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  const match = flat.match(/^(.+?[.!?])(\s|$)/);
  return match ? match[1] : flat;
};

const GENERATED = '{/* GENERATED by scripts/generate-mcp-reference.mjs from the MCP server tools/list. Do not edit. */}';

const renderTool = (tool, group) => {
  const access = accessOf(tool.annotations);
  const title = tool.annotations?.title ?? tool.name;
  const hasInputs = Object.keys(tool.inputSchema?.properties ?? {}).length > 0;
  const call = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: tool.name, arguments: exampleFor(tool.inputSchema) ?? {} },
  };

  const out = [
    '---',
    `title: ${JSON.stringify(tool.name)}`,
    `description: ${JSON.stringify(`${title}. ${firstSentence(tool.description)}`)}`,
    '---',
    '',
    GENERATED,
    '',
    `| Group | Access | MCP name |`,
    '| --- | --- | --- |',
    `| ${group} | ${ACCESS_LABEL[access]} | \`${tool.name}\` |`,
    '',
  ];

  if (access === 'irreversible') {
    out.push('<Callout type="warn">This tool changes data in a way that cannot be undone. Confirm with the writer before calling it.</Callout>', '');
  }

  out.push(
    '## Description',
    '',
    'The description the MCP server sends to the model, word for word. Its rules apply to every call.',
    '',
    ...mdx(tool.description).split('\n').map((line) => `> ${line}`),
    '',
    '## Arguments',
    '',
  );
  out.push(...(hasInputs ? table(tool.inputSchema, 'Argument') : ['This tool takes no arguments.']), '');

  out.push(
    '## Example call',
    '',
    'The smallest valid request: required arguments only, with placeholder values.',
    '',
    '```json',
    JSON.stringify(call, null, 2),
    '```',
    '',
  );

  if (tool.outputSchema?.properties) {
    out.push(
      '## Result',
      '',
      'The result has `structuredContent` that matches this schema. The same data is also in `content` as JSON text.',
      '',
      ...table(tool.outputSchema, 'Field'),
      '',
    );
  }

  out.push('## Annotations', '', '| Hint | Value |', '| --- | --- |');
  for (const key of ['readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint']) {
    if (tool.annotations?.[key] !== undefined) out.push(`| \`${key}\` | \`${tool.annotations[key]}\` |`);
  }
  out.push(
    '',
    `The full input and output JSON Schemas for every tool are in [/mcp-tools.json](/mcp-tools.json).`,
    '',
  );
  return out.join('\n');
};

const renderIndex = (tools, groupOf) => {
  const out = [
    '---',
    'title: All MCP tools',
    `description: ${JSON.stringify(`Every tool the WriteStack MCP server exposes (${tools.length} in total), grouped by area, with what each does and whether it changes data.`)}`,
    '---',
    '',
    GENERATED,
    '',
    `The server exposes **${tools.length} tools**. These pages are generated from the server's own \`tools/list\` response, so names, arguments and descriptions match what your client sees. The full list with JSON Schemas is at [/mcp-tools.json](/mcp-tools.json).`,
    '',
    'Before calling any tool, read [Agent rules](/docs/build/agent-rules).',
    '',
  ];
  for (const { group } of CATEGORIES) {
    const inGroup = tools.filter((t) => groupOf[t.name] === group);
    out.push(`## ${group}`, '', '| Tool | Access | What it does |', '| --- | --- | --- |');
    for (const t of inGroup) {
      out.push(`| [\`${t.name}\`](${URL_BASE}/${t.name}) | ${ACCESS_LABEL[accessOf(t.annotations)]} | ${cell(firstSentence(t.description))} |`);
    }
    out.push('');
  }
  return out.join('\n');
};

// ---------------------------------------------------------------------------

const tools = loadTools().sort((a, b) => a.name.localeCompare(b.name));
const groupOf = Object.fromEntries(CATEGORIES.flatMap((c) => c.tools.map((t) => [t, c.group])));

const missing = tools.filter((t) => !groupOf[t.name]).map((t) => t.name);
const gone = Object.keys(groupOf).filter((n) => !tools.some((t) => t.name === n));
if (missing.length || gone.length) {
  if (missing.length) console.error(`Tools with no category (add them to CATEGORIES): ${missing.join(', ')}`);
  if (gone.length) console.error(`Categorised tools no longer on the server (remove them): ${gone.join(', ')}`);
  process.exit(1);
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const tool of tools) {
  fs.writeFileSync(path.join(OUT_DIR, `${tool.name}.mdx`), renderTool(tool, groupOf[tool.name]));
}
fs.writeFileSync(path.join(OUT_DIR, 'index.mdx'), renderIndex(tools, groupOf));

const pages = ['index'];
for (const { group, tools: names } of CATEGORIES) pages.push(`---${group}---`, ...names);
fs.writeFileSync(
  path.join(OUT_DIR, 'meta.json'),
  `${JSON.stringify({ title: 'Tool reference', pages }, null, 2)}\n`,
);

fs.mkdirSync(path.dirname(TOOLS_JSON), { recursive: true });
fs.writeFileSync(
  TOOLS_JSON,
  `${JSON.stringify({ server: 'https://www.writestack.io/api/mcp/mcp', tools }, null, 2)}\n`,
);

console.log(`Generated ${tools.length} MCP tool pages from ${SNAPSHOT}`);
