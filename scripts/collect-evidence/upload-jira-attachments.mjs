#!/usr/bin/env node
/**
 * Attach fix evidence binaries to Jira (MCP has no attachment API).
 * Credentials: ~/.jira_email and ~/.jira_token (never commit).
 *
 * Usage:
 *   node scripts/collect-evidence/upload-jira-attachments.mjs NXENG-781 [NXENG-786 …]
 *
 * Uploads after-phase webm + focus-ring PNGs from ~/Desktop/agentic-ui-evidence/<TICKET>/fix/after/
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { evidenceDirForTicket } from './evidence-path.mjs';

const JIRA_BASE = 'https://hyland.atlassian.net';

const tickets = process.argv.slice(2);
if (tickets.length === 0) {
  console.error('Usage: node upload-jira-attachments.mjs <TICKET> [TICKET…]');
  process.exit(2);
}

const emailPath = join(homedir(), '.jira_email');
const tokenPath = join(homedir(), '.jira_token');
if (!existsSync(emailPath) || !existsSync(tokenPath)) {
  console.error('Missing ~/.jira_email or ~/.jira_token');
  process.exit(2);
}
const auth = Buffer.from(
  `${readFileSync(emailPath, 'utf8').trim()}:${readFileSync(tokenPath, 'utf8').trim()}`,
).toString('base64');

/** @param {string} ticket @param {string} filePath @param {string} filename */
async function upload(ticket, filePath, filename) {
  const form = new FormData();
  form.append('file', new Blob([readFileSync(filePath)]), filename);
  const res = await fetch(`${JIRA_BASE}/rest/api/3/issue/${ticket}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'X-Atlassian-Token': 'no-check',
    },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${ticket} ${filename}: HTTP ${res.status} ${body.slice(0, 200)}`);
  }
  console.log(`  ok   ${filename}`);
}

for (const ticket of tickets) {
  const afterDir = join(evidenceDirForTicket(ticket), 'fix', 'after');
  if (!existsSync(afterDir)) {
    console.error(`Skip ${ticket}: no ${afterDir}`);
    continue;
  }
  console.log(`\n${ticket}`);
  const webm = join(afterDir, `${ticket}-after.webm`);
  if (existsSync(webm)) {
    await upload(ticket, webm, `${ticket}-after.webm`);
  }
  const pngs = readdirSync(afterDir)
    .filter((f) => f.endsWith('.png') && /^0[23]-/.test(f))
    .sort();
  for (const f of pngs) {
    const slug = f.replace(/^\d+-/, '').replace(/\.png$/, '');
    await upload(ticket, join(afterDir, f), `${ticket}-after-${slug}.png`);
  }
}
