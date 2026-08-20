import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { PageTileHostComponent } from '@agentic-ui/shared/ui';
import {
  PAGE_TILE_CATALOGUE,
  type PageConfig,
  type PageTileWidth,
  parsePageTileMountRequest,
} from '@agentic-ui/shared/agent-client';
import { DEMO_PAGE_CONFIG } from '../demo-page-config';

/**
 * Renders a saved page as a 12-column CSS Grid layout.
 *
 * Takes a page configuration (PageConfig) and mounts each tile using
 * PageTileHostComponent. The grid layout handles:
 * - 12-column grid system
 * - Explicit placement from tile.placement (row, col, width, height)
 * - Half-width (6 cols) and full-width (12 cols) tiles
 * - Error placeholders for tiles that fail to mount
 * - Responsive: stacks vertically on mobile
 * - Container queries for tile-level responsiveness
 *
 * ## Grid coordinate system
 *
 * Each tile declares its position using GridPlacement:
 * - row: 1-indexed vertical position (1 = top)
 * - col: 1-indexed horizontal position (1-12, 1 = leftmost)
 * - width: columns spanned (6 = half, 12 = full)
 * - height: rows spanned (1+)
 *
 * CSS Grid maps these to grid-row and grid-column using span values.
 *
 * ## Route binding
 *
 * The pageId input is bound via withComponentInputBinding() from the route.
 * When pageId changes, the component reloads the page config.
 *
 * For this initial implementation, we use a demo page config hardcoded in the
 * component. In a future task (#5), SavedPageService will load from Nuxeo.
 */
@Component({
  selector: 'lib-page-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    PageTileHostComponent,
  ],
  templateUrl: './page-viewer.component.html',
  styleUrl: './page-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageViewerComponent {
  readonly pageId = input<string>();

  private readonly catalogue = inject(PAGE_TILE_CATALOGUE);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pageConfig = signal<PageConfig | null>(null);

  /**
   * Mount requests for all tiles on the page, sorted by placement order.
   * Each request is either ready (with validated config) or rejected (with error).
   */
  readonly mountRequests = computed(() => {
    const config = this.pageConfig();
    if (!config) return [];

    return config.tiles.map((tile, index) => {
      const mountId = `${this.pageId()}-tile-${index}`;
      const width = this.tileWidth(tile.placement.width);
      return parsePageTileMountRequest(mountId, tile.tileName, tile.config, width, this.catalogue);
    });
  });

  /**
   * Grid style for each tile, mapping GridPlacement to CSS Grid properties.
   */
  readonly tileStyles = computed(() => {
    const config = this.pageConfig();
    if (!config) return [];

    return config.tiles.map((tile) => ({
      'grid-row': `${tile.placement.row} / span ${tile.placement.height}`,
      'grid-column': `${tile.placement.col} / span ${tile.placement.width}`,
    }));
  });

  constructor() {
    effect(() => {
      const id = this.pageId();
      if (id) {
        this.loadPage(id);
      }
    });

    // For demo purposes, load a hardcoded page if no ID is provided
    effect(() => {
      const id = this.pageId();
      if (!id) {
        this.loadDemoPage();
      }
    });
  }

  /**
   * Loads a page configuration by ID.
   *
   * TODO (Task #5): Replace with SavedPageService.getPage(pageId)
   */
  private loadPage(_pageId: string): void {
    this.loading.set(true);
    this.error.set(null);

    // For now, use the demo page regardless of ID
    // Real implementation will call SavedPageService
    setTimeout(() => {
      this.loadDemoPage();
    }, 300);
  }

  /**
   * Loads a demo page configuration for testing.
   *
   * Uses DEMO_PAGE_CONFIG which demonstrates the grid layout with:
   * - Row 1: Two half-width tiles side by side (recentDocuments, favorites)
   * - Row 3: One full-width tile (taskList)
   *
   * This demo will be replaced once actual tiles are registered in Task #4.
   * For now, it demonstrates the grid layout with placeholder tiles.
   */
  private loadDemoPage(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pageConfig.set(DEMO_PAGE_CONFIG);
    this.loading.set(false);
  }

  /**
   * Converts column width to PageTileWidth enum.
   * 6 columns = 'half', 12 columns = 'full'
   */
  private tileWidth(columns: number): PageTileWidth {
    return columns === 6 ? 'half' : 'full';
  }
}
