import { Component, computed } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { NxWidgetBase } from '../base/nx-widget-base';

/**
 * Tag widget for managing string arrays as tag chips.
 * Users can type and press Enter to add, click X to remove.
 */
@Component({
  selector: 'nx-tag-widget',
  standalone: true,
  imports: [MatChipsModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    @if (isEditable()) {
      <mat-form-field appearance="outline" class="nx-widget-full">
        <mat-label>{{ label() }}</mat-label>
        <mat-chip-grid #chipGrid>
          @for (tag of tags(); track tag) {
            <mat-chip-row (removed)="removeTag(tag)">
              {{ tag }}
              <button matChipRemove><mat-icon>cancel</mat-icon></button>
            </mat-chip-row>
          }
        </mat-chip-grid>
        <input
          matInput
          [matChipInputFor]="chipGrid"
          [matChipInputSeparatorKeyCodes]="separatorKeys"
          [matChipInputAddOnBlur]="true"
          [placeholder]="placeholder() || 'Add tag...'"
          [disabled]="disabled()"
          (matChipInputTokenEnd)="addTag($event)"
        />
      </mat-form-field>
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        <div class="nx-tag-chips">
          @for (tag of tags(); track tag) {
            <span class="nx-tag-chip">{{ tag }}</span>
          } @empty {
            <span class="nx-widget-value">—</span>
          }
        </div>
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
      .nx-tag-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .nx-tag-chip {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        background: var(--mat-sys-primary-container, #d4e3ff);
        color: var(--mat-sys-on-primary-container, #1a3f6f);
      }
    `,
  ],
})
export class NxTagWidgetComponent extends NxWidgetBase {
  readonly separatorKeys = [ENTER, COMMA];

  readonly tags = computed(() => {
    const v = this.value();
    if (Array.isArray(v)) return v.map(String);
    return [];
  });

  addTag(event: { value: string; chipInput: { clear: () => void } }): void {
    const tag = (event.value || '').trim();
    if (tag && !this.tags().includes(tag)) {
      this.emitChange([...this.tags(), tag]);
    }
    event.chipInput.clear();
  }

  removeTag(tag: string): void {
    this.emitChange(this.tags().filter((t) => t !== tag));
  }
}
