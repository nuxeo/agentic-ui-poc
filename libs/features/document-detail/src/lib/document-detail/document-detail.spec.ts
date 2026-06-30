import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { DocumentDetailComponent } from './document-detail';
import {
  ARenderService,
  BrowseService,
  CURRENT_USERNAME,
  DirectoryService,
  DocumentDetailService,
  NuxeoApiBase,
  type NuxeoDocument,
  TagService,
  TaskService,
  WorkflowService,
} from '@agentic-ui/shared/nuxeo-client';
import {
  AiChatService,
  AiFeatureFlagService,
  AiGatewayService,
} from '@agentic-ui/shared/ai-client';
import { KeClientService, type KeEnrichmentResult } from '@agentic-ui/shared/ke-client';

const STUB_DOC: NuxeoDocument = {
  uid: 'doc-uid-1',
  title: 'stub',
  type: 'File',
  path: '/stub',
  lastModified: '2026-01-01T00:00:00Z',
  properties: {},
};

const keResult = (result: string): KeEnrichmentResult =>
  ({ textClassification: { result } }) as KeEnrichmentResult;

const mockDocumentDetailService = {
  // Never-emitting Observable: keeps loadDocument's subscription "in-flight" so
  // the chain of follow-up calls (loadPublicationCount, etc.) never fires and we
  // do not have to stub every downstream service for these focused tests.
  getFullDocument: (): Observable<NuxeoDocument> => new Observable<NuxeoDocument>(),
  fetchBlob: () => of(new Blob(['stub'], { type: 'application/pdf' })),
};

const NATURE_ENTRIES = [
  {
    id: 'article',
    label: 'label.directories.nature.article',
    displayLabel: 'Article',
    ordering: 0,
    obsolete: 0,
    directoryName: 'nature',
  },
  {
    id: 'contract',
    label: 'label.directories.nature.contract',
    displayLabel: 'Contract',
    ordering: 0,
    obsolete: 0,
    directoryName: 'nature',
  },
];

const mockDirectoryService = {
  getEventTypes: () => of([]),
  getEventCategories: () => of([]),
  getEntries: (name: string) => (name === 'nature' ? of(NATURE_ENTRIES) : of([])),
};

const mockTaskService = {
  getDocumentTasks: () => of([]),
};

const mockWorkflowService = {
  getDocumentWorkflows: () => of([]),
};

const mockARenderService = {
  isAvailable: () => of(false),
  getPreviewerUrl: () => of(null),
};

const mockTagService = {
  addTag: () => of(null),
};

const mockAiGatewayService = {
  summarize: () => of(null),
  suggestTags: () => of({ tags: [] }),
  classify: () => of(null),
  findSimilar: () => of({ documents: [] }),
  analyzeSentiment: () => of({ sentiments: [], threadSummary: null }),
};

const mockAiChatService = {
  openPanel: () => undefined,
};

const mockAiFeatureFlagService = {
  aiEnabled: signal(false),
};

const mockNuxeoApiBase = {
  nxqlSearch: () => of({ entries: [] }),
};

describe('DocumentDetailComponent', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDetailComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ uid: 'doc-uid-1' })),
            queryParamMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        { provide: DocumentDetailService, useValue: mockDocumentDetailService },
        {
          provide: BrowseService,
          useValue: { updateDocument: (): Observable<NuxeoDocument> => of(STUB_DOC) },
        },
        { provide: DirectoryService, useValue: mockDirectoryService },
        {
          provide: KeClientService,
          useValue: { enrich: (): Observable<KeEnrichmentResult> => of(keResult('')) },
        },
        { provide: TaskService, useValue: mockTaskService },
        { provide: WorkflowService, useValue: mockWorkflowService },
        { provide: ARenderService, useValue: mockARenderService },
        { provide: TagService, useValue: mockTagService },
        { provide: AiGatewayService, useValue: mockAiGatewayService },
        { provide: AiChatService, useValue: mockAiChatService },
        { provide: AiFeatureFlagService, useValue: mockAiFeatureFlagService },
        { provide: NuxeoApiBase, useValue: mockNuxeoApiBase },
        { provide: CURRENT_USERNAME, useValue: () => 'tester' },
      ],
    })
      .overrideComponent(DocumentDetailComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('text classification', () => {
    // docUid is set by the route paramMap mock; no private-field access needed.

    it('refuses to write the "not_from_provided_classes" sentinel to dc:nature', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(of(keResult('not_from_provided_classes')));
      const updateSpy = vi.spyOn(browse, 'updateDocument');

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/could not match this document/i);
    });

    it('refuses to write a category that is not in the nature vocabulary', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(of(keResult('Hallucinated')));
      const updateSpy = vi.spyOn(browse, 'updateDocument');

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/"Hallucinated".*not one of the \d+ document categories/);
    });

    it('writes the vocabulary id when KE returns a valid display label', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(of(keResult('Contract')));
      const updateSpy = vi.spyOn(browse, 'updateDocument').mockReturnValue(of(STUB_DOC));

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).toHaveBeenCalledWith('doc-uid-1', { 'dc:nature': 'contract' });
      expect(component.keError()).toBeNull();
    });

    it('aborts classification (no enrich call) when the nature vocabulary is empty', async () => {
      const keClient = TestBed.inject(KeClientService);
      const enrichSpy = vi.spyOn(keClient, 'enrich');
      component.natureVocabulary.set([]);

      component.runTextClassification();
      await fixture.whenStable();

      expect(enrichSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/nature.*vocabulary failed to load/i);
    });
  });
});
