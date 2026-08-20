import { ApplicationRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import type { AgentSubscriber, RunAgentParameters, RunAgentResult } from '@ag-ui/client';
import type { Interrupt, Message, State } from '@ag-ui/core';

import { AiChatService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';
import {
  AGENT_DEV_AUTH_HEADERS,
  AGENT_RUNNER_FACTORY,
  AgentRuntimeService,
  AgentSelectionStore,
  provideAgentFormComponents,
  type AgentApprovalAction,
  type AgentApprovalRequest,
  type AgentFormRequest,
  type AgentMessage,
  type AgentRunner,
  type AgentThinkingStep,
  type AgentToolCall,
  type AgentToolHandler,
  type AgentWidgetRequest,
} from '@agentic-ui/shared/agent-client';
import {
  BrowseService,
  DocumentService,
  NuxeoDocument,
  SelectionService,
} from '@agentic-ui/shared/nuxeo-client';
import { documentMetadataForm } from '@agentic-ui/shared/ui/agent-forms';

import { AiChatPanelComponent } from './ai-chat-panel.component';

/**
 * Nuxeo answering "what is this document called".
 *
 * An approval row never shows a title the model supplied, so the only way a name reaches
 * the card is a read the browser performs as the caller. A uid this double does not know
 * is answered with a 404, which is what a user who cannot read the document also gets —
 * the row then shows the uid, which is the behaviour worth pinning.
 */
function fakeDocuments(titles: Record<string, string> = {}) {
  const service = jasmine.createSpyObj<DocumentService>('DocumentService', ['getById']);
  service.getById.and.callFake((uid: string) =>
    titles[uid]
      ? of({ uid, title: titles[uid], properties: {} } as NuxeoDocument)
      : throwError(() => new Error('404')),
  );
  return service;
}

/** Signal-shaped doubles, so the component binds to them exactly as it binds to the real services. */
function fakeAgent() {
  const handlers = new Map<string, AgentToolHandler>();
  return {
    handlers,
    messages: signal<AgentMessage[]>([]),
    streamingText: signal(''),
    toolCalls: signal<AgentToolCall[]>([]),
    thinkingSteps: signal<AgentThinkingStep[]>([]),
    sharedState: signal<Record<string, unknown>>({}),
    widgets: signal<AgentWidgetRequest[]>([]),
    running: signal(false),
    error: signal<string | null>(null),
    approvals: signal<AgentApprovalRequest[]>([]),
    hasMessages: signal(false),
    send: jasmine.createSpy('send'),
    abortRun: jasmine.createSpy('abortRun'),
    respondToApproval: jasmine.createSpy('respondToApproval'),
    submitApprovalForm: jasmine.createSpy('submitApprovalForm'),
    setContext: jasmine.createSpy('setContext'),
    clear: jasmine.createSpy('clear'),
    registerToolHandler: (name: string, handler: AgentToolHandler) => {
      handlers.set(name, handler);
      return () => handlers.delete(name);
    },
  };
}

/**
 * A gateway stand-in for the integration test at the bottom of this file.
 *
 * `libs/shared/agent-client/src/lib/testing/fake-agent-runner.ts` is the canonical version
 * of this and covers far more of the protocol; this is a deliberately small local copy,
 * because the lib's double is a test artefact and does not belong in the barrel the app
 * imports at runtime. Both model the one behaviour that matters: `AbstractAgent` refuses,
 * before the fetch, to start a run that leaves an interrupt unaddressed.
 */
type RunScript = (subscriber: AgentSubscriber, runner: GatewayStub) => Promise<void>;

class GatewayStub implements AgentRunner {
  threadId = 'thread-1';
  messages: Message[] = [];
  state: State = {};
  headers: Record<string, string> = {};
  pendingInterrupts: Interrupt[] = [];

  readonly runs: RunAgentParameters[] = [];

  private readonly subscribers: AgentSubscriber[] = [];
  private readonly scripts: RunScript[] = [];

  script(...scripts: RunScript[]): void {
    this.scripts.push(...scripts);
  }

  subscribe(subscriber: AgentSubscriber): { unsubscribe: () => void } {
    this.subscribers.push(subscriber);
    return {
      unsubscribe: () => void this.subscribers.splice(this.subscribers.indexOf(subscriber), 1),
    };
  }

  async runAgent(parameters?: RunAgentParameters): Promise<RunAgentResult> {
    const addressed = new Set((parameters?.resume ?? []).map((entry) => entry.interruptId));
    const unaddressed = this.pendingInterrupts.filter((entry) => !addressed.has(entry.id));
    if (unaddressed.length > 0) {
      throw new Error(
        `Thread has ${unaddressed.length} pending interrupt(s) not addressed by resume`,
      );
    }
    this.runs.push(parameters ?? {});
    const script = this.scripts.shift();
    if (script && this.subscribers[0]) await script(this.subscribers[0], this);
    return { result: undefined, newMessages: [] };
  }

  abortRun(): void {
    /* nothing in flight in these tests */
  }

  addMessage(message: Message): void {
    this.messages = [...this.messages, message];
  }

  setMessages(messages: Message[]): void {
    this.messages = [...messages];
  }

  /** Lets the adapter's promise chain drain between user actions. */
  async settled(): Promise<void> {
    for (let tick = 0; tick < 4; tick += 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  params() {
    return {
      messages: this.messages,
      state: this.state,
      agent: this as never,
      input: { threadId: this.threadId, runId: 'run-1' } as never,
    };
  }
}

/** The gateway's handoff for a mutating tool: the call is streamed *and* interrupted on. */
function applyMetadataTurn(
  id: string,
  docId: string,
  properties: Record<string, unknown>,
): RunScript {
  const args = { docId, properties };
  return async (subscriber, runner) => {
    const params = runner.params();
    await subscriber.onToolCallStartEvent?.({
      event: { type: 'TOOL_CALL_START', toolCallId: id, toolCallName: 'applyMetadata' } as never,
      ...params,
    });
    await subscriber.onToolCallEndEvent?.({
      event: { type: 'TOOL_CALL_END', toolCallId: id } as never,
      toolCallName: 'applyMetadata',
      toolCallArgs: args,
      ...params,
    });
    const interrupts = [
      {
        id,
        reason: 'applyMetadata',
        message: `Apply metadata changes to ${docId}?`,
        toolCallId: id,
        metadata: { kind: 'client_tool', toolName: 'applyMetadata', args },
      } as Interrupt,
    ];
    await subscriber.onRunFinishedEvent?.({
      event: { type: 'RUN_FINISHED', threadId: runner.threadId, runId: 'r1' } as never,
      ...params,
      outcome: 'interrupt',
      interrupts,
    } as never);
    runner.pendingInterrupts = interrupts;
  };
}

/**
 * The gateway's handoff for server-side writes, which is what a multi-write turn is.
 *
 * Each call is streamed and then interrupted on, `id === toolCallId`, carrying
 * `metadata.kind: "mutation_approval"` — ADR 001's shape, and the reason nothing runs in
 * the browser when one of these is approved. All of them arrive in one `RUN_FINISHED`,
 * which is exactly the batch the grouped card exists to render.
 */
function mutationBatchTurn(
  calls: readonly { id: string; name: string; args: Record<string, unknown> }[],
): RunScript {
  return async (subscriber, runner) => {
    const params = runner.params();
    for (const call of calls) {
      await subscriber.onToolCallStartEvent?.({
        event: {
          type: 'TOOL_CALL_START',
          toolCallId: call.id,
          toolCallName: call.name,
        } as never,
        ...params,
      });
      await subscriber.onToolCallEndEvent?.({
        event: { type: 'TOOL_CALL_END', toolCallId: call.id } as never,
        toolCallName: call.name,
        toolCallArgs: call.args,
        ...params,
      });
    }
    const interrupts = calls.map(
      (call) =>
        ({
          id: call.id,
          reason: call.name,
          message:
            `The assistant wants to run ${call.name}, which changes content in Nuxeo. ` +
            `Nothing is written unless you approve it.`,
          toolCallId: call.id,
          metadata: { kind: 'mutation_approval', toolName: call.name, args: call.args },
        }) as Interrupt,
    );
    await subscriber.onRunFinishedEvent?.({
      event: { type: 'RUN_FINISHED', threadId: runner.threadId, runId: 'r1' } as never,
      ...params,
      outcome: 'interrupt',
      interrupts,
    } as never);
    runner.pendingInterrupts = interrupts;
  };
}

/** A plain answering run, which clears the SDK's pending interrupts as the real one does. */
function settledRun(messageId: string, text: string): RunScript {
  return async (subscriber, runner) => {
    const params = runner.params();
    runner.addMessage({ id: messageId, role: 'assistant', content: text });
    await subscriber.onTextMessageEndEvent?.({
      event: { type: 'TEXT_MESSAGE_END', messageId } as never,
      textMessageBuffer: text,
      ...params,
    });
    await subscriber.onRunFinishedEvent?.({
      event: { type: 'RUN_FINISHED', threadId: runner.threadId, runId: 'r2' } as never,
      ...params,
      outcome: 'success',
      result: { stopReason: 'complete' },
    } as never);
    runner.pendingInterrupts = [];
  };
}

function fakeChat() {
  return {
    messages: signal<Array<{ role: string; content: string; timestamp: Date }>>([]),
    loading: signal(false),
    error: signal<string | null>(null),
    hasMessages: signal(false),
    panelOpen: signal(true),
    send: jasmine.createSpy('send'),
    clear: jasmine.createSpy('clear'),
    setContext: jasmine.createSpy('setContext'),
  };
}

describe('AiChatPanelComponent', () => {
  let fixture: ComponentFixture<AiChatPanelComponent>;
  let component: AiChatPanelComponent;
  let agent: ReturnType<typeof fakeAgent>;
  let chat: ReturnType<typeof fakeChat>;
  let router: jasmine.SpyObj<Router>;
  let browse: jasmine.SpyObj<BrowseService>;
  let selection: jasmine.SpyObj<SelectionService>;
  let documents: jasmine.SpyObj<DocumentService>;
  let agentRuntimeAvailable: ReturnType<typeof signal<boolean>>;
  /**
   * The real store, not a double. Its whole value is the shape of its API — that
   * there is no way to select from it — so substituting a fake would test the
   * fake's shape instead of the one that ships.
   */
  let agentSelection: AgentSelectionStore;

  function build(agentDeployed: boolean) {
    agentRuntimeAvailable.set(agentDeployed);
    fixture = TestBed.createComponent(AiChatPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  /** The transcript rows in DOM order, as `<kind>:<first meaningful text>`. */
  function rowSummaries(): string[] {
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.ai-chat-messages > .ai-chat-msg, .ai-chat-messages > .ai-tool-card',
    );
    return Array.from(rows).map((row) => {
      const label = row.classList.contains('ai-tool-card') ? 'ai-tool-card' : 'ai-chat-msg';
      const content = row.querySelector('.ai-msg-content, .ai-tool-card-name');
      return `${label}:${content?.textContent?.trim() ?? ''}`;
    });
  }

  /** The tool card's result line, as the reader sees it. */
  function resultLine(): string {
    const line = (fixture.nativeElement as HTMLElement).querySelector('.ai-tool-card-result');
    return line?.textContent?.trim() ?? '';
  }

  function resultFailed(): boolean {
    const line = (fixture.nativeElement as HTMLElement).querySelector('.ai-tool-card-result');
    return line?.classList.contains('is-failure') ?? false;
  }

  /** The status the card is drawn with, which is what gives it its icon and its border. */
  function cardStatus(): string | null {
    const card = (fixture.nativeElement as HTMLElement).querySelector('.ai-tool-card');
    return card?.getAttribute('data-status') ?? null;
  }

  function rawToggle(): HTMLButtonElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.ai-tool-card-raw-toggle',
    );
  }

  /** Puts one finished call on screen with the payload a tool returned. */
  function showResult(result: string, name = 'nuxeo.searchDocuments'): void {
    agent.toolCalls.set([{ id: 'c1', name, args: {}, status: 'complete', result }]);
    fixture.detectChanges();
  }

  beforeEach(() => {
    agent = fakeAgent();
    chat = fakeChat();
    agentRuntimeAvailable = signal(false);
    const aiEnabled = signal(true);
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl'], {
      url: '/search',
    });
    browse = jasmine.createSpyObj<BrowseService>('BrowseService', ['updateDocument']);
    selection = jasmine.createSpyObj<SelectionService>('SelectionService', [
      'selectAll',
      'selectedItems',
      'toggle',
    ]);
    selection.selectedItems.and.returnValue([]);
    documents = fakeDocuments({
      'doc-a': 'Vendor onboarding checklist',
      'doc-b': 'Q3 supplier contract',
      'col-1': 'Agent demo',
    });

    TestBed.configureTestingModule({
      imports: [AiChatPanelComponent, NoopAnimationsModule],
      providers: [
        { provide: AgentRuntimeService, useValue: agent },
        { provide: AiChatService, useValue: chat },
        { provide: DocumentService, useValue: documents },
        {
          provide: AiFeatureFlagService,
          useValue: {
            aiEnabled,
            agentRuntimeAvailable,
            // Mirrors the real computed: AI is opted in throughout these tests, so the
            // deployment answer alone decides which path the panel takes.
            agentPathEnabled: agentRuntimeAvailable,
            automationPathEnabled: signal(false),
          },
        },
        { provide: Router, useValue: router },
        { provide: BrowseService, useValue: browse },
        { provide: SelectionService, useValue: selection },
        // The real definition, so the form the tests mount is the one that ships.
        // Nothing in the panel names it — this is the composition root's job, and
        // registering it here is the same call `app.config.ts` makes.
        ...provideAgentFormComponents(documentMetadataForm),
      ],
    });
    agentSelection = TestBed.inject(AgentSelectionStore);
  });

  describe('with an agent gateway deployed', () => {
    beforeEach(() => build(true));

    it('routes messages to the agent runtime with the current page as context', () => {
      component.input.set('find contracts');
      component.send();

      expect(agent.setContext).toHaveBeenCalledWith({ page: '/search' });
      expect(agent.send).toHaveBeenCalledWith('find contracts');
      expect(chat.send).not.toHaveBeenCalled();
      expect(component.input()).toBe('');
    });

    it('renders an in-flight message once, from the transcript', () => {
      // The SDK mirrors every chunk into `messages` before it hands the adapter the
      // buffer, so the two sources hold the same sentence and the buffer is the older
      // of the two. Rendering both put the same paragraph on screen twice while the
      // agent was speaking — the whole of demo beat 1.
      agent.messages.set([{ id: 'm1', role: 'assistant', content: 'Two contracts matched.' }]);
      agent.streamingText.set('Two contracts');
      agent.running.set(true);
      fixture.detectChanges();

      const bubbles = (fixture.nativeElement as HTMLElement).querySelectorAll('.ai-msg-content');
      expect(bubbles.length).toBe(1);
      expect(bubbles[0].textContent).toContain('Two contracts matched.');
      // And the typing dots do not sit under text that is already arriving.
      expect((fixture.nativeElement as HTMLElement).querySelector('.ai-msg-typing')).toBeNull();
    });

    it('shows the typing dots only until the first tokens land', () => {
      agent.running.set(true);
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).querySelector('.ai-msg-typing')).not.toBeNull();
    });

    it('interleaves each tool card where its call was made', () => {
      agent.messages.set([
        { id: 'u1', role: 'user', content: 'what has changed?' },
        { id: 'm1', role: 'assistant', content: 'Let me look.' },
        { id: 'call-1', role: 'assistant', content: '', toolCallIds: ['call-1'] },
        { id: 't1', role: 'tool', content: '{"entries":[]}', toolCallId: 'call-1' },
        { id: 'm2', role: 'assistant', content: 'That is what I found.' },
      ]);
      agent.toolCalls.set([
        {
          id: 'call-1',
          name: 'nuxeo.searchDocuments',
          args: { query: 'SELECT 1' },
          status: 'complete',
        },
      ]);
      fixture.detectChanges();

      expect(rowSummaries()).toEqual([
        'ai-chat-msg:what has changed?',
        'ai-chat-msg:Let me look.',
        'ai-tool-card:nuxeo.searchDocuments',
        'ai-chat-msg:That is what I found.',
      ]);
    });

    it('appends a call no assistant turn claims rather than dropping it', () => {
      // Rebuilt from an interrupt, so it never arrived as a streamed call on a message.
      agent.messages.set([{ id: 'm1', role: 'assistant', content: 'Working on it.' }]);
      agent.toolCalls.set([{ id: 'call-9', name: 'applyMetadata', args: {}, status: 'complete' }]);
      fixture.detectChanges();

      expect(rowSummaries()).toEqual(['ai-chat-msg:Working on it.', 'ai-tool-card:applyMetadata']);
    });

    it('shows thinking steps only while the run is active', () => {
      agent.thinkingSteps.set([{ id: 's1', label: 'Searching Nuxeo', status: 'active' }]);
      fixture.detectChanges();
      expect(text()).not.toContain('Searching Nuxeo');

      agent.running.set(true);
      fixture.detectChanges();
      expect(text()).toContain('Searching Nuxeo');
    });

    it('renders a tool-call card with its arguments as text', () => {
      agent.toolCalls.set([
        { id: 'c1', name: 'searchDocuments', args: { query: 'contract' }, status: 'complete' },
      ]);
      fixture.detectChanges();

      expect(text()).toContain('searchDocuments');
      expect(text()).toContain('query: contract');
    });

    it('reads an object-valued argument instead of serialising it', () => {
      // `applyMetadata`'s properties put `{"dc:title":"Q3 Contract"}` on the argument line.
      agent.toolCalls.set([
        {
          id: 'c1',
          name: 'applyMetadata',
          args: { docId: 'doc-1', properties: { 'dc:title': 'Q3 Contract' } },
          status: 'complete',
        },
      ]);
      fixture.detectChanges();

      const args = (fixture.nativeElement as HTMLElement).querySelector('.ai-tool-card-args');
      expect(args?.textContent).toContain('docId: doc-1 · properties: dc:title=Q3 Contract');
      expect(args?.textContent).not.toContain('{');
    });

    /**
     * The result line used to print `TOOL_CALL_RESULT.content` verbatim — in the scripted
     * search card, 1,107 characters of escaped JSON filling the panel. ADR 001 fixes that
     * string as stringified JSON because the model consumes it, so every assertion here is
     * about what the card makes of it, never about changing what the gateway sends.
     */
    describe('tool result line', () => {
      it('reads a search payload as a count and the titles', () => {
        showResult(
          JSON.stringify({
            totalSize: 2,
            entries: [
              { uid: 'doc-1', title: 'Contract A', type: 'File', path: '/ws/a' },
              { uid: 'doc-2', title: 'Contract B', type: 'File', path: '/ws/b' },
            ],
          }),
        );

        expect(resultLine()).toBe('2 results: Contract A, Contract B');
        expect(resultLine()).not.toContain('{');
        expect(resultFailed()).toBeFalse();
      });

      it('names the first few of a long result set and counts the rest', () => {
        showResult(
          JSON.stringify({
            totalSize: 12,
            entries: [
              { title: 'Contract A' },
              { title: 'Contract B' },
              { title: 'Contract C' },
              { title: 'Contract D' },
            ],
          }),
        );

        expect(resultLine()).toBe('12 results: Contract A, Contract B, Contract C, +9 more');
      });

      /**
       * Beat 2 of the demo runbook: step two reads the document step one found, and the
       * card has to say which document. `nuxeo.getDocument` answers with a `permissions`
       * array, and the collection branch used to report `33 permissions: Write, …` — a
       * true sentence about the wrong subject, with the title nowhere on the line.
       */
      it('names the thing a payload describes rather than an array inside it', () => {
        showResult(
          JSON.stringify({
            uid: 'doc-1',
            title: 'Vendor onboarding checklist',
            type: 'File',
            permissions: ['Write', 'WriteVersion', 'ReadProperties'],
          }),
          'nuxeo.getDocument',
        );

        expect(resultLine().startsWith('Vendor onboarding checklist')).toBeTrue();
        expect(resultLine()).toContain('uid: doc-1');
        expect(resultLine().startsWith('3 permissions')).toBeFalse();
      });

      /**
       * The same rule keeps the one deliberately fake payload in the demo honest: the
       * runbook's beat 2 tells the presenter to point at PLACEHOLDER, which sat behind
       * `demoData` and `demoNote` and was clipped off the end of the line.
       */
      it('leads with a placeholder summary instead of clipping it off the end', () => {
        showResult(
          JSON.stringify({
            demoData: true,
            demoNote: 'AI.Summarize is served by a marketplace bundle that is not installed.',
            uid: 'doc-1',
            summary: 'PLACEHOLDER — not a summary of this document.',
          }),
          'ai.summarizeDocument',
        );

        expect(resultLine().startsWith('PLACEHOLDER — not a summary of this document.')).toBeTrue();
        expect(resultLine()).toContain('demoData: true');
      });

      /** An audit page is twenty rows of the same event, and no row has a title. */
      it('names distinct items when a list repeats itself, and keeps the real count', () => {
        showResult(
          JSON.stringify({
            totalSize: 20,
            entries: [
              { eventId: 'loginSuccess', principalName: 'Administrator' },
              { eventId: 'loginSuccess', principalName: 'Administrator' },
              { eventId: 'documentModified', principalName: 'Administrator' },
            ],
          }),
          'nuxeo.searchAuditLog',
        );

        expect(resultLine()).toBe('20 results: loginSuccess, documentModified, +18 more');
      });

      it('uses the payload own noun, singular when there is one of them', () => {
        showResult(JSON.stringify({ tasks: [{ name: 'Approve invoice' }] }), 'nuxeo.listTasks');

        expect(resultLine()).toBe('1 task: Approve invoice');
      });

      it('says nothing was found rather than showing an empty array', () => {
        showResult(JSON.stringify({ totalSize: 0, entries: [] }));

        expect(resultLine()).toBe('No results');
      });

      it('reads an error payload as its message and marks the line as a failure', () => {
        showResult(
          JSON.stringify({
            error: 'That document no longer exists in Nuxeo.',
            code: 'NUXEO_NOT_FOUND',
          }),
          'nuxeo.getDocument',
        );

        expect(resultLine()).toBe('That document no longer exists in Nuxeo.');
        expect(resultFailed()).toBeTrue();
        // The code is diagnostic detail, not the sentence a reader needs first.
        expect(resultLine()).not.toContain('NUXEO_NOT_FOUND');
        expect(rawToggle()).not.toBeNull();
      });

      it('treats a declared failure without an error string as a failure too', () => {
        showResult(JSON.stringify({ ok: false, message: 'The workflow is already running.' }));

        expect(resultLine()).toBe('The workflow is already running.');
        expect(resultFailed()).toBeTrue();
      });

      /**
       * Tools are a documented extension point, so this is the branch a third party's
       * payload lands in. It has to stay readable without the panel knowing the shape.
       */
      it('describes a shape it has never seen instead of dumping it', () => {
        showResult(
          JSON.stringify({ bay: 3, scanned: true, ref: 'WH-9', operator: { id: 'u7' } }),
          'warehouse.scanShelf',
        );

        expect(resultLine()).toBe('bay: 3 · scanned: true · ref: WH-9 · operator: id=u7');
        expect(resultLine()).not.toContain('{');
        expect(resultFailed()).toBeFalse();
      });

      it('never lets any payload past the length the card shows', () => {
        const entries = Array.from({ length: 40 }, (_, index) => ({
          uid: `doc-${index}`,
          title: `A contract with a deliberately long title, number ${index}`,
          path: `/default-domain/workspaces/contracts/contract-${index}`,
        }));
        showResult(JSON.stringify({ totalSize: 40, entries }, null, 2));

        expect(resultLine().length).toBeLessThanOrEqual(160);
        expect(resultLine()).not.toContain('\n');
      });

      it('shows a prose result as it stands, with nothing to expand', () => {
        showResult('Updated 1 propert(ies) on doc-1.', 'applyMetadata');

        expect(resultLine()).toBe('Updated 1 propert(ies) on doc-1.');
        expect(rawToggle()).toBeNull();
      });

      it('shows a declined approval as the sentence the runtime records', () => {
        // `AgentRuntimeService` used to store `{"approved":false,"reason":…}` here.
        agent.toolCalls.set([
          {
            id: 'c1',
            name: 'confirmAction',
            args: {},
            status: 'rejected',
            result: 'Declined by the user. Nothing was changed.',
          },
        ]);
        fixture.detectChanges();

        expect(resultLine()).toBe('Declined by the user. Nothing was changed.');
        expect(resultLine()).not.toContain('approved');
      });

      /**
       * The server-enforced gate refuses the write inside an ordinary tool result, so the
       * call reports itself complete and the card drew a tick beside it — a refusal that
       * looked exactly like the write having gone through, in the one beat about consent.
       */
      it('draws a write the gateway refused as rejected, not as a completed call', () => {
        showResult(
          JSON.stringify({
            status: 'declined',
            approved: false,
            reason: 'The user did not approve this change, so it was not run.',
          }),
          'nuxeo.createCollection',
        );

        expect(resultLine()).toBe('Declined by the user. Nothing was changed.');
        expect(resultFailed()).toBeTrue();
        expect(cardStatus()).toBe('rejected');
        // The gateway's own wording stays reachable for anyone who wants it.
        expect(rawToggle()).not.toBeNull();
      });

      /**
       * A refusal is not a decline, and the person reading the card is the one person
       * who knows which it was.
       *
       * `approved === false` is on *every* refusal payload the gateway writes, so the
       * previous single test matched all of them and printed "Declined by the user.
       * Nothing was changed." A write stopped by a legal hold therefore told the user
       * they had declined it — and invited them to retry something that will refuse
       * again for the same reason. On a legally-held record that does not merely
       * misattribute a decision, it implies the constraint is negotiable.
       *
       * ADR 001 already requires an outcome to say who caused it, for the model's sake.
       * `decidedBy` is on the wire because of that rule; this is the same rule applied
       * to the human. Every case below stays drawn as *not a success* — that property
       * is what the earlier test established and it is unchanged.
       */
      describe('a write the gateway refused, not the user', () => {
        function refusal(code: string, extra: Record<string, unknown> = {}) {
          return JSON.stringify({
            status: 'refused',
            approved: false,
            decidedBy: 'gateway',
            code,
            reason: 'A sentence written for the model, including instructions not to retry.',
            ...extra,
          });
        }

        it('never says the user declined it', () => {
          showResult(refusal('legal_hold'), 'nuxeo.updateMetadata');

          expect(resultLine()).not.toContain('Declined by the user');
          expect(resultLine()).not.toContain('the user');
        });

        it('names the constraint that stopped it', () => {
          showResult(refusal('legal_hold'), 'nuxeo.updateMetadata');

          expect(resultLine()).toBe(
            'Blocked: the document is under retention or legal hold. Nothing was changed.',
          );
        });

        const otherCodes: ReadonlyArray<readonly [string, string]> = [
          ['immutable_version', 'Blocked: the document is a version, which cannot be changed.'],
          [
            'permission_denied',
            'Blocked: you do not have permission to change this. Nothing was changed.',
          ],
          [
            'form_not_declared',
            'Blocked: this change does not accept a form. Nothing was changed.',
          ],
          [
            'invalid_form_submission',
            'Blocked: the submitted values were not accepted. Nothing was changed.',
          ],
        ];

        for (const [code, sentence] of otherCodes) {
          it(`explains ${code} in the user’s terms`, () => {
            showResult(refusal(code), 'nuxeo.updateMetadata');

            expect(resultLine()).toBe(sentence);
          });
        }

        // Deny-by-default for wording: a code this build does not know degrades to a
        // sentence that is vague but true, never to one that blames the reader.
        it('falls back to a true sentence for a code it does not recognise', () => {
          showResult(refusal('some_future_code'), 'nuxeo.updateMetadata');

          expect(resultLine()).toBe('Blocked before it ran. Nothing was changed.');
          expect(resultLine()).not.toContain('Declined');
        });

        it('is still drawn as a refusal rather than a success', () => {
          showResult(refusal('legal_hold'), 'nuxeo.updateMetadata');

          expect(resultFailed()).toBeTrue();
          expect(cardStatus()).toBe('rejected');
          expect(rawToggle()).not.toBeNull();
        });

        /**
         * A third-party tool reporting only `approved: false` says nothing about who
         * decided. Reading that as a gateway refusal is the safe direction: claiming a
         * person declined is the assertion that needs evidence, and there is none here.
         */
        it('does not attribute a bare approved:false to the user', () => {
          showResult(JSON.stringify({ approved: false }), 'someContributedTool');

          expect(resultLine()).toBe('Blocked before it ran. Nothing was changed.');
        });

        // The gateway's own decline payload carries `decidedBy: 'user'`, and that is the
        // one case where naming the user is correct.
        it('still attributes a real decline to the user', () => {
          showResult(
            JSON.stringify({ status: 'declined', approved: false, decidedBy: 'user' }),
            'nuxeo.updateMetadata',
          );

          expect(resultLine()).toBe('Declined by the user. Nothing was changed.');
        });
      });

      it('stays readable when a payload arrives truncated or malformed', () => {
        showResult('{"totalSize":2,"entries":[{"title":"Contra');

        expect(resultLine()).toBe('{"totalSize":2,"entries":[{"title":"Contra');
        expect(resultFailed()).toBeFalse();
      });

      it('keeps the payload one click away, and puts it away again', () => {
        const payload = JSON.stringify({ totalSize: 1, entries: [{ title: 'Contract A' }] });
        showResult(payload);

        const host = fixture.nativeElement as HTMLElement;
        expect(host.querySelector('.ai-tool-card-raw')).toBeNull();
        expect(rawToggle()?.textContent?.trim()).toBe('Show raw result');

        rawToggle()?.click();
        fixture.detectChanges();
        expect(host.querySelector('.ai-tool-card-raw')?.textContent).toBe(payload);
        expect(rawToggle()?.textContent?.trim()).toBe('Hide raw result');

        rawToggle()?.click();
        fixture.detectChanges();
        expect(host.querySelector('.ai-tool-card-raw')).toBeNull();
      });

      it('renders no result line at all until the call has answered', () => {
        agent.toolCalls.set([{ id: 'c1', name: 'nuxeo.search', args: {}, status: 'running' }]);
        fixture.detectChanges();

        expect(
          (fixture.nativeElement as HTMLElement).querySelector('.ai-tool-card-result'),
        ).toBeNull();
      });
    });

    /**
     * One decision keeps the card it always had: no enumeration, no counter, no batch
     * footer. A single write does not need any of that, and this is the path demo beat 3
     * exercises.
     *
     * What did change is the headline. `applyMetadata` is a write whose shape is known,
     * so the row says what would happen and to what, read off the call's own arguments.
     * The sentence it replaces was the least trustworthy field on the card — ADR 001 is
     * explicit that a summary the model wrote can describe one action and perform
     * another — and everything it carried is on the row in a substantiated form.
     */
    it('offers approve and decline for a human-in-the-loop prompt', () => {
      const request: AgentApprovalRequest = {
        id: 'c1',
        kind: 'tool',
        toolName: 'applyMetadata',
        summary: 'Rename Contract A to Contract B.',
        args: { docId: 'doc-a', properties: { 'dc:title': 'Contract B' } },
      };
      agent.approvals.set([request]);
      fixture.detectChanges();

      expect(text()).toContain('Change metadata on Vendor onboarding checklist');
      expect(text()).toContain('doc-a');
      expect(text()).toContain('properties: dc:title=Contract B');
      expect(text()).toContain('applyMetadata');
      // A lone decision is not a batch, so it grows none of the batch furniture.
      const host = fixture.nativeElement as HTMLElement;
      expect(host.querySelector('.ai-approval-progress')).toBeNull();
      expect(host.querySelector('.ai-approval-row-index')).toBeNull();
      expect(host.querySelector('.ai-approval-foot')).toBeNull();

      component.approve(request);
      expect(agent.respondToApproval).toHaveBeenCalledWith('c1', true);

      component.decline(request);
      expect(agent.respondToApproval).toHaveBeenCalledWith('c1', false);
    });

    /**
     * The five-write turn the server-enforced gate produces, as one card.
     *
     * Grouping is presentation only — every assertion about consent below is about the
     * calls the panel makes, one id at a time — but the presentation is the reason the
     * grouping exists, so the rows have to be distinguishable from each other.
     */
    describe('a batch of writes raised together', () => {
      /**
       * The phrasing the gateway sends, copied from the declarations in
       * `apps/agent-gateway/src/tools/nuxeo-document-tools.ts`.
       *
       * The panel keeps no table of its own for server tools: a row's verb and the
       * argument it applies to arrive on the interrupt, from the same registration the
       * gateway executes. So a fixture with no `action` is a fixture for a producer that
       * declared nothing, and those rows fall back to the gateway's sentence — which is
       * what `partner.archiveRecord` below exercises.
       */
      const GATEWAY_ACTIONS: Readonly<Record<string, AgentApprovalAction>> = {
        'nuxeo.createCollection': { action: 'Create a collection named', value: 'name' },
        'nuxeo.addToCollection': {
          action: 'Add',
          subject: { arg: 'uid' },
          into: { preposition: 'to the collection', arg: 'collectionUid' },
        },
        'nuxeo.tagDocument': { action: 'Add tags to', subject: { arg: 'uid' } },
        'nuxeo.bulkUpdateMetadata': {
          action: 'Change metadata on everything matching',
          value: 'query',
        },
      };

      function mutationRequest(
        id: string,
        toolName: string,
        args: Record<string, unknown>,
        overrides: Partial<AgentApprovalRequest> = {},
      ): AgentApprovalRequest {
        const action = GATEWAY_ACTIONS[toolName];
        return {
          id,
          kind: 'interrupt',
          toolName,
          // The gateway's own sentence, identical for every write in the turn. Five
          // copies of it is what made the old stack unreadable.
          summary:
            `The assistant wants to run ${toolName}, which changes content in Nuxeo. ` +
            `Nothing is written unless you approve it.`,
          args,
          ...(action ? { action } : {}),
          ...overrides,
        };
      }

      function openBatch(): void {
        agent.approvals.set([
          mutationRequest('call-1', 'nuxeo.createCollection', { name: 'Agent demo' }),
          mutationRequest('call-2', 'nuxeo.addToCollection', {
            uid: 'doc-a',
            collectionUid: 'col-1',
          }),
          mutationRequest('call-3', 'nuxeo.tagDocument', { uid: 'doc-b', tags: ['urgent'] }),
        ]);
        fixture.detectChanges();
      }

      function rows(): HTMLElement[] {
        return Array.from(
          (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.ai-approval-row'),
        );
      }

      it('renders one card that enumerates every write and says how many remain', () => {
        openBatch();

        const host = fixture.nativeElement as HTMLElement;
        expect(host.querySelectorAll('.ai-approval').length).toBe(1);
        expect(rows().length).toBe(3);
        expect(host.querySelector('.ai-approval-progress')?.textContent?.trim()).toBe('0 of 3');
        expect(host.querySelector('.ai-approval-remaining')?.textContent?.trim()).toBe(
          '3 still to decide',
        );
        // Said once for the batch rather than once per write.
        expect(text().split('Nothing is written unless you approve it').length - 1).toBe(1);
      });

      it('names the document each row would write to, not just its identifier', () => {
        openBatch();

        const [create, add, tag] = rows().map((row) =>
          row.querySelector('.ai-approval-row-action')?.textContent?.replace(/\s+/g, ' ').trim(),
        );
        expect(create).toBe('Create a collection named Agent demo');
        expect(add).toBe('Add Vendor onboarding checklist to the collection Agent demo');
        expect(tag).toBe('Add tags to Q3 supplier contract');
        // The name is a lookup; the uid is what the write carries, so both stay on screen.
        expect(rows()[1].textContent).toContain('doc-a');
        expect(rows()[2].textContent).toContain('urgent');
      });

      /**
       * The instruction the row obeys when it cannot substantiate a name: show the
       * identifier plainly. A confident wrong title on an approval row is the one
       * failure that would make the card worse than the stack it replaced.
       */
      it('shows the raw uid when Nuxeo will not tell the caller what the document is', () => {
        agent.approvals.set([
          mutationRequest('call-1', 'nuxeo.tagDocument', { uid: 'doc-hidden', tags: ['urgent'] }),
          mutationRequest('call-2', 'nuxeo.tagDocument', { uid: 'doc-a', tags: ['urgent'] }),
        ]);
        fixture.detectChanges();

        expect(rows()[0].querySelector('.ai-approval-row-action')?.textContent).toContain(
          'doc-hidden',
        );
        expect(rows()[0].querySelector('.ai-approval-row-action')?.textContent).not.toContain(
          'Vendor',
        );
        // And the identifier is not printed twice for the row that has no name.
        expect(rows()[0].querySelectorAll('.ai-approval-row-uid').length).toBe(0);
        expect(rows()[1].querySelectorAll('.ai-approval-row-uid').length).toBe(1);
      });

      /**
       * The gateway resolves a write's targets before raising the card, with the same
       * forwarded caller credentials the tool layer uses. When it has, the browser does
       * not go and ask again: the gateway already read that document as this user, so a
       * second request from here buys a second refusal rather than a title.
       */
      it('uses the title the gateway resolved, without asking Nuxeo itself', () => {
        agent.approvals.set([
          mutationRequest(
            'call-1',
            'nuxeo.tagDocument',
            { uid: 'doc-z', tags: ['urgent'] },
            { targets: [{ uid: 'doc-z', title: 'Records retention policy 2026', type: 'File' }] },
          ),
        ]);
        fixture.detectChanges();

        expect(rows()[0].querySelector('.ai-approval-row-action')?.textContent?.trim()).toContain(
          'Records retention policy 2026',
        );
        expect(documents.getById).not.toHaveBeenCalled();
      });

      /**
       * A target the gateway omitted is one it could not read as this caller. The row
       * shows the uid and the browser still does not ask — the degradation is the
       * intended behaviour, not a gap for a second lookup to fill.
       */
      it('shows the uid for a target the gateway omitted, and asks nobody about it', () => {
        agent.approvals.set([
          mutationRequest(
            'call-1',
            'nuxeo.addToCollection',
            { uid: 'doc-a', collectionUid: 'col-1' },
            { targets: [{ uid: 'col-1', title: 'Agent demo' }] },
          ),
        ]);
        fixture.detectChanges();

        const action = rows()[0]
          .querySelector('.ai-approval-row-action')
          ?.textContent?.replace(/\s+/g, ' ')
          .trim();
        expect(action).toBe('Add doc-a to the collection Agent demo');
        expect(action).not.toContain('Vendor onboarding checklist');
        expect(documents.getById).not.toHaveBeenCalled();
      });

      it('falls back to the gateway sentence for a write it cannot describe', () => {
        agent.approvals.set([
          mutationRequest('call-1', 'nuxeo.tagDocument', { uid: 'doc-a', tags: ['urgent'] }),
          mutationRequest('call-2', 'partner.archiveRecord', { recordRef: 'R-88' }),
        ]);
        fixture.detectChanges();

        expect(rows()[1].querySelector('.ai-approval-row-action')).toBeNull();
        expect(rows()[1].querySelector('.ai-approval-summary')?.textContent).toContain(
          'The assistant wants to run partner.archiveRecord',
        );
        expect(rows()[1].textContent).toContain('recordRef: R-88');
      });

      it('keeps an answered row on screen with its own verdict and no buttons', () => {
        agent.approvals.set([
          {
            ...mutationRequest('call-1', 'nuxeo.tagDocument', { uid: 'doc-a' }),
            verdict: 'approved',
          },
          {
            ...mutationRequest('call-2', 'nuxeo.tagDocument', { uid: 'doc-b' }),
            verdict: 'declined',
          },
          mutationRequest('call-3', 'nuxeo.createCollection', { name: 'Agent demo' }),
        ]);
        fixture.detectChanges();

        expect(rows().map((row) => row.getAttribute('data-verdict'))).toEqual([
          'approved',
          'declined',
          'pending',
        ]);
        expect(rows()[0].querySelector('.ai-approval-approve')).toBeNull();
        expect(rows()[1].querySelector('.ai-approval-decline')).toBeNull();
        expect(rows()[2].querySelector('.ai-approval-approve')).not.toBeNull();
        const host = fixture.nativeElement as HTMLElement;
        expect(host.querySelector('.ai-approval-progress')?.textContent?.trim()).toBe('2 of 3');
        expect(host.querySelector('.ai-approval-remaining')?.textContent?.trim()).toBe(
          '1 still to decide',
        );
      });

      /**
       * The affordance the card deliberately does not offer. One click standing in for
       * five unread approvals re-creates the failure the server-enforced gate exists to
       * close, so the only batch control is on the side that cannot write anything.
       */
      it('offers no control that approves more than one write', () => {
        openBatch();

        const host = fixture.nativeElement as HTMLElement;
        const approveButtons = host.querySelectorAll('.ai-approval-approve');
        expect(approveButtons.length).toBe(3);
        expect(host.querySelector('.ai-approval-approve-all')).toBeNull();
        expect(text().toLowerCase()).not.toContain('approve all');
        expect(host.querySelector('.ai-approval-decline-all')?.textContent?.trim()).toBe(
          'Decline the remaining 3',
        );
      });

      it('declines only the rows still waiting when the batch is refused wholesale', () => {
        agent.approvals.set([
          {
            ...mutationRequest('call-1', 'nuxeo.tagDocument', { uid: 'doc-a' }),
            verdict: 'approved',
          },
          mutationRequest('call-2', 'nuxeo.tagDocument', { uid: 'doc-b' }),
          mutationRequest('call-3', 'nuxeo.createCollection', { name: 'Agent demo' }),
        ]);
        fixture.detectChanges();

        (fixture.nativeElement as HTMLElement)
          .querySelector<HTMLButtonElement>('.ai-approval-decline-all')
          ?.click();

        expect(agent.respondToApproval.calls.allArgs()).toEqual([
          ['call-2', false],
          ['call-3', false],
        ]);
      });

      /**
       * The panel is about 400px wide and a batch is the densest thing in it: uids,
       * NXQL and Nuxeo xpath keys are all long and none of them contain a space to
       * break at. Measured rather than eyeballed, because the failure mode is a
       * horizontal scrollbar on the whole transcript.
       */
      it('fits a ten-write batch in the panel without scrolling sideways', () => {
        (fixture.nativeElement as HTMLElement).style.width = '400px';
        agent.approvals.set(
          Array.from({ length: 10 }, (_, index) =>
            mutationRequest(`call-${index}`, 'nuxeo.bulkUpdateMetadata', {
              query:
                "SELECT * FROM Document WHERE dc:title LIKE '%contract%' AND ecm:isTrashed = 0",
              properties: { 'dc:description': `Reviewed in the ${index} quarter audit sweep` },
            }),
          ),
        );
        fixture.detectChanges();

        const card = (fixture.nativeElement as HTMLElement).querySelector(
          '.ai-approval',
        ) as HTMLElement;
        expect(rows().length).toBe(10);
        expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
        const list = (fixture.nativeElement as HTMLElement).querySelector(
          '.ai-chat-messages',
        ) as HTMLElement;
        expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
      });

      it('gives every row a distinct accessible name for its two buttons', () => {
        openBatch();

        const labels = Array.from(
          (fixture.nativeElement as HTMLElement).querySelectorAll('.ai-approval-approve'),
        ).map((button) => button.getAttribute('aria-label'));
        expect(new Set(labels).size).toBe(3);
        expect(labels[1]).toBe(
          'Approve: Add Vendor onboarding checklist to the collection Agent demo',
        );
      });
    });

    /**
     * `confirmAction` exists only to put a question to the user, so its arguments *are*
     * the question. Rendered as a tool card as well, the audience read the same
     * paragraph twice in a row directly above the Approve button.
     */
    it('asks once: the card being decided replaces its own tool card', () => {
      agent.messages.set([
        { id: 'call-1', role: 'assistant', content: '', toolCallIds: ['call-1'] },
      ]);
      const args = {
        summary: 'Create a collection named "Agent demo".',
        action: 'nuxeo.createCollection',
      };
      agent.toolCalls.set([
        { id: 'call-1', name: 'confirmAction', args, status: 'awaiting-approval' },
      ]);
      agent.approvals.set([
        {
          id: 'call-1',
          kind: 'tool',
          toolName: 'confirmAction',
          summary: args.summary,
          args,
        },
      ]);
      fixture.detectChanges();

      expect(rowSummaries()).toEqual([]);
      // The summary is the card's headline, so it is not repeated in the argument line.
      const argLine = (fixture.nativeElement as HTMLElement).querySelector('.ai-approval-args');
      expect(argLine?.textContent).toContain('action: nuxeo.createCollection');
      expect(argLine?.textContent).not.toContain('summary:');
      expect(text().split(args.summary).length - 1).toBe(1);
    });

    it('restores the tool card as the record once the decision is made', () => {
      agent.messages.set([
        { id: 'call-1', role: 'assistant', content: '', toolCallIds: ['call-1'] },
      ]);
      agent.toolCalls.set([
        { id: 'call-1', name: 'confirmAction', args: {}, status: 'complete', result: 'Approved.' },
      ]);
      agent.approvals.set([]);
      fixture.detectChanges();

      expect(rowSummaries()).toEqual(['ai-tool-card:confirmAction']);
      expect(text()).toContain('Approved.');
    });

    it('swaps send for cancel while a run is in flight', () => {
      agent.running.set(true);
      fixture.detectChanges();

      const cancel = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        '.ai-chat-cancel',
      );
      expect(cancel).not.toBeNull();
      cancel?.click();

      expect(agent.abortRun).toHaveBeenCalled();
    });

    it('renders grounded citations and opens the cited document', () => {
      agent.messages.set([
        {
          id: 'm1',
          role: 'assistant',
          content: 'Two contracts matched.',
          citations: [{ uid: 'doc-1', title: 'Contract A', path: '/ws/a' }],
        },
      ]);
      fixture.detectChanges();

      expect(text()).toContain('Contract A');

      const card = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        '.ai-source-card',
      );
      card?.click();

      expect(router.navigate).toHaveBeenCalledWith(['/doc', 'doc-1']);
    });

    it('escapes model output instead of injecting it as markup', () => {
      agent.messages.set([
        { id: 'm1', role: 'assistant', content: '<img src=x onerror="alert(1)">' },
      ]);
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      // The payload has to survive as visible text and never as a live element.
      expect(host.querySelector('img')).toBeNull();
      expect(host.innerHTML).toContain('&lt;img');
      expect(text()).toContain('<img src=x onerror="alert(1)">');
    });

    /**
     * `AiMarkdownPipe` returns a string rather than `SafeHtml`, so the `[innerHTML]` binding
     * runs Angular's own sanitizer over it as a second, independent pass. These two tests are
     * the end of that chain: the rich markup a live model emits has to survive it, and the
     * executable markup has to not.
     */
    it('renders the tables, headings and code a live model emits', () => {
      agent.messages.set([
        {
          id: 'm1',
          role: 'assistant',
          content: [
            '## Overview',
            '',
            '| Document | Size |',
            '| --- | --- |',
            '| Contract A | 1.2 MB |',
            '',
            '> Past its review date.',
            '',
            '```sql',
            'SELECT * FROM Document',
            '```',
            '',
            'See [the policy](https://doc.example.com/policy).',
          ].join('\n'),
        },
      ]);
      fixture.detectChanges();

      const content = (fixture.nativeElement as HTMLElement).querySelector(
        '.ai-msg-content',
      ) as HTMLElement;
      expect(content.querySelector('h2')?.textContent).toBe('Overview');
      expect(content.querySelectorAll('table th').length).toBe(2);
      expect(content.querySelector('table td')?.textContent).toBe('Contract A');
      expect(content.querySelector('blockquote')).not.toBeNull();
      expect(content.querySelector('pre code')?.textContent).toContain('SELECT * FROM Document');
      expect(content.querySelector('a')?.getAttribute('href')).toBe(
        'https://doc.example.com/policy',
      );
      // The delimiter row is what the audience saw as `|---|---|` before this rendered.
      expect(text()).not.toContain('---');
    });

    it('leaves a javascript: link in the answer unclickable', () => {
      agent.messages.set([
        { id: 'm1', role: 'assistant', content: 'Try [this link](javascript:alert(1)) now.' },
      ]);
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.querySelector('.ai-msg-content a')).toBeNull();
      expect(host.innerHTML).not.toContain('javascript:');
      expect(text()).toContain('Try this link now.');
    });

    /**
     * The presenter's complaint: a long answer streams below the fold and has to be
     * chased by hand mid-sentence. Following the tail is only half of it — the other
     * half is letting go the moment someone reads back up the transcript.
     */
    describe('following the tail', () => {
      let list: HTMLElement;

      beforeEach(() => {
        // The panel is `height: 100%`, so without a bounded host nothing overflows and
        // there is nothing to follow.
        (fixture.nativeElement as HTMLElement).style.height = '200px';
        list = (fixture.nativeElement as HTMLElement).querySelector(
          '.ai-chat-messages',
        ) as HTMLElement;
      });

      /** `detectChanges` alone does not flush after-render hooks in a TestBed fixture. */
      function render(): void {
        fixture.detectChanges();
        TestBed.inject(ApplicationRef).tick();
      }

      function fill(count: number): void {
        agent.messages.set(
          Array.from({ length: count }, (_, index) => ({
            id: `m${index}`,
            role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
            content: `Message ${index}, long enough to wrap over several lines in a narrow panel.`,
          })),
        );
        render();
      }

      function distanceFromBottom(): number {
        return list.scrollHeight - list.scrollTop - list.clientHeight;
      }

      /** Scrolls the way a reader does, bypassing the panel's smooth scroll animation. */
      function readerScrollsTo(top: number): void {
        list.scrollTo({ top, behavior: 'instant' });
        list.dispatchEvent(new Event('scroll'));
        render();
      }

      it('keeps the newest content in view as the transcript grows', () => {
        fill(24);

        expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
        expect(distanceFromBottom()).toBeLessThan(2);
      });

      it('lets go the moment the reader scrolls up, and stays let go', () => {
        fill(24);
        readerScrollsTo(0);

        fill(40);

        expect(list.scrollTop).toBe(0);
      });

      it('picks the tail back up when the reader returns to the bottom', () => {
        fill(24);
        readerScrollsTo(0);
        readerScrollsTo(list.scrollHeight);

        fill(40);

        expect(distanceFromBottom()).toBeLessThan(2);
      });

      it('follows again when a question is asked from part-way up the transcript', () => {
        fill(24);
        readerScrollsTo(0);

        component.input.set('and what changed today?');
        component.send();
        fill(40);

        expect(distanceFromBottom()).toBeLessThan(2);
      });
    });

    describe('frontend tool handlers', () => {
      it('navigates for navigateTo and refuses anything that is not an app route', async () => {
        const handler = agent.handlers.get('navigateTo');

        await handler?.({ route: '/doc/abc' });
        expect(router.navigateByUrl).toHaveBeenCalledWith('/doc/abc');

        router.navigateByUrl.calls.reset();
        const refusal = await handler?.({ route: 'https://evil.example.com' });
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        expect(refusal).toContain('Refused');
      });

      /**
       * A7 stage 2, and the security case this whole channel exists for.
       *
       * Until stage 2 this handler called `SelectionService.selectAll`, so a
       * model could assert a selection, have `currentContext` send it back one
       * turn later as `selectionIds`, and act on documents the user never chose
       * — with the application's Delete-bearing selection toolbar armed over
       * them. The handler now proposes, and a proposal is not a selection until
       * a person ticks it.
       */
      describe('selectDocuments proposes and cannot select', () => {
        const A = 'aaaaaaaa-1111-2222-3333-444444444444';

        it('never writes to the application selection', async () => {
          agentSelection.offer('call-1', [A]);

          await agent.handlers.get('selectDocuments')?.({ docIds: [A] });

          expect(selection.selectAll).not.toHaveBeenCalled();
          expect(selection.toggle).not.toHaveBeenCalled();
        });

        it('suggests documents the user is already looking at', async () => {
          agentSelection.offer('call-1', [A]);

          const result = await agent.handlers.get('selectDocuments')?.({ docIds: [A] });

          expect(agentSelection.proposals()).toEqual([A]);
          expect(result).toContain('NOT selected');
        });

        it('refuses to suggest a document that is not on screen', async () => {
          const result = await agent.handlers.get('selectDocuments')?.({
            docIds: ['ffffffff-9999-9999-9999-999999999999'],
          });

          expect(agentSelection.proposals()).toEqual([]);
          expect(result).toContain('none of those documents are on screen');
        });

        it('tells the model plainly what was dropped', async () => {
          agentSelection.offer('call-1', [A]);

          const result = await agent.handlers.get('selectDocuments')?.({
            docIds: [A, 'ffffffff-9999-9999-9999-999999999999'],
          });

          expect(result).toContain('1 were not shown to the user');
        });

        it('ignores anything that is not a uid string', async () => {
          agentSelection.offer('call-1', [A]);

          await agent.handlers.get('selectDocuments')?.({
            docIds: [A, 42, null, { uid: A }, ['nested']],
          });

          expect(agentSelection.proposals()).toEqual([A]);
        });
      });

      /**
       * The context split, end to end from the panel.
       *
       * A proposal reaches the gateway under its own name and never under
       * `selectionIds`, so no amount of reading the context back can turn the
       * model's own suggestion into the user's decision.
       */
      it('sends a proposal as a proposal and never as the user selection', () => {
        const A = 'aaaaaaaa-1111-2222-3333-444444444444';
        agentSelection.offer('call-1', [A]);
        agentSelection.propose([A]);

        component.input.set('summarise the selected ones');
        component.send();

        const context = agent.setContext.calls.mostRecent().args[0] as {
          selectionIds?: string[];
          proposedSelectionIds?: string[];
        };
        expect(context.selectionIds).toBeUndefined();
        expect(context.proposedSelectionIds).toEqual([A]);
      });

      /**
       * Taking a suggestion moves it across, rather than putting the same uid in
       * both lists. The second list is named "awaiting user confirmation", and a
       * uid sitting in both is the conflation the two names exist to prevent.
       */
      it('stops calling a suggestion pending once the user has ticked it', () => {
        const A = 'aaaaaaaa-1111-2222-3333-444444444444';
        const B = 'bbbbbbbb-1111-2222-3333-444444444444';
        agentSelection.offer('call-1', [A, B]);
        agentSelection.propose([A, B]);
        selection.selectedItems.and.returnValue([
          { id: A, name: 'A', preview: null, type: 'File' },
        ]);

        component.input.set('summarise the selected ones');
        component.send();

        const context = agent.setContext.calls.mostRecent().args[0] as {
          selectionIds?: string[];
          proposedSelectionIds?: string[];
        };
        expect(context.selectionIds).toEqual([A]);
        expect(context.proposedSelectionIds).toEqual([B]);
      });

      it('writes metadata through BrowseService so Nuxeo applies the caller ACLs', async () => {
        browse.updateDocument.and.returnValue(of({ uid: 'doc-1' } as NuxeoDocument));

        const result = await agent.handlers.get('applyMetadata')?.({
          docId: 'doc-1',
          properties: { 'dc:title': 'New' },
        });

        expect(browse.updateDocument).toHaveBeenCalledWith('doc-1', { 'dc:title': 'New' });
        expect(result).toContain('doc-1');
      });

      it('reports a rejected write back to the agent instead of throwing', async () => {
        browse.updateDocument.and.returnValue(throwError(() => new Error('403')));

        const result = await agent.handlers.get('applyMetadata')?.({
          docId: 'doc-1',
          properties: { 'dc:title': 'New' },
        });

        expect(result).toContain('rejected');
      });
    });

    /**
     * Generative UI, seen from the transcript.
     *
     * The claim being pinned is not that a list renders — that is the host's own
     * spec — but that the widget is *additive*: the tool card is unchanged in
     * every case below, including the ones where nothing mounts, so a gateway
     * that never sends a render event produces exactly the panel that shipped.
     */
    describe('a widget the gateway asked for', () => {
      const uid = 'aaaaaaaa-1111-2222-3333-444444444444';

      function widgetHosts(): NodeListOf<Element> {
        return (fixture.nativeElement as HTMLElement).querySelectorAll('app-agent-widget-host');
      }

      beforeEach(() => {
        agent.toolCalls.set([
          {
            id: 'c1',
            name: 'nuxeo.searchDocuments',
            args: { query: 'retention' },
            status: 'complete',
            result: '{"totalSize":1}',
          },
        ]);
      });

      it('mounts under the tool call it belongs to', () => {
        agent.widgets.set([
          { toolCallId: 'c1', status: 'ready', name: 'documentList', props: { docIds: [uid] } },
        ]);
        fixture.detectChanges();

        expect(widgetHosts().length).toBe(1);
      });

      it('leaves the tool card exactly as it was', () => {
        fixture.detectChanges();
        const before = rowSummaries();
        const beforeResult = resultLine();

        agent.widgets.set([
          { toolCallId: 'c1', status: 'ready', name: 'documentList', props: { docIds: [uid] } },
        ]);
        fixture.detectChanges();

        expect(rowSummaries()).toEqual(before);
        expect(resultLine()).toBe(beforeResult);
      });

      // Degradation: the case that has to keep working forever, because it is
      // every deployment whose gateway predates this feature.
      it('shows today’s panel when no render event ever arrives', () => {
        fixture.detectChanges();

        expect(widgetHosts().length).toBe(0);
        expect(rowSummaries()).toEqual(['ai-tool-card:nuxeo.searchDocuments']);
      });

      it('ignores a widget keyed to a call that is not on screen', () => {
        agent.widgets.set([
          { toolCallId: 'c9', status: 'ready', name: 'documentList', props: { docIds: [uid] } },
        ]);
        fixture.detectChanges();

        expect(widgetHosts().length).toBe(0);
      });

      it('says a refused widget was refused instead of dropping it silently', () => {
        agent.widgets.set([{ toolCallId: 'c1', status: 'rejected', reason: 'unknown-widget' }]);
        fixture.detectChanges();

        expect(widgetHosts().length).toBe(1);
        expect(text()).toContain('does not provide');
      });

      it('takes the widget away when the conversation is cleared', () => {
        agent.widgets.set([
          { toolCallId: 'c1', status: 'ready', name: 'documentList', props: { docIds: [uid] } },
        ]);
        fixture.detectChanges();
        expect(widgetHosts().length).toBe(1);

        // What `AgentRuntimeService.clear()` does to the signals the panel binds to.
        agent.widgets.set([]);
        agent.toolCalls.set([]);
        agent.messages.set([]);
        fixture.detectChanges();

        expect(widgetHosts().length).toBe(0);
      });
    });

    /**
     * A7 stage 3: a gated write answered by a form instead of two buttons.
     *
     * The panel's job here is narrow and the tests match it: decide whether the
     * row shows a form or the buttons, route the two emissions to the runtime, and
     * put the buttons back if the form could not be shown. The declaration was
     * validated in `AgentRuntimeService` before it ever reached here.
     */
    describe('a gated write that declares a form', () => {
      const uid = 'aaaaaaaa-1111-2222-3333-444444444444';

      function formRequest(): AgentFormRequest {
        return {
          name: 'documentMetadataForm',
          props: {
            toolCallId: 'call-1',
            target: { uid, title: 'Records retention policy 2026' },
            title: 'Edit metadata',
            submitLabel: 'Save changes',
            fields: [
              {
                name: 'dc:title',
                label: 'Title',
                type: 'text',
                editable: true,
                value: 'A stored title',
                source: 'current',
              },
            ],
          },
        };
      }

      function openWrite(form?: AgentFormRequest): void {
        agent.approvals.set([
          {
            id: 'call-1',
            kind: 'interrupt',
            toolName: 'nuxeo.updateMetadata',
            summary: 'The assistant wants to run nuxeo.updateMetadata, which changes content.',
            args: { uid, properties: { 'dc:title': 'Title the model chose' } },
            action: { action: 'Change metadata on', subject: { arg: 'uid' } },
            targets: [{ uid, title: 'Records retention policy 2026' }],
            ...(form ? { form } : {}),
          },
        ]);
        fixture.detectChanges();
      }

      function formHosts(): NodeListOf<Element> {
        return (fixture.nativeElement as HTMLElement).querySelectorAll('app-agent-form-host');
      }

      /**
       * Waits for the form's lazy chunk, which the host loads with a real dynamic
       * `import()` rather than a stub. Only the two tests that drive the mounted
       * controls need this; the rest assert on the host element, which is
       * synchronous.
       */
      async function mountedControls(): Promise<HTMLElement> {
        for (let turn = 0; turn < 50; turn += 1) {
          const form = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
            'lib-document-metadata-form',
          );
          if (form) return form;
          await new Promise((resolve) => setTimeout(resolve, 5));
          fixture.detectChanges();
        }
        throw new Error('the form never mounted');
      }

      function actionButtons(): NodeListOf<Element> {
        return (fixture.nativeElement as HTMLElement).querySelectorAll('.ai-approval-actions');
      }

      it('shows the form in place of Decline and Approve', () => {
        openWrite(formRequest());

        expect(formHosts().length).toBe(1);
        expect(actionButtons().length).toBe(0);
      });

      it('keeps the action line, which says what the write does and to what', () => {
        openWrite(formRequest());

        // A form is a better way to answer that question, not a reason to stop
        // asking it.
        expect(text()).toContain('Change metadata on');
        expect(text()).toContain('Records retention policy 2026');
      });

      // Degradation: every write that declares no form, which is all of them but
      // metadata edit, and every gateway that predates this channel.
      it('shows the two buttons for a write that declares no form', () => {
        openWrite();

        expect(formHosts().length).toBe(0);
        expect(actionButtons().length).toBe(1);
      });

      it('submits what the mounted form emitted', async () => {
        openWrite(formRequest());
        const form = await mountedControls();

        const control = form.querySelector('.metadata-form__control') as HTMLInputElement;
        control.value = 'A title the user typed';
        control.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        (form.querySelector('.metadata-form__submit') as HTMLButtonElement).click();

        expect(agent.submitApprovalForm).toHaveBeenCalledWith('call-1', {
          'dc:title': 'A title the user typed',
        });
      });

      it('declines when the form is cancelled, so nothing is written', async () => {
        openWrite(formRequest());
        const form = await mountedControls();

        (form.querySelector('.metadata-form__cancel') as HTMLButtonElement).click();

        expect(agent.respondToApproval).toHaveBeenCalledWith('call-1', false);
        expect(agent.submitApprovalForm).not.toHaveBeenCalled();
      });

      it('puts the buttons back when the form reports it could not be shown', () => {
        openWrite(formRequest());
        expect(actionButtons().length).toBe(0);

        component.formUnavailable({ id: 'call-1' } as never);
        fixture.detectChanges();

        // Not a decline and not a write: the user has not decided, so the decision
        // stays open on the affordance that has always worked.
        expect(formHosts().length).toBe(0);
        expect(actionButtons().length).toBe(1);
        expect(agent.respondToApproval).not.toHaveBeenCalled();
        expect(agent.submitApprovalForm).not.toHaveBeenCalled();
      });

      it('leaves a form row alone when the rest of a batch is declined', () => {
        agent.approvals.set([
          {
            id: 'call-1',
            kind: 'interrupt',
            toolName: 'nuxeo.updateMetadata',
            summary: 'metadata',
            args: { uid },
            form: formRequest(),
          },
          {
            id: 'call-2',
            kind: 'interrupt',
            toolName: 'nuxeo.tagDocument',
            summary: 'tags',
            args: { uid: 'doc-b' },
          },
        ]);
        fixture.detectChanges();

        component.declineAllRemaining();

        // Refusing it would be safe in the sense that nothing is written, and it
        // would still throw away values the user had typed into a control that is
        // on screen offering its own Cancel.
        expect(agent.respondToApproval).toHaveBeenCalledWith('call-2', false);
        expect(agent.respondToApproval).not.toHaveBeenCalledWith('call-1', false);
      });

      it('replaces the form with the verdict once it has been answered', () => {
        agent.approvals.set([
          {
            id: 'call-1',
            kind: 'interrupt',
            toolName: 'nuxeo.updateMetadata',
            summary: 'metadata',
            args: { uid },
            form: formRequest(),
            verdict: 'approved',
          },
        ]);
        fixture.detectChanges();

        expect(formHosts().length).toBe(0);
        expect(text()).toContain('Approved');
      });
    });
  });

  // The OnPrem configuration with no gateway installed.
  describe('with no agent gateway deployed', () => {
    beforeEach(() => build(false));

    it('labels itself as the standard assistant', () => {
      expect(text()).toContain('Standard');
      expect(text()).not.toContain('Agent');
    });

    it('routes messages to the Automation chat instead of the agent runtime', () => {
      component.input.set('summarize my tasks');
      component.send();

      expect(chat.send).toHaveBeenCalledWith('summarize my tasks');
      expect(agent.send).not.toHaveBeenCalled();
    });

    it('renders the Automation transcript and its sources', () => {
      chat.hasMessages.set(true);
      chat.messages.set([
        {
          role: 'assistant',
          content: 'Three tasks are pending.',
          timestamp: new Date(),
          sources: [{ uid: 'doc-7', title: 'Task list', path: '/ws/tasks' }],
        } as never,
      ]);
      fixture.detectChanges();

      expect(text()).toContain('Three tasks are pending.');
      expect(text()).toContain('Task list');
    });

    it('shows the Automation error and never the agent one', () => {
      chat.error.set('AI service unavailable');
      agent.error.set('gateway exploded');
      fixture.detectChanges();

      expect(text()).toContain('AI service unavailable');
      expect(text()).not.toContain('gateway exploded');
    });

    it('offers no cancel button, because a single-shot request cannot be cancelled', () => {
      chat.loading.set(true);
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).querySelector('.ai-chat-cancel')).toBeNull();
    });

    it('still sends a suggestion from the welcome state', () => {
      component.sendSuggestion('Show me recent uploads');

      expect(chat.send).toHaveBeenCalledWith('Show me recent uploads');
    });
  });

  it('emits closed so the shell can shut the drawer', () => {
    build(true);
    const closed = jasmine.createSpy('closed');
    component.closed.subscribe(closed);

    component.close();

    expect(closed).toHaveBeenCalled();
  });

  it('clears both transcripts so switching paths cannot resurrect old history', () => {
    build(true);
    component.clear();

    expect(agent.clear).toHaveBeenCalled();
    expect(chat.clear).toHaveBeenCalled();
  });

  it('ignores an empty message', () => {
    build(true);
    component.input.set('   ');
    component.send();

    expect(agent.send).not.toHaveBeenCalled();
  });
});

