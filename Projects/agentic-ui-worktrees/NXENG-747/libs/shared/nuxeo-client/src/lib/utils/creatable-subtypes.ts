import type { NuxeoDocument } from '../models/document.model';
import { parseDocumentSubtypes, sortDocumentSubtypes } from './parse-document-subtypes';

/** Auto-provisioned structural containers under a domain — not user-created siblings. */
export const DOMAIN_STRUCTURAL_ROOT_TYPES = new Set([
  'SectionRoot',
  'WorkspaceRoot',
  'TemplateRoot',
]);

export const DOMAIN_CONTAINER_GUIDANCE =
  'Open Sections, Templates, or Workspaces, then create content inside those folders.';

export function isDomainParentType(parentType: string | null | undefined): boolean {
  return parentType === 'Domain';
}

/**
 * Domain-level subtypes from Nuxeo include structural roots; users must navigate into
 * the existing Sections / Templates / Workspaces containers instead.
 */
export function filterCreatableSubtypesForParent(
  parentType: string | null | undefined,
  subtypes: string[],
): string[] {
  if (!isDomainParentType(parentType)) {
    return subtypes;
  }
  return subtypes.filter((type) => !DOMAIN_STRUCTURAL_ROOT_TYPES.has(type));
}

/** Allowed child types for a folder document (subtypes enricher + domain filtering). */
export function resolveCreatableSubtypes(doc: NuxeoDocument): string[] {
  return sortDocumentSubtypes(
    filterCreatableSubtypesForParent(doc.type, parseDocumentSubtypes(doc)),
  );
}
