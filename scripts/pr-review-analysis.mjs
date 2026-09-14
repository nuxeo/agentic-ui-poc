#!/usr/bin/env node
/**
 * Harvest what the PR reviewer caught, and why we did not catch it first.
 *
 *   node scripts/pr-review-analysis.mjs harvest <pr> [<pr> …]   # -> a JSONL to classify
 *   node scripts/pr-review-analysis.mjs publish <file.jsonl>    # -> appends to Confluence
 *
 * ## What this is for
 *
 * Every review comment that lands on a pull request is a defect the authoring agent shipped
 * and the reviewing agent caught. That gap is the interesting thing: not the individual bug,
 * but the *class* of bug and the reason it was invisible from the inside. Forty-odd of them
 * in one week is enough to see the shape, and the shape is what a pre-PR review skill has to
 * be built from — otherwise it is a list of somebody's habits.
 *
 * So the harvest is mechanical and the classification is not. `harvest` pulls every Copilot
 * finding with its file, line and body and leaves two fields blank; a human or an agent fills
 * them in, judging one comment at a time; `publish` appends the result.
 *
 * "Every" means all three places GitHub puts reviewer feedback — inline review threads, the
 * review **summary body**, and PR **conversation** comments. It used to mean only the first,
 * which on PR #182 harvested 2 rows out of 5 findings: the summary body's verdict and the
 * three findings Copilot had folded into its "Suppressed comments" block were all dropped,
 * and the class counts this page exists to produce were wrong by 60%.
 *
 * ## The two fields that matter
 *
 * `category`   the defect class, from the fixed list below — free text makes rows
 *              incomparable, and an incomparable table cannot tell you what to automate.
 * `whyMissed`  why the author did not see it. This is the column the skill gets built from.
 *              "Careless" is never the answer; if it were, the fix would be "be careful",
 *              which has never worked. Look for the structural reason: a claim nobody
 *              re-read after the code changed, a guarantee asserted in prose and not in
 *              code, a check that tested a proxy for the thing it named.
 */

import { appendFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { EVIDENCE_ROOT } from './collect-evidence/evidence-path.mjs';

/**
 * The defect classes, fixed on purpose.
 *
 * Derived from the first batch rather than invented up front: each one is a pattern that
 * recurred, and each suggests a different kind of pre-PR check. A class nothing falls into is
 * worth adding; a class everything falls into is worth splitting.
 */
export const CATEGORIES = {
  'stale-prose': 'Code changed; a comment, header, table or doc describing the old behaviour survived nearby',
  'unenforced-guarantee': 'The prose promises something the code does not enforce, or allows a caller to contradict',
  'silent-failure': 'An error path is swallowed — a bare `curl -s`, a `.catch(() => {})`, an exit 0 on failure',
  'proxy-check': 'The check tests something adjacent to its name: connected for visible, a phase opened for a phase finished',
  'ordering': 'Right steps, wrong order — a guard after the side effect, a cleanup before the thing that needs it',
  'incomplete-fetch': 'Only part of the data is read: unpaginated, first page only, one source of several',
  'broken-reference': 'A link, path or id that does not resolve',
  'false-claim': 'The PR body, changelog or docs assert something the diff does not do',
  'dead-branch': 'Code that cannot execute, or a condition that cannot fire',
  'scope': 'Unrelated change bundled in, or a change the title does not mention',
  other: 'Does not fit above — if this grows, add a class',
};

const PAGE_ID = process.env['PR_ANALYSIS_PAGE_ID'] ?? '4301586839';
const CONFLUENCE = process.env['AGENT_METRICS_CONFLUENCE'] ?? 'https://hyland.atlassian.net/wiki';
const REPO = process.env['PR_ANALYSIS_REPO'] ?? 'nuxeo/agentic-ui-poc';
const OUT_DIR = resolve(EVIDENCE_ROOT, 'pr-review-analysis');

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

/** Every review comment on a PR, resolved or not — a fixed one still happened. */
export function harvestPr(pr) {
  const [owner, name] = REPO.split('/');
  const raw = gh([
    'api',
    'graphql',
    '--paginate',
    '-F',
    `owner=${owner}`,
    '-F',
    `name=${name}`,
    '-F',
    `number=${pr}`,
    '-f',
    `query=query($owner:String!,$name:String!,$number:Int!,$endCursor:String){
      repository(owner:$owner,name:$name){pullRequest(number:$number){
        title
        reviewThreads(first:50, after:$endCursor){
          pageInfo{ hasNextPage endCursor }
          nodes{ isResolved path line
            comments(first:1){ nodes{ databaseId author{ login } body url } } }
        }}}}`,
    '--jq',
    '.data.repository.pullRequest as $pr | $pr.reviewThreads.nodes[] | {title: $pr.title} + .',
  ]);

  return raw
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((t) => /copilot/i.test(t.comments.nodes[0]?.author?.login ?? ''))
    .map((t) => {
      const c = t.comments.nodes[0];
      return {
        pr: Number(pr),
        prTitle: t.title,
        file: t.path,
        line: t.line,
        url: c.url,
        // First sentence: enough to recognise the finding in a table, and the URL has the rest.
        finding: (c.body.split('\n')[0] ?? '').replace(/\s+/g, ' ').trim().slice(0, 220),
        resolved: t.isResolved,
        category: '',
        whyMissed: '',
      };
    });
}

if (isCli) {
  const [, , cmd, ...rest] = process.argv;

  if (cmd === 'harvest') {
    if (!rest.length) {
      console.error('Usage: pr-review-analysis.mjs harvest <pr> [<pr> …]');
      process.exit(2);
    }
    await mkdir(OUT_DIR, { recursive: true });
    const out = resolve(OUT_DIR, `${new Date().toISOString().slice(0, 10)}.jsonl`);
    let n = 0;
    for (const pr of rest) {
      for (const row of harvestPr(pr)) {
        await appendFile(out, `${JSON.stringify(row)}\n`, 'utf8');
        n += 1;
      }
    }
    console.log(`\nHarvested ${n} reviewer comment(s) from PR(s) ${rest.join(', ')}`);
    console.log(`  ${out}\n`);
    console.log('Now fill in `category` and `whyMissed` on each row, then publish.');
    console.log(`Categories: ${Object.keys(CATEGORIES).join(', ')}\n`);
  } else if (cmd === 'publish') {
    const file = rest[0];
    if (!file || !existsSync(file)) {
      console.error('Usage: pr-review-analysis.mjs publish <file.jsonl>');
      process.exit(2);
    }
    const rows = (await readFile(file, 'utf8'))
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l));

    const unclassified = rows.filter((r) => !r.category || !r.whyMissed);
    if (unclassified.length) {
      console.error(
        `\n${unclassified.length} of ${rows.length} row(s) have no category or whyMissed.\n` +
          'Publishing them would put blanks in the column the page exists for. Classify first:\n' +
          unclassified.slice(0, 5).map((r) => `  #${r.pr} ${r.file}:${r.line}`).join('\n') +
          '\n',
      );
      process.exit(1);
    }
    const bad = rows.filter((r) => !CATEGORIES[r.category]);
    if (bad.length) {
      console.error(`\nUnknown category on ${bad.length} row(s): ${[...new Set(bad.map((b) => b.category))].join(', ')}`);
      console.error(`Valid: ${Object.keys(CATEGORIES).join(', ')}\n`);
      process.exit(1);
    }

    const email = readIf(`${homedir()}/.jira_email`);
    const token = readIf(`${homedir()}/.jira_token`);
    if (!email || !token) {
      console.error('\n~/.jira_email and ~/.jira_token are required to publish.\n');
      process.exit(1);
    }
    const auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;

    const get = await fetch(`${CONFLUENCE}/api/v2/pages/${PAGE_ID}?body-format=storage`, {
      headers: { Authorization: auth, Accept: 'application/json' },
    });
    if (!get.ok) {
      console.error(`Could not read the analysis page (HTTP ${get.status}).`);
      process.exit(1);
    }
    const page = await get.json();
    const storage = page.body?.storage?.value ?? '';

    const heading = storage.indexOf('<h2>Findings</h2>');
    const close = heading === -1 ? -1 : storage.indexOf('</tbody>', heading);
    if (close === -1) {
      console.error('\nNo <h2>Findings</h2> heading with a table below it. Re-seed the page.\n');
      process.exit(1);
    }

    const esc = (v) =>
      String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
    const cell = (v) => `<td><p>${esc(v)}</p></td>`;
    const body = rows
      .map(
        (r) =>
          '<tr>' +
          cell(`#${r.pr}`) +
          `<td><p><a href="${esc(r.url)}">${esc(r.file)}</a></p></td>` +
          cell(r.finding) +
          cell(r.category) +
          cell(r.whyMissed) +
          '</tr>',
      )
      .join('\n');

    const put = await fetch(`${CONFLUENCE}/api/v2/pages/${PAGE_ID}`, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: PAGE_ID,
        status: 'current',
        title: page.title,
        body: { representation: 'storage', value: `${storage.slice(0, close)}${body}\n${storage.slice(close)}` },
        version: { number: page.version.number + 1, message: `pr-review-analysis: ${rows.length} finding(s)` },
      }),
    });
    if (!put.ok) {
      console.error(`Publish failed (HTTP ${put.status}): ${(await put.text()).slice(0, 300)}`);
      process.exit(1);
    }
    console.log(`Published ${rows.length} finding(s) to ${CONFLUENCE}/pages/${PAGE_ID}`);
  } else {
    console.error('Usage: pr-review-analysis.mjs harvest <pr> … | publish <file.jsonl>');
    process.exit(2);
  }
}

function readIf(f) {
  try {
    return readFileSync(f, 'utf8').trim();
  } catch {
    return null;
  }
}
