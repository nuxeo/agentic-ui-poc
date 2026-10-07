import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_BOOTSTRAP_CONFIG_URL } from '@nuxeo-satori/platform/app-config';
import { NUXEO_API_ORIGIN } from '@nuxeo-satori/platform/nuxeo-client';
import { firstValueFrom } from 'rxjs';

import { DocumentLayoutService, layoutFileUrl, layoutsIndexUrl } from './document-layout.service';
import { ResolvedLayout } from './layout.model';

const FORMAT = 'nuxeo-agentic-ui-config/1';
const INDEX = '/nuxeo/agentic-ui-config/layouts.json';
const CLAIM_FILE = '/nuxeo/agentic-ui-config/layouts/Claim/metadata.layout.json';
const CLAIM_TYPE = '/nuxeo/api/v1/config/types/Claim';

const CLAIM = {
  name: 'Claim',
  schemas: [
    { name: 'dublincore', '@prefix': 'dc', fields: { title: 'string' } },
    { name: 'claim', '@prefix': 'claim', fields: { number: 'string', status: 'string' } },
  ],
};

const index = (...keys: string[]) => ({
  format: FORMAT,
  layer: 'layouts',
  layouts: keys.map((key) => {
    const [type, mode] = key.split('/');
    return { type, mode, component: 'org.acme.config' };
  }),
  diagnostics: [],
});

const envelope = (content: unknown) => ({
  format: FORMAT,
  layer: 'layout',
  type: 'Claim',
  mode: 'metadata',
  content,
});

describe('layout URLs', () => {
  it('sit beside the bootstrap response', () => {
    expect(layoutsIndexUrl('/nuxeo/agentic-ui-config/bootstrap.json')).toBe(INDEX);
    expect(layoutsIndexUrl('/agentic-ui-config/bootstrap.json?v=1')).toBe(
      '/agentic-ui-config/layouts.json',
    );
    expect(layoutFileUrl('/nuxeo/agentic-ui-config/bootstrap.json', 'Claim', 'metadata')).toBe(
      CLAIM_FILE,
    );
  });
});

