import { Component, inject, input, output } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { HxpDocumentTreeComponent as UpstreamDocumentTreeComponent } from '@alfresco/adf-hx-content-services/ui';
import { DocumentTreeDatabaseService } from '@alfresco/adf-hx-content-services/services';

import { normalizeNuxeoPath } from '@agentic-ui/shared/nuxeo-client';
import { ADF_HX_NUXEO_BRIDGE_PROVIDERS } from '../../providers/provide-adf-hx-nuxeo-bridge';
import { AdfHxBrowseContextService } from '../../services/adf-hx-browse-context.service';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { ROOT_DOCUMENT } from '../../tokens/adf-hx-bridge.tokens';

@Component({
  selector: 'hxp-browse-nav-drawer',
  standalone: true,
  templateUrl: './hxp-browse-nav-drawer.component.html',
  styleUrl: './hxp-browse-nav-drawer.component.scss',
  imports: [HxpIconComponent, UpstreamDocumentTreeComponent],
  providers: [
    ...ADF_HX_NUXEO_BRIDGE_PROVIDERS,
    // `DocumentTreeDatabaseService` is upstream's tree data source and carries no
    // `providedIn`, so it has to be provided. It injects `DocumentService`, which the
    // application injector already supplies.
    DocumentTreeDatabaseService,
  ],
})
export class HxpBrowseNavDrawerComponent {
  private readonly browseContext = inject(AdfHxBrowseContextService);

  /** Upstream's tree walks down from here. */
  protected readonly rootDocument = ROOT_DOCUMENT as Document;

  readonly title = input('Browse');
  readonly navigatePath = output<string>();

  /**
   * Upstream's tree emits the selected `Document`; ours emitted a path string.
   *
   * The path is taken from `sys_path` rather than resolved through the router service,
   * because the host also needs it to update `AdfHxBrowseContextService` — the tree and the
   * document list have to agree on where they are, and the context is what keeps them in
   * step.
   */
  protected onDocumentSelected(document: Document): void {
    this.onNavigate(document.sys_path ?? '/');
  }

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
