import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AssetAggregationService, type AssetQueueItem } from '@agentic-ui/shared/nuxeo-client';

@Component({
  selector: 'lib-assets-queue',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './assets-queue.component.html',
  styleUrl: './assets-queue.component.scss',
})
export class AssetsQueueComponent {
  private readonly assetAggregationService = inject(AssetAggregationService);

  readonly items = computed(() => this.assetAggregationService.items());
  readonly selectedItemId = input<string>('');
  readonly itemSelected = output<AssetQueueItem>();

  onItemClick(item: AssetQueueItem): void {
    this.itemSelected.emit(item);
  }
}
