import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    // The site opens on the Introduction page, inside the docs layout (sidebar + tabs).
    return [
      { source: '/', destination: '/docs/using', permanent: false },
      { source: '/docs', destination: '/docs/using', permanent: false },
    ];
  },
};

export default withMDX(config);
