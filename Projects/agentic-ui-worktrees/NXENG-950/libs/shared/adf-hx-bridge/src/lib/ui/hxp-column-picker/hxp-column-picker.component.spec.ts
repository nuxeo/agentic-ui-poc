import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { HxpColumnPickerComponent, type HxpPickableColumn } from './hxp-column-picker.component';

/**
 * The column picker, which exists because upstream's `HxpDocumentListComponent` has none — so
 * without it the adf-hx swap would silently remove a capability a user had.
 *
 * The two properties worth testing are the ones a naive implementation gets wrong:
 *
 * - **Cancel and Escape genuinely discard.** The component edits a local buffer, so a
 *   half-finished selection must not reach the host. A picker that mutated the inputs would
 *   pass a "toggle emits" test and still leak.
 * - **`apply` emits in the columns' own order, not click order.** The host feeds Layer 1
 *   descriptors, so the manifest's order is the answer; emitting click order would silently
 *   reorder a customer's columns.
 */
describe('HxpColumnPickerComponent', () => {
  let fixture: ComponentFixture<HxpColumnPickerComponent>;

  /** The manifest-shaped input, in display order. */
  const COLUMNS: readonly HxpPickableColumn[] = [
    { key: 'title', label: 'Title', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'modified', label: 'Modified', visible: false },
    { key: 'author', label: 'Author', visible: false },
  ];

  /** Emissions, captured for every test — see `listen()` below. */
  let emittedApplies: readonly string[][] = [];
  let emittedDismissals = 0;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HxpColumnPickerComponent],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HxpColumnPickerComponent);

    // Subscribed before any test body runs, so a stray emission during rendering would be
    // caught rather than missed.
    emittedApplies = [];
    emittedDismissals = 0;
    fixture.componentInstance.apply.subscribe((keys) => {
      emittedApplies = [...emittedApplies, [...keys]];
    });
    fixture.componentInstance.dismiss.subscribe(() => {
      emittedDismissals += 1;
    });
  });

  /** The applies emitted so far, asserting the expected count first. */
  function applied(expectedCount: number): readonly string[][] {
    expect(emittedApplies.length).toBe(expectedCount);
    return emittedApplies;
  }

  function render(inputs: {
    columns?: readonly HxpPickableColumn[];
    required?: readonly string[];
    defaults?: readonly string[];
  }): void {
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  /**
   * `fixture.nativeElement` is `any`, which makes `querySelectorAll<T>` an untyped call that
   * `tsc` rejects (`TS2347`) even while the suite runs green — Vitest strips types through
   * esbuild. Narrowing once here keeps every query below typed.
   */
  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const all = <T extends Element>(selector: string): T[] =>
    Array.from(root().querySelectorAll<T>(selector));

  const must = <T extends Element>(selector: string): T => {
    const el = root().querySelector<T>(selector);
    if (!el) throw new Error(`expected an element matching ${selector}`);
    return el;
  };

  const checkboxes = (): HTMLInputElement[] => all<HTMLInputElement>('input[type="checkbox"]');

  const options = (): HTMLLabelElement[] => all<HTMLLabelElement>('.hxp-col-panel-option');

  function checkboxFor(label: string): HTMLInputElement {
    const option = options().find((o) => o.textContent?.trim() === label);
    if (!option) throw new Error(`no option labelled ${label}`);
    const input = option.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (!input) throw new Error(`option ${label} has no checkbox`);
    return input;
  }

  function buttonFor(text: 'Reset' | 'Done'): HTMLButtonElement {
    const button = all<HTMLButtonElement>('.hxp-col-panel-btn').find(
      (b) => b.textContent?.trim() === text,
    );
    if (!button) throw new Error(`no ${text} button`);
    return button;
  }

  /** Clicking the checkbox itself, which is what fires the template's `(change)`. */
  function toggle(label: string): void {
    const box = checkboxFor(label);
    box.checked = !box.checked;
    box.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('renders one option per column, in the order given, checked by visibility', () => {
    render({ columns: COLUMNS });

    const labels = options().map((o) => o.textContent?.trim());
    expect(labels).toEqual(['Title', 'Type', 'Modified', 'Author']);
    expect(checkboxes().map((c) => c.checked)).toEqual([true, true, false, false]);
  });

  it('is a labelled modal dialog', () => {
    render({ columns: COLUMNS });
    const panel = must<HTMLElement>('.hxp-col-panel');
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-label')).toBe('Column Settings');
    // Focusable so `focus()` has something to move focus to.
    expect(panel.getAttribute('tabindex')).toBe('-1');
  });

  it('renders nothing to choose from when given no columns', () => {
    // The default input is `[]`. An empty picker is the honest rendering of "the host has no
    // descriptors yet"; inventing a packaged column list here is what this component was
    // written to avoid.
    render({});
    expect(checkboxes()).toEqual([]);
  });

  it('disables required columns so the table cannot lose its identity column', () => {
    render({ columns: COLUMNS, required: ['title'] });

    expect(checkboxFor('Title').disabled).toBe(true);
    expect(checkboxFor('Type').disabled).toBe(false);
  });

  it('defaults `required` to the title column', () => {
    // The default matters: a host that forgets to pass `required` still cannot end up with a
    // table of unlabelled rows.
    render({ columns: COLUMNS });
    expect(checkboxFor('Title').disabled).toBe(true);
  });

  it('ignores a toggle of a required column even when the event arrives', () => {
    render({ columns: COLUMNS, required: ['title'] });

    // `disabled` stops a real click; `toggle()`'s own guard is the second line, and it is
    // what a synthetic event meets.
    toggle('Title');
    buttonFor('Done').click();

    // Emitted set still contains the required column.
    expect(applied(1)).toEqual([['title', 'type']]);
  });

  it('emits the chosen keys in the columns own order, not click order', () => {
    render({ columns: COLUMNS });

    // Clicked last-to-first on purpose: click order would emit `['author', 'modified']`
    // after the two visible ones, which is the bug this asserts against.
    toggle('Author');
    toggle('Modified');
    buttonFor('Done').click();

    expect(applied(1)).toEqual([['title', 'type', 'modified', 'author']]);
  });

  it('removes a de-selected column', () => {
    render({ columns: COLUMNS });

    toggle('Type');
    buttonFor('Done').click();

    expect(applied(1)).toEqual([['title']]);
  });

  it('discards the edit buffer after Done, so reopening starts from the inputs again', () => {
    render({ columns: COLUMNS });

    toggle('Modified');
    buttonFor('Done').click();
    fixture.detectChanges();
    expect(applied(1)).toEqual([['title', 'type', 'modified']]);

    // `pending` is reset to `null` on commit, so `chosen` falls back to the inputs'
    // visibility. Without the reset the panel would show a stale selection next time.
    expect(checkboxes().map((c) => c.checked)).toEqual([true, true, false, false]);
  });

  it('Escape discards the edit and dismisses', () => {
    render({ columns: COLUMNS });

    toggle('Modified');
    expect(checkboxFor('Modified').checked).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(emittedDismissals).toBe(1);
    // Nothing applied — the whole point of the local buffer.
    expect(applied(0)).toEqual([]);
    // And the buffer is genuinely gone, not merely unemitted.
    expect(checkboxFor('Modified').checked).toBe(false);
  });

  it('dismisses on the backdrop without applying', () => {
    render({ columns: COLUMNS });

    toggle('Modified');
    must<HTMLButtonElement>('.hxp-col-panel-backdrop').click();
    fixture.detectChanges();

    expect(emittedDismissals).toBe(1);
    expect(applied(0)).toEqual([]);
  });

  it('Reset returns to the host defaults, not to a packaged constant', () => {
    // The defaults come from the manifest via the input, which is what makes Layer 1
    // customisation real rather than decorative.
    render({ columns: COLUMNS, required: ['title'], defaults: ['title', 'author'] });

    toggle('Modified');
    buttonFor('Reset').click();
    fixture.detectChanges();

    expect(checkboxes().map((c) => c.checked)).toEqual([true, false, false, true]);

    buttonFor('Done').click();
    expect(applied(1)).toEqual([['title', 'author']]);
  });

  it('Reset does not itself apply or dismiss', () => {
    render({ columns: COLUMNS, defaults: ['title'] });

    buttonFor('Reset').click();
    fixture.detectChanges();

    expect(applied(0)).toEqual([]);
    expect(emittedDismissals).toBe(0);
  });

  it('Reset with empty defaults clears everything, including a required column', () => {
    // Actual behaviour, and arguably not the intended one: `reset()` writes `defaults()`
    // straight into the buffer without re-adding `required`, so an empty or incomplete
    // `defaults` input can leave the required column unchecked — and `commit()` then emits
    // without it, because `commit()` filters by `chosen` and applies no required floor either.
    // The `required` input only disables the *checkbox*, which nothing enforces here.
    //
    // Asserted as-is rather than fixed: the host supplies `defaults`, so in practice the
    // manifest carries the identity column, and changing the component is out of scope for a
    // test-only change. Reported.
    render({ columns: COLUMNS, required: ['title'], defaults: [] });

    buttonFor('Reset').click();
    fixture.detectChanges();
    expect(checkboxes().map((c) => c.checked)).toEqual([false, false, false, false]);

    buttonFor('Done').click();
    expect(applied(1)).toEqual([[]]);
  });

  it('focus() moves focus to the panel on the next microtask', async () => {
    render({ columns: COLUMNS });

    fixture.componentInstance.focus();
    // `queueMicrotask`, so focus has not moved yet — asserting that first is what makes the
    // await below meaningful rather than a coincidence of timing.
    const panel = must<HTMLElement>('.hxp-col-panel');
    expect(document.activeElement).not.toBe(panel);

    await Promise.resolve();
    expect(document.activeElement).toBe(panel);
  });
});
