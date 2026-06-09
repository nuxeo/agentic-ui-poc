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
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DocumentDetailComponent } from './document-detail';
import {
  ARenderService,
  BrowseService,
  CURRENT_USERNAME,
  DirectoryService,
  DocumentDetailService,
  NuxeoApiBase,
  TagService,
  TaskService,
  WorkflowService,
} from '@agentic-ui/shared/nuxeo-client';
import {
  AiChatService,
  AiFeatureFlagService,
  AiGatewayService,
} from '@agentic-ui/shared/ai-client';
import { KeClientService } from '@agentic-ui/shared/ke-client';

const mockDocumentDetailService = {
  getFullDocument: () => of(),
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
            paramMap: of(convertToParamMap({})),
          },
        },
        { provide: DocumentDetailService, useValue: mockDocumentDetailService },
        { provide: BrowseService, useValue: { updateDocument: () => of(null) } },
        { provide: DirectoryService, useValue: mockDirectoryService },
        {
          provide: KeClientService,
          useValue: { enrich: () => of({ textClassification: { result: '' } }) },
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
    beforeEach(() => {
      // Anchor a doc id so runKnowledgeEnrichment does not early-return.
      (component as unknown as { docUid: string }).docUid = 'doc-uid-1';
    });

    it('refuses to write the "not_from_provided_classes" sentinel to dc:nature', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(
        of({ textClassification: { result: 'not_from_provided_classes' } }) as never,
      );
      const updateSpy = vi.spyOn(browse, 'updateDocument');

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/could not match this document/i);
    });

    it('refuses to write a category that is not in the nature vocabulary', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(
        of({ textClassification: { result: 'Hallucinated' } }) as never,
      );
      const updateSpy = vi.spyOn(browse, 'updateDocument');

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/"Hallucinated".*not in the document nature vocabulary/);
    });

    it('writes the vocabulary id when KE returns a valid display label', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      const detail = TestBed.inject(DocumentDetailService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(
        of({ textClassification: { result: 'Contract' } }) as never,
      );
      const updateSpy = vi.spyOn(browse, 'updateDocument').mockReturnValue(of(null) as never);
      vi.spyOn(detail, 'getFullDocument').mockReturnValue(
        of({ uid: 'doc-uid-1', properties: {} }) as never,
      );

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
