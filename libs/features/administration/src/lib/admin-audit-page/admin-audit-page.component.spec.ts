import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Subject, of, throwError } from 'rxjs';

import {
  AdministrationService,
  DirectoryService,
  type AuditEntry,
  type DirectoryEntry,
} from '@nuxeo-satori/platform/nuxeo-client';
import {
  AiGatewayService,
  AiFeatureFlagService,
  type AuditFilterResponse,
  type AuditSummaryResponse,
} from '@agentic-ui/shared/ai-client';

import { AdminAuditPageComponent } from './admin-audit-page.component';

describe('AdminAuditPageComponent', () => {
  let component: AdminAuditPageComponent;
  let fixture: ComponentFixture<AdminAuditPageComponent>;
  let adminService: { searchAuditLogs: ReturnType<typeof vi.fn> };
  let directoryService: {
    getEventTypes: ReturnType<typeof vi.fn>;
    getEventCategories: ReturnType<typeof vi.fn>;
  };
  let aiGateway: {
    detectAnomalies: ReturnType<typeof vi.fn>;
    auditNlFilter: ReturnType<typeof vi.fn>;
    auditSummarize: ReturnType<typeof vi.fn>;
  };

  const mockEntries = [
    {
      id: 1,
      eventId: 'documentModified',
      eventDate: '2026-03-01T10:00:00.000Z',
      principalName: 'Administrator',
      category: 'eventDocumentCategory',
      docUUID: 'doc-1',
      comment: 'Edited the title',
    },
    {
      id: 2,
      eventId: 'documentSecurityUpdated',
      eventDate: '2026-03-02T10:00:00.000Z',
      principalName: 'jdoe',
      category: 'eventLifeCycleCategory',
      docUUID: 'doc-2',
      comment: '',
    },
  ] as unknown as AuditEntry[];

  const mockEventTypes = [
    { id: 'documentModified', label: 'Document modified' },
    { id: 'documentCreated', label: 'Document created' },
  ] as unknown as DirectoryEntry[];

  const mockEventCategories = [
    { id: 'eventDocumentCategory', label: 'Document' },
  ] as unknown as DirectoryEntry[];

  beforeEach(async () => {
    adminService = {
      searchAuditLogs: vi.fn().mockReturnValue(of({ entries: mockEntries, totalSize: 2 })),
    };

    directoryService = {
      getEventTypes: vi.fn().mockReturnValue(of(mockEventTypes)),
      getEventCategories: vi.fn().mockReturnValue(of(mockEventCategories)),
    };

    aiGateway = {
      detectAnomalies: vi.fn().mockReturnValue(
        of({
          anomalies: [
            { severity: 'high', title: 'Mass deletion', description: '40 deletes in a minute' },
            { severity: 'low', title: 'Odd hour login', description: '03:14 login' },
          ],
          summary: 'One high-severity anomaly in the last 24 hours.',
        }),
      ),
      auditNlFilter: vi.fn().mockReturnValue(of({ explanation: 'Filtered to jdoe' })),
      auditSummarize: vi.fn().mockReturnValue(of({ summary: 'Mostly edits.', stats: [] })),
    };

    await TestBed.configureTestingModule({
      imports: [AdminAuditPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AdministrationService, useValue: adminService },
        { provide: DirectoryService, useValue: directoryService },
        { provide: AiGatewayService, useValue: aiGateway },
        { provide: AiFeatureFlagService, useValue: { aiEnabled: signal(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAuditPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load the event-type and category vocabularies for the filter dropdowns', () => {
      component.ngOnInit();

      expect(component.eventTypes()).toEqual(mockEventTypes);
      expect(component.eventCategories()).toEqual(mockEventCategories);
    });

    it('should load the first page of entries and the anomaly feed', () => {
      component.ngOnInit();

      expect(adminService.searchAuditLogs).toHaveBeenCalled();
      expect(component.entries()).toEqual(mockEntries);
      expect(aiGateway.detectAnomalies).toHaveBeenCalledWith('24h');
    });
  });

  describe('load', () => {
    it('should request the current page with the page size and no empty filters', () => {
      component.load();

      expect(adminService.searchAuditLogs).toHaveBeenCalledWith({
        pageSize: 50,
        currentPageIndex: 0,
        principalName: undefined,
        from: null,
        to: null,
        eventIds: undefined,
        category: undefined,
      });
    });

    it('should send every filter the user has set', () => {
      component.principalName = '  jdoe  ';
      component.fromDate = new Date('2026-01-01T00:00:00.000Z');
      component.toDate = new Date('2026-02-01T00:00:00.000Z');
      component.eventAction = 'documentModified';
      component.eventCategory = 'eventDocumentCategory';
      component.pageIndex.set(2);

      component.load();

      expect(adminService.searchAuditLogs).toHaveBeenCalledWith({
        pageSize: 50,
        currentPageIndex: 2,
        // Trimmed: a stray space would otherwise be sent as part of the username.
        principalName: 'jdoe',
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-02-01T00:00:00.000Z',
        eventIds: ['documentModified'],
        category: 'eventDocumentCategory',
      });
    });

    it('should drop a principal name that is only whitespace', () => {
      component.principalName = '   ';

      component.load();

      expect(adminService.searchAuditLogs.mock.calls[0][0].principalName).toBeUndefined();
    });

    it('should show loading while the request is in flight and clear it on arrival', () => {
      const pending = new Subject<{ entries: AuditEntry[]; totalSize: number }>();
      adminService.searchAuditLogs.mockReturnValue(pending.asObservable());

      component.load();
      expect(component.loading()).toBe(true);

      pending.next({ entries: mockEntries, totalSize: 2 });
      expect(component.loading()).toBe(false);
      expect(component.totalSize()).toBe(2);
    });

    it('should fall back to the entry count when the server omits totalSize', () => {
      adminService.searchAuditLogs.mockReturnValue(of({ entries: mockEntries }));

      component.load();

      expect(component.totalSize()).toBe(2);
    });

    it('should treat a response with no entries as an empty page', () => {
      adminService.searchAuditLogs.mockReturnValue(of({}));

      component.load();

      expect(component.entries()).toEqual([]);
      expect(component.totalSize()).toBe(0);
    });

    it('should clear the table and stop loading when the request fails', () => {
      component.entries.set(mockEntries);
      component.totalSize.set(2);
      adminService.searchAuditLogs.mockReturnValue(throwError(() => new Error('500')));

      component.load();

      expect(component.entries()).toEqual([]);
      expect(component.totalSize()).toBe(0);
      expect(component.loading()).toBe(false);
    });
  });

  describe('paging', () => {
    it('should reset to the first page when filters are applied', () => {
      component.pageIndex.set(3);
      adminService.searchAuditLogs.mockClear();

      component.applyFilters();

      expect(component.pageIndex()).toBe(0);
      expect(adminService.searchAuditLogs.mock.calls[0][0].currentPageIndex).toBe(0);
    });

    it('should advance a page and reload', () => {
      adminService.searchAuditLogs.mockClear();

      component.nextPage();

      expect(component.pageIndex()).toBe(1);
      expect(adminService.searchAuditLogs.mock.calls[0][0].currentPageIndex).toBe(1);
    });

    it('should go back a page and reload', () => {
      component.pageIndex.set(2);
      adminService.searchAuditLogs.mockClear();

      component.prevPage();

      expect(component.pageIndex()).toBe(1);
      expect(adminService.searchAuditLogs.mock.calls[0][0].currentPageIndex).toBe(1);
    });

    it('should not page back past the first page', () => {
      component.pageIndex.set(0);

      component.prevPage();

      expect(component.pageIndex()).toBe(0);
    });
  });

  describe('actionLabel', () => {
    it('should split a camelCase event id into words and capitalise it', () => {
      expect(component.actionLabel({ eventId: 'documentModified' } as AuditEntry)).toBe(
        'Document Modified',
      );
    });

    it('should render an em dash for an entry with no event id', () => {
      expect(component.actionLabel({} as AuditEntry)).toBe('—');
    });
  });

  describe('anomaly detection', () => {
    it('should store the anomalies and their summary', () => {
      component.loadAnomalies();

      expect(component.anomalies()).toHaveLength(2);
      expect(component.anomalySummary()).toBe('One high-severity anomaly in the last 24 hours.');
      expect(component.anomalyLoading()).toBe(false);
    });

    it('should count only the high-severity anomalies', () => {
      component.loadAnomalies();
      expect(component.highSeverityCount()).toBe(1);
    });

    it('should treat a response with no anomalies as an empty feed', () => {
      aiGateway.detectAnomalies.mockReturnValue(of({}));

      component.loadAnomalies();

      expect(component.anomalies()).toEqual([]);
      expect(component.anomalySummary()).toBe('');
    });

    it('should stop loading when anomaly detection fails', () => {
      // The AI marketplace package may be absent, which is an expected 500 rather than a defect —
      // the page must still render its audit table.
      aiGateway.detectAnomalies.mockReturnValue(throwError(() => new Error('500')));

      component.loadAnomalies();

      expect(component.anomalyLoading()).toBe(false);
      expect(component.anomalies()).toEqual([]);
    });

    it('should stay dismissed once the user dismisses the banner', () => {
      expect(component.anomalyDismissed()).toBe(false);

      component.dismissAnomalies();

      expect(component.anomalyDismissed()).toBe(true);
    });

    it('should pick an icon per severity', () => {
      expect(component.severityIcon('high')).toBe('error');
      expect(component.severityIcon('medium')).toBe('warning');
      expect(component.severityIcon('low')).toBe('info');
      expect(component.severityIcon('anything-else')).toBe('info');
    });
  });

  describe('natural-language search', () => {
    it('should not call the gateway for a blank query', () => {
      component.nlQuery = '   ';

      component.onNlSearch();

      expect(aiGateway.auditNlFilter).not.toHaveBeenCalled();
      expect(component.nlLoading()).toBe(false);
    });

    it('should send the trimmed query and keep the returned explanation', () => {
      component.nlQuery = '  who deleted things yesterday  ';

      component.onNlSearch();

      expect(aiGateway.auditNlFilter).toHaveBeenCalledWith('who deleted things yesterday');
      expect(component.nlExplanation()).toBe('Filtered to jdoe');
      expect(component.nlLoading()).toBe(false);
    });

    it('should apply every field the AI filter returned and reload from the first page', () => {
      component.pageIndex.set(4);
      aiGateway.auditNlFilter.mockReturnValue(
        of({
          principalName: 'jdoe',
          eventId: 'documentRemoved',
          category: 'eventDocumentCategory',
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-02-01T00:00:00.000Z',
          explanation: 'Deletions by jdoe in January',
        } as AuditFilterResponse),
      );
      component.nlQuery = 'deletions by jdoe in january';
      adminService.searchAuditLogs.mockClear();

      component.onNlSearch();

      expect(component.principalName).toBe('jdoe');
      expect(component.eventAction).toBe('documentRemoved');
      expect(component.eventCategory).toBe('eventDocumentCategory');
      expect(component.fromDate?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(component.toDate?.toISOString()).toBe('2026-02-01T00:00:00.000Z');
      expect(component.pageIndex()).toBe(0);
      expect(adminService.searchAuditLogs).toHaveBeenCalled();
    });

    it('should leave filters the AI filter did not mention untouched', () => {
      component.principalName = 'existing-user';
      component.eventCategory = 'existing-category';
      aiGateway.auditNlFilter.mockReturnValue(of({ eventId: 'documentRemoved' }));
      component.nlQuery = 'deletions';

      component.onNlSearch();

      expect(component.principalName).toBe('existing-user');
      expect(component.eventCategory).toBe('existing-category');
      expect(component.eventAction).toBe('documentRemoved');
    });

    it('should record an empty explanation when the filter response omits one', () => {
      aiGateway.auditNlFilter.mockReturnValue(of({ principalName: 'jdoe' }));
      component.nlQuery = 'jdoe';

      component.onNlSearch();

      expect(component.nlExplanation()).toBe('');
    });

    it('should stop loading when the natural-language filter fails', () => {
      aiGateway.auditNlFilter.mockReturnValue(throwError(() => new Error('500')));
      component.nlQuery = 'anything';

      component.onNlSearch();

      expect(component.nlLoading()).toBe(false);
    });

    it('should clear both the query and every filter it set, then reload', () => {
      component.nlQuery = 'deletions by jdoe';
      component.nlExplanation.set('Deletions by jdoe');
      component.principalName = 'jdoe';
      component.eventAction = 'documentRemoved';
      component.eventCategory = 'eventDocumentCategory';
      component.fromDate = new Date('2026-01-01T00:00:00.000Z');
      component.toDate = new Date('2026-02-01T00:00:00.000Z');
      component.pageIndex.set(3);
      adminService.searchAuditLogs.mockClear();

      component.clearNlSearch();

      expect(component.nlQuery).toBe('');
      expect(component.nlExplanation()).toBe('');
      expect(component.principalName).toBe('');
      expect(component.eventAction).toBe('');
      expect(component.eventCategory).toBe('');
      expect(component.fromDate).toBeNull();
      expect(component.toDate).toBeNull();
      expect(component.pageIndex()).toBe(0);
      expect(adminService.searchAuditLogs.mock.calls[0][0]).toMatchObject({
        principalName: undefined,
        from: null,
        to: null,
        eventIds: undefined,
        category: undefined,
      });
    });
  });

  describe('summarization', () => {
    it('should not summarize an empty table', () => {
      component.entries.set([]);

      component.summarizeEntries();

      expect(aiGateway.auditSummarize).not.toHaveBeenCalled();
      expect(component.summaryOpen()).toBe(false);
    });

    it('should open the panel and summarize the entries on screen', () => {
      component.entries.set(mockEntries);

      component.summarizeEntries();

      expect(aiGateway.auditSummarize).toHaveBeenCalledWith(mockEntries);
      expect(component.summaryOpen()).toBe(true);
      expect(component.summaryLoading()).toBe(false);
      expect(component.auditSummary()).toEqual({ summary: 'Mostly edits.', stats: [] });
    });

    it('should show the panel loading while the summary is in flight', () => {
      const pending = new Subject<AuditSummaryResponse>();
      aiGateway.auditSummarize.mockReturnValue(pending.asObservable());
      component.entries.set(mockEntries);

      component.summarizeEntries();
      expect(component.summaryLoading()).toBe(true);
      expect(component.summaryOpen()).toBe(true);

      pending.next({ summary: 'Done.' } as AuditSummaryResponse);
      expect(component.summaryLoading()).toBe(false);
    });

    it('should leave the panel open with no summary when summarization fails', () => {
      aiGateway.auditSummarize.mockReturnValue(throwError(() => new Error('500')));
      component.entries.set(mockEntries);

      component.summarizeEntries();

      expect(component.auditSummary()).toBeNull();
      expect(component.summaryLoading()).toBe(false);
      // Open, so the user sees the panel failed rather than the button doing nothing.
      expect(component.summaryOpen()).toBe(true);
    });

    it('should close the summary panel', () => {
      component.entries.set(mockEntries);
      component.summarizeEntries();

      component.closeSummary();

      expect(component.summaryOpen()).toBe(false);
    });

    it('should map each known stat icon and fall back to info', () => {
      expect(component.summaryStatIcon('edit')).toBe('edit');
      expect(component.summaryStatIcon('delete')).toBe('delete');
      expect(component.summaryStatIcon('security')).toBe('shield');
      expect(component.summaryStatIcon('login')).toBe('login');
      expect(component.summaryStatIcon('download')).toBe('download');
      expect(component.summaryStatIcon('workflow')).toBe('account_tree');
      expect(component.summaryStatIcon('info')).toBe('info');
      expect(component.summaryStatIcon('not-a-known-icon')).toBe('info');
    });
  });
});
