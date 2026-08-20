import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Injector,
  OnDestroy,
  ViewContainerRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PAGE_TILE_CATALOGUE, type PageTileMountRequest } from '@agentic-ui/shared/agent-client';

/**
 * Mounts one registered page tile inside a grid layout.
 *
 * Adapted from `AgentWidgetHostComponent` but for user-configured page tiles
 * rather than agent-proposed widgets. Key differences:
 *
 * 1. **No selection store** — page tiles don't participate in agent proposals
 * 2. **Width-aware mounting** — tiles adapt to half-width or full-width contexts
 * 3. **Tile degradation** — removed or misconfigured tiles show a placeholder
 *    with the tile name, not a generic error
 * 4. **No toolCallId** — uses mountId since tiles aren't agent-proposed
 *
 * The mounting discipline is identical: refuse before resolving, tear down
 * completely, destroy half-populated components rather than showing them.
 */
@Component({
  selector: 'lib-page-tile-host',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './page-tile-host.component.html',
  styleUrl: './page-tile-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTileHostComponent implements OnDestroy {
  readonly request = input.required<PageTileMountRequest>();

  private readonly injector = inject(Injector);
  private readonly catalogue = inject(PAGE_TILE_CATALOGUE);
  private readonly container = viewChild.required('tileOutlet', { read: ViewContainerRef });

  readonly loading = signal(false);
  /** The notice shown in place of the tile when mounting fails. */
  readonly notice = signal<string | null>(null);
  /** The tile name, shown in the error state for identification. */
  readonly tileName = signal<string | null>(null);

  private componentRef: ComponentRef<unknown> | null = null;
  /**
   * Identifies the mount currently being awaited. Prevents a slow lazy chunk
   * from landing on top of a newer mount request.
   */
  private mountToken = 0;

  constructor() {
    effect(() => {
      const request = this.request();
      void this.mount(request);
    });
  }

  ngOnDestroy(): void {
    this.destroyTile();
  }

  private async mount(request: PageTileMountRequest): Promise<void> {
    const token = ++this.mountToken;
    this.destroyTile();
    this.notice.set(null);
    this.tileName.set(request.status === 'rejected' ? (request.tileName ?? null) : request.name);

    if (request.status === 'rejected') {
      this.loading.set(false);
      this.notice.set(REJECTION_NOTICES[request.reason]);
      return;
    }

    const tile = this.catalogue.get(request.name);
    if (!tile) {
      // Defensive: should not happen since parsePageTileMountRequest checks
      // the catalogue, but an allowlist that silently passes an unknown name
      // is not an allowlist.
      this.loading.set(false);
      this.notice.set(REJECTION_NOTICES['unknown-tile']);
      return;
    }

    this.loading.set(true);
    let componentType;
    try {
      componentType = await tile.load();
    } catch {
      if (token !== this.mountToken) return;
      this.loading.set(false);
      this.notice.set('This tile could not be loaded.');
      return;
    }
    if (token !== this.mountToken) return;

    const outlet = this.container();
    const created = outlet.createComponent(componentType, { injector: this.injector });
    try {
      for (const [name, value] of Object.entries(tile.inputs(request.config))) {
        created.setInput(name, value);
      }
    } catch {
      // setInput throws if the component doesn't declare the input. Destroy the
      // half-populated component rather than showing it.
      created.destroy();
      this.loading.set(false);
      this.notice.set('This tile could not be configured.');
      return;
    }

    this.componentRef = created;
    this.loading.set(false);
  }

  private destroyTile(): void {
    if (!this.componentRef) return;
    this.componentRef.destroy();
    this.componentRef = null;
    this.container().clear();
  }
}

/**
 * What the user sees when a tile mount fails.
 *
 * More specific than the chat widget messages because a broken tile on a page is
 * persistent (not ephemeral like a transcript) and the user needs to know which
 * tile to reconfigure or remove.
 */
const REJECTION_NOTICES: Readonly<Record<string, string>> = {
  'unknown-tile': 'This tile is no longer available. It may have been removed in an update.',
  'invalid-config':
    "This tile's configuration is no longer valid. Edit the page to reconfigure it.",
  'unsupported-width': 'This tile cannot be displayed at this width. Try resizing it.',
};
