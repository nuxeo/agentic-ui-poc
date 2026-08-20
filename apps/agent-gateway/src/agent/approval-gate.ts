import type { RunAgentInput } from '@ag-ui/core';

import { requiresApproval } from '../tools/mutation-policy';
import type { ToolRegistry } from '../tools/tool-registry';
import type { AgentTool, MutationSpec } from '../tools/tool.types';
import type { InterruptFormRender } from './interrupt-forms';
import type { ApprovalTarget } from './write-preflight';

/**
 * The run-level half of the mutation gate: how a human decision gets from the
 * browser back to a specific tool call, and why nothing the model emits can
 * imitate one.
 *
 * ## The channel
 *
 * A write is never executed in the turn the model asks for it. When the model
 * calls a mutating tool the run ends with AG-UI's own `interrupt` outcome, one
 * interrupt per call, with `id === toolCallId` — the convention ADR 001 already
 * fixed for frontend tools. The browser raises a card, the human decides, and the
 * client starts a **new** `POST /agent/run` carrying `resume`. Only then, and
 * before the model is called again, does the gateway execute the call the
 * previous run left pending.
 *
 * ## Why the model cannot satisfy it
 *
 * The two channels are structurally different. Model output is a token stream:
 * text and tool calls, nothing else. An approval is an entry in
 * `RunAgentInput.resume` — a field of an HTTP request body that only the browser
 * writes, on a request the model has no way to issue. There is no argument, no
 * system-prompt claim and no "the user already authorised this" that produces a
 * resume entry.
 *
 * The corollary is the part worth stating explicitly: **approvals only ever apply
 * to calls made in a previous run, never to calls the model makes in the current
 * one.** A tool call the model emits mid-loop cannot find an approval, because the
 * only approvals in scope were named by the request body before the model ran and
 * are spent against the calls that were already pending. So a model that reuses an
 * old `toolCallId` — the one replay trick available to it — gets nothing.
 *
 * ## One approval per write
 *
 * Every write is its own interrupt, so approving one can never approve the next.
 * They are raised together in a single `RUN_FINISHED`, so a turn containing five
 * writes shows five cards at once rather than five in sequence, and each card
 * names the real tool and its real arguments — read off the call, not off the
 * model's prose about it.
 */

/**
 * `metadata.kind` on an interrupt the server raised to gate a write.
 *
 * It must differ from `client_tool`: `AgentRuntimeService.needsHumanDecision`
 * treats any interrupt that is *not* `client_tool` as requiring a person, and
 * answers it with a `resume` entry alone rather than by running a browser handler.
 * That is exactly the behaviour a server-side write needs, and it is why this gate
 * required no client change.
 */
export const MUTATION_APPROVAL_INTERRUPT_KIND = 'mutation_approval';

export interface ToolCallRef {
  readonly id: string;
  readonly name: string;
  readonly arguments: string;
}

/**
 * A gated write a previous run left pending, with the registration that governs
 * it.
 *
 * The tool travels with the call rather than being looked up again at execution
 * time, because everything that decides what the write may do — whether it needs
 * approval, how it is phrased, which fields a submitted form may set — comes from
 * that one declaration, and re-resolving it invites the two lookups to disagree.
 */
export interface PendingMutation extends ToolCallRef {
  readonly tool: Pick<AgentTool, 'mutation' | 'parameters'>;
}

export interface DescribedInterrupt {
  readonly id: string;
  readonly reason: string;
  readonly message: string;
  readonly toolCallId: string;
  readonly metadata: Record<string, unknown>;
}

/**
 * Arguments as an object, for rendering.
 *
 * A malformed argument stream is the model's fault, not the user's, and the card
 * still has to render — so an unparseable set degrades to an empty one rather than
 * failing the run. It never degrades the *decision*: the call is gated either way.
 */
export function parseToolArguments(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through to the empty set.
  }
  return {};
}

/**
 * What the gateway worked out about the write before raising the card: how to
 * phrase it, and what it acts on.
 *
 * Both are optional and both degrade to nothing. A tool with no `mutation`
 * declaration, and a document whose read failed, are the same case from the
 * panel's side — it renders the gateway's sentence and the bare uid, which is
 * what it did before any of this existed.
 */
export interface MutationApprovalDetail {
  readonly action?: MutationSpec;
  readonly targets?: readonly ApprovalTarget[];
  /**
   * A form the browser may render to answer this interrupt instead of drawing a
   * card. Absent for every write that declares none, which is all of them but
   * one, and an absent declaration renders exactly the card it rendered before.
   */
  readonly form?: InterruptFormRender;
}

/**
 * The approval card for a write, built entirely from the tool call and from the
 * tool's own registration.
 *
 * Nothing here comes from the model's prose. `reason` is the registered tool name
 * and `metadata.args` are the arguments the call actually carries, so the sentence
 * the user approves and the request that runs are the same thing. A summary the
 * model wrote could describe one action and perform another.
 *
 * `metadata.action` carries the phrasing from the tool's own declaration, so the
 * row's verb and the executed code come from one place. It used to come from a
 * table in the browser keyed on tool name, which stayed correct only for as long
 * as nobody changed what a tool did without renaming it.
 *
 * `metadata.targets` carries the documents named by the arguments the tool
 * declares as document references, resolved server-side with the caller's own
 * forwarded credentials. A uid missing from that array is a uid the row shows as
 * a uid: a wrong name on an approval card is worse than an unfriendly one.
 *
 * `metadata.render` carries a form the browser may render *instead of* the card,
 * when the tool's own registration declares one. It is additive in the strict
 * sense: a client that does not know the key draws the card it always drew, and
 * approves the arguments in `metadata.args` exactly as before. What it must not
 * do is treat the declaration as a description of a write it performs itself —
 * submitting the form answers this interrupt, and the gateway performs the write.
 */
