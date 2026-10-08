import {
  MAT_TAB_LIST_KEYDOWN_ATTR,
  wireMatTabListKeyboardA11y,
} from './mat-tab-list-keyboard-a11y';

function materialTabHeaderMarkup(): HTMLElement {
  const root = document.createElement('mat-tab-group');
  root.innerHTML = `
    <div class="mat-mdc-tab-label-container">
      <div class="mat-mdc-tab-list" role="tablist">
        <div class="mat-mdc-tab-labels">
          <button type="button" role="tab">View</button>
          <button type="button" role="tab">History</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  return root;
}

describe('wireMatTabListKeyboardA11y', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('marks the tablist and registers a keydown listener', () => {
    const root = materialTabHeaderMarkup();
    const tabList = root.querySelector<HTMLElement>('.mat-mdc-tab-list')!;

    const cleanup = wireMatTabListKeyboardA11y(root);
    expect(cleanup).not.toBeNull();
    expect(tabList.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR)).toBe('true');

    const listener = vi.fn();
    tabList.addEventListener('keydown', listener);
    tabList.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(listener).toHaveBeenCalled();

    expect(cleanup).not.toBeNull();
    cleanup!();
    expect(tabList.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR)).toBeNull();
  });

  it('focuses the first tab when keydown targets the tablist itself', () => {
    const root = materialTabHeaderMarkup();
    const tabList = root.querySelector<HTMLElement>('.mat-mdc-tab-list')!;
    const firstTab = root.querySelector<HTMLElement>('[role="tab"]')!;

    wireMatTabListKeyboardA11y(root);
    tabList.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(firstTab);
  });

  it('returns null when the tablist is missing', () => {
    const root = document.createElement('mat-tab-group');
    document.body.appendChild(root);
    expect(wireMatTabListKeyboardA11y(root)).toBeNull();
  });
});
