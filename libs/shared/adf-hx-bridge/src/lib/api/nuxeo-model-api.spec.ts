import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MODEL_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { DocumentModelService } from '@alfresco/adf-hx-content-services/services';
import { firstValueFrom } from 'rxjs';

import { NuxeoModelApi } from './nuxeo-model-api';

/**
 * Payloads trimmed from the real local instance, keeping one example of every shape that
 * matters: a prefixed schema, an **unprefixed** one, a primitive, an array, a complex list, and
 * a doctype with both a parent and facets.
 */
const TYPES_CONFIG = {
  doctypes: {
    Document: { schemas: ['common', 'dublincore'] },
    File: {
      parent: 'Document',
      facets: ['Versionable', 'Downloadable'],
      schemas: ['common', 'file', 'dublincore', 'uid'],
    },
    Folder: { parent: 'Document', facets: ['Folderish'], schemas: ['common', 'dublincore'] },
  },
  // Present in the real payload and deliberately ignored: the flat shape here covers only the
  // schemas a doctype reaches, and `/config/schemas` is the superset.
  schemas: { dublincore: { '@prefix': 'dc', title: 'string' } },
};

const FACETS_CONFIG = [
  { name: 'Folderish' },
  { name: 'Versionable', schemas: [{ name: 'sysversionable' }] },
  { name: 'NXTag', schemas: [{ name: 'facetedTag', '@prefix': 'nxtag' }] },
];

const SCHEMAS_CONFIG = [
  {
    name: 'dublincore',
    '@prefix': 'dc',
    fields: {
      title: 'string',
      created: 'date',
      subjects: 'string[]',
      lastContributor: 'string',
    },
  },
  // `@prefix: ''` is the interesting case: Nuxeo addresses these by schema *name*.
  { name: 'file', '@prefix': '', fields: { content: 'blob' } },
  { name: 'uid', '@prefix': '', fields: { major_version: 'long', minor_version: 'long' } },
  {
    name: 'files',
    '@prefix': '',
    fields: { files: { type: 'complex[]', fields: { file: 'blob' } } },
  },
  {
    name: 'picture',
    '@prefix': 'picture',
    fields: {
      info: {
        type: 'complex',
        fields: { width: 'long', height: 'long', colorSpace: 'string' },
      },
    },
  },
  // Reachable only through a facet, so absent from `/config/types`' schema map.
  { name: 'facetedTag', '@prefix': 'nxtag', fields: { tags: { type: 'complex[]' } } },
];

