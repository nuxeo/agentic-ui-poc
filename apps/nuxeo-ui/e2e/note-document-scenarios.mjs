/**
 * NXSAT-174 — Note document type: live browser QA with video recording.
 *
 * Run (records video to Desktop/NXSAT-174/videos/):
 *   $env:NUXEO_TEST_USER="Administrator"
 *   $env:NUXEO_TEST_PASSWORD="Administrator"
 *   # optional: $env:NUXEO_CREATE_PARENT_PATH="/default-domain/workspaces/my-ws"
 *   node apps/nuxeo-ui/e2e/note-document-scenarios.mjs
 *
 * Requires: nx serve nuxeo-ui (:4200) and Nuxeo (:8080)
 */
import { chromium } from 'playwright';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';

const BASE = process.env.AGENTIC_UI_BASE_URL ?? 'http://localhost:4200';
const NUXEO = process.env.NUXEO_BASE_URL ?? 'http://localhost:8080/nuxeo';
const user = process.env.NUXEO_TEST_USER;
const pass = process.env.NUXEO_TEST_PASSWORD;
const SLOW_MO = Number(process.env.AGENTIC_UI_SLOW_MO ?? 500);
const OUT_DIR = path.join(homedir(), 'Desktop', 'NXSAT-174');
const VIDEO_DIR = path.join(OUT_DIR, 'videos');
const SHOT_DIR = path.join(OUT_DIR, 'screenshots');

if (!user || !pass) {
  console.error(
    'Set NUXEO_TEST_USER and NUXEO_TEST_PASSWORD environment variables before running this script.',
  );
  process.exit(1);
}

const results = [];
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

function log(step, status, detail = '') {
  const line = `[${status}] ${step}${detail ? ` — ${detail}` : ''}`;
  console.log(line);
  results.push({ step, status, detail });
}

