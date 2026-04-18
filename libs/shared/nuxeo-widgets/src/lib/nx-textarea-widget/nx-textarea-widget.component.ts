import { Component, computed } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NxWidgetBase } from '../base/nx-widget-base';

@Component({
  selector: 'nx-textarea-widget',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    @if (isEditable()) {
      <mat-form-field appearance="outline" class="nx-widget-full">
        <mat-label>{{ label() }}</mat-label>
        <textarea
          matInput
          [value]="stringValue()"
          [placeholder]="placeholder()"
          [required]="required()"
          [attr.maxlength]="maxLength() ?? null"
          [rows]="rows() ?? 3"
          [disabled]="disabled()"
          (input)="onInput($event)"
        ></textarea>
      </mat-form-field>
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        <p class="nx-widget-value nx-textarea-value">{{ stringValue() || '—' }}</p>
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
        margin: 0;
      }
      .nx-textarea-value {
        white-space: pre-wrap;
      }
    `,
  ],
})
export class NxTextareaWidgetComponent extends NxWidgetBase {
  readonly stringValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined ? String(v) : '';
  });

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.emitChange(textarea.value);
  }
}
