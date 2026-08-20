import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import type { PageTileDefinition, PageTileConfig } from '@agentic-ui/shared/agent-client';

/**
 * Schema field type inferred from JSON Schema property definitions.
 */
type SchemaFieldType = 'string' | 'integer' | 'number' | 'boolean' | 'enum' | 'object' | 'unknown';

/**
 * Parsed field metadata from JSON Schema properties.
 */
interface SchemaField {
  readonly key: string;
  readonly type: SchemaFieldType;
  readonly description?: string;
  readonly required: boolean;
  readonly default?: unknown;
  readonly min?: number;
  readonly max?: number;
  readonly maxLength?: number;
  readonly enumValues?: readonly unknown[];
}

/**
 * Dynamic tile configuration form generator.
 *
 * Accepts a PageTileDefinition and optional existing config, generates form
 * fields from the configSchema, validates in real-time, and emits validated
 * config or null on changes.
 *
 * ## Supported field types
 *
 * - string → MatFormField with text input (respects maxLength)
 * - integer/number → MatFormField with number input (respects min/max)
 * - enum → MatSelect with options from the enum array
 * - boolean → MatCheckbox
 * - object (one level deep) → nested form group with same field generation
 *
 * ## Validation
 *
 * - Required fields checked at form level
 * - Min/max enforced for numbers
 * - MaxLength enforced for strings
 * - Schema constraints validated before emission
 * - Parser called on valid form data; null means invalid
 *
 * ## Similar patterns
 *
 * Follows document-metadata-form approach but schema-driven rather than
 * hardcoded fields. Uses reactive forms with proper Angular Material
 * validation display.
 */
