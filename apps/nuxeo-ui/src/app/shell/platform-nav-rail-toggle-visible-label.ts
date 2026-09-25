/**
 * NXENG-927 — IBM `input_label_visible` on `#sat-platform-nav-title-icon`.
 *
 * Upstream `SatPlatformNav` renders the rail toggle as icon-only while binding the translated
 * expand/collapse string to `aria-label` only. WCAG 2.5.3 and IBM Equal Access expect visible
 * label text that the accessible name contains; this helper adds that text inside the button.
 */

export const PLATFORM_NAV_RAIL_TOGGLE_SELECTOR = '#sat-platform-nav-title-icon';
export const PLATFORM_NAV_RAIL_TOGGLE_VISIBLE_LABEL_CLASS =
  'sat-platform-nav-rail-toggle-visible-label';

export function platformNavRailToggleLabelKey(collapsed: boolean): string {
  return collapsed ? 'sat.platform-nav.expand' : 'sat.platform-nav.collapse';
}

/**
 * Ensures the rail toggle button carries visible label text matching its `aria-label`.
 * Idempotent — safe to call on every collapse or language change.
 */
export function syncPlatformNavRailToggleVisibleLabel(
  root: ParentNode,
  labelText: string,
): HTMLButtonElement | null {
  const button = root.querySelector(PLATFORM_NAV_RAIL_TOGGLE_SELECTOR) as HTMLButtonElement | null;
  if (!button) {
    return null;
  }

  let span = button.querySelector(
    `.${PLATFORM_NAV_RAIL_TOGGLE_VISIBLE_LABEL_CLASS}`,
  ) as HTMLSpanElement | null;
  if (!span) {
    span = document.createElement('span');
    span.className = PLATFORM_NAV_RAIL_TOGGLE_VISIBLE_LABEL_CLASS;
    button.appendChild(span);
  }
  span.textContent = labelText;

  const svg = button.querySelector('svg');
  if (svg && svg.getAttribute('aria-hidden') !== 'true') {
    svg.setAttribute('aria-hidden', 'true');
  }

  const ariaLabel = button.getAttribute('aria-label')?.trim() ?? '';
  if (ariaLabel && labelText && !ariaLabel.includes(labelText)) {
    // Visible text must be contained in the accessible name (WCAG 2.5.3).
    button.setAttribute('aria-label', labelText);
  }

  return button;
}
