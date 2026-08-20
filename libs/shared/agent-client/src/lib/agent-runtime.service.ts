import { DestroyRef, Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import {
  HttpAgent,
  randomUUID,
  buildResumeArray,
  type AgentSubscriber,
  type HttpAgentConfig,
  type RunAgentParameters,
  type RunAgentResult,
} from '@ag-ui/client';
import type { BaseEvent, Interrupt, Message, ResumeEntry, State, Tool } from '@ag-ui/core';

import { AGENT_DEV_AUTH_HEADERS, AGENT_RUNTIME_BASE_URL, agentRunUrl } from './agent.config';
import { AGENT_FORM_CATALOGUE, parseInterruptForm, type AgentFormSubmission } from './agent-form';
import { AgentSelectionStore, readProposedSelection } from './agent-selection';
import { FRONTEND_AGENT_TOOLS, toolRequiresApproval } from './agent-tools';
import {
  AGENT_WIDGET_CATALOGUE,
  parseAgentWidgetEvent,
  type AgentWidgetRequest,
} from './agent-widget';
import type {
  AgentApprovalAction,
  AgentApprovalRequest,
  AgentApprovalTarget,
  AgentApprovalVerdict,
  AgentCitation,
  AgentMessage,
  AgentRunContext,
  AgentThinkingStep,
  AgentToolCall,
  AgentToolHandler,
} from './agent.models';

/**
 * Ceiling on browser-driven tool round trips inside one user turn. Every frontend tool
 * result costs another `POST /agent/run`, so a model that keeps asking for the same tool
 * would otherwise loop against the gateway forever.
 */
const MAX_AUTOMATIC_TURNS = 6;

const FRONTEND_TOOL_NAMES = new Set(FRONTEND_AGENT_TOOLS.map((tool) => tool.name));

/**
 * `metadata.kind` the gateway stamps on an interrupt that is waiting for one of the
 * frontend-declared tools. Any other kind is treated as needing a human answer: silently
 * auto-resolving an interrupt we do not understand is the one mistake with no symptom.
 */
const CLIENT_TOOL_INTERRUPT_KIND = 'client_tool';

/**
 * `CUSTOM.name` carrying a generative-UI render request. Matched exactly; any
 * other name is ignored, which is what makes the whole feature additive.
 */
const RENDER_EVENT_NAME = 'render';

/**
 * Most widgets one thread may accumulate, counting refused ones.
 *
 * A steered model that mounts a component per turn is bounded by the tool loop;
 * one that could mount five hundred is bounded by this. Past the cap render
 * events are dropped and the tool cards stand alone, which is the same surface a
 * client with no generative UI shows.
 */
const MAX_WIDGETS_PER_THREAD = 20;

/** Interrupt metadata keys that are protocol bookkeeping rather than tool arguments. */
const INTERRUPT_METADATA_KEYS: ReadonlySet<string> = new Set([
  'kind',
  'toolName',
  'args',
  'action',
  'targets',
  // The form declaration. Bookkeeping rather than an argument: rendering it on
  // the card's argument line would print the whole field set as text under the
  // form that already shows it.
  'render',
]);

/**
 * `metadata` key carrying a form the browser may render instead of the approval
 * card. Deliberately the same key name the `CUSTOM` `render` event uses, on a
 * different channel — ADR 001, "What the interrupt carries, and what answers it".
 */
const INTERRUPT_FORM_METADATA_KEY = 'render';

/**
 * One answer to one interrupt, as `buildResumeArray` expects it. `@ag-ui/client` 0.0.57
 * declares this shape but does not export the type, so it is restated here.
 */
type InterruptResponse = { status: 'resolved'; payload?: unknown } | { status: 'cancelled' };

/** The slice of `HttpAgent` this adapter drives. Narrow so tests can supply a double. */
export interface AgentRunner {
  threadId: string;
  messages: Message[];
  state: State;
  headers: Record<string, string>;
  /**
   * Interrupts from the most recent run that the SDK still considers open.
   *
   * Read from the runner rather than mirrored locally, deliberately.
   * `AbstractAgent.onInitialize` throws `Thread has N pending interrupt(s) not addressed
   * by resume` — before the fetch, so nothing reaches the gateway — unless the next run's
   * `resume` addresses every entry in this list. It is therefore the only correct source
   * of truth for what a run has to answer, and any local copy of it can drift.
   */
  pendingInterrupts: Interrupt[];
  subscribe(subscriber: AgentSubscriber): { unsubscribe: () => void };
  runAgent(parameters?: RunAgentParameters, subscriber?: AgentSubscriber): Promise<RunAgentResult>;
  abortRun(): void;
  addMessage(message: Message): void;
  setMessages(messages: Message[]): void;
}

export type AgentRunnerFactory = (config: HttpAgentConfig) => AgentRunner;

export const AGENT_RUNNER_FACTORY = new InjectionToken<AgentRunnerFactory>('AGENT_RUNNER_FACTORY', {
  providedIn: 'root',
  factory: () => (config: HttpAgentConfig) => new HttpAgent(config),
});

/**
 * Angular adapter over `@ag-ui/client`'s `HttpAgent`.
 *
 * One `AgentSubscriber` is attached to the agent and projects the normalised event stream
 * into signals; components never see an AG-UI event or an RxJS stream. The SDK owns chunk
 * normalisation, `RunAgentInput` assembly, RFC 6902 state patching and cancellation, which
 * is the whole reason for choosing the TypeScript SDK (ADR 001).
 */
@Injectable({ providedIn: 'root' })
export class AgentRuntimeService {
  private readonly baseUrl = inject(AGENT_RUNTIME_BASE_URL);
  private readonly devAuthHeaders = inject(AGENT_DEV_AUTH_HEADERS);
  private readonly createRunner = inject(AGENT_RUNNER_FACTORY);
  private readonly destroyRef = inject(DestroyRef);
  /**
   * The widgets this application registered. Injected, so the allowlist is
   * whatever the composition root provided and this service names no widget.
   */
  private readonly widgetCatalogue = inject(AGENT_WIDGET_CATALOGUE);
  /**
   * The form components this application registered. A separate catalogue from
   * the widgets, because the two channels have different prop rules — see
   * `agent-form.ts`. A declaration naming something absent from it draws the
   * approval card.
   */
  private readonly formCatalogue = inject(AGENT_FORM_CATALOGUE);
  /**
   * Where a server-authored selection proposal lands. Not where the user's own
   * selection lives — this service has no way to write that, deliberately.
   */
  private readonly selectionStore = inject(AgentSelectionStore);

  /** Settled transcript. Text still arriving lives in {@link streamingText}. */
  readonly messages = signal<AgentMessage[]>([]);
  /** The assistant token buffer for the message currently being streamed. */
  readonly streamingText = signal('');
  readonly toolCalls = signal<AgentToolCall[]>([]);
  readonly thinkingSteps = signal<AgentThinkingStep[]>([]);
  readonly sharedState = signal<Record<string, unknown>>({});
  /**
   * Widgets the gateway asked the app to mount, in arrival order, each keyed to
   * the tool call it belongs under. Refused requests stay in the list carrying
   * their reason, so the surface can say a view was asked for and not shown.
   */
  readonly widgets = signal<AgentWidgetRequest[]>([]);
  readonly running = signal(false);
  readonly error = signal<string | null>(null);
  /** Open human-in-the-loop decisions. The agent cannot proceed until these are answered. */
  readonly approvals = signal<AgentApprovalRequest[]>([]);

  readonly hasMessages = computed(() => this.messages().length > 0);
  readonly hasActivity = computed(
    () => this.running() || this.streamingText().length > 0 || this.approvals().length > 0,
  );

  private runner: AgentRunner | null = null;
  private runnerSubscription: { unsubscribe: () => void } | null = null;
  private readonly toolHandlers = new Map<string, AgentToolHandler>();
  private readonly citationsByMessage = new Map<string, AgentCitation[]>();
  /** The interrupts of the current handoff, for rendering and for rebuilding their calls. */
  private readonly interruptsById = new Map<string, Interrupt>();
  /** Answers collected so far. A run may only start once this covers every open interrupt. */
  private readonly interruptResponses = new Map<string, InterruptResponse>();
  private pendingFrontendCalls: AgentToolCall[] = [];
  private currentAssistantMessageId: string | null = null;
  private context: AgentRunContext = {};
  private cancelled = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.teardown());
  }

  /** Ambient facts sent as AG-UI `Context` entries on every run. */
  setContext(context: AgentRunContext): void {
    this.context = context;
  }

  /**
   * Registers the browser-side implementation of a frontend-declared tool. Returns an
   * unregister function so a component can clean up on destroy.
   */
  registerToolHandler(name: string, handler: AgentToolHandler): () => void {
    this.toolHandlers.set(name, handler);
    return () => {
      if (this.toolHandlers.get(name) === handler) this.toolHandlers.delete(name);
    };
  }

  send(text: string): void {
    const content = text.trim();
    if (!content || this.running()) return;
    const runner = this.ensureRunner();
    // Typing instead of answering is itself an answer. The SDK refuses to start a run
    // while an interrupt is unaddressed, so carrying the open decisions back as
    // cancellations is what stops a skipped approval from bricking the thread.
    this.cancelUnansweredInterrupts(runner);
    runner.addMessage({ id: randomUUID(), role: 'user', content });
    this.syncMessages();
    void this.runTurn();
  }

  /**
   * Cancels the in-flight run. `HttpAgent.abortRun()` aborts the underlying `fetch`; the
   * gateway sees `request.on('close')` and stops work. No terminal event arrives, and the
   * `AbortError` that surfaces here is a normal outcome rather than a failure.
   */
  abortRun(): void {
    if (!this.running()) return;
    this.cancelled = true;
    this.runner?.abortRun();
  }

  /** Answers an open approval. Rejection is reported to the agent, not silently dropped. */
  respondToApproval(id: string, approved: boolean): void {
    void this.settleApproval(id, approved);
  }

  /**
   * Answers an open approval by submitting the form it declared.
   *
   * This is an **approval**, not a second kind of answer, and that is the whole
   * of why it is safe: it grants exactly as `respondToApproval(id, true)` does
   * and carries the values the user typed alongside the grant. `approved === true`
   * remains the only condition the gateway grants on, so an entry with `fields`
   * and no `approved` writes nothing — `fields` cannot authorise anything by
   * itself.
   *
   * Refused unless the request actually declared a form. A submission for a write
   * whose tool declares none is the case where "send it anyway" is least
   * defensible: the gateway would refuse it as `form_not_declared`, and asking it
   * to is worse than not asking, because the model then has to explain a refusal
   * the browser could have avoided.
   */
  submitApprovalForm(id: string, fields: AgentFormSubmission): void {
    const request = this.approvals().find((open) => open.id === id);
    if (!request?.form || request.verdict) return;
    void this.settleApproval(id, true, fields);
  }

  clear(): void {
    this.teardown();
    this.runner = null;
    this.messages.set([]);
    this.streamingText.set('');
    this.toolCalls.set([]);
    this.thinkingSteps.set([]);
    this.sharedState.set({});
    this.widgets.set([]);
    // Offers as well as proposals: the widgets that made those offers are being
    // removed from the transcript, and a proposal outliving the row it names is
    // a suggestion with nothing to tick.
    this.selectionStore.clear();
    this.approvals.set([]);
    this.error.set(null);
    this.running.set(false);
    this.citationsByMessage.clear();
    this.interruptsById.clear();
    this.interruptResponses.clear();
    this.pendingFrontendCalls = [];
    this.currentAssistantMessageId = null;
  }

  // ---------------------------------------------------------------- run loop

  private ensureRunner(): AgentRunner {
    if (this.runner) return this.runner;
    const runner = this.createRunner({
      url: agentRunUrl(this.baseUrl),
      headers: {},
      initialState: {},
    });
    this.runnerSubscription = runner.subscribe(this.subscriber);
    this.runner = runner;
    return runner;
  }

  private async runTurn(resume?: ResumeEntry[]): Promise<void> {
    const runner = this.ensureRunner();
    // A verdict is kept only so the surface can show a half-answered batch. Once the
    // run carrying those verdicts starts they are spent, and the tool cards become the
    // record of what each one did.
    this.discardAnsweredApprovals();
    this.cancelled = false;
    this.running.set(true);
    this.error.set(null);

    // Derived rather than required from the caller: a run whose predecessor ended in
    // `RUN_ERROR` still has that predecessor's interrupts open in the SDK, and would
    // otherwise throw here on the user's next message instead of retrying.
    let resumeEntries: ResumeEntry[] | undefined = resume ?? this.buildResume(runner) ?? undefined;
    try {
      for (let turn = 0; turn < MAX_AUTOMATIC_TURNS; turn += 1) {
        // Re-read every turn: on localhost the credential arrives with the user's login,
        // which happens after this service is constructed.
        runner.headers = { ...runner.headers, ...this.devAuthHeaders() };
        this.pendingFrontendCalls = [];

        // `this.subscriber` is deliberately NOT passed as the second argument. The SDK
        // runs `[internal, ...agent.subscribers, perRunSubscriber]`, so a subscriber that
        // is both attached in `ensureRunner` and passed here fires twice for every event
        // — which raised two approval cards per decision and ran read-only tools twice.
        await runner.runAgent({
          tools: [...FRONTEND_AGENT_TOOLS] as Tool[],
          context: this.buildContext(),
          ...(resumeEntries ? { resume: resumeEntries } : {}),
        });
        this.syncMessages();

        const next = await this.settleHandoff(runner);
        if (!next) break;
        resumeEntries = next.resume;
      }
    } catch (cause) {
      this.reportRunFailure(cause);
    } finally {
      this.streamingText.set('');
      this.running.set(false);
      this.syncMessages();
    }
  }

  private buildContext() {
    const entries: Array<{ description: string; value: string }> = [];
    if (this.context.page) entries.push({ description: 'currentPage', value: this.context.page });
    if (this.context.docId) {
      entries.push({ description: 'currentDocumentId', value: this.context.docId });
    }
    // Two selection fields, described so the difference cannot be missed by a
    // model reading them as a flat list of pairs. The first is actionable; the
    // second is the model's own outstanding suggestion being read back to it,
    // and acting on it would be acting on its own assertion.
    if (this.context.selectionIds?.length) {
      entries.push({
        description: 'documentsSelectedByUser',
        value: this.context.selectionIds.join(','),
      });
    }
    if (this.context.proposedSelectionIds?.length) {
      entries.push({
        description: 'documentsYouProposedAwaitingUserConfirmation_doNotActOnThese',
        value: this.context.proposedSelectionIds.join(','),
      });
    }
    return entries;
  }

  /**
   * Deals with everything the finished run handed back to the browser.
   *
   * Returns null when the turn is over — nothing to hand back, or a decision is now
   * waiting for the user — and otherwise the `resume` the next automatic run must carry.
   *
   * The gateway ends a frontend-tool turn with `TOOL_CALL_CHUNK` frames *and* an interrupt
   * for the same `toolCallId`. The interrupt is treated as the single handoff channel for
   * those calls: it is what the SDK demands an answer to, and answering it in one place
   * is what stops a second approval card being raised for a call already carrying one.
   */
  private async settleHandoff(runner: AgentRunner): Promise<{ resume?: ResumeEntry[] } | null> {
    const calls = this.pendingFrontendCalls;
    this.pendingFrontendCalls = [];

    for (const interrupt of runner.pendingInterrupts) {
      if (this.interruptResponses.has(interrupt.id)) continue;
      // A card is already open for anything needing a human; leave it unanswered.
      if (this.needsHumanDecision(interrupt)) continue;
      const content = await this.executeToolCall(this.toolCallFor(interrupt));
      this.interruptResponses.set(interrupt.id, {
        status: 'resolved',
        payload: { result: content },
      });
    }

    // Calls the gateway did not open an interrupt for. A server that ends its run with
    // `success` still needs an answer, and it gets one as a `role: "tool"` message.
    const interrupted = new Set(runner.pendingInterrupts.map((interrupt) => interrupt.id));
    const raised: AgentApprovalRequest[] = [];
    let executed = false;
    for (const call of calls) {
      if (interrupted.has(call.id)) continue;
      if (toolRequiresApproval(call.name)) {
        this.patchToolCall(call.id, { status: 'awaiting-approval' });
        raised.push({
          id: call.id,
          kind: 'tool',
          toolName: call.name,
          summary: approvalSummary(call),
          args: call.args,
        });
        continue;
      }
      await this.executeToolCall(call);
      executed = true;
    }
    this.raiseApprovals(raised);

    const resume = this.buildResume(runner);
    if (resume) return { resume };
    // Unanswered interrupts remain: the user has to decide before anything can run.
    if (runner.pendingInterrupts.length > 0) return null;
    return executed && raised.length === 0 ? {} : null;
  }

  /**
   * The `resume` array the next run must carry, or null when no run may start yet.
   *
   * All-or-nothing by necessity: `AbstractAgent.onInitialize` throws before the fetch if a
   * single open interrupt is unanswered, and `buildResumeArray` throws if the responses do
   * not match the open set exactly.
   */
  private buildResume(runner: AgentRunner): ResumeEntry[] | null {
    // The runner's own list is authoritative, because it is what `onInitialize` checks.
    // The fallback matters if a future SDK stops tracking them: the failure would then be
    // "resumes a run the server no longer expects", not "never resumes at all".
    const open =
      runner.pendingInterrupts.length > 0
        ? runner.pendingInterrupts
        : [...this.interruptsById.values()];
    if (open.length === 0) return null;
    const responses: Record<string, InterruptResponse> = {};
    for (const interrupt of open) {
      const response = this.interruptResponses.get(interrupt.id);
      if (!response) return null;
      responses[interrupt.id] = response;
    }
    return buildResumeArray([...open], responses);
  }

  /**
   * Refuses every decision the user walked away from.
   *
   * Verdicts already given are left exactly as they are: the user approved those writes
   * deliberately, and changing the subject is not a retraction. Only the ones never
   * answered become refusals, which is the same reading the gateway applies to a
   * missing entry.
   */
  private cancelUnansweredInterrupts(runner: AgentRunner): void {
    const cancelled = new Set<string>();
    for (const interrupt of runner.pendingInterrupts) {
      if (this.interruptResponses.has(interrupt.id)) continue;
      this.interruptResponses.set(interrupt.id, { status: 'cancelled' });
      this.patchToolCall(interrupt.id, { status: 'rejected' });
      cancelled.add(interrupt.id);
    }
    if (cancelled.size === 0) return;
    this.approvals.update((open) =>
      open.map((request) =>
        cancelled.has(request.id) && !request.verdict
          ? { ...request, verdict: 'declined' as const }
          : request,
      ),
    );
  }

  private discardAnsweredApprovals(): void {
    this.approvals.update((open) => {
      const unanswered = open.filter((request) => !request.verdict);
      return unanswered.length === open.length ? open : unanswered;
    });
  }

  /** True when this interrupt must not be answered without asking the user first. */
  private needsHumanDecision(interrupt: Interrupt): boolean {
    if (!isClientToolInterrupt(interrupt)) return true;
    const name = interruptToolName(interrupt);
    if (!FRONTEND_TOOL_NAMES.has(name)) return true;
    return toolRequiresApproval(name);
  }

  /** The streamed call when its chunks arrived, otherwise one rebuilt from the interrupt. */
  private toolCallFor(interrupt: Interrupt): AgentToolCall {
    const streamed = this.toolCalls().find((call) => call.id === interrupt.id);
    if (streamed) return streamed;
    const rebuilt: AgentToolCall = {
      id: interrupt.id,
      name: interruptToolName(interrupt),
      args: this.interruptArgs(interrupt),
      status: 'awaiting-approval',
    };
    // Tracked so the card and its status transitions render like any other call.
    this.toolCalls.update((calls) => [...calls, rebuilt]);
    return rebuilt;
  }

  /** Returns the content the agent will see, so it can double as a `resume` payload. */
  private async executeToolCall(call: AgentToolCall, fallbackContent?: string): Promise<string> {
    this.patchToolCall(call.id, { status: 'running' });
    const handler = this.toolHandlers.get(call.name);
    try {
      const outcome = await handler?.(call.args);
      const content =
        typeof outcome === 'string' && outcome.length > 0
          ? outcome
          : (fallbackContent ?? `${call.name} completed.`);
      this.patchToolCall(call.id, { status: 'complete', result: content });
      this.appendToolResult(call.id, content);
      return content;
    } catch {
      const content = `${call.name} could not be completed in the browser.`;
      this.patchToolCall(call.id, { status: 'failed', result: content });
      this.appendToolResult(call.id, content);
      return content;
    }
  }

  private appendToolResult(toolCallId: string, content: string): void {
    this.runner?.addMessage({ id: randomUUID(), role: 'tool', toolCallId, content });
    this.syncMessages();
  }

  /**
   * Records one verdict against one request, and starts the resumed run only once every
   * request in the batch has one.
   *
   * The `verdict` guard is the structural half of "approving one write cannot approve
   * another": a request that already carries a verdict is finished, so a second answer —
   * whether from a double click, a batch control or a future caller — produces no second
   * `resume` entry and cannot overwrite the first. Each entry in the array `buildResume`
   * assembles comes from exactly one call to this method.
   */
  private async settleApproval(
    id: string,
    approved: boolean,
    fields?: AgentFormSubmission,
  ): Promise<void> {
    const request = this.approvals().find((open) => open.id === id);
    if (!request || request.verdict) return;
    const verdict: AgentApprovalVerdict = approved ? 'approved' : 'declined';
    this.approvals.update((open) =>
      open.map((entry) => (entry.id === id ? { ...entry, verdict } : entry)),
    );

    const interrupt = this.interruptsById.get(id);
    const outcome =
      interrupt && !isClientToolInterrupt(interrupt)
        ? this.answerWithoutToolCall(id, approved, fields)
        : await this.answerToolCall(
            interrupt ? this.toolCallFor(interrupt) : this.localToolCall(id, request),
            approved,
          );

    const runner = this.runner;
    if (!runner) return;
    if (!interrupt) {
      // A browser-side approval with no interrupt behind it still belongs to a batch,
      // and starting the run on the first verdict would strand the rest of it.
      if (this.approvals().some((entry) => !entry.verdict)) return;
      void this.runTurn();
      return;
    }
    this.interruptResponses.set(id, outcome);
    const resume = this.buildResume(runner);
    if (resume) void this.runTurn(resume);
  }

  /**
   * Runs, or refuses, the browser tool the approval was gating.
   *
   * The two verdict strings are sentences rather than JSON. ADR 001 requires stringified
   * JSON in a gateway `TOOL_CALL_RESULT.content`, but these are authored here, in the
   * browser, for a call the gateway never resolved — they read as well to the model as
   * every other result this service produces, and they are also what the tool card puts on
   * screen. Serialising them made the card display `{"approved":false,…}` verbatim.
   */
  private async answerToolCall(call: AgentToolCall, approved: boolean): Promise<InterruptResponse> {
    if (!approved) {
      const content = 'Declined by the user. Nothing was changed.';
      this.patchToolCall(call.id, { status: 'rejected', result: content });
      this.appendToolResult(call.id, content);
      return { status: 'cancelled' };
    }
    // Always through `executeToolCall`: this is the branch where an approved
    // `applyMetadata` reaches `BrowseService.updateDocument`. Answering the interrupt
    // without running the handler told the model the write had succeeded and wrote nothing.
    // The fallback covers a tool with no browser handler — `confirmAction`, whose whole
    // result is the user's verdict.
    const content = await this.executeToolCall(call, 'Approved by the user.');
    return { status: 'resolved', payload: { approved: true, result: content } };
  }

  /**
   * Answers an interrupt that is not a frontend tool call. Nothing runs in the browser and
   * there is no `toolCallId` to answer, so the `resume` entry is the whole answer —
   * appending a `role: "tool"` message here would invent a result for a call never made.
   *
   * `fields` is added to the payload only when a form was submitted. Omitting the
   * key entirely — rather than sending an empty object — is what makes an
   * ordinary approval run the held arguments unchanged: an empty `fields` would
   * be a submission that overwrote every editable field with nothing.
   */
  private answerWithoutToolCall(
    id: string,
    approved: boolean,
    fields?: AgentFormSubmission,
  ): InterruptResponse {
    this.patchToolCall(id, {
      status: approved ? 'complete' : 'rejected',
      ...this.executedArgs(id, approved ? fields : undefined),
    });
    if (!approved) return { status: 'cancelled' };
    return {
      status: 'resolved',
      payload: { approved: true, ...(fields ? { fields } : {}) },
    };
  }

  /**
   * The arguments the card should show once a form has settled it, if they differ.
   *
   * The card used to keep the model's proposal for the life of the transcript: `args`
   * is built once from `interruptArgs()` and settling patched only `status`. So a
   * ticked card read back the description the user had just deleted, while the prose
   * below it correctly reported what was saved — and a card, being structured and
   * beside a tick, looks more authoritative than prose.
   *
   * This is the same rule as `submittedByUser` in the gateway, applied to the screen
   * instead of to the model: **a value nobody attributes is read as the system's own.**
   * The user's edit was already invisible here; the fix is not new information, it is
   * showing information the browser had all along.
   *
   * Only editable fields can have been submitted, and only under `valuesArg`, so the
   * patch is confined to that one key and merges over what the model proposed —
   * display-only fields the model mentioned stay visible, because they were part of
   * the call and are part of what ran.
   *
   * Returns nothing at all when there is no submission, no `valuesArg`, or no held
   * object to merge into, so an ordinary card approval is untouched.
   */
  private executedArgs(
    id: string,
    fields?: AgentFormSubmission,
  ): Pick<AgentToolCall, 'args'> | Record<string, never> {
    if (!fields) return {};
    const valuesArg = this.approvals().find((open) => open.id === id)?.form?.props.valuesArg;
    if (!valuesArg) return {};

    const call = this.toolCalls().find((entry) => entry.id === id);
    const held = call?.args?.[valuesArg];
    if (!held || typeof held !== 'object' || Array.isArray(held)) return {};

    return {
      args: {
        ...call?.args,
        [valuesArg]: { ...(held as Record<string, unknown>), ...fields },
      },
    };
  }

  private localToolCall(id: string, request: AgentApprovalRequest): AgentToolCall {
    return (
      this.toolCalls().find((entry) => entry.id === id) ?? {
        id,
        name: request.toolName,
        args: request.args,
        status: 'awaiting-approval',
      }
    );
  }

  private reportRunFailure(cause: unknown): void {
    if (this.cancelled || isAbortError(cause)) {
      this.cancelled = false;
      return;
    }
    // A RUN_ERROR already produced a gateway-authored sentence; do not replace it with a
    // transport message. Anything else is a connection failure the user can act on.
    if (this.error()) return;
    this.error.set('The assistant is unavailable. Check the connection and try again.');
  }

  // -------------------------------------------------------------- subscriber

  private readonly subscriber: AgentSubscriber = {
    onRunStartedEvent: () => {
      this.streamingText.set('');
      this.currentAssistantMessageId = null;
    },

    onTextMessageStartEvent: ({ event }) => {
      // Rule 3 of the SDK contract: a tool call closes any open text block, so text that
      // resumes after a tool call is a new message with a new id. Tracking the id here is
      // what keeps citations attached to the right bubble.
      this.currentAssistantMessageId = event.messageId;
      this.streamingText.set('');
    },

    onTextMessageContentEvent: ({ textMessageBuffer }) => {
      this.streamingText.set(textMessageBuffer);
    },

    onTextMessageEndEvent: () => {
      this.streamingText.set('');
      this.syncMessages();
    },

    onToolCallStartEvent: ({ event }) => {
      this.toolCalls.update((calls) => [
        ...calls.filter((call) => call.id !== event.toolCallId),
        { id: event.toolCallId, name: event.toolCallName, args: {}, status: 'streaming' },
      ]);
      this.startThinkingStep(thinkingStepId(event.toolCallId), `Calling ${event.toolCallName}`);
    },

    onToolCallArgsEvent: ({ event, partialToolCallArgs }) => {
      this.patchToolCall(event.toolCallId, { args: partialToolCallArgs ?? {} });
    },

    onToolCallEndEvent: ({ event, toolCallName, toolCallArgs }) => {
      this.patchToolCall(event.toolCallId, { name: toolCallName, args: toolCallArgs ?? {} });
      this.finishThinkingStep(thinkingStepId(event.toolCallId));
      if (!FRONTEND_TOOL_NAMES.has(toolCallName)) return;
      const call = this.toolCalls().find((entry) => entry.id === event.toolCallId);
      if (!call || this.pendingFrontendCalls.some((entry) => entry.id === call.id)) return;
      this.pendingFrontendCalls.push(call);
    },

    onToolCallResultEvent: ({ event }) => {
      this.patchToolCall(event.toolCallId, { status: 'complete', result: event.content });
    },

    onStepStartedEvent: ({ event }) => {
      this.startThinkingStep(thinkingStepId(event.stepName), event.stepName);
    },

    onStepFinishedEvent: ({ event }) => {
      this.finishThinkingStep(thinkingStepId(event.stepName));
    },

    onReasoningMessageContentEvent: ({ event, reasoningMessageBuffer }) => {
      this.startThinkingStep(thinkingStepId(event.messageId), 'Reasoning', reasoningMessageBuffer);
    },

    onReasoningMessageEndEvent: ({ event }) => {
      this.finishThinkingStep(thinkingStepId(event.messageId));
    },

    onCustomEvent: ({ event }) => {
      this.applyCustomEvent(event.name, event.value);
    },

    // The SDK applies RFC 6902 patches and hands back the whole document, so all
    // three land in the same place. `onStateChanged` fires for snapshot and
    // delta alike, and applying the selection slice on each of them is
    // idempotent — `propose` replaces rather than accumulates.
    onStateSnapshotEvent: ({ state }) => this.applySharedState(state),
    onStateDeltaEvent: ({ state }) => this.applySharedState(state),
    onStateChanged: ({ state }) => this.applySharedState(state),

    onMessagesChanged: ({ messages }) => this.projectMessages(messages),

    // Stop aborts the fetch and the SDK reports that as a RUN_ERROR carrying whatever
    // wording the browser gave the abort. Cancelling is a deliberate act, so it is
    // ignored here for exactly the reason `reportRunFailure` already ignores it.
    onRunErrorEvent: ({ event }) => {
      if (this.cancelled || isAbortMessage(event.message)) return;
      this.error.set(event.message);
    },

    onRunFinishedEvent: (params) => {
      if (params.outcome === 'interrupt') this.queueInterrupts(params.interrupts);
      // A successful run clears the SDK's own pending list, so ours follows it.
      else this.forgetInterruptsExcept(new Set());
    },

    // `THINKING_*` is deprecated in the AG-UI enum "for removal in 1.0.0" and has no
    // dedicated subscriber callback, so it only reaches us here. Handling it in one place
    // means a gateway still emitting the old events renders identically, and the eventual
    // removal touches this method and nothing else.
    onEvent: ({ event }) => this.applyDeprecatedThinkingEvent(event),
  };

  private applyDeprecatedThinkingEvent(event: BaseEvent): void {
    const record = event as unknown as Record<string, unknown>;
    switch (event.type as string) {
      case 'THINKING_START':
        this.startThinkingStep('thinking', readString(record['title']) ?? 'Thinking');
        break;
      case 'THINKING_TEXT_MESSAGE_CONTENT':
        this.appendThinkingDetail('thinking', readString(record['delta']) ?? '');
        break;
      case 'THINKING_END':
        this.finishThinkingStep('thinking');
        break;
      default:
        break;
    }
  }

  /**
   * Projects server-authored shared state, reading exactly one slice of it.
   *
   * `sharedState` keeps the whole document because it is a general channel and
   * a future feature may want another slice of it. The selection slice is
   * treated as an untrusted proposal: `readProposedSelection` re-validates the
   * shape, and `AgentSelectionStore.propose` then drops any uid no mounted
   * widget is offering. Neither step can produce a user selection, because no
   * function on that store does.
   *
   * A state document with no `selection` key clears nothing. Clearing is the
   * gateway's to ask for explicitly, by sending an empty array, so a run that
   * patches an unrelated slice does not silently retract a live suggestion.
   */
  private applySharedState(state: unknown): void {
    this.sharedState.set(asRecord(state));
    const proposed = readProposedSelection(state);
    if (proposed) this.selectionStore.propose(proposed);
  }

  private applyCustomEvent(name: string, value: unknown): void {
    if (name === 'citations') {
      this.recordCitations(value);
      return;
    }
    if (name === RENDER_EVENT_NAME) {
      this.recordWidget(value);
      return;
    }
    if (name === 'thinking') {
      const record = asRecord(value);
      const label = readString(record['label']) ?? 'Working';
      const id = readString(record['id']) ?? thinkingStepId(label);
      if (record['status'] === 'done') this.finishThinkingStep(id);
      else this.startThinkingStep(id, label, readString(record['detail']));
    }
  }

  /**
   * Records one render request, having validated it.
   *
   * Nothing here decides what a widget looks like or which component it is —
   * the injected catalogue owns the allowlist and each widget owns its own prop
   * parser, and this service deliberately names neither. All this does is turn
   * an untrusted payload into a typed request, or into a refusal the panel can
   * explain, and refuse to hold more than the cap.
   *
   * A second request for a `toolCallId` already answered replaces the first. A
   * card shows one widget; two would be a rendering fault rather than a feature.
   */
  private recordWidget(value: unknown): void {
    const request = parseAgentWidgetEvent(value, this.widgetCatalogue);
    if (!request) return;
    this.widgets.update((open) => {
      const existing = open.findIndex((entry) => entry.toolCallId === request.toolCallId);
      if (existing >= 0) {
        const next = [...open];
        next[existing] = request;
        return next;
      }
      if (open.length >= MAX_WIDGETS_PER_THREAD) return open;
      return [...open, request];
    });
  }

  private recordCitations(value: unknown): void {
    const record = asRecord(value);
    const raw = Array.isArray(value) ? value : record['citations'];
    if (!Array.isArray(raw)) return;
    const citations = raw.map(readCitation).filter((entry): entry is AgentCitation => !!entry);
    if (citations.length === 0) return;
    const messageId = readString(record['messageId']) ?? this.currentAssistantMessageId;
    if (!messageId) return;
    this.citationsByMessage.set(messageId, citations);
    this.syncMessages();
  }

  /**
   * Takes in the interrupts a run ended on, and raises a card only for the ones a human
   * has to answer. A `navigateTo` interrupt gets no card: it moves the UI and nothing
   * else, so {@link settleHandoff} runs it and answers the interrupt itself.
   */
  private queueInterrupts(interrupts: Interrupt[]): void {
    // The SDK replaces its whole pending list on every terminal event, so an answer for
    // an id outside this batch is dead and must not leak into a later resume array.
    this.forgetInterruptsExcept(new Set(interrupts.map((interrupt) => interrupt.id)));

    const raised: AgentApprovalRequest[] = [];
    for (const interrupt of interrupts) {
      this.interruptsById.set(interrupt.id, interrupt);
      if (!this.needsHumanDecision(interrupt)) continue;
      this.patchToolCall(interrupt.id, { status: 'awaiting-approval' });
      raised.push({
        id: interrupt.id,
        kind: 'interrupt',
        // `reason` is the tool name and `message` the sentence for the user. Rendering
        // `reason` for both gives a card that reads "client_tool" twice — correct, and
        // useless to the person deciding.
        toolName: interrupt.reason,
        summary: interrupt.message ?? interrupt.reason,
        args: this.interruptArgs(interrupt),
        ...interruptDetail(interrupt),
        ...this.interruptForm(interrupt),
      });
    }
    this.raiseApprovals(raised);
  }

  /**
   * The form this interrupt may be answered with, when it declared one that
   * validates.
   *
   * Returns nothing for an interrupt with no declaration and for one whose
   * declaration did not hold up, and those two produce the same outcome
   * deliberately: the approval card, which is a fully consented write showing the
   * same arguments the form would have shown. That mirrors the gateway, where
   * every check on a declaration degrades to no form rather than to a narrower
   * one, and it is why a client that has never heard of forms keeps working.
   *
   * The interrupt's own id is passed in so the declaration cannot name a
   * different one. `interruptId === toolCallId` always, and a form submitting
   * against an interrupt other than the one it is rendered under would answer a
   * decision the user never saw.
   *
   * **A form is refused outright on a frontend-tool interrupt**, whatever it
   * declares. Submitted values are applied by the gateway rebuilding the held
   * call's arguments; a browser-executed tool is run here instead, from its own
   * streamed arguments, so the values would be silently dropped and the user
   * would be told a change had been made that had not. The gateway only attaches
   * a declaration to a write it owns, so this is a check on a case that should
   * not arise rather than one that does — and it fails closed, to the card.
   */
  private interruptForm(interrupt: Interrupt): Pick<AgentApprovalRequest, 'form'> {
    const declaration = asRecord(interrupt.metadata)[INTERRUPT_FORM_METADATA_KEY];
    if (declaration === undefined || isClientToolInterrupt(interrupt)) return {};
    const form = parseInterruptForm(declaration, interrupt.id, this.formCatalogue);
    return form ? { form } : {};
  }

  /**
   * Arguments to render on the card. The gateway puts them parsed under `metadata.args`,
   * because a JSON string there shows the user escaped quotes. A producer that sends flat
   * metadata instead still renders: anything that is not protocol bookkeeping is shown.
   */
  private interruptArgs(interrupt: Interrupt): Record<string, unknown> {
    const metadata = asRecord(interrupt.metadata);
    const args = metadata['args'];
    if (args && typeof args === 'object' && !Array.isArray(args)) {
      return args as Record<string, unknown>;
    }
    const streamed = this.toolCalls().find((call) => call.id === interrupt.id);
    if (streamed && Object.keys(streamed.args).length > 0) return streamed.args;
    return Object.fromEntries(
      Object.entries(metadata).filter(([key]) => !INTERRUPT_METADATA_KEYS.has(key)),
    );
  }

  /**
   * Adds approval cards, never a second one for an id already open. The panel tracks them
   * by `id`, and two entries with one key is a duplicate-track-key error (NG0955).
   */
  private raiseApprovals(requests: AgentApprovalRequest[]): void {
    if (requests.length === 0) return;
    this.approvals.update((open) => {
      const seen = new Set(open.map((request) => request.id));
      const added = requests.filter((request) => !seen.has(request.id));
      return added.length > 0 ? [...open, ...added] : open;
    });
  }

  private forgetInterruptsExcept(keep: ReadonlySet<string>): void {
    for (const id of [...this.interruptsById.keys()]) {
      if (!keep.has(id)) this.interruptsById.delete(id);
    }
    for (const id of [...this.interruptResponses.keys()]) {
      if (!keep.has(id)) this.interruptResponses.delete(id);
    }
  }

  // -------------------------------------------------------------- projection

  private syncMessages(): void {
    this.projectMessages(this.runner?.messages ?? []);
  }

  private projectMessages(messages: ReadonlyArray<Readonly<Message>>): void {
    const projected: AgentMessage[] = [];
    for (const message of messages) {
      if (message.role !== 'user' && message.role !== 'assistant' && message.role !== 'tool') {
        continue;
      }
      const content = readMessageContent(message);
      const toolCallIds = readToolCallIds(message);
      // A turn that only opened tool calls carries no prose, and dropping it would throw
      // away the one record of where those calls sit in the conversation.
      if (!content && toolCallIds.length === 0) continue;
      const citations = this.citationsByMessage.get(message.id);
      projected.push({
        id: message.id,
        role: message.role,
        content,
        ...(message.role === 'tool' ? { toolCallId: message.toolCallId } : {}),
        ...(toolCallIds.length > 0 ? { toolCallIds } : {}),
        ...(citations ? { citations } : {}),
      });
    }
    this.messages.set(projected);
  }

  private patchToolCall(id: string, patch: Partial<AgentToolCall>): void {
    this.toolCalls.update((calls) =>
      calls.map((call) => (call.id === id ? { ...call, ...patch } : call)),
    );
  }

  private startThinkingStep(id: string, label: string, detail?: string): void {
    this.thinkingSteps.update((steps) => {
      const existing = steps.find((step) => step.id === id);
      if (!existing) {
        return [...steps, { id, label, status: 'active', ...(detail ? { detail } : {}) }];
      }
      return steps.map((step) =>
        step.id === id ? { ...step, label, ...(detail ? { detail } : {}) } : step,
      );
    });
  }

  private appendThinkingDetail(id: string, delta: string): void {
    if (!delta) return;
    this.thinkingSteps.update((steps) =>
      steps.map((step) =>
        step.id === id ? { ...step, detail: (step.detail ?? '') + delta } : step,
      ),
    );
  }

  private finishThinkingStep(id: string): void {
    this.thinkingSteps.update((steps) =>
      steps.map((step) => (step.id === id ? { ...step, status: 'done' } : step)),
    );
  }

  private teardown(): void {
    this.runnerSubscription?.unsubscribe();
    this.runnerSubscription = null;
    if (this.running()) this.runner?.abortRun();
  }
}