async function shot(page, name) {
  await mkdir(SHOT_DIR, { recursive: true });
  const file = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function nuxeoFetch(pathname, init = {}) {
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const res = await fetch(`${NUXEO}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${pathname} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function resolveCreateParentPath() {
  const override = process.env.NUXEO_CREATE_PARENT_PATH;
  if (override) {
    const doc = await nuxeoFetch(`/api/v1/path${override}`);
    if (doc?.path) return doc.path;
    throw new Error(`NUXEO_CREATE_PARENT_PATH not found: ${override}`);
  }

  try {
    const doc = await nuxeoFetch('/api/v1/path/default-domain/workspaces');
    if (doc?.path) return doc.path;
  } catch {
    // fall through to first child workspace
  }

  const list = await nuxeoFetch('/api/v1/path/default-domain/workspaces/@children?pageSize=10');
  const entry = list.entries?.find((e) => e.type === 'Workspace') ?? list.entries?.[0];
  if (!entry?.path) throw new Error('Could not resolve a workspace folder for note creation');
  return entry.path;
}

async function login(page) {
  await page.goto(`${BASE}/#/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const username = page.locator('input[autocomplete="username"]');
  await username.waitFor({ state: 'visible', timeout: 60_000 });
  await username.fill(user);
  await page.getByRole('button', { name: 'Continue' }).click();
  const password = page.locator('input[autocomplete="current-password"]');
  await password.waitFor({ state: 'visible', timeout: 20_000 });
  await password.fill(pass);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL(/#\/(dashboard|browse|doc)/, { timeout: 60_000 });
}

async function waitForSnackbar(page, pattern, timeout = 20_000) {
  const snack = page.locator('.mat-mdc-snack-bar-container');
  await snack.waitFor({ timeout });
  const text = (await snack.textContent()) ?? '';
  if (!pattern.test(text)) {
    throw new Error(`Snackbar mismatch. Expected ${pattern}, got: ${text}`);
  }
  return text.trim();
}

async function dismissSnackbar(page) {
  const snack = page.locator('.mat-mdc-snack-bar-container');
  if (await snack.isVisible().catch(() => false)) {
    const action = snack.getByRole('button', { name: /OK|Dismiss|Close/i });
    if (await action.isVisible().catch(() => false)) {
      await action.click();
    }
    await snack.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
  }
}

async function openBrowseFolder(page, folderPath) {
  await page.goto(`${BASE}/#/browse${folderPath}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.waitForTimeout(1500);
}

async function openCreateNoteDialog(page) {
  const createBtn = page.getByRole('button', { name: /Create \/ Import/i });
  await createBtn.waitFor({ state: 'visible', timeout: 30_000 });
  await createBtn.click();
  const dialog = page.locator('mat-dialog-container');
  await dialog.waitFor({ state: 'visible', timeout: 15_000 });
  await dialog.locator('.doctype-tile').filter({ hasText: 'Note' }).waitFor({ timeout: 30_000 });
  await dialog.locator('.doctype-tile').filter({ hasText: 'Note' }).click();
  await dialog.getByText('New Note').waitFor({ timeout: 15_000 });
  return dialog;
}

async function selectNoteFormat(page, dialog, label) {
  await dialog.locator('mat-form-field').filter({ hasText: 'Format' }).locator('mat-select').click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

async function submitCreateNote(dialog) {
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();
}

async function expectOnNoteDetail(page, titlePart) {
  await page.waitForURL(/#\/doc\//, { timeout: 60_000 });
  await page.getByRole('tab', { name: 'View' }).waitFor({ state: 'visible', timeout: 30_000 });
  if (titlePart) {
    await page.getByText(titlePart, { exact: false }).first().waitFor({ timeout: 30_000 });
  }
}

async function expectFormatLabel(page, label) {
  const formatRow = page.locator('.prop-field').filter({ hasText: 'Format' });
  await formatRow.waitFor({ state: 'visible', timeout: 20_000 });
  const value = await formatRow.locator('.prop-value').textContent();
  if (!value?.includes(label)) {
    throw new Error(`Expected format "${label}", got "${value?.trim()}"`);
  }
}

async function expectToolbarEditVisible(page) {
  const edit = page.getByRole('button', { name: 'Edit', exact: true }).first();
  await edit.waitFor({ state: 'visible', timeout: 15_000 });
}

async function saveHtmlNote(page) {
  await page.locator('.note-footer').getByRole('button', { name: 'Save' }).click();
  await waitForSnackbar(page, /Note saved/i);
  await dismissSnackbar(page);
}

async function typeInQuill(page, text) {
  const editor = page.locator('.note-quill-editor .ql-editor');
  await editor.waitFor({ state: 'visible', timeout: 20_000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(text, { delay: 30 });
}

async function scenarioCreateHtmlNote(page, parentPath) {
  const step = '1. Create HTML note — auto-open, Quill editor, format label';
  const title = `NXSAT-174 HTML ${stamp}`;
  try {
    await openBrowseFolder(page, parentPath);
    await shot(page, '01-browse-folder');
    const dialog = await openCreateNoteDialog(page);
    await dialog.getByLabel('Title').fill(title);
    await selectNoteFormat(page, dialog, 'HTML');
    await shot(page, '02-create-html-dialog');
    await submitCreateNote(dialog);
    await expectOnNoteDetail(page, title);
    await page.locator('.note-quill-editor .ql-editor').waitFor({ timeout: 30_000 });
    await expectFormatLabel(page, 'HTML');
    await shot(page, '03-html-note-opened');
    log(step, 'PASS', title);
    return title;
  } catch (err) {
    await shot(page, '01-html-create-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioEditAndSaveHtml(page) {
  const step = '2. Edit HTML in Quill, save, Edit toolbar still visible';
  try {
    await typeInQuill(page, 'Hello from Quill — NXSAT-174 HTML test.');
    await shot(page, '04-quill-edited');
    await saveHtmlNote(page);
    await expectToolbarEditVisible(page);
    await shot(page, '05-after-html-save');
    log(step, 'PASS');
  } catch (err) {
    await shot(page, '04-html-edit-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioHtmlSourceToggle(page) {
  const step = '3. HTML source mode toggle — edit source, return to visual, save';
  try {
    await page.getByRole('button', { name: 'HTML source' }).click();
    const source = page.locator('textarea[aria-label="Note HTML source"]');
    await source.waitFor({ state: 'visible', timeout: 10_000 });
    await source.fill('<p><strong>Source mode</strong> content preserved.</p>');
    await shot(page, '06-html-source-mode');
    await page.getByRole('button', { name: 'Visual editor' }).click();
    const editor = page.locator('.note-quill-editor .ql-editor');
    await editor.waitFor({ state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(800);
    const visualText = await editor.textContent();
    if (!visualText?.includes('Source mode')) {
      throw new Error(`Visual editor lost source content: "${visualText}"`);
    }
    await shot(page, '07-back-to-visual');
    await saveHtmlNote(page);
    await expectToolbarEditVisible(page);
    log(step, 'PASS');
  } catch (err) {
    await shot(page, '06-source-toggle-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioCreatePlainFormat(page, parentPath, formatLabel, content, shotPrefix) {
  const step = `Create ${formatLabel} note — format label + edit + save`;
  const title = `NXSAT-174 ${formatLabel} ${stamp}`;
  try {
    await openBrowseFolder(page, parentPath);
    const dialog = await openCreateNoteDialog(page);
    await dialog.getByLabel('Title').fill(title);
    await selectNoteFormat(page, dialog, formatLabel);
    await submitCreateNote(dialog);
    await expectOnNoteDetail(page, title);
    await expectFormatLabel(page, formatLabel);
    const editor = page.locator('textarea[aria-label="Note content"]');
    const editBtn = page.getByRole('button', { name: 'Edit note' });
    if (!(await editor.isVisible().catch(() => false))) {
      await editBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await editBtn.click();
    }
    await editor.waitFor({ state: 'visible', timeout: 15_000 });
    await editor.fill(content);
    await shot(page, `${shotPrefix}-${formatLabel.toLowerCase()}-editing`);
    await page.locator('.note-plain-actions').getByRole('button', { name: 'Save' }).click();
    await waitForSnackbar(page, /Note saved/i);
    await dismissSnackbar(page);
    await expectToolbarEditVisible(page);
    await shot(page, `${shotPrefix}-${formatLabel.toLowerCase()}-saved`);
    log(step, 'PASS', title);
  } catch (err) {
    await shot(page, `${shotPrefix}-${formatLabel.toLowerCase()}-FAIL`);
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function scenarioEditMetadata(page) {
  const step = '7. Edit document metadata dialog';
  try {
    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
    const dialog = page.locator('mat-dialog-container');
    await dialog.waitFor({ state: 'visible', timeout: 15_000 });
    const desc = dialog.getByLabel('Description');
    if (await desc.isVisible().catch(() => false)) {
      await desc.fill(`NXSAT-174 metadata update ${stamp}`);
    }
    await shot(page, '08-edit-metadata-dialog');
    await dialog.getByRole('button', { name: /Save|Update/i }).click();
    await waitForSnackbar(page, /updated/i);
    await dismissSnackbar(page);
    log(step, 'PASS');
  } catch (err) {
    await shot(page, '08-edit-metadata-FAIL');
    log(step, 'FAIL', err.message);
    throw err;
  }
}

async function finalizeVideo(page, context) {
  const video = page.video();
  await page.close();
  await context.close();
  if (!video) return null;
  const rawPath = await video.path();
  await mkdir(VIDEO_DIR, { recursive: true });
  const dest = path.join(VIDEO_DIR, `nxsat-174-note-scenarios-${stamp}.webm`);
  await copyFile(rawPath, dest);
  return dest;
}

async function writeReport(videoPath, parentPath) {
  const reportPath = path.join(OUT_DIR, `note-scenarios-report-${stamp}.json`);
  await writeFile(
    reportPath,
    JSON.stringify({ results, videoPath, parentPath, baseUrl: BASE, recordedAt: stamp }, null, 2),
  );
  console.log(`\nReport: ${reportPath}`);
  if (videoPath) console.log(`Video:  ${videoPath}`);
  console.log(`Shots:  ${SHOT_DIR}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });
  console.log('\nNXSAT-174 Note document scenarios — recording video\n');

  const parentPath = await resolveCreateParentPath();
  console.log(`Create parent: ${parentPath}\n`);

  const browser = await chromium.launch({ headless: true, slowMo: SLOW_MO });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  try {
    await login(page);
    log('Login', 'PASS');

    await scenarioCreateHtmlNote(page, parentPath);
    await scenarioEditAndSaveHtml(page);
    await scenarioHtmlSourceToggle(page);
    await scenarioCreatePlainFormat(
      page,
      parentPath,
      'Text',
      'Plain text note body for NXSAT-174.',
      '09',
    );
    await scenarioCreatePlainFormat(
      page,
      parentPath,
      'Markdown',
      '# Markdown heading\n\nBullet item for NXSAT-174.',
      '10',
    );
    await scenarioCreatePlainFormat(
      page,
      parentPath,
      'XML',
      '<note><title>XML</title></note>',
      '11',
    );
    await scenarioEditMetadata(page);

    const failed = results.filter((r) => r.status === 'FAIL');
    const videoPath = await finalizeVideo(page, context);
    await browser.close();
    await writeReport(videoPath, parentPath);

    if (failed.length) {
      console.error(`\n${failed.length} scenario(s) failed.`);
      process.exit(1);
    }
    console.log('\nAll note document scenarios passed. Video saved.');
  } catch (error) {
    await shot(page, 'FAIL-final').catch(() => undefined);
    const videoPath = await finalizeVideo(page, context).catch(() => null);
    await browser.close().catch(() => undefined);
    await writeReport(videoPath, parentPath);
    console.error('\nRun aborted:', error.message);
    process.exit(1);
  }
}

main();
