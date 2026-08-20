import { Injectable } from '@angular/core';
import type { PageTileConfig, PageTileDefinition } from './page-tile';

/**
 * Page Builder: Layout and configuration model for user-composed pages.
 *
 * This module defines the schema for page layouts built on a 12-column grid system.
 * Pages are composed of tiles arranged in rows, where each tile occupies a defined
 * area of the grid. The grid system provides:
 *
 * - **12-column layout**: Standard responsive grid, where columns are the horizontal
 *   unit. Half-width tiles span 6 columns; full-width tiles span 12.
 * - **Row-based vertical stacking**: Tiles are placed in rows (1-indexed), and each
 *   tile declares its height in grid rows. No overlap is permitted.
 * - **Explicit placement**: Every tile declares its exact position (row, col) and
 *   size (width, height). No auto-flow; the page author controls the layout.
 *
 * ## Grid coordinate system
 *
 * - **Columns**: 1-12, left to right. Col 1 is the leftmost column.
 * - **Rows**: 1-indexed, top to bottom. Row 1 is the top of the page.
 * - **Width**: number of columns spanned (1-12). Tiles wider than 12 are rejected.
 * - **Height**: number of rows spanned (1+). Most tiles are 1-2 rows tall.
 *
 * ## Placement validation rules
 *
 * 1. **No overflow**: A tile starting at col C with width W must satisfy C + W <= 13
 *    (i.e., the tile must end at or before the 12th column boundary).
 * 2. **No overlap**: Two tiles cannot occupy the same grid cell. The validator checks
 *    every pair to ensure their bounding boxes do not intersect.
 * 3. **Gap tolerance**: Empty grid cells are permitted. A page with one tile in row 1
 *    and another in row 5 is valid (rows 2-4 are empty).
 * 4. **Width consistency**: Each tile's width in the placement must match one of its
 *    supportedWidths. A tile that only supports 'full' cannot be placed at width=6.
 *
 * ## Example layout
 *
 * ```
 * Row 1: [Tile A: half-width, cols 1-6] [Tile B: half-width, cols 7-12]
 * Row 2: [Tile C: full-width, cols 1-12]
 * Row 3: [Tile D: half-width, cols 1-6] (cols 7-12 empty)
 * ```
 *
 * Stored as:
 * ```typescript
 * {
 *   tiles: [
 *     { tileName: 'recentDocuments', config: {...}, placement: { row: 1, col: 1, width: 6, height: 1 } },
 *     { tileName: 'favorites', config: {...}, placement: { row: 1, col: 7, width: 6, height: 1 } },
 *     { tileName: 'taskList', config: {...}, placement: { row: 2, col: 1, width: 12, height: 2 } },
 *     { tileName: 'searchResults', config: {...}, placement: { row: 3, col: 1, width: 6, height: 1 } }
 *   ]
 * }
 * ```
 *
 * ## Migration from width-only layouts
 *
 * Earlier versions of the page builder stored only width ('half' | 'full') and
 * auto-flowed tiles into rows. This module requires explicit placement for every tile.
 * When loading a legacy page:
 * 1. Assign row numbers in document order (first tile → row 1, next → row 2, etc.)
 * 2. For half-width tiles, alternate col 1 and col 7 to pack pairs into rows
 * 3. For full-width tiles, assign col 1 and width 12
 *
 * See `docs/page-builder-migration.md` for the full upgrade procedure.
 */

/**
 * Placement of one tile in the 12-column grid.
 *
 * Every tile must declare its exact position and size. No auto-flow; no defaults.
 */
export interface GridPlacement {
  /**
   * Row number (1-indexed). Row 1 is the top of the page.
   * Must be >= 1.
   */
  readonly row: number;

  /**
   * Starting column (1-indexed, 1-12). Col 1 is the leftmost column.
   * Must be >= 1 and <= 12.
   */
  readonly col: number;

  /**
   * Width in columns (1-12).
   * Common values: 6 (half), 12 (full).
   * Must satisfy: col + width <= 13 (i.e., tile ends at or before col 12 boundary).
   */
  readonly width: number;

  /**
   * Height in rows (1+).
   * Most tiles are 1-2 rows tall. Tall tiles (charts, detailed lists) may be 3-4.
   * Must be >= 1.
   */
  readonly height: number;
}

/**
 * One tile instance on a page, with its configuration and placement.
 *
 * This is the stored representation. When rendering, the page loader validates the
 * config against the tile's schema and the placement against grid rules before
 * mounting the component.
 */
