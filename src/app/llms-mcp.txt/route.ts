import { isMcpToolPage, orderedPages, pagesAsText, textResponse } from '@/lib/llms';
import { siteUrl, writestack } from '@/lib/shared';

export const revalidate = false;

/** The MCP tool reference as one file, for coding agents and MCP client builders. */
export async function GET() {
  const pages = orderedPages().filter(isMcpToolPage);
  const intro = [
    '# WriteStack MCP tool reference',
    '',
    `> Every tool on the WriteStack MCP server (${writestack.mcpEndpoint}), generated from its tools/list. Rules for calling them: ${siteUrl}/docs/build/agent-rules.md. Full JSON Schemas: ${siteUrl}/mcp-tools.json.`,
  ].join('\n');
  return textResponse(`${intro}\n\n${await pagesAsText(pages)}`);
}
