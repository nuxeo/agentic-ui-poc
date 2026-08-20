import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AiChatService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';
import {
  AgentRuntimeService,
  AgentSelectionStore,
  type AgentApprovalRequest,
  type AgentCitation,
  type AgentMessage,
  type AgentFormSubmission,
  type AgentToolCall,
  type AgentWidgetRequest,
} from '@agentic-ui/shared/agent-client';
import {
  BrowseService,
  DocumentService,
  SelectionService,
  docTypeIcon,
} from '@agentic-ui/shared/nuxeo-client';

import { AiMarkdownPipe } from '../../pipes/ai-markdown.pipe';
import { AgentFormHostComponent } from './agent-form-host.component';
import { AgentWidgetHostComponent } from './agent-widget-host.component';
import { approvalBatch, approvalDocumentUids, type ApprovalRowView } from './approval-rows';
import {
  describeEntries,
  describeValue,
  formatArgLine,
  isRecord,
  truncate,
} from './chat-formatting';

const SUGGESTIONS = [
  'What documents were modified today?',
  'Summarize my pending tasks',
  'Show me recent uploads',
];

/**
 * How close to the bottom still counts as reading the tail, in CSS pixels. Wide enough to
 * absorb sub-pixel rounding and the last line's leading, narrow enough that a deliberate
 * scroll away from the newest content is never mistaken for staying with it.
 */
const FOLLOW_TAIL_THRESHOLD_PX = 32;

/**
 * One row of the agent transcript, in the order the run produced it.
 *
 * Messages and tool cards share a single list so a card lands where the call was made
 * rather than after everything the agent said. Exactly one of the two fields is set;
 * they are optional rather than a discriminated union so the template can narrow with
 * `@if (… ; as …)` instead of a type guard.
 */
export interface AgentTimelineEntry {
  id: string;
  message?: AgentMessage;
  call?: AgentToolCall;
}

/**
 * A tool result as the card shows it.
 *
 * `AgentToolCall.result` is the string the model consumes on its next turn, and for a
 * gateway tool ADR 001 requires that string to be stringified JSON — so the wire format
 * cannot change and the card has to do the reading instead.
 */
export interface ToolResultView {
  /** One line, already flattened and clipped. Rendered as text, never as markup. */
  summary: string;
  /** True when the payload did not report a success, whatever the call's own status says. */
  failed: boolean;
  /** True when the payload says a person refused the call, rather than that it went wrong. */
  refused: boolean;
  /** The payload as it arrived. Present whenever the summary is not the whole of it. */
  details?: string;
}

/** How much of a result line the card shows before the payload needs the expander. */
const RESULT_SUMMARY_MAX = 160;
/** How many items of a collection to name before the rest becomes a count. */
const NAMED_ITEMS = 3;

/**
 * The assistant drawer, over either of the two AI paths.
 *
 * When a gateway is deployed this binds to `AgentRuntimeService` and gets token streaming,
 * thinking steps, tool-call cards and human-in-the-loop approvals. When it is not, it falls
 * back to the single-shot Automation chat, which is the same experience the app shipped
 * before the agent runtime existed. Both render through `AiMarkdownPipe`, which parses the
 * model's markdown and sanitises the result before it reaches the DOM.
 */
