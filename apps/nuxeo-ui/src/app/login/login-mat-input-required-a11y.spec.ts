import { stripRedundantMatInputAriaRequired } from './login-mat-input-required-a11y';

describe('stripRedundantMatInputAriaRequired', () => {
  it('removes aria-required when native required is set', () => {
    const input = document.createElement('input');
    input.required = true;
    input.setAttribute('aria-required', 'true');

    stripRedundantMatInputAriaRequired(input);

    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-required')).toBeNull();
  });

  it('no-ops when the input is missing', () => {
    expect(() => stripRedundantMatInputAriaRequired(null)).not.toThrow();
    expect(() => stripRedundantMatInputAriaRequired(undefined)).not.toThrow();
  });

  it('no-ops when aria-required is not "true"', () => {
    const input = document.createElement('input');
    input.required = true;
    input.setAttribute('aria-required', 'false');

    stripRedundantMatInputAriaRequired(input);

    expect(input.getAttribute('aria-required')).toBe('false');
  });

  it('no-ops when the field is not required', () => {
    const input = document.createElement('input');
    input.setAttribute('aria-required', 'true');

    stripRedundantMatInputAriaRequired(input);

    expect(input.getAttribute('aria-required')).toBe('true');
  });
});
