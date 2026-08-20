import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PageTileHostComponent } from '@agentic-ui/shared/ui';
import {
  PAGE_TILE_CATALOGUE,
  type PageConfig,
  type PageTileWidth,
  parsePageTileMountRequest,
} from '@agentic-ui/shared/agent-client';

export interface PagePreviewDialogData {
  config: PageConfig;
}

/**
 * Dialog for previewing a page configuration before saving.
 *
 * Renders the page config in a read-only mode without edit controls.
 * Uses the same grid layout as PageViewerComponent.
 */
@Component({
  selector: 'lib-page-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageTileHostComponent,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>visibility</mat-icon>
      Page Preview
    </h2>
    <mat-dialog-content>
      @if (data.config.tiles.length === 0) {
        <div class="empty-state">
          <mat-icon>dashboard</mat-icon>
          <p>No tiles to preview</p>
        </div>
      } @else {
        <div class="page-grid">
          @for (tile of data.config.tiles; track tile.tileName; let i = $index) {
            <div class="tile-container" [ngStyle]="getTileStyle(tile)">
              <lib-page-tile-host [request]="getMountRequest(tile, i)" />
            </div>
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      mat-dialog-content {
        min-height: 400px;
        max-height: 70vh;
        overflow-y: auto;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          opacity: 0.3;
        }

        p {
          margin: 1rem 0 0;
          color: var(--mat-sys-on-surface-variant);
        }
      }

      .page-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1rem;
        padding: 1rem;
      }

      .tile-container {
        min-height: 200px;
      }
    `,
  ],
})
export class PagePreviewDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PagePreviewDialogComponent>);
  readonly data = inject<PagePreviewDialogData>(MAT_DIALOG_DATA);
  private readonly catalogue = inject(PAGE_TILE_CATALOGUE);

  close(): void {
    this.dialogRef.close();
  }

  getMountRequest(tile: PageConfig['tiles'][number], index: number) {
    const mountId = `preview-tile-${index}`;
    const width = this.tileWidth(tile.placement.width);
    return parsePageTileMountRequest(mountId, tile.tileName, tile.config, width, this.catalogue);
  }

  getTileStyle(tile: PageConfig['tiles'][number]) {
    const p = tile.placement;
    return {
      'grid-row': `${p.row} / span ${p.height}`,
      'grid-column': `${p.col} / span ${p.width}`,
    };
  }

  private tileWidth(columns: number): PageTileWidth {
    return columns === 6 ? 'half' : 'full';
  }
}