@Component({
  selector: 'app-ai-chat-panel',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AiMarkdownPipe,
    AgentFormHostComponent,
    AgentWidgetHostComponent,
  ],
  templateUrl: './ai-chat-panel.component.html',
  styleUrl: './ai-chat-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChatPanelComponent {
  readonly closed = output<void>();

  private readonly router = inject(Router);
  /** What the user selected. Nothing reachable from the wire writes to this. */
  private readonly selection = inject(SelectionService);
  /** What the agent suggested. Everything reachable from the wire writes here. */
  private readonly agentSelection = inject(AgentSelectionStore);
  private readonly browse = inject(BrowseService);
  private readonly documents = inject(DocumentService);
  private readonly destroyRef = inject(DestroyRef);

  readonly agent = inject(AgentRuntimeService);
  readonly aiChat = inject(AiChatService);
  readonly featureFlags = inject(AiFeatureFlagService);

  readonly input = signal('');
  readonly suggestions = SUGGESTIONS;

  /**
   * Ids of the tool cards showing their raw payload. Truncating a result would hide the
   * one thing someone debugging a tool needs, so the payload is always one click away.
   */
  private readonly expandedResults = signal<ReadonlySet<string>>(new Set<string>());

  /**
   * Document titles the browser read back from Nuxeo, keyed by uid.
   *
   * A uid absent from this map is a uid the approval row shows as a uid. It is missing
   * either because the lookup has not answered yet or because Nuxeo refused it — and the
   * refusal is the interesting case, since a caller who cannot read a document has no
   * business being shown its title on the way to writing to it.
   */
  private readonly documentTitles = signal<ReadonlyMap<string, string>>(new Map());
  /** Uids already asked about, so a re-render does not re-ask. */
  private readonly requestedTitles = new Set<string>();

  private readonly messageList = viewChild<ElementRef<HTMLElement>>('messageList');
  /**
   * Whether the view should stay pinned to the newest content. Turned off the moment the
   * reader scrolls up, so a long answer arriving never drags them off what they are
   * reading, and turned back on when they return to the bottom or send a message.
   */
  private readonly followTail = signal(true);
  /**
   * The offset this component last pinned the list to.
   *
   * A `scroll` event alone is not enough to detect the reader moving away. Tokens arrive
   * every few tens of milliseconds, and a batch that lands between the wheel and the
   * event's dispatch grows the list and re-pins it, so the handler measures a position
   * that has already been corrected and concludes nobody moved. Comparing against what
   * was actually written does not depend on that ordering.
   */
  private pinnedScrollTop = 0;

  /** True when the streaming agent runtime is in use rather than the Automation fallback. */
  readonly agentMode = this.featureFlags.agentPathEnabled;

  readonly busy = computed(() => (this.agentMode() ? this.agent.running() : this.aiChat.loading()));
  readonly errorMessage = computed(() =>
    this.agentMode() ? this.agent.error() : this.aiChat.error(),
  );
  readonly showWelcome = computed(() =>
    this.agentMode() ? !this.agent.hasMessages() : !this.aiChat.hasMessages(),
  );
  /**
   * Tool cards worth showing. A call still streaming has nothing to say yet, and a call
   * with an approval card open is already on screen in a richer form — the card below
   * carries the same name and the same arguments plus the question and the buttons.
   * Once the decision is made the approval disappears and the tool card takes over as
   * the record of what was actually run.
   *
   * A write the server-enforced gate refused comes back as an ordinary result, so the call
   * reports itself complete and the card would carry a tick. It is restated as `rejected`
   * here — from the payload, not from the run — so a refusal never looks like a success.
   */
  readonly visibleToolCalls = computed(() => {
    const awaitingDecision = new Set(this.agent.approvals().map((request) => request.id));
    return this.agent
      .toolCalls()
      .filter((call) => call.status !== 'streaming' && !awaitingDecision.has(call.id))
      .map((call) =>
        summarizeToolResult(call.result)?.refused ? { ...call, status: 'rejected' as const } : call,
      );
  });
  readonly activeThinkingSteps = computed(() =>
    this.agent.running() ? this.agent.thinkingSteps() : [],
  );

  /**
   * Widgets to mount, indexed by the tool call each one belongs under.
   *
   * A widget renders beneath its own card rather than at the end of the turn, so
   * a list of search results sits under the search that produced it. The tool
   * card stays either way — the component is additive, and a gateway that never
   * sends a render event leaves this map empty and the panel exactly as it was.
   */
  private readonly widgetsByCall = computed(
    () => new Map(this.agent.widgets().map((widget) => [widget.toolCallId, widget])),
  );

  /**
   * Every decision the turn is waiting on, as one card.
   *
   * Grouping is presentation and nothing more. Each row still answers its own request by
   * id through `respondToApproval`, so the browser still composes one `resume` entry per
   * interrupt, each carrying its own verdict — the property ADR 001 rests on survives
   * because there is no code path here that takes more than one id at a time.
   */
  readonly approvalBatch = computed(() =>
    approvalBatch(this.agent.approvals(), this.documentTitles(), this.formsUnavailable()),
  );

  /**
   * Requests whose declared form could not be mounted, so the row falls back to
   * Decline / Approve.
   *
   * A form that failed to load must not leave a gated write with no affordance,
   * and must not answer it either — the user has not decided. The card is the
   * honest fallback: it authorises exactly the arguments the model proposed,
   * which is what every write showed before this channel existed.
   */
  private readonly formsUnavailable = signal<ReadonlySet<string>>(new Set<string>());

  /**
   * The transcript in the order it happened: text, the call it triggered, the text that
   * followed. `toolCallIds` on each assistant turn is what supplies the position.
   */
  readonly timeline = computed<AgentTimelineEntry[]>(() => {
    const unplaced = new Map(this.visibleToolCalls().map((call) => [call.id, call]));
    const entries: AgentTimelineEntry[] = [];
    for (const message of this.agent.messages()) {
      // `tool` messages are the results the agent reads; the card already shows them.
      if (message.role === 'tool') continue;
      if (message.content) entries.push({ id: message.id, message });
      for (const id of message.toolCallIds ?? []) {
        const call = unplaced.get(id);
        if (!call) continue;
        unplaced.delete(id);
        entries.push({ id: `tool:${id}`, call });
      }
    }
    // Calls no turn claims: rebuilt from an interrupt rather than streamed, or streamed
    // into a message the SDK has not handed back yet. Appended rather than dropped.
    for (const call of unplaced.values()) entries.push({ id: `tool:${call.id}`, call });
    return entries;
  });

  /**
   * The typing dots stand in for an answer that has not started arriving. Once the first
   * tokens are in the transcript they would sit under text that is already growing.
   */
  readonly showTyping = computed(() => {
    if (!this.busy()) return false;
    if (!this.agentMode()) return true;
    return this.timeline().at(-1)?.message?.role !== 'assistant';
  });

  constructor() {
    this.registerFrontendTools();
    // A row names its document by asking Nuxeo, which is a request rather than a
    // derivation and so cannot live in the computed that renders it.
    effect(() => {
      for (const uid of approvalDocumentUids(this.agent.approvals())) this.resolveTitle(uid);
    });
    // After render, not before: the decision needs the laid-out height of the content
    // this same change has just added.
    afterRenderEffect(() => {
      // Read only for tracking — any of these growing is a reason to move the view.
      this.timeline();
      this.aiChat.messages();
      this.agent.approvals();
      this.activeThinkingSteps();
      this.showTyping();
      this.errorMessage();
      if (this.followTail()) this.pinToTail();
    });
  }

  send(): void {
    const text = this.input().trim();
    if (!text || this.busy()) return;
    this.input.set('');
    // Asking a question is a request to see the answer, wherever the view had drifted to.
    this.resumeFollowingTail();
    this.agent.setContext(this.currentContext());
    if (this.agentMode()) this.agent.send(text);
    else this.aiChat.send(text);
  }

  /** Reading the tail is what follows it; scrolling away from the tail is what stops. */
  onMessagesScroll(): void {
    const element = this.messageList()?.nativeElement;
    if (!element) return;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    this.followTail.set(distanceFromBottom <= FOLLOW_TAIL_THRESHOLD_PX);
    this.pinnedScrollTop = element.scrollTop;
  }

  sendSuggestion(text: string): void {
    this.input.set(text);
    this.send();
  }

  cancel(): void {
    this.agent.abortRun();
  }

  clear(): void {
    this.resumeFollowingTail();
    this.agent.clear();
    this.aiChat.clear();
  }

  close(): void {
    this.closed.emit();
  }

  /**
   * Approves one write.
   *
   * Takes a row rather than a batch, and there is deliberately no counterpart that takes
   * several. A control that approves every row in one click would put the reviewing back
   * where the stack of identical cards had it — a single gesture standing in for five
   * decisions nobody read — and that is the failure the server-enforced gate exists to
   * make impossible. {@link declineAllRemaining} is offered instead, because a refusal
   * cannot write anything and so costs nothing to get wrong.
   */
  approve(request: AgentApprovalRequest | ApprovalRowView): void {
    this.agent.respondToApproval(request.id, true);
  }

  decline(request: AgentApprovalRequest | ApprovalRowView): void {
    this.agent.respondToApproval(request.id, false);
  }

  /**
   * Approves one write by submitting the form it declared.
   *
   * The same grant `approve` produces, carrying the values the user typed. There
   * is deliberately no second confirmation step: in a card the model authored the
   * arguments and the human authored a boolean, so the boolean has to attach to
   * something machine-read; in a form the human authored the values and the
   * intent, and asking anyway trains people to click Approve on cards they have
   * not read — which degrades the affordance protecting every case where the
   * model *did* author the arguments (ADR 001, and `interrupt-forms.ts`).
   */
  submitApprovalForm(row: ApprovalRowView, fields: AgentFormSubmission): void {
    this.agent.submitApprovalForm(row.id, fields);
  }

  /**
   * Records that a row's form could not be mounted, so it falls back to the card.
   *
   * Not a decline: the user has not answered, and answering for them would either
   * write something nobody saw or refuse something they wanted. The decision stays
   * open with the affordance that has always worked.
   */
  formUnavailable(row: ApprovalRowView): void {
    this.formsUnavailable.update((current) => {
      if (current.has(row.id)) return current;
      const next = new Set(current);
      next.add(row.id);
      return next;
    });
  }

  /**
   * Refuses every row still waiting, one call per row.
   *
   * This is the only batch control on the card, and it is safe to batch for the reason
   * approving is not: no write follows from it. Rows already answered keep the answer
   * they were given — the runtime ignores a second verdict — so this cannot silently
   * retract an approval the user made on purpose.
   *
   * A row showing a form is skipped. Refusing it is still safe in the sense that
   * matters — nothing would be written — but it would throw away values the user
   * had typed in response to a control that stays on screen offering its own
   * Cancel. A batch control that discards work is a different thing from one that
   * declines a question, and this one is only meant to be the second.
   */
  declineAllRemaining(): void {
    for (const row of this.approvalBatch()?.rows ?? []) {
      if (!row.verdict && !row.form) this.agent.respondToApproval(row.id, false);
    }
  }

  openCitation(citation: AgentCitation): void {
    this.closed.emit();
    void this.router.navigate(['/doc', citation.uid]);
  }

  citationIcon(citation: AgentCitation): string {
    return docTypeIcon(citation.type ?? 'File');
  }

  toolCallIcon(call: AgentToolCall): string {
    switch (call.status) {
      case 'complete':
        return 'check_circle';
      case 'failed':
        return 'error_outline';
      case 'rejected':
        return 'block';
      case 'awaiting-approval':
        return 'pan_tool';
      default:
        return 'bolt';
    }
  }

  /** Arguments are rendered as text, never as markup. */
  formatArgs(args: Record<string, unknown>): string {
    return formatArgLine(args);
  }

  /**
   * What the tool came back with, at a glance.
   *
   * Returns `null` when there is nothing to show yet, so the template can drop the line
   * entirely rather than render an empty one.
   */
  formatResult(result: string | undefined): ToolResultView | null {
    return summarizeToolResult(result);
  }

  /** The widget this tool call mounts, or null for the calls that mount none. */
  widgetFor(callId: string): AgentWidgetRequest | null {
    return this.widgetsByCall().get(callId) ?? null;
  }

  /** Whether this card is currently showing the payload behind its summary. */
  showsResultDetails(callId: string): boolean {
    return this.expandedResults().has(callId);
  }

  toggleResultDetails(callId: string): void {
    this.expandedResults.update((open) => {
      const next = new Set(open);
      if (!next.delete(callId)) next.add(callId);
      return next;
    });
  }

  /**
   * Asks Nuxeo what this document is called, once per uid.
   *
   * Through `DocumentService`, so the auth interceptor supplies the caller's credentials
   * and Nuxeo answers with the caller's own ACLs — the same rule ADR 001 sets for a
   * chat-rendered form's target: resolved by the browser from the uid, never a title the
   * model supplied. A failure is left unrecorded on purpose, so the row keeps showing the
   * uid rather than anything the panel had to guess.
   */
  private resolveTitle(uid: string): void {
    if (this.requestedTitles.has(uid)) return;
    this.requestedTitles.add(uid);
    this.documents
      .getById(uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          const title = readTitle(doc);
          if (!title) return;
          this.documentTitles.update((titles) => new Map(titles).set(uid, title));
        },
        error: () => {
          /* Unreadable or gone: the uid stands on its own. */
        },
      });
  }

  private pinToTail(): void {
    const element = this.messageList()?.nativeElement;
    if (!element) return;
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    // Below where this component left it, and not merely clamped there by the list
    // getting shorter, means the reader moved. Leave them where they are.
    if (element.scrollTop < this.pinnedScrollTop && element.scrollTop < maxScrollTop) {
      this.followTail.set(false);
      return;
    }
    // `instant` overrides the panel's `scroll-behavior: smooth` for this call only.
    // An animation cannot keep up with tokens arriving every few tens of milliseconds,
    // and one still in flight when the reader scrolls would drag them back down.
    element.scrollTo({ top: maxScrollTop, behavior: 'instant' });
    this.pinnedScrollTop = element.scrollTop;
  }

  private resumeFollowingTail(): void {
    this.pinnedScrollTop = 0;
    this.followTail.set(true);
  }

  /**
   * What the agent is told about where the user is, rebuilt on every send.
   *
   * The two selection fields come from two different places on purpose.
   * `selectionIds` is `SelectionService`, which holds only what a person ticked
   * — the model has no writer into it, by construction. `proposedSelectionIds`
   * is the model's own outstanding suggestion, sent back so it does not repeat
   * itself, and named in `buildContext` so it cannot be mistaken for the first.
   *
   * Both are read here rather than mirrored into AG-UI shared state, so there is
   * one authority for each and no server-held copy to drift from it.
   *
   * A suggestion the user has since ticked is subtracted from the second list
   * rather than appearing in both. Its name says "awaiting confirmation", which
   * stops being true the moment it is confirmed, and a uid in both lists invites
   * exactly the conflation the two names exist to prevent. The subtraction is
   * here and not in `AgentSelectionStore` deliberately: the store does not
   * import `SelectionService`, and that is the property that makes a
   * model-written selection impossible rather than merely checked for.
   */
  private currentContext() {
    const url = this.router.url;
    const docMatch = url.match(/\/doc\/([a-f0-9-]+)/i);
    const selectionIds = this.selection.selectedItems().map((item) => item.id);
    const selected = new Set(selectionIds);
    const proposedSelectionIds = this.agentSelection.proposals().filter((id) => !selected.has(id));
    return {
      page: url,
      ...(docMatch?.[1] ? { docId: docMatch[1] } : {}),
      ...(selectionIds.length > 0 ? { selectionIds } : {}),
      ...(proposedSelectionIds.length > 0 ? { proposedSelectionIds } : {}),
    };
  }

  /**
   * Browser-side implementations of the frontend-declared tools.
   *
   * `navigateTo` and `selectDocuments` only move the UI, so they run as soon as the agent
   * asks. `applyMetadata` writes to the repository and therefore never reaches this handler
   * until the user has approved it — `AgentRuntimeService` holds it in `approvals` first.
   * The write goes through `BrowseService`, so the auth interceptor attaches the caller's
   * credentials and Nuxeo applies the caller's ACLs.
   *
   * `confirmAction` deliberately has no handler: the answer the agent is waiting for is the
   * user's verdict, which the approval prompt already returns.
   */
  private registerFrontendTools(): void {
    const unregister = [
      this.agent.registerToolHandler('navigateTo', (args) => {
        const route = typeof args['route'] === 'string' ? args['route'] : '';
        if (!route.startsWith('/')) return 'Refused: the route was not an application path.';
        void this.router.navigateByUrl(route);
        return `Navigated to ${route}.`;
      }),

      // Proposes, and cannot select. Until A7 stage 2 this handler called
      // `SelectionService.selectAll`, which made the model's assertion
      // indistinguishable from the user's choice: `currentContext` sends
      // `SelectionService` to the gateway as `selectionIds` on the next turn, so
      // an agent could select documents, read them back one turn later as the
      // user's, and leave the application's selection toolbar — Delete included
      // — armed over documents nobody chose. A poisoned document is enough to
      // steer it. The tool now writes to the proposal channel, which renders as
      // a suggestion the user accepts with a tick. See `agent-selection.ts`.
      this.agent.registerToolHandler('selectDocuments', (args) => {
        const docIds = Array.isArray(args['docIds']) ? args['docIds'] : [];
        if (docIds.length === 0) return 'No document ids were supplied, so nothing was suggested.';
        const { accepted, refused } = this.agentSelection.propose(docIds);
        if (accepted.length === 0) {
          return (
            'Nothing was suggested: none of those documents are on screen. ' +
            'Show them in the conversation first, then suggest them.'
          );
        }
        const refusedNote = refused.length
          ? ` ${refused.length} were not shown to the user and were dropped.`
          : '';
        return (
          `Suggested ${accepted.length} document(s) to the user. They are NOT selected ` +
          `until the user ticks them, and you must not act on them until they appear ` +
          `in documentsSelectedByUser.${refusedNote}`
        );
      }),

      this.agent.registerToolHandler('applyMetadata', (args) => this.applyMetadata(args)),
    ];

    this.destroyRef.onDestroy(() => unregister.forEach((remove) => remove()));
  }

  private applyMetadata(args: Record<string, unknown>): Promise<string> {
    const docId = typeof args['docId'] === 'string' ? args['docId'] : '';
    const properties =
      args['properties'] && typeof args['properties'] === 'object'
        ? (args['properties'] as Record<string, unknown>)
        : null;
    if (!docId || !properties) {
      return Promise.resolve('Refused: the metadata update was missing a document or properties.');
    }

    return new Promise<string>((resolve) => {
      this.browse
        .updateDocument(docId, properties)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () =>
            resolve(`Updated ${Object.keys(properties).length} propert(ies) on ${docId}.`),
          error: () => resolve(`Nuxeo rejected the metadata update on ${docId}.`),
        });
    });
  }
}

