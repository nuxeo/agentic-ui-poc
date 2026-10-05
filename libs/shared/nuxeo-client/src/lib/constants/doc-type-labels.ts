/** Catalogue keys for the document types the packaged application knows about. */
export const DOC_TYPE_LABEL_KEYS: Record<string, string> = {
  Audio: 'doc-type.audio',
  Collection: 'doc-type.collection',
  File: 'doc-type.file',
  Folder: 'doc-type.folder',
  Note: 'doc-type.note',
  OrderedFolder: 'doc-type.ordered-folder',
  Picture: 'doc-type.picture',
  Video: 'doc-type.video',
  Workspace: 'doc-type.workspace',
  Section: 'doc-type.section',
  SectionRoot: 'doc-type.section-root',
  TemplateRoot: 'doc-type.template-root',
  Domain: 'doc-type.domain',
  WorkspaceRoot: 'doc-type.workspace-root',
  Root: 'doc-type.root',
};

/**
 * The display name of a Nuxeo document type.
 *
 * A known type resolves through the catalogue. A type a customer has added has no key, so its
 * own name is shown with the camel case split (`InvoiceRecord` → `Invoice Record`) — it can never
 * render as a raw `doc-type.*` key. The same fallback applies when the catalogue has not loaded
 * and `translate` hands the key back unchanged.
 */
export function docTypeLabel(type: string, translate: (key: string) => string): string {
  const key = DOC_TYPE_LABEL_KEYS[type];
  if (key) {
    const resolved = translate(key);
    if (resolved && resolved !== key) return resolved;
  }
  return type.replace(/([a-z])([A-Z])/g, '$1 $2');
}
