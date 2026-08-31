import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { AuditEntry, NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';

import { AdfHxBrowseFolderService } from './adf-hx-browse-folder.service';

function auditEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id: 1,
    category: 'eventDocumentCategory',
    principalName: 'jdoe',
    comment: '',
    docLifeCycle: 'project',
    docPath: '/default-domain/workspaces/ws/Invoice',
    docType: 'File',
    docUUID: 'doc-1',
    eventId: 'documentModified',
    repositoryId: 'default',
    eventDate: '2026-02-10T10:00:00.000Z',
    logDate: '2026-02-10T10:00:00.000Z',
    extended: {},
    ...overrides,
  };
}

function nuxeoDoc(overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'doc-1',
    title: 'Invoice',
    type: 'File',
    path: '/default-domain/workspaces/ws/Invoice',
    state: 'project',
    lastModified: '2026-02-01T00:00:00.000Z',
    properties: {},
    ...overrides,
  } as NuxeoDocument;
}

describe('AdfHxBrowseFolderService', () => {
  let service: AdfHxBrowseFolderService;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdfHxBrowseFolderService],
    });
    service = TestBed.inject(AdfHxBrowseFolderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('getAuditDirectoryLabels', () => {
    /**
     * Both vocabularies come from the same `Directory.SuggestEntries` endpoint, so the
     * requests are told apart by the `directoryName` in the body rather than by URL.
     */
    function flushDirectory(directoryName: string, entries: unknown[]) {
      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/automation/Directory.SuggestEntries') &&
          r.body?.params?.directoryName === directoryName,
      );
      req.flush(entries);
      return req;
    }

    const vocabEntry = (id: string, label: string, ordering = 10) => ({
      id,
      label,
      displayLabel: label,
      ordering,
      obsolete: 0,
      directoryName: 'eventTypes',
    });

    it('builds an id-to-label map for each of the two vocabularies', async () => {
      const pending = firstValueFrom(service.getAuditDirectoryLabels());
      flushDirectory('eventTypes', [
        vocabEntry('documentModified', 'Modified'),
        vocabEntry('documentCreated', 'Created'),
      ]);
      flushDirectory('eventCategories', [vocabEntry('eventDocumentCategory', 'Document')]);

      const labels = await pending;
      expect(labels.eventTypeLabelMap).toEqual({
        documentModified: 'Modified',
        documentCreated: 'Created',
      });
      expect(labels.eventCategoryLabelMap).toEqual({ eventDocumentCategory: 'Document' });
    });

    it('keeps the raw entry lists alongside the maps, for the filter dropdowns', async () => {
      const pending = firstValueFrom(service.getAuditDirectoryLabels());
      flushDirectory('eventTypes', [vocabEntry('documentModified', 'Modified')]);
      flushDirectory('eventCategories', []);

      const labels = await pending;
      expect(labels.eventTypes.map((e) => e.id)).toEqual(['documentModified']);
      expect(labels.eventCategories).toEqual([]);
      expect(labels.eventCategoryLabelMap).toEqual({});
    });

    it('keeps the last label when a vocabulary sends the same id twice', async () => {
      const pending = firstValueFrom(service.getAuditDirectoryLabels());
      flushDirectory('eventTypes', [
        vocabEntry('documentModified', 'Old label', 1),
        vocabEntry('documentModified', 'Current label', 2),
      ]);
      flushDirectory('eventCategories', []);

      expect((await pending).eventTypeLabelMap['documentModified']).toBe('Current label');
    });

    it('fails the whole pair when one vocabulary fails, rather than half-labelling the log', async () => {
      // `forkJoin` semantics, asserted deliberately: a partially built map would render some
      // audit rows with human labels and others with raw event ids, which reads as a data bug.
      const pending = firstValueFrom(service.getAuditDirectoryLabels());
      // Categories answered successfully first, so the rejection can only come from the
      // event-types failure rather than from an unanswered request.
      flushDirectory('eventCategories', []);
      httpMock
        .expectOne(
          (r) =>
            r.url.includes('/automation/Directory.SuggestEntries') &&
            r.body?.params?.directoryName === 'eventTypes',
        )
        .flush({}, { status: 500, statusText: 'Server Error' });
      await expect(pending).rejects.toBeDefined();
    });
  });

  describe('filterAuditEntries', () => {
    const noSort = { active: 'eventDate' as keyof AuditEntry, direction: '' as const };
    const entries = [
      auditEntry({ id: 1, principalName: 'jdoe', eventDate: '2026-02-01T10:00:00.000Z' }),
      auditEntry({
        id: 2,
        principalName: 'Administrator',
        eventId: 'documentCreated',
        category: 'eventLifeCycleCategory',
        eventDate: '2026-02-05T10:00:00.000Z',
      }),
      auditEntry({ id: 3, principalName: 'jsmith', eventDate: '2026-02-10T10:00:00.000Z' }),
    ];

    it('returns every entry when no filter is set', () => {
      expect(service.filterAuditEntries(entries, {}, noSort).map((e) => e.id)).toEqual([1, 2, 3]);
    });

    it('does not mutate the array it was given', () => {
      // The caller holds the unfiltered log in a signal; sorting in place would reorder the
      // source and make the next filter operate on shuffled data.
      const source = [...entries];
      service.filterAuditEntries(
        source,
        {},
        {
          active: 'principalName',
          direction: 'desc',
        },
      );
      expect(source.map((e) => e.id)).toEqual([1, 2, 3]);
    });

    it('matches a username case-insensitively and as a substring', () => {
      expect(
        service.filterAuditEntries(entries, { username: 'ADMIN' }, noSort).map((e) => e.id),
      ).toEqual([2]);
      expect(
        service.filterAuditEntries(entries, { username: 'j' }, noSort).map((e) => e.id),
      ).toEqual([1, 3]);
    });

    it('treats a whitespace-only username as no filter', () => {
      expect(
        service.filterAuditEntries(entries, { username: '   ' }, noSort).map((e) => e.id),
      ).toEqual([1, 2, 3]);
    });

    it('keeps an entry whose principal name is absent out of a username search', () => {
      const anonymous = [auditEntry({ id: 9, principalName: undefined as unknown as string })];
      expect(service.filterAuditEntries(anonymous, { username: 'j' }, noSort)).toEqual([]);
    });

    it('filters from a date inclusively', () => {
      expect(
        service
          .filterAuditEntries(entries, { dateFrom: new Date('2026-02-05T10:00:00.000Z') }, noSort)
          .map((e) => e.id),
      ).toEqual([2, 3]);
    });

    it('filters to a date inclusively of the whole day', () => {
      // The `+ 86_400_000` matters: a user picking "to 5 Feb" means the end of the 5th, and
      // without it every event later than midnight on the chosen day disappears.
      expect(
        service
          .filterAuditEntries(entries, { dateTo: new Date('2026-02-05T00:00:00.000Z') }, noSort)
          .map((e) => e.id),
      ).toEqual([1, 2]);
    });

    it('combines a date range with an event and a category filter', () => {
      expect(
        service
          .filterAuditEntries(
            entries,
            {
              dateFrom: new Date('2026-02-01T00:00:00.000Z'),
              dateTo: new Date('2026-02-10T00:00:00.000Z'),
              action: 'documentCreated',
              category: 'eventLifeCycleCategory',
            },
            noSort,
          )
          .map((e) => e.id),
      ).toEqual([2]);
    });

    it('matches an event id exactly rather than as a substring', () => {
      expect(service.filterAuditEntries(entries, { action: 'document' }, noSort)).toEqual([]);
    });

    it('sorts ascending and descending by the named column', () => {
      expect(
        service
          .filterAuditEntries(entries, {}, { active: 'principalName', direction: 'asc' })
          .map((e) => e.principalName),
      ).toEqual(['Administrator', 'jdoe', 'jsmith']);
      expect(
        service
          .filterAuditEntries(entries, {}, { active: 'principalName', direction: 'desc' })
          .map((e) => e.principalName),
      ).toEqual(['jsmith', 'jdoe', 'Administrator']);
    });

    it('leaves the order untouched when the direction is cleared', () => {
      // The table's third click clears the direction, which must restore the server order
      // rather than silently keeping the last sort.
      expect(
        service
          .filterAuditEntries(entries, {}, { active: 'principalName', direction: '' })
          .map((e) => e.id),
      ).toEqual([1, 2, 3]);
    });

    it('sorts an absent value as an empty string rather than throwing', () => {
      const mixed = [
        auditEntry({ id: 1, comment: 'b' }),
        auditEntry({ id: 2, comment: undefined as unknown as string }),
      ];
      expect(
        service
          .filterAuditEntries(mixed, {}, { active: 'comment', direction: 'asc' })
          .map((e) => e.id),
      ).toEqual([2, 1]);
    });

    it('returns an empty list when given one', () => {
      expect(service.filterAuditEntries([], { username: 'jdoe' }, noSort)).toEqual([]);
    });
  });

  describe('the Nuxeo endpoints it reaches', () => {
    it('reads a full document through the id endpoint', async () => {
      const pending = firstValueFrom(service.getFullDocument('doc-1'));
      httpMock
        .expectOne((r) => r.url.includes('/nuxeo/api/v1/id/doc-1'))
        .flush(nuxeoDoc({ title: 'Invoice' }));
      expect((await pending).title).toBe('Invoice');
    });

    it('asks for the permissions enricher when reading permissions', async () => {
      // Without `enrichers.document=permissions` the mapper cannot tell "no permissions"
      // from "we did not ask", which is the distinction the whole permission model rests on.
      const pending = firstValueFrom(service.getDocumentPermissions('doc-1'));
      const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/id/doc-1'));
      expect(req.request.headers.get('enrichers.document')).toContain('permissions');
      req.flush(nuxeoDoc());
      await pending;
    });

    it('pages the audit log with the size and index it was given', async () => {
      const pending = firstValueFrom(service.getAuditLog('doc-1', 25, 2));
      const req = httpMock.expectOne((r) => r.url.includes('/@audit'));
      expect(req.request.params.get('pageSize')).toBe('25');
      expect(req.request.params.get('currentPageIndex')).toBe('2');
      req.flush({ entries: [auditEntry()], resultsCount: 1 });
      expect((await pending).entries).toHaveLength(1);
    });

    it('defaults the audit page to ten entries starting at the first page', async () => {
      const pending = firstValueFrom(service.getAuditLog('doc-1'));
      const req = httpMock.expectOne((r) => r.url.includes('/@audit'));
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.get('currentPageIndex')).toBe('0');
      req.flush({ entries: [], resultsCount: 0 });
      await pending;
    });

    it('propagates an audit failure rather than emitting an empty log', async () => {
      // An empty log is indistinguishable from "nothing ever happened to this document".
      const pending = firstValueFrom(service.getAuditLog('doc-1'));
      httpMock
        .expectOne((r) => r.url.includes('/@audit'))
        .flush({}, { status: 500, statusText: 'Server Error' });
      await expect(pending).rejects.toBeDefined();
    });

    it('lists trashed children and restores one', async () => {
      const trashed = firstValueFrom(service.getTrashedChildren('ws-1', 10));
      httpMock
        .expectOne((r) => r.url.includes('/search/lang/NXQL/execute'))
        .flush({ entries: [nuxeoDoc({ uid: 'gone-1' })], resultsCount: 1 });
      expect((await trashed).entries?.[0]?.uid).toBe('gone-1');

      const restored = firstValueFrom(service.restoreDocument('gone-1'));
      httpMock
        .expectOne((r) => r.url.includes('Document.Untrash'))
        .flush(nuxeoDoc({ uid: 'gone-1', state: 'project' }));
      expect((await restored).state).toBe('project');
    });

    it('searches tags and narrows the vocabulary to the typed term', async () => {
      const pending = firstValueFrom(service.searchTags('URG'));
      httpMock
        .expectOne((r) => r.url.includes('/directory/label_tag_entry'))
        .flush({
          entries: [
            { properties: { label: 'urgent' } },
            { properties: { label: 'finance' } },
            { properties: { label: 'Urgency' } },
          ],
        });
      // Case-insensitive substring match, and `finance` is excluded — the filtering is the
      // behaviour, not the round trip.
      expect(await pending).toEqual(['urgent', 'Urgency']);
    });

    it('returns an empty tag list when nothing matches the term', async () => {
      const pending = firstValueFrom(service.searchTags('zzz'));
      httpMock
        .expectOne((r) => r.url.includes('/directory/label_tag_entry'))
        .flush({ entries: [{ properties: { label: 'urgent' } }] });
      expect(await pending).toEqual([]);
    });
  });

  describe('the mapping it exposes to the POC page', () => {
    it('maps a single Nuxeo document into the Hx shape the components read', () => {
      const hx = service.mapNuxeoToHx(
        nuxeoDoc({ uid: 'ws-1', title: 'Workspace', type: 'Workspace', path: '/dd/ws' }),
      );
      expect(hx.sys_id).toBe('ws-1');
      expect(hx.sys_title).toBe('Workspace');
      expect(hx.sys_isFolderish).toBe(true);
    });

    it('maps a trashed list, preserving order and marking files as not folderish', () => {
      const hx = service.mapTrashedToHx([
        nuxeoDoc({ uid: 'a', title: 'A' }),
        nuxeoDoc({ uid: 'b', title: 'B' }),
      ]);
      expect(hx.map((d) => d.sys_id)).toEqual(['a', 'b']);
      expect(hx.every((d) => d.sys_isFolderish === false)).toBe(true);
    });

    it('maps an empty trashed list to an empty array', () => {
      expect(service.mapTrashedToHx([])).toEqual([]);
    });
  });
});
