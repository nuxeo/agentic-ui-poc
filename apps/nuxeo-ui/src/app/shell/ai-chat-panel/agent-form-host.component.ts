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
  output,
  signal,
  viewChild,
  type OutputRef,
  type OutputRefSubscription,
} from '@angular/core';

import {
  AGENT_FORM_CATALOGUE,
  type AgentFormRequest,
  type AgentFormSubmission,
} from '@agentic-ui/shared/agent-client';

/**
 * Mounts one registered form component inside the chat transcript, and reports
 * what the user did with it.
 *
 * A sibling of `AgentWidgetHostComponent` rather than a reuse of it, because the
 * two channels differ in the one way that matters to a host: a widget is display
 * and has nothing to say back, while a form has two outputs whose emissions
 * answer a gated write. Everything else it does is the same and for the same
 * reasons — it names no component, it refuses before it resolves, it tears down,
 * and a failed mount leaves nothing behind.
 *
 * **A failed mount emits nothing.** It does not fall back to submitting, and it
 * does not answer the interrupt: the panel keeps the decision open and shows the
 * approval card's buttons instead. A form that could not be shown must not become
 * a write, and it must not become a silent decline either — the user has not
 * decided yet.
 */
@Component({
  selector: 'app-agent-form-host',
  standalone: true,
  templateUrl: './agent-form-host.component.html',
  styleUrl: './agent-form-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentFormHostComponent implements OnDestroy {
  readonly request = input.required<AgentFormRequest>();

  /** The values the user submitted. One emission per mount, by construction. */
  readonly submitted = output<AgentFormSubmission>();
  readonly cancelled = output<void>();
  /**
   * The form could not be mounted, so the panel must offer the card instead.
   *
   * Reported rather than swallowed, for the same reason a refused widget is: a
   * form that silently fails to appear would leave a gated write with no
   * affordance at all, and the user would see a decision they cannot answer.
   */
  readonly unavailable = output<void>();

  private readonly injector = inject(Injector);
  private readonly catalogue = inject(AGENT_FORM_CATALOGUE);
  private readonly container = viewChild.required('formOutlet', { read: ViewContainerRef });

  readonly loading = signal(false);

  private componentRef: ComponentRef<unknown> | null = null;
  private subscriptions: OutputRefSubscription[] = [];
  /**
   * Identifies the mount currently being awaited, so a second request arriving
   * while a lazy chunk is still downloading does not end up with the first one's
   * component on top of it.
   */
  private mountToken = 0;

  constructor() {
    effect(() => {
      const request = this.request();
      void this.mount(request);
    });
  }

  ngOnDestroy(): void {
    this.destroyForm();
  }

  private async mount(request: AgentFormRequest): Promise<void> {
    const token = ++this.mountToken;
    this.destroyForm();

    const definition = this.catalogue.get(request.name);
    if (!definition) {
      // Unreachable while this host and `AgentRuntimeService` resolve the same
      // catalogue — the runtime already refused a name absent from it, so no
      // request naming one reaches here. Handled anyway: an allowlist with an
      // unhandled miss is not one, and this must fail closed to the card.
      this.unavailable.emit();
      return;
    }

    this.loading.set(true);
    let componentType;
    try {
      componentType = await definition.load();
    } catch {
      if (token !== this.mountToken) return;
      this.loading.set(false);
      this.unavailable.emit();
      return;
    }
    if (token !== this.mountToken) return;

    const outlet = this.container();
    const created = outlet.createComponent(componentType, { injector: this.injector });
    try {
      for (const [name, value] of Object.entries(definition.inputs(request.props))) {
        created.setInput(name, value);
      }
      // After the inputs, so a component that could not be populated is never
      // subscribed to: an output firing from a half-populated form would submit
      // values the user was never shown.
      this.subscriptions = [
        this.subscribe(created, definition.outputs.submitted, (value) =>
          this.submitted.emit(value as AgentFormSubmission),
        ),
        this.subscribe(created, definition.outputs.cancelled, () => this.cancelled.emit()),
      ];
    } catch {
      created.destroy();
      this.loading.set(false);
      this.unavailable.emit();
      return;
    }

    this.componentRef = created;
    this.loading.set(false);
  }

  /**
   * Subscribes to one named output, having confirmed it is one.
   *
   * The definition names the outputs rather than the host knowing the component
   * type, so the named property has to be checked before it is used: a definition
   * naming something that is not an `OutputRef` must wire nothing rather than
   * call whatever it found. A throw here is caught by the caller and the mount is
   * abandoned, which is the safe direction — no form, and the card instead.
   */
  private subscribe(
    created: ComponentRef<unknown>,
    name: string,
    handle: (value: unknown) => void,
  ): OutputRefSubscription {
    const candidate = (created.instance as Record<string, unknown>)[name];
    if (!isOutputRef(candidate)) {
      throw new Error(`Form component output "${name}" is not an output.`);
    }
    return candidate.subscribe(handle);
  }

  private destroyForm(): void {
    for (const subscription of this.subscriptions) subscription.unsubscribe();
    this.subscriptions = [];
    if (!this.componentRef) return;
    this.componentRef.destroy();
    this.componentRef = null;
    // Nothing was inserted unless a ref was held, which is also why this is
    // inside the guard: the outlet query only resolves once the view exists.
    this.container().clear();
  }
}

function isOutputRef(value: unknown): value is OutputRef<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { subscribe?: unknown }).subscribe === 'function'
  );
}
