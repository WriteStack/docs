import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName, writestack } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image src="/logo.png" alt="" width={24} height={24} className="rounded" />
          <span className="font-semibold">{appName}</span>
        </>
      ),
      url: '/',
    },
    links: [
      { text: 'Open WriteStack', url: writestack.app, external: true },
      { text: 'llms.txt', url: '/llms.txt', external: true },
    ],
  };
}
