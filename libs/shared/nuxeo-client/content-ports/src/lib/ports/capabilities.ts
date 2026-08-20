import type { NamespaceRef } from '../domain/refs';
import type { FilterKind } from './filter-spec';

/** Rendition kinds an adapter may support producing. */
export type RenditionKind = 'thumbnail' | 'preview' | 'pdf' | (string & Record<never, never>);

/** Optional structured schema for a known namespace; opaque at this layer. */
export interface NamespaceSchema {
  readonly fields: readonly string[];
}

/** Declares one namespace an adapter populates, and whether it is a stable contract. */
export interface NamespaceDescriptor {
  readonly ref: NamespaceRef;
  readonly origin: 'hxpr' | 'nuxeo' | 'app';
  readonly schema?: NamespaceSchema;
  readonly documented: boolean;
}

/** Which enrichments a document adapter honours; callers pre-flight against this. */
export interface DocumentCapabilities {
  readonly enrichments: {
    readonly rendition: { readonly supportedKinds: readonly RenditionKind[] };
    readonly breadcrumb: boolean;
    readonly permissions: boolean;
    readonly governance: boolean;
  };
  readonly namespaces: readonly NamespaceDescriptor[];
}

/** Which named queries, filter kinds, and pagination a search adapter supports. */
export interface SearchCapabilities {
  readonly supportedNamedQueries: ReadonlySet<string>;
  readonly supportedFilterKinds: ReadonlySet<FilterKind>;
  readonly maxLimit: number;
  readonly paginationMode: 'offset' | 'cursor' | 'both';
}

/** Which optional permission fields a permissions adapter honours. */
export interface PermissionsCapabilities {
  readonly honours: {
    readonly begin: boolean;
    readonly end: boolean;
    readonly deny: boolean;
    readonly blockInheritance: boolean;
  };
}

/** Which upload behaviours an upload adapter supports. */
export interface UploadCapabilities {
  readonly resumable: boolean;
  readonly maxConcurrent: number;
  readonly supportedConflictBehaviours: ReadonlySet<'fail' | 'overwrite' | 'autoRename'>;
}
