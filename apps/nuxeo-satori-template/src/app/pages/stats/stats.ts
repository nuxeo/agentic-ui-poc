import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchService } from '@nuxeo-satori/platform/nuxeo-client';
import { WidgetGridComponent, WidgetContainerComponent } from '@nuxeo-satori/platform/ui';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [WidgetGridComponent, WidgetContainerComponent],
  template: `
    <div style="padding: 2rem;">
      <h1>Quick Statistics</h1>

      <lib-widget-grid [columns]="3">
        <lib-widget-container title="Total Documents">
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; font-weight: 500;">
              {{ totalDocs() ?? '...' }}
            </div>
          </div>
        </lib-widget-container>

        <lib-widget-container title="This Week">
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; font-weight: 500;">
              {{ recentDocs() ?? '...' }}
            </div>
          </div>
        </lib-widget-container>

        <lib-widget-container title="My Documents">
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; font-weight: 500;">
              {{ myDocs() ?? '...' }}
            </div>
          </div>
        </lib-widget-container>
      </lib-widget-grid>
    </div>
  `,
})
export class StatsComponent {
  private search = inject(SearchService);

  private totalResult = toSignal(this.search.search({ pageSize: 0 }));

  protected totalDocs = computed(() => this.totalResult()?.totalSize);
  protected recentDocs = computed(() => 0); // TODO: Add date filter
  protected myDocs = computed(() => 0); // TODO: Add user filter
}
