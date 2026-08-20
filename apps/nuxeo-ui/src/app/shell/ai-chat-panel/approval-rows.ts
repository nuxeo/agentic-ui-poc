import type {
  AgentApprovalAction,
  AgentApprovalRequest,
  AgentApprovalVerdict,
  AgentFormRequest,
} from '@agentic-ui/shared/agent-client';

import { describeValue, formatArgLine, truncate } from './chat-formatting';

/**
 * Turning a batch of pending writes into rows a person can review.
 *
 * Every write in a turn is interrupted together and arrives in one `RUN_FINISHED`, so a
 * model that asks for five writes produces five requests at once. Rendered as five copies
 * of the gateway's own sentence — "The assistant wants to run …, which changes content in
 * Nuxeo" — the only thing telling the third apart from the fourth is a uid on the argument
 * line, and answering them is queue-clearing rather than reviewing.
 *
 * These builders derive, per request, what would happen and what it would happen to. Every
 * part of that comes from the registered tool name and the call's own parsed arguments,
 * which is exactly what ADR 001 requires an approval to be built from: a summary the model
 * wrote can describe one action and perform another. Nothing here reads the model's prose,
 * and nothing here invents a name — where a document cannot be identified, the row shows
 * the raw uid.
 *
 * ## What used to be here, and why it left
 *
 * The verb and the argument roles were a table in this file, keyed on tool name. It read
 * well and it had a defect that no test would ever have caught: a server tool that changed
 * what it did while keeping its name left the row describing the old action, confidently,
 * on the one screen where being confidently wrong is worst. The declaration now travels on
 * the interrupt, from the same registration the gateway executes — see
 * `apps/agent-gateway/src/tools/tool.types.ts`, `MutationSpec`.
 *
 * What remains here is the table for tools the *browser* executes, which no gateway
 * declares because no gateway runs them. A server tool that arrives with no declaration
 * gets what it always got as a fallback: the gateway's own sentence and its raw arguments.
 */

/**
 * One piece of a row's action line: prose the shape supplies, a document the call names,
 * or a literal value the user is being asked to authorise.
 */
export type ApprovalSegment =
  | { kind: 'text'; text: string }
  | { kind: 'document'; uid: string; title?: string }
  | { kind: 'value'; text: string };

export interface ApprovalRowView {
  id: string;
  toolName: string;
  /**
   * The action line, when the tool is one whose shape is known. Empty for anything else,
   * which is what sends the row back to {@link ApprovalRowView.summary}.
   */
  segments: ApprovalSegment[];
  /** The gateway's sentence. Rendered only when no action line could be derived. */
  summary: string;
  /** Arguments no segment consumed — the tags, the properties — as one line of text. */
  detail: string;
  /**
   * The uids of the documents the action line named by title, printed under it.
   *
   * A title is a lookup; the uid is what the write actually carries, so both stay on
   * screen. A document whose title did not resolve is already showing its uid in the
   * action line and is not repeated here.
   */
  uids: string[];
  /**
   * The action line as one string, for the accessible name of the row and of its two
   * buttons. Five buttons all called "Approve" is the same defect as five cards all
   * carrying the same sentence, heard rather than seen.
   */
  label: string;
  /**
   * The form this row is answered with instead of Decline / Approve, when the
   * tool declared one that validated.
   *
   * The rest of the row is built anyway and stays on screen above the form: the
   * action line says what the write does and the uid says what it does it to,
   * and a form is a better way to answer that question rather than a reason to
   * stop asking it. Absent means the two buttons, which is what every write drew
   * before this channel existed.
   */
  form?: AgentFormRequest;
  verdict?: AgentApprovalVerdict;
}

export interface ApprovalBatchView {
  rows: ApprovalRowView[];
  total: number;
  answered: number;
  remaining: number;
}

/**
 * Writes the *browser* performs, which therefore have no server declaration to travel on
 * the interrupt. Same gate, same card, different executor.
 *
 * A server tool missing a declaration renders exactly as it did before any of this
 * existed: the gateway's sentence and the raw arguments. That fallback is what makes both
 * this table and the server's declarations safe — anything unrecognised claims less rather
 * than describing the wrong action confidently.
 */
const BROWSER_WRITE_SHAPES: Readonly<Record<string, AgentApprovalAction>> = {
  applyMetadata: { action: 'Change metadata on', subject: { arg: 'docId' } },
};

/** The declaration a row renders from, whoever supplied it. */
function shapeFor(request: AgentApprovalRequest): AgentApprovalAction | undefined {
  return request.action ?? BROWSER_WRITE_SHAPES[request.toolName];
}

/** Past this, a literal is the argument's content rather than a name for it. */
const VALUE_MAX = 90;

/**
 * The document ids the *browser* still has to resolve, so the panel knows what to ask for.
 *
 * Only the arguments a known shape declares as documents. Scanning every argument for
 * something uid-shaped would send whatever the model happened to put in a string field to
 * Nuxeo, which is both a wasted request and a way to make the panel's traffic
 * model-controlled.
 *
 * A request carrying a `targets` array is skipped entirely, even a short one. The gateway
 * has already read those documents as this same caller; a uid missing from its answer is
 * one Nuxeo would not give it, so asking again from here buys a second refusal rather than
 * a title. Absent `targets` means nobody has looked, and that is the case this resolves.
 */
