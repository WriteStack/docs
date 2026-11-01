import Link from 'next/link';
import { tracks, writestack } from '@/lib/shared';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">WriteStack Docs</h1>
      <p className="mt-3 max-w-2xl text-fd-muted-foreground">
        How WriteStack works, from your first scheduled Note to connecting an AI agent. Pick a
        path.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {tracks.map((track) => (
          <Link
            key={track.slug}
            href={`/docs/${track.slug}`}
            className="rounded-xl border bg-fd-card p-5 transition-colors hover:border-fd-primary hover:bg-fd-accent"
          >
            <h2 className="font-semibold">{track.title}</h2>
            <p className="mt-2 text-sm text-fd-muted-foreground">{track.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-xl border p-5 text-sm">
        <h2 className="font-semibold">For AI agents</h2>
        <ul className="mt-2 space-y-1 text-fd-muted-foreground">
          <li>
            Index: <a className="text-fd-primary underline" href="/llms.txt">/llms.txt</a>. Every
            page in one file: <a className="text-fd-primary underline" href="/llms-full.txt">/llms-full.txt</a>.
          </li>
          <li>
            Any page as Markdown: add <code>.md</code> to its URL, or send{' '}
            <code>Accept: text/markdown</code>.
          </li>
          <li>
            MCP server: <code>{writestack.mcpEndpoint}</code>
          </li>
        </ul>
      </section>
    </main>
  );
}
