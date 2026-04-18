import { Component, computed } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { NxWidgetBase } from '../base/nx-widget-base';

@Component({
  selector: 'nx-toggle-widget',
  standalone: true,
  imports: [MatSlideToggleModule],
  template: `
    @if (isEditable()) {
      <mat-slide-toggle
        [checked]="boolValue()"
        [disabled]="disabled()"
        (change)="emitChange($event.checked)"
      >
        {{ label() }}
      </mat-slide-toggle>
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        <span class="nx-widget-value">{{ boolValue() ? 'Yes' : 'No' }}</span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 8px 0;
      }
      .nx-widget-view {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px 0;
      }
      .nx-widget-label {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant, #666);
      }
      .nx-widget-value {
        font-size: 14px;
      }
    `,
  ],
})
export class NxToggleWidgetComponent extends NxWidgetBase {
  readonly boolValue = computed(() => Boolean(this.value()));
}
