import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TileConfigFormComponent } from './tile-config-form.component';
import type { PageTileDefinition, PageTileConfig } from '@agentic-ui/shared/agent-client';

describe('TileConfigFormComponent', () => {
  let fixture: ComponentFixture<TileConfigFormComponent>;
  let component: TileConfigFormComponent;

  // Mock tile definitions for testing
  const mockSimpleTile: PageTileDefinition = {
    name: 'testTile',
    displayName: 'Test Tile',
    description: 'A test tile',
    icon: 'dashboard',
    defaultWidth: 'half',
    supportedWidths: ['half', 'full'],
    configSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          maxLength: 128,
          description: 'Tile title',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          default: 10,
          description: 'Max items to show',
        },
      },
      required: ['title'],
    },
    parseConfig: (config: Record<string, unknown>) => {
      if (typeof config['title'] !== 'string' || config['title'].length === 0) {
        return null;
      }
      const limit = typeof config['limit'] === 'number' ? config['limit'] : 10;
      return { title: config['title'], limit } as PageTileConfig;
    },
    load: () => Promise.resolve({} as never),
    inputs: (config: PageTileConfig) => config,
    version: 1,
  };

  const mockEnumTile: PageTileDefinition = {
    name: 'enumTile',
    displayName: 'Enum Test Tile',
    description: 'Tests enum fields',
    icon: 'list',
    defaultWidth: 'half',
    supportedWidths: ['half', 'full'],
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'pending'],
          description: 'Status filter',
        },
        enabled: {
          type: 'boolean',
          default: true,
        },
      },
      required: ['title', 'status'],
    },
    parseConfig: (config: Record<string, unknown>) => {
      if (typeof config['title'] !== 'string') return null;
      if (!['active', 'inactive', 'pending'].includes(config['status'] as string)) return null;
      return config as PageTileConfig;
    },
    load: () => Promise.resolve({} as never),
    inputs: (config: PageTileConfig) => config,
    version: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileConfigFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TileConfigFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Field parsing', () => {
    it('should parse string and integer fields from schema', () => {
      fixture.componentRef.setInput('tile', mockSimpleTile);
      fixture.detectChanges();

      const fields = component.fields();
      expect(fields.length).toBe(2);

      const titleField = fields.find((f) => f.key === 'title');
      expect(titleField).toBeDefined();
      expect(titleField?.type).toBe('string');
      expect(titleField?.required).toBe(true);
      expect(titleField?.maxLength).toBe(128);
      expect(titleField?.description).toBe('Tile title');

      const limitField = fields.find((f) => f.key === 'limit');
      expect(limitField).toBeDefined();
      expect(limitField?.type).toBe('integer');
      expect(limitField?.required).toBe(false);
      expect(limitField?.min).toBe(1);
      expect(limitField?.max).toBe(50);
      expect(limitField?.default).toBe(10);
    });

    it('should parse enum and boolean fields from schema', () => {
      fixture.componentRef.setInput('tile', mockEnumTile);
      fixture.detectChanges();

      const fields = component.fields();
      expect(fields.length).toBe(3);

      const statusField = fields.find((f) => f.key === 'status');
      expect(statusField).toBeDefined();
      expect(statusField?.type).toBe('enum');
      expect(statusField?.enumValues).toEqual(['active', 'inactive', 'pending']);

      const enabledField = fields.find((f) => f.key === 'enabled');
      expect(enabledField).toBeDefined();
      expect(enabledField?.type).toBe('boolean');
      expect(enabledField?.default).toBe(true);
    });
  });

  describe('Integration with existing tile schemas', () => {
    it('should handle recently-edited tile schema', () => {
      const recentlyEditedTile: PageTileDefinition = {
        name: 'recentlyEdited',
        displayName: 'Recently Edited',
        description: 'Recent documents',
        icon: 'schedule',
        defaultWidth: 'full',
        supportedWidths: ['half', 'full'],
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 128 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['title'],
        },
        parseConfig: (config: Record<string, unknown>) => {
          if (typeof config['title'] !== 'string') return null;
          return config as PageTileConfig;
        },
        load: () => Promise.resolve({} as never),
        inputs: (config: PageTileConfig) => config,
        version: 1,
      };

      fixture.componentRef.setInput('tile', recentlyEditedTile);
      fixture.detectChanges();

      const fields = component.fields();
      expect(fields.length).toBe(2);
      expect(fields.find((f) => f.key === 'title')).toBeDefined();
      expect(fields.find((f) => f.key === 'limit')).toBeDefined();
    });

    it('should handle favorites tile schema', () => {
      const favoritesTile: PageTileDefinition = {
        name: 'favorites',
        displayName: 'Favorites',
        description: 'Favorited docs',
        icon: 'star',
        defaultWidth: 'half',
        supportedWidths: ['half', 'full'],
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 128 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['title'],
        },
        parseConfig: (config: Record<string, unknown>) => config as PageTileConfig,
        load: () => Promise.resolve({} as never),
        inputs: (config: PageTileConfig) => config,
        version: 1,
      };

      fixture.componentRef.setInput('tile', favoritesTile);
      fixture.detectChanges();

      const fields = component.fields();
      expect(fields.length).toBe(2);
      expect(fields.find((f) => f.key === 'title')).toBeDefined();
      expect(fields.find((f) => f.key === 'limit')).toBeDefined();
    });

    it('should handle tasks-list tile schema', () => {
      const tasksListTile: PageTileDefinition = {
        name: 'tasksList',
        displayName: 'My Tasks',
        description: 'Your tasks',
        icon: 'task_alt',
        defaultWidth: 'half',
        supportedWidths: ['half', 'full'],
        configSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 128, default: 'My Tasks' },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
          required: ['title'],
        },
        parseConfig: (config: Record<string, unknown>) => config as PageTileConfig,
        load: () => Promise.resolve({} as never),
        inputs: (config: PageTileConfig) => config,
        version: 1,
      };

      fixture.componentRef.setInput('tile', tasksListTile);
      fixture.detectChanges();

      const fields = component.fields();
      expect(fields.length).toBe(2);
      expect(fields.find((f) => f.key === 'title')?.default).toBe('My Tasks');
      expect(fields.find((f) => f.key === 'limit')?.default).toBe(10);
    });
  });

  describe('Schema validation', () => {
    it('should identify required fields', () => {
      fixture.componentRef.setInput('tile', mockSimpleTile);
      fixture.detectChanges();

      const fields = component.fields();
      const titleField = fields.find((f) => f.key === 'title');
      const limitField = fields.find((f) => f.key === 'limit');

      expect(titleField?.required).toBe(true);
      expect(limitField?.required).toBe(false);
    });

    it('should extract field descriptions for hints', () => {
      fixture.componentRef.setInput('tile', mockSimpleTile);
      fixture.detectChanges();

      const fields = component.fields();
      const titleField = fields.find((f) => f.key === 'title');
      const limitField = fields.find((f) => f.key === 'limit');

      expect(titleField?.description).toBe('Tile title');
      expect(limitField?.description).toBe('Max items to show');
    });

    it('should extract min/max constraints', () => {
      fixture.componentRef.setInput('tile', mockSimpleTile);
      fixture.detectChanges();

      const fields = component.fields();
      const limitField = fields.find((f) => f.key === 'limit');

      expect(limitField?.min).toBe(1);
      expect(limitField?.max).toBe(50);
    });
  });
});
