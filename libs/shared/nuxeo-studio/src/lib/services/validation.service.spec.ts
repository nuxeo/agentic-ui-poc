import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';
import { FieldWidgetConfig } from '../models/layout.model';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  describe('validateField', () => {
    const baseField: FieldWidgetConfig = {
      xpath: 'dc:title',
      widget: 'text',
      label: 'Title',
    };

    it('should pass for a valid non-required field with no validators', () => {
      const result = service.validateField(baseField, '', {});
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when required field is empty', () => {
      const field: FieldWidgetConfig = { ...baseField, required: true };
      const result = service.validateField(field, '', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should fail when required field is null', () => {
      const field: FieldWidgetConfig = { ...baseField, required: true };
      const result = service.validateField(field, null, {});
      expect(result.valid).toBe(false);
    });

    it('should fail when required field is empty array', () => {
      const field: FieldWidgetConfig = { ...baseField, required: true };
      const result = service.validateField(field, [], {});
      expect(result.valid).toBe(false);
    });

    it('should pass when required field has a value', () => {
      const field: FieldWidgetConfig = { ...baseField, required: true };
      const result = service.validateField(field, 'My Title', {});
      expect(result.valid).toBe(true);
    });

    it('should validate pattern — matching value passes', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        validators: [{ type: 'pattern', pattern: '^[A-Z]', message: 'Must start with uppercase' }],
      };
      const result = service.validateField(field, 'Hello', {});
      expect(result.valid).toBe(true);
    });

    it('should validate pattern — non-matching value fails', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        validators: [{ type: 'pattern', pattern: '^[A-Z]', message: 'Must start with uppercase' }],
      };
      const result = service.validateField(field, 'hello', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Must start with uppercase');
    });

    it('should skip pattern validation for empty values', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        validators: [{ type: 'pattern', pattern: '^[A-Z]', message: 'Must start with uppercase' }],
      };
      const result = service.validateField(field, '', {});
      expect(result.valid).toBe(true);
    });

    it('should validate min — value below minimum fails', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        widget: 'number',
        validators: [{ type: 'min', param: 10, message: 'Must be at least 10' }],
      };
      const result = service.validateField(field, 5, {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Must be at least 10');
    });

    it('should validate min — value at minimum passes', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        widget: 'number',
        validators: [{ type: 'min', param: 10, message: 'Must be at least 10' }],
      };
      const result = service.validateField(field, 10, {});
      expect(result.valid).toBe(true);
    });

    it('should validate max — value above maximum fails', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        widget: 'number',
        validators: [{ type: 'max', param: 100, message: 'Must be at most 100' }],
      };
      const result = service.validateField(field, 150, {});
      expect(result.valid).toBe(false);
    });

    it('should validate minLength', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        validators: [{ type: 'minLength', param: 3, message: 'Too short' }],
      };
      expect(service.validateField(field, 'ab', {}).valid).toBe(false);
      expect(service.validateField(field, 'abc', {}).valid).toBe(true);
    });

    it('should validate maxLength', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        validators: [{ type: 'maxLength', param: 5, message: 'Too long' }],
      };
      expect(service.validateField(field, 'abcdef', {}).valid).toBe(false);
      expect(service.validateField(field, 'abcde', {}).valid).toBe(true);
    });

    it('should validate crossField — eq operator', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        validators: [
          {
            type: 'crossField',
            crossFieldXpath: 'dc:other',
            crossFieldOperator: 'eq',
            message: 'Must match other field',
          },
        ],
      };
      expect(service.validateField(field, 'abc', { 'dc:other': 'abc' }).valid).toBe(true);
      expect(service.validateField(field, 'abc', { 'dc:other': 'xyz' }).valid).toBe(false);
    });

    it('should validate crossField — lt operator', () => {
      const field: FieldWidgetConfig = {
        ...baseField,
        validators: [
          {
            type: 'crossField',
            crossFieldXpath: 'dc:endDate',
            crossFieldOperator: 'lt',
            message: 'Start must be before end',
          },
        ],
      };
      expect(service.validateField(field, 5, { 'dc:endDate': 10 }).valid).toBe(true);
      expect(service.validateField(field, 15, { 'dc:endDate': 10 }).valid).toBe(false);
    });
  });

  describe('custom validators', () => {
    it('should run a registered custom validator', () => {
      service.registerCustomValidator('no-spaces', (value) => {
        return typeof value === 'string' && value.includes(' ') ? 'No spaces allowed' : null;
      });

      const field: FieldWidgetConfig = {
        xpath: 'dc:title',
        widget: 'text',
        validators: [{ type: 'custom', customValidatorName: 'no-spaces', message: '' }],
      };

      expect(service.validateField(field, 'hello world', {}).valid).toBe(false);
      expect(service.validateField(field, 'helloworld', {}).valid).toBe(true);
    });

    it('should warn and pass for unregistered custom validator', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* noop for test */
      });

      const field: FieldWidgetConfig = {
        xpath: 'dc:title',
        widget: 'text',
        validators: [{ type: 'custom', customValidatorName: 'nonexistent', message: 'err' }],
      };

      const result = service.validateField(field, 'test', {});
      expect(result.valid).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('nonexistent'));

      warnSpy.mockRestore();
    });

    it('should support removing custom validators', () => {
      service.registerCustomValidator('temp', () => 'always fails');
      service.removeCustomValidator('temp');

      const field: FieldWidgetConfig = {
        xpath: 'dc:title',
        widget: 'text',
        validators: [{ type: 'custom', customValidatorName: 'temp', message: '' }],
      };

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* noop for test */
      });
      expect(service.validateField(field, 'test', {}).valid).toBe(true);
      warnSpy.mockRestore();
    });
  });

  describe('validateAll', () => {
    it('should return errors for multiple invalid fields', () => {
      const fields: FieldWidgetConfig[] = [
        { xpath: 'dc:title', widget: 'text', required: true },
        { xpath: 'dc:description', widget: 'textarea', required: true },
        { xpath: 'dc:nature', widget: 'directory', required: false },
      ];

      const errors = service.validateAll(fields, {}, (xpath) => {
        if (xpath === 'dc:nature') return 'some-value';
        return '';
      });

      expect(errors.size).toBe(2);
      expect(errors.has('dc:title')).toBe(true);
      expect(errors.has('dc:description')).toBe(true);
      expect(errors.has('dc:nature')).toBe(false);
    });
  });
});
