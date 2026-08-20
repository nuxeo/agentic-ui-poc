/**
 * Generative UI: how the gateway asks the browser to mount one of the
 * application's own components.
 *
 * Plan A7 stage 1: read-only widgets, chosen by which tool ran. ADR 001,
 * "Generative UI render transport", records the wire format as agreed and
 * implemented — two widgets ship, and the format survived the second without
 * gaining a field, which is what promoted it.
 *
 * Two properties are structural rather than conventional, and both are the whole
 * reason the file exists:
 *
 * **The model never names the component.** The mapping below is keyed on the
 * *registered tool name*, so the component is chosen by which tool the model
 * called — a choice already constrained to the registry — and not by anything it
 * wrote. There is no field on the wire the model can steer to select a widget.
 *
 * **The model never supplies the props.** The uids come out of the tool's own
 * result, which is Nuxeo's answer to the query under the caller's identity, so a
 * document the caller cannot read is not merely hidden from the list — it was
 * never matched. The browser then re-fetches each uid through the ordinary
 * services, under the caller's session, so nothing the model wrote reaches the
 * screen as content. The model does author the NXQL, which makes this an
 * arbitrary read *within the caller's permissions* — the same property the search
 * tool already has, and the reason the widget shows what Nuxeo returns rather
 * than what the model says it returned.
 */

/** The `CUSTOM.name` the client matches on. Any other name renders nothing, silently. */
export const RENDER_EVENT_NAME = 'render';

/**
 * Widget ids the client's allowlist recognises.
 *
 * Kept as a literal union rather than a string so adding a producer here without
 * adding the consumer there fails the build rather than the demo. The two lists
 * are pinned to each other by `render-events.spec.ts`; they cannot be a shared
 * module because `scope:agent-gateway` may depend on no workspace library.
 */
export type AgentWidgetName = 'documentList' | 'documentCard';

export interface AgentRenderRequest {
  /** The call this widget belongs under. The panel attaches it to that tool card. */
  readonly toolCallId: string;
  readonly component: AgentWidgetName;
  readonly props: Readonly<Record<string, unknown>>;
}

/**
 * Upper bound on uids in one widget.
 *
 * The client enforces its own, lower or equal, and that is the one that counts —
 * this exists so a paged search does not put a hundred rows in a 400px column.
 */
const MAX_RENDERED_DOCUMENTS = 25;

/** A uid shaped like something Nuxeo issued, and safe in a URL path segment. */
const UID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,63}$/;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** The `uid` of one result object, if it carries one that is uid-shaped. */
function uidOf(value: unknown): string | null {
  const uid = asRecord(value)?.['uid'];
  return typeof uid === 'string' && UID_PATTERN.test(uid) ? uid : null;
}

function documentIdsFrom(result: unknown): string[] {
  const entries = asRecord(result)?.['entries'];
  if (!Array.isArray(entries)) return [];

  const uids: string[] = [];
  for (const entry of entries) {
    const uid = uidOf(entry);
    if (!uid || uids.includes(uid)) continue;
    uids.push(uid);
    if (uids.length === MAX_RENDERED_DOCUMENTS) break;
  }
  return uids;
}

/** One list renderer, shared by every tool whose result is a page of documents. */
function documentListFrom(result: unknown): Omit<AgentRenderRequest, 'toolCallId'> | null {
  const docIds = documentIdsFrom(result);
  // An empty result is prose, not an empty table. The tool card already says
  // nothing was found, and a widget repeating it in a box is worse.
  return docIds.length > 0 ? { component: 'documentList', props: { docIds } } : null;
}

/**
 * The tools whose results mount a widget, and what each one mounts.
 *
 * A closed map, on the server side of the same allowlist discipline the browser
 * applies: a tool absent from it renders nothing at all, which is exactly today's
 * behaviour and the degradation path the skeleton has to preserve.
 */
const RENDERERS: Readonly<
  Record<string, (result: unknown) => Omit<AgentRenderRequest, 'toolCallId'> | null>
> = {
  'nuxeo.searchDocuments': documentListFrom,
  'nuxeo.listChildren': documentListFrom,

  // One document, so a card rather than a one-row table. `fields` is deliberately
  // not sent: which fields to show is a presentation choice, the card's default
  // is the application's answer to it, and a gateway that started choosing would
  // be composing a view — the tier plan A7 defers behind a capability flag.
  'nuxeo.getDocument': (result) => {
    const docId = uidOf(result);
    return docId ? { component: 'documentCard', props: { docId } } : null;
  },
};

/**
 * The render event a completed tool call should emit, or null for the tools —
 * which is most of them — that render nothing.
 */
export function renderRequestFor(
  toolName: string,
  toolCallId: string,
  result: unknown,
): AgentRenderRequest | null {
  const describe = RENDERERS[toolName];
  if (!describe) return null;
  const described = describe(result);
  return described ? { toolCallId, ...described } : null;
}

/** Tool names that can mount a widget. Exported for the conformance spec. */
export function renderingToolNames(): readonly string[] {
  return Object.keys(RENDERERS);
}

