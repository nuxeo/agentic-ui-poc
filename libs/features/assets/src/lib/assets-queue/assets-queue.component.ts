import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import {
  AssetAggregationService,
  DocumentDetailService,
  type AssetQueueItem,
} from '@agentic-ui/shared/nuxeo-client';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'lib-assets-queue',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './assets-queue.component.html',
  styleUrl: './assets-queue.component.scss',
})
export class AssetsQueueComponent {
  private readonly assetAggregationService = inject(AssetAggregationService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly items = computed(() => this.assetAggregationService.items());
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});
  readonly selectedItemId = input<string>('');
  readonly itemSelected = output<AssetQueueItem>();

  constructor() {
    effect(() => {
      const queueItems = this.items();
      for (const item of queueItems) {
        if (this.thumbnailMap()[item.id]) continue;
        this.detailService.fetchThumbnail(item.id)
          .pipe(catchError(() => of(null)))
          .subscribe((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            this.thumbnailMap.update((current) => ({
              ...current,
              [item.id]: this.sanitizer.bypassSecurityTrustUrl(url),
            }));
          });
      }
    });
  }

  onItemClick(item: AssetQueueItem): void {
    this.itemSelected.emit(item);
  }

  thumbnailFor(id: string): SafeUrl | null {
    return this.thumbnailMap()[id] ?? null;
  }
}
