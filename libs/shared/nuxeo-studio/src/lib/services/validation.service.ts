import { Injectable } from '@angular/core';
import { FieldValidator, FieldWidgetConfig } from '../models/layout.model';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Custom validator function signature.
 * Receives the field value, the full properties map, and the field config.
 * Returns `null` if valid, or an error message string.
 */
export type CustomValidatorFn = (
  value: unknown,
  allValues: Record<string, unknown>,
  field: FieldWidgetConfig,
) => string | null;

/**
 * Runs field-level and cross-field validation rules defined in
 * `FieldWidgetConfig.validators`. Supports built-in validators
 * (required, pattern, min/max, length) and pluggable custom validators
 * registered at runtime.
 */
@Injectable({ providedIn: 'root' })
export class ValidationService {
  private readonly customValidators = new Map<string, CustomValidatorFn>();

  registerCustomValidator(name: string, fn: CustomValidatorFn): void {
    this.customValidators.set(name, fn);
  }

  removeCustomValidator(name: string): void {
    this.customValidators.delete(name);
  }

  /**
   * Validate a single field value against its configured validators.
   *
   * @param field   The field configuration (contains validators array)
   * @param value   The current value of the field
   * @param allValues  Full properties map (needed for cross-field validation)
   */
  validateField(
    field: FieldWidgetConfig,
    value: unknown,
    allValues: Record<string, unknown>,
  ): ValidationResult {
    const errors: string[] = [];
    const validators = field.validators ?? [];

    if (field.required) {
      const msg = this.runRequired(value);
      if (msg) errors.push(msg);
    }

    for (const v of validators) {
      const msg = this.runValidator(v, value, allValues, field);
      if (msg) errors.push(msg);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate all fields in a flat list.
   * Returns a map of xpath → error messages.
   */
  validateAll(
    fields: FieldWidgetConfig[],
    allValues: Record<string, unknown>,
    getFieldValue: (xpath: string) => unknown,
  ): Map<string, string[]> {
    const errorMap = new Map<string, string[]>();

    for (const field of fields) {
      const value = getFieldValue(field.xpath);
      const result = this.validateField(field, value, allValues);
      if (!result.valid) {
        errorMap.set(field.xpath, result.errors);
      }
    }

    return errorMap;
  }

  private runRequired(value: unknown): string | null {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return 'This field is required';
    }
    return null;
  }

  private runValidator(
    v: FieldValidator,
    value: unknown,
    allValues: Record<string, unknown>,
    field: FieldWidgetConfig,
  ): string | null {
    switch (v.type) {
      case 'required':
        return this.runRequired(value) ? v.message : null;

      case 'pattern': {
        if (value === null || value === undefined || value === '') return null;
        if (!v.pattern) return null;
        const regex = new RegExp(v.pattern);
        return regex.test(String(value)) ? null : v.message;
      }

      case 'minLength': {
        if (value === null || value === undefined || value === '') return null;
        const len =
          typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0;
        return v.param !== null && v.param !== undefined && len < v.param ? v.message : null;
      }

      case 'maxLength': {
        if (value === null || value === undefined || value === '') return null;
        const len =
          typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0;
        return v.param !== null && v.param !== undefined && len > v.param ? v.message : null;
      }

      case 'min': {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return v.param !== null && v.param !== undefined && !isNaN(num) && num < v.param
          ? v.message
          : null;
      }

      case 'max': {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return v.param !== null && v.param !== undefined && !isNaN(num) && num > v.param
          ? v.message
          : null;
      }

      case 'crossField':
        return this.runCrossField(v, value, allValues);

      case 'custom':
        return this.runCustom(v, value, allValues, field);

      default:
        return null;
    }
  }

  private runCrossField(
    v: FieldValidator,
    value: unknown,
    allValues: Record<string, unknown>,
  ): string | null {
    if (!v.crossFieldXpath || !v.crossFieldOperator) return null;

    const otherValue = allValues[v.crossFieldXpath];
    const a = Number(value);
    const b = Number(otherValue);

    switch (v.crossFieldOperator) {
      case 'eq':
        return value === otherValue ? null : v.message;
      case 'neq':
        return value !== otherValue ? null : v.message;
      case 'lt':
        return !isNaN(a) && !isNaN(b) && a < b ? null : v.message;
      case 'lte':
        return !isNaN(a) && !isNaN(b) && a <= b ? null : v.message;
      case 'gt':
        return !isNaN(a) && !isNaN(b) && a > b ? null : v.message;
      case 'gte':
        return !isNaN(a) && !isNaN(b) && a >= b ? null : v.message;
      default:
        return null;
    }
  }

  private runCustom(
    v: FieldValidator,
    value: unknown,
    allValues: Record<string, unknown>,
    field: FieldWidgetConfig,
  ): string | null {
    if (!v.customValidatorName) return null;
    const fn = this.customValidators.get(v.customValidatorName);
    if (!fn) {
      console.warn(`[Validation] Custom validator "${v.customValidatorName}" not registered`);
      return null;
    }
    return fn(value, allValues, field);
  }
}
