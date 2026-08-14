import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { SearchComponent } from './search';
import {
  DocumentDetailService,
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

const mockNuxeoApiBase = {
  nxqlSearch: vi.fn(() => of({ entries: [] })),
};

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSearchService.search.mockReturnValue(of({ items: [], aggregations: {} }));

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideZonelessChangeDetection(),
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
});
