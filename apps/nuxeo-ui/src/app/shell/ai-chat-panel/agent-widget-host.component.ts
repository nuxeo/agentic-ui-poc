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

import {
  AGENT_WIDGET_CATALOGUE,
  AgentSelectionStore,
  type AgentWidgetDefinition,
  type AgentWidgetRequest,
} from '@agentic-ui/shared/agent-client';

/**
 * Mounts one registered component inside the chat transcript, or explains why it
 * did not.
 *
 * This is the "the app mounts" half of A7's governing principle. It names no
 * widget: the catalogue is injected, so this file did not change when the second
 * widget was added and will not change when a customer contributes a third.
 * Everything else it does is a consequence of the transcript being a hostile,
 * disposable place to put a component:
 *
 * **It refuses before it resolves.** A request that arrives already rejected —
 * an unrecognised widget name, props that failed validation — never reaches the
 * catalogue. The component type is not even looked up.
 *
 * **It tears down.** The transcript is cleared, re-ordered and re-rendered
 * constantly. A `ComponentRef` that outlives its host leaks the component, its
 * injector, its subscriptions and its blob URLs, and it would not be noticed
 * here — it would be noticed once every message had one.
 *
 * **A failed mount leaves nothing behind.** `setInput` throws for an input the
 * component does not declare, and the half-populated component that would
 * otherwise survive is destroyed rather than shown. A list rendered from some of
 * its props is a more convincing lie than no list at all.
 */
@Component({
  selector: 'app-agent-widget-host',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './agent-widget-host.component.html',
  styleUrl: './agent-widget-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentWidgetHostComponent implements OnDestroy {
  readonly request = input.required<AgentWidgetRequest>();

  private readonly injector = inject(Injector);
  private readonly catalogue = inject(AGENT_WIDGET_CATALOGUE);
  private readonly selectionStore = inject(AgentSelectionStore);
  private readonly container = viewChild.required('widgetOutlet', { read: ViewContainerRef });

  readonly loading = signal(false);
  /** The sentence shown in place of the widget. Null when there is nothing to explain. */
  readonly notice = signal<string | null>(null);

  private componentRef: ComponentRef<unknown> | null = null;
  /**
   * Identifies the mount currently being awaited. A second request arriving while
   * a lazy chunk is still downloading must not have the first one's component
   * appear on top of it when the download finishes.
   */
  private mountToken = 0;
  /** The instance id currently registered with the selection store, if any. */
  private offeredAs: string | null = null;
  /** Stops feeding proposals to a component that has been replaced. */
  private stopFeedingProposals: (() => void) | null = null;

  constructor() {
    effect(() => {
      const request = this.request();
      void this.mount(request);
    });
  }

  ngOnDestroy(): void {
    this.destroyWidget();
  }

  private async mount(request: AgentWidgetRequest): Promise<void> {
    const token = ++this.mountToken;
    this.destroyWidget();
    this.notice.set(null);

    if (request.status === 'rejected') {
      this.loading.set(false);
      this.notice.set(REJECTION_NOTICES[request.reason]);
      return;
    }

    const widget = this.catalogue.get(request.name);
    if (!widget) {
      // Unreachable while this host and `AgentRuntimeService` resolve the same
      // catalogue, and deliberately handled anyway: the catalogue is the
      // allowlist, and an allowlist with an unhandled miss is not one. A missing
      // entry must fail closed rather than throw mid-transcript.
      this.loading.set(false);
      this.notice.set(REJECTION_NOTICES['unknown-widget']);
      return;
    }

    this.loading.set(true);
    let componentType;
    try {
      componentType = await widget.load();
    } catch {
      if (token !== this.mountToken) return;
      this.loading.set(false);
      this.notice.set('That view could not be loaded.');
      return;
    }
    if (token !== this.mountToken) return;

    const outlet = this.container();
    const created = outlet.createComponent(componentType, { injector: this.injector });
    try {
      for (const [name, value] of Object.entries(widget.inputs(request.props))) {
        created.setInput(name, value);
      }
    } catch {
      created.destroy();
      this.loading.set(false);
      this.notice.set('That view could not be shown.');
      return;
    }

    this.componentRef = created;
    this.loading.set(false);
    this.wireSelection(widget, request.toolCallId, request.props, created);
  }

  /**
   * Registers what this instance is showing, and keeps it told what the agent
   * suggested.
   *
   * The offer is made from the *validated props*, not from whatever the mounted
   * component ends up rendering, so the store knows the closed set a proposal
   * may draw from before the component has fetched a single row. The feed runs
   * the other way: proposals are pushed in as they change, translated through
   * the definition rather than spread, so the component's own inputs stay the
   * only surface either side can touch.
   *
   * A widget that declares no `selection` gets neither, and cannot be ticked.
   */
  private wireSelection(
    widget: AgentWidgetDefinition,
    instanceId: string,
    props: object,
    created: ComponentRef<unknown>,
  ): void {
    const selection = widget.selection;
    if (!selection) return;

    this.selectionStore.offer(instanceId, selection.offers(props));
    this.offeredAs = instanceId;

    const feed = effect(
      () => {
        const proposed = this.selectionStore.proposalsFor(instanceId);
        // Nothing here can throw for a component that declares the input, and a
        // component that does not is a definition bug the mount already caught.
        for (const [name, value] of Object.entries(selection.inputs(proposed))) {
          created.setInput(name, value);
        }
      },
      { injector: this.injector },
    );
    this.stopFeedingProposals = () => feed.destroy();
  }

  private destroyWidget(): void {
    this.stopFeedingProposals?.();
    this.stopFeedingProposals = null;
    if (this.offeredAs) {
      // Before the component goes, so a proposal never outlives the rows it
      // names even for a tick of the transcript.
      this.selectionStore.withdraw(this.offeredAs);
      this.offeredAs = null;
    }
    if (!this.componentRef) return;
    this.componentRef.destroy();
    this.componentRef = null;
    // Nothing was inserted unless a ref was held, which is also why this is
    // inside the guard: the outlet query is only resolved once the view exists.
    this.container().clear();
  }
}

/**
 * What the user is told when a view is refused.
 *
 * Both sentences say a view was asked for and not shown, and neither repeats
 * anything the producer sent. The distinction between them is worth keeping: one
 * says this build does not have that view, the other says the request itself did
 * not hold up.
 */
const REJECTION_NOTICES: Readonly<Record<string, string>> = {
  'unknown-widget': 'The assistant asked for a view this application does not provide.',
  'invalid-props': 'The assistant asked for a view with details that did not check out.',
};
