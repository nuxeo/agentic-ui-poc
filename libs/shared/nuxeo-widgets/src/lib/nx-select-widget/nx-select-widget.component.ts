import { Component, computed, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { NxWidgetBase } from '../base/nx-widget-base';

export interface SelectOption {
  id: string;
  label: string;
}

/**
 * Generic select widget for static option lists (not vocabulary-backed).
 * For directory-backed selects, use NxDirectoryWidget instead.
 */
@Component({
  selector: 'nx-select-widget',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    @if (isEditable()) {
      <mat-form-field appearance="outline" class="nx-widget-full">
        <mat-label>{{ label() }}</mat-label>
        @if (multiple()) {
          <mat-select
            [value]="arrayValue()"
            [required]="required()"
            [disabled]="disabled()"
            multiple
            (selectionChange)="emitChange($event.value)"
          >
            @for (opt of resolvedOptions(); track opt.id) {
              <mat-option [value]="opt.id">{{ opt.label }}</mat-option>
            }
          </mat-select>
        } @else {
          <mat-select
            [value]="singleValue()"
            [required]="required()"
            [disabled]="disabled()"
            (selectionChange)="emitChange($event.value || null)"
          >
            <mat-option value="">— Select —</mat-option>
            @for (opt of resolvedOptions(); track opt.id) {
              <mat-option [value]="opt.id">{{ opt.label }}</mat-option>
            }
          </mat-select>
        }
      </mat-form-field>
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        <span class="nx-widget-value">{{ displayText() || '—' }}</span>
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
export class NxSelectWidgetComponent extends NxWidgetBase {
  /** Static options provided via widget properties */
  readonly options = input<SelectOption[]>([]);

  readonly resolvedOptions = computed(() => {
    const props = this.properties();
    if (props && Array.isArray(props['options'])) {
      return props['options'] as SelectOption[];
    }
    return this.options();
  });

  readonly singleValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined ? String(v) : '';
  });

  readonly arrayValue = computed(() => {
    const v = this.value();
    if (Array.isArray(v)) return v.map(String);
    return v !== null && v !== undefined ? [String(v)] : [];
  });

  readonly displayText = computed(() => {
    const opts = this.resolvedOptions();
    if (this.multiple()) {
      return this.arrayValue()
        .map((id) => opts.find((o) => o.id === id)?.label ?? id)
        .join(', ');
    }
    const id = this.singleValue();
    return opts.find((o) => o.id === id)?.label ?? id;
  });
}
