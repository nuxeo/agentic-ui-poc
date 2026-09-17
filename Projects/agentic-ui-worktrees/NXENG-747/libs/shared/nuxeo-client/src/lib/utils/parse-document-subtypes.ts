import type { NuxeoDocument } from '../models/document.model';

export interface NuxeoSubtypeEntry {
  type: string;
  facets?: string[];
}

/** Preferred display order for common workspace content types. */
export const WORKSPACE_CONTENT_TYPE_ORDER = [
  'Audio',
  'Collection',
  'File',
  'Folder',
  'Note',
  'OrderedFolder',
  'Picture',
  'Video',
  'Workspace',
] as const;

const WORKSPACE_CONTENT_TYPE_SET = new Set<string>(WORKSPACE_CONTENT_TYPE_ORDER);

/**
 * Parses allowed child document types from the Nuxeo `subtypes` document enricher.
 * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
 */
export function parseDocumentSubtypes(doc: NuxeoDocument): string[] {
  const raw = doc.contextParameters?.['subtypes'];
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  const types: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) types.push(trimmed);
      continue;
    }
    if (item && typeof item === 'object') {
      const type = (item as NuxeoSubtypeEntry).type;
      if (typeof type === 'string' && type.trim()) {
        types.push(type.trim());
      }
    }
  }

  return [...new Set(types)];
}

/** Sorts API subtypes with workspace content types first (stable, known order). */
export function sortDocumentSubtypes(types: string[]): string[] {
  const known = WORKSPACE_CONTENT_TYPE_ORDER.filter((t) => types.includes(t));
  const rest = types.filter((t) => !WORKSPACE_CONTENT_TYPE_SET.has(t));
  return [...known, ...rest];
}