export interface PageTileInstance {
  /**
   * Name of the tile from the catalogue (e.g., 'recentDocuments', 'favorites').
   * If the tile is no longer registered (removed on upgrade), the page renders with
   * a placeholder explaining which tile is missing.
   */
  readonly tileName: string;

  /**
   * Tile-specific configuration, validated by the tile's parseConfig function.
   * Shape varies by tile: may include title, query, limits, display options.
   */
  readonly config: PageTileConfig;

  /**
   * Where and how large this tile is on the grid.
   */
  readonly placement: GridPlacement;
}

/**
 * One user-composed page.
 *
 * Stored in the user's Nuxeo profile or in a shared document (for team pages).
 * The validator ensures that all tiles fit on the grid without overlap before
 * the page is saved or rendered.
 */
export interface PageConfig {
  /**
   * Tiles on this page, in author-defined order.
   *
   * The order matters for screen readers and for tab navigation, but not for visual
   * layout (placement.row and placement.col control that). Best practice: sort by
   * row, then by col, so the visual order matches the DOM order.
   */
  readonly tiles: readonly PageTileInstance[];

  /**
   * Optional metadata for the page itself (not yet used, reserved for future).
   * May include: page title, description, sharing ACL, theme overrides.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Layout constraints for the page builder grid.
 *
 * These constants define the grid system's dimensions and limits.
 */
export interface PageLayout {
  /**
   * Number of columns in the grid (always 12).
   *
   * This is a CSS Grid constant. The page builder UI and the validator both
   * reference this value to ensure tiles fit within the grid.
   */
  readonly columns: 12;

  /**
   * Maximum number of tiles per page.
   *
   * A cap to prevent pages from becoming too slow to render or edit. Most real
   * pages have 3-8 tiles; this limit is set high enough to never be reached in
   * legitimate use, while still bounding the worst-case cost.
   */
  readonly maxTiles: number;

