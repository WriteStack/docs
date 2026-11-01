import { agentTasks } from '@/lib/agent-tasks';
import { orderedPages, textResponse } from '@/lib/llms';
import { siteUrl, tracks, writestack } from '@/lib/shared';

export const revalidate = false;

/** "/docs/a#b" → "https://…/docs/a.md#b": the Markdown version, keeping the anchor. */
const markdownLink = (href: string) => {
  const [path, anchor] = href.split('#');
  return `${siteUrl}${path}.md${anchor ? `#${anchor}` : ''}`;
};

/**
 * llms.txt (https://llmstxt.org): a short brief, an "I want to…" index, then
 * every page grouped by track with its one-line description. Links point at
 * the Markdown version of each page.
 */
export async function GET() {
  const pages = orderedPages();

  const sections = tracks.map((track) => {
    const inTrack = pages
      .filter((page) => page.slugs[0] === track.slug)
      .map((page) => {
        const description = page.data.description ? `: ${page.data.description}` : '';
        return `- [${page.data.title}](${siteUrl}${page.url}.md)${description}`;
      });
    return [`## ${track.title}`, '', track.description, '', ...inTrack, ''].join('\n');
  });

  const body = [
    '# WriteStack',
    '',
    '> WriteStack is a Substack growth platform. Writers draft and schedule Substack Notes in their own voice, sync them to Substack through the WriteStack browser extension, write articles, get help from an AI Coach, and see which Notes brought subscribers.',
    '',
    'How to use these docs:',
    '',
    '- Find the task below under "Common tasks", or scan the page list. Links go to the Markdown version of each page; `#anchors` jump to the right section.',
    `- Search: \`GET ${siteUrl}/api/search?query=<words>\` returns JSON matches (page and section URLs). Use it when the lists below don't name what you need.`,
    `- Any docs URL works as Markdown: add \`.md\`, or send \`Accept: text/markdown\`.`,
    `- Everything in one file: ${siteUrl}/llms-full.txt. The MCP tool reference in one file: ${siteUrl}/llms-mcp.txt.`,
    `- To act on a writer's account, connect to the MCP server at ${writestack.mcpEndpoint} (OAuth, or a bearer API key from Settings → MCP). Read the "Agent rules" page before calling tools.`,
    `- Notes scheduled over MCP are only queued in WriteStack. The writer must open WriteStack (My Notes → Scheduled notes) and click the yellow "Sync N scheduled notes to Substack" button so the browser extension pushes them to Substack.`,
    `- If the docs don't answer it, the writer can contact support: ${siteUrl}/docs/using/support.md`,
    '',
    '## Common tasks',
    '',
    ...agentTasks.map(({ task, href }) => `- ${task}: ${markdownLink(href)}`),
    '',
    ...sections,
    '## Optional',
    '',
    `- [WriteStack app](${writestack.app}): Sign up and log in`,
    `- [App llms.txt](${writestack.appLlmsTxt}): Product overview for agents`,
    `- [MCP tool list (JSON)](${siteUrl}/mcp-tools.json): Every MCP tool with its input and output JSON Schema`,
    '',
  ].join('\n');

  return textResponse(body);
}