/**
 * The whole chain, with the real `AgentRuntimeService` in the middle: gateway frames in,
 * `BrowseService.updateDocument` out.
 *
 * Every test above replaces the runtime service with a signal-shaped double, which is right
 * for testing the panel but blind to the defect that matters most here. The client used to
 * answer an `applyMetadata` interrupt without running the handler: the approval card
 * disappeared, the model was told `{"status":"resolved","result":{"approved":true}}`, the
 * user was told it worked, and Nuxeo was never called. Asserting the card cleared would
 * have passed. Only asserting the write proves it.
 */
describe('AiChatPanelComponent approved metadata write', () => {
  let fixture: ComponentFixture<AiChatPanelComponent>;
  let component: AiChatPanelComponent;
  let runner: GatewayStub;
  let browse: jasmine.SpyObj<BrowseService>;
  let router: jasmine.SpyObj<Router>;

  const DOC_ID = 'doc-1';
  const PROPERTIES = { 'dc:title': 'Renamed by the agent' };

  beforeEach(() => {
    runner = new GatewayStub();
    browse = jasmine.createSpyObj<BrowseService>('BrowseService', ['updateDocument']);
    browse.updateDocument.and.returnValue(of({ uid: DOC_ID } as NuxeoDocument));
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl'], {
      url: `/doc/${DOC_ID}`,
    });
    const selection = jasmine.createSpyObj<SelectionService>('SelectionService', [
      'selectAll',
      'selectedItems',
    ]);
    selection.selectedItems.and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [AiChatPanelComponent, NoopAnimationsModule],
      providers: [
        { provide: AGENT_RUNNER_FACTORY, useValue: () => runner },
        { provide: AGENT_DEV_AUTH_HEADERS, useValue: () => ({}) },
        { provide: AiChatService, useValue: fakeChat() },
        { provide: DocumentService, useValue: fakeDocuments({ [DOC_ID]: 'Contract A' }) },
        {
          provide: AiFeatureFlagService,
          useValue: {
            aiEnabled: signal(true),
            agentRuntimeAvailable: signal(true),
            agentPathEnabled: signal(true),
            automationPathEnabled: signal(false),
          },
        },
        { provide: Router, useValue: router },
        { provide: BrowseService, useValue: browse },
        { provide: SelectionService, useValue: selection },
      ],
    });

    fixture = TestBed.createComponent(AiChatPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writes the approved metadata through BrowseService and reports the real result', async () => {
    runner.script(applyMetadataTurn('call-1', DOC_ID, PROPERTIES), settledRun('m1', 'Renamed it.'));

    component.input.set('rename this document');
    component.send();
    await runner.settled();
    fixture.detectChanges();

    const approvals = component.agent.approvals();
    expect(approvals.length).toBe(1);
    expect(approvals[0].id).toBe('call-1');
    expect(approvals[0].toolName).toBe('applyMetadata');
    expect(browse.updateDocument).not.toHaveBeenCalled();

    component.approve(approvals[0]);
    await runner.settled();
    fixture.detectChanges();

    // The assertion the defect turned on.
    expect(browse.updateDocument).toHaveBeenCalledWith(DOC_ID, PROPERTIES);
    expect(component.agent.approvals()).toEqual([]);
    expect(component.agent.toolCalls()[0].status).toBe('complete');
    expect(component.agent.toolCalls()[0].result).toContain(DOC_ID);
    // And the model is told what actually happened, on both resumption channels.
    expect(runner.runs[1].resume?.[0]).toEqual({
      interruptId: 'call-1',
      status: 'resolved',
      payload: { approved: true, result: `Updated 1 propert(ies) on ${DOC_ID}.` },
    });
    expect(runner.messages.find((message) => message.role === 'tool')?.content).toBe(
      `Updated 1 propert(ies) on ${DOC_ID}.`,
    );
    expect(component.agent.error()).toBeNull();
  });

  it('leaves the document untouched when the user declines', async () => {
    runner.script(applyMetadataTurn('call-1', DOC_ID, PROPERTIES), settledRun('m1', 'Left it.'));

    component.input.set('rename this document');
    component.send();
    await runner.settled();

    component.decline(component.agent.approvals()[0]);
    await runner.settled();

    expect(browse.updateDocument).not.toHaveBeenCalled();
    expect(runner.runs[1].resume).toEqual([{ interruptId: 'call-1', status: 'cancelled' }]);
  });
});

