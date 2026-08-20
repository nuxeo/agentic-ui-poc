#!/usr/bin/env node
/**
 * Seeds a Nuxeo instance with the handful of documents the scripted demo needs,
 * and clears what a rehearsal leaves behind.
 *
 * Scripted demo mode runs its Nuxeo tools for real (see `src/demo/demo-tools.ts`),
 * which is the honest way to demo but means an empty repository produces an honest
 * and completely undemonstrable "the search came back empty". This creates four
 * plausible business documents in one workspace so the tool cards and the citation
 * strip have something recognisable in them.
 *
 * Each document gets a real PDF attachment. Without one the app falls back to
 * Nuxeo's own `@preview` URL, which in dev is an absolute `http://localhost:8090/…`
 * that misses the Angular proxy and therefore the Basic credential — so the View
 * tab renders Nuxeo's "HTTP Status 401 — Unauthorized" page. Clicking a citation
 * lands exactly there, which is the last thing wanted in front of an audience.
 *
 * Usage:
 *
 *   NUXEO_BASE_URL=http://localhost:8090 \
 *   NUXEO_SEED_USER=Administrator NUXEO_SEED_PASSWORD=Administrator \
 *     node apps/agent-gateway/tools/seed-demo-content.mjs [--reset]
 *
 * `--reset` first removes the seeded workspace and any collection a previous
 * approval beat created, so a rehearsal starts from the same state the audience
 * will see. Credentials are required and have no defaults: this writes to a
 * repository, and `AGENTS/07-security.md` does not allow guessing at who is doing
 * the writing. They are only ever sent to `NUXEO_BASE_URL`.
 */

const out = (line) => process.stdout.write(`${line}\n`);

const DOCUMENTS = [
  {
    name: 'dpa-northwind',
    title: 'Data processing addendum - Northwind',
    description: 'GDPR data processing addendum agreed with Northwind Ltd.',
  },
  {
    name: 'q3-revenue-review',
    title: 'Q3 revenue review',
    description: 'Board pack for the Q3 revenue review meeting.',
  },
  {
    name: 'retention-policy',
    title: 'Records retention policy 2026',
    description: 'Retention periods by document class, effective January 2026.',
  },
  {
    name: 'vendor-onboarding',
    title: 'Vendor onboarding checklist',
    description: 'Steps and approvals required before a new vendor is activated.',
  },
];

/** Starred so the Favorites page has something in it. */
const FAVOURITE = 'retention-policy';

const WORKSPACES = '/default-domain/workspaces';
const WORKSPACE_NAME = 'beta-demo';
const WORKSPACE_PATH = `${WORKSPACES}/${WORKSPACE_NAME}`;

/** Collections named by the approval beat, which it genuinely creates each time. */
const AGENT_COLLECTION_QUERY =
  "SELECT * FROM Collection WHERE dc:title LIKE 'Agent demo%' AND ecm:isTrashed = 0";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required and has no default.`);
  }
  return value;
}

/** Read lazily so a missing variable is reported as a sentence, not a stack trace. */
let baseUrl = '';
let authorization = '';

function readEnvironment() {
  baseUrl = requiredEnv('NUXEO_BASE_URL').replace(/\/+$/, '');
  if (new URL(baseUrl).pathname !== '/') {
    throw new Error(
      `NUXEO_BASE_URL must be the origin with no path, got "${baseUrl}". ` +
        `The /nuxeo context path is added by this script.`,
    );
  }
  authorization = `Basic ${Buffer.from(
    `${requiredEnv('NUXEO_SEED_USER')}:${requiredEnv('NUXEO_SEED_PASSWORD')}`,
  ).toString('base64')}`;
}

async function nuxeo(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { authorization, ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.text();
    // Tomcat answers an unauthenticated call with a full HTML error page, and Node's
    // fetch leaves `statusText` empty, so neither is worth printing. The status code
    // plus what to do about it is the whole useful content.
    const detail = body.trimStart().startsWith('<')
      ? response.status === 401
        ? 'Unauthorized — check NUXEO_SEED_USER and NUXEO_SEED_PASSWORD.'
        : 'Nuxeo returned an HTML error page; see its server log.'
      : body.slice(0, 300);
    throw new Error(`${init.method ?? 'GET'} ${path} → ${response.status}. ${detail}`);
  }
  return response;
}

async function json(path, init) {
  return (await nuxeo(path, init)).json();
}

async function automation(operation, body) {
  return json(`/nuxeo/api/v1/automation/${operation}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function exists(path) {
  const response = await fetch(`${baseUrl}/nuxeo/api/v1/path${path}`, {
    headers: { authorization },
  });
  return response.ok;
}