describe('NuxeoModelApi', () => {
  let api: NuxeoModelApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoModelApi],
    });
    api = TestBed.inject(NuxeoModelApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /** Answers all three `/config/*` reads the port fans out to. */
  function flushConfig(): void {
    httpMock.expectOne((r) => r.url.endsWith('/config/types')).flush(TYPES_CONFIG);
    httpMock.expectOne((r) => r.url.endsWith('/config/facets')).flush(FACETS_CONFIG);
    httpMock.expectOne((r) => r.url.endsWith('/config/schemas')).flush(SCHEMAS_CONFIG);
  }

  it('reads all three /config endpoints, because no single one is complete', async () => {
    const pending = api.getModel();
    // `/config/types` alone omits every schema only a facet reaches, and lists a doctype's
    // facets by name with no way to know what they contribute.
    flushConfig();
    const model = (await pending).data;

    expect(Object.keys(model.primaryTypes ?? {})).toEqual(['Document', 'File', 'Folder']);
    expect(Object.keys(model.mixinTypes ?? {})).toEqual(['Folderish', 'Versionable', 'NXTag']);
    // Six from `/config/schemas`, not the one from `/config/types`.
    expect(Object.keys(model.schemas ?? {})).toHaveLength(6);
    expect(model.schemas?.['facetedTag']).toBeDefined();
  });

  it('keys schema fields by their PREFIXED name, which is what lookups require', async () => {
    const pending = api.getModel();
    flushConfig();
    const model = (await pending).data;

    // `DocumentModel.getSchemaByPrefix('dc_title')` splits on `_`, takes `dc`, and then
    // requires `Object.keys(fields)` to contain the WHOLE `dc_title`. Keyed by the bare
    // `title` it matches nothing and every field silently becomes FieldType.String.
    expect(model.schemas?.['dublincore']?.prefix).toBe('dc');
    expect(Object.keys(model.schemas?.['dublincore']?.fields ?? {})).toEqual([
      'dc_title',
      'dc_created',
      'dc_subjects',
      'dc_lastContributor',
    ]);
  });

  it('treats an empty @prefix as the schema name, not as no prefix', async () => {
    const pending = api.getModel();
    flushConfig();
    const model = (await pending).data;

    // Nuxeo reports `@prefix: ''` for these and then addresses them as `file:content` and
    // `uid:major_version`. Read literally, the keys would be `_content` and `_major_version`.
    expect(model.schemas?.['file']?.prefix).toBe('file');
    expect(Object.keys(model.schemas?.['file']?.fields ?? {})).toEqual(['file_content']);
    expect(Object.keys(model.schemas?.['uid']?.fields ?? {})).toEqual([
      'uid_major_version',
      'uid_minor_version',
    ]);
  });

  it('maps primitives by identity, because the two vocabularies coincide', async () => {
    const pending = api.getModel();
    flushConfig();
    const fields = (await pending).data.schemas?.['dublincore']?.fields ?? {};

    // adf-hx's FieldType values ARE Nuxeo's type strings, so any translation here would be a
    // chance to get it wrong rather than a necessity.
    expect(fields['dc_title']?.type).toBe('string');
    expect(fields['dc_created']?.type).toBe('date');
    expect(fields['dc_subjects']?.type).toBe('string[]');
    expect((await pending).data.schemas?.['file']?.fields?.['file_content']?.type).toBe('blob');
  });

  it('keeps complex[] distinct from complex, and leaves sub-fields unprefixed', async () => {
    const pending = api.getModel();
    flushConfig();
    const model = (await pending).data;

    // `files_files`, not `files`: the schema's `@prefix` is empty so its name becomes the
    // prefix, and the field is called `files` too. An easy one to get wrong — this assertion
    // was written as `fields['files']` first and failed.
    const files = model.schemas?.['files']?.fields?.['files_files'];
    // `getFieldType` reads `.type` BEFORE it looks at `.fields`, so dropping the type would
    // turn a list of blobs into a single complex value.
    expect(files?.type).toBe('complex[]');
    // Bare `file`, not `files_file`: `getComplexFieldDetails` and the dotted-path branch of
    // `getFieldDefinition` both look sub-fields up by their unprefixed name.
    expect(Object.keys(files?.fields ?? {})).toEqual(['file']);
    expect(files?.fields?.['file']?.type).toBe('blob');

    const info = model.schemas?.['picture']?.fields?.['picture_info'];
    expect(info?.type).toBe('complex');
    expect(Object.keys(info?.fields ?? {})).toEqual(['width', 'height', 'colorSpace']);
  });

  it('carries a doctype’s parent as extends and its facets as mixins', async () => {
    const pending = api.getModel();
    flushConfig();
    const model = (await pending).data;

    expect(model.primaryTypes?.['File']).toMatchObject({
      extends: 'Document',
      mixins: ['Versionable', 'Downloadable'],
    });
    expect(model.primaryTypes?.['File']?.schemas).toContain('dublincore');
    // No parent on the root doctype, and `extends: undefined` would make `hasMixin` recurse
    // into a lookup for the string "undefined".
    expect(model.primaryTypes?.['Document']?.extends).toBeUndefined();
  });

  it('leaves subtypes unset rather than synthesising it from the type hierarchy', async () => {
    const pending = api.getModel();
    flushConfig();
    const model = (await pending).data;

    // Nuxeo scopes creatable-child-types per document, through a document enricher, and
    // `/config/types` does not carry it. `parent` is the inheritance graph, which is a
    // different question. Upstream already degrades: `getSubtypes` falls back to
    // `getAllTypes()`.
    expect(model.primaryTypes?.['Folder']?.subtypes).toBeUndefined();
  });

  it('surfaces a config read failure instead of resolving with an empty model', async () => {
    const pending = api.getModel();
    // The assertion is registered BEFORE the flush on purpose. Attaching it afterwards leaves
    // the promise rejected with no handler for a tick, which Vitest reports as a run-level
    // unhandled error even though the test itself passes.
    const rejects = expect(pending).rejects.toBeDefined();
    httpMock
      .expectOne((r) => r.url.endsWith('/config/types'))
      .flush({}, { status: 500, statusText: 'Server Error' });
    // `forkJoin` unsubscribes the other two the moment one errors, so they are cancelled and
    // must not be flushed. `match` drains them from the queue so `verify()` stays meaningful.
    httpMock.match(() => true);
    // An empty model renders every property as an untyped string, which looks like a
    // formatting bug rather than a failed request.
    await rejects;
  });

  it('refuses every write side rather than accepting and discarding it', async () => {
    await expect(api.setModel()).rejects.toThrow('not writable over REST');
    await expect(api.patchModel()).rejects.toThrow('not writable over REST');
    await expect(api.setModelItemsForProject()).rejects.toThrow('not writable over REST');
  });

  it('refuses per-project reads rather than answering with the whole model', async () => {
    await expect(api.getModelItemsForProject()).rejects.toThrow('no per-project model');
  });
});