describe('DocumentLayoutService', () => {
  let http: HttpTestingController;
  let service: DocumentLayoutService;
  let intercepted: string[];
  let warnings: string[];

  beforeEach(() => {
    intercepted = [];
    warnings = [];
    vi.spyOn(console, 'warn').mockImplementation((message: unknown) =>
      warnings.push(String(message)),
    );
    const recorder: HttpInterceptorFn = (request, next) => {
      intercepted.push(request.url);
      return next(request);
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([recorder])),
        provideHttpClientTesting(),
        { provide: APP_BOOTSTRAP_CONFIG_URL, useValue: '/nuxeo/agentic-ui-config/bootstrap.json' },
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DocumentLayoutService);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  const resolve = (type = 'Claim'): Promise<ResolvedLayout | null> =>
    firstValueFrom(service.layoutFor(type, 'metadata'));

  const answerType = (body: object = CLAIM) => http.expectOne(CLAIM_TYPE).flush(body);

  it('generates the layout from the type when no package contributed one', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index());
    const resolved = await layout;
    expect(resolved?.source).toBe('generated');
    expect(
      resolved?.sections.map((section) => [section.id, section.fields.map((field) => field.xpath)]),
    ).toEqual([['claim', ['claim:number', 'claim:status']]]);
  });

  it('reads the type with fetch-schema: fields, through the interceptors', async () => {
    const layout = resolve();
    const request = http.expectOne(CLAIM_TYPE);
    expect(request.request.headers.get('fetch-schema')).toBe('fields');
    request.flush(CLAIM);
    http.expectOne(INDEX).flush(index());
    await layout;
    expect(intercepted).toContain(CLAIM_TYPE);
  });

  it('reads the layout index and file without the interceptors, which would add credentials', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Claim/metadata'));
    http
      .expectOne(CLAIM_FILE)
      .flush(envelope({ version: 1, sections: [{ id: 'a', fields: ['claim:status'] }] }));
    await layout;
    expect(intercepted).not.toContain(INDEX);
    expect(intercepted).not.toContain(CLAIM_FILE);
  });

  it('renders a contributed file instead of the generated layout', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Claim/metadata'));
    http
      .expectOne(CLAIM_FILE)
      .flush(
        envelope({ version: 1, sections: [{ id: 'a', fields: ['claim:status', 'dc:title'] }] }),
      );
    const resolved = await layout;
    expect(resolved?.source).toBe('contributed');
    expect(resolved?.sections.map((section) => section.fields.map((field) => field.xpath))).toEqual(
      [['claim:status', 'dc:title']],
    );
  });

  it('fetches only the file for the type and mode asked for', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Member/metadata', 'Claim/edit'));
    expect((await layout)?.source).toBe('generated');
    http.expectNone((request) => request.url.includes('/layouts/'));
  });

  it('reads the index, the file and the type once per session', async () => {
    const first = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Claim/metadata'));
    http.expectOne(CLAIM_FILE).flush(envelope({ version: 1, sections: [] }));
    await first;
    const second = await resolve();
    expect(second?.source).toBe('contributed');
    http.expectNone(INDEX);
    http.expectNone(CLAIM_FILE);
    http.expectNone(CLAIM_TYPE);
  });

  it('falls back to the generated layout when the index cannot be read, and says why', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush('', { status: 404, statusText: 'Not Found' });
    expect((await layout)?.source).toBe('generated');
    expect(warnings).toContain(`[agentic-ui-layouts] layouts not loaded from ${INDEX}: HTTP 404`);
  });

  it('ignores an index that is not the layouts envelope', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush({ layouts: [{ type: 'Claim', mode: 'metadata' }] });
    expect((await layout)?.source).toBe('generated');
    expect(warnings.some((warning) => warning.includes(`layouts from ${INDEX} ignored`))).toBe(
      true,
    );
  });

  it('refuses a file of another version and shows the generated layout', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Claim/metadata'));
    http.expectOne(CLAIM_FILE).flush(envelope({ version: 2, sections: [] }));
    expect((await layout)?.source).toBe('generated');
    expect(warnings).toContain(
      `[agentic-ui-layouts] Claim/metadata layout from ${CLAIM_FILE} refused, showing the generated layout: version must be 1, got 2`,
    );
  });

  it('ignores a file answered for another type', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Claim/metadata'));
    http.expectOne(CLAIM_FILE).flush({ ...envelope({ version: 1, sections: [] }), type: 'Member' });
    expect((await layout)?.source).toBe('generated');
    expect(
      warnings.some((warning) => warning.includes('ignored: expected the Claim/metadata layout')),
    ).toBe(true);
  });

  it('falls back when the file cannot be fetched', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Claim/metadata'));
    http.expectOne(CLAIM_FILE).flush('', { status: 500, statusText: 'Server Error' });
    expect((await layout)?.source).toBe('generated');
    expect(warnings).toContain(
      `[agentic-ui-layouts] Claim/metadata layout not loaded from ${CLAIM_FILE}: HTTP 500`,
    );
  });

  it('names each field it skipped because the type does not have it', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush(index('Claim/metadata'));
    http.expectOne(CLAIM_FILE).flush(
      envelope({
        version: 1,
        sections: [{ id: 'a', fields: ['claim:nope', 'not an xpath', 'claim:number'] }],
      }),
    );
    expect((await layout)?.sections[0]?.fields.map((field) => field.xpath)).toEqual([
      'claim:number',
    ]);
    expect(warnings).toContain(
      '[agentic-ui-layouts] Claim/metadata layout: field claim:nope is not on the Claim type; skipped',
    );
    expect(warnings).toContain(
      '[agentic-ui-layouts] Claim/metadata layout: section "a" field 2 is not "<prefix>:<name>"; skipped',
    );
  });

  it('logs what the server reported about the contributions it replaced or rejected', async () => {
    const layout = resolve();
    answerType();
    http.expectOne(INDEX).flush({
      ...index(),
      diagnostics: [
        { level: 'warning', code: 'kept', message: 'layout Claim/metadata from a stays in force.' },
      ],
    });
    await layout;
    expect(warnings).toContain(
      '[agentic-ui-layouts] server warning kept: layout Claim/metadata from a stays in force.',
    );
  });

  it('treats a 200 that is not a document type as a failed read: logged, and asked again', async () => {
    const first = resolve();
    http.expectOne(CLAIM_TYPE).flush({ unexpected: true });
    http.expectOne(INDEX).flush(index());
    expect(await first).toBeNull();
    expect(warnings).toContain(
      '[agentic-ui-layouts] schemas of Claim not read: the response is not a document type',
    );

    const second = resolve();
    answerType();
    expect((await second)?.source).toBe('generated');
  });

  it('answers null when the type cannot be read, and asks again for the next document', async () => {
    const first = resolve();
    http.expectOne(CLAIM_TYPE).flush('', { status: 403, statusText: 'Forbidden' });
    http.expectOne(INDEX).flush(index());
    expect(await first).toBeNull();
    expect(warnings).toContain('[agentic-ui-layouts] schemas of Claim not read: HTTP 403');

    const second = resolve();
    answerType();
    expect((await second)?.source).toBe('generated');
  });
});