  /**
   * Maximum height in rows that a single tile may span.
   *
   * Prevents a single tile from dominating the page. Most tiles are 1-2 rows;
   * this cap allows for tall charts or detailed lists without permitting a
   * single tile to span 50+ rows.
   */
  readonly maxTileHeight: number;
}

/**
 * Standard layout for the page builder.
 *
 * 12 columns (per CSS Grid conventions), up to 50 tiles per page, and tiles may
 * be up to 10 rows tall. These constants are exposed so the page builder UI and
 * the validator use the same limits.
 */
export const STANDARD_PAGE_LAYOUT: PageLayout = {
  columns: 12,
  maxTiles: 50,
  maxTileHeight: 10,
};

/**
 * Why a page configuration was rejected.
 *
 * Returned by the validator when a page cannot be loaded or saved. The reason is
 * shown to the user in the page builder UI so they can fix the issue.
 */
export type PageConfigValidationError =
  | 'too-many-tiles' // More than maxTiles
  | 'unknown-tile' // Tile not in catalogue
  | 'invalid-config' // Tile config doesn't match schema
  | 'invalid-placement' // Placement violates grid rules (out of bounds, overlap, etc.)
  | 'unsupported-width' // Tile doesn't support the requested width
  | 'invalid-structure'; // Page object malformed (not an object, tiles not an array, etc.)

/**
 * Result of validating a page configuration.
 *
 * Either `{ valid: true }` or `{ valid: false, error, details }`. The validator
 * stops at the first error rather than collecting all errors, because the page
 * cannot be loaded or saved until the first error is fixed.
 */
export type PageConfigValidationResult =
  | { readonly valid: true }
  | {
      readonly valid: false;
      readonly error: PageConfigValidationError;
      /**
       * Human-readable explanation of what's wrong, for display in the UI.
       * Example: "Tile 'recentDocuments' at row 2 col 8 (width 6) overflows the grid."
       */
      readonly details: string;
    };

/**
 * Validates page configurations against the grid rules and tile schemas.
 *
 * Used by the page loader before rendering and by the page builder before saving.
 * Validation is strict: any violation of grid rules, any unknown tile, or any
 * invalid config results in rejection.
 *
 * ## Usage
 *
 * ```typescript
 * const validator = inject(PageConfigValidator);
 * const catalogue = inject(PAGE_TILE_CATALOGUE);
 * const result = validator.validate(pageConfig, catalogue);
 *
 * if (!result.valid) {
 *   console.error(result.error, result.details);
 *   // Show error in UI, do not render the page
 * }
 * ```
 *
 * The validator is stateless and injectable for testing. It does not depend on
 * any HTTP client or DOM API.
 */
@Injectable({ providedIn: 'root' })
export class PageConfigValidator {
  /**
   * Validates a page configuration.
   *
   * Checks:
   * 1. Structure: page is an object, tiles is an array, within maxTiles limit
   * 2. Every tile: known in catalogue, valid config, valid placement
   * 3. No overlaps: every pair of tiles has disjoint bounding boxes
   * 4. Width consistency: each tile's width matches its supportedWidths
   *
   * Returns the first error encountered, or { valid: true } if all checks pass.
   */
  validate(
    page: unknown,
    catalogue: { get(name: string): PageTileDefinition | undefined },
    layout: PageLayout = STANDARD_PAGE_LAYOUT,
  ): PageConfigValidationResult {
    // 1. Structure validation
    if (!isRecord(page)) {
      return { valid: false, error: 'invalid-structure', details: 'Page must be an object.' };
    }

    const tiles = page['tiles'];
    if (!Array.isArray(tiles)) {
      return {
        valid: false,
        error: 'invalid-structure',
        details: 'Page.tiles must be an array.',
      };
    }

    if (tiles.length > layout.maxTiles) {
      return {
        valid: false,
        error: 'too-many-tiles',
        details: `Page has ${tiles.length} tiles; maximum is ${layout.maxTiles}.`,
      };
    }

    // 2. Validate each tile
    const validatedTiles: Array<{
      tileName: string;
      placement: GridPlacement;
      definition: PageTileDefinition;
    }> = [];

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      if (!isRecord(tile)) {
        return {
          valid: false,
          error: 'invalid-structure',
          details: `Tile at index ${i} is not an object.`,
        };
      }

      const tileName = tile['tileName'];
      if (typeof tileName !== 'string') {
        return {
          valid: false,
          error: 'invalid-structure',
          details: `Tile at index ${i} has no tileName (or tileName is not a string).`,
        };
      }

      const definition = catalogue.get(tileName);
      if (!definition) {
        return {
          valid: false,
          error: 'unknown-tile',
          details: `Tile '${tileName}' (index ${i}) is not registered in the catalogue.`,
        };
      }

      // Validate config
      const config = tile['config'];
      if (!isRecord(config)) {
        return {
          valid: false,
          error: 'invalid-config',
          details: `Tile '${tileName}' (index ${i}) has invalid config (not an object).`,
        };
      }

      let validatedConfig: PageTileConfig | null;
      try {
        validatedConfig = definition.parseConfig(config);
      } catch (err) {
        return {
          valid: false,
          error: 'invalid-config',
          details: `Tile '${tileName}' (index ${i}) config validation threw: ${err}`,
        };
      }

      if (!validatedConfig) {
        return {
          valid: false,
          error: 'invalid-config',
          details: `Tile '${tileName}' (index ${i}) config does not match schema.`,
        };
      }

      // Validate placement
      const placement = tile['placement'];
      const placementResult = this.validatePlacement(placement, tileName, i, layout);
      if (!placementResult.valid) {
        return placementResult;
      }

      const validPlacement = placement as GridPlacement;

      // Check width is supported
      const widthInColumns = validPlacement.width;
      const supportedWidths = definition.supportedWidths;

      // Convert column width to PageTileWidth ('half' | 'full')
      let requestedWidth: 'half' | 'full' | 'unsupported';
      if (widthInColumns === 6) {
        requestedWidth = 'half';
      } else if (widthInColumns === 12) {
        requestedWidth = 'full';
      } else {
        // For now, only 6 (half) and 12 (full) are standard. Other widths are custom.
        // If a tile supports custom widths, this would need to check differently.
        // For now, reject non-standard widths unless we add more width types.
        requestedWidth = 'unsupported';
      }

      if (
        requestedWidth === 'unsupported' ||
        !supportedWidths.includes(requestedWidth as 'half' | 'full')
      ) {
        return {
          valid: false,
          error: 'unsupported-width',
          details: `Tile '${tileName}' (index ${i}) does not support width=${widthInColumns} columns. Supported: ${supportedWidths.join(', ')}.`,
        };
      }

      // Check minHeight constraint if defined
      const minHeight = definition.minHeight ?? 1;
      if (validPlacement.height < minHeight) {
        return {
          valid: false,
          error: 'invalid-placement',
          details: `Tile '${tileName}' (index ${i}) has height ${validPlacement.height} but requires minimum ${minHeight}.`,
        };
      }

      validatedTiles.push({ tileName, placement: validPlacement, definition });
    }

