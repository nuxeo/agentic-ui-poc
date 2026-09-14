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

import { appendFile, readFile, writeFile, mkdir } from 'node:fs/promises';
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
  'stale-prose':
    'Code changed; a comment, header, table or doc describing the old behaviour survived nearby',
  'unenforced-guarantee':
    'The prose promises something the code does not enforce, or allows a caller to contradict',
  'silent-failure':
    'An error path is swallowed — a bare `curl -s`, a `.catch(() => {})`, an exit 0 on failure',
  'proxy-check':
    'The check tests something adjacent to its name: connected for visible, a phase opened for a phase finished',
  ordering:
    'Right steps, wrong order — a guard after the side effect, a cleanup before the thing that needs it',
  'incomplete-fetch':
    'Only part of the data is read: unpaginated, first page only, one source of several',
  'broken-reference': 'A link, path or id that does not resolve',
  'false-claim': 'The PR body, changelog or docs assert something the diff does not do',
  'dead-branch': 'Code that cannot execute, or a condition that cannot fire',
  scope: 'Unrelated change bundled in, or a change the title does not mention',
  other: 'Does not fit above — if this grows, add a class',
};

const PAGE_ID = process.env['PR_ANALYSIS_PAGE_ID'] ?? '4301586839';
const CONFLUENCE = process.env['AGENT_METRICS_CONFLUENCE'] ?? 'https://hyland.atlassian.net/wiki';
const REPO = process.env['PR_ANALYSIS_REPO'] ?? 'nuxeo/agentic-ui-poc';
const OUT_DIR = resolve(EVIDENCE_ROOT, 'pr-review-analysis');

/**
 * The corpus, committed.
 *
 * It lives in the repository rather than the evidence folder because the pre-PR review skill
 * is built from it: its section ordering and every count it quotes are derived from these
 * rows. Evidence stays outside the repo, but something a skill's content depends on has to
 * travel with a clone — otherwise the skill states a snapshot nobody can re-derive, which is
 * the `stale-prose` defect the skill itself is about.
 */
const CORPUS = resolve(repoRoot(), 'docs/pr-review-findings.jsonl');
const SKILL = resolve(repoRoot(), '.cursor/skills/pre-pr-review/SKILL.md');
const MARK_START = '<!-- pr-review-stats:start -->';
const MARK_END = '<!-- pr-review-stats:end -->';

function repoRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..');
}

