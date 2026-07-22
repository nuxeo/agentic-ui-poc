/**
 * Profile + auth refresh verification against Web UI permission filtering reference.
 *
 * Run (requires nx serve nuxeo-ui :4200 and Nuxeo :8080):
 *   node apps/nuxeo-ui/e2e/profile-auth-verification.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.AGENTIC_UI_BASE_URL ?? 'http://localhost:4200';
const NUXEO = process.env.NUXEO_BASE_URL ?? 'http://localhost:8080/nuxeo';

const USERS = [
  { username: 'Administrator', password: 'Administrator' },
  { username: 'poweruser01', password: 'poweruser01' },
  { username: 'user-readonly01', password: 'user-readonly01' },
];

const results = [];

function log(user, area, status, detail = '') {
  const line = `[${status}] ${user} / ${area}${detail ? ` — ${detail}` : ''}`;
  console.log(line);
  results.push({ user, area, status, detail });
}

function basicAuth(user, pass) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

async function nuxeoJson(pathname, user, pass, init = {}) {
  const res = await fetch(`${NUXEO}${pathname}`, {
    ...init,
    headers: {
      Authorization: basicAuth(user, pass),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${pathname} → ${res.status}: ${text.slice(0, 180)}`);
  }
  return text ? JSON.parse(text) : null;
}

function formatTimeFrame(begin, end) {
  if (!begin && !end) return 'Permanent';
  if (begin && end) return `${begin} – ${end}`;
  return begin ?? end ?? 'Permanent';
}

function matchesPrincipal(aceUsername, logicalPrincipal) {
  if (aceUsername === logicalPrincipal) return true;
  if (aceUsername === `user:${logicalPrincipal}`) return true;
  if (aceUsername === `group:${logicalPrincipal}`) return true;
  return aceUsername.replace(/^(user:|group:)/, '') === logicalPrincipal;
}

/** Web UI reference: local ACL only, skip inherited, direct principal match. */
function extractWebUiRows(doc, principal) {
  const rows = [];
  for (const acl of doc.contextParameters?.acls ?? []) {
    if (acl.name === 'inherited') continue;
    if (acl.name !== 'local') continue;
    for (const ace of acl.aces ?? []) {
      if (!ace.granted) continue;
      if (ace.status === 'archived') continue;
      if (!matchesPrincipal(ace.username, principal)) continue;
      rows.push({
        path: doc.path,
        title: doc.title,
        right: ace.permission,
        timeFrame: formatTimeFrame(ace.begin, ace.end),
      });
    }
  }
  return rows;
}

/** Current Satori SettingsService filtering (local ACL only). */
function extractSatoriRows(doc, principal) {
  const rows = [];
  const localAcl = (doc.contextParameters?.acls ?? []).find((acl) => acl.name === 'local');
  if (!localAcl?.aces?.length) return rows;
  const title = doc.title || doc.uid;
  const on = doc.path ? `${title} (${doc.path})` : title;
  for (const ace of localAcl.aces) {
    if (!ace.granted) continue;
    if (ace.status === 'archived') continue;
    if (!matchesPrincipal(ace.username, principal)) continue;
    rows.push({
      path: doc.path,
      title: doc.title,
      right: ace.permission,
      timeFrame: formatTimeFrame(ace.begin, ace.end),
    });
  }
  return rows;
}

