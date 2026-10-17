import type { NuxeoDocument } from '../models/document.model';
/** Auto-provisioned structural containers under a domain — not user-created siblings. */
export declare const DOMAIN_STRUCTURAL_ROOT_TYPES: Set<string>;
/** Catalogue key for the notice telling the user where content can be created under a domain. */
export declare const DOMAIN_CONTAINER_GUIDANCE_KEY = "browse.message.domain-container-guidance";
export declare function isDomainParentType(parentType: string | null | undefined): boolean;
/**
 * Domain-level subtypes from Nuxeo include structural roots; users must navigate into
 * the existing Sections / Templates / Workspaces containers instead.
 */
export declare function filterCreatableSubtypesForParent(parentType: string | null | undefined, subtypes: string[]): string[];
/** Allowed child types for a folder document (subtypes enricher + domain filtering). */
export declare function resolveCreatableSubtypes(doc: NuxeoDocument): string[];
//# sourceMappingURL=creatable-subtypes.d.ts.map