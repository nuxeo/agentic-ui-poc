import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDragMove,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  PAGE_TILE_CATALOGUE,
  STANDARD_PAGE_LAYOUT,
  validateGridPlacement,
  type GridPlacement,
  type PageConfig,
  type PageTileDefinition,
  type PageTileInstance,
} from '@agentic-ui/shared/agent-client';

/**
 * Drag-and-drop grid layout editor for page tiles.
 *
 * This component provides a visual editor for arranging tiles on a 12-column grid.
 * Users can:
 * - Drag tiles from a palette into the grid
 * - Reorder tiles within the grid
 * - Resize tiles between half (6 cols) and full (12 cols) width
 * - Remove tiles from the grid
 *
 * ## Grid system
 *
 * - 12 columns (standard CSS Grid)
 * - Each tile has explicit placement: row, col, width, height
 * - Half-width tiles span 6 columns (cols 1-6 or 7-12)
 * - Full-width tiles span 12 columns (cols 1-12)
 * - No auto-flow: every tile declares its exact position
 *
 * ## Drag-and-drop interactions
 *
 * 1. **Palette → Grid**: Creates a new tile instance at the drop position
 * 2. **Grid → Grid**: Moves an existing tile to a new position
 * 3. Collision detection prevents overlapping tiles
 * 4. Drop indicators show valid/invalid drop zones
 *
 * ## Real-time preview
 *
 * Tiles are rendered using PageTileHostComponent in preview mode. This shows
 * the actual tile component but in a read-only state suitable for layout editing.
 *
 * ## Output
 *
 * The component emits a `pageConfig` signal containing the current layout.
 * This is the full PageConfig object ready to be saved by SavedPageService.
 */
