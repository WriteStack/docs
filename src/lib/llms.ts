import type * as PageTree from 'fumadocs-core/page-tree';
import { docsLlms, source } from '@/lib/source';

export const MCP_REFERENCE_PREFIX = '/docs/build/mcp-reference/';

type DocsPage = ReturnType<typeof source.getPages>[number];

/** Page URLs in sidebar order. */
function sidebarOrder(nodes: PageTree.Node[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type === 'page') out.push(node.url);
    else if (node.type === 'folder') {
      if (node.index) out.push(node.index.url);
      sidebarOrder(node.children, out);
    }
  }
  return out;
}

/** All docs pages, in the same order as the sidebar. */
export function orderedPages(): DocsPage[] {
  const order = sidebarOrder(source.getPageTree().children);
  const rank = (url: string) => {
    const i = order.indexOf(url);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...source.getPages()].sort((a, b) => rank(a.url) - rank(b.url));
}

/** True for one generated MCP tool page (not the reference index). */
export const isMcpToolPage = (page: DocsPage) => page.url.startsWith(MCP_REFERENCE_PREFIX);

/** Concatenate pages as Markdown, the format llms-full.txt uses. */
export async function pagesAsText(pages: DocsPage[]): Promise<string> {
  const parts = await Promise.all(pages.map((page) => docsLlms.page(page)));
  return parts.join('\n\n');
}

export const textResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