/**
 * The shared-state slice this gateway authors, and the only one it authors.
 *
 * ## Why this direction is `STATE_DELTA` and the other is not
 *
 * A7 stage 2 has to move selection both ways, and the two directions get
 * different mechanisms on purpose.
 *
 * *Gateway to browser* is what AG-UI shared state is for. The server is the
 * author, the SDK already applies RFC 6902 patches and maintains the document,
 * and the payload is advisory: a lost or reordered patch degrades to "no
 * suggestion", never to a wrong action. This slice is the whole of it.
 *
 * *Browser to gateway* stays context injection, and the user's own selection is
 * deliberately **never** mirrored into shared state. `STATE_DELTA` is
 * server-authored: if the confirmed selection had a copy in the state document,
 * the gateway could patch its own copy of "what the user chose" and the browser
 * would have no way to tell that from the real thing. That is precisely the
 * attack the provenance rule exists to prevent, so the field simply does not
 * exist. The confirmed selection is read from `SelectionService` at send time,
 * once, with one authority and no mirror to drift.
 *
 * Note what the gateway does *not* do with a proposal: it does not know whether
 * the uids are on the user's screen, and it does not need to. The browser
 * intersects them with what its mounted widgets are offering and drops the rest.
 */
export const SELECTION_STATE_KEY = 'selection';

export interface SelectionProposalState {
  readonly selection: { readonly proposed: readonly string[] };
}

/**
 * Note what is deliberately *not* here: a per-run "no suggestion yet" snapshot.
 *
 * It was, and it was wrong twice over. A run is not a turn — a frontend tool
 * hands the turn back to the browser and the continuation arrives as a second
 * run — so opening every run with an empty slice meant the run carrying
 * `selectDocuments` proposed and the very next run, the same user turn still in
 * flight, retracted it before the user saw anything. Live verification caught
 * that; no unit test did, because each run was correct on its own.
 *
 * The deeper mistake was retracting on a timer at all. A suggestion is rendered
 * inside the transcript entry where the agent made it, next to the rows it
 * names, so it does not go stale the way a floating banner would — it is part of
 * that turn's record. It ends for one of three reasons, none of which needs a
 * clock: the agent proposes again (`propose` replaces rather than accumulates),
 * the widget showing it leaves the transcript (`withdraw`), or the user takes it
 * by ticking. See `agent-selection.ts`.
 */

/**
 * A suggestion drawn from a `selectDocuments` call, or null.
 *
 * The uids are the model's, and that is fine here in a way it is nowhere else:
 * this channel cannot select anything. It puts a tick-shaped suggestion next to
 * rows the user is already looking at, and a person clicking one is the only
 * thing that makes it a selection.
 */
export function selectionProposalFor(
  toolName: string,
  rawArguments: string,
): SelectionProposalState | null {
  if (toolName !== SELECT_DOCUMENTS_TOOL_NAME) return null;
  let args: unknown;
  try {
    args = rawArguments.trim() === '' ? {} : JSON.parse(rawArguments);
  } catch {
    return null;
  }
  const docIds = asRecord(args)?.['docIds'];
  if (!Array.isArray(docIds)) return null;

  const proposed: string[] = [];
  for (const value of docIds) {
    if (typeof value !== 'string' || !UID_PATTERN.test(value)) continue;
    if (proposed.includes(value)) continue;
    proposed.push(value);
    if (proposed.length === MAX_RENDERED_DOCUMENTS) break;
  }
  return proposed.length > 0 ? { selection: { proposed } } : null;
}

/** The frontend tool whose call this gateway reflects into shared state. */
const SELECT_DOCUMENTS_TOOL_NAME = 'selectDocuments';

/**
 * ## How the widget names this gateway can emit are established
 *
 * They are not listed here. `render-events.spec.ts` derives them by scanning this
 * file's source, and pins them against the names the browser registers and against
 * the form-component names that must never appear here. A list restated beside
 * {@link RENDERERS} is a list that drifts from it.
 *
 * ## Why the check reads source text instead of running the renderers
 *
 * It used to call each renderer once with a single fixed probe — `{uid, entries:
 * [{uid}]}` — and collect what came back. That made the list *an* answer rather
 * than *the* answer: a renderer is a function of its result shape, and one shape
 * only reveals the branch that shape happens to take. The hole was demonstrated,
 * not theorised. Adding `documentMetadataForm` to `RENDERERS` naively fails four
 * tests; making the existing `documentListFrom` return `documentMetadataForm` for
 * `{editable: true, uid}` while still answering `documentList` to the probe passed
 * 573 of 573. The same blind spot hid any *widget* name from the browser-registry
 * check too, so the conformance guarantee was narrower than it read.
 *
 * Scanning the component-name literals out of this file's source covers every
 * branch of every renderer regardless of shape, and cannot be satisfied by a
 * renderer that hides a name behind a condition.
 *
 * **The scan lives in `render-events.spec.ts`, not here.** Two reasons, and the
 * first was found by trying it the other way. A scanner that reads the file it
 * lives in matches its own prose: the error message it throws has to quote the
 * pattern it looks for, so it finds that quotation and reports the file as naming a
 * component non-literally. Second, the spec is already where this repo keeps its
 * off-disk source scans — `browserWidgetNames()` and `browserFormNames()` read the
 * browser's registrations the same way, because `scope:agent-gateway` may depend on
 * no workspace library — so the three halves of the conformance check now sit
 * together and are read together.
 *
 * The scan must cover **this whole file**, not the `RENDERERS` literal. Renderers
 * are named functions defined above the map, so a name returned from a conditional
 * branch inside `documentListFrom` is nowhere near it. Bounding the scan to the map
 * let the attack described above straight through; `render-events.spec.ts` has a
 * test that fails if the bound is reintroduced.
 */
