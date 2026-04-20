import { Page } from '@playwright/test';

const STORAGE_KEY = 'agentic_ui_nuxeo_session';

const ADMIN_SESSION = {
  kind: 'basic',
  username: 'Administrator',
  basic: btoa('Administrator:Administrator'),
  isAdministrator: true,
};

const ME_RESPONSE = {
  'entity-type': 'user',
  id: 'Administrator',
  isAdministrator: true,
  properties: {
    username: 'Administrator',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    isAdministrator: true,
  },
};

let docCounter = 0;

function mockNuxeoDocument(title: string, path: string): Record<string, unknown> {
  docCounter++;
  return {
    'entity-type': 'document',
    uid: `mock-uid-${docCounter}`,
    title,
    path,
    type: 'Note',
    lastModified: new Date().toISOString(),
    changeToken: `ct-${docCounter}`,
    properties: {
      'dc:title': title,
      'dc:description': title,
      'uid:changeToken': `ct-${docCounter}`,
    },
  };
}

/**
 * Seeds an admin session into localStorage and mocks API endpoints.
 *
 * Route order matters in Playwright — last registered wins. We register
 * the generic catch-all FIRST, then specific overrides AFTER so they
 * take priority.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session));
    },
    { key: STORAGE_KEY, session: ADMIN_SESSION },
  );

  // 1. NXQL search — for studio-config queries, synthesize docs from localStorage
  await page.route('**/nuxeo/api/v1/search/**', (route) => {
    // If it's a studio config NXQL query, we want to return docs built from localStorage
    // Let the browser evaluate localStorage and send the result
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        'entity-type': 'documents',
        entries: [],
        totalSize: 0,
        currentPageSize: 0,
        currentPageIndex: 0,
        numberOfPages: 0,
      }),
    });
  });

  // Pre-seed: inject a script that intercepts fetch for NXQL searches and returns
  // localStorage data as Nuxeo docs, so persistence tests work after reload.
  await page.addInitScript(() => {
    const origFetch = window.fetch;
    const CONFIG_MAP: Record<string, string> = {
      actions: 'nx-studio-actions',
      layouts: 'nx-studio-layouts',
      tabs: 'nx-studio-tabs',
      drawer: 'nx-studio-drawer',
      searches: 'nx-studio-searches',
      themes: 'nx-studio-themes',
      translations: 'nx-studio-translations',
      dashboard: 'nx-studio-dashboard',
    };

    window.fetch = function (...args: Parameters<typeof origFetch>) {
      const input = args[0];
      const urlStr = typeof input === 'string' ? input : (input as Request).url;

      if (
        urlStr.includes('/nuxeo/api/v1/search/lang/NXQL/execute') &&
        urlStr.includes('studio-configs')
      ) {
        for (const [type, lsKey] of Object.entries(CONFIG_MAP)) {
          if (urlStr.includes(`studio-configs/${type}`)) {
            const raw = localStorage.getItem(lsKey);
            if (raw) {
              try {
                const data = JSON.parse(raw);
                const items = Array.isArray(data) ? data : [data];
                const entries = items.map((item: unknown, i: number) => ({
                  'entity-type': 'document',
                  uid: `ls-${type}-${i}`,
                  title: `${type}-${i}`,
                  path: `/default-domain/studio-configs/${type}/${type}-${i}`,
                  type: 'Note',
                  lastModified: new Date().toISOString(),
                  changeToken: `ct-ls-${i}`,
                  properties: {
                    'dc:title': `${type}-${i}`,
                    'dc:description': `${type}-${i}`,
                    'dc:nature': type,
                    'note:note': JSON.stringify(item),
                    'note:mime_type': 'application/json',
                    'uid:changeToken': `ct-ls-${i}`,
                  },
                }));
                return Promise.resolve(
                  new Response(
                    JSON.stringify({
                      'entity-type': 'documents',
                      entries,
                      totalSize: entries.length,
                      currentPageSize: entries.length,
                      currentPageIndex: 0,
                      numberOfPages: 1,
                    }),
                    {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' },
                    },
                  ),
                );
              } catch {
                /* fallthrough to original */
              }
            }
          }
        }
      }

      return origFetch.apply(window, args);
    };
  });

  // 2. Studio config workspace check — pretend it exists
  await page.route('**/nuxeo/api/v1/path/default-domain/studio-configs**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockNuxeoDocument('studio-configs', '/default-domain/studio-configs')),
      });
    }
    // POST (create document) — return a fake created document
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockNuxeoDocument('created', '/default-domain/studio-configs/created')),
    });
  });

  // 3. Document CRUD operations (PUT/POST by id) — return success
  await page.route('**/nuxeo/api/v1/id/**', (route) => {
    const method = route.request().method();
    if (method === 'PUT') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mockNuxeoDocument('updated', '/default-domain/studio-configs/updated'),
        ),
      });
    }
    if (method === 'DELETE') {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockNuxeoDocument('doc', '/default-domain/doc')),
    });
  });

  // 4a. Browse tree: all /path endpoints (documents + @children)
  await page.route('**/nuxeo/api/v1/path**', (route) => {
    const url = route.request().url();

    // Skip studio-configs folder CRUD (handled by route 2)
    if (url.includes('/path/default-domain/studio-configs') && !url.includes('@children')) {
      return route.continue();
    }

    const isChildren = url.includes('@children');
    const ts = new Date().toISOString();

    if (isChildren) {
      // Root @children → Domain
      if (url.match(/\/path\/?@children/) || url.match(/\/path%2F?@children/)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            'entity-type': 'documents',
            entries: [
              {
                'entity-type': 'document',
                uid: 'domain-uid',
                title: 'Domain',
                path: '/default-domain',
                type: 'Domain',
                facets: ['Folderish'],
                lastModified: ts,
                properties: { 'dc:title': 'Domain' },
              },
            ],
            totalSize: 1,
            currentPageSize: 1,
            currentPageIndex: 0,
            numberOfPages: 1,
          }),
        });
      }

      // Domain @children → normal folders + studio-configs (with HiddenInNavigation)
      if (url.includes('/path/default-domain') && url.includes('@children')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            'entity-type': 'documents',
            entries: [
              {
                'entity-type': 'document',
                uid: 'ws-uid',
                title: 'Workspaces',
                path: '/default-domain/workspaces',
                type: 'WorkspaceRoot',
                facets: ['Folderish'],
                lastModified: ts,
                properties: { 'dc:title': 'Workspaces' },
              },
              {
                'entity-type': 'document',
                uid: 'sec-uid',
                title: 'Sections',
                path: '/default-domain/sections',
                type: 'SectionRoot',
                facets: ['Folderish'],
                lastModified: ts,
                properties: { 'dc:title': 'Sections' },
              },
              {
                'entity-type': 'document',
                uid: 'tpl-uid',
                title: 'Templates',
                path: '/default-domain/templates',
                type: 'TemplateRoot',
                facets: ['Folderish'],
                lastModified: ts,
                properties: { 'dc:title': 'Templates' },
              },
              {
                'entity-type': 'document',
                uid: 'sc-uid',
                title: 'studio-configs',
                path: '/default-domain/studio-configs',
                type: 'Folder',
                facets: ['Folderish', 'HiddenInNavigation'],
                lastModified: ts,
                properties: { 'dc:title': 'studio-configs' },
              },
            ],
            totalSize: 4,
            currentPageSize: 4,
            currentPageIndex: 0,
            numberOfPages: 1,
          }),
        });
      }

      // Other @children → empty
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'entity-type': 'documents',
          entries: [],
          totalSize: 0,
          currentPageSize: 0,
          currentPageIndex: 0,
          numberOfPages: 0,
        }),
      });
    }

    // GET /path/ or /path → root document
    if (url.match(/\/path\/?(\?|$)/)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'entity-type': 'document',
          uid: 'root-uid',
          title: 'Root',
          path: '/',
          type: 'Root',
          facets: ['Folderish'],
          lastModified: ts,
          properties: { 'dc:title': 'Root' },
        }),
      });
    }

    // GET /path/default-domain → domain document
    if (url.includes('/path/default-domain') && !url.includes('/studio-configs')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'entity-type': 'document',
          uid: 'domain-uid',
          title: 'Domain',
          path: '/default-domain',
          type: 'Domain',
          facets: ['Folderish'],
          lastModified: ts,
          properties: { 'dc:title': 'Domain' },
        }),
      });
    }

    // Fallback: generic document
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        'entity-type': 'document',
        uid: 'generic-uid',
        title: 'Unknown',
        path: '/',
        type: 'Folder',
        facets: ['Folderish'],
        lastModified: ts,
        properties: { 'dc:title': 'Unknown' },
      }),
    });
  });

  // 4b. Generic catch-all for remaining API calls
  await page.route('**/nuxeo/api/v1/**', (route) => {
    const url = route.request().url();
    if (url.includes('/search/') || url.includes('/path/') || url.includes('/id/')) {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ entries: [] }),
    });
  });

  // 5. /me endpoint
  await page.route('**/nuxeo/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ME_RESPONSE),
    }),
  );

  // 6. Config/types → return realistic platform types (including Studio-created types)
  await page.route('**/nuxeo/api/v1/config/types', (route) => {
    const url = route.request().url();
    // Only handle the exact /config/types endpoint, not /config/types/{name}
    if (url.endsWith('/config/types') || url.endsWith('/config/types/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          doctypes: {
            Document: { parent: null, schemas: [{ name: 'dublincore' }], facets: [] },
            File: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'file' }],
              facets: ['Downloadable', 'Versionable'],
            },
            Note: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'note' }],
              facets: ['Versionable'],
            },
            Folder: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }],
              facets: ['Folderish'],
            },
            Workspace: {
              parent: 'Folder',
              schemas: [{ name: 'dublincore' }],
              facets: ['Folderish'],
            },
            Picture: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'file' }, { name: 'picture' }],
              facets: ['Picture', 'Versionable'],
            },
            Video: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'file' }, { name: 'video' }],
              facets: ['Video', 'Versionable'],
            },
            Audio: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'file' }],
              facets: ['Audio', 'Versionable'],
            },
            Collection: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'collection' }],
              facets: ['Collection'],
            },
            Section: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }],
              facets: ['Folderish'],
            },
            Domain: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'domain' }],
              facets: ['Folderish'],
            },
            OrderedFolder: {
              parent: 'Folder',
              schemas: [{ name: 'dublincore' }],
              facets: ['Folderish', 'Orderable'],
            },
            SampleTestDocu: {
              parent: 'Document',
              schemas: [{ name: 'dublincore' }, { name: 'sampletestdocu' }],
              facets: ['Versionable'],
            },
            Contract: {
              parent: 'File',
              schemas: [{ name: 'dublincore' }, { name: 'file' }, { name: 'contract' }],
              facets: ['Versionable'],
            },
          },
        }),
      });
    }
    return route.fulfill({ status: 404, body: 'Not Found' });
  });

  // 6b. Config/searchProviders → return realistic page providers
  await page.route('**/nuxeo/api/v1/config/searchProviders', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        default_search: {},
        nxql_search: {},
        advanced_document_content: {},
        default_document_suggestion: {},
        default_trash_search: {},
        simple_search: {},
        expired_search: {},
        all_collections: {},
      }),
    }),
  );

  // 6c. Config/types/{name} and other config sub-paths → 404 so fallback fields kick in
  await page.route('**/nuxeo/api/v1/config/types/**', (route) =>
    route.fulfill({ status: 404, body: 'Not Found' }),
  );

  await page.route('**/nuxeo/api/v1/config/schemas/**', (route) =>
    route.fulfill({ status: 404, body: 'Not Found' }),
  );

  // 7. Studio layout HTML — single handler with conditional logic
  const STUDIO_LAYOUT_HTML = `<dom-module id="nuxeo-sampletestdocu-view-layout"><template><nuxeo-card heading="General"><nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title"></nuxeo-input><nuxeo-textarea role="widget" value="{{document.properties.dc:description}}" label="Description"></nuxeo-textarea><nuxeo-date-picker role="widget" value="{{document.properties.dc:created}}" label="Created"></nuxeo-date-picker></nuxeo-card><nuxeo-card heading="Custom Fields"><nuxeo-input role="widget" value="{{document.properties.sampletestdocu:field1}}" label="Custom Field 1"></nuxeo-input><nuxeo-directory-suggestion role="widget" value="{{document.properties.sampletestdocu:category}}" label="Category" directory-name="nature"></nuxeo-directory-suggestion></nuxeo-card></template></dom-module>`;

  await page.route('**/nuxeo/ui/document/**', (route) => {
    const url = route.request().url();
    if (url.includes('sampletestdocu') && url.includes('view-layout')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: STUDIO_LAYOUT_HTML,
      });
    }
    return route.fulfill({ status: 404, body: 'Not Found' });
  });

  // 8. Studio site API → 404
  await page.route('**/nuxeo/site/api/**', (route) =>
    route.fulfill({ status: 404, body: 'Not Found' }),
  );
}

