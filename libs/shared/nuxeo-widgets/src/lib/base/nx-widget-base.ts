import { Directive, EventEmitter, Output, computed, input } from '@angular/core';
import type { LayoutMode } from '@agentic-ui/shared/nuxeo-studio';

/**
 * Abstract base for all Nuxeo layout widgets.
 *
 * Provides standard inputs (xpath, value, mode, label, required, etc.)
 * and a `valueChange` output. Concrete widgets extend this and implement
 * their own template.
 */
@Directive()
export abstract class NxWidgetBase {
  /** Nuxeo property xpath, e.g. "dc:title" */
  readonly xpath = input.required<string>();

  /** Current property value */
  readonly value = input<unknown>(undefined);

  /** Rendering mode */
  readonly mode = input<LayoutMode>('edit');

  /** Whether the field is mandatory */
  readonly required = input(false);

  /** Display label */
  readonly label = input('');

  /** Placeholder text */
  readonly placeholder = input('');

  /** Read-only override */
  readonly readOnly = input(false);

  /** Allow multiple values */
  readonly multiple = input(false);

  /** Directory name (directory / select widgets) */
  readonly directory = input<string | undefined>(undefined);

  /** Min value (number widget) */
  readonly min = input<number | undefined>(undefined);

  /** Max value (number widget) */
  readonly max = input<number | undefined>(undefined);

  /** Max string length */
  readonly maxLength = input<number | undefined>(undefined);

  /** Textarea rows */
  readonly rows = input<number | undefined>(undefined);

  /** Accepted file types for blob widget */
  readonly accept = input<string | undefined>(undefined);

  /** Whether the widget is disabled */
  readonly disabled = input(false);

  /** Extra properties bag */
  readonly properties = input<Record<string, unknown> | undefined>(undefined);

  /** Validation error messages passed down from the Layout Engine */
  readonly validationErrors = input<string[]>([]);

  /** Emitted when the user changes the value */
  @Output() readonly valueChange = new EventEmitter<unknown>();

  /** Whether this widget is in an editable state */
  readonly isEditable = computed(() => !this.isViewLike() && !this.readOnly() && !this.disabled());

  /** Whether the current mode is view-like (view or metadata) */
  readonly isViewLike = computed(() => this.mode() === 'view' || this.mode() === 'metadata');

  /** Whether this field has validation errors */
  readonly hasErrors = computed(() => this.validationErrors().length > 0);

  /** Emit a value change */
  protected emitChange(newValue: unknown): void {
    this.valueChange.emit(newValue);
  }
}
