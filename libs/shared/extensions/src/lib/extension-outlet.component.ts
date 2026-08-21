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
  signal,
  type ComponentRef,
  type Type,
} from '@angular/core';

import { ExtensionComponentRegistry } from './extension-component-registry.service';

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
 */
@Component({
  selector: 'lib-extension-outlet',
  standalone: true,
  templateUrl: './extension-outlet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionOutletComponent {
  /** Registered component ID to render. Takes precedence over `componentType`. */
  readonly componentId = input<string | null>(null);
  /** An already-imported component, for callers that have one in hand. */
  readonly componentType = input<Type<unknown> | null>(null);
  /** Inputs to set on the rendered component. Unknown keys are ignored. */
  readonly componentInputs = input<Readonly<Record<string, unknown>>>({});

  readonly loading = signal(false);
  /** True when nothing could be resolved, so the host can render a fallback. */
  readonly unresolved = signal(false);

  @ViewChild('outlet', { static: true, read: ViewContainerRef })
  private outlet!: ViewContainerRef;

  private readonly registry = inject(ExtensionComponentRegistry);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private componentRef: ComponentRef<unknown> | null = null;
  /** Bumped on every request so a slow load cannot overwrite a newer one. */
  private generation = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());

    effect(() => {
      const id = this.componentId();
      const type = this.componentType();
      const inputs = this.componentInputs();
      const generation = ++this.generation;

      if (type) {
        this.render(type, inputs, generation);
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
        this.render(immediate, inputs, generation);
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
        this.render(resolvedType, inputs, generation);
      });
    });
  }

  private render(
    type: Type<unknown>,
    inputs: Readonly<Record<string, unknown>>,
    generation: number,
  ): void {
    if (generation !== this.generation) return;
    this.clear();

    const ref = createComponent(type, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });

    for (const [name, value] of Object.entries(inputs)) {
      // `setInput` throws on a component that does not declare the input, and a
      // descriptor's inputs are customer-authored data. A mistyped key must not
      // blank the panel.
      try {
        ref.setInput(name, value);
      } catch {
        /* ignore an input the component does not declare */
      }
    }

    this.outlet.insert(ref.hostView);
    this.componentRef = ref;
    this.loading.set(false);
    this.unresolved.set(false);
  }

  private clear(): void {
    this.outlet?.clear();
    this.componentRef?.destroy();
    this.componentRef = null;
  }
}
