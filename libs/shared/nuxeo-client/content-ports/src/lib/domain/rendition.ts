/**
 * A neutral request for a rendition. The `kind` is an open union so adapters can
 * expose backend-specific renditions while the three cross-backend-stable kinds
 * keep literal auto-completion.
 */
export interface RenditionSpec {
  readonly kind: 'thumbnail' | 'preview' | 'pdf' | (string & Record<never, never>);
  readonly width?: number;
  readonly height?: number;
}

/** A resolved rendition: a fetchable URL plus the mime type the backend produced. */
export interface RenditionRef {
  readonly url: string;
  readonly mimeType: string;
  readonly width?: number;
  readonly height?: number;
}

/** One hop in a node's ancestor breadcrumb, ordered root-first by convention. */
export interface BreadcrumbStep {
  readonly id: string;
  readonly name: string;
  readonly isFolderish: boolean;
}
