import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  AssetAggregationService,
  DocumentDetailService,
  type AssetQueueItem,
} from '@nuxeo-satori/platform/nuxeo-client';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly objectUrls = new Map<string, string>();
  private readonly inFlight = new Set<string>();

  readonly items = computed(() => this.assetAggregationService.items());
  readonly thumbnailMap = signal<Record<string, string | null>>({});
  readonly selectedItemId = input<string>('');
  readonly itemSelected = output<AssetQueueItem>();

  constructor() {
    effect(() => {
      const queueItems = this.items();
      const thumbnailMap = untracked(() => this.thumbnailMap());
      for (const item of queueItems) {
        if (thumbnailMap[item.id] || this.inFlight.has(item.id)) continue;
        this.inFlight.add(item.id);
        this.detailService
          .fetchThumbnail(item.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .pipe(catchError(() => of(null)))
          .subscribe((blob) => {
            this.inFlight.delete(item.id);
            if (!blob) return;

            const previousUrl = this.objectUrls.get(item.id);
            if (previousUrl) URL.revokeObjectURL(previousUrl);

            const url = URL.createObjectURL(blob);
            this.objectUrls.set(item.id, url);
            this.thumbnailMap.update((current) => ({
              ...current,
              [item.id]: url,
            }));
          });
      }
    });

    this.destroyRef.onDestroy(() => {
      for (const url of this.objectUrls.values()) {
        URL.revokeObjectURL(url);
      }
      this.objectUrls.clear();
      this.inFlight.clear();
    });
  }

  onItemClick(item: AssetQueueItem): void {
    this.itemSelected.emit(item);
  }

  thumbnailFor(id: string): string | null {
    return this.thumbnailMap()[id] ?? null;
  }
}
