import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SelectionService } from '@nuxeo-satori/platform/nuxeo-client';

import { HxpDocumentCardsComponent } from './hxp-document-cards.component';

/**
 * The card view, which upstream has no equivalent of — a DataTable and nothing else — so
 * thumbnails and the card layout are rehomed here rather than lost.
 *
 * The real `SelectionService` is used rather than a mock. Selection is shared state read by the
 * toolbar and the bulk actions, so the assertion that matters is what ends up **in the
 * service** after a click, not that a spy was called with some arguments. A mock would let a
 * card write the wrong id into selection and still pass.
 *
 * `thumbnails` is a `Record<sys_id, objectUrl>` **owned by the host**: this component only
 * reads it. That is asserted, because a component that created its own object URLs per card
 * would have no place to revoke them — the exact shape of the blob-URL lifecycle defects this
 * repo has already had.
 */
describe('HxpDocumentCardsComponent', () => {
  let fixture: ComponentFixture<HxpDocumentCardsComponent>;
  let selection: SelectionService;
  let httpMock: HttpTestingController;

  /**
   * The card grid must not fetch anything. Thumbnails are the host's, so an unexpected request
   * here would mean this component had started fetching its own — which is how it would end up
   * owning object URLs it has no hook to revoke.
   */
  afterEach(() => httpMock.verify());

  /**
   * `sys_primaryType` is the only field `Document` requires; the rest are here because this
   * component reads them. `Partial<Document>` for the override, and no closing `as Document` —
   * the cast is what lets an invalid fixture through and lets it drift as the type evolves.
   */
  const doc = (over: Partial<Document> = {}): Document => ({
    sys_id: 'doc-1',
    sys_title: 'Invoice.pdf',
    sys_primaryType: 'File',
    sys_path: '/default-domain/workspaces/ws/Invoice.pdf',
    sys_isFolderish: false,
    ...over,
  });

  const FILE = doc();
  const FOLDER = doc({
    sys_id: 'folder-1',
    sys_title: 'Contracts',
    sys_primaryType: 'Folder',
    sys_isFolderish: true,
    sys_path: '/default-domain/workspaces/ws/Contracts',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HxpDocumentCardsComponent],
      // `SelectionService` reaches `DocumentDetailService`, which needs an `HttpClient`. The
      // testing backend is here to make that construction possible and to prove nothing uses
      // it — see `afterEach`.
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    fixture = TestBed.createComponent(HxpDocumentCardsComponent);
    selection = TestBed.inject(SelectionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  function render(inputs: {
    documents?: readonly Document[];
    thumbnails?: Record<string, string>;
  }): void {
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  /**
   * `fixture.nativeElement` is `any`, which makes `querySelector<T>` an untyped call that
   * `tsc` rejects outright (`TS2347`) even though the suite runs green — Vitest strips the types
   * through esbuild. Narrowing once here keeps every query below typed.
   */
  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const all = <T extends Element>(selector: string): T[] =>
    Array.from(root().querySelectorAll<T>(selector));

  const one = <T extends Element>(selector: string): T | null => root().querySelector<T>(selector);

  /** `one()` where the element must exist — throws rather than asserting against `null`. */
  const must = <T extends Element>(selector: string): T => {
    const el = one<T>(selector);
    if (!el) throw new Error(`expected an element matching ${selector}`);
    return el;
  };

  const cards = (): HTMLElement[] => all<HTMLElement>('.hxp-doc-card-wrapper');

  const titles = (): (string | undefined)[] =>
    all<HTMLElement>('.hxp-card-title').map((e) => e.textContent?.trim());

  const types = (): (string | undefined)[] =>
    all<HTMLElement>('.hxp-card-type').map((e) => e.textContent?.trim());

  const checkboxes = (): HTMLInputElement[] => all<HTMLInputElement>('input[type="checkbox"]');

  it('renders one card per document with its title and type label', () => {
    render({ documents: [FILE, FOLDER] });

    expect(cards()).toHaveLength(2);
    expect(titles()).toEqual(['Invoice.pdf', 'Contracts']);
    expect(types()).toEqual(['File', 'Folder']);
  });

  it('renders nothing for an empty list', () => {
    // The default input is `[]`; a grid container with no cards is the correct empty state,
    // and the host owns the "no documents" message.
    render({});
    expect(cards()).toEqual([]);
    expect(one('.hxp-card-grid')).toBeTruthy();
  });

  it('falls back through sys_title, sys_name, then Untitled', () => {
    render({
      documents: [
        doc({ sys_id: 'a', sys_title: 'Titled' }),
        doc({ sys_id: 'b', sys_title: undefined, sys_name: 'named.pdf' }),
        doc({ sys_id: 'c', sys_title: undefined, sys_name: undefined }),
      ],
    });

    expect(titles()).toEqual(['Titled', 'named.pdf', 'Untitled']);
  });

  it('prefers sys_typeLabel over the raw primary type', () => {
    // `sys_typeLabel` is the human-readable label the MODEL port supplies; the raw doctype is
    // the fallback, not the preference.
    render({ documents: [doc({ sys_typeLabel: 'Picture', sys_primaryType: 'Picture' })] });
    expect(types()).toEqual(['Picture']);
  });

  it('shows the host thumbnail when there is one for that id', () => {
    render({ documents: [FILE], thumbnails: { 'doc-1': 'blob:host/doc-1' } });

    const img = must<HTMLImageElement>('.hxp-card-thumb-img');
    // The URL passes through verbatim: the host created it and the host revokes it.
    expect(img.getAttribute('src')).toBe('blob:host/doc-1');
    // Decorative — the title is already the accessible name of the card.
    expect(img.getAttribute('alt')).toBe('');
    // No icon fallback rendered alongside it.
    expect(one('.hxp-card-thumb-icon')).toBeNull();
  });

  it('falls back to a type icon when the host has no thumbnail for that id', () => {
    // Keyed by `sys_id`: a thumbnail for a *different* document must not be shown here. That
    // is the failure that matters, because the wrong preview on the wrong card is a
    // confidentiality-shaped bug rather than a cosmetic one.
    render({ documents: [FILE], thumbnails: { 'other-doc': 'blob:host/other' } });

    expect(one('.hxp-card-thumb-img')).toBeNull();
    const icon = must<HTMLElement>('.hxp-card-thumb-icon');
    expect(icon.classList.contains('hxp-card-thumb-icon--folder')).toBe(false);
  });

  it('marks the folder icon so a folder reads differently from a file', () => {
    render({ documents: [FOLDER] });
    const icon = must<HTMLElement>('.hxp-card-thumb-icon');
    expect(icon.classList.contains('hxp-card-thumb-icon--folder')).toBe(true);
  });

  it('does not treat the synthetic repository root as a folder card', () => {
    // `isHxFolder` excludes the root, so the root — which is folderish — must not get the
    // folder affordance. It is not a Nuxeo document and cannot be opened like one.
    render({
      documents: [
        doc({
          sys_id: '00000000-0000-0000-0000-000000000000',
          sys_primaryType: 'SysRoot',
          sys_isFolderish: true,
          sys_title: 'Repository',
        }),
      ],
    });

    const icon = must<HTMLElement>('.hxp-card-thumb-icon');
    expect(icon.classList.contains('hxp-card-thumb-icon--folder')).toBe(false);
  });

  it('emits the clicked document', () => {
    const clicked: Document[] = [];
    fixture.componentInstance.documentClick.subscribe((d) => clicked.push(d));

    render({ documents: [FILE, FOLDER] });
    all<HTMLButtonElement>('.hxp-doc-card')[1].click();

    // The document object itself, so the host does not have to look it up again by id.
    expect(clicked).toEqual([FOLDER]);
  });

  it('writes the id, title, thumbnail and type into the shared selection', () => {
    render({ documents: [FILE], thumbnails: { 'doc-1': 'blob:host/doc-1' } });

    checkboxes()[0].click();
    fixture.detectChanges();

    // The state the toolbar and bulk actions read, not a spy call. All four fields, because
    // the label and preview are what the selection chip renders.
    expect([...selection.selectedIds()]).toEqual(['doc-1']);
    expect(selection.selectedLabels().get('doc-1')).toBe('Invoice.pdf');
    expect(selection.selectedPreviews().get('doc-1')).toBe('blob:host/doc-1');
    expect(selection.selectedTypes().get('doc-1')).toBe('File');
  });

  it('reflects selection back into the card and the checkbox', () => {
    render({ documents: [FILE, FOLDER] });
    expect(checkboxes().map((c) => c.checked)).toEqual([false, false]);

    checkboxes()[0].click();
    fixture.detectChanges();

    expect(checkboxes().map((c) => c.checked)).toEqual([true, false]);
    expect(cards()[0].classList.contains('hxp-doc-card-wrapper--selected')).toBe(true);
    expect(cards()[1].classList.contains('hxp-doc-card-wrapper--selected')).toBe(false);
  });

  it('deselects on a second click', () => {
    render({ documents: [FILE] });

    checkboxes()[0].click();
    fixture.detectChanges();
    expect([...selection.selectedIds()]).toEqual(['doc-1']);

    checkboxes()[0].click();
    fixture.detectChanges();
    expect([...selection.selectedIds()]).toEqual([]);
    expect(selection.selectedLabels().get('doc-1')).toBeUndefined();
  });

  it('does not open the document when the checkbox is clicked', () => {
    // `stopPropagation` in `toggleSelection`. Without it, ticking a card's checkbox would
    // also navigate away from the list the user is selecting in.
    const clicked: Document[] = [];
    fixture.componentInstance.documentClick.subscribe((d) => clicked.push(d));

    render({ documents: [FILE] });
    checkboxes()[0].click();
    fixture.detectChanges();

    expect([...selection.selectedIds()]).toEqual(['doc-1']);
    expect(clicked).toEqual([]);
  });

  it('labels each checkbox with the document it selects', () => {
    render({ documents: [FILE, FOLDER] });

    // Distinct accessible names: "Select" alone on every checkbox is the common version of
    // this and is unusable with a screen reader.
    expect(checkboxes().map((c) => c.getAttribute('aria-label'))).toEqual([
      'Select Invoice.pdf',
      'Select Contracts',
    ]);
  });

  it('ignores a document with no sys_id rather than selecting an undefined key', () => {
    // `toggleSelection` returns early with no id, so nothing enters the shared selection. The
    // card still renders, which is right — dropping it would hide a document the server
    // returned.
    render({ documents: [doc({ sys_id: undefined, sys_title: 'No id' })] });

    expect(titles()).toEqual(['No id']);
    checkboxes()[0].click();
    fixture.detectChanges();

    // The part that matters, and it is correct: no `undefined` key in the selection.
    expect([...selection.selectedIds()]).toEqual([]);
  });

  it('leaves an id-less card visibly ticked while selecting nothing', () => {
    // DEFECT (reported, not changed). Asserting what the code ACTUALLY does.
    //
    // The checkbox is not `disabled`, so a native click flips the DOM `checked` property.
    // `isSelected(doc)` stays `false` because there is no id, and Angular does not re-write a
    // property binding whose bound value has not changed — so the tick stays on screen while
    // the model holds nothing. The user sees a selected card that no bulk action will touch.
    //
    // Evidently intended: the guard exists to avoid an `undefined` selection key, and it
    // achieves that. What it does not do is stop the checkbox from *appearing* to work; the
    // fix would be `[disabled]="!doc.sys_id"` in the template, which is a source change and so
    // out of scope for a test-only task.
    //
    // Severity is low because the bridge's own mapper always emits `sys_id` — `Document`'s
    // index signature is what makes the case expressible at all. Recorded so the next reader
    // does not take the passing test above as proof the UI is consistent.
    render({ documents: [doc({ sys_id: undefined, sys_title: 'No id' })] });

    expect(checkboxes()[0].disabled).toBe(false);
    checkboxes()[0].click();
    fixture.detectChanges();

    expect(checkboxes()[0].checked).toBe(true);
    expect([...selection.selectedIds()]).toEqual([]);
    // And the wrapper class — driven by the same `isSelected` — correctly does not light up,
    // which is what makes the divergence visible: checkbox ticked, card not highlighted.
    expect(cards()[0].classList.contains('hxp-doc-card-wrapper--selected')).toBe(false);
  });

  it('shows no thumbnail for a document with no sys_id', () => {
    render({ documents: [doc({ sys_id: undefined })], thumbnails: { '': 'blob:host/empty' } });
    expect(one('.hxp-card-thumb-img')).toBeNull();
  });
});