/** The document's own title, however Nuxeo returned it. */
function readTitle(doc: { title?: string; properties?: Record<string, unknown> }): string {
  const title = doc.title ?? doc.properties?.['dc:title'];
  return typeof title === 'string' ? title.trim() : '';
}

/**
 * Reads a tool result into one line, whatever shape it is in.
 *
 * The order matters. A failure is reported as a failure before anything tries to count it;
 * a refusal is separated from a failure because a person saying no is not something going
 * wrong; a payload that names the one thing it describes is read as that thing before the
 * collection branch can find an array inside it — a document carries a `permissions` array,
 * and `33 permissions: Write, WriteVersion, …` is a true sentence about the wrong subject.
 * Tools are a public extension point, so the last branch is the one that will meet a third
 * party's payload: it must stay readable without knowing anything about it.
 */
function summarizeToolResult(result: string | undefined): ToolResultView | null {
  const raw = (result ?? '').trim();
  if (!raw) return null;

  const payload = parseJson(raw);
  // Most browser-side tools answer in a sentence, which is already the summary.
  if (payload === undefined) return resultView(raw, false, raw);

  const failure = failureMessage(payload);
  if (failure) return resultView(failure, true, raw);

  // A refusal is not a failure and a gateway refusal is not a decline. Both are drawn as
  // "not a success"; only a decline is attributed to the person reading it.
  const refusal = refusalSummary(payload);
  if (refusal) return { ...resultView(refusal, true, raw), refused: true };

  const entity = entitySummary(payload);
  if (entity) return resultView(entity, false, raw);

  const collection = collectionSummary(payload);
  if (collection) return resultView(collection, false, raw);

  return resultView(describeShape(payload), false, raw);
}

