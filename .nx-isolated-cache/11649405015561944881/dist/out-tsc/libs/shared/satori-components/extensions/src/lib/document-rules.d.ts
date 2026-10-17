import { type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import type { ExtensionRuleEvaluator } from './extension-rules';
/**
 * The document's type is one of `types`, matched exactly. `app.rules.isType` and
 * `app.rules.isNote` both answer through this, so they cannot disagree about a Note.
 */
export declare function documentTypeIsOneOf(document: NuxeoDocument | null, types: readonly string[]): boolean;
/**
 * The packaged document rules, as manifest-referenceable ids.
 *
 * These wrap the pure predicates already in
 * `libs/shared/nuxeo-client/src/lib/utils/document-permissions.ts`. They are
 * already `(doc) => boolean`, so this is **registration, not a rewrite** — the
 * permission logic is unchanged and still has its own tests next to it.
 *
 * `app.rules.hasSelection` and `app.rules.isAdministrator` are here because
 * every bulk action needs the first and several administration entries need the
 * second, and without them a manifest could not express "show this only when
 * something is selected" at all.
 *
 * **These are not a security control.** Nuxeo evaluates the real permission
 * server-side on every operation. A rule that returns `true` does not grant
 * anything, and hiding an action does not prevent an API call. See
 * `docs/extension-reference.md`.
 */
export declare const DOCUMENT_RULE_EVALUATORS: Readonly<Record<string, ExtensionRuleEvaluator>>;
//# sourceMappingURL=document-rules.d.ts.map