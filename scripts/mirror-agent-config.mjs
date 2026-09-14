#!/usr/bin/env node
/**
 * Mirror the agent configuration in `.cursor/` into the other tools' directories.
 *
 *   node scripts/mirror-agent-config.mjs sync    # write the mirrors
 *   node scripts/mirror-agent-config.mjs check   # exit 1 if any mirror has drifted
 *   node scripts/mirror-agent-config.mjs check --verbose
 *
 * `.cursor/` is the single source. The mirrors are generated, byte for byte, and the `check`
 * command runs in the quality gate so a skill edited in one place and not the others cannot be
 * committed. Three copies of a playbook with nothing comparing them is the documented way this
 * repository grows a wrong half that nobody reads.
 *
 * Why copies and not symlinks: a directory symlink reads fine through an explicit path, but a
 * tree walk that does not follow symlinks — `find` without `-L`, a glob with `follow: false` —
 * descends into nothing and reports **zero** skills. Verified, not assumed. A discovery tool
 * that silently finds no skills is worse than a mirror that can drift, because drift is
 * detectable and this is not.
 */

import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = '.cursor';

/**
 * What is mirrored, and what is not.
 *
 * `plans/` is deliberately excluded: a point-in-time planning document is a work artifact, not
 * agent configuration, and copying it into every tool's directory would triple a file that
 * nothing reads. Add a subtree here if that changes — the gate will then hold it too.
 */
const SUBTREES = ['skills', 'agents', 'rules'];
const TARGETS = ['.claude', '.agent'];

const NOTICE = `# Generated — do not edit here

Everything in \`skills/\`, \`agents/\` and \`rules/\` in this directory is a **copy**. The source
is \`.cursor/\` at the repository root.

Edit the file under \`.cursor/\`, then run:

    npm run mirror:agents

The \`agent-mirror\` gate in \`npm run beta:gate\` fails when a mirror has drifted, so an edit
made only here will be caught before it is merged — but it will be caught by being *overwritten*,
because this directory is not a source. Nothing here is read back.

\`settings.json\` and \`settings.local.json\`, where present, are **not** mirrored: they are
machine-specific and partly gitignored.
`;

const cmd = process.argv[2];
const verbose = process.argv.includes('--verbose');

if (!['sync', 'check'].includes(cmd)) {
  console.error('Usage: mirror-agent-config.mjs sync | check [--verbose]');
  process.exit(2);
}

/** Every file under a subtree, relative to it, excluding anything git ignores. */
function filesUnder(root) {
  /** @type {string[]} */
  const out = [];
  if (!existsSync(root)) return out;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out.push(relative(root, full));
    }
  };
  walk(root);
  return out.sort();
}

/**
 * Drop git-ignored paths in one batch.
 *
 * Per-file `git check-ignore` calls cost a process each and the source tree is small but not
 * tiny; more importantly a single call cannot be half-applied, so the set either reflects
 * gitignore or the command failed loudly. `check-ignore` exits 1 when nothing matched, which
 * is a normal result and not an error.
 */
function notIgnored(paths, base) {
  if (!paths.length) return paths;
  let ignored = '';
  try {
    ignored = execFileSync('git', ['-C', REPO, 'check-ignore', '--stdin'], {
      input: paths.map((p) => join(base, p)).join('\n'),
      encoding: 'utf8',
    });
  } catch (e) {
    if (e.status !== 1) throw e; // 1 = nothing ignored
    ignored = e.stdout ?? '';
  }
  const set = new Set(
    ignored
      .split('\n')
      .filter(Boolean)
      .map((p) => relative(base, p)),
  );
  return paths.filter((p) => !set.has(p));
}

const isExec = (p) => (statSync(p).mode & 0o111) !== 0;

/** @type {{target:string,kind:string,path:string}[]} */
const drift = [];
let copied = 0;
let removed = 0;

for (const target of TARGETS) {
  for (const subtree of SUBTREES) {
    const srcRoot = resolve(REPO, SOURCE, subtree);
    const dstRoot = resolve(REPO, target, subtree);

    const want = notIgnored(filesUnder(srcRoot), join(SOURCE, subtree));
    const have = notIgnored(filesUnder(dstRoot), join(target, subtree));

    for (const rel of want) {
      const src = join(srcRoot, rel);
      const dst = join(dstRoot, rel);
      const missing = !existsSync(dst);
      const differs = !missing && !readFileSync(src).equals(readFileSync(dst));
      // The executable bit is part of the file. A mirrored `plan-batch.mjs` or
      // `new-ticket-workspace.sh` that arrives without +x is a script the documentation tells
      // you to run and you cannot, which is the mirror being subtly wrong rather than absent.
      const modeDiffers = !missing && !differs && isExec(src) !== isExec(dst);

      if (missing || differs || modeDiffers) {
        drift.push({
          target,
          kind: missing ? 'missing' : differs ? 'differs' : 'mode',
          path: join(subtree, rel),
        });
        if (cmd === 'sync') {
          mkdirSync(dirname(dst), { recursive: true });
          copyFileSync(src, dst);
          chmodSync(dst, isExec(src) ? 0o755 : 0o644);
          copied += 1;
        }
      }
    }

    // A file deleted from `.cursor/` has to disappear from the mirrors too, or a retired skill
    // keeps being offered by every tool except the one it was retired in.
    for (const rel of have) {
      if (want.includes(rel)) continue;
      drift.push({ target, kind: 'stray', path: join(subtree, rel) });
      if (cmd === 'sync') {
        rmSync(join(dstRoot, rel));
        removed += 1;
      }
    }
  }

  const noticePath = resolve(REPO, target, 'MIRROR.md');
  const noticeOk = existsSync(noticePath) && readFileSync(noticePath, 'utf8') === NOTICE;
  if (!noticeOk) {
    drift.push({ target, kind: existsSync(noticePath) ? 'differs' : 'missing', path: 'MIRROR.md' });
    if (cmd === 'sync') {
      mkdirSync(resolve(REPO, target), { recursive: true });
      writeFileSync(noticePath, NOTICE, 'utf8');
      copied += 1;
    }
  }
}

if (cmd === 'sync') {
  console.log(
    drift.length
      ? `agent-mirror: synced ${TARGETS.join(' and ')} — ${copied} written, ${removed} removed`
      : `agent-mirror: already in step (${TARGETS.join(', ')})`,
  );
  process.exit(0);
}

if (drift.length) {
  console.error(`\nagent-mirror: FAIL — ${drift.length} file(s) out of step with ${SOURCE}/\n`);
  const shown = verbose ? drift : drift.slice(0, 20);
  for (const d of shown) console.error(`  ${d.kind.padEnd(8)} ${d.target}/${d.path}`);
  if (shown.length < drift.length)
    console.error(`  … and ${drift.length - shown.length} more (--verbose)`);
  console.error('\nEdit the file under .cursor/, then run `npm run mirror:agents`.\n');
  process.exit(1);
}

const total = TARGETS.length * SUBTREES.length;
console.log(
  `agent-mirror: pass — ${TARGETS.join(' and ')} match ${SOURCE}/ across ${total} subtree(s)`,
);