function resultView(summary: string, failed: boolean, raw: string): ToolResultView {
  const line = truncate(summary, RESULT_SUMMARY_MAX);
  // The payload is offered whenever the line is not literally all of it — which is every
  // JSON result, and any prose long or multi-line enough to have been clipped.
  return { summary: line, failed, refused: false, ...(line === raw ? {} : { details: raw }) };
}

function parseJson(raw: string): unknown {
  if (!raw.startsWith('{') && !raw.startsWith('[')) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    // Truncated or malformed JSON — a streamed result can arrive that way. Read as prose.
    return undefined;
  }
}

/** The message a payload is reporting a failure with, or `null` if it is not one. */
function failureMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const error = payload['error'];
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (isRecord(error) && typeof error['message'] === 'string') return error['message'];

  const declaredFailure =
    error === true ||
    payload['ok'] === false ||
    payload['success'] === false ||
    payload['status'] === 'error' ||
    payload['status'] === 'failed';
  if (!declaredFailure) return null;

  for (const key of ['message', 'reason', 'detail']) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return 'The tool reported a failure.';
}

/** What a write the person themselves turned down comes back as. */
const DECLINED_BY_USER = 'Declined by the user. Nothing was changed.';

/**
 * What a write the gateway stopped comes back as, when its code says nothing better.
 *
 * "Blocked", not "declined": the one person reading this card is the one person who knows
 * whether they declined, so telling them they did when they did not is the single most
 * corrosive thing this line can say. It also invites a retry of something that will refuse
 * again for the same reason.
 */
