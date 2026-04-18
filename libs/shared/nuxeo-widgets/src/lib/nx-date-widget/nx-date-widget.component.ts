import { Component, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { NxWidgetBase } from '../base/nx-widget-base';

@Component({
  selector: 'nx-date-widget',
  standalone: true,
  imports: [DatePipe, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    @if (isEditable()) {
      <mat-form-field appearance="outline" class="nx-widget-full">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          [matDatepicker]="picker"
          [value]="dateValue()"
          [required]="required()"
          [disabled]="disabled()"
          (dateChange)="onDateChange($event)"
        />
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-datepicker #picker />
      </mat-form-field>
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        <span class="nx-widget-value">
          {{ dateValue() ? (dateValue() | date: 'longDate') : '—' }}
        </span>
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
export class NxDateWidgetComponent extends NxWidgetBase {
  readonly dateValue = computed(() => {
    const v = this.value();
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'string') return new Date(v);
    return null;
  });

  onDateChange(event: { value: Date | null }): void {
    this.emitChange(event.value ? event.value.toISOString() : null);
  }
}