export function approvalDocumentUids(requests: readonly AgentApprovalRequest[]): string[] {
  const uids = new Set<string>();
  for (const request of requests) {
    if (request.targets) continue;
    const shape = shapeFor(request);
    if (!shape) continue;
    if (shape.subject) for (const uid of readUids(request.args[shape.subject.arg])) uids.add(uid);
    if (shape.into) for (const uid of readUids(request.args[shape.into.arg])) uids.add(uid);
  }
  return [...uids];
}

/**
 * @param formsUnavailable ids whose declared form could not be mounted. Those
 * rows drop their form and render the two buttons, because a form that failed to
 * appear must leave the decision answerable rather than unanswerable.
 */
export function approvalBatch(
  requests: readonly AgentApprovalRequest[],
  titles: ReadonlyMap<string, string>,
  formsUnavailable: ReadonlySet<string> = new Set<string>(),
): ApprovalBatchView | null {
  if (requests.length === 0) return null;
  const rows = requests.map((request) => approvalRow(request, titles, formsUnavailable));
  const answered = rows.filter((row) => row.verdict).length;
  return { rows, total: rows.length, answered, remaining: rows.length - answered };
}

function approvalRow(
  request: AgentApprovalRequest,
  titles: ReadonlyMap<string, string>,
  formsUnavailable: ReadonlySet<string>,
): ApprovalRowView {
  const consumed = new Set<string>();
  const segments = buildSegments(request, resolvedTitles(request, titles), consumed);
  const rest = Object.entries(request.args).filter(([key]) => !consumed.has(key));
  return {
    id: request.id,
    toolName: request.toolName,
    segments,
    // A derived action line already says what the sentence says, and better. Keeping both
    // is how the current stack came to repeat one paragraph five times.
    summary: segments.length > 0 ? '' : request.summary,
    detail: formatArgLine(Object.fromEntries(segments.length > 0 ? rest : dropSummary(request))),
    uids: segments.flatMap((segment) =>
      segment.kind === 'document' && segment.title ? [segment.uid] : [],
    ),
    label: segments.length > 0 ? flatten(segments) : request.summary,
    ...(request.form && !formsUnavailable.has(request.id) ? { form: request.form } : {}),
    ...(request.verdict ? { verdict: request.verdict } : {}),
  };
}

function flatten(segments: readonly ApprovalSegment[]): string {
  return segments
    .map((segment) => (segment.kind === 'document' ? (segment.title ?? segment.uid) : segment.text))
    .join(' ');
}

/**
 * The action line, or nothing.
 *
 * Nothing when the tool is unknown, and nothing when a shape's own arguments are missing:
 * "Add tags to" with no document after it is worse than the sentence it replaced, and an
 * argument set the model malformed is exactly when a row must claim less rather than more.
 */
function buildSegments(
  request: AgentApprovalRequest,
  titles: ReadonlyMap<string, string>,
  consumed: Set<string>,
): ApprovalSegment[] {
  const shape = shapeFor(request);
  if (!shape) return [];
  const segments: ApprovalSegment[] = [{ kind: 'text', text: shape.action }];

  if (shape.subject) {
    const uids = readUids(request.args[shape.subject.arg]);
    if (uids.length === 0) return [];
    consumed.add(shape.subject.arg);
    for (const uid of uids) segments.push(documentSegment(uid, titles));
  }

  if (shape.value) {
    const text = truncate(describeValue(request.args[shape.value]), VALUE_MAX);
    if (!text) return [];
    consumed.add(shape.value);
    segments.push({ kind: 'value', text });
  }

  if (shape.into) {
    const [uid] = readUids(request.args[shape.into.arg]);
    // A missing destination does not invalidate the subject, so the row keeps what it can.
    if (uid) {
      consumed.add(shape.into.arg);
      segments.push({ kind: 'text', text: shape.into.preposition }, documentSegment(uid, titles));
    }
  }

  return segments;
}

/**
 * Titles for this request: the gateway's, then the browser's.
 *
 * The gateway's win because they were read as part of deciding whether the write could
 * happen at all, so a row showing one is a row whose target has been looked at. The
 * browser's map covers the tools the gateway never sees.
 */
function resolvedTitles(
  request: AgentApprovalRequest,
  browserTitles: ReadonlyMap<string, string>,
): ReadonlyMap<string, string> {
  if (!request.targets?.length) return browserTitles;
  const merged = new Map(browserTitles);
  for (const target of request.targets) merged.set(target.uid, target.title);
  return merged;
}

/**
 * A document as the row names it.
 *
 * The title is only ever the one the browser read back from Nuxeo for this uid, so it is
 * absent whenever the lookup has not answered or the caller cannot read the document. An
 * unresolved uid is then shown as itself: a wrong name on an approval row is worse than an
 * unfriendly one, because the whole point of the row is that the user knows what they are
 * agreeing to.
 */
function documentSegment(uid: string, titles: ReadonlyMap<string, string>): ApprovalSegment {
  const title = titles.get(uid);
  return { kind: 'document', uid, ...(title ? { title } : {}) };
}

function readUids(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '');
}

/**
 * The arguments of an undescribed call, minus whatever its own sentence is already using
 * as the headline. Matched on the value rather than a key name, so it holds whatever the
 * argument is called — `confirmAction` puts the question in `summary`, and printing it
 * again underneath makes the row read as if it were asking twice.
 */
function dropSummary(request: AgentApprovalRequest): [string, unknown][] {
  return Object.entries(request.args).filter(
    ([, value]) => describeValue(value) !== request.summary,
  );
}
