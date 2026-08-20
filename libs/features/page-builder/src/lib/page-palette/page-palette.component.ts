import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { PAGE_TILE_CATALOGUE, type PageTileDefinition } from '@agentic-ui/shared/agent-client';

/**
 * Displays all registered page tiles in a searchable grid.
 *
 * This is the palette users browse when adding tiles to their page. Each tile
 * shows its icon, display name, and description. Clicking a tile emits a
 * selection event for the parent page builder to handle.
 *
 * ## Filtering
 *
 * The search input filters tiles by name (case-insensitive substring match).
 * The filter is debounced by Angular's signal reactivity — no manual debouncing
 * needed since we're just computing over a static array.
 *
 * ## Layout
 *
 * Responsive grid:
 * - 1 column on mobile (<600px)
 * - 2 columns on tablet (600-959px)
 * - 3 columns on desktop (≥960px)
 *
 * ## Empty state
 *
 * If no tiles are registered (unlikely in production), shows a message.
 * If search returns no results, shows "No tiles match your search."
 */
@Component({
  selector: 'lib-page-palette',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDrag,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './page-palette.component.html',
  styleUrl: './page-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePaletteComponent {
  private readonly catalogue = inject(PAGE_TILE_CATALOGUE);

  /** All registered tiles, for display */
  private readonly allTiles = signal<readonly PageTileDefinition[]>(this.catalogue.all());

  /** Search query entered by the user */
  readonly searchQuery = signal('');

  /** Tiles matching the current search query */
  readonly filteredTiles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.allTiles();
    }
    return this.allTiles().filter(
      (tile) =>
        tile.displayName.toLowerCase().includes(query) ||
        tile.description.toLowerCase().includes(query),
    );
  });

  /** Whether we have any tiles registered at all */
  readonly hasTiles = computed(() => this.allTiles().length > 0);

  /** Whether the search returned no results */
  readonly noResults = computed(() => {
    return this.hasTiles() && this.filteredTiles().length === 0;
  });

  /** Emitted when user clicks a tile to add it to their page */
  readonly tileSelected = output<PageTileDefinition>();

  /**
   * User clicked a tile. Emit the selection event.
   */
  selectTile(tile: PageTileDefinition): void {
    this.tileSelected.emit(tile);
  }

  /**
   * Track function for @for loop to avoid re-rendering all tiles on filter change.
   */
  trackByName(_index: number, tile: PageTileDefinition): string {
    return tile.name;
  }
}
