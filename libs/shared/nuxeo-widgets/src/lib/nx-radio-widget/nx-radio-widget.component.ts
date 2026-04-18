import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';

import { DirectoryService, type DirectoryEntry } from '@agentic-ui/shared/nuxeo-client';
import { NxWidgetBase } from '../base/nx-widget-base';

interface RadioOption {
  id: string;
  label: string;
}

/**
 * Radio button widget. Can be backed by a Nuxeo directory or static options.
 */
@Component({
  selector: 'nx-radio-widget',
  standalone: true,
  imports: [MatRadioModule],
  template: `
    <div class="nx-radio-container">
      <span class="nx-widget-label">{{ label() }}</span>
      @if (isEditable()) {
        <mat-radio-group
          [value]="stringValue()"
          [disabled]="disabled()"
          (change)="emitChange($event.value)"
          class="nx-radio-group"
        >
          @for (opt of options(); track opt.id) {
            <mat-radio-button [value]="opt.id">{{ opt.label }}</mat-radio-button>
          }
        </mat-radio-group>
      } @else {
        <span class="nx-widget-value">{{ displayLabel() || '—' }}</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 4px 0;
      }
      .nx-radio-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nx-widget-label {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant, #666);
      }
      .nx-widget-value {
        font-size: 14px;
      }
      .nx-radio-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    `,
  ],
})
export class NxRadioWidgetComponent extends NxWidgetBase implements OnInit {
  private readonly directoryService = inject(DirectoryService);

  readonly options = signal<RadioOption[]>([]);

  readonly stringValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined ? String(v) : '';
  });

  readonly displayLabel = computed(() => {
    const id = this.stringValue();
    return this.options().find((o) => o.id === id)?.label ?? id;
  });

  ngOnInit(): void {
    const dir = this.directory();
    if (dir) {
      this.directoryService.getEntries(dir).subscribe({
        next: (entries: DirectoryEntry[]) => {
          this.options.set(
            entries.map((e) => ({ id: e.id, label: e.displayLabel || e.label || e.id })),
          );
        },
      });
    }

    const props = this.properties();
    if (props && Array.isArray(props['options'])) {
      this.options.set(props['options'] as RadioOption[]);
    }
  }
}
