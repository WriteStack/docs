import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import './global.css';
import { Inter } from 'next/font/google';
import { siteUrl } from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'WriteStack Docs',
    template: '%s | WriteStack Docs',
  },
  description:
    'How WriteStack works: schedule Substack Notes, sync them to Substack, use the Coach, read your analytics, manage billing, and connect AI agents over MCP.',
  alternates: {
    types: {
      'text/plain': '/llms.txt',
    },
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
