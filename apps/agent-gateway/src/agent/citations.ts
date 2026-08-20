/**
 * Grounded citations, and how they reach the browser.
 *
 * Citations do NOT travel inside `TOOL_CALL_RESULT`. The client does not look
 * there, so a grounded answer would stream with its sources silently dropped —
 * no error, no warning, just a missing Sources strip that nobody notices until a
 * demo. They travel on their own `CUSTOM` event, per ADR 001 "Citation
 * transport", and `AgentRuntimeService.applyCustomEvent` keys on this exact
 * name.
 *
 * The opt-in for a tool is one field: return a top-level `citations` array from
 * `execute` and the runtime lifts it onto the wire. Nothing else changes, and
 * the model still sees the citations in the tool result, which is what lets it
 * write "[1]" style prose about them.
 */

/**
 * The client's citation contract, from `AgentCitation` in
 * `libs/shared/agent-client/src/lib/agent.models.ts`.
 *
 * `uid` is load-bearing beyond identity: the chat panel routes `/doc/<uid>` when
 * a source card is clicked, so a citation whose uid is not a Nuxeo document id
 * renders a card that navigates nowhere.
 */
export interface AgentCitation {
  readonly uid: string;
  readonly title: string;
  readonly path?: string;
  readonly type?: string;
  readonly excerpt?: string;
}

/** The `CUSTOM.name` the client matches on. Changing it breaks citations silently. */
export const CITATIONS_EVENT_NAME = 'citations';

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

/**
 * Content Lake object ids are `sourceId__documentId`. The tail is the Nuxeo uid,
 * which is what the chat panel can actually navigate to. Same rule as
 * `extractNuxeoDocumentId` in `libs/shared/kd-client`; duplicated rather than
 * imported because that library is Angular and this is a Node process.
 */
function nuxeoUidFromObjectId(objectId: string): string {
  const tail = objectId.split('__').pop();
  return tail && tail !== objectId ? tail : objectId;
}

function toCitation(value: unknown): AgentCitation | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const objectId = readString(record['objectId']);
  const uid =
    readString(record['uid']) ??
    readString(record['id']) ??
    (objectId ? nuxeoUidFromObjectId(objectId) : undefined);
  // A citation the user cannot open is worse than no citation: it looks like a
  // source and behaves like a dead link.
  if (!uid) return null;

  const excerpt = readString(record['excerpt']) ?? readString(record['content']);
  return {
    uid,
    title: readString(record['title']) ?? uid,
    ...(readString(record['path']) ? { path: readString(record['path']) as string } : {}),
    ...(readString(record['type']) ? { type: readString(record['type']) as string } : {}),
    ...(excerpt ? { excerpt } : {}),
  };
}

/**
 * Lifts the citations a tool result carries, if any.
 *
 * Deliberately tolerant about the entry shape — `uid`, `id` and Content Lake's
 * `objectId` all resolve — because the tools wrap several upstream APIs and
 * normalising here is what keeps that variation out of the wire contract.
 * Duplicates are collapsed on `uid`, keeping the first (highest ranked) entry.
 */
export function extractCitations(result: unknown): AgentCitation[] {
  if (!result || typeof result !== 'object' || Array.isArray(result)) return [];
  const raw = (result as Record<string, unknown>)['citations'];
  if (!Array.isArray(raw)) return [];

  const byUid = new Map<string, AgentCitation>();
  for (const entry of raw) {
    const citation = toCitation(entry);
    if (citation && !byUid.has(citation.uid)) byUid.set(citation.uid, citation);
  }
  return [...byUid.values()];
}