const BLOCKED_BY_GATEWAY = 'Blocked before it ran. Nothing was changed.';

/**
 * The reason a gateway refusal happened, in the user's words rather than the model's.
 *
 * Keyed on the codes the gateway actually emits — `write-preflight.ts`'s three and
 * `interrupt-forms.ts`'s two. A code absent from here falls back to
 * {@link BLOCKED_BY_GATEWAY}, so a new refusal code degrades to a true-but-vague sentence
 * rather than to a wrong one; that is the same deny-by-default shape as the rest of this
 * path. The gateway's own `reason` is not used because it is written *for the model* — it
 * carries instructions like "do not retry the call" that make no sense to a person.
 */
const GATEWAY_REFUSAL_REASONS: Readonly<Record<string, string>> = {
  legal_hold: 'Blocked: the document is under retention or legal hold. Nothing was changed.',
  immutable_version: 'Blocked: the document is a version, which cannot be changed.',
  permission_denied: 'Blocked: you do not have permission to change this. Nothing was changed.',
  form_not_declared: 'Blocked: this change does not accept a form. Nothing was changed.',
  invalid_form_submission: 'Blocked: the submitted values were not accepted. Nothing was changed.',
};

/**
 * How a refused write is described, or `null` if the payload is not a refusal.
 *
 * The three-way split this replaces a two-way one with. A person declining, the gateway
 * refusing, and a tool failing are three different events, and the previous version
 * collapsed the first two: `approved === false` is on *every* refusal payload the gateway
 * writes, so `refusedContent`'s legal-hold refusal and `formRejectedOutcome`'s rejection
 * both printed "Declined by the user. Nothing was changed."
 *
 * `decidedBy` is what makes the split reliable, and it is on the wire precisely because
 * ADR 001 requires an outcome to say who caused it. Reading it here is applying that rule
 * to the person, having already applied it to the model.
 */
