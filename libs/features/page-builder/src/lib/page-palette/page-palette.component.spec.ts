import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {
  PAGE_TILE_CATALOGUE,
  PageTileCatalogue,
  type PageTileDefinition,
} from '@agentic-ui/shared/agent-client';

import { PagePaletteComponent } from './page-palette.component';

describe('PagePaletteComponent', () => {
  let component: PagePaletteComponent;
  let fixture: ComponentFixture<PagePaletteComponent>;

  const mockTiles: PageTileDefinition[] = [
    {
      name: 'recentDocs',
      displayName: 'Recent Documents',
      description: 'Shows your recently viewed documents',
      icon: 'history',
      configSchema: { type: 'object', properties: {} },
      parseConfig: () => ({}),
      load: async () => Promise.resolve(class {}),
      inputs: () => ({}),
      defaultWidth: 'half',
      supportedWidths: ['half', 'full'],
    },
    {
      name: 'favorites',
      displayName: 'Favorite Items',
      description: 'Your favorite documents and collections',
      icon: 'star',
      configSchema: { type: 'object', properties: {} },
      parseConfig: () => ({}),
      load: async () => Promise.resolve(class {}),
      inputs: () => ({}),
      defaultWidth: 'half',
      supportedWidths: ['half', 'full'],
    },
    {
      name: 'tasks',
      displayName: 'My Tasks',
      description: 'Workflow tasks assigned to you',
      icon: 'task',
      configSchema: { type: 'object', properties: {} },
      parseConfig: () => ({}),
      load: async () => Promise.resolve(class {}),
      inputs: () => ({}),
      defaultWidth: 'full',
      supportedWidths: ['half', 'full'],
    },
  ];

  beforeEach(async () => {
    const catalogue = new PageTileCatalogue(mockTiles);

    await TestBed.configureTestingModule({
      imports: [PagePaletteComponent, NoopAnimationsModule],
      providers: [{ provide: PAGE_TILE_CATALOGUE, useValue: catalogue }],
    }).compileComponents();

    fixture = TestBed.createComponent(PagePaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all registered tiles initially', () => {
    expect(component.filteredTiles()).toHaveLength(3);
    expect(component.filteredTiles()).toEqual(mockTiles);
  });

  it('should filter tiles by display name', () => {
    component.searchQuery.set('recent');
    expect(component.filteredTiles()).toHaveLength(1);
    expect(component.filteredTiles()[0].name).toBe('recentDocs');
  });

  it('should filter tiles by description', () => {
    component.searchQuery.set('workflow');
    expect(component.filteredTiles()).toHaveLength(1);
    expect(component.filteredTiles()[0].name).toBe('tasks');
  });

  it('should be case-insensitive when filtering', () => {
    component.searchQuery.set('FAVORITE');
    expect(component.filteredTiles()).toHaveLength(1);
    expect(component.filteredTiles()[0].name).toBe('favorites');
  });

  it('should return all tiles when search query is empty', () => {
    component.searchQuery.set('something');
    expect(component.filteredTiles()).toHaveLength(0);

    component.searchQuery.set('');
    expect(component.filteredTiles()).toHaveLength(3);
  });

  it('should trim whitespace from search query', () => {
    component.searchQuery.set('  recent  ');
    expect(component.filteredTiles()).toHaveLength(1);
    expect(component.filteredTiles()[0].name).toBe('recentDocs');
  });

  it('should return no results when search matches nothing', () => {
    component.searchQuery.set('nonexistent');
    expect(component.filteredTiles()).toHaveLength(0);
    expect(component.noResults()).toBe(true);
  });

  it('should emit tileSelected when a tile is clicked', () => {
    const emitSpy = vi.spyOn(component.tileSelected, 'emit');
    const tile = mockTiles[0];

    component.selectTile(tile);

    expect(emitSpy).toHaveBeenCalledWith(tile);
  });

  it('should track tiles by name', () => {
    const tile = mockTiles[0];
    const trackResult = component.trackByName(0, tile);
    expect(trackResult).toBe('recentDocs');
  });

  it('should indicate when tiles are available', () => {
    expect(component.hasTiles()).toBe(true);
  });

  it('should show no results state only when search returns empty', () => {
    expect(component.noResults()).toBe(false);

    component.searchQuery.set('nonexistent');
    expect(component.noResults()).toBe(true);

    component.searchQuery.set('');
    expect(component.noResults()).toBe(false);
  });
});

describe('PagePaletteComponent - empty catalogue', () => {
  let component: PagePaletteComponent;
  let fixture: ComponentFixture<PagePaletteComponent>;

  beforeEach(async () => {
    const catalogue = new PageTileCatalogue([]);

    await TestBed.configureTestingModule({
      imports: [PagePaletteComponent, NoopAnimationsModule],
      providers: [{ provide: PAGE_TILE_CATALOGUE, useValue: catalogue }],
    }).compileComponents();

    fixture = TestBed.createComponent(PagePaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show empty state when no tiles are registered', () => {
    expect(component.hasTiles()).toBe(false);
    expect(component.filteredTiles()).toHaveLength(0);
  });

  it('should not show no results state when catalogue is empty', () => {
    component.searchQuery.set('something');
    expect(component.noResults()).toBe(false);
  });
});
