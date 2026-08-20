import {
  DC,
  FILE,
  SYS,
  allContentOfFolder,
  childrenOfFolder,
  collectionMembers,
  trashedChildrenOfFolder,
  versionsOfDocument,
  type DocumentCapabilities,
  type FilterKind,
  type PermissionsCapabilities,
  type SearchCapabilities,
  type UploadCapabilities,
} from '@agentic-ui/shared/content-ports';

/**
 * Renditions are reported as unsupported *through the port*, matching the reference
 * Nuxeo adapter. Nuxeo serves renditions perfectly well and this product depends on
 * them heavily — they are simply not reachable through `getWithRendition`, whose
 * `RenditionRef.url` shape assumes a directly-fetchable URL. Nuxeo rendition URLs
 * require the session's auth headers, so they must be fetched as blobs.
 * `DocumentDetailService` keeps that surface.
 */
export const nuxeoDocumentCapabilities: DocumentCapabilities = {
  enrichments: {
    rendition: { supportedKinds: [] },
    breadcrumb: true,
    permissions: true,
    governance: false,
  },
  namespaces: [
    { ref: SYS, origin: 'nuxeo', documented: true },
    { ref: DC, origin: 'nuxeo', documented: true },
    { ref: FILE, origin: 'nuxeo', documented: true },
  ],
};

const SUPPORTED_FILTER_KINDS: readonly FilterKind[] = [
  'and',
  'or',
  'not',
  'eq',
  'in',
  'between',
  'startsWith',
  'fullText',
];

export const nuxeoSearchCapabilities: SearchCapabilities = {
  supportedNamedQueries: new Set([
    childrenOfFolder.key,
    allContentOfFolder.key,
    versionsOfDocument.key,
    trashedChildrenOfFolder.key,
    collectionMembers.key,
  ]),
  supportedFilterKinds: new Set(SUPPORTED_FILTER_KINDS),
  maxLimit: 1000,
  paginationMode: 'offset',
};

export const nuxeoPermissionsCapabilities: PermissionsCapabilities = {
  honours: {
    begin: true,
    end: true,
    deny: true,
    blockInheritance: true,
  },
};

export const nuxeoUploadCapabilities: UploadCapabilities = {
  resumable: false,
  maxConcurrent: 1,
  supportedConflictBehaviours: new Set<'fail' | 'overwrite' | 'autoRename'>(['autoRename']),
};
