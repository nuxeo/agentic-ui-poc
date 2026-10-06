import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  Injector,
  ViewChild,
  ViewContainerRef,
  createComponent,
  effect,
  inject,
  input,
  reflectComponentType,
  signal,
  untracked,
  type ComponentRef,
  type Type,
} from '@angular/core';

import { ExtensionComponentRegistry } from './extension-component-registry.service';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Renders a component resolved from the registry, by ID or by type.
 *
 * This is the **shared component-resolution primitive** that route, tab, viewer
 * and drawer extensions all need. It generalises the shell's
 * `DynamicDrawerComponent`, which took only an eagerly imported
 * `Type<unknown>`, in three ways that each unblock a slot:
 *
 * - accepts a registered **ID**, which is what a manifest can name;
 * - resolves **lazily loaded** components, so a tab or route panel in a
 *   lazy feature library does not have to be statically imported by the shell;
 * - binds **inputs**, so a descriptor can pass configuration to the component it
 *   names.
 *
 * It uses `createComponent()` rather than `ViewContainerRef.createComponent()`
 * because the former accepts `bindings`/`environmentInjector` explicitly, which
 * is what makes input binding to a dynamically chosen component possible at all.
 *
 * A change to `componentInputs` alone is applied to the live instance; only a change
 * of component recreates it. The `documentView` slot feeds the focused document, which
 * is a new object on every refetch, and recreating on each one would discard whatever
 * state the rendered view holds.
 */
@Component({
  selector: 'lib-extension-outlet',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './extension-outlet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionOutletComponent {
  /** Registered component ID to render. Takes precedence over `componentType`. */
  readonly componentId = input<string | null>(null);
  /** An already-imported component, for callers that have one in hand. */
  readonly componentType = input<Type<unknown> | null>(null);
  /**
   * Inputs to set on the rendered component. Unknown keys are ignored.
   *
   * The `?? {}` in the effect below is not defensive padding. `withComponentInputBinding()`
   * sets **every declared input** from route data, passing `undefined` for keys the
   * route does not supply — which overrides this default. So routing straight to this
   * component with `data: { componentId: '...' }` made `componentInputs()` `undefined`
   * and `Object.entries()` threw, blanking the route. Both this template and the
   * product bootstrap with `withComponentInputBinding()`, so the crash was reachable
   * from either.
   */
  readonly componentInputs = input<Readonly<Record<string, unknown>> | null | undefined>({});

  readonly loading = signal(false);
  /** True when nothing could be resolved, so the host can render a fallback. */
  readonly unresolved = signal(false);

  @ViewChild('outlet', { static: true, read: ViewContainerRef })
  private outlet!: ViewContainerRef;

  private readonly registry = inject(ExtensionComponentRegistry);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private componentRef: ComponentRef<unknown> | null = null;
  /** Public names of the inputs the rendered component declares. */
  private declaredInputs: ReadonlySet<string> = new Set();
  /** Bumped on every request so a slow load cannot overwrite a newer one. */
  private generation = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());

    effect(() => {
      const id = this.componentId();
      const type = this.componentType();
      const generation = ++this.generation;

      if (type) {
        untracked(() => this.render(type, generation));
        return;
      }
      if (!id) {
        this.clear();
        this.loading.set(false);
        this.unresolved.set(false);
        return;
      }

      const immediate = this.registry.peek(id);
      if (immediate) {
        untracked(() => this.render(immediate, generation));
        return;
      }

      this.loading.set(true);
      this.unresolved.set(false);
      void this.registry.resolve(id).then((resolvedType) => {
        if (generation !== this.generation) return;
        this.loading.set(false);
        if (!resolvedType) {
          this.clear();
          this.unresolved.set(true);
          return;
        }
        this.render(resolvedType, generation);
      });
    });

    effect(() => {
      const inputs = this.componentInputs() ?? {};
      untracked(() => {
        if (this.componentRef) this.applyInputs(this.componentRef, inputs);
      });
    });
  }

  private render(type: Type<unknown>, generation: number): void {
    if (generation !== this.generation) return;
    this.clear();

    const ref = createComponent(type, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });
    this.declaredInputs = new Set(
      reflectComponentType(type)?.inputs.map((declared) => declared.templateName) ?? [],
    );
    this.applyInputs(ref, this.componentInputs() ?? {});

    this.outlet.insert(ref.hostView);
    this.componentRef = ref;
    this.loading.set(false);
    this.unresolved.set(false);
  }

  /**
   * Set the inputs the component declares, and only those.
   *
   * A descriptor's inputs are customer-authored, and a host may offer an input not every
   * component wants — `documentView` always offers `document`. `setInput` does not throw
   * on an undeclared name; in a development build it logs NG0303 to the console, so the
   * filter is what keeps an unused key silent rather than a `catch` that never fires.
   */
  private applyInputs(ref: ComponentRef<unknown>, inputs: Readonly<Record<string, unknown>>): void {
    for (const [name, value] of Object.entries(inputs)) {
      if (!this.declaredInputs.has(name)) continue;
      // A declared input's `transform` is the component's code, run on customer data;
      // a value it rejects must not blank the panel.
      try {
        ref.setInput(name, value);
      } catch {
        /* keep the rest of the inputs and the rendered component */
      }
    }
  }

  private clear(): void {
    this.outlet?.clear();
    this.componentRef?.destroy();
    this.componentRef = null;
    this.declaredInputs = new Set();
  }
}
