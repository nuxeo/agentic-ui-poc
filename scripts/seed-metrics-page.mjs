/**
 * Seed (or repair) the shared metrics page.
 *
 *   node scripts/seed-metrics-page.mjs
 *
 * Rewrites the page body with the prose and an empty runs table. **It discards existing
 * rows**, so only run it when the page structure is broken — `agent-metrics publish` is what
 * adds data.
 *
 * The publisher locates the table by the "Runs" heading, because Confluence's storage-format
 * sanitiser strips HTML comments and a marker comment silently does not survive the first save.
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const PAGE = process.env['AGENT_METRICS_PAGE_ID'] ?? '4301586845';
const BASE = process.env['AGENT_METRICS_CONFLUENCE'] ?? 'https://hyland.atlassian.net/wiki';
const auth = `Basic ${Buffer.from(
  `${readFileSync(`${homedir()}/.jira_email`, 'utf8').trim()}:${readFileSync(`${homedir()}/.jira_token`, 'utf8').trim()}`,
).toString('base64')}`;

const th = (s) => `<th><p><strong>${s}</strong></p></th>`;
const p = (s) => `<p>${s}</p>`;
const h2 = (s) => `<h2>${s}</h2>`;

const body = [
  p('Who ran the bug-fix skill, on which ticket, and <strong>how long the fix itself took</strong>. One row per run, appended automatically &mdash; nobody is expected to fill this in by hand.'),

  h2('How a row lands here'),
  p('At the end of a run the agent executes:'),
  '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[node scripts/agent-metrics.mjs publish <TICKET-ID>]]></ac:plain-text-body></ac:structured-macro>',
  p('It authenticates with the engineer&rsquo;s own <code>~/.jira_email</code> and <code>~/.jira_token</code>, so each row is written by the person who ran it and the page history shows who added what.'),
  p('<strong>Keep the &ldquo;Runs&rdquo; heading immediately above the table.</strong> The publisher finds the table by that heading. If the heading goes, it refuses to write rather than guessing and putting the row in the wrong table.'),

  h2('The three columns'),
  `<table><tbody>
    <tr>${th('Column')}${th('What it is')}</tr>
    <tr><td><p><strong>User</strong></p></td><td><p>The Atlassian account of whoever ran it, taken from <code>~/.jira_email</code>.</p></td></tr>
    <tr><td><p><strong>Ticket ID</strong></p></td><td><p>Joins the row to the Jira issue, the PR and the evidence folder.</p></td></tr>
    <tr><td><p><strong>Time to fix</strong></p></td><td><p>Time spent understanding the problem and changing the code until it was right: reading the ticket, establishing the expected behaviour, reproducing, choosing the approach, implementing, testing, the blast-radius check, getting the local gate green, and answering review comments.<br/><br/><strong>Excludes evidence capture and comparison, and all waiting</strong> &mdash; CI polling, workspace setup, ticket admin, teardown. The first row published wall clock and read 4h 13m for a one-line change, of which 88% was capture and polling; that number says nothing about the fix and was read as if it did.</p></td></tr>
  </tbody></table>`,

  h2('What is not here, and where it lives'),
  p('The <strong>per-phase breakdown</strong>, and the evidence and overhead subtotals, are deliberately not published. They are for tuning the skill rather than for reporting, and thirty columns produced a table nobody could read across. Everything is written to <code>~/Desktop/agentic-ui-evidence/&lt;TICKET&gt;/metrics.jsonl</code> on the machine that ran it, and <code>node scripts/agent-metrics.mjs report &lt;TICKET&gt;</code> prints all three totals. If you are asking why a fix was slow, read that; this page answers how long fixes take.'),
  p('<strong>Tokens and spend are not recorded anywhere.</strong> A running agent cannot read its own token usage, so any figure here would be an estimate with no measurement behind it, sitting beside a real one and being believed. The local log keeps the account, model and UTC window of each run, which is what Cursor&rsquo;s usage export needs to attribute spend properly.'),

  h2('Runs'),
  `<table><tbody>
<tr>${th('User')}${th('Ticket ID')}${th('Time to fix')}</tr>
</tbody></table>`,
].join('\n');

const cur = await (await fetch(`${BASE}/api/v2/pages/${PAGE}`, { headers: { Authorization: auth, Accept: 'application/json' } })).json();

const res = await fetch(`${BASE}/api/v2/pages/${PAGE}`, {
  method: 'PUT',
  headers: { Authorization: auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: PAGE,
    status: 'current',
    title: cur.title,
    body: { representation: 'storage', value: body },
    version: { number: cur.version.number + 1, message: 'seed metrics table' },
  }),
});
// Exit non-zero on failure. Printing FAILED and returning 0 let callers and automation
// treat an unsuccessful *destructive* repair as success.
if (!res.ok) {
  console.error(`FAILED ${res.status}: ${(await res.text()).slice(0, 400)}`);
  process.exit(1);
}
console.log(`seeded v${cur.version.number + 1}`);
