/**
 * Seed (or repair) the PR review analysis page.
 *
 *   node scripts/seed-pr-analysis-page.mjs
 *
 * Rewrites the page body with the prose and an empty findings table. **It discards existing
 * rows**, so only run it when the structure is broken — `pr-review-analysis.mjs publish` is
 * what adds data.
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { CATEGORIES } from './pr-review-analysis.mjs';

const PAGE = process.env['PR_ANALYSIS_PAGE_ID'] ?? '4301586839';
const BASE = process.env['AGENT_METRICS_CONFLUENCE'] ?? 'https://hyland.atlassian.net/wiki';
const auth = `Basic ${Buffer.from(
  `${readFileSync(`${homedir()}/.jira_email`, 'utf8').trim()}:${readFileSync(`${homedir()}/.jira_token`, 'utf8').trim()}`,
).toString('base64')}`;

const th = (s) => `<th><p><strong>${s}</strong></p></th>`;
const p = (s) => `<p>${s}</p>`;
const h2 = (s) => `<h2>${s}</h2>`;

const body = [
  p('Every comment a reviewer leaves on a pull request is a defect the authoring agent shipped and the reviewing agent caught. This page is not a bug list &mdash; it is a record of <strong>the gap between the two</strong>, so that a pre-PR review skill can be built from what actually gets missed rather than from someone&rsquo;s idea of what might.'),
  p('The column that matters is <strong>Why it was missed</strong>. &ldquo;Careless&rdquo; is never the answer; if it were, the remedy would be &ldquo;be careful&rdquo;, which has never worked. Each row names the structural reason &mdash; a claim nobody re-read after the code changed, a guarantee asserted in prose rather than in code, a check that tested a proxy for the thing it was named after.'),

  h2('How rows get here'),
  '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[node scripts/pr-review-analysis.mjs harvest <pr> [<pr> …]   # pulls every reviewer comment\n# fill in `category` and `whyMissed` on each row, judging one at a time\nnode scripts/pr-review-analysis.mjs publish <file.jsonl>]]></ac:plain-text-body></ac:structured-macro>',
  p('Harvesting is mechanical; classification is not, and <code>publish</code> refuses a row with either field blank rather than putting a gap in the column the page exists for. Resolved comments are included &mdash; a fixed defect still shipped.'),

  h2('Defect classes'),
  `<table><tbody><tr>${th('Class')}${th('What it means')}</tr>` +
    Object.entries(CATEGORIES).map(([k, v]) => `<tr><td><p><code>${k}</code></p></td><td><p>${v}</p></td></tr>`).join('') +
    '</tbody></table>',

  h2('What the first 57 say'),
  p('Findings from six pull requests over one day, all of them accepted as valid; none was a false positive. Three classes account for <strong>63%</strong>:'),
  `<table><tbody>
     <tr>${th('Class')}${th('Count')}${th('What a pre-PR check would have to do')}</tr>
     <tr><td><p><code>proxy-check</code></p></td><td><p>15</p></td><td><p>The single biggest class. The code tests something <em>adjacent</em> to what its name claims: <code>isConnected</code> for &ldquo;visible&rdquo;, a phase opened for a phase finished, <code>!== pass</code> for <code>=== fail</code>, an id present for &ldquo;my element&rdquo;, a <code>load</code> event for &ldquo;navigated&rdquo;. Always the easier property to query. A check has to read: <em>does this assertion test the noun in its own name?</em></p></td></tr>
     <tr><td><p><code>unenforced-guarantee</code></p></td><td><p>12</p></td><td><p>A promise made in prose that the code permits a caller to break &mdash; an overridable value documented as fixed, a contract reported but not made a condition of the verdict, a rule in the checklist and a fallback in the code. A check has to pair every <strong>must/never/always</strong> in the docs with the line that enforces it.</p></td></tr>
     <tr><td><p><code>stale-prose</code></p></td><td><p>9</p></td><td><p>The fix lands and text describing the old behaviour survives &mdash; usually in the same file, often a header far above the change. Mechanically detectable: after editing a symbol or a default, grep the file and its docs for the claim just invalidated.</p></td></tr>
     <tr><td><p><code>ordering</code> / <code>silent-failure</code></p></td><td><p>5 / 5</p></td><td><p>Guards appended after the code they guard; validation before the state it validates; <code>curl -s</code> and <code>.catch(() =&gt; {})</code> turning failure into success. Both are pattern-matchable.</p></td></tr>
     <tr><td><p><code>false-claim</code></p></td><td><p>4</p></td><td><p>The PR body or a doc asserts something the diff does not do. Every claim in a description should be checkable against the diff, and checked.</p></td></tr>
     <tr><td><p>the rest</p></td><td><p>7</p></td><td><p><code>incomplete-fetch</code>, <code>scope</code>, <code>dead-branch</code>, <code>broken-reference</code>.</p></td></tr>
   </tbody></table>`,

  h2('The pattern underneath'),
  p('Almost none of these are logic errors. The author understood the problem and wrote code that solves it; what went wrong is <strong>the difference between what the code does and what the author believed it does</strong> &mdash; and that difference is invisible from the inside, because the belief is what produced the code. The reviewer is not smarter; it simply has no belief to defend and reads what is there.'),
  p('That is why "review your own work more carefully" does not close this gap, and why the checks worth automating are the ones that compare two artifacts rather than inspect one: <em>code against its own comments</em>, <em>a check&rsquo;s body against its name</em>, <em>a PR description against its diff</em>, <em>a documented guarantee against the line that enforces it</em>.'),
  p('<em>Three of the findings here were regressions of fixes made earlier in the same review loop &mdash; a latch discarded by a later re-injection, a guard applied to one of two injectors, a curl flag fixed in one call and not its twin. Whatever gets built should re-check previous findings on each round, not only the new diff.</em>'),

  h2('Findings'),
  `<table data-layout="full-width"><tbody>
<tr>${th('PR')}${th('File')}${th('What the reviewer caught')}${th('Class')}${th('Why it was missed')}</tr>
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
    version: { number: cur.version.number + 1, message: 'seed analysis page' },
  }),
});
if (!res.ok) {
  console.error(`FAILED ${res.status}: ${(await res.text()).slice(0, 400)}`);
  process.exit(1);
}
console.log(`seeded v${cur.version.number + 1}`);
