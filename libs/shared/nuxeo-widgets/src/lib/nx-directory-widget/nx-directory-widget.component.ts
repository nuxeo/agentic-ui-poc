import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import {
  DirectoryService,
  type DirectoryEntry,
  type L10nDirectoryEntry,
} from '@agentic-ui/shared/nuxeo-client';
import { NxWidgetBase } from '../base/nx-widget-base';

interface ResolvedEntry {
  id: string;
  label: string;
}

/**
 * Universal directory widget that handles flat, hierarchical, and L10n
 * Nuxeo vocabularies. Supports single and multi-value selection.
 */
@Component({
  selector: 'nx-directory-widget',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
  ],
  template: `
    @if (isEditable()) {
      @if (multiple()) {
        <mat-form-field appearance="outline" class="nx-widget-full">
          <mat-label>{{ label() }}</mat-label>
          <mat-select
            [value]="arrayValue()"
            [required]="required()"
            [disabled]="disabled()"
            multiple
            (selectionChange)="emitChange($event.value)"
          >
            @for (entry of entries(); track entry.id) {
              <mat-option [value]="entry.id">{{ entry.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      } @else {
        <mat-form-field appearance="outline" class="nx-widget-full">
          <mat-label>{{ label() }}</mat-label>
          <mat-select
            [value]="singleValue()"
            [required]="required()"
            [disabled]="disabled()"
            (selectionChange)="emitChange($event.value || null)"
          >
            <mat-option value="">— Select —</mat-option>
            @for (entry of entries(); track entry.id) {
              <mat-option [value]="entry.id">{{ entry.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        @if (multiple()) {
          <div class="nx-directory-chips">
            @for (lbl of resolvedLabels(); track lbl) {
              <span class="nx-directory-chip">{{ lbl }}</span>
            } @empty {
              <span class="nx-widget-value">—</span>
            }
          </div>
        } @else {
          <span class="nx-widget-value">{{ resolvedSingleLabel() || '—' }}</span>
        }
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
      .nx-directory-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .nx-directory-chip {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        background: var(--mat-sys-surface-variant, #e0e0e0);
        color: var(--mat-sys-on-surface-variant, #444);
      }
    `,
  ],
})
export class NxDirectoryWidgetComponent extends NxWidgetBase implements OnInit {
  private readonly directoryService = inject(DirectoryService);

  readonly entries = signal<ResolvedEntry[]>([]);

  readonly singleValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined ? String(v) : '';
  });

  readonly arrayValue = computed(() => {
    const v = this.value();
    if (Array.isArray(v)) return v.map(String);
    if (v !== null && v !== undefined) return [String(v)];
    return [];
  });

  readonly resolvedSingleLabel = computed(() => {
    const id = this.singleValue();
    if (!id) return '';
    return this.entries().find((e) => e.id === id)?.label ?? id;
  });

  readonly resolvedLabels = computed(() => {
    const ids = this.arrayValue();
    const map = new Map(this.entries().map((e) => [e.id, e.label]));
    return ids.map((id) => map.get(id) ?? id);
  });

  ngOnInit(): void {
    const dir = this.directory();
    if (!dir) return;

    if (dir.startsWith('l10n')) {
      this.directoryService.getL10nEntries(dir).subscribe({
        next: (l10n: L10nDirectoryEntry[]) => {
          this.entries.set(l10n.map((e) => ({ id: e.id, label: e.properties.label_en ?? e.id })));
        },
      });
    } else {
      this.directoryService.getEntries(dir).subscribe({
        next: (flat: DirectoryEntry[]) => {
          this.entries.set(
            flat.map((e) => ({ id: e.id, label: e.displayLabel || e.label || e.id })),
          );
        },
      });
    }
  }
}
