/**
 * The fields the metadata card can show.
 *
 * A separate file from the component, and deliberately free of any Angular
 * import. The widget definition validates against this set and must stay
 * cheap to import: a definition that reaches into the component file pulls the
 * component into whatever bundle registered the widget, which is the one thing
 * `load()` exists to prevent.
 *
 * A closed set, because it is the half of the props the agent chooses. Asking
 * for "creator and modified" is a choice between presentations the application
 * already ships; asking for an arbitrary property path would make the model the
 * author of what the card claims about a document.
 */
export type DocumentCardField =
  | 'type'
  | 'created'
  | 'modified'
  | 'creator'
  | 'contributor'
  | 'path'
  | 'state';

export const DOCUMENT_CARD_FIELDS: readonly DocumentCardField[] = [
  'type',
  'created',
  'modified',
  'creator',
  'contributor',
  'path',
  'state',
];
