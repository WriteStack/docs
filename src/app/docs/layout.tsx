import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const { nav, ...base } = baseOptions();

  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...base}
      // Sidebar on the left with logo and search, track tabs across the top bar.
      nav={{ ...nav, mode: 'auto' }}
      tabMode="navbar"
    >
      {children}
    </DocsLayout>
  );
}
