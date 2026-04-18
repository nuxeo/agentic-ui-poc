import { Component, computed } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NxWidgetBase } from '../base/nx-widget-base';

@Component({
  selector: 'nx-number-widget',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    @if (isEditable()) {
      <mat-form-field appearance="outline" class="nx-widget-full">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          type="number"
          [value]="displayValue()"
          [placeholder]="placeholder()"
          [required]="required()"
          [min]="min() ?? null"
          [max]="max() ?? null"
          [disabled]="disabled()"
          (input)="onInput($event)"
        />
      </mat-form-field>
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        <span class="nx-widget-value">{{ displayValue() ?? '—' }}</span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .nx-widget-full {
        width: 100%;
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
export class NxNumberWidgetComponent extends NxWidgetBase {
  readonly displayValue = computed(() => {
    const v = this.value();
    if (v === null || v === undefined) return '';
    return typeof v === 'number' ? v : Number(v);
  });

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    if (raw === '') {
      this.emitChange(null);
    } else {
      const num = Number(raw);
      this.emitChange(isNaN(num) ? null : num);
    }
  }
}
