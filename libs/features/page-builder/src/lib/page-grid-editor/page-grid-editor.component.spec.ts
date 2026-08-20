import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { PageGridEditorComponent } from './page-grid-editor.component';
import {
  PAGE_TILE_CATALOGUE,
  PageTileCatalogue,
  type PageConfig,
  type PageTileDefinition,
  type PageTileInstance,
} from '@agentic-ui/shared/agent-client';

describe('PageGridEditorComponent', () => {
  let component: PageGridEditorComponent;
  let mockCatalogue: PageTileCatalogue;
  let mockTiles: PageTileDefinition[];

  beforeEach(async () => {
    // Create mock tile definitions
    mockTiles = [
      {
        name: 'recentDocuments',
        displayName: 'Recent Documents',
        description: 'Shows recently modified documents',
        icon: 'schedule',
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', default: 'Recent Documents' },
            limit: { type: 'integer', default: 10 },
          },
        },
        parseConfig: (config) => config,
        load: async () => Promise.resolve(class {}),
        inputs: (config) => config,
        defaultWidth: 'half' as const,
        supportedWidths: ['half', 'full'] as const,
        minHeight: 1,
      },
      {
        name: 'favorites',
        displayName: 'Favorites',
        description: 'Shows favorite documents',
        icon: 'star',
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', default: 'Favorites' },
          },
        },
        parseConfig: (config) => config,
        load: async () => Promise.resolve(class {}),
        inputs: (config) => config,
        defaultWidth: 'half' as const,
        supportedWidths: ['half', 'full'] as const,
        minHeight: 1,
      },
      {
        name: 'taskList',
        displayName: 'Task List',
        description: 'Shows pending tasks',
        icon: 'task',
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', default: 'Tasks' },
          },
        },
        parseConfig: (config) => config,
        load: async () => Promise.resolve(class {}),
        inputs: (config) => config,
        defaultWidth: 'full' as const,
        supportedWidths: ['full'] as const, // Only full width
        minHeight: 2,
      },
    ];

    mockCatalogue = new PageTileCatalogue(mockTiles);

    await TestBed.configureTestingModule({
      imports: [PageGridEditorComponent],
      providers: [{ provide: PAGE_TILE_CATALOGUE, useValue: mockCatalogue }],
    }).compileComponents();

    const fixture = TestBed.createComponent(PageGridEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start with empty tiles', () => {
      expect(component.tiles()).toEqual([]);
    });

    it('should have correct layout constants', () => {
      expect(component.layout.columns).toBe(12);
      expect(component.layout.maxTiles).toBe(50);
    });

    it('should calculate minimum rows for empty grid', () => {
      expect(component.totalRows()).toBe(6);
    });
  });

  describe('initial configuration', () => {
    it('should load initial config when provided', () => {
      const config: PageConfig = {
        tiles: [
          {
            tileName: 'recentDocuments',
            config: { title: 'Recent Docs', limit: 10 },
            placement: { row: 1, col: 1, width: 6, height: 1 },
          },
        ],
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [PageGridEditorComponent],
        providers: [{ provide: PAGE_TILE_CATALOGUE, useValue: mockCatalogue }],
      });

      const fixture = TestBed.createComponent(PageGridEditorComponent);
      fixture.componentRef.setInput('initialConfig', config);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.tiles().length).toBe(1);
      expect(component.tiles()[0].tileName).toBe('recentDocuments');
    });

    it('should emit config changes', (done) => {
      const newTile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 6, height: 1 },
      };

      component.configChanged.subscribe((config) => {
        expect(config).toEqual({
          tiles: [newTile],
        });
        done();
      });

      component.tiles.set([newTile]);
    });
  });

  describe('tile removal', () => {
    it('should remove tile at specified index', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
        {
          tileName: 'favorites',
          config: { title: 'Favorites' },
          placement: { row: 1, col: 7, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);
      component.removeTile(0);

      expect(component.tiles().length).toBe(1);
      expect(component.tiles()[0].tileName).toBe('favorites');
    });

    it('should emit config change after removal', (done) => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);

      let callCount = 0;
      component.configChanged.subscribe((config) => {
        callCount++;
        if (callCount === 2) {
          // Second emission after removal
          expect(config).toEqual({ tiles: [] });
          done();
        }
      });

      component.removeTile(0);
    });
  });

  describe('tile resizing', () => {
    it('should resize tile from full to half width', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 12, height: 1 },
        },
      ];

      component.tiles.set(tiles);
      component.resizeTile(0);

      expect(component.tiles()[0].placement.width).toBe(6);
    });

    it('should resize tile from half to full width', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);
      component.resizeTile(0);

      expect(component.tiles()[0].placement.width).toBe(12);
      expect(component.tiles()[0].placement.col).toBe(1);
    });

    it('should not resize if tile does not support target width', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'taskList',
          config: { title: 'Tasks' },
          placement: { row: 1, col: 1, width: 12, height: 2 },
        },
      ];

      component.tiles.set(tiles);
      const originalWidth = tiles[0].placement.width;
      component.resizeTile(0);

      // taskList only supports full width, so no resize
      expect(component.tiles()[0].placement.width).toBe(originalWidth);
    });

    it('should not resize if it would cause collision', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
        {
          tileName: 'favorites',
          config: { title: 'Favorites' },
          placement: { row: 1, col: 7, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);
      const originalWidth = tiles[0].placement.width;

      // Try to resize first tile to full width, which would collide with second tile
      component.resizeTile(0);

      // Should not resize due to collision
      expect(component.tiles()[0].placement.width).toBe(originalWidth);
    });

    it('should move to col 1 when resizing to full width', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 7, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);
      component.resizeTile(0);

      expect(component.tiles()[0].placement.width).toBe(12);
      expect(component.tiles()[0].placement.col).toBe(1);
    });
  });

  describe('collision detection', () => {
    it('should detect horizontal overlap', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);

      const newPlacement = { row: 1, col: 3, width: 6, height: 1 };
      const hasCollision = (component as any).hasCollision(newPlacement, -1);

      expect(hasCollision).toBe(true);
    });

    it('should detect vertical overlap', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 2 },
        },
      ];

      component.tiles.set(tiles);

      const newPlacement = { row: 2, col: 1, width: 6, height: 1 };
      const hasCollision = (component as any).hasCollision(newPlacement, -1);

      expect(hasCollision).toBe(true);
    });

    it('should not detect collision for non-overlapping tiles', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);

      const newPlacement = { row: 1, col: 7, width: 6, height: 1 };
      const hasCollision = (component as any).hasCollision(newPlacement, -1);

      expect(hasCollision).toBe(false);
    });

    it('should exclude specified tile when checking collisions', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);

      const samePlacement = { row: 1, col: 1, width: 6, height: 1 };
      const hasCollision = (component as any).hasCollision(samePlacement, 0);

      // Should not collide with itself
      expect(hasCollision).toBe(false);
    });
  });

  describe('grid calculations', () => {
    it('should calculate total rows based on tiles', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
        {
          tileName: 'favorites',
          config: { title: 'Favorites' },
          placement: { row: 5, col: 1, width: 6, height: 2 }, // Ends at row 6
        },
      ];

      component.tiles.set(tiles);

      // Should be row 6 + 2 padding = 8
      expect(component.totalRows()).toBe(8);
    });

    it('should return correct grid area string', () => {
      const tile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 6, height: 2 },
      };

      const gridArea = component.getTileGridArea(tile);

      // row-start / col-start / row-end / col-end
      // row: 1, col: 1, height: 2, width: 6
      // row-end = 1 + 2 = 3, col-end = 1 + 6 = 7
      expect(gridArea).toBe('1 / 1 / 3 / 7');
    });
  });

  describe('tile creation', () => {
    it('should create tile instance with default config', () => {
      const tileDef = mockTiles[0];
      const placement = { row: 1, col: 1, width: 6, height: 1 };

      const instance = (component as any).createTileInstance(tileDef, placement);

      expect(instance).toBeTruthy();
      expect(instance.tileName).toBe('recentDocuments');
      expect(instance.config).toEqual({ title: 'Recent Documents', limit: 10 });
      expect(instance.placement).toEqual(placement);
    });

    it('should return null if config validation fails', () => {
      const badTileDef: PageTileDefinition = {
        ...mockTiles[0],
        parseConfig: () => null, // Always fails
      };

      const placement = { row: 1, col: 1, width: 6, height: 1 };

      const instance = (component as any).createTileInstance(badTileDef, placement);

      expect(instance).toBeNull();
    });

    it('should apply default values from schema', () => {
      const tileDef: PageTileDefinition = {
        ...mockTiles[0],
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', default: 'Default Title' },
            limit: { type: 'integer', default: 20 },
            enabled: { type: 'boolean', default: true },
          },
        },
      };

      const placement = { row: 1, col: 1, width: 6, height: 1 };

      const instance = (component as any).createTileInstance(tileDef, placement);

      expect(instance.config).toEqual({
        title: 'Default Title',
        limit: 20,
        enabled: true,
      });
    });
  });

  describe('drop position calculation', () => {
    it('should find first available position for new tile', () => {
      const tileDef = mockTiles[0]; // half-width tile

      const placement = (component as any).calculateDropPosition(tileDef);

      expect(placement).toBeTruthy();
      expect(placement.row).toBe(1);
      expect(placement.col).toBe(1);
      expect(placement.width).toBe(6);
      expect(placement.height).toBe(1);
    });

    it('should skip occupied positions', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);

      const tileDef = mockTiles[1]; // Another half-width tile

      const placement = (component as any).calculateDropPosition(tileDef);

      // Should place in the right half of row 1
      expect(placement.row).toBe(1);
      expect(placement.col).toBe(7);
    });

    it('should try both left and right positions for half-width tiles', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 7, width: 6, height: 1 }, // Right side
        },
      ];

      component.tiles.set(tiles);

      const tileDef = mockTiles[1]; // Half-width tile

      const placement = (component as any).calculateDropPosition(tileDef);

      // Should place in the left half of row 1
      expect(placement.row).toBe(1);
      expect(placement.col).toBe(1);
    });

    it('should use default width from tile definition', () => {
      const tileDef = mockTiles[2]; // full-width tile (taskList)

      const placement = (component as any).calculateDropPosition(tileDef);

      expect(placement.width).toBe(12);
      expect(placement.height).toBe(2); // minHeight
    });

    it('should add to bottom if no space available', () => {
      // Fill up several rows
      const tiles: PageTileInstance[] = [];
      for (let i = 0; i < 5; i++) {
        tiles.push({
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: i + 1, col: 1, width: 12, height: 1 },
        });
      }

      component.tiles.set(tiles);

      const tileDef = mockTiles[0];
      const placement = (component as any).calculateDropPosition(tileDef);

      // Should be placed in row 6
      expect(placement.row).toBe(6);
    });
  });

  describe('UI helpers', () => {
    it('should determine if tile can be resized', () => {
      const resizableTile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 6, height: 1 },
      };

      expect(component.canResize(resizableTile)).toBe(true);
    });

    it('should return false if tile supports only one width', () => {
      const nonResizableTile: PageTileInstance = {
        tileName: 'taskList',
        config: { title: 'Tasks' },
        placement: { row: 1, col: 1, width: 12, height: 2 },
      };

      expect(component.canResize(nonResizableTile)).toBe(false);
    });

    it('should get correct resize icon based on current width', () => {
      const fullWidthTile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 12, height: 1 },
      };

      const halfWidthTile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 6, height: 1 },
      };

      expect(component.getResizeIcon(fullWidthTile)).toBe('compress');
      expect(component.getResizeIcon(halfWidthTile)).toBe('expand');
    });

    it('should get correct resize tooltip based on current width', () => {
      const fullWidthTile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 12, height: 1 },
      };

      const halfWidthTile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 6, height: 1 },
      };

      expect(component.getResizeTooltip(fullWidthTile)).toBe('Resize to half width');
      expect(component.getResizeTooltip(halfWidthTile)).toBe('Resize to full width');
    });

    it('should generate unique track keys for tiles', () => {
      const tile: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 6, height: 1 },
      };

      const key = component.trackByTileName(0, tile);

      expect(key).toBe('recentDocuments-1-1');
    });
  });

  describe('placement validation', () => {
    it('should accept valid placement', () => {
      const placement = { row: 1, col: 1, width: 6, height: 1 };

      const isValid = (component as any).isValidDropPosition(placement, -1);

      expect(isValid).toBe(true);
    });

    it('should reject placement that overflows grid', () => {
      const placement = { row: 1, col: 8, width: 6, height: 1 }; // 8 + 6 = 14 > 13

      const isValid = (component as any).isValidDropPosition(placement, -1);

      expect(isValid).toBe(false);
    });

    it('should reject placement with invalid row', () => {
      const placement = { row: 0, col: 1, width: 6, height: 1 };

      const isValid = (component as any).isValidDropPosition(placement, -1);

      expect(isValid).toBe(false);
    });

    it('should reject placement with invalid column', () => {
      const placement = { row: 1, col: 0, width: 6, height: 1 };

      const isValid = (component as any).isValidDropPosition(placement, -1);

      expect(isValid).toBe(false);
    });

    it('should reject placement that causes collision', () => {
      const tiles: PageTileInstance[] = [
        {
          tileName: 'recentDocuments',
          config: { title: 'Recent', limit: 10 },
          placement: { row: 1, col: 1, width: 6, height: 1 },
        },
      ];

      component.tiles.set(tiles);

      const placement = { row: 1, col: 1, width: 6, height: 1 };

      const isValid = (component as any).isValidDropPosition(placement, -1);

      expect(isValid).toBe(false);
    });
  });

  describe('tile definition retrieval', () => {
    it('should get definition from PageTileInstance', () => {
      const instance: PageTileInstance = {
        tileName: 'recentDocuments',
        config: { title: 'Recent', limit: 10 },
        placement: { row: 1, col: 1, width: 6, height: 1 },
      };

      const def = (component as any).getTileDefinition(instance);

      expect(def).toBeTruthy();
      expect(def.name).toBe('recentDocuments');
    });

    it('should get definition from PageTileDefinition', () => {
      const tileDef = mockTiles[0];

      const def = (component as any).getTileDefinition(tileDef);

      expect(def).toBe(tileDef);
    });

    it('should return null for unknown tile', () => {
      const instance: PageTileInstance = {
        tileName: 'unknownTile',
        config: {},
        placement: { row: 1, col: 1, width: 6, height: 1 },
      };

      const def = (component as any).getTileDefinition(instance);

      expect(def).toBeNull();
    });
  });
});