async function queryPermissions(user, pass, principal, extractFn) {
  const safePrincipal = principal.replace(/'/g, "''");
  const nxql =
    `SELECT * FROM Document WHERE ecm:mixinType != "HiddenInNavigation" ` +
    `AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ` +
    `AND ecm:acl/*1/principal = '${safePrincipal}'`;

  const res = await nuxeoJson(
    '/api/v1/automation/Repository.Query',
    user,
    pass,
    {
      method: 'POST',
      body: JSON.stringify({
        params: { query: nxql, page: 0, pageSize: 25 },
        context: {},
      }),
      headers: {
        'X-NXContext-Category': 'acls',
        'X-NXRepository': 'default',
        'enrichers-document': 'acls',
        properties: '*',
      },
    },
  );

  const rows = [];
  for (const doc of res.entries ?? []) {
    rows.push(...extractFn(doc, principal));
  }
  return rows;
}

function rowKey(row) {
  return `${row.path}|${row.right}|${row.timeFrame}`;
}

async function comparePermissionsForUser(user, pass) {
  const me = await nuxeoJson('/api/v1/me', user, pass);
  const username = me.id ?? me.properties?.username;
  const groups = me.properties?.groups ?? [];

  const webUiLocal = await queryPermissions(user, pass, username, extractWebUiRows);
  const satoriLocal = await queryPermissions(user, pass, username, extractSatoriRows);

  const webUiGroupCounts = {};
  const satoriGroupCounts = {};
  for (const groupId of groups) {
    webUiGroupCounts[groupId] = (
      await queryPermissions(user, pass, groupId, extractWebUiRows)
    ).length;
    satoriGroupCounts[groupId] = (
      await queryPermissions(user, pass, groupId, extractSatoriRows)
    ).length;
  }

  const onlyInSatori = satoriLocal.filter(
    (row) => !webUiLocal.some((w) => rowKey(w) === rowKey(row)),
  );
  const onlyInWebUi = webUiLocal.filter(
    (row) => !satoriLocal.some((s) => rowKey(s) === rowKey(row)),
  );

  log(
    user,
    'permissions/local',
    webUiLocal.length === satoriLocal.length && onlyInSatori.length === 0 ? 'PASS' : 'WARN',
    `Web UI=${webUiLocal.length}, Satori=${satoriLocal.length}` +
      (onlyInSatori.length ? `, extra-in-Satori=${onlyInSatori.length}` : '') +
      (onlyInWebUi.length ? `, missing-in-Satori=${onlyInWebUi.length}` : ''),
  );

  for (const groupId of groups) {
    const match = webUiGroupCounts[groupId] === satoriGroupCounts[groupId];
    log(
      user,
      `permissions/${groupId}`,
      match ? 'PASS' : 'WARN',
      `Web UI=${webUiGroupCounts[groupId]}, Satori=${satoriGroupCounts[groupId]}`,
    );
  }

  return { username, groups, webUiLocal, satoriLocal, onlyInSatori };
}

async function login(page, username, password) {
  await page.goto(`${BASE}/#/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('input[autocomplete="username"]').fill(username);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL(/#\/(dashboard|browse|search)/, { timeout: 30_000 });
}

async function verifyBrowserAuth(user, pass) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await login(page, user, pass);

    const stored = await page.evaluate(() => {
      const raw =
        sessionStorage.getItem('agentic_ui_nuxeo_session') ??
        localStorage.getItem('agentic_ui_nuxeo_session');
      return raw ? JSON.parse(raw) : null;
    });

    if (stored?.username !== user) {
      log(user, 'auth/login-storage', 'FAIL', `stored=${stored?.username ?? 'null'}`);
    } else {
      log(user, 'auth/login-storage', 'PASS', `stored=${stored.username}`);
    }

    await page.goto(`${BASE}/#/settings/profile`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: user, level: 2 }).waitFor({ timeout: 15_000 });
    log(user, 'profile/username', 'PASS', 'Profile heading matches logged-in user');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    if (page.url().includes('#/login')) {
      log(user, 'auth/refresh', 'FAIL', 'Redirected to login after refresh');
    } else {
      await page.getByRole('heading', { name: user, level: 2 }).waitFor({ timeout: 15_000 });
      log(user, 'auth/refresh', 'PASS', 'Still authenticated after refresh');

      const storedAfter = await page.evaluate(() => {
        const raw =
          sessionStorage.getItem('agentic_ui_nuxeo_session') ??
          localStorage.getItem('agentic_ui_nuxeo_session');
        return raw ? JSON.parse(raw) : null;
      });
      if (storedAfter?.username !== user) {
        log(
          user,
          'auth/refresh-storage',
          'FAIL',
          `stored=${storedAfter?.username ?? 'null'}`,
        );
      } else {
        log(user, 'auth/refresh-storage', 'PASS', `stored=${storedAfter.username}`);
      }
    }

    const sectionTitles = await page.locator('.profile-card__section-title').allTextContents();
    const expectedSections = ['Groups', 'Local Permissions'];
    for (const title of expectedSections) {
      log(
        user,
        `profile/section/${title}`,
        sectionTitles.includes(title) ? 'PASS' : 'FAIL',
        sectionTitles.includes(title) ? 'present' : `missing; got ${sectionTitles.join(', ')}`,
      );
    }

    const hasAdminSection = sectionTitles.some((t) => t.includes('Administrator Permissions'));
    log(
      user,
      'profile/webui-parity',
      hasAdminSection ? 'FAIL' : 'PASS',
      hasAdminSection
        ? 'Unexpected Administrator Permissions section (Web UI profile does not have it)'
        : 'No extra admin section',
    );

    for (const groupId of stored?.groups ?? []) {
      const groupSection = `${groupId} permissions`;
      log(
        user,
        `profile/section/${groupId}`,
        sectionTitles.includes(groupSection) ? 'PASS' : 'WARN',
        sectionTitles.includes(groupSection) ? 'present' : 'missing group permissions card',
      );
    }
  } catch (error) {
    log(user, 'browser', 'FAIL', error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  console.log(`\nProfile + auth verification (${BASE})\n`);

  for (const { username, password } of USERS) {
    console.log(`\n=== ${username} ===`);

    try {
      await nuxeoJson('/api/v1/me', username, password);
      log(username, 'api/login', 'PASS', '/me OK');
    } catch (error) {
      log(username, 'api/login', 'SKIP', error.message);
      continue;
    }

    try {
      await comparePermissionsForUser(username, password);
    } catch (error) {
      log(username, 'permissions', 'FAIL', error.message);
    }

    await verifyBrowserAuth(username, password);
  }

  const failed = results.filter((r) => r.status === 'FAIL');
  const warned = results.filter((r) => r.status === 'WARN');

  console.log('\n--- Summary ---');
  console.log(`Total checks: ${results.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Warnings: ${warned.length}`);

  if (failed.length) {
    console.log('\nFailures:');
    for (const f of failed) {
      console.log(`  - ${f.user} / ${f.area}: ${f.detail}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\nVerification failed:', error);
  process.exit(1);
});
