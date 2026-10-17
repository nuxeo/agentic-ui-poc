import type { ExtensionActionDescriptor } from './extension-actions';
/**
 * The bulk actions the product ships with.
 *
 * The same six controls, in the same order, with the same icons and tooltips
 * that `selection-topbar.component.html` held as fixed markup before this
 * change — reproducing today's behaviour exactly is the requirement. What
 * changed is that each is now **addressable by id**, so hiding, reordering,
 * relabelling or rule-gating one is a manifest edit, and adding one is a
 * registration rather than an edit to three files across two projects.
 *
 * Note what is deliberately **not** here: permission rules. Today's topbar
 * offers all six regardless of what the user may do with the selection, and
 * `ExtensionRuleContext.selection` is still empty, so adding
 * `app.rules.canRemoveSelection` to Delete would hide it from everyone. The
 * server-side Nuxeo permission is, as always, the thing that actually decides.
 */
export declare const PACKAGED_BULK_ACTIONS: readonly ExtensionActionDescriptor[];
/**
 * The document-detail toolbar and its overflow menu.
 *
 * The same controls, in the same order, with the same icons, tooltips and
 * gating that `document-detail.html` held as fixed markup — the `@if`
 * conditions that wrapped each button are now `rule`s, and the `[disabled]`
 * bindings that read `actionInProgress()` are now `enabledRule`s over
 * `app.rules.isNotBusy`. The lock pair has since moved to Web UI's behaviour:
 * its icon shows the document's state and Unlock is shown to every reader.
 *
 * `overflow: true` puts an entry behind the "More actions" menu. A manifest
 * promotes one to the toolbar by restating its id with `"overflow": false`.
 *
 * Each toggle is **two descriptors gated by opposite rules** rather than one
 * whose label the component swaps, so a customer relabelling "Notify Me"
 * without relabelling "Unsubscribe" gets exactly that.
 *
 * The knowledge-enrichment and Content Lake controls are **not** here. They
 * render progress spinners and a three-state ingest marker rather than a
 * button, so a descriptor cannot express them; they remain markup.
 */
export declare const PACKAGED_DOCUMENT_TOOLBAR_ACTIONS: readonly ExtensionActionDescriptor[];
/**
 * The browse document context menu — the "More actions" menu on the browse
 * header, acting on the folder or document currently open.
 *
 * Named `contextMenu` because that is the slot it fills. **Browse has no
 * per-row menu**, in this build or before it: the slot's one-line description
 * said "row-level menu on a document list" while the only menu in
 * `browse.html` was this one. The id is the contract, so it stays; the
 * description in `docs/extension-reference.md` was corrected instead.
 */
export declare const PACKAGED_BROWSE_CONTEXT_MENU: readonly ExtensionActionDescriptor[];
/**
 * The menu on each row of browse's document list, acting on that row's document.
 *
 * Each row resolves this slot with the row's document as the focused one, so `rule` and
 * `enabledRule` read that document's own permissions and properties, not the folder's. Rename
 * changes `dc:title`, as Web UI's title edit does; Copy to and Move to choose a destination folder
 * and run `Document.Copy` and `Document.Move`; Delete moves the document to the trash.
 *
 * As everywhere, these rules decide what the interface offers. Nuxeo checks the permission on the
 * request itself.
 */
export declare const PACKAGED_ROW_ACTIONS: readonly ExtensionActionDescriptor[];
//# sourceMappingURL=packaged-actions.d.ts.map