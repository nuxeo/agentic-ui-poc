import {
  Component,
  input,
  effect,
  ViewContainerRef,
  inject,
  Injector,
  OnDestroy,
  Type,
  ComponentRef,
  signal,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Wrapper component for dynamically loading drawer components and managing loading state.
 */
@Component({
  selector: 'app-dynamic-drawer',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (isLoading()) {
      <div class="drawer-loading">
        <mat-spinner diameter="24" />
      </div>
    }
    <ng-container #drawerContainer />
  `,
  styles: [`
    .drawer-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    }
  `],
})
export class DynamicDrawerComponent implements OnDestroy {
  readonly drawerComponent = input<Type<unknown> | null>(null);
  readonly isLoading = signal(true);

  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private componentRef: ComponentRef<unknown> | null = null;

  constructor() {
    effect(() => {
      const componentType = this.drawerComponent();
      if (componentType) {
        this.createComponent(componentType);
      } else {
        this.destroyCurrentComponent();
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyCurrentComponent();
  }

  private createComponent(componentType: Type<unknown>): void {
    this.isLoading.set(true);

    this.destroyCurrentComponent();
    this.vcr.clear();

    // Create new component instance
    this.componentRef = this.vcr.createComponent(componentType, {
      injector: this.injector,
    });

    this.isLoading.set(false);
  }

  private destroyCurrentComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
