import type { ExtensionColumnDescriptor } from './extension-actions';

/**
 * The browse document-list columns the product ships with.
 *
 * The same twelve columns, in the same order, with the same labels and the same
 * four switched on by default that `column-settings-dialog.ts` held as a
 * hardcoded `ALL_COLUMNS` const before this change — reproducing today's
 * behaviour exactly is the requirement. What changed is that each is now
 * **addressable by id**, so hiding, reordering or relabelling one is a manifest
 * edit rather than a source change.
 *
 * `ExtensionColumnDescriptor` existed before anything registered or read it, and
 * `documentList` was one of the five reserved slot ids that
 * `AGENTS/11-beta-program.md` section 3 warns about: "a slot id existing does not
 * mean anything reads it. Do not describe a reserved id as an extension point."
 * This is the registration and the consumer that make it real.
 *
 * ## Precedence
 *
 * Three layers, narrowest last:
 *
 * 1. these descriptors — what the product ships
 * 2. the manifest — a customer hides, reorders or relabels by id (Layer 1)
 * 3. the user's own column picker, persisted in `localStorage` — visibility only
 *
 * A customer who `disabled`s a column removes it from the picker too, so a user
 * preference cannot resurrect it. A customer who sets `hiddenByDefault` only
 * changes the starting state, and a user may still switch it on.
 *
 * ## `field` values
 *
 * These are the keys the browse row template already reads off its view model,
 * not raw Nuxeo property paths. `title` is not `dc:title` because the row binds
 * a computed display title. Migrating to Nuxeo paths is Phase 3's concern, when
 * the adf-hx `document-list` brings its own column contract.
 */
export const PACKAGED_BROWSE_COLUMNS: readonly ExtensionColumnDescriptor[] = [
  // `title` is the row's identity. `togglePendingColumn` refuses to switch it off,
  // and that guard is kept rather than expressed here: a manifest may legitimately
  // relabel or reorder it, so `disabled` would be the wrong tool and there is no
  // "required" flag on the descriptor.
  { id: 'app.documentList.title', label: 'Title', field: 'title', order: 10, sortable: true },
  {
    id: 'app.documentList.type',
    label: 'Type',
    field: 'type',
    order: 20,
    sortable: true,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.modified',
    label: 'Modified',
    field: 'modified',
    order: 30,
    sortable: true,
  },
  {
    id: 'app.documentList.lastContributor',
    label: 'Last Contributor',
    field: 'lastContributor',
    order: 40,
    sortable: true,
  },
  {
    id: 'app.documentList.state',
    label: 'State',
    field: 'state',
    order: 50,
    sortable: true,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.version',
    label: 'Version',
    field: 'version',
    order: 60,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.created',
    label: 'Created',
    field: 'created',
    order: 70,
    sortable: true,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.author',
    label: 'Author',
    field: 'author',
    order: 80,
    sortable: true,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.nature',
    label: 'Nature',
    field: 'nature',
    order: 90,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.coverage',
    label: 'Coverage',
    field: 'coverage',
    order: 100,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.subjects',
    label: 'Subjects',
    field: 'subjects',
    order: 110,
    hiddenByDefault: true,
  },
  {
    id: 'app.documentList.flags',
    label: 'Flags',
    field: 'flags',
    order: 120,
    hiddenByDefault: true,
  },
];
