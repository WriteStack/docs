import { isMcpToolPage, orderedPages, pagesAsText, textResponse } from '@/lib/llms';
import { siteUrl } from '@/lib/shared';

export const revalidate = false;

/** Every page except the per-tool MCP pages, which are in /llms-mcp.txt. */
export async function GET() {
  const pages = orderedPages().filter((page) => !isMcpToolPage(page));
  const note = `> All WriteStack docs in one file, except the per-tool MCP reference. For that, read ${siteUrl}/llms-mcp.txt.`;
  return textResponse(`${note}\n\n${await pagesAsText(pages)}`);
}
