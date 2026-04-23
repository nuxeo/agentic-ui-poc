import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { SearchComponent } from './search';
import {
  DocumentDetailService,
  KnowledgeDiscoveryService,
  NuxeoApiBase,
  SearchAggregationService,
  SearchService,
  SelectionService,
} from '@agentic-ui/shared/nuxeo-client';
import { AiFeatureFlagService, AiGatewayService } from '@agentic-ui/shared/ai-client';

const mockSearchService = {
  search: vi.fn(() => of({ items: [], aggregations: {} })),
};

const mockSearchAggregationService = {
  drawerFilters: signal<Record<string, string>>({}),
  aggregations: signal({}),
  items: signal([]),
  selectedSavedSearchId: signal(''),
  selectedSavedSearchTitle: signal(''),
};

const mockDocumentDetailService = {
  fetchThumbnail: vi.fn(() => of(null)),
};

const mockSelectionService = {
  selectedCount: vi.fn(() => 0),
  isAllSelected: vi.fn(() => false),
  isIndeterminate: vi.fn(() => false),
  isSelected: vi.fn(() => false),
  toggle: vi.fn(),
  clear: vi.fn(),
  selectAll: vi.fn(),
};

const mockAiGatewayService = {
  nlToNxqlSuggestions: vi.fn(() => of({ suggestions: [] })),
  nlToNxql: vi.fn(),
};

const mockAiFeatureFlagService = {
  aiEnabled: signal(true),
};

const mockKnowledgeDiscoveryService = {
  query: vi.fn(),
};

const mockNuxeoApiBase = {
  nxqlSearch: vi.fn(() => of({ entries: [] })),
};

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSearchService.search.mockReturnValue(of({ items: [], aggregations: {} }));
    mockKnowledgeDiscoveryService.query.mockReturnValue(
      of({
        answer: '',
        status: 'Complete',
        items: [],
        sources: [],
      }),
    );

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
          },
        },
        { provide: SearchService, useValue: mockSearchService },
        { provide: SearchAggregationService, useValue: mockSearchAggregationService },
        { provide: DocumentDetailService, useValue: mockDocumentDetailService },
        { provide: SelectionService, useValue: mockSelectionService },
        { provide: AiGatewayService, useValue: mockAiGatewayService },
        { provide: AiFeatureFlagService, useValue: mockAiFeatureFlagService },
        { provide: KnowledgeDiscoveryService, useValue: mockKnowledgeDiscoveryService },
        { provide: NuxeoApiBase, useValue: mockNuxeoApiBase },
      ],
    })
      .overrideComponent(SearchComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should execute Knowledge Discovery and populate answer state', () => {
    mockKnowledgeDiscoveryService.query.mockReturnValue(
      of({
        answer: 'Renewal terms are present in the MSA.',
        status: 'Complete',
        items: [],
        sources: [{ objectId: 'doc-1', title: 'MSA', excerpt: 'Renewal terms...' }],
      }),
    );

    component.toggleKnowledgeDiscovery();
    component.knowledgeDiscoveryQuery.set('renewal terms');
    component.executeKnowledgeDiscovery();

    expect(mockKnowledgeDiscoveryService.query).toHaveBeenCalledWith({
      query: 'renewal terms',
      limit: 10,
    });
    expect(component.knowledgeDiscoveryAnswer()).toContain('Renewal terms');
    expect(component.knowledgeDiscoveryStatus()).toBe('Complete');
    expect(component.knowledgeDiscoverySources()).toHaveLength(1);
    expect(component.knowledgeDiscoveryError()).toBeNull();
    expect(component.knowledgeDiscoverySearchExecuted()).toBe(true);
    expect(component.knowledgeDiscoveryLoading()).toBe(false);
  });

  it('should set a Knowledge Discovery error when the endpoint fails', () => {
    mockKnowledgeDiscoveryService.query.mockReturnValue(
      throwError(() => ({
        error: { message: 'Knowledge Discovery endpoint is not deployed.' },
      })),
    );

    component.toggleKnowledgeDiscovery();
    component.knowledgeDiscoveryQuery.set('renewal terms');
    component.executeKnowledgeDiscovery();

    expect(component.knowledgeDiscoveryError()).toBe(
      'Knowledge Discovery endpoint is not deployed.',
    );
    expect(component.knowledgeDiscoveryLoading()).toBe(false);
    expect(component.knowledgeDiscoverySearchExecuted()).toBe(false);
  });
});