function refusalSummary(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  const status = payload['status'];
  const declined = status === 'declined';
  const refused = status === 'refused';
  // `approved === false` alone still counts, because a third-party tool reporting only
  // that much means the same thing. It is read as a *gateway* refusal unless something
  // says a person decided, which is the safe direction: claiming the user declined is the
  // assertion that needs evidence.
  if (!declined && !refused && payload['approved'] !== false) return null;

  const byUser =
    payload['decidedBy'] === 'user' || (declined && payload['decidedBy'] === undefined);
  if (byUser) return DECLINED_BY_USER;

  const code = payload['code'];
  return (
    (typeof code === 'string' ? GATEWAY_REFUSAL_REASONS[code] : undefined) ?? BLOCKED_BY_GATEWAY
  );
}

/** Keys whose own name says nothing, so the count is described as results instead. */
const GENERIC_COLLECTION_KEYS = new Set(['', 'entries', 'results', 'items', 'data', 'values']);
/** Where an item's human label tends to live, in the order worth trying. */
const LABEL_KEYS = ['title', 'dc:title', 'name', 'label', 'summary', 'path', 'uid', 'id'];
/**
 * The subset of those that name a thing rather than identify it, so they can carry a line
 * on their own. A uid is a fine label inside a list and a poor headline above one.
 */