export function describeMutationApproval(
  call: ToolCallRef,
  detail: MutationApprovalDetail = {},
): DescribedInterrupt {
  return {
    id: call.id,
    reason: call.name,
    message:
      `The assistant wants to run ${call.name}, which changes content in Nuxeo. ` +
      `Nothing is written unless you approve it.`,
    toolCallId: call.id,
    metadata: {
      kind: MUTATION_APPROVAL_INTERRUPT_KIND,
      toolName: call.name,
      args: parseToolArguments(call.arguments),
      ...(detail.action ? { action: detail.action } : {}),
      ...(detail.targets && detail.targets.length > 0 ? { targets: detail.targets } : {}),
      ...(detail.form ? { render: detail.form } : {}),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * One human decision, as the loop is given it.
 *
 * `submission` is present only when the answer came from a chat-rendered form,
 * and it holds the payload's `fields` **exactly as received** — unparsed,
 * unvalidated, and of no use to anything but `overlayFormSubmission`. It rides on
 * the decision rather than being fetched separately so that the submitted values
 * cannot be read without also spending the approval: one claim yields both, or
 * neither.
 */
export interface MutationDecision {
  readonly granted: boolean;
  readonly submission?: { readonly fields: unknown };
}

const REFUSED: MutationDecision = { granted: false };

/**
 * The human decisions carried by one request, keyed by the call each answers.
 *
 * Built from `RunAgentInput.resume` and from nothing else. A `role: "tool"`
 * message is not accepted as approval: it is ordinary transcript data that a
 * later turn's model output is mixed into, whereas `resume` is a per-request field
 * the SDK derives from the interrupts it currently holds open.
 */
export class ApprovalLedger {
  private readonly granted: ReadonlyMap<string, MutationDecision>;
  private readonly spent = new Set<string>();

  private constructor(granted: ReadonlyMap<string, MutationDecision>) {
    this.granted = granted;
  }

  static fromRunInput(input: RunAgentInput): ApprovalLedger {
    const granted = new Map<string, MutationDecision>();
    for (const entry of input.resume ?? []) {
      // Deny by default again: the boolean `true` and nothing else. `"true"`,
      // `1` and `"yes"` are all truthy and none of them is a client that has
      // implemented this contract, so they fail closed rather than authorise a
      // write on a coincidence of JavaScript. `status: "cancelled"`, a missing
      // payload and any other shape are refusals for the same reason. A form
      // submission is not a second way to grant — it is this same grant carrying
      // the values the user typed, so the one condition below stays the only one.
      if (
        entry.status !== 'resolved' ||
        !isRecord(entry.payload) ||
        entry.payload['approved'] !== true
      ) {
        continue;
      }
      const payload = entry.payload;
      granted.set(entry.interruptId, {
        granted: true,
        ...(Object.prototype.hasOwnProperty.call(payload, 'fields')
          ? { submission: { fields: payload['fields'] } }
          : {}),
      });
    }
    return new ApprovalLedger(granted);
  }

  /**
   * Spends the approval for one call. One-shot by construction: a second claim on
   * the same id is a refusal, so an approval can never authorise a second write
   * even if the same id is presented twice in one run — and a form submission,
   * travelling on the decision itself, is spent with it.
   */
  claim(toolCallId: string): MutationDecision {
    if (this.spent.has(toolCallId)) return REFUSED;
    this.spent.add(toolCallId);
    return this.granted.get(toolCallId) ?? REFUSED;
  }

  /** Ids this ledger answers, so the loop does not also replay them as tool results. */
  answers(toolCallId: string): boolean {
    return this.spent.has(toolCallId);
  }
}

/**
 * Writes a previous run stopped on: assistant tool calls the registry owns, that
 * need approval, and that no tool message has answered yet.
 *
 * The arguments come from the assistant message the client echoed back, which is
 * the same message the interrupt was raised from. That is the only durable place
 * they exist — the gateway is stateless between runs by ADR 001, so there is no
 * server-side pending-call table to consult and none is wanted.
 */
export function pendingMutations(
  input: RunAgentInput,
  registry: ToolRegistry,
): readonly PendingMutation[] {
  const answered = new Set(
    input.messages
      .filter((message) => message.role === 'tool')
      .map((message) => message.toolCallId),
  );

  const pending = new Map<string, PendingMutation>();
  for (const message of input.messages) {
    if (message.role !== 'assistant') continue;
    for (const call of message.toolCalls ?? []) {
      if (answered.has(call.id) || pending.has(call.id)) continue;
      const tool = registry.get(call.function.name);
      if (!tool || !requiresApproval(tool)) continue;
      pending.set(call.id, {
        id: call.id,
        name: call.function.name,
        arguments: call.function.arguments,
        tool,
      });
    }
  }
  return [...pending.values()];
}