function thinkingStepId(seed: string): string {
  return `step:${seed}`;
}

/**
 * The phrasing and the resolved documents the gateway attached, when it did.
 *
 * Validated rather than trusted, and validated shallowly on purpose: everything
 * here is rendered as text through Angular's own binding, so the risk is a
 * malformed row rather than an injection. What the checks buy is that a producer
 * sending the wrong shape renders the fallback — the gateway's sentence and the
 * bare uid — instead of `[object Object]` on an approval card.
 *
 * `targets` is passed through even when empty, because "the gateway looked and
 * found nothing" and "the gateway did not look" mean different things to the
 * panel: only the second one makes it resolve the uids itself.
 */
function interruptDetail(interrupt: Interrupt): Pick<AgentApprovalRequest, 'action' | 'targets'> {
  const metadata = asRecord(interrupt.metadata);
  const action = asRecord(metadata['action']);
  const rawTargets = metadata['targets'];
  const targets = Array.isArray(rawTargets)
    ? rawTargets.map(asRecord).flatMap((entry): AgentApprovalTarget[] => {
        const uid = readString(entry['uid']);
        const title = readString(entry['title']);
        if (!uid || !title) return [];
        const type = readString(entry['type']);
        const path = readString(entry['path']);
        return [{ uid, title, ...(type ? { type } : {}), ...(path ? { path } : {}) }];
      })
    : undefined;
  const verb = readString(action['action']);
  return {
    ...(verb ? { action: { ...action, action: verb } as AgentApprovalAction } : {}),
    ...(targets ? { targets } : {}),
  };
}