@Component({
  selector: 'lib-page-grid-editor',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './page-grid-editor.component.html',
  styleUrl: './page-grid-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageGridEditorComponent {
  private readonly catalogue = inject(PAGE_TILE_CATALOGUE);

  /** Initial page configuration to load into the editor */
  readonly initialConfig = input<PageConfig | null>(null);

  /** Emitted whenever the layout changes */
  readonly configChanged = output<PageConfig>();

  /** Current tiles in the grid, with their placements */
  readonly tiles = signal<PageTileInstance[]>([]);

  /** Drag state: which tile is currently being dragged */
  private readonly draggedTile = signal<{
    tile: PageTileInstance;
    fromGrid: boolean;
  } | null>(null);

  /** Drop target preview: shows where the tile will land */
  readonly dropTarget = signal<GridPlacement | null>(null);

  /** Grid layout constants */
  readonly layout = STANDARD_PAGE_LAYOUT;

  /** Total rows needed to display all tiles (for grid sizing) */
  readonly totalRows = computed(() => {
    const tilesArray = this.tiles();
    if (tilesArray.length === 0) return 6; // Minimum 6 rows for empty grid

    // Find the maximum row + height
    const maxRow = tilesArray.reduce((max, tile) => {
      const tileBottom = tile.placement.row + tile.placement.height - 1;
      return Math.max(max, tileBottom);
    }, 0);

    return Math.max(maxRow + 2, 6); // Add 2 rows padding, minimum 6
  });

  /** Array of row numbers for template iteration */
  readonly rowNumbers = computed(() => Array.from({ length: this.totalRows() }, (_, i) => i + 1));

  /** Array of column numbers for template iteration */
  readonly columnNumbers = Array.from({ length: this.layout.columns }, (_, i) => i + 1);

  constructor() {
    // Load initial configuration
    effect(() => {
      const config = this.initialConfig();
      if (config?.tiles) {
        this.tiles.set([...config.tiles]);
      }
    });

    // Emit config changes
    effect(() => {
      const tilesArray = this.tiles();
      this.configChanged.emit({ tiles: tilesArray });
    });
  }

  /**
   * Handle drop from palette or grid reordering.
   */
  onDrop(event: CdkDragDrop<any, any, any>): void {
    const placement = this.dropTarget();
    if (!placement) return;

    // Clear drop target
    this.dropTarget.set(null);

    if (event.previousContainer === event.container) {
      // Reorder within grid
      const tiles = [...this.tiles()];
      moveItemInArray(tiles, event.previousIndex, event.currentIndex);
      // Update placement of moved tile
      tiles[event.currentIndex] = {
        ...tiles[event.currentIndex],
        placement,
      };
      this.tiles.set(tiles);
    } else {
      // Drop from palette
      const tileDef = event.item.data as any as PageTileDefinition;
      const newTile = this.createTileInstance(tileDef, placement);
      if (newTile) {
        this.tiles.set([...this.tiles(), newTile]);
      }
    }
  }

  /**
   * Handle drag enter to show drop target preview.
   */
  onDragEnter(event: CdkDragEnter<any>): void {
    // Calculate drop position from current drag position
    const dragData = event.item.data as any;
    if (!dragData) return;

    // For now, use a simple heuristic: drop at the first available row
    const placement = this.calculateDropPosition(dragData);
    this.dropTarget.set(placement);
  }

  /**
   * Handle drag move to update drop target preview.
   */
  onDragMove(event: CdkDragMove): void {
    // Update drop target based on current mouse position
    const dragData = event.source.data as any;
    if (!dragData) return;

    const placement = this.calculateDropPosition(dragData);
    this.dropTarget.set(placement);
  }

  /**
   * Handle drag exit to clear drop target preview.
   */
  onDragExit(): void {
    this.dropTarget.set(null);
  }

  /**
   * Remove a tile from the grid.
   */
  removeTile(index: number): void {
    const tiles = [...this.tiles()];
    tiles.splice(index, 1);
    this.tiles.set(tiles);
  }

  /**
   * Resize a tile between half and full width.
   */
  resizeTile(index: number): void {
    const tiles = [...this.tiles()];
    const tile = tiles[index];
    const tileDef = this.catalogue.get(tile.tileName);
    if (!tileDef) return;

    // Toggle between half (6 cols) and full (12 cols)
    const currentWidth = tile.placement.width;
    const newWidth = currentWidth === 12 ? 6 : 12;

    // Check if new width is supported
    const newWidthType = newWidth === 6 ? 'half' : 'full';
    if (!tileDef.supportedWidths.includes(newWidthType)) {
      return; // Cannot resize to unsupported width
    }

    // Update placement
    const newPlacement: GridPlacement = {
      ...tile.placement,
      width: newWidth,
      // If switching to full width, move to col 1
      col: newWidth === 12 ? 1 : tile.placement.col,
    };

    // Validate new placement
    const validation = validateGridPlacement(newPlacement);
    if (!validation.valid) return;

    // Check for collisions with other tiles
    if (this.hasCollision(newPlacement, index)) {
      return; // Cannot resize due to collision
    }

    tiles[index] = { ...tile, placement: newPlacement };
    this.tiles.set(tiles);
  }

  /**
   * Calculate where to drop a tile based on current drag position.
   */
  private calculateDropPosition(
    dragData: PageTileDefinition | PageTileInstance,
  ): GridPlacement | null {
    const tileDef = this.getTileDefinition(dragData);
    if (!tileDef) return null;

    // Find first available row where tile fits
    const width = tileDef.defaultWidth === 'half' ? 6 : 12;
    const height = tileDef.minHeight ?? 1;

    // Try each row until we find one without collision
    for (let row = 1; row <= this.totalRows() + 5; row++) {
      // Try left side (col 1) first
      const placement1: GridPlacement = { row, col: 1, width, height };
      if (this.isValidDropPosition(placement1, -1)) {
        return placement1;
      }

      // For half-width, also try right side (col 7)
      if (width === 6) {
        const placement2: GridPlacement = { row, col: 7, width, height };
        if (this.isValidDropPosition(placement2, -1)) {
          return placement2;
        }
      }
    }

    // Fallback: add at bottom
    const nextRow = this.totalRows() + 1;
    return { row: nextRow, col: 1, width, height };
  }

  /**
   * Create a new tile instance from a tile definition.
   */
  private createTileInstance(
    tileDef: PageTileDefinition,
    placement: GridPlacement,
  ): PageTileInstance | null {
    // Create default config
    const defaultConfig: Record<string, unknown> = {};

    // Apply defaults from schema
    if (tileDef.configSchema.properties) {
      for (const [key, prop] of Object.entries(tileDef.configSchema.properties)) {
        const propObj = prop as Record<string, unknown>;
        if ('default' in propObj) {
          defaultConfig[key] = propObj['default'];
        }
      }
    }

    // Validate config
    let validatedConfig;
    try {
      validatedConfig = tileDef.parseConfig(defaultConfig);
    } catch {
      return null;
    }

    if (!validatedConfig) return null;

    return {
      tileName: tileDef.name,
      config: validatedConfig,
      placement,
    };
  }

  /**
   * Get tile definition from drag data (could be definition or instance).
   */
  private getTileDefinition(
    data: PageTileDefinition | PageTileInstance,
  ): PageTileDefinition | null {
    if ('tileName' in data) {
      // It's a PageTileInstance
      return this.catalogue.get(data.tileName) ?? null;
    } else {
      // It's a PageTileDefinition
      return data;
    }
  }

  /**
   * Check if a placement is valid for dropping.
   */
  private isValidDropPosition(placement: GridPlacement, excludeIndex: number): boolean {
    // Validate placement itself
    const validation = validateGridPlacement(placement);
    if (!validation.valid) return false;

    // Check for collisions
    return !this.hasCollision(placement, excludeIndex);
  }

  /**
   * Check if a placement collides with any existing tile.
   */
  private hasCollision(placement: GridPlacement, excludeIndex: number): boolean {
    const tiles = this.tiles();

    for (let i = 0; i < tiles.length; i++) {
      if (i === excludeIndex) continue; // Skip the tile being moved

      const other = tiles[i].placement;

      // Check for overlap
      const horizontalOverlap =
        placement.col < other.col + other.width && other.col < placement.col + placement.width;

      const verticalOverlap =
        placement.row < other.row + other.height && other.row < placement.row + placement.height;

      if (horizontalOverlap && verticalOverlap) {
        return true; // Collision detected
      }
    }

    return false;
  }

  /**
   * Get CSS grid area for a tile.
   */
  getTileGridArea(tile: PageTileInstance): string {
    const p = tile.placement;
    // CSS Grid area: row-start / col-start / row-end / col-end
    return `${p.row} / ${p.col} / ${p.row + p.height} / ${p.col + p.width}`;
  }

  /**
   * Track function for tile list.
   */
  trackByTileName(_index: number, tile: PageTileInstance): string {
    return `${tile.tileName}-${tile.placement.row}-${tile.placement.col}`;
  }

  /**
   * Can this tile be resized?
   */
  canResize(tile: PageTileInstance): boolean {
    const tileDef = this.catalogue.get(tile.tileName);
    if (!tileDef) return false;
    // Can resize if supports both half and full
    return tileDef.supportedWidths.length > 1;
  }

  /**
   * Get resize icon based on current width.
   */
  getResizeIcon(tile: PageTileInstance): string {
    return tile.placement.width === 12 ? 'compress' : 'expand';
  }

  /**
   * Get resize tooltip based on current width.
   */
  getResizeTooltip(tile: PageTileInstance): string {
    return tile.placement.width === 12 ? 'Resize to half width' : 'Resize to full width';
  }
}
