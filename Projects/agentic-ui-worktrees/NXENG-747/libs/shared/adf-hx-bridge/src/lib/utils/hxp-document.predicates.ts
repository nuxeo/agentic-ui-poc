import type { Document } from '@hylandsoftware/hxcs-js-client';

import { isHxRootDocument } from '../tokens/adf-hx-bridge.tokens';

/**
 * A folder that is not the synthetic repository root.
 *
 * Lives here rather than beside `AdfHxDocumentService`, which is where it started. That service
 * imports upstream's API tokens, so anything importing this predicate from it pulled `@alfresco/*`
 * along — and `nuxeo-document-router.service.ts` did exactly that, which put adf-hx back on a path
 * reachable from the bridge's public barrel. Found by the `guardrails` API-surface gate.
 */
export function isHxFolder(document: Document): boolean {
  return document.sys_isFolderish === true && !isHxRootDocument(document);
}