const HEADLINE_KEYS = ['title', 'dc:title', 'name', 'label', 'summary'];
/** Past this, a string is the payload's content rather than a name for it. */
const LABEL_MAX = 60;

/**
 * `Vendor onboarding checklist · uid: … · type: File` — a payload that names the one thing
 * it describes, read as that thing, with the rest of the payload behind it.
 *
 * Returns `null` for anything with no name of its own, which is what sends a search result
 * on to the collection branch.
 */
function entitySummary(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const key = HEADLINE_KEYS.find((candidate) => {
    const value = payload[candidate];
    return typeof value === 'string' && value.trim() !== '';
  });
  if (!key) return null;
  const headline = (payload[key] as string).trim();
  const rest = describeEntries(Object.entries(payload).filter(([name]) => name !== key));
  return rest ? `${headline} · ${rest}` : headline;
}

/** `3 results: Contract A, Contract B, Contract C` rather than the serialised array. */
function collectionSummary(payload: unknown): string | null {
  const found = findCollection(payload);
  if (!found) return null;
  const [key, items] = found;

  // A paged tool reports the repository total, which is the number the user asked about.
  const total = countFrom(payload) ?? items.length;
  const noun = pluralize(GENERIC_COLLECTION_KEYS.has(key) ? 'results' : key, total);
  if (total === 0) return `No ${noun}`;

  const labels = distinctLabels(items);
  if (labels.length === 0) return `${total} ${noun}`;
  const remaining = total - labels.length;
  return `${total} ${noun}: ${labels.join(', ')}${remaining > 0 ? `, +${remaining} more` : ''}`;
}

