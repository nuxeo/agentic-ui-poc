import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import { LayoutConfig } from '../../models/layout.model';
import { LayoutRegistryService } from '../../services/layout-registry.service';
import { NxWidgetHostDirective } from '../layout-renderer/nx-widget-host.directive';

export interface BulkEditResult {
  selectedFields: string[];
  properties: Record<string, unknown>;
}

@Component({
  selector: 'nx-bulk-edit-renderer',
  standalone: true,
  imports: [
    FormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NxWidgetHostDirective,
  ],
  templateUrl: './bulk-edit-renderer.component.html',
  styleUrl: './bulk-edit-renderer.component.scss',
})
export class BulkEditRendererComponent implements OnInit {
  private readonly layoutRegistry = inject(LayoutRegistryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly docType = input.required<string>();
  readonly documents = input.required<NuxeoDocument[]>();
  readonly saving = input(false);

  @Output() readonly apply = new EventEmitter<BulkEditResult>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly loading = signal(true);
  readonly resolvedLayout = signal<LayoutConfig | null>(null);
  readonly selectedFieldsSet = signal(new Set<string>());
  private readonly values = signal<Record<string, unknown>>({});
  readonly fieldErrors = signal<Map<string, string[]>>(new Map());

  ngOnInit(): void {
    this.layoutRegistry
      .resolveLayout(this.docType(), 'edit')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (layout) => {
          this.resolvedLayout.set(layout);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  isFieldSelected(xpath: string): boolean {
    return this.selectedFieldsSet().has(xpath);
  }

  toggleField(xpath: string): void {
    this.selectedFieldsSet.update((prev) => {
      const next = new Set(prev);
      if (next.has(xpath)) {
        next.delete(xpath);
      } else {
        next.add(xpath);
      }
      return next;
    });
  }

  getFieldValue(xpath: string): unknown {
    return this.values()[xpath];
  }

  onFieldChange(xpath: string, value: unknown): void {
    this.values.update((prev) => ({ ...prev, [xpath]: value }));
  }

  getFieldErrors(xpath: string): string[] {
    return this.fieldErrors().get(xpath) ?? [];
  }

  onApply(): void {
    const selected = this.selectedFieldsSet();
    if (selected.size === 0) return;

    const properties: Record<string, unknown> = {};
    for (const xpath of selected) {
      properties[xpath] = this.values()[xpath];
    }

    this.apply.emit({
      selectedFields: Array.from(selected),
      properties,
    });
  }

  onCancel(): void {
    this.selectedFieldsSet.set(new Set());
    this.values.set({});
    this.fieldErrors.set(new Map());
    this.cancel.emit();
  }
}
