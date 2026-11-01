import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'WriteStack Docs';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

/** Public origin of this docs site. Used for absolute links in llms.txt and the sitemap. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.writestack.io';

/** The WriteStack app and its agent-facing endpoints. */
export const writestack = {
  app: 'https://www.writestack.io',
  login: 'https://www.writestack.io/login',
  settings: 'https://www.writestack.io/settings',
  mcpEndpoint: 'https://www.writestack.io/api/mcp/mcp',
  appLlmsTxt: 'https://www.writestack.io/llms.txt',
  support: 'orel@writestack.io',
} as const;

/** The three tracks. Each is a root folder under content/docs. */
export const tracks = [
  {
    slug: 'using',
    title: 'Using WriteStack',
    description: 'Schedule Notes, sync to Substack, write articles, work with the Coach, and read your analytics.',
  },
  {
    slug: 'account',
    title: 'Account & billing',
    description: 'Plans and limits, trials, upgrades, cancelling, invoices, refunds and affiliates.',
  },
  {
    slug: 'build',
    title: 'Build with WriteStack',
    description: 'Connect Claude, ChatGPT, Notion or your own agent over MCP. Full tool reference.',
  },
] as const;

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