const DESIGNER_STORAGE_KEYS = [
  'nx-studio-actions',
  'nx-studio-layouts',
  'nx-studio-tabs',
  'nx-studio-drawer',
  'nx-studio-search',
  'nx-studio-searches',
  'nx-studio-theme',
  'nx-studio-translations',
  'nx-studio-dashboard',
  'nx-studio-themes',
];

/**
 * Clears all localStorage keys used by the Studio Designer
 * so each test starts fresh. Uses a sessionStorage flag so the
 * clear only happens on the FIRST page load — subsequent reloads
 * within the same test won't re-clear (needed for persistence tests).
 */
export async function clearDesignerStorage(page: Page): Promise<void> {
  await page.addInitScript((keys: string[]) => {
    const flag = '__nx-studio-clear-done';
    if (!sessionStorage.getItem(flag)) {
      for (const key of keys) {
        localStorage.removeItem(key);
      }
      sessionStorage.setItem(flag, '1');
    }
  }, DESIGNER_STORAGE_KEYS);
}

/**
 * Navigate to a specific Studio Designer page via the sidebar.
 */
export async function navigateToDesignerPage(
  page: Page,
  pageName:
    | 'Layouts'
    | 'Buttons'
    | 'Tabs'
    | 'Drawer'
    | 'Page Providers'
    | 'Themes'
    | 'Translations'
    | 'Dashboard',
): Promise<void> {
  await page.goto('/#/studio-designer');
  await page.waitForSelector('.studio-sidebar');
  await page.locator('.studio-sidebar a span[matlistitemtitle]', { hasText: pageName }).click();
  await page.waitForTimeout(500);
}