/**
 * A one-page PDF naming the document. Generated rather than committed because the
 * point is only that a real blob exists for the viewer to render — the content is
 * not what anyone is looking at.
 */
function onePagePdf(title) {
  const text = `BT /F1 13 Tf 24 72 Td (${title.replace(/[()\\]/g, '')}) Tj ET`;
  return Buffer.from(
    `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 380 120]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${text.length}>>stream
${text}
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R>>
`,
    'latin1',
  );
}

async function attachPdf(documentPath, title) {
  const { batchId } = await json('/nuxeo/api/v1/upload/', { method: 'POST' });
  await nuxeo(`/nuxeo/api/v1/upload/${batchId}/0`, {
    method: 'POST',
    headers: { 'x-file-name': `${title}.pdf`, 'content-type': 'application/pdf' },
    body: onePagePdf(title),
  });
  await automation('Document.Update', {
    input: documentPath,
    params: {
      properties: { 'file:content': { 'upload-batch': batchId, 'upload-fileId': '0' } },
    },
  });
}

async function reset() {
  if (await exists(WORKSPACE_PATH)) {
    await nuxeo(`/nuxeo/api/v1/path${WORKSPACE_PATH}`, { method: 'DELETE' });
    out(`removed ${WORKSPACE_PATH}`);
  }
  const { entries = [] } = await json(
    `/nuxeo/api/v1/search/lang/NXQL/execute?query=${encodeURIComponent(AGENT_COLLECTION_QUERY)}`,
  );
  for (const entry of entries) {
    await nuxeo(`/nuxeo/api/v1/id/${entry.uid}`, { method: 'DELETE' });
    out(`removed collection "${entry.title}"`);
  }
}

async function seed() {
  if (await exists(WORKSPACE_PATH)) {
    out(`${WORKSPACE_PATH} already exists`);
  } else {
    await automation('Document.Create', {
      input: WORKSPACES,
      params: {
        type: 'Workspace',
        name: WORKSPACE_NAME,
        properties: 'dc:title=Beta demo\ndc:description=Content for the scripted agent demo.',
      },
    });
    out(`created ${WORKSPACE_PATH}`);
  }

  for (const document of DOCUMENTS) {
    const path = `${WORKSPACE_PATH}/${document.name}`;
    if (await exists(path)) {
      out(`${document.title} already exists`);
      continue;
    }
    await automation('Document.Create', {
      input: WORKSPACE_PATH,
      params: {
        type: 'File',
        name: document.name,
        properties: `dc:title=${document.title}\ndc:description=${document.description}`,
      },
    });
    await attachPdf(path, document.title);
    out(`created ${document.title}`);
  }

  // The Favorites page is one of the three routes that used to say "Coming soon",
  // and an empty one demonstrates its empty state rather than the feature. Favourites
  // live under the user's own workspace, so this is per-user and harmless.
  await automation('Document.AddToFavorites', { input: `${WORKSPACE_PATH}/${FAVOURITE}` });
  out(`added ${FAVOURITE} to favorites`);
}

try {
  readEnvironment();
  const who = await json('/nuxeo/api/v1/me');
  out(`connected to ${baseUrl} as ${who.id ?? who.username ?? 'unknown'}`);
  if (process.argv.includes('--reset')) await reset();
  await seed();
  out('done');
} catch (cause) {
  process.exitCode = 1;
  console.error(`seed failed: ${cause instanceof Error ? cause.message : String(cause)}`);
}
