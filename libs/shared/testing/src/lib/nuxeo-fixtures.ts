/**
 * Typed test fixtures for Nuxeo models.
 *
 * ## Design principles (from integration-test-audit.md §10.2 AC2)
 *
 * 1. **Every *required* field filled.** No `Partial<>` escape hatch on the base fixture:
 *    a factory returns a value the compiler accepts as the whole model, so a missing required
 *    field is a compile error rather than a runtime surprise.
 *
 *    This principle read "every field required" and that was not true of any fixture here.
 *    `NuxeoDocument` declares thirteen genuinely optional fields — `parentRef`, `state`,
 *    `isTrashed`, `isVersion`, `facets`, `contextParameters` among them — and
 *    `nuxeoDocument()` sets none of them. A spec that reads `doc.facets` off an un-overridden
 *    fixture gets `undefined`, not a default, and the sentence above said otherwise. **Any
 *    optional field a spec depends on must be passed explicitly in `over`.**
 *
 * 2. **One factory per model.** Not a god-object with 40 overrides. Each fixture fills one
 *    specific shape and does it completely.
 *
 * 3. **Type-safe overrides.** The `over` parameter accepts `Partial<T>` to allow selective
 *    override, but the base fixture provides every required field. A field-type change in the
 *    model breaks compilation in exactly the specs that use these fixtures — that's the negative
 *    control that proves they're coupled correctly.
 *
 * Extracted from duplicate builders in:
 * - libs/shared/adf-hx-bridge/src/lib/api/nuxeo-document-api.spec.ts (lines 42-63)
 * - libs/shared/adf-hx-bridge/src/lib/api/nuxeo-copy-move-api.spec.ts (lines 22-30)
 * - libs/shared/adf-hx-bridge/src/lib/api/nuxeo-checkin-api.spec.ts (lines 23-31)
 * - libs/shared/adf-hx-bridge/src/lib/services/nuxeo-acl-write.spec.ts (lines 271-281, 341-351)
 */

import type { NuxeoDocument, NuxeoAce } from '@nuxeo-satori/platform/nuxeo-client';

/**
 * A Nuxeo document with every **required** field of `NuxeoDocument` filled: `uid`, `title`,
 * `type`, `path`, `lastModified` and `properties`, describing a typical File in a workspace.
 *
 * The thirteen optional fields are deliberately **absent**, not defaulted — `parentRef`,
 * `lockOwner`, `lockCreated`, `state`, `isTrashed`, `isCheckedOut`, `isVersion`,
 * `versionableId`, `isLatestVersion`, `isLatestMajorVersion`, `facets` and
 * `contextParameters`. A live Nuxeo omits them too unless the enricher that supplies them was
 * requested, so absent is the honest default; inventing one would make specs pass against data
 * the server would not have sent. **Pass any of them in `over` if the spec under test reads
 * it**, rather than relying on the fixture to have a value there.
 *
 * @param over - Selective overrides. Required fields already have values; optional fields have
 * none until you supply them here.
 *
 * @example
 * ```ts
 * const folder = nuxeoDocument({ type: 'Folder', title: 'Reports' });
 * const note = nuxeoDocument({
 *   type: 'Note',
 *   path: '/default-domain/workspaces/shared/note-1',
 *   properties: { 'note:note': 'Meeting minutes' }
 * });
 * ```
 */
export function nuxeoDocument(over: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'doc-1',
    title: 'Invoice',
    type: 'File',
    path: '/default-domain/workspaces/ws/Invoice',
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    ...over,
  };
}

/**
 * One complete Nuxeo ACE (Access Control Entry). Every field that appears optional on `NuxeoAce`
 * is required; the type system allows `null` but does not allow omission.
 *
 * This fixture was extracted because partial literals behind casts hid incomplete test data, and
 * the comment on line 39 of `nuxeo-document-api.spec.ts` explicitly calls out that problem.
 *
 * @param over - Selective overrides. Defaults represent a granted Read permission for user `jdoe`
 * with no time bounds.
 *
 * @example
 * ```ts
 * const writeGrant = nuxeoAce({ permission: 'Write', username: 'admin' });
 * const timedGrant = nuxeoAce({
 *   begin: '2026-01-01',
 *   end: '2026-12-31',
 *   status: 'pending'
 * });
 * const externalShare = nuxeoAce({
 *   username: 'email:user@example.com',
 *   externalUser: true,
 *   permission: 'ReadWrite'
 * });
 * ```
 */
export function nuxeoAce(over: Partial<NuxeoAce> = {}): NuxeoAce {
  return {
    id: '1',
    username: 'jdoe',
    externalUser: false,
    permission: 'Read',
    granted: true,
    creator: null,
    begin: null,
    end: null,
    status: 'effective',
    ...over,
  };
}
