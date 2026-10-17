import { type NuxeoAce } from '@nuxeo/satori-platform/nuxeo-client';
/**
 * Nuxeo's `userVisiblePermissions` for a type with no list of its own, for a document read without
 * that enricher.
 */
export declare const NXS_DEFAULT_VISIBLE_PERMISSIONS: readonly string[];
/**
 * The permissions a dialog offers, as Web UI's: the document type's `userVisiblePermissions`, plus
 * `current` when an entry being edited holds one outside that list, so editing never changes it
 * silently.
 */
export declare function offeredRights(visible: readonly string[] | null | undefined, current?: string): readonly string[];
/** Who an entry names, as a person reads it: the display name, or an external user's email. */
export declare function principalLabel(ace: Pick<NuxeoAce, 'username' | 'usernameLabel'>): string;
/**
 * An entry's time frame as the permissions panel shows it: the calendar days its writer picked,
 * from whatever zone, rather than the UTC dates Nuxeo returns them as — "Until 15 July" for an end
 * written at midnight in Paris, which Nuxeo holds as 22:00 UTC on the 14th.
 */
export declare function nxsAceTimeFrame(ace: Pick<NuxeoAce, 'begin' | 'end'>, translate: (key: string, params?: Record<string, unknown>) => string, locale: string): string;
/** The key for a failed write: a refusal (401/403) reads as one rather than as a fault. */
export declare function failureKey(error: unknown, fallback: string): string;
//# sourceMappingURL=permission-dialog-support.d.ts.map