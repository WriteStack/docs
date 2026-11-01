/**
 * "I want to…" index for agents, shown at the top of /llms.txt.
 * Each href is a docs URL, optionally with a heading anchor.
 * `npm run check:agents` fails if a page or anchor doesn't exist.
 */
export const agentTasks: { task: string; href: string }[] = [
  // Getting started
  { task: 'Get started / schedule a first Note', href: '/docs/using/quickstart' },
  { task: 'Connect or change the Substack publication', href: '/docs/using/setup/connect-substack' },
  { task: 'Install or update the browser extension', href: '/docs/using/setup/browser-extension' },

  // Posting didn't work
  { task: "A Note didn't post / why didn't my Note post", href: '/docs/using/concepts/sync#why-didnt-my-note-post' },
  { task: 'What the yellow Sync button does', href: '/docs/using/concepts/sync#the-yellow-sync-button' },
  { task: 'An error message while scheduling or syncing', href: '/docs/using/troubleshooting/sync-errors' },
  { task: 'Notes post at the wrong time or in the wrong slot', href: '/docs/using/troubleshooting/schedule-mismatch' },
  { task: "Can't connect Substack / connection errors", href: '/docs/using/troubleshooting/substack-connection' },

  // Notes
  { task: 'Write or draft a Note (AI in my voice)', href: '/docs/using/notes/drafting' },
  { task: 'Import Notes from a CSV file', href: '/docs/using/notes/drafting#import-notes-from-a-csv-file' },
  { task: 'Add images, video or a link preview', href: '/docs/using/notes/images-and-link-previews' },
  { task: 'Create, assign or delete tags (categories)', href: '/docs/using/notes/tags' },
  { task: 'Repeat a Note automatically (evergreen)', href: '/docs/using/notes/evergreen' },
  { task: 'Auto-restack a Note after it publishes', href: '/docs/using/notes/auto-restack' },
  { task: 'Change my writing style / voice', href: '/docs/using/concepts/writing-style#where-to-see-and-edit-it' },

  // Queue and schedule
  { task: 'Add a Note to the queue', href: '/docs/using/schedule/queue#add-one-note-at-the-next-available-time' },
  { task: 'Schedule a Note at an exact time', href: '/docs/using/schedule/queue#add-a-note-at-a-custom-time' },
  { task: 'Reschedule / move / change the time of a scheduled Note', href: '/docs/using/schedule/queue#move-a-scheduled-note' },
  { task: 'Unschedule / cancel a scheduled Note', href: '/docs/using/schedule/queue#unschedule-a-note' },
  { task: 'Edit a Note that is already scheduled', href: '/docs/using/schedule/queue#edit-a-scheduled-note' },
  { task: 'Schedule many Notes at once', href: '/docs/using/schedule/queue#schedule-many-notes-at-once' },
  { task: 'Set up or edit weekly posting times', href: '/docs/using/schedule/weekly-template' },
  { task: 'Change or delete a posting time', href: '/docs/using/schedule/weekly-template#edit-a-time' },
  { task: 'Reserve a posting time for a tag', href: '/docs/using/schedule/weekly-template#reserve-a-time-for-tags' },
  { task: 'Change timezone', href: '/docs/using/schedule/weekly-template#timezone' },
  { task: 'How many Notes can I schedule (limit reached)', href: '/docs/using/concepts/capacity' },

  // Other features
  { task: 'Cross-post Notes to LinkedIn, X, Threads… (Buffer)', href: '/docs/using/cross-posting' },
  { task: 'Use the Coach (Quill)', href: '/docs/using/coach/what-it-does' },
  { task: 'Coach usage limits / allowance ran out', href: '/docs/using/coach/limits' },
  { task: 'Write an article and push it to Substack', href: '/docs/using/articles/substack-sync' },
  { task: 'Which Notes brought subscribers / Notes stats', href: '/docs/using/analytics/best-notes' },
  { task: 'Reply to comments and mentions', href: '/docs/using/activity-center' },
  { task: 'Contact support', href: '/docs/using/support' },

  // Account and billing
  { task: 'Compare plans and limits', href: '/docs/account/plans-and-limits' },
  { task: 'Upgrade, downgrade or switch monthly/annual', href: '/docs/account/change-plan' },
  { task: 'Cancel my subscription', href: '/docs/account/cancel' },
  { task: 'Get an invoice or update the card', href: '/docs/account/invoices' },
  { task: 'Ask for a refund', href: '/docs/account/refunds' },
  { task: 'Free trial', href: '/docs/account/trial' },
  { task: 'Affiliate program or coupon codes', href: '/docs/account/affiliates' },

  // Agents
  { task: 'Connect Claude, ChatGPT, Notion or another AI to WriteStack', href: '/docs/build' },
  { task: 'Rules for AI agents using the MCP server', href: '/docs/build/agent-rules' },
  { task: 'MCP tool list', href: '/docs/build/mcp-reference' },
];
