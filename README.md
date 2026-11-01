# WriteStack Docs

Source for **[docs.writestack.io](https://docs.writestack.io)**: how WriteStack works, for writers and for AI agents.

Built with Next.js 16 and [Fumadocs](https://fumadocs.dev). Content is MDX in `content/docs`.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build. Runs `check:agents` first |
| `npm run gen:mcp` | Regenerate the MCP tool reference from `../WriteStack` |
| `npm run check:agents` | Fail if a link in the agent task index points to a missing page or heading |
| `npm run types:check` | Next route types + TypeScript |
| `npm run lint` | ESLint |

## Structure

The docs have three tracks. Each one is a root folder with its own sidebar tab.

| Folder | Track | For |
| --- | --- | --- |
| `content/docs/using` | Using WriteStack | Writers: Notes, queue, Sync, articles, Coach, analytics, troubleshooting |
| `content/docs/account` | Account & billing | Plans, limits, trial, upgrades, cancelling, refunds, affiliates |
| `content/docs/build` | Build with WriteStack | MCP server, connecting AI clients, agent rules, tool reference |

The sidebar order comes from each folder's `meta.json`. A new page has to be added there.

| Path | Notes |
| --- | --- |
| `content/docs/build/mcp-reference/` | **Generated.** Don't edit by hand |
| `public/mcp-tools.json` | **Generated.** Every MCP tool with its JSON Schemas |
| `scripts/generate-mcp-reference.mjs` | Builds the two above from the app's MCP contract snapshot |
| `src/lib/agent-tasks.ts` | The "Common tasks" index at the top of `/llms.txt` |
| `src/app/llms*.txt/` | Agent entry points |
| `AGENTS.md` | Writing rules for people and AI writing pages |

## Built for AI agents

| URL | What |
| --- | --- |
| `/llms.txt` | Brief, Common tasks index, then every page with a one-line description in sidebar order. All links go to Markdown versions |
| `/llms-full.txt` | Every page in one file, except the per-tool MCP pages |
| `/llms-mcp.txt` | The MCP tool reference in one file |
| `/docs/<page>.md` | Any page as Markdown. Also served for `Accept: text/markdown` |
| `/api/search?query=…` | Full-text search, JSON |
| `/mcp-tools.json` | Machine-readable MCP tool list |
| `/sitemap.xml`, `/robots.txt` | Crawling |

## Writing pages

Read [AGENTS.md](./AGENTS.md) first. In short:

- Every fact comes from the app code (`../WriteStack`). Quote UI labels exactly.
- Every page needs a `title` and a one-sentence `description`. The description is what agents see in `llms.txt`.
- One page answers one question. Link to the canonical page instead of repeating it. Sync, for example, is explained only in `using/concepts/sync`.
- Leave `{/* TODO(orel): … */}` for anything you couldn't verify. Readers don't see it. Run `grep -rn "TODO(orel)" content` to list them.
- Don't document features behind a feature flag.

## Keeping the docs current

- **MCP tools:** when a tool changes in the app, its contract snapshot (`src/app/api/mcp/_tools/__snapshots__/mcp-tools.contract.test.ts.snap`) changes too. Run `npm run gen:mcp` here and commit. The script fails if a tool has no category in `CATEGORIES`.
- **Everything else:** the WriteStack app's `pre-push` hook runs `scripts/docs-check.mjs`. It asks an AI whether the commits being pushed change anything these docs describe, and lists the pages to update.

## Deploy

Deploy on Vercel as a standard Next.js project. Set `NEXT_PUBLIC_SITE_URL` if the site isn't at `https://docs.writestack.io`.
