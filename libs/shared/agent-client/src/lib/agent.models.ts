import type { AgentFormRequest } from './agent-form';

/**
 * The chat surface's view of an agent run.
 *
 * These types are deliberately ours rather than re-exports of `@ag-ui/core`.
 * AG-UI is pre-1.0: its event enum already marks `THINKING_*` deprecated "for removal
 * in 1.0.0" in favour of `REASONING_*`, and `Message` is a seven-way discriminated union
 * whose shape has moved between releases. Components bind to the types below, so an SDK
 * bump is absorbed inside `AgentRuntimeService` instead of rippling into templates.
 */

/** A turn in the transcript. Assistant content grows in place while it streams. */
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  /** Present on `tool` messages: the call this message answers. */
  toolCallId?: string;
  /**
   * Present on `assistant` messages: the calls this turn opened, in the order they were
   * streamed. This is what positions a tool card relative to the text around it, so a
   * message with tool calls and no prose is still part of the transcript.
   */
  toolCallIds?: string[];
  /** Grounded sources the gateway attributed to this message. */
  citations?: AgentCitation[];
}

/** A Nuxeo document the agent used to ground an answer. */
export interface AgentCitation {
  uid: string;
  title: string;
  path?: string;
  type?: string;
  /** Free-text locator (page, section) when the gateway can supply one. */
  excerpt?: string;
}

export type AgentToolCallStatus =
  | 'streaming'
  | 'awaiting-approval'
  | 'running'
  | 'complete'
  | 'rejected'
  | 'failed';

export interface AgentToolCall {
  id: string;
  name: string;
  /** Parsed arguments; partial while `status` is `streaming`. */
  args: Record<string, unknown>;
  status: AgentToolCallStatus;
  /** Stringified result once the call has been answered. */
  result?: string;
}

/**
 * One line of agent progress. Sourced from `STEP_STARTED`/`STEP_FINISHED`,
 * `REASONING_*` (including legacy `THINKING_*`, which the SDK's compatibility
 * middleware rewrites for us) and `CUSTOM` events named `thinking`.
 */
export interface AgentThinkingStep {
  id: string;
  label: string;
  detail?: string;
  status: 'active' | 'done';
}

/** The answer one decision has been given. Absent while it is still open. */
export type AgentApprovalVerdict = 'approved' | 'declined';

/**
 * A document an approval row names, resolved by the gateway rather than here.
 *
 * The gateway reads it with the caller's own forwarded credentials, so a title
 * present in this list is one Nuxeo was willing to show this user. A uid the
 * gateway could not read is absent rather than guessed at, and the row falls back
 * to printing the uid — a wrong name on an approval card is worse than an
 * unfriendly one.
 */
export interface AgentApprovalTarget {
  /** Matches the uid in {@link AgentApprovalRequest.args}. */
  uid: string;
  title: string;
  /** Nuxeo primary type, for the row's icon. */
  type?: string;
  /** Disambiguates two documents that share a title. */
  path?: string;
}

/**
 * How the row phrases what the write does, declared by the tool the gateway will
 * execute.
 *
 * `subject`, `value` and `into` name *arguments*, not values: the row reads the
 * named argument out of {@link AgentApprovalRequest.args} and renders it. So the
 * verb and the argument it applies to come from the same declaration as the code
 * that performs the write, rather than from a table here keyed on tool name — a
 * table that stays correct only until a tool changes what it does without
 * changing its name.
 */
export interface AgentApprovalAction {
  action: string;
  subject?: { arg: string };
  value?: string;
  into?: { preposition: string; arg: string };
}

/**
 * A pause for a human decision. Raised either by a frontend-declared tool the agent
 * called (`kind: 'tool'`) or by an AG-UI interrupt attached to `RUN_FINISHED`
 * (`kind: 'interrupt'`).
 */
export interface AgentApprovalRequest {
  id: string;
  kind: 'tool' | 'interrupt';
  toolName: string;
  /** Sentence shown to the user; always safe to render as text. */
  summary: string;
  args: Record<string, unknown>;
  /**
   * The tool's own phrasing for this write, when the producer supplied one.
   * Absent for a browser-executed tool, and for any server tool that declared
   * none — both fall back to {@link AgentApprovalRequest.summary}.
   */
  action?: AgentApprovalAction;
  /**
   * Documents the gateway resolved for this call, keyed to uids in `args`.
   *
   * Present, possibly short, whenever the gateway attempted resolution; absent
   * when it did not. The difference matters: an absent array means nobody has
   * looked, and the browser resolves the uids itself.
   */
  targets?: AgentApprovalTarget[];
  /**
   * The form this write may be answered with, when the tool declared one and the
   * declaration validated.
   *
   * Absent for every write that declares no form, which is all of them but
   * metadata edit, and absent for a declaration that did not hold up. Absent
   * means draw the approval card, exactly as before — the same degradation the
   * gateway makes, and the reason this channel could be added without a client
   * change being a prerequisite.
   *
   * Present does not make this a second write path. The form answers *this*
   * request's interrupt, through the same `resume` entry and the same
   * `approved === true` grant a card produces; the values the user typed ride
   * along on that grant rather than authorising anything by themselves.
   */
  form?: AgentFormRequest;
  /**
   * This request's own verdict, once the user has given it.
   *
   * Every write in a turn is interrupted together, so several requests can be open at
   * once and the run cannot resume until all of them are answered. An answered request
   * therefore stays in `approvals` — carrying nothing but its own verdict — until the
   * resumed run starts, so the surface can show what has been decided and what has not.
   * The verdict is per request and is never read as an answer to any other: it is a
   * label on the request the user acted on, and it is what makes answering twice a
   * no-op rather than a second `resume` entry.
   */
  verdict?: AgentApprovalVerdict;
}

/** Context pairs sent with every run so the agent knows where the user is. */
export interface AgentRunContext {
  page?: string;
  docId?: string;
  /**
   * Documents the **user** selected, and the only selection a turn may act on.
   *
   * Read from `SelectionService`, which by construction has no writer reachable
   * from the wire: an agent that wants a document selected proposes it, and the
   * proposal becomes a selection only when a person ticks it. See
   * `agent-selection.ts` for why that separation is structural.
   */
  selectionIds?: string[];
  /**
   * Documents the agent proposed and the user has not accepted.
   *
   * Sent so the model can see its own suggestion is still outstanding instead of
   * proposing it again every turn. It is a distinct field, described distinctly
   * to the model, precisely so that "proposed" can never be read as "selected".
   */
  proposedSelectionIds?: string[];
}

/** Executes a frontend-declared tool in the browser and returns the result content. */
export type AgentToolHandler = (
  args: Record<string, unknown>,
) => string | void | Promise<string | void>;
