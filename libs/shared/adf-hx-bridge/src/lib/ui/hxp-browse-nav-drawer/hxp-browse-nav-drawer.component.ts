import { Component, inject, input, output } from '@angular/core';
import { normalizeNuxeoPath } from '@agentic-ui/shared/nuxeo-client';
import { ADF_HX_NUXEO_BRIDGE_PROVIDERS } from '../../providers/provide-adf-hx-nuxeo-bridge';
import { AdfHxBrowseContextService } from '../../services/adf-hx-browse-context.service';
import { HxpBrowseNavTreeService } from '../../services/hxp-browse-nav-tree.service';
import { HxpBrowseNavTreeComponent } from '../hxp-browse-nav-tree/hxp-browse-nav-tree.component';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

@Component({
  selector: 'hxp-browse-nav-drawer',
  standalone: true,
  templateUrl: './hxp-browse-nav-drawer.component.html',
  styleUrl: './hxp-browse-nav-drawer.component.scss',
  imports: [HxpBrowseNavTreeComponent, HxpIconComponent, HxpSpinnerComponent],
  providers: [...ADF_HX_NUXEO_BRIDGE_PROVIDERS, HxpBrowseNavTreeService],
})
export class HxpBrowseNavDrawerComponent {
  private readonly browseContext = inject(AdfHxBrowseContextService);
  protected readonly tree = inject(HxpBrowseNavTreeService);

  readonly title = input('Browse');
  readonly navigatePath = output<string>();

  protected onNavigate(path: string): void {
    const normalized = normalizeNuxeoPath(path);
    this.browseContext.setFromNuxeoPath(normalized);
    this.navigatePath.emit(normalized);
  }

  protected navigateToRoot(): void {
    this.onNavigate('/');
  }

  protected refreshTree(): void {
    this.browseContext.requestTreeRefresh();
  }
}