/**
 * The port against the upstream service that consumes it.
 *
 * This replaces a probe that asserted the opposite. While `MODEL` refused,
 * `DocumentModelService` — `providedIn: 'root'`, and calling `getModel()` eagerly from its
 * constructor — still *constructed*, because an `async` method that throws returns a rejected
 * promise rather than throwing. But it left an **unhandled promise rejection** in the console
 * from the moment anything injected it, and every property field failed at read.
 *
 * These two tests are the inverse: the model resolves, and nothing is left unhandled.
 */
describe('DocumentModelService over the real MODEL port', () => {
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoModelApi, { provide: MODEL_API_TOKEN, useExisting: NuxeoModelApi }],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('resolves a DocumentModel instead of rejecting', async () => {
    const service = TestBed.inject(DocumentModelService);
    const pending = firstValueFrom(service.getModel());
    httpMock.expectOne((r) => r.url.endsWith('/config/types')).flush(TYPES_CONFIG);
    httpMock.expectOne((r) => r.url.endsWith('/config/facets')).flush(FACETS_CONFIG);
    httpMock.expectOne((r) => r.url.endsWith('/config/schemas')).flush(SCHEMAS_CONFIG);

    const model = await pending;
    expect(model.documentModel.schemas?.['dublincore']?.prefix).toBe('dc');
  });

  it('resolves field types through the model, which is the whole point of the port', async () => {
    const service = TestBed.inject(DocumentModelService);
    const pending = firstValueFrom(service.getModel());
    httpMock.expectOne((r) => r.url.endsWith('/config/types')).flush(TYPES_CONFIG);
    httpMock.expectOne((r) => r.url.endsWith('/config/facets')).flush(FACETS_CONFIG);
    httpMock.expectOne((r) => r.url.endsWith('/config/schemas')).flush(SCHEMAS_CONFIG);
    const model = await pending;

    // End to end through upstream's own lookup, not our mapper: `dc_created` must come back as
    // a date so the property card renders a formatted date rather than a raw ISO string. This
    // is the assertion that fails if the field keys are not prefixed.
    expect(model.getFieldType('dc_created')).toBe('date');
    expect(model.getFieldType('dc_title')).toBe('string');
    expect(model.getFieldType('file_content')).toBe('blob');
    expect(model.getFieldType('files_files')).toBe('complex[]');

    // And the mixin lookup upstream uses to classify types, which walks `extends`.
    expect(model.getFolderishTypes()).toEqual([]);
    expect(model.getAllTypes()).toEqual(['Document', 'File', 'Folder']);
  });
});