/** True when the interrupt is waiting for a frontend-declared tool call. */
function isClientToolInterrupt(interrupt: Interrupt): boolean {
  return asRecord(interrupt.metadata)['kind'] === CLIENT_TOOL_INTERRUPT_KIND;
}

/**
 * The tool name an interrupt is about, for gating decisions only.
 *
 * `metadata.toolName` is preferred over `reason` here even though the card renders
 * `reason`: a producer that puts a protocol-level value in `reason` would otherwise make
 * `applyMetadata` look like an unrecognised tool. Unrecognised means "ask the human", so
 * that direction is safe, but reading the name correctly is better than being saved by a
 * fallback.
 */
function interruptToolName(interrupt: Interrupt): string {
  const metadata = asRecord(interrupt.metadata);
  return readString(metadata['toolName']) ?? readString(interrupt.reason) ?? '';
}

function approvalSummary(call: AgentToolCall): string {
  const summary = readString(call.args['summary']);
  if (summary) return summary;
  if (call.name === 'applyMetadata') {
    const docId = readString(call.args['docId']) ?? 'a document';
    return `Apply metadata changes to ${docId}.`;
  }
  return `Run ${call.name}.`;
}

function isAbortError(cause: unknown): boolean {
  return cause instanceof Error && (cause.name === 'AbortError' || isAbortMessage(cause.message));
}