    // 3. Check for overlaps
    for (let i = 0; i < validatedTiles.length; i++) {
      for (let j = i + 1; j < validatedTiles.length; j++) {
        const tileA = validatedTiles[i];
        const tileB = validatedTiles[j];

        if (this.placementsOverlap(tileA.placement, tileB.placement)) {
          return {
            valid: false,
            error: 'invalid-placement',
            details: `Tiles '${tileA.tileName}' and '${tileB.tileName}' overlap on the grid.`,
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Validates one placement object.
   *
   * Checks that row, col, width, height are all positive integers and that the
   * tile fits within the grid (no overflow).
   */
  private validatePlacement(
    placement: unknown,
    tileName: string,
    index: number,
    layout: PageLayout,
  ): PageConfigValidationResult {
    if (!isRecord(placement)) {
      return {
        valid: false,
        error: 'invalid-placement',
        details: `Tile '${tileName}' (index ${index}) has invalid placement (not an object).`,
      };
    }

    const row = placement['row'];
    const col = placement['col'];
    const width = placement['width'];
    const height = placement['height'];

    if (!isPositiveInt(row)) {
      return {
        valid: false,
        error: 'invalid-placement',
        details: `Tile '${tileName}' (index ${index}) has invalid row (must be a positive integer).`,
      };
    }

    if (!isPositiveInt(col) || col > layout.columns) {
      return {
        valid: false,
        error: 'invalid-placement',
        details: `Tile '${tileName}' (index ${index}) has invalid col (must be 1-${layout.columns}).`,
      };
    }

    if (!isPositiveInt(width)) {
      return {
        valid: false,
        error: 'invalid-placement',
        details: `Tile '${tileName}' (index ${index}) has invalid width (must be a positive integer).`,
      };
    }

    if (!isPositiveInt(height) || height > layout.maxTileHeight) {
      return {
        valid: false,
        error: 'invalid-placement',
        details: `Tile '${tileName}' (index ${index}) has invalid height (must be 1-${layout.maxTileHeight}).`,
      };
    }

    // Check tile fits horizontally: col + width <= columns + 1
    // (col 1 width 12 means columns 1-12, ending at 12, which is col + width = 13)
    if (col + width > layout.columns + 1) {
      return {
        valid: false,
        error: 'invalid-placement',
        details: `Tile '${tileName}' (index ${index}) at col ${col} width ${width} overflows the grid (columns 1-${layout.columns}).`,
      };
    }

    return { valid: true };
  }

  /**
   * Checks if two placements overlap on the grid.
   *
   * Two rectangles overlap if their projections on both axes intersect. For the
   * horizontal axis: [colA, colA+widthA) intersects [colB, colB+widthB) iff
   * colA < colB + widthB AND colB < colA + widthA. Same logic for vertical.
   */
  private placementsOverlap(a: GridPlacement, b: GridPlacement): boolean {
    // Horizontal overlap: a.col < b.col + b.width AND b.col < a.col + a.width
    const horizontalOverlap = a.col < b.col + b.width && b.col < a.col + a.width;

    // Vertical overlap: a.row < b.row + b.height AND b.row < a.row + a.height
    const verticalOverlap = a.row < b.row + b.height && b.row < a.row + a.height;

    return horizontalOverlap && verticalOverlap;
  }
}

/**
 * Type guard for plain objects (not null, not array).
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for positive integers.
 */
function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

/**
 * Validates a grid placement against the standard layout rules.
 *
 * Utility function for validating a single placement without a full page context.
 * Useful when building the page builder UI (e.g., validating a drag-drop target).
 */
export function validateGridPlacement(
  placement: GridPlacement,
  layout: PageLayout = STANDARD_PAGE_LAYOUT,
): { valid: true } | { valid: false; reason: string } {
  if (!isPositiveInt(placement.row)) {
    return { valid: false, reason: 'Row must be a positive integer.' };
  }

  if (!isPositiveInt(placement.col) || placement.col > layout.columns) {
    return { valid: false, reason: `Col must be 1-${layout.columns}.` };
  }

  if (!isPositiveInt(placement.width)) {
    return { valid: false, reason: 'Width must be a positive integer.' };
  }

  if (!isPositiveInt(placement.height) || placement.height > layout.maxTileHeight) {
    return { valid: false, reason: `Height must be 1-${layout.maxTileHeight}.` };
  }

  if (placement.col + placement.width > layout.columns + 1) {
    return {
      valid: false,
      reason: `Placement at col ${placement.col} width ${placement.width} overflows the grid.`,
    };
  }

  return { valid: true };
}
