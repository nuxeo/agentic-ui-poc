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
import { DocumentDetailComponent } from './document-detail';
import {
  ARenderService,
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

const mockDocumentDetailService = {
  getFullDocument: () => of(),
};

const mockDirectoryService = {
  getEventTypes: () => of([]),
  getEventCategories: () => of([]),
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
        { provide: DirectoryService, useValue: mockDirectoryService },
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
});
