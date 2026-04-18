import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  Type,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgComponentOutlet } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import {
  ExtensionPointConfig,
  FieldWidgetConfig,
  LayoutConfig,
  LayoutMode,
  LayoutSection,
} from '../../models/layout.model';
import { LayoutRegistryService } from '../../services/layout-registry.service';
import { ValidationService } from '../../services/validation.service';
import { SlotRegistryService } from '../../services/slot-registry.service';
import { getPropertyValue, setPropertyValue } from '../../utils/xpath.util';
import { NxWidgetHostDirective } from './nx-widget-host.directive';

@Component({
  selector: 'nx-layout-renderer',
  standalone: true,
  imports: [
    NgComponentOutlet,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NxWidgetHostDirective,
  ],
  templateUrl: './layout-renderer.component.html',
  styleUrl: './layout-renderer.component.scss',
})
export class LayoutRendererComponent implements OnInit {
  private readonly layoutRegistry = inject(LayoutRegistryService);
  private readonly validationService = inject(ValidationService);
  private readonly slotRegistry = inject(SlotRegistryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly docType = input.required<string>();
  readonly mode = input<LayoutMode>('view');
  readonly document = input<NuxeoDocument | null>(null);
  readonly saving = input(false);

  @Output() readonly save = new EventEmitter<Record<string, unknown>>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly resolvedLayout = signal<LayoutConfig | null>(null);

  private readonly pendingChanges = signal<Record<string, unknown>>({});
  readonly fieldErrors = signal<Map<string, string[]>>(new Map());

  readonly globalSlotsBefore = computed(() => {
    const layout = this.resolvedLayout();
    return (layout?.extensionPoints ?? []).filter((ep) => ep.position === 'before');
  });

  readonly globalSlotsAfter = computed(() => {
    const layout = this.resolvedLayout();
    return (layout?.extensionPoints ?? []).filter((ep) => ep.position === 'after');
  });

  ngOnInit(): void {
    this.layoutRegistry
      .resolveLayout(this.docType(), this.mode())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (layout) => {
          this.resolvedLayout.set(layout);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(`Failed to load layout for ${this.docType()}: ${err?.message ?? err}`);
          this.loading.set(false);
        },
      });
  }

  isEditableMode(): boolean {
    const m = this.mode();
    return m === 'create' || m === 'edit' || m === 'import';
  }

  getFieldValue(xpath: string): unknown {
    const changes = this.pendingChanges();
    if (xpath in changes) return changes[xpath];
    const doc = this.document();
    if (!doc) return undefined;
    return getPropertyValue(doc.properties, xpath);
  }

  onFieldChange(xpath: string, value: unknown): void {
    this.pendingChanges.update((prev) => ({ ...prev, [xpath]: value }));
    this.revalidateField(xpath);
  }

  isFieldVisible(field: FieldWidgetConfig): boolean {
    if (!field.visibleWhen || field.visibleWhen.length === 0) return true;

    return field.visibleWhen.every((condition) => {
      const fieldValue = this.getFieldValue(condition.field);
      switch (condition.operator) {
        case 'eq':
          return fieldValue === condition.value;
        case 'neq':
          return fieldValue !== condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'notIn':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        case 'empty':
          return (
            fieldValue === null ||
            fieldValue === undefined ||
            fieldValue === '' ||
            (Array.isArray(fieldValue) && fieldValue.length === 0)
          );
        case 'notEmpty':
          return (
            fieldValue !== null &&
            fieldValue !== undefined &&
            fieldValue !== '' &&
            !(Array.isArray(fieldValue) && fieldValue.length === 0)
          );
        default:
          return true;
      }
    });
  }

  isValid(): boolean {
    const layout = this.resolvedLayout();
    if (!layout) return false;

    const allFields = this.getAllVisibleFields(layout);
    const allValues = this.buildAllValues();
    const errors = this.validationService.validateAll(allFields, allValues, (xpath) =>
      this.getFieldValue(xpath),
    );

    this.fieldErrors.set(errors);
    return errors.size === 0;
  }

  hasFieldError(xpath: string): boolean {
    return this.fieldErrors().has(xpath);
  }

  getFieldErrors(xpath: string): string[] {
    return this.fieldErrors().get(xpath) ?? [];
  }

  getSectionSlots(section: LayoutSection, position: 'before' | 'after'): ExtensionPointConfig[] {
    return (section.extensionPoints ?? []).filter((ep) => ep.position === position);
  }

  getSlotComponents(slotName: string): Type<unknown>[] {
    return this.slotRegistry.getSlotComponents(slotName, this.docType());
  }

  onSave(): void {
    if (!this.isValid()) return;

    const doc = this.document();
    let properties = doc ? { ...doc.properties } : {};

    const changes = this.pendingChanges();
    for (const [xpath, value] of Object.entries(changes)) {
      properties = setPropertyValue(properties, xpath, value);
    }

    this.save.emit(properties);
  }

  onCancel(): void {
    this.pendingChanges.set({});
    this.fieldErrors.set(new Map());
    this.cancel.emit();
  }

  private revalidateField(xpath: string): void {
    const layout = this.resolvedLayout();
    if (!layout) return;

    const field = this.findFieldConfig(layout, xpath);
    if (!field) return;

    const allValues = this.buildAllValues();
    const result = this.validationService.validateField(
      field,
      this.getFieldValue(xpath),
      allValues,
    );

    this.fieldErrors.update((prev) => {
      const next = new Map(prev);
      if (result.valid) {
        next.delete(xpath);
      } else {
        next.set(xpath, result.errors);
      }
      return next;
    });
  }

  private getAllVisibleFields(layout: LayoutConfig): FieldWidgetConfig[] {
    const fields: FieldWidgetConfig[] = [];
    for (const section of layout.sections) {
      for (const field of section.fields) {
        if (this.isFieldVisible(field)) {
          fields.push(field);
        }
      }
    }
    return fields;
  }

  private findFieldConfig(layout: LayoutConfig, xpath: string): FieldWidgetConfig | undefined {
    for (const section of layout.sections) {
      for (const field of section.fields) {
        if (field.xpath === xpath) return field;
      }
    }
    return undefined;
  }

  private buildAllValues(): Record<string, unknown> {
    const doc = this.document();
    const base = doc ? { ...doc.properties } : {};
    return { ...base, ...this.pendingChanges() };
  }
}