/**
 * Five writes in one turn, which is the shape that produced this work: the amendment to
 * ADR 001 was written after a live model called `nuxeo.createCollection` and four
 * `nuxeo.addToCollection` in a single turn.
 *
 * These run the real `AgentRuntimeService` against the gateway stub and drive the card
 * through the DOM, because the property under test is not "the component called a method
 * with the right argument" — it is that grouping several decisions into one card does not
 * let a verdict given to one of them reach another. Only the `resume` array the next run
 * carries can show that, and it is the same array the gateway reads.
 */
describe('AiChatPanelComponent write-batch consent', () => {
  let fixture: ComponentFixture<AiChatPanelComponent>;
  let component: AiChatPanelComponent;
  let runner: GatewayStub;

  const WRITES = [
    { id: 'call-1', name: 'nuxeo.createCollection', args: { name: 'Agent demo' } },
    { id: 'call-2', name: 'nuxeo.addToCollection', args: { uid: 'doc-a', collectionUid: 'col-1' } },
    { id: 'call-3', name: 'nuxeo.tagDocument', args: { uid: 'doc-b', tags: ['urgent'] } },
  ];

  function rows(): HTMLElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.ai-approval-row'),
    );
  }

  function clickIn(row: HTMLElement, selector: string): void {
    row.querySelector<HTMLButtonElement>(selector)?.click();
  }

  function resumeOfSecondRun() {
    return runner.runs[1]?.resume ?? [];
  }

  /** The ids this request would let the gateway execute. Everything else is a refusal. */
  function approvedIds(): string[] {
    return resumeOfSecondRun()
      .filter(
        (entry) =>
          entry.status === 'resolved' &&
          (entry.payload as { approved?: unknown } | undefined)?.approved === true,
      )
      .map((entry) => entry.interruptId);
  }

  function refusedIds(): string[] {
    return resumeOfSecondRun()
      .filter((entry) => !approvedIds().includes(entry.interruptId))
      .map((entry) => entry.interruptId)
      .sort();
  }

  async function openBatch(): Promise<void> {
    runner.script(mutationBatchTurn(WRITES), settledRun('m1', 'Done.'));
    component.input.set('file these away');
    component.send();
    await runner.settled();
    fixture.detectChanges();
  }

  beforeEach(() => {
    runner = new GatewayStub();
    const selection = jasmine.createSpyObj<SelectionService>('SelectionService', [
      'selectAll',
      'selectedItems',
    ]);
    selection.selectedItems.and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [AiChatPanelComponent, NoopAnimationsModule],
      providers: [
        { provide: AGENT_RUNNER_FACTORY, useValue: () => runner },
        { provide: AGENT_DEV_AUTH_HEADERS, useValue: () => ({}) },
        { provide: AiChatService, useValue: fakeChat() },
        {
          provide: DocumentService,
          useValue: fakeDocuments({
            'doc-a': 'Vendor onboarding checklist',
            'doc-b': 'Q3 supplier contract',
            'col-1': 'Agent demo',
          }),
        },
        {
          provide: AiFeatureFlagService,
          useValue: {
            aiEnabled: signal(true),
            agentRuntimeAvailable: signal(true),
            agentPathEnabled: signal(true),
            automationPathEnabled: signal(false),
          },
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl'], {
            url: '/browse',
          }),
        },
        {
          provide: BrowseService,
          useValue: jasmine.createSpyObj<BrowseService>('BrowseService', ['updateDocument']),
        },
        { provide: SelectionService, useValue: selection },
      ],
    });

    fixture = TestBed.createComponent(AiChatPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * The test that would fail if grouping ever leaked consent across rows.
   *
   * One Approve click, on one row, in a batch of three. The request that reaches the
   * gateway must grant that call and only that call — an `approved: true` payload against
   * any other interrupt id is a write the user never agreed to, and it is precisely what a
   * batch control or a shared verdict would produce.
   */
  it('grants only the row that was approved, naming its own call id', async () => {
    await openBatch();
    expect(rows().length).toBe(3);

    clickIn(rows()[1], '.ai-approval-approve');
    await runner.settled();
    fixture.detectChanges();

    // Nothing has left the browser yet: the SDK refuses a run that leaves an interrupt
    // unaddressed, so a half-answered batch is held rather than partially submitted.
    expect(runner.runs.length).toBe(1);
    expect(rows().map((row) => row.getAttribute('data-verdict'))).toEqual([
      'pending',
      'approved',
      'pending',
    ]);

    clickIn(rows()[0], '.ai-approval-decline');
    clickIn(rows()[2], '.ai-approval-decline');
    await runner.settled();
    fixture.detectChanges();

    expect(runner.runs.length).toBe(2);
    expect(resumeOfSecondRun().length).toBe(3);
    expect(approvedIds()).toEqual(['call-2']);
    expect(refusedIds()).toEqual(['call-1', 'call-3']);
  });

  it('answers each row separately when several are approved', async () => {
    await openBatch();

    clickIn(rows()[0], '.ai-approval-approve');
    clickIn(rows()[2], '.ai-approval-approve');
    clickIn(rows()[1], '.ai-approval-decline');
    await runner.settled();

    expect(approvedIds().sort()).toEqual(['call-1', 'call-3']);
    expect(refusedIds()).toEqual(['call-2']);
  });

  it('ignores a second verdict on a row that has already been answered', async () => {
    await openBatch();

    clickIn(rows()[0], '.ai-approval-approve');
    fixture.detectChanges();
    // The row's buttons are gone, so this goes through the component directly — the guard
    // has to hold against any caller, not only against the ones the template offers.
    component.decline(component.agent.approvals()[0]);
    clickIn(rows()[1], '.ai-approval-decline');
    clickIn(rows()[2], '.ai-approval-decline');
    await runner.settled();

    expect(approvedIds()).toEqual(['call-1']);
    expect(resumeOfSecondRun().length).toBe(3);
  });

  /**
   * Refusing the rest is the one control that acts on more than one row, and it is safe
   * to batch for the reason approving is not: nothing is written by it. Approvals already
   * given survive it.
   */
  it('keeps an approval already given when the rest of the batch is declined wholesale', async () => {
    await openBatch();

    clickIn(rows()[1], '.ai-approval-approve');
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.ai-approval-decline-all')
      ?.click();
    await runner.settled();

    expect(approvedIds()).toEqual(['call-2']);
    expect(refusedIds()).toEqual(['call-1', 'call-3']);
  });

  /**
   * Walking away from a half-answered batch. Typing instead of deciding is itself a
   * decision — the SDK will not start a run with an interrupt unaddressed — so the
   * unanswered rows become refusals and the ones the user did approve stand.
   */
  it('refuses only the undecided rows when the user changes the subject', async () => {
    await openBatch();

    clickIn(rows()[2], '.ai-approval-approve');
    await runner.settled();

    component.input.set('never mind, what is in my trash?');
    component.send();
    await runner.settled();
    fixture.detectChanges();

    expect(approvedIds()).toEqual(['call-3']);
    expect(refusedIds()).toEqual(['call-1', 'call-2']);
    expect(component.agent.error()).toBeNull();
    // The card is spent, and the transcript is the record from here on.
    expect((fixture.nativeElement as HTMLElement).querySelector('.ai-approval')).toBeNull();
  });

  /**
   * The answered state, consistent with the single-decision flow: the card disappears
   * once its decisions have been sent and the tool cards take over as the record. While
   * the batch is still open they stay hidden, because a card claiming a write completed
   * before the user finished deciding is the worst thing this panel could show.
   */
  it('hands the batch over to the tool cards once every row has been answered', async () => {
    await openBatch();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.ai-tool-card').length).toBe(0);

    for (const row of rows()) clickIn(row, '.ai-approval-decline');
    await runner.settled();
    fixture.detectChanges();

    expect(host.querySelector('.ai-approval')).toBeNull();
    expect(host.querySelectorAll('.ai-tool-card').length).toBe(3);
    expect(component.agent.toolCalls().map((call) => call.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
    ]);
  });
});