@Component({
  selector: 'lib-tile-config-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './tile-config-form.component.html',
  styleUrl: './tile-config-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileConfigFormComponent {
  private readonly fb = inject(FormBuilder);

  /** The tile definition whose config we're editing */
  readonly tile = input.required<PageTileDefinition>();

  /** Existing config for editing (optional, for new tiles this is undefined) */
  readonly existingConfig = input<PageTileConfig | undefined>();

  /** Emitted whenever form state changes; null means invalid */
  readonly configChange = output<PageTileConfig | null>();

  /** The reactive form built from the schema */
  readonly form = signal<FormGroup>(this.fb.group({}));

  /** Parsed field definitions from the schema */
  readonly fields = computed<readonly SchemaField[]>(() => {
    const schema = this.tile().configSchema;
    return this.parseSchemaFields(schema);
  });

  /** Whether the form has been submitted at least once (for error display) */
  readonly submitted = signal(false);

  /** Validation error message from parser, if any */
  readonly parserError = signal<string | null>(null);

  constructor() {
    // Rebuild form when tile or existingConfig changes
    effect(() => {
      const parsedFields = this.fields();
      const config = this.existingConfig();
      this.buildForm(parsedFields, config);

      // Emit initial validated config after form is built
      this.emitValidatedConfig();

      // Subscribe to form value changes
      const currentForm = this.form();
      currentForm.valueChanges.subscribe(() => {
        this.emitValidatedConfig();
      });
    });
  }

  /**
   * Parse JSON Schema properties into field definitions.
   */
  private parseSchemaFields(schema: PageTileDefinition['configSchema']): readonly SchemaField[] {
    const properties = schema.properties ?? {};
    const required = new Set(schema.required ?? []);
    const result: SchemaField[] = [];

    for (const [key, propSchema] of Object.entries(properties)) {
      if (!propSchema || typeof propSchema !== 'object') continue;

      const propSchemaRecord = propSchema as Record<string, unknown>;

      const field: SchemaField = {
        key,
        type: this.inferFieldType(propSchemaRecord),
        description: (propSchemaRecord as { description?: string }).description,
        required: required.has(key),
        default: (propSchemaRecord as { default?: unknown }).default,
        min: (propSchemaRecord as { minimum?: number }).minimum,
        max: (propSchemaRecord as { maximum?: number }).maximum,
        maxLength: (propSchemaRecord as { maxLength?: number }).maxLength,
        enumValues: (propSchemaRecord as { enum?: readonly unknown[] }).enum,
      };

      result.push(field);
    }

    return result;
  }

  /**
   * Infer field type from JSON Schema property definition.
   */
  private inferFieldType(propSchema: Record<string, unknown>): SchemaFieldType {
    const type = propSchema['type'];

    // Enum takes precedence over type
    if (propSchema['enum'] && Array.isArray(propSchema['enum'])) {
      return 'enum';
    }

    if (type === 'string') return 'string';
    if (type === 'integer') return 'integer';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';
    if (type === 'object') return 'object';

    return 'unknown';
  }

  /**
   * Build reactive form from parsed fields and optional existing config.
   */
  private buildForm(fields: readonly SchemaField[], config?: PageTileConfig): void {
    const group: Record<string, unknown> = {};

    for (const field of fields) {
      const validators = this.buildValidators(field);
      const initialValue = this.getInitialValue(field, config);

      if (field.type === 'object') {
        // Nested object: create a nested form group
        // For now, we support one level of nesting
        group[field.key] = this.fb.group(initialValue ?? {});
      } else {
        group[field.key] = [initialValue, validators];
      }
    }

    this.form.set(this.fb.group(group));
  }

  /**
   * Build validators array for a field based on schema constraints.
   */
  private buildValidators(field: SchemaField): unknown[] {
    const validators = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.type === 'string' && field.maxLength) {
      validators.push(Validators.maxLength(field.maxLength));
    }

    if ((field.type === 'integer' || field.type === 'number') && field.min !== undefined) {
      validators.push(Validators.min(field.min));
    }

    if ((field.type === 'integer' || field.type === 'number') && field.max !== undefined) {
      validators.push(Validators.max(field.max));
    }

    return validators;
  }

  /**
   * Get initial value for a field from existing config or default.
   */
  private getInitialValue(field: SchemaField, config?: PageTileConfig): unknown {
    if (config && field.key in config) {
      return config[field.key as keyof PageTileConfig];
    }
    return field.default;
  }

  /**
   * Emit validated config or null if form is invalid.
   */
  private emitValidatedConfig(): void {
    const currentForm = this.form();
    if (!currentForm) {
      this.configChange.emit(null);
      return;
    }

    // Form-level validation
    if (!currentForm.valid) {
      this.parserError.set(null);
      this.configChange.emit(null);
      return;
    }

    // Get raw form values
    const rawConfig = currentForm.value as Record<string, unknown>;

    // Run through the tile's parser for additional validation
    const tile = this.tile();
    let validatedConfig: PageTileConfig | null;
    try {
      validatedConfig = tile.parseConfig(rawConfig);
    } catch (error) {
      this.parserError.set(
        error instanceof Error ? error.message : 'Configuration validation failed',
      );
      this.configChange.emit(null);
      return;
    }

    if (validatedConfig === null) {
      this.parserError.set('Configuration does not match tile requirements');
      this.configChange.emit(null);
      return;
    }

    this.parserError.set(null);
    this.configChange.emit(validatedConfig);
  }

  /**
   * Get error message for a form field.
   */
  getFieldError(fieldKey: string): string | null {
    const currentForm = this.form();
    if (!currentForm) return null;

    const control = currentForm.get(fieldKey);
    if (!control || !control.errors || (!control.touched && !this.submitted())) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['maxlength']) {
      const max = control.errors['maxlength'].requiredLength;
      return `Maximum length is ${max} characters`;
    }
    if (control.errors['min']) {
      const min = control.errors['min'].min;
      return `Minimum value is ${min}`;
    }
    if (control.errors['max']) {
      const max = control.errors['max'].max;
      return `Maximum value is ${max}`;
    }

    return 'Invalid value';
  }

  /**
   * Mark form as submitted (for error display).
   */
  markSubmitted(): void {
    this.submitted.set(true);
  }

  /**
   * Track function for @for over fields.
   */
  trackByKey(_index: number, field: SchemaField): string {
    return field.key;
  }

  /**
   * Track function for @for over enum values.
   */
  trackByValue(_index: number, value: unknown): unknown {
    return value;
  }
}
