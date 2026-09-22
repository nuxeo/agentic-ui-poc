import {
  observeStripRedundantMatInputAriaRequired,
  stripRedundantMatInputAriaRequired,
} from './login-mat-input-required-a11y';

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

describe('observeStripRedundantMatInputAriaRequired', () => {
  it('returns null when the input is missing', () => {
    expect(observeStripRedundantMatInputAriaRequired(null)).toBeNull();
  });

  it('strips immediately and when MatInput re-applies aria-required', async () => {
    const input = document.createElement('input');
    input.required = true;
    input.setAttribute('aria-required', 'true');

    const observer = observeStripRedundantMatInputAriaRequired(input);
    expect(observer).not.toBeNull();
    expect(input.getAttribute('aria-required')).toBeNull();

    input.setAttribute('aria-required', 'true');
    await new Promise<void>((resolve) => {
      const watch = new MutationObserver(() => {
        if (input.getAttribute('aria-required') === null) {
          watch.disconnect();
          resolve();
        }
      });
      watch.observe(input, { attributes: true, attributeFilter: ['aria-required'] });
    });

    observer?.disconnect();
    expect(input.getAttribute('aria-required')).toBeNull();
  });
});
