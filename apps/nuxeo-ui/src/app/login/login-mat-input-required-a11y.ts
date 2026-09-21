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
