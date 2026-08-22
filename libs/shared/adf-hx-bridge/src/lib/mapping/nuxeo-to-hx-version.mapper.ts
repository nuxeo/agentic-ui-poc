import type { Document } from '@hylandsoftware/hxcs-js-client';
import type { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import { DEFAULT_REPOSITORY_ID } from '../tokens/adf-hx-bridge.tokens';
import { mapNuxeoDocumentToHx } from './nuxeo-to-hx-document.mapper';

/**
 * The version fields adf-hx's versions panel reads.
 *
 * Declared here rather than imported: upstream's equivalent is `VersionableDocument` in
 * `@alfresco/adf-hx-content-services/services`, and this file is reachable from the bridge's
 * main barrel. Importing an `@alfresco/*` type here would both leak an adf-hx type into our
 * public API and pull adf-core into the initial bundle — the two things
 * `libs/shared/adf-hx-bridge/src/providers.ts` exists to prevent. `Document` carries an index
 * signature, so the extra keys are structurally assignable to what upstream expects.
 *
 * Every field is optional upstream, and the ones Nuxeo cannot answer are left **unset**
 * rather than filled with a near-miss. See `mapNuxeoVersionToHx` for which those are and why.
 */
export interface HxVersionDocument extends Document {
  sysver_isVersion?: boolean;
  sysver_isCheckedIn?: boolean;
  sysver_created?: string;
  sysver_creator?: string;
  sysver_title?: string;
  sysver_description?: string;
  sysver_expires?: string;
}

/**
 * Nuxeo's version label, which its REST payload does not carry.
 *
 * Nuxeo exposes `uid:major_version` and `uid:minor_version` as separate integers and has no
 * top-level `versionLabel` field — verified against the local instance, where a version cut
 * by two `Document.CheckIn` calls answered `uid:major_version: 0, uid:minor_version: 2` and
 * no `versionLabel` at all. Composing it here is what Nuxeo's own UI does.
 *
 * Returns `undefined` when neither number is present, so the panel falls back to the version
 * date rather than displaying a bare `undefined.undefined`.
 */
export function nuxeoVersionLabel(doc: NuxeoDocument): string | undefined {
  const major = doc.properties?.['uid:major_version'];
  const minor = doc.properties?.['uid:minor_version'];
  if (typeof major !== 'number' && typeof minor !== 'number') {
    return undefined;
  }
  return `${typeof major === 'number' ? major : 0}.${typeof minor === 'number' ? minor : 0}`;
}

/**
 * A Nuxeo version snapshot as the `sysver_*`-bearing document adf-hx's versions panel wants.
 *
 * Three deliberate gaps, all of them Nuxeo's rather than this mapper's:
 *
 * - **`sysver_description`** is upstream's *version comment*. Nuxeo does not store the
 *   check-in comment on the version document — it goes to the audit log as the
 *   `documentCheckedIn` event's `eventComment`. Mapping `dc:description` into it would show
 *   the *document's* description as if it were the version's comment, so it is left unset and
 *   the panel omits the block (`@if(version.sysver_description)`).
 * - **`sysver_expires`** has no Nuxeo equivalent: versions do not expire. Unset renders
 *   upstream's "never expires", which is the truth here rather than a default.
 * - **`sys_version`** is a single number upstream; Nuxeo's version is a major/minor pair.
 *   Left unset rather than collapsed into one of the two.
 *
 * `sys_parentId` is overridden to `versionableId` — the **live** document — because that is
 * what `DocumentVersionsService.getCurrentDocument` follows when the panel is opened on a
 * version. Nuxeo's own `parentRef` on a version points at the live document's *folder*, so
 * leaving the base mapper's value there would send that lookup to the wrong document.
 */
export function mapNuxeoVersionToHx(
  doc: NuxeoDocument,
  repositoryId: string = DEFAULT_REPOSITORY_ID,
): HxVersionDocument {
  const base = mapNuxeoDocumentToHx(doc, repositoryId);
  const props = doc.properties ?? {};
  // Who cut the version, not who created the document. Nuxeo copies the live document's
  // `dc:creator` onto every snapshot, so it answers the wrong question; the snapshot's
  // `dc:lastContributor` is the last person to touch it before check-in.
  const cutBy = props['dc:lastContributor'] ?? props['dc:creator'];

  return {
    ...base,
    sys_parentId: doc.versionableId ?? base.sys_parentId,
    sysver_isVersion: true,
    sysver_isCheckedIn: doc.isCheckedOut === false,
    sysver_created: doc.lastModified,
    sysver_creator: typeof cutBy === 'string' && cutBy ? cutBy : undefined,
    sysver_title: nuxeoVersionLabel(doc),
  };
}

export function mapNuxeoVersionsToHx(
  docs: readonly NuxeoDocument[],
  repositoryId?: string,
): HxVersionDocument[] {
  return docs.map((doc) => mapNuxeoVersionToHx(doc, repositoryId));
}
