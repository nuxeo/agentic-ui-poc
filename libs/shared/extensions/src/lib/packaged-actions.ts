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
export const PACKAGED_BULK_ACTIONS: readonly ExtensionActionDescriptor[] = [
  {
    id: 'app.bulkActions.downloadZip',
    label: 'Download All as Zip',
    icon: 'download',
    order: 10,
  },
  {
    id: 'app.bulkActions.addToCollection',
    label: 'Add to Collection',
    icon: 'library_add',
    order: 20,
  },
  {
    id: 'app.bulkActions.compare',
    label: 'Compare',
    icon: 'compare',
    order: 30,
    // Visible but disabled below two documents, which is what the fixed markup's
    // `[disabled]="selectedCount() < 2"` did.
    enabledRule: 'app.rules.hasMultipleSelection',
  },
  {
    id: 'app.bulkActions.addToClipboard',
    label: 'Add to Clipboard',
    icon: 'content_paste',
    order: 40,
  },
  {
    id: 'app.bulkActions.publish',
    label: 'Publish Document',
    icon: 'publish',
    order: 50,
  },
  {
    id: 'app.bulkActions.delete',
    label: 'Delete selected',
    icon: 'delete',
    order: 60,
  },
];
