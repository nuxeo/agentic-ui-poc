/**
 * IBM Equal Access `aria_keyboard_handler_exists` (NXENG-821) inspects the element that
 * carries `role="tablist"`. Angular Material binds `_handleKeydown` on the parent
 * `.mat-mdc-tab-label-container` instead, so the tablist node looks inert to the scanner
 * even though arrow-key navigation works on the tab buttons.
 */

export const MAT_TAB_LIST_KEYDOWN_ATTR = 'data-satori-tablist-keydown';

/**
 * Attach a keydown listener on the Material tablist node inside `root`.
 * Returns a cleanup function, or `null` when no tablist is present yet.
 */
export function wireMatTabListKeyboardA11y(root: HTMLElement): (() => void) | null {
  const tabList = root.querySelector<HTMLElement>('.mat-mdc-tab-list[role="tablist"]');
  if (!tabList) {
    return null;
  }

  if (tabList.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR) === 'true') {
    return null;
  }

  const handler = (event: KeyboardEvent): void => {
    if (event.target !== tabList) {
      return;
    }
    const firstTab = tabList.querySelector<HTMLElement>('[role="tab"]');
    firstTab?.focus();
  };

  tabList.addEventListener('keydown', handler);
  tabList.setAttribute(MAT_TAB_LIST_KEYDOWN_ATTR, 'true');

  return () => {
    tabList.removeEventListener('keydown', handler);
    tabList.removeAttribute(MAT_TAB_LIST_KEYDOWN_ATTR);
  };
}

/** Re-wire when Material re-renders tab labels (dynamic tab sets). */
export function observeMatTabListKeyboardA11y(root: HTMLElement): (() => void) | null {
  if (typeof MutationObserver === 'undefined') {
    const cleanup = wireMatTabListKeyboardA11y(root);
    return cleanup ? cleanup : null;
  }

  let tabListCleanup: (() => void) | null = null;
  const sync = (): void => {
    const next = wireMatTabListKeyboardA11y(root);
    if (!next) {
      return;
    }
    tabListCleanup?.();
    tabListCleanup = next;
  };

  sync();

  const observer = new MutationObserver(sync);
  observer.observe(root, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    tabListCleanup?.();
  };
}