/**
 * An aborted fetch reaches the browser under several names — `AbortError`,
 * `BodyStreamBuffer was aborted`, `The user aborted a request` — and by the time it is a
 * `RUN_ERROR` message the only thing left to match on is the wording.
 */
function isAbortMessage(message: string): boolean {
  return /abort/i.test(message);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readCitation(value: unknown): AgentCitation | null {
  const record = asRecord(value);
  const uid = readString(record['uid']) ?? readString(record['id']);
  if (!uid) return null;
  return {
    uid,
    title: readString(record['title']) ?? uid,
    ...(readString(record['path']) ? { path: readString(record['path']) } : {}),
    ...(readString(record['type']) ? { type: readString(record['type']) } : {}),
    ...(readString(record['excerpt']) ? { excerpt: readString(record['excerpt']) } : {}),
  };
}

/**
 * The calls an assistant turn opened, in the order the gateway streamed them.
 *
 * `TOOL_CALL_START` makes the SDK hang the call on the assistant message it is building,
 * or — when the frame carries no `parentMessageId`, which is the case for the
 * `TOOL_CALL_CHUNK` frames this gateway sends — push a fresh assistant message keyed by
 * the call id. Either way the message array is already in run order, so this is the
 * ordering information rather than a guess reconstructed from timestamps.
 */
function readToolCallIds(message: Readonly<Message>): string[] {
  const calls = (message as { toolCalls?: unknown }).toolCalls;
  if (!Array.isArray(calls)) return [];
  return calls
    .map((call) => readString(asRecord(call)['id']))
    .filter((id): id is string => id !== undefined);
}

/**
 * `UserMessage.content` is `string | InputContent[]`; every other role is a plain string.
 * Only the text parts are rendered — binary parts have no place in the transcript.
 */
function readMessageContent(message: Readonly<Message>): string {
  const content = (message as { content?: unknown }).content;
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((part) =>
      asRecord(part)['type'] === 'text' ? (readString(asRecord(part)['text']) ?? '') : '',
    )
    .filter(Boolean)
    .join('\n');
}
