/**
 * MatInput mirrors Validators.required as both native `required` and `aria-required="true"`.
 * IBM Equal Access flags the duplicate (aria_attribute_redundant). Native `required` is enough for AT.
 */
export function stripRedundantMatInputAriaRequired(
  input: HTMLInputElement | null | undefined,
): void {
  if (input?.required && input.getAttribute('aria-required') === 'true') {
    input.removeAttribute('aria-required');
  }
}

/** Strips on setup and whenever MatInput re-applies aria-required. */
export function observeStripRedundantMatInputAriaRequired(
  input: HTMLInputElement | null | undefined,
): MutationObserver | null {
  if (!input) {
    return null;
  }

  const strip = (): void => stripRedundantMatInputAriaRequired(input);
  strip();

  const observer = new MutationObserver(strip);
  observer.observe(input, {
    attributes: true,
    attributeFilter: ['aria-required', 'required'],
  });
  return observer;
}
