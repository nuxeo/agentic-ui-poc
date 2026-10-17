/**
 * The type-name comparisons document detail makes about the document in focus, and about a
 * section-tree node's icon, in one table.
 *
 * Not every type decision the page takes: it also calls the shared `nuxeo-client` predicates
 * `isFolderishDocument` and `isCollectionDocument` (redirects) and `isBlobHoldingDocType` (main-blob
 * fallback and retries), which other features use too and are not repeated here. Adding a type
 * means checking those as well as this table.
 *
 * Two kinds of decision live here, and they are kept apart on purpose:
 *
 * - **Which packaged piece renders the View tab** (`view`). This is the fallback the
 *   `documentView` slot sits in front of: a contributed entry whose rule admits the document wins,
 *   and when none does, or its component fails to load, the piece named here renders.
 * - **How the page loads and treats the content** (`picture`, `video`, `preview`), and the icon a
 *   type gets in the Publishing tab's section tree (`sectionIcon`). The fetches stay in the host;
 *   only the question "is this that type?" is answered here.
 *
 * Types match exactly, as Nuxeo type names are case-sensitive, and never through a parent: a
 * subtype of Picture takes the defaults, as it did when each check was an inline comparison.
 */
const DEFAULT_TRAITS = {
    view: 'documentViewer',
    picture: false,
    video: false,
    preview: true,
    sectionIcon: 'folder',
};
/**
 * The types with a trait of their own. Every other type — File, Audio, any custom type — takes the
 * defaults. Picture and Video open on the document viewer too: it chooses its presentation from
 * the content it is given (mime type, picture views, transcoded videos), not from the type.
 */
const OWN_TRAITS = [
    ['Note', { view: 'noteEditor' }],
    ['Picture', { picture: true }],
    ['Video', { video: true }],
    ['SectionRoot', { sectionIcon: 'library_books' }],
    ['Collection', { preview: false }],
    ['Folder', { preview: false }],
    ['Workspace', { preview: false }],
    ['Domain', { preview: false }],
    ['Section', { preview: false }],
    ['OrderedFolder', { preview: false }],
];
/** A `Map`, so a type named after an `Object.prototype` member cannot read that member. */
const TRAITS_BY_TYPE = new Map(OWN_TRAITS.map(([type, own]) => [type, { ...DEFAULT_TRAITS, ...own }]));
/** The traits of a document type; the defaults for an unknown, empty or absent one. */
export function documentTypeTraits(type) {
    return (type ? TRAITS_BY_TYPE.get(type) : undefined) ?? DEFAULT_TRAITS;
}
