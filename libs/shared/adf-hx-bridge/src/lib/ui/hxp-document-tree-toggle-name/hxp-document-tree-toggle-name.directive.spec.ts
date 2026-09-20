import { ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { HxpDocumentTreeToggleNameDirective } from './hxp-document-tree-toggle-name.directive';

/**
 * W15 — the folder toggle's accessible name.
 *
 * The fixture is upstream's markup as it actually renders, written by hand: a `mat-tree-node`
 * whose toggle is bound to `node.name`, a property upstream's node wrapper does not have, so the
 * attribute arrives as the literal `Toggleundefined` while the visible label beside it is correct.
 * Reproduced literally rather than simplified, because the defect only exists in that shape.
 *
 * ## Why the DOM is built by hand rather than by a host component
 *
 * The first version of this spec used an `@for` host template and spent every assertion fighting
 * `NG0100` — the directive reacts on a MutationObserver microtask, which under
 * `provideZonelessChangeDetection` lands between Angular's own checks when the template mutates.
 * That tested Angular's scheduling, not the directive. Driving the DOM directly is deterministic
 * and is also closer to the real situation: upstream owns that template, and this directive only
 * ever sees the rendered result.
 *
 * The end-to-end proof is the evidence capture, which drives the real `HxpDocumentTreeComponent`
 * and was **observed going red** with the directive removed —
 * `label=Home name=Toggleundefined` — so the assertion behind it is known to be capable of
 * failing. These cover what that cannot reach cheaply: the parameterised key, a row appearing
 * after the first pass, the rows the directive must leave alone, and cleanup.
 */
describe('HxpDocumentTreeToggleNameDirective', () => {
  let host: HTMLElement;
  let directive: HxpDocumentTreeToggleNameDirective;

  /** Upstream's row: a toggle bound to the absent `node.name`, and the real label beside it. */
  function row(label: string, { expandable = true } = {}): HTMLElement {
    const node = document.createElement('mat-tree-node');
    if (expandable) {
      const toggle = document.createElement('button');
      toggle.setAttribute('matTreeNodeToggle', '');
      // What upstream's binding produces: the verb, then `undefined`.
      toggle.setAttribute('aria-label', 'Toggleundefined');
      toggle.innerHTML = '<mat-icon>chevron_right</mat-icon>';
      node.appendChild(toggle);
    }
    const container = document.createElement('div');
    container.className = 'hxp-node-container';
    container.textContent = label;
    node.appendChild(container);
    return node;
  }

  const names = () =>
    [...host.querySelectorAll('button[matTreeNodeToggle]')].map((button) =>
      button.getAttribute('aria-label'),
    );

  /** The observer delivers on a microtask; a macrotask is after it in every case. */
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    // The host exists before the injector, because `ElementRef` is provided as a reference to it.
    host = document.createElement('div');
    document.body.appendChild(host);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ElementRef, useFactory: () => new ElementRef(host) },
      ],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { nav: { tree: { toggle: 'Toggle {{ name }}' } } }, true);
    translate.use('en');
  });

  afterEach(() => {
    directive?.ngOnDestroy();
    host.remove();
  });

  /** Built inside the injector, so its `inject()` calls resolve — including our `ElementRef`. */
  function attach(): HxpDocumentTreeToggleNameDirective {
    const created = TestBed.runInInjectionContext(() => new HxpDocumentTreeToggleNameDirective());
    created.ngAfterViewInit();
    return created;
  }

  it('replaces the undefined name with the row label, through the catalogue key', async () => {
    host.append(row('Home'), row('Default domain'));
    directive = attach();
    await settle();
    expect(names()).toEqual(['Toggle Home', 'Toggle Default domain']);
  });

  it('leaves no toggle announcing the literal word undefined', async () => {
    host.append(row('Home'));
    directive = attach();
    await settle();
    for (const name of names()) expect(name).not.toMatch(/undefined/i);
  });

  it('names a row that appears after the first pass, as expanding a folder does', async () => {
    host.append(row('Home'));
    directive = attach();
    await settle();

    host.appendChild(row('Workspaces'));
    await settle();
    expect(names()).toEqual(['Toggle Home', 'Toggle Workspaces']);
  });

  // A leaf has no toggle. The directive must not invent one, nor throw looking for it.
  it('ignores a row with no toggle button', async () => {
    host.append(row('Report.pdf', { expandable: false }));
    directive = attach();
    await settle();
    expect(names()).toEqual([]);
  });

  // Upstream shows a skeleton loader while a node loads, so the label can be empty. Naming the
  // toggle after an empty string would replace a wrong name with a worse one.
  it('leaves a toggle alone while its row has no label yet', async () => {
    host.append(row(''));
    directive = attach();
    await settle();
    expect(names()).toEqual(['Toggleundefined']);
  });

  it('follows the active language, because the name goes through the catalogue', async () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'fr',
      { nav: { tree: { toggle: 'Développer ou réduire {{ name }}' } } },
      true,
    );
    translate.use('fr');

    host.append(row('Accueil'));
    directive = attach();
    await settle();
    expect(names()).toEqual(['Développer ou réduire Accueil']);
  });

  // The observer holds a reference to the subtree it watches. Left connected it is the same shape
  // of leak this repository has been bitten by with blob URLs.
  it('stops reacting once destroyed', async () => {
    host.append(row('Home'));
    directive = attach();
    await settle();

    directive.ngOnDestroy();
    host.appendChild(row('Workspaces'));
    await settle();
    expect(names()).toEqual(['Toggle Home', 'Toggleundefined']);
  });
});