async function corpus() {
  if (!existsSync(CORPUS)) return [];
  return (await readFile(CORPUS, 'utf8'))
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

/** The distribution, and the block the skill embeds. Derived, never typed by hand. */
function renderStats(rows) {
  const counts = new Map();
  for (const r of rows) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const prs = [...new Set(rows.map((r) => r.pr))].sort((a, b) => a - b);
  const top3 = ordered.slice(0, 3).reduce((n, [, c]) => n + c, 0);

  return [
    MARK_START,
    `<!-- generated from docs/pr-review-findings.jsonl by \`npm run review:analysis -- sync\`. Do not edit by hand. -->`,
    '',
    `**${rows.length} findings** across ${prs.length} pull requests (${prs.map((p) => `#${p}`).join(', ')}),`,
    `every one accepted as valid. The three largest classes are **${top3} of ${rows.length}**.`,
    '',
    // Emit Prettier's padded table form. The generator and the formatter must agree on the
    // byte, or `check` goes red after every `prettier --write` and becomes noise people learn
    // to re-sync past without reading — a drift alarm that only ever cries wolf catches no drift.
    ...table([['Class', 'Findings'], ...ordered.map(([c, n]) => [`\`${c}\``, String(n)])]),
    '',
    MARK_END,
  ].join('\n');
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

/** The reviewer this page is about. Everything else on a PR is somebody's opinion, not a finding. */
const REVIEWER = /copilot/i;

/**
 * One page of a PR connection, paginated. `--paginate` advances `$endCursor`, and `gh` emits
 * one JSON document per page, so the result is one row per line rather than one array.
 */
function paginate(pr, connection, jq) {
  const [owner, name] = REPO.split('/');
  return gh([
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
        ${connection}
      }}}`,
    '--jq',
    `.data.repository.pullRequest as $pr | ${jq}`,
  ])
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

/**
 * The one line that identifies a finding in a table.
 *
 * Not simply line one of the body. A review summary body opens with a `###` verdict heading
 * and folds its detail into `<details>` blocks, so line one is "### Changes recommended",
 * which distinguishes nothing; a bot summary can open with an HTML comment marker. Headings,
 * quotes, rules and collapsed blocks are skipped and the first real prose line is used.
 *
 * The fallback is the whole body squashed, never the empty string: a row that describes its
 * finding badly can be read and fixed, and a row silently dropped for having an unusual body
 * cannot.
 */
function findingLine(body) {
  const stripped = String(body ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<details>[\s\S]*?<\/details>/g, '');
  for (const line of stripped.split('\n')) {
    const text = line.replace(/\s+/g, ' ').trim();
    if (!text || text.startsWith('#') || text.startsWith('>') || /^[-*_]{3,}$/.test(text)) continue;
    return text.slice(0, 220);
  }
  return String(body ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

/**
 * The findings Copilot folds into a review body's "Suppressed comments" block.
 *
 * These are real findings — three of the five on PR #182 were here, and all three were valid
 * defects — but they are prose inside the summary body rather than threads, so nothing that
 * reads `reviewThreads` can see them. The shape is a bolded `path:line` followed by bullets:
 *
 *     **scripts/pr-review-analysis.mjs:162**
 *     * Indexing a normal object does not reliably reject unknown classes…
 *
 * Parsing a bot's markdown is brittle by nature, so this is **additive and self-healing**: if
 * the shape changes and nothing matches, `harvestPr` records the body as a single row instead,
 * and the finding is under-described rather than silently absent.
 */
function suppressedFindings(body) {
  const found = [];
  const text = String(body ?? '');
  const block = /\*\*([^*\n]+?):(\d+)\*\*\s*\n((?:\s*[*-] .*\n?)+)/g;
  for (const match of text.matchAll(block)) {
    found.push({
      file: match[1].trim(),
      line: Number(match[2]),
      finding: findingLine(match[3].replace(/^\s*[*-] /m, '')),
    });
  }
  return found;
}

function row({ pr, prTitle, file, line, url, finding, resolved, source }) {
  return {
    pr: Number(pr),
    prTitle,
    file,
    line,
    url,
    // Enough to recognise the finding in a table; the URL has the rest.
    finding,
    resolved,
    source,
    category: '',
    whyMissed: '',
  };
}

/**
 * Every Copilot finding on a PR, resolved or not — a fixed one still happened.
 *
 * All three connections, because GitHub splits reviewer feedback across three and each is
 * actionable: inline `reviewThreads`, the `reviews` summary body (submitted as `COMMENTED`,
 * not `CHANGES_REQUESTED`, so it is easy to miss), and PR-level `comments`.
 */
export function harvestPr(pr) {
  const rows = [];
  const isReviewer = (login) => REVIEWER.test(login ?? '');

  for (const t of paginate(
    pr,
    `reviewThreads(first:50, after:$endCursor){
       pageInfo{ hasNextPage endCursor }
       nodes{ isResolved path line
         comments(first:1){ nodes{ author{ login } body url } } } }`,
    '$pr.reviewThreads.nodes[] | {title: $pr.title} + .',
  )) {
    const c = t.comments.nodes[0];
    if (!c || !isReviewer(c.author?.login)) continue;
    rows.push(
      row({
        pr,
        prTitle: t.title,
        file: t.path,
        line: t.line,
        url: c.url,
        finding: findingLine(c.body),
        resolved: t.isResolved,
        source: 'thread',
      }),
    );
  }

  for (const r of paginate(
    pr,
    `reviews(first:50, after:$endCursor){
       pageInfo{ hasNextPage endCursor }
       nodes{ author{ login } body url } }`,
    '$pr.reviews.nodes[] | select(.body != "") | {title: $pr.title} + .',
  )) {
    if (!isReviewer(r.author?.login)) continue;
    const suppressed = suppressedFindings(r.body);
    // The verdict restates the findings under it, so it only earns a row of its own when the
    // body carried none — otherwise one finding would be counted twice in the class totals.
    const items = suppressed.length
      ? suppressed
      : [{ file: '(review summary)', line: null, finding: findingLine(r.body) }];
    for (const item of items) {
      rows.push(
        row({ pr, prTitle: r.title, ...item, url: r.url, resolved: null, source: 'review-body' }),
      );
    }
  }

  for (const c of paginate(
    pr,
    `comments(first:50, after:$endCursor){
       pageInfo{ hasNextPage endCursor }
       nodes{ author{ login } body url } }`,
    '$pr.comments.nodes[] | {title: $pr.title} + .',
  )) {
    if (!isReviewer(c.author?.login)) continue;
    rows.push(
      row({
        pr,
        prTitle: c.title,
        file: '(conversation)',
        line: null,
        url: c.url,
        finding: findingLine(c.body),
        resolved: null,
        source: 'conversation',
      }),
    );
  }

  return rows;
}

if (isCli) {
  const [, , cmd, ...rest] = process.argv;

  if (cmd === 'harvest') {
    if (!rest.length) {
      console.error('Usage: pr-review-analysis.mjs harvest <pr> [<pr> …]');
      process.exit(2);
    }
    await mkdir(OUT_DIR, { recursive: true });
    const out = resolve(OUT_DIR, harvestFileName(rest));
    // One invocation, one file. The name used to be the UTC date, so a second harvest the same
    // day appended to a file that had already been classified and published, and the next
    // `publish` re-posted those rows to Confluence. A batch of PRs in one invocation still
    // shares one file, which is the point of accepting several; two invocations never do.
    if (existsSync(out)) {
      console.error(
        `\n${out} already exists. Refusing to append to a file that may be published.\n`,
      );
      process.exit(1);
    }
    let n = 0;
    const bySource = {};
    for (const pr of rest) {
      for (const entry of harvestPr(pr)) {
        await appendFile(out, `${JSON.stringify(entry)}\n`, 'utf8');
        bySource[entry.source] = (bySource[entry.source] ?? 0) + 1;
        n += 1;
      }
    }
    // Printed per source so a zero where feedback exists is visible rather than assumed away.
    const breakdown = Object.entries(bySource)
      .map(([source, count]) => `${count} ${source}`)
      .join(', ');
    console.log(
      `\nHarvested ${n} Copilot finding(s) from PR(s) ${rest.join(', ')}${breakdown ? ` — ${breakdown}` : ''}`,
    );
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

    // `.trim()`, not truthiness: `"   "` is truthy, so a row whose classification is spaces
    // used to pass this check and publish as a visibly blank cell — exactly what the check
    // below says it refuses to do.
    const filled = (v) => typeof v === 'string' && v.trim().length > 0;
    const unclassified = rows.filter((r) => !filled(r.category) || !filled(r.whyMissed));
    if (unclassified.length) {
      console.error(
        `\n${unclassified.length} of ${rows.length} row(s) have no category or whyMissed.\n` +
          'Publishing them would put blanks in the column the page exists for. Classify first:\n' +
          unclassified
            .slice(0, 5)
            .map((r) => `  #${r.pr} ${r.file}:${r.line}`)
            .join('\n') +
          '\n',
      );
      process.exit(1);
    }
    // `Object.hasOwn`, not indexing: `CATEGORIES['toString']` is an inherited function and
    // therefore truthy, so `toString`, `constructor` and `valueOf` all passed as valid
    // classes. Only the vocabulary declared above is accepted.
    const bad = rows.filter((r) => !Object.hasOwn(CATEGORIES, r.category));
    if (bad.length) {
      console.error(
        `\nUnknown category on ${bad.length} row(s): ${[...new Set(bad.map((b) => b.category))].join(', ')}`,
      );
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
        body: {
          representation: 'storage',
          value: `${storage.slice(0, close)}${body}\n${storage.slice(close)}`,
        },
        version: {
          number: page.version.number + 1,
          message: `pr-review-analysis: ${rows.length} finding(s)`,
        },
      }),
    });
    if (!put.ok) {
      console.error(`Publish failed (HTTP ${put.status}): ${(await put.text()).slice(0, 300)}`);
      process.exit(1);
    }
    console.log(`Published ${rows.length} finding(s) to ${CONFLUENCE}/pages/${PAGE_ID}`);

    // Append to the committed corpus and re-derive the skill, in that order. Publishing to
    // Confluence alone would leave the repository's copy behind, and the skill quoting a
    // distribution that no longer matches what the page shows — the same drift that made these
    // numbers hand-typed in the first place. Deduplicate on the comment URL so re-publishing a
    // file does not double-count it.
    const known = new Set((await corpus()).map((r) => r.url));
    const fresh = rows.filter((r) => !known.has(r.url));
    if (fresh.length) {
      await appendFile(CORPUS, `${fresh.map((r) => JSON.stringify(r)).join('\n')}\n`, 'utf8');
      const all = await corpus();
      await writeFile(SKILL, replaceBlock(await readFile(SKILL, 'utf8'), renderStats(all)), 'utf8');
      console.log(
        `Corpus now ${all.length} finding(s); skill re-derived. Commit ` +
          'docs/pr-review-findings.jsonl and .cursor/skills/pre-pr-review/SKILL.md together.',
      );
    }
  } else if (cmd === 'stats') {
    const rows = await corpus();
    console.log(`\n${renderStats(rows).replace(/<!--.*?-->\n?/gs, '')}`);
  } else if (cmd === 'sync') {
    const rows = await corpus();
    const text = await readFile(SKILL, 'utf8');
    const next = replaceBlock(text, renderStats(rows));
    if (next === text) {
      console.log('skill is already in step with the corpus');
    } else {
      await writeFile(SKILL, next, 'utf8');
      console.log(`synced ${SKILL} from ${rows.length} finding(s)`);
    }
  } else if (cmd === 'check') {
    const rows = await corpus();
    const text = await readFile(SKILL, 'utf8');

    // The skill's three numbered sections are ordered by weight, and that ordering is an
    // assertion about the corpus, not a layout choice: the reader is told to spend their
    // attention top-down. Counts drifting is cosmetic; the order being wrong sends the review
    // at the wrong thing first. `proxy-check` leads `unenforced-guarantee` by three findings —
    // close enough that a single run could overturn it — so check the claim, not just the table.
    const counts = new Map();
    for (const r of rows) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([c]) => c);
    const written = [...text.matchAll(/^## [123]\. .*`([a-z-]+)`/gm)].map((m) => m[1]);
    if (written.join() !== top.join()) {
      console.error(
        `\nThe skill's numbered sections are ordered ${written.join(' → ') || '(none found)'},\n` +
          `but the corpus ranks them ${top.join(' → ')}. Re-order the sections, or re-check\n` +
          'the classification — the section order tells the reader what to look at first.\n',
      );
      process.exit(1);
    }

    if (replaceBlock(text, renderStats(rows)) !== text) {
      console.error(
        `\nThe pre-PR review skill disagrees with docs/pr-review-findings.jsonl (${rows.length} rows).\n` +
          'Run `npm run review:analysis -- sync`.\n',
      );
      process.exit(1);
    }
    console.log(`skill is in step with the corpus (${rows.length} finding(s))`);
  } else {
    console.error(
      'Usage: pr-review-analysis.mjs harvest <pr> … | publish <file> | stats | sync | check',
    );
    process.exit(2);
  }
}

/**
 * Escape a value for Confluence storage XHTML, in **text or an attribute**.
 *
 * `"` and `'` are here because one of these values is interpolated into
 * `<a href="…">`, and escaping only `&<>` left the quote that terminates the attribute
 * intact. A finding URL containing `#" onmouseover="…` closed `href` and opened an event
 * handler on a page other people read — CodeQL alert 37 on PR #182. Escaping the quotes in
 * the shared helper rather than at the one call site means the next attribute added to this
 * table is safe without anyone remembering why.
 */
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * A harvest file name that is unique per invocation: a UTC timestamp to the millisecond plus
 * the PRs it covers, e.g. `2026-09-14T13-45-00-123Z-pr182.jsonl`. Sorts chronologically, and
 * names its contents so a stale file is recognisable before it is published.
 */
export function harvestFileName(prs, now = new Date()) {
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const label = prs.length <= 3 ? `pr${prs.join('+')}` : `pr${prs[0]}+${prs.length - 1}more`;
  return `${stamp}-${label}.jsonl`;
}

/** A Markdown table padded the way Prettier pads one: columns to their widest cell. */
function table([header, ...body]) {
  const w = header.map((_, i) => Math.max(...[header, ...body].map((r) => r[i].length)));
  const row = (cells) => `| ${cells.map((c, i) => c.padEnd(w[i])).join(' | ')} |`;
  return [row(header), `| ${w.map((n) => '-'.repeat(n)).join(' | ')} |`, ...body.map(row)];
}

/** Swap the generated block, or append it if the skill has none yet. */
function replaceBlock(text, block) {
  const a = text.indexOf(MARK_START);
  const b = text.indexOf(MARK_END);
  if (a === -1 || b === -1) return `${text.trimEnd()}\n\n${block}\n`;
  return `${text.slice(0, a)}${block}${text.slice(b + MARK_END.length)}`;
}

function readIf(f) {
  try {
    return readFileSync(f, 'utf8').trim();
  } catch {
    return null;
  }
}
