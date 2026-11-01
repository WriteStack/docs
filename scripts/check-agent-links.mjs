#!/usr/bin/env node
/**
 * Checks that every link in src/lib/agent-tasks.ts points to a real docs page
 * and, if it has an #anchor, to a real heading on that page.
 * Anchors use the same slug rules as Fumadocs (github-slugger).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tasks = fs.readFileSync(path.join(ROOT, 'src/lib/agent-tasks.ts'), 'utf8');
const hrefs = [...tasks.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]);

const fileFor = (urlPath) => {
  const rel = urlPath.replace(/^\/docs\/?/, '');
  const base = path.join(ROOT, 'content/docs', rel);
  for (const f of [`${base}.mdx`, path.join(base, 'index.mdx')]) if (fs.existsSync(f)) return f;
  return null;
};

const anchorsOf = (file) => {
  const slugger = new GithubSlugger();
  return new Set(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => /^#{2,6} /.test(line))
      .map((line) => slugger.slug(line.replace(/^#+ /, '').replace(/[`*]/g, ''))),
  );
};

const problems = [];
for (const href of hrefs) {
  const [urlPath, anchor] = href.split('#');
  const file = fileFor(urlPath);
  if (!file) problems.push(`${href}: no page`);
  else if (anchor && !anchorsOf(file).has(anchor)) problems.push(`${href}: no heading #${anchor}`);
}

if (problems.length) {
  console.error(`Broken links in src/lib/agent-tasks.ts:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`All ${hrefs.length} agent task links resolve.`);