/**
 * The first few distinguishable names in a list.
 *
 * Distinct rather than the first `NAMED_ITEMS` verbatim, because an audit page is twenty
 * rows of `loginSuccess` and naming it three times reads as a rendering fault. The count in
 * front stays the real one, so the line still says how many there were.
 */
function distinctLabels(items: readonly unknown[]): string[] {
  const labels: string[] = [];
  for (const item of items) {
    const label = labelOf(item);
    if (!label || labels.includes(label)) continue;
    labels.push(label);
    if (labels.length === NAMED_ITEMS) break;
  }
  return labels;
}

function findCollection(payload: unknown): [string, unknown[]] | null {
  if (Array.isArray(payload)) return ['', payload];
  if (!isRecord(payload)) return null;
  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value)) return [key, value];
  }
  return null;
}

function countFrom(payload: unknown): number | null {
  if (!isRecord(payload)) return null;
  for (const key of ['totalSize', 'resultsCount', 'total', 'count']) {
    const value = payload[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}

function labelOf(item: unknown): string {
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (!isRecord(item)) return '';
  const properties = isRecord(item['properties']) ? item['properties'] : {};
  for (const key of LABEL_KEYS) {
    const value = item[key] ?? properties[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  // Nothing named like a label. The first short string is the best guess left, and is what
  // turns a bare `20 results` from the audit log into `20 results: loginSuccess, …`.
  for (const value of Object.values(item)) {
    if (typeof value !== 'string') continue;
    const text = value.trim();
    if (text && text.length <= LABEL_MAX && !text.includes('\n')) return text;
  }
  return '';
}

function pluralize(noun: string, count: number): string {
  if (count === 1) {
    if (noun.endsWith('ies')) return `${noun.slice(0, -3)}y`;
    if (noun.endsWith('s')) return noun.slice(0, -1);
  }
  return noun;
}

/**
 * The fallback for a shape nothing above recognised: the same `key: value · key: value`
 * line the arguments use, which is the format the card already proves is readable.
 */
function describeShape(payload: unknown): string {
  if (!isRecord(payload)) return describeValue(payload);
  return describeEntries(Object.entries(payload)) || 'Completed with no details.';
}
