import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, DestroyRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * WORKAROUND(adf-hx): W15 — upstream's document tree names its folder toggle after a property
 * its own node object does not have, so every toggle is announced as `Toggleundefined`.
 *
 * ## What upstream does
 *
 * `HxpDocumentTreeComponent`'s template binds
 *
 * ```html
 * [attr.aria-label]="('DOCUMENT_TREE.TOGGLE_ARIA-LABEL ' | translate) + node.name"
 * ```
 *
 * while `node` is a WRAPPER — the same template reads `node.document`, `node.isLoading` and
 * `node.isSelectable` from it, and renders the visible label as
 * `{{ node.document | breadcrumbLabel: 'DOCUMENT_TREE.ROOT' }}`. There is no `name` on the
 * wrapper at all, so `node.name` is `undefined` for **every** consumer of the component, not
 * just for us. Nothing in a catalogue or in our Nuxeo→Hx mapping can populate it: the binding
 * reads the wrapper, and upstream builds the wrapper.
 *
 * That is separate from, and compounds with, the trailing-space key defect recorded as W13 and
 * as finding 1.3. W13 stops the raw key being announced; it cannot supply a name that is not
 * there. Measured on the running application before this directive existed:
 *
 * ```
 * tree aria-labels: ["Toggleundefined", "Toggleundefined"]
 * ```
 *
 * ## Why a directive, and why it reads the rendered row
 *
 * The binding is inside upstream's own template, so there is no input, token or catalogue entry
 * that can change it — the options were to patch the attribute after render, fork the component,
 * or ship an accessible name that says `undefined`. This is the narrowest of the three.
 *
 * The name is taken from the row's **rendered** label rather than from `node.document`, for two
 * reasons: it is by construction the string the user sees, and it avoids this directive holding
 * a second opinion about how a document's display title is derived — upstream's
 * `CacheLabelService` resolves the root node through a translation key, and duplicating that
 * would drift.
 *
 * The label goes through `nav.tree.toggle`, which takes the folder name as an interpolation
 * PARAMETER. So this also fixes the half of finding 1.3 that W13 explicitly could not: upstream
 * concatenates, and a concatenated name cannot be reordered for a language that needs the noun
 * first. INFO-144 forbids exactly that, and D0c records it.
 *
 * **Removable** in full the moment upstream binds its visible label expression into the
 * `aria-label` instead of `node.name`.
 */
@Directive({
  selector: '[hxpDocumentTreeToggleName]',
  standalone: true,
})
export class HxpDocumentTreeToggleNameDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private observer?: MutationObserver;

  ngAfterViewInit(): void {
    this.apply();

    // `childList` and `subtree` only, deliberately NOT `attributes`.
    //
    // Observing attribute changes would see this directive's own `setAttribute` and re-enter
    // immediately. Structural changes are the ones that matter anyway: the tree adds and removes
    // node rows when a folder is expanded, collapsed or lazily loaded, and a row that appears
    // after the first pass is exactly the row that would otherwise keep upstream's broken name.
    this.observer = new MutationObserver(() => this.apply());
    this.observer.observe(this.host.nativeElement, { childList: true, subtree: true });

    // Belt and braces: `ngOnDestroy` disconnects, and so does this. A MutationObserver holding a
    // reference to a detached subtree is the shape of leak this repository has been bitten by
    // with blob URLs, and the cost of the second guard is a line.
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private apply(): void {
    const toggles = this.host.nativeElement.querySelectorAll<HTMLElement>(
      'mat-tree-node button[matTreeNodeToggle]',
    );

    for (const toggle of toggles) {
      const row = toggle.closest('mat-tree-node');
      // The visible label, which upstream renders from `node.document`. Read from the node
      // container rather than the whole row so the toggle's own icon ligature — `chevron_right`
      // or `expand_more` — does not become part of the accessible name.
      const label = row?.querySelector('.hxp-node-container')?.textContent?.trim();
      if (!label) continue;

      const name = this.translate.instant('nav.tree.toggle', { name: label });
      // Compared before writing. Without this every observer callback would write an identical
      // value to every toggle on every structural change to the tree.
      if (toggle.getAttribute('aria-label') !== name) {
        toggle.setAttribute('aria-label', name);
      }
    }
  }
}
