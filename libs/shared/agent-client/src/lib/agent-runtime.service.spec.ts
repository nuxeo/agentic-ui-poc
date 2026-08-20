import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import type { AgentSubscriber } from '@ag-ui/client';
import type { Interrupt } from '@ag-ui/core';

import { AGENT_DEV_AUTH_HEADERS } from './agent.config';
import { provideAgentFormComponents, type AgentFormDefinition } from './agent-form';
import { AGENT_RUNNER_FACTORY, AgentRuntimeService } from './agent-runtime.service';
import { AgentSelectionStore } from './agent-selection';
import {
  exactProps,
  parseUidList,
  provideAgentWidgets,
  type AgentWidgetDefinition,
} from './agent-widget';
import { FakeAgentRunner, subscriberParams } from './testing/fake-agent-runner';

/**
 * A widget registered for these tests only.
 *
 * The service resolves render events against the injected catalogue and names no
 * widget of its own, so the specs below have to supply one — which is also the
 * cheapest proof that it names none: remove this provider and every render event
 * in this file is refused.
 */
const testDocumentList: AgentWidgetDefinition<{ docIds: readonly string[] }> = {
  name: 'documentList',
  parseProps: (props) => {
    if (!exactProps(props, ['docIds'])) return null;
    const docIds = parseUidList(props['docIds']);
    return docIds ? { docIds } : null;
  },
  load: () => Promise.reject(new Error('not mounted in this spec')),
  inputs: (props) => ({ docIds: props.docIds }),
};

/**
 * A form component registered for these tests only, for the same reason the
 * widget above is: the service resolves `metadata.render` against the injected
 * form catalogue and names no component of its own. Remove this provider and
 * every declaration in this file falls back to the approval card, which is the
 * behaviour a client that has never heard of forms has.
 */
const testMetadataForm: AgentFormDefinition = {
  name: 'documentMetadataForm',
  load: () => Promise.reject(new Error('not mounted in this spec')),
  inputs: (props) => ({ fields: props.fields }),
  outputs: { submitted: 'submitted', cancelled: 'cancelled' },
};

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Streams one assistant message, exactly as the SDK reports it after chunk normalisation. */
function assistantText(id: string, text: string) {
  return async (subscriber: AgentSubscriber, runner: FakeAgentRunner) => {
    const params = subscriberParams(runner);
    await subscriber.onRunStartedEvent?.({
      event: { type: 'RUN_STARTED', threadId: 't', runId: 'r' } as never,
      ...params,
    });
    await subscriber.onTextMessageStartEvent?.({
      event: { type: 'TEXT_MESSAGE_START', messageId: id, role: 'assistant' } as never,
      ...params,
    });
    let buffer = '';
    for (const token of text.split(' ')) {
      buffer = buffer ? `${buffer} ${token}` : token;
      await subscriber.onTextMessageContentEvent?.({
        event: { type: 'TEXT_MESSAGE_CONTENT', messageId: id, delta: token } as never,
        textMessageBuffer: buffer,
        ...params,
      });
    }
    runner.addMessage({ id, role: 'assistant', content: text });
    await subscriber.onTextMessageEndEvent?.({
      event: { type: 'TEXT_MESSAGE_END', messageId: id } as never,
      textMessageBuffer: buffer,
      ...params,
    });
  };
}

/** Streams a single tool call and closes it, as `transformChunks` would. */
function toolCall(id: string, name: string, args: Record<string, unknown>) {
  return async (subscriber: AgentSubscriber, runner: FakeAgentRunner) => {
    const params = subscriberParams(runner);
    await subscriber.onToolCallStartEvent?.({
      event: { type: 'TOOL_CALL_START', toolCallId: id, toolCallName: name } as never,
      ...params,
    });
    await subscriber.onToolCallArgsEvent?.({
      event: { type: 'TOOL_CALL_ARGS', toolCallId: id, delta: '{' } as never,
      toolCallBuffer: '{',
      toolCallName: name,
      partialToolCallArgs: {},
      ...params,
    });
    await subscriber.onToolCallEndEvent?.({
      event: { type: 'TOOL_CALL_END', toolCallId: id } as never,
      toolCallName: name,
      toolCallArgs: args,
      ...params,
    });
  };
}

/** Streams one assistant message and ends the run the way a gateway ends it. */
function answeringRun(id: string, text: string) {
  return async (subscriber: AgentSubscriber, runner: FakeAgentRunner) => {
    await assistantText(id, text)(subscriber, runner);
    await runner.finishRun(subscriber);
  };
}

/**
 * An interrupt exactly as `describeInterrupt` in the gateway builds it: `id` equal to the
 * `toolCallId`, `reason` the tool name, a human sentence in `message`, and the protocol
 * discriminator plus parsed arguments under `metadata`.
 */
function clientToolInterrupt(
  id: string,
  name: string,
  args: Record<string, unknown>,
  message?: string,
): Interrupt {
  return {
    id,
    reason: name,
    message: message ?? `The assistant wants to run ${name}.`,
    toolCallId: id,
    metadata: { kind: 'client_tool', toolName: name, args },
  } as Interrupt;
}

/** The gateway's real handoff: tool-call frames *and* an interrupt for the same call. */
function clientToolTurn(id: string, name: string, args: Record<string, unknown>, message?: string) {
  return async (subscriber: AgentSubscriber, runner: FakeAgentRunner) => {
    await toolCall(id, name, args)(subscriber, runner);
    await runner.finishRun(subscriber, [clientToolInterrupt(id, name, args, message)]);
  };
}

describe('AgentRuntimeService', () => {
  let runner: FakeAgentRunner;
  let devHeaders: Record<string, string>;

  function createService(): AgentRuntimeService {
    return TestBed.inject(AgentRuntimeService);
  }

  beforeEach(() => {
    runner = new FakeAgentRunner();
    devHeaders = {};
    TestBed.configureTestingModule({
      providers: [
        { provide: AGENT_RUNNER_FACTORY, useValue: () => runner },
        { provide: AGENT_DEV_AUTH_HEADERS, useValue: () => devHeaders },
        provideAgentWidgets(testDocumentList),
        provideAgentFormComponents(testMetadataForm),
      ],
    });
  });

  it('streams assistant tokens into streamingText and commits the settled message', async () => {
    runner.script(assistantText('m1', 'Two contracts matched.'));
    const service = createService();
    const seen: string[] = [];

    service.send('find contracts');
    // The buffer is observable while the run is in flight and cleared once it settles.
    seen.push(service.streamingText());
    await flush();

    expect(service.running()).toBe(false);
    expect(service.streamingText()).toBe('');
    expect(service.messages().map((m) => `${m.role}:${m.content}`)).toEqual([
      'user:find contracts',
      'assistant:Two contracts matched.',
    ]);
    expect(seen[0]).toBe('');
  });

  it('always sends the required tools and context arrays', async () => {
    runner.script(assistantText('m1', 'ok'));
    const service = createService();
    service.setContext({ page: '/search', docId: 'doc-9' });

    service.send('hello');
    await flush();

    const [input] = runner.runs;
    expect(Array.isArray(input.tools)).toBe(true);
    expect(input.tools?.map((tool) => tool.name)).toEqual([
      'confirmAction',
      'navigateTo',
      'applyMetadata',
      'selectDocuments',
    ]);
    expect(input.context).toEqual([
      { description: 'currentPage', value: '/search' },
      { description: 'currentDocumentId', value: 'doc-9' },
    ]);
  });

  it('passes the dev credential to fetch, which never reaches the Angular interceptor', async () => {
    devHeaders = { Authorization: 'Basic dXNlcjpwdw==' };
    runner.script(assistantText('m1', 'ok'));
    const service = createService();

    service.send('hello');
    await flush();

    expect(runner.headersPerRun[0]['Authorization']).toBe('Basic dXNlcjpwdw==');
  });

  it('runs a read-only frontend tool immediately and continues the turn', async () => {
    runner.script(
      toolCall('call-1', 'navigateTo', { route: '/doc/abc' }),
      assistantText('m1', 'Opened it.'),
    );
    const service = createService();
    const handler = vi.fn().mockReturnValue('Navigated to /doc/abc.');
    service.registerToolHandler('navigateTo', handler);

    service.send('open abc');
    await flush();

    expect(handler).toHaveBeenCalledWith({ route: '/doc/abc' });
    expect(runner.runs).toHaveLength(2);
    expect(service.approvals()).toEqual([]);
    expect(service.toolCalls()[0].status).toBe('complete');
    // The tool result is carried back on the next run as a `tool` message.
    expect(runner.messages.some((m) => m.role === 'tool')).toBe(true);
  });

  it('holds a mutating tool for approval instead of running it', async () => {
    runner.script(
      toolCall('call-1', 'applyMetadata', { docId: 'doc-1', properties: { 'dc:title': 'New' } }),
    );
    const service = createService();
    const handler = vi.fn().mockReturnValue('Updated.');
    service.registerToolHandler('applyMetadata', handler);

    service.send('rename doc-1');
    await flush();

    expect(handler).not.toHaveBeenCalled();
    expect(runner.runs).toHaveLength(1);
    expect(service.approvals()).toHaveLength(1);
    expect(service.toolCalls()[0].status).toBe('awaiting-approval');
  });

  it('runs the mutating tool once the user approves and resumes the conversation', async () => {
    runner.script(
      toolCall('call-1', 'applyMetadata', { docId: 'doc-1', properties: { 'dc:title': 'New' } }),
      assistantText('m1', 'Renamed.'),
    );
    const service = createService();
    const handler = vi.fn().mockResolvedValue('Updated 1 property.');
    service.registerToolHandler('applyMetadata', handler);

    service.send('rename doc-1');
    await flush();
    service.respondToApproval('call-1', true);
    await flush();

    expect(handler).toHaveBeenCalledWith({ docId: 'doc-1', properties: { 'dc:title': 'New' } });
    expect(service.approvals()).toEqual([]);
    expect(service.toolCalls()[0].status).toBe('complete');
    expect(runner.runs).toHaveLength(2);
  });

  it('tells the agent when the user declines, and never calls the handler', async () => {
    runner.script(
      toolCall('call-1', 'applyMetadata', { docId: 'doc-1', properties: {} }),
      assistantText('m1', 'Left it alone.'),
    );
    const service = createService();
    const handler = vi.fn();
    service.registerToolHandler('applyMetadata', handler);

    service.send('rename doc-1');
    await flush();
    service.respondToApproval('call-1', false);
    await flush();

    expect(handler).not.toHaveBeenCalled();
    expect(service.toolCalls()[0].status).toBe('rejected');
    // A sentence, not JSON: this string is both what the model reads and what the tool
    // card shows, and the card used to print `{"approved":false,"reason":…}` verbatim.
    const declined = 'Declined by the user. Nothing was changed.';
    expect(runner.messages.find((m) => m.role === 'tool')?.content).toBe(declined);
    expect(service.toolCalls()[0].result).toBe(declined);
  });

  it('records an approved verdict as a sentence when the tool has no browser handler', async () => {
    // `confirmAction` is the case: the answer the agent is waiting for is the verdict
    // itself, so there is nothing to run and the fallback content is the whole result.
    runner.script(
      toolCall('call-1', 'confirmAction', { summary: 'Create a collection.' }),
      assistantText('m1', 'Created it.'),
    );
    const service = createService();

    service.send('create a collection');
    await flush();
    service.respondToApproval('call-1', true);
    await flush();

    expect(service.toolCalls()[0].result).toBe('Approved by the user.');
    expect(runner.messages.find((m) => m.role === 'tool')?.content).toBe('Approved by the user.');
  });

  it('surfaces RUN_ERROR text and does not overwrite it with a transport message', async () => {
    runner.script(async (subscriber, fake) => {
      await subscriber.onRunErrorEvent?.({
        event: {
          type: 'RUN_ERROR',
          message: 'The model timed out.',
          code: 'UPSTREAM_TIMEOUT',
        } as never,
        ...subscriberParams(fake),
      });
      throw new Error('stream closed after RUN_ERROR');
    });
    const service = createService();

    service.send('hello');
    await flush();

    expect(service.error()).toBe('The model timed out.');
    expect(service.running()).toBe(false);
  });

  it('reports a clean sentence when the gateway cannot be reached at all', async () => {
    runner.failNextRunWith(new TypeError('Failed to fetch'));
    const service = createService();

    service.send('hello');
    await flush();

    expect(service.error()).toBe(
      'The assistant is unavailable. Check the connection and try again.',
    );
  });

  it('treats cancellation as a normal outcome rather than a failure', async () => {
    runner.script(async () => {
      throw Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' });
    });
    const service = createService();

    service.send('hello');
    service.abortRun();
    await flush();

    expect(runner.aborted).toBe(1);
    expect(service.error()).toBeNull();
    expect(service.running()).toBe(false);
  });

  /**
   * The red bubble after Stop came from here, not from the rejection: the SDK turns the
   * aborted fetch into a `RUN_ERROR` first, and that arrives while the run is still
   * unwinding — so ignoring the rejection alone left the bubble on screen.
   */
  it('does not report the RUN_ERROR the SDK raises for a run the user stopped', async () => {
    runner.script(async (subscriber, fake) => {
      await subscriber.onRunErrorEvent?.({
        event: { type: 'RUN_ERROR', message: 'BodyStreamBuffer was aborted' } as never,
        ...subscriberParams(fake),
      });
      throw new Error('BodyStreamBuffer was aborted');
    });
    const service = createService();

    service.send('run an access review');
    service.abortRun();
    await flush();

    expect(service.error()).toBeNull();
    expect(service.running()).toBe(false);
  });

  /** An abort the user did not press Stop for: navigating away, or the panel closing. */
  it('ignores a RUN_ERROR that reports nothing but the fetch being aborted', async () => {
    runner.script(async (subscriber, fake) => {
      await subscriber.onRunErrorEvent?.({
        event: { type: 'RUN_ERROR', message: 'The user aborted a request.' } as never,
        ...subscriberParams(fake),
      });
    });
    const service = createService();

    service.send('hello');
    await flush();

    expect(service.error()).toBeNull();
  });

  it('projects shared state and grounded citations', async () => {
    runner.script(async (subscriber, fake) => {
      const params = subscriberParams(fake);
      await subscriber.onTextMessageStartEvent?.({
        event: { type: 'TEXT_MESSAGE_START', messageId: 'm1', role: 'assistant' } as never,
        ...params,
      });
      fake.addMessage({ id: 'm1', role: 'assistant', content: 'Two contracts matched.' });
      await subscriber.onStateDeltaEvent?.({
        event: { type: 'STATE_DELTA', delta: [] } as never,
        ...params,
        state: { lastQuery: 'contract' },
      });
      await subscriber.onCustomEvent?.({
        event: {
          type: 'CUSTOM',
          name: 'citations',
          value: { citations: [{ uid: 'doc-1', title: 'Contract A', path: '/ws/a' }] },
        } as never,
        ...params,
      });
    });
    const service = createService();

    service.send('find contracts');
    await flush();

    expect(service.sharedState()).toEqual({ lastQuery: 'contract' });
    const assistant = service.messages().find((m) => m.role === 'assistant');
    expect(assistant?.citations).toEqual([{ uid: 'doc-1', title: 'Contract A', path: '/ws/a' }]);
  });

  /**
   * Shared state is server-authored, so consuming it is the one place the
   * gateway can reach into the browser's own model of what the user chose.
   * These say it cannot: the only slice read is `selection.proposed`, and a
   * proposal only becomes visible once a mounted widget offers the uid.
   */
  describe('server-authored selection state', () => {
    const sendState = (state: unknown) =>
      runner.script(async (subscriber, fake) => {
        await subscriber.onStateSnapshotEvent?.({
          event: { type: 'STATE_SNAPSHOT', snapshot: state } as never,
          ...subscriberParams(fake),
          state: state as never,
        });
      });

    it('turns the proposed slice into a proposal once a widget offers the uid', async () => {
      sendState({ selection: { proposed: ['doc-1'] } });
      const service = createService();
      const store = TestBed.inject(AgentSelectionStore);

      service.send('suggest some');
      await flush();

      // Not yet: nothing is on screen for the user to tick.
      expect(store.proposals()).toEqual([]);

      store.offer('call-1', ['doc-1', 'doc-2']);
      expect(store.proposals()).toEqual(['doc-1']);
    });

    it('ignores a state document asserting the user confirmed something', async () => {
      sendState({
        selection: { confirmed: ['doc-1'], selected: ['doc-1'], proposed: [] },
      });
      const service = createService();
      const store = TestBed.inject(AgentSelectionStore);
      store.offer('call-1', ['doc-1']);

      service.send('act on the selection');
      await flush();

      expect(store.proposals()).toEqual([]);
      // And the whole document is still kept, because `sharedState` is a general
      // channel; what matters is that nothing but `proposed` was acted on.
      expect(service.sharedState()).toEqual({
        selection: { confirmed: ['doc-1'], selected: ['doc-1'], proposed: [] },
      });
    });

    it('lets the gateway retract a proposal with an empty list', async () => {
      const service = createService();
      const store = TestBed.inject(AgentSelectionStore);
      store.offer('call-1', ['doc-1']);
      store.propose(['doc-1']);

      sendState({ selection: { proposed: [] } });
      service.send('never mind');
      await flush();

      expect(store.proposals()).toEqual([]);
    });

    it('leaves a live proposal alone when the state carries no selection slice', async () => {
      const service = createService();
      const store = TestBed.inject(AgentSelectionStore);
      store.offer('call-1', ['doc-1']);
      store.propose(['doc-1']);

      sendState({ somethingElse: true });
      service.send('carry on');
      await flush();

      expect(store.proposals()).toEqual(['doc-1']);
    });

    it('forgets offers and proposals when the transcript is cleared', async () => {
      const service = createService();
      const store = TestBed.inject(AgentSelectionStore);
      store.offer('call-1', ['doc-1']);
      store.propose(['doc-1']);

      service.clear();

      expect(store.proposals()).toEqual([]);
      expect(store.offered().size).toBe(0);
    });
  });

  it('records progress from steps and from the deprecated THINKING events alike', async () => {
    runner.script(async (subscriber, fake) => {
      const params = subscriberParams(fake);
      await subscriber.onStepStartedEvent?.({
        event: { type: 'STEP_STARTED', stepName: 'Searching Nuxeo' } as never,
        ...params,
      });
      await subscriber.onEvent?.({
        event: { type: 'THINKING_START', title: 'Planning' } as never,
        ...params,
      });
      await subscriber.onEvent?.({
        event: { type: 'THINKING_TEXT_MESSAGE_CONTENT', delta: 'checking ACLs' } as never,
        ...params,
      });
      await subscriber.onStepFinishedEvent?.({
        event: { type: 'STEP_FINISHED', stepName: 'Searching Nuxeo' } as never,
        ...params,
      });
    });
    const service = createService();

    service.send('hello');
    await flush();

    const steps = service.thinkingSteps();
    expect(steps.map((step) => `${step.label}:${step.status}`)).toEqual([
      'Searching Nuxeo:done',
      'Planning:active',
    ]);
    expect(steps[1].detail).toBe('checking ACLs');
  });

  it('clears every signal when the conversation is reset', async () => {
    runner.script(assistantText('m1', 'ok'));
    const service = createService();

    service.send('hello');
    await flush();
    service.clear();

    expect(service.messages()).toEqual([]);
    expect(service.toolCalls()).toEqual([]);
    expect(service.thinkingSteps()).toEqual([]);
    expect(service.sharedState()).toEqual({});
    expect(service.widgets()).toEqual([]);
    expect(service.error()).toBeNull();
  });

  /**
   * Generative UI arrives on a `CUSTOM` event like citations do, and this is the
   * only place the browser decides whether to honour one. What matters is that a
   * gateway which never sends the event, and one that sends a bad one, both leave
   * the panel showing exactly the tool cards it shows today.
   */
  describe('render requests', () => {
    const uid = 'aaaaaaaa-1111-2222-3333-444444444444';

    /** One `CUSTOM` `render` frame, exactly as the gateway emits it after a tool result. */
    function renderEvent(value: unknown) {
      return async (subscriber: AgentSubscriber, fake: FakeAgentRunner) => {
        await subscriber.onCustomEvent?.({
          event: { type: 'CUSTOM', name: 'render', value } as never,
          ...subscriberParams(fake),
        });
      };
    }

    it('records a valid request against the call that produced it', async () => {
      runner.script(
        renderEvent({ toolCallId: 'call-1', component: 'documentList', props: { docIds: [uid] } }),
      );
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([
        { toolCallId: 'call-1', status: 'ready', name: 'documentList', props: { docIds: [uid] } },
      ]);
    });

    it('records an unknown component as a refusal rather than mounting it', async () => {
      runner.script(
        renderEvent({ toolCallId: 'call-1', component: 'permissionsEditor', props: {} }),
      );
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([
        { toolCallId: 'call-1', status: 'rejected', reason: 'unknown-widget' },
      ]);
    });

    it('records hostile props as a refusal rather than passing them through', async () => {
      runner.script(
        renderEvent({
          toolCallId: 'call-1',
          component: 'documentList',
          props: { docIds: ['../../../etc/passwd'] },
        }),
      );
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([
        { toolCallId: 'call-1', status: 'rejected', reason: 'invalid-props' },
      ]);
    });

    it('ignores a payload with no call to attach to', async () => {
      runner.script(renderEvent({ component: 'documentList', props: { docIds: [uid] } }));
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([]);
    });

    it('shows one widget per tool card, replacing an earlier request for the same call', async () => {
      runner.script(async (subscriber, fake) => {
        await renderEvent({
          toolCallId: 'call-1',
          component: 'documentList',
          props: { docIds: [uid] },
        })(subscriber, fake);
        await renderEvent({
          toolCallId: 'call-1',
          component: 'documentList',
          props: { docIds: ['uid-2'] },
        })(subscriber, fake);
      });
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([
        {
          toolCallId: 'call-1',
          status: 'ready',
          name: 'documentList',
          props: { docIds: ['uid-2'] },
        },
      ]);
    });

    it('stops accumulating widgets once a thread has too many', async () => {
      runner.script(async (subscriber, fake) => {
        for (let i = 0; i < 40; i += 1) {
          await renderEvent({
            toolCallId: `call-${i}`,
            component: 'documentList',
            props: { docIds: [uid] },
          })(subscriber, fake);
        }
      });
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toHaveLength(20);
      expect(service.widgets().at(-1)?.toolCallId).toBe('call-19');
    });

    // Degradation, which is the property the whole feature rests on: a gateway
    // that knows nothing about generative UI produces today's panel exactly.
    it('leaves the widget list empty when no render event ever arrives', async () => {
      runner.script(async (subscriber, fake) => {
        await toolCall('call-1', 'nuxeo.searchDocuments', { query: 'x' })(subscriber, fake);
        await assistantText('m1', 'I found two.')(subscriber, fake);
      });
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([]);
      expect(service.toolCalls()).toHaveLength(1);
      expect(service.messages().some((message) => message.role === 'assistant')).toBe(true);
    });

    it('ignores a CUSTOM event it does not recognise', async () => {
      runner.script(async (subscriber, fake) => {
        await subscriber.onCustomEvent?.({
          event: {
            type: 'CUSTOM',
            name: 'renderComponent',
            value: { toolCallId: 'call-1', component: 'documentList', props: { docIds: [uid] } },
          } as never,
          ...subscriberParams(fake),
        });
      });
      const service = createService();

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([]);
    });

    it('recognises no widget the application did not register', async () => {
      // The service is generic over the catalogue and holds no list of its own.
      // With nothing provided, the same payload every other test in this block
      // accepts is refused — which is what "the allowlist is the composition
      // root's" means, stated as a test rather than as a comment.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: AGENT_RUNNER_FACTORY, useValue: () => runner },
          { provide: AGENT_DEV_AUTH_HEADERS, useValue: () => devHeaders },
        ],
      });
      runner.script(
        renderEvent({ toolCallId: 'call-1', component: 'documentList', props: { docIds: [uid] } }),
      );
      const service = TestBed.inject(AgentRuntimeService);

      service.send('find contracts');
      await flush();

      expect(service.widgets()).toEqual([
        { toolCallId: 'call-1', status: 'rejected', reason: 'unknown-widget' },
      ]);
    });
  });

  it('ignores an empty message and a message sent while a run is in flight', async () => {
    runner.script(assistantText('m1', 'ok'));
    const service = createService();

    service.send('   ');
    expect(runner.runs).toHaveLength(0);

    service.send('hello');
    service.send('again');
    await flush();

    expect(runner.runs).toHaveLength(1);
  });

  it('sends the current selection as context so the agent can act on it', async () => {
    runner.script(assistantText('m1', 'ok'));
    const service = createService();
    service.setContext({ page: '/documents', selectionIds: ['a', 'b'] });

    service.send('tag these');
    await flush();

    expect(runner.runs[0].context).toEqual([
      { description: 'currentPage', value: '/documents' },
      { description: 'documentsSelectedByUser', value: 'a,b' },
    ]);
  });

  /**
   * The two selections are two context entries, named so the difference is
   * legible to a model reading a flat list of description/value pairs. A single
   * `selectedDocumentIds` carrying both — or carrying the agent's proposal at
   * all — is how a suggestion gets acted on as a decision.
   */
  it('names an agent proposal as unconfirmed, separately from the user selection', async () => {
    runner.script(assistantText('m1', 'ok'));
    const service = createService();
    service.setContext({
      page: '/documents',
      selectionIds: ['a'],
      proposedSelectionIds: ['b', 'c'],
    });

    service.send('tag the selected ones');
    await flush();

    expect(runner.runs[0].context).toEqual([
      { description: 'currentPage', value: '/documents' },
      { description: 'documentsSelectedByUser', value: 'a' },
      {
        description: 'documentsYouProposedAwaitingUserConfirmation_doNotActOnThese',
        value: 'b,c',
      },
    ]);
  });

  it('sends no selection entry at all when the user has selected nothing', async () => {
    runner.script(assistantText('m1', 'ok'));
    const service = createService();
    service.setContext({ page: '/documents', proposedSelectionIds: ['b'] });

    service.send('what is selected?');
    await flush();

    const descriptions = runner.runs[0].context?.map(
      (entry: { description: string }) => entry.description,
    );
    expect(descriptions).not.toContain('documentsSelectedByUser');
  });

  it('stops calling a handler after its component unregisters it', async () => {
    runner.script(toolCall('call-1', 'navigateTo', { route: '/browse' }));
    const service = createService();
    const handler = vi.fn().mockReturnValue('Navigated.');
    const unregister = service.registerToolHandler('navigateTo', handler);

    unregister();
    service.send('open browse');
    await flush();

    expect(handler).not.toHaveBeenCalled();
    // With no handler the call still has to be answered, or the agent waits forever.
    expect(service.toolCalls()[0].status).toBe('complete');
    expect(runner.messages.find((m) => m.role === 'tool')?.content).toBe('navigateTo completed.');
  });

  it('reports a throwing handler back to the agent instead of failing the run', async () => {
    runner.script(
      toolCall('call-1', 'navigateTo', { route: '/browse' }),
      assistantText('m1', 'I could not open it.'),
    );
    const service = createService();
    service.registerToolHandler('navigateTo', () => {
      throw new Error('router blew up');
    });

    service.send('open browse');
    await flush();

    expect(service.error()).toBeNull();
    expect(service.toolCalls()[0].status).toBe('failed');
    expect(runner.messages.find((m) => m.role === 'tool')?.content).toContain('could not be');
  });

  it('shows a server-executed tool result without waiting for the browser', async () => {
    runner.script(async (subscriber, fake) => {
      const params = subscriberParams(fake);
      await toolCall('call-1', 'searchDocuments', { nxql: 'SELECT * FROM Document' })(
        subscriber,
        fake,
      );
      await subscriber.onToolCallResultEvent?.({
        event: {
          type: 'TOOL_CALL_RESULT',
          toolCallId: 'call-1',
          messageId: 'tm1',
          content: '3 documents',
        } as never,
        ...params,
      });
    });
    const service = createService();

    service.send('search');
    await flush();

    // A gateway-side tool is not in the frontend set, so it never queues a second run.
    expect(runner.runs).toHaveLength(1);
    expect(service.toolCalls()[0]).toMatchObject({ status: 'complete', result: '3 documents' });
  });

  it('renders reasoning as a thinking step and closes it when reasoning ends', async () => {
    runner.script(async (subscriber, fake) => {
      const params = subscriberParams(fake);
      await subscriber.onReasoningMessageContentEvent?.({
        event: { type: 'REASONING_MESSAGE_CONTENT', messageId: 'r1', delta: 'weighing' } as never,
        reasoningMessageBuffer: 'weighing options',
        ...params,
      });
      await subscriber.onReasoningMessageEndEvent?.({
        event: { type: 'REASONING_MESSAGE_END', messageId: 'r1' } as never,
        reasoningMessageBuffer: 'weighing options',
        ...params,
      });
    });
    const service = createService();

    service.send('hello');
    await flush();

    expect(service.thinkingSteps()).toEqual([
      { id: 'step:r1', label: 'Reasoning', status: 'done', detail: 'weighing options' },
    ]);
  });

  it('closes the deprecated thinking block on THINKING_END and ignores unknown events', async () => {
    runner.script(async (subscriber, fake) => {
      const params = subscriberParams(fake);
      await subscriber.onEvent?.({
        event: { type: 'THINKING_START', title: 'Planning' } as never,
        ...params,
      });
      await subscriber.onEvent?.({ event: { type: 'THINKING_END' } as never, ...params });
      await subscriber.onEvent?.({ event: { type: 'RAW' } as never, ...params });
    });
    const service = createService();

    service.send('hello');
    await flush();

    expect(service.thinkingSteps()).toEqual([
      { id: 'thinking', label: 'Planning', status: 'done' },
    ]);
  });

  it('takes shared state from a snapshot as well as from a delta', async () => {
    runner.script(async (subscriber, fake) => {
      const params = subscriberParams(fake);
      await subscriber.onStateSnapshotEvent?.({
        event: { type: 'STATE_SNAPSHOT', snapshot: {} } as never,
        ...params,
        state: { view: 'grid' },
      });
      await subscriber.onStateChanged?.({ ...params, state: { view: 'list' } });
    });
    const service = createService();

    service.send('hello');
    await flush();

    expect(service.sharedState()).toEqual({ view: 'list' });
  });

  it('renders the text parts of a multi-part user message and drops the rest', async () => {
    runner.script(async (subscriber, fake) => {
      fake.addMessage({
        id: 'u2',
        role: 'user',
        content: [
          { type: 'text', text: 'what is in this?' },
          { type: 'image', image: 'data:image/png;base64,AAA' },
        ],
      } as never);
      await subscriber.onMessagesChanged?.({ ...subscriberParams(fake), messages: fake.messages });
    });
    const service = createService();

    service.send('hello');
    await flush();

    expect(service.messages().map((m) => m.content)).toContain('what is in this?');
    expect(service.messages().some((m) => m.content.includes('base64'))).toBe(false);
  });

  describe('gateway-raised interrupts', () => {
    /** A run that pauses on an interrupt that is not a frontend tool call. */
    function interruptingRun(id: string) {
      return async (subscriber: AgentSubscriber, fake: FakeAgentRunner) => {
        await fake.finishRun(subscriber, [
          {
            id,
            reason: 'confirmDeletion',
            message: 'Delete 3 documents?',
            metadata: { count: 3 },
          } as Interrupt,
        ]);
      };
    }

    it('raises the interrupt as an approval the user has to answer', async () => {
      runner.script(interruptingRun('int-1'));
      const service = createService();

      service.send('delete them');
      await flush();

      expect(service.approvals()).toEqual([
        {
          id: 'int-1',
          kind: 'interrupt',
          toolName: 'confirmDeletion',
          summary: 'Delete 3 documents?',
          args: { count: 3 },
        },
      ]);
      expect(runner.runs).toHaveLength(1);
    });

    it('resumes the paused run once the user approves', async () => {
      runner.script(interruptingRun('int-1'), answeringRun('m1', 'Deleted.'));
      const service = createService();

      service.send('delete them');
      await flush();
      service.respondToApproval('int-1', true);
      await flush();

      expect(service.approvals()).toEqual([]);
      expect(runner.runs).toHaveLength(2);
      expect(runner.runs[1].resume).toEqual([
        { interruptId: 'int-1', status: 'resolved', payload: { approved: true } },
      ]);
      // Nothing was called in the browser, so nothing may claim a tool result.
      expect(runner.messages.some((m) => m.role === 'tool')).toBe(false);
    });

    it('resumes with a cancellation when the user declines', async () => {
      runner.script(interruptingRun('int-1'), answeringRun('m1', 'Left them alone.'));
      const service = createService();

      service.send('delete them');
      await flush();
      service.respondToApproval('int-1', false);
      await flush();

      expect(runner.runs[1].resume).toEqual([{ interruptId: 'int-1', status: 'cancelled' }]);
      expect(service.messages().some((m) => m.content === 'Left them alone.')).toBe(true);
    });

    it('ignores an answer to an approval that is no longer open', async () => {
      runner.script(answeringRun('m1', 'ok'));
      const service = createService();

      service.send('hello');
      await flush();
      service.respondToApproval('does-not-exist', true);
      await flush();

      expect(runner.runs).toHaveLength(1);
    });
  });

  /**
   * The gateway's real shape for a frontend tool: `TOOL_CALL_CHUNK` frames *and* an
   * interrupt for the same `toolCallId`. Every test in here would have passed before the
   * fix if the double had emitted only one of the two, which is exactly why it did not
   * catch either defect.
   */
  describe('a frontend tool call that also arrives as an interrupt', () => {
    it('models the SDK refusing to start a run that leaves an interrupt unanswered', async () => {
      runner.pendingInterrupts = [{ id: 'call-1', reason: 'applyMetadata' } as Interrupt];

      await expect(runner.runAgent({})).rejects.toThrow(
        'Thread has 1 pending interrupt(s) not addressed by resume: call-1',
      );
      await expect(
        runner.runAgent({ resume: [{ interruptId: 'call-1', status: 'cancelled' }] }),
      ).resolves.toBeDefined();
    });

    it('runs a read-only tool and answers its interrupt, so the next run can start', async () => {
      runner.script(
        clientToolTurn('call-1', 'navigateTo', { route: '/doc/abc' }),
        answeringRun('m1', 'Opened it.'),
      );
      const service = createService();
      const handler = vi.fn().mockReturnValue('Navigated to /doc/abc.');
      service.registerToolHandler('navigateTo', handler);

      service.send('open abc');
      await flush();

      expect(handler).toHaveBeenCalledTimes(1);
      // A read-only tool needs no verdict, so it must not raise a card at all.
      expect(service.approvals()).toEqual([]);
      expect(runner.runs).toHaveLength(2);
      expect(runner.runs[1].resume).toEqual([
        {
          interruptId: 'call-1',
          status: 'resolved',
          payload: { result: 'Navigated to /doc/abc.' },
        },
      ]);
      // Both forms are sent; the gateway ignores the resume entry the message answered.
      expect(runner.messages.find((m) => m.role === 'tool')).toMatchObject({
        toolCallId: 'call-1',
        content: 'Navigated to /doc/abc.',
      });
      expect(service.error()).toBeNull();
    });

    it('raises one approval, not one per channel, for the same decision', async () => {
      runner.script(
        clientToolTurn(
          'call-1',
          'applyMetadata',
          { docId: 'doc-1', properties: { 'dc:title': 'New' } },
          'Rename Contract A to New?',
        ),
      );
      const service = createService();
      service.registerToolHandler('applyMetadata', vi.fn());

      service.send('rename doc-1');
      await flush();

      expect(service.approvals()).toEqual([
        {
          id: 'call-1',
          kind: 'interrupt',
          toolName: 'applyMetadata',
          summary: 'Rename Contract A to New?',
          // Read from `metadata.args`, so the card shows arguments rather than the
          // gateway's `kind`/`toolName` bookkeeping.
          args: { docId: 'doc-1', properties: { 'dc:title': 'New' } },
        },
      ]);
      expect(service.toolCalls()[0].status).toBe('awaiting-approval');
    });

    it('runs the approved write and answers the interrupt with the result', async () => {
      runner.script(
        clientToolTurn('call-1', 'applyMetadata', {
          docId: 'doc-1',
          properties: { 'dc:title': 'New' },
        }),
        answeringRun('m1', 'Renamed.'),
      );
      const service = createService();
      const handler = vi.fn().mockResolvedValue('Updated 1 propert(ies) on doc-1.');
      service.registerToolHandler('applyMetadata', handler);

      service.send('rename doc-1');
      await flush();
      service.respondToApproval('call-1', true);
      await flush();

      // The defect this replaces answered the interrupt and never called the handler,
      // so the model was told the write succeeded and nothing was written.
      expect(handler).toHaveBeenCalledWith({ docId: 'doc-1', properties: { 'dc:title': 'New' } });
      expect(runner.messages.find((m) => m.role === 'tool')?.content).toBe(
        'Updated 1 propert(ies) on doc-1.',
      );
      expect(runner.runs[1].resume).toEqual([
        {
          interruptId: 'call-1',
          status: 'resolved',
          payload: { approved: true, result: 'Updated 1 propert(ies) on doc-1.' },
        },
      ]);
      expect(service.toolCalls()[0].status).toBe('complete');
      expect(service.error()).toBeNull();
    });

    it('never calls the handler when the user declines, and cancels the interrupt', async () => {
      runner.script(
        clientToolTurn('call-1', 'applyMetadata', { docId: 'doc-1', properties: {} }),
        answeringRun('m1', 'Left it alone.'),
      );
      const service = createService();
      const handler = vi.fn();
      service.registerToolHandler('applyMetadata', handler);

      service.send('rename doc-1');
      await flush();
      service.respondToApproval('call-1', false);
      await flush();

      expect(handler).not.toHaveBeenCalled();
      expect(runner.runs[1].resume).toEqual([{ interruptId: 'call-1', status: 'cancelled' }]);
      expect(service.toolCalls()[0].status).toBe('rejected');
    });

    it('holds the turn until every open interrupt has an answer', async () => {
      runner.script(
        async (subscriber, fake) => {
          await toolCall('call-nav', 'navigateTo', { route: '/doc/abc' })(subscriber, fake);
          await toolCall('call-write', 'applyMetadata', { docId: 'doc-1', properties: {} })(
            subscriber,
            fake,
          );
          await fake.finishRun(subscriber, [
            clientToolInterrupt('call-nav', 'navigateTo', { route: '/doc/abc' }),
            clientToolInterrupt('call-write', 'applyMetadata', { docId: 'doc-1', properties: {} }),
          ]);
        },
        answeringRun('m1', 'Done.'),
      );
      const service = createService();
      service.registerToolHandler('navigateTo', () => 'Navigated to /doc/abc.');
      const write = vi.fn().mockReturnValue('Updated 0 propert(ies) on doc-1.');
      service.registerToolHandler('applyMetadata', write);

      service.send('open abc and rename it');
      await flush();

      // Resuming with only the navigation answered would be refused by the SDK.
      expect(runner.runs).toHaveLength(1);
      expect(service.approvals().map((request) => request.id)).toEqual(['call-write']);

      service.respondToApproval('call-write', true);
      await flush();

      expect(write).toHaveBeenCalled();
      expect(runner.runs).toHaveLength(2);
      expect(runner.runs[1].resume?.map((entry) => entry.interruptId).sort()).toEqual([
        'call-nav',
        'call-write',
      ]);
    });

    /**
     * A gated server write, as `describeMutationApproval` now builds it. The phrasing and
     * the resolved documents are what stop the panel keeping a table of verbs keyed on
     * tool name, and a table like that lies the moment a tool changes what it does
     * without changing its name.
     */
    function mutationInterrupt(metadata: Record<string, unknown>): Interrupt {
      return {
        id: 'call-1',
        reason: 'nuxeo.tagDocument',
        message: 'The assistant wants to run nuxeo.tagDocument, which changes content.',
        toolCallId: 'call-1',
        metadata: {
          kind: 'mutation_approval',
          toolName: 'nuxeo.tagDocument',
          args: { uid: 'doc-1', tags: ['urgent'] },
          ...metadata,
        },
      } as Interrupt;
    }

    function raising(interrupt: Interrupt) {
      return async (subscriber: AgentSubscriber, fake: FakeAgentRunner) => {
        await fake.finishRun(subscriber, [interrupt]);
      };
    }

    it('carries the gateway’s phrasing and resolved targets onto the approval', async () => {
      runner.script(
        raising(
          mutationInterrupt({
            action: { action: 'Add tags to', subject: { arg: 'uid' } },
            targets: [{ uid: 'doc-1', title: 'Q3 supplier contract', type: 'File' }],
          }),
        ),
      );
      const service = createService();

      service.send('tag it');
      await flush();

      expect(service.approvals()[0]).toMatchObject({
        args: { uid: 'doc-1', tags: ['urgent'] },
        action: { action: 'Add tags to', subject: { arg: 'uid' } },
        targets: [{ uid: 'doc-1', title: 'Q3 supplier contract', type: 'File' }],
      });
    });

    // The distinction the panel acts on: an empty array means the gateway looked and
    // found nothing, which is not the same as the gateway not having looked.
    it('keeps an empty target list rather than dropping it', async () => {
      runner.script(raising(mutationInterrupt({ targets: [] })));
      const service = createService();

      service.send('tag it');
      await flush();

      expect(service.approvals()[0].targets).toEqual([]);
      expect(service.approvals()[0].action).toBeUndefined();
    });

    // Everything on an interrupt is producer-supplied. A malformed entry renders the
    // fallback — the sentence and the bare uid — rather than a half-built row.
    it('ignores a target that is missing its uid or its title', async () => {
      runner.script(
        raising(
          mutationInterrupt({
            targets: [{ uid: 'doc-1' }, { title: 'Nameless' }, { uid: 'doc-2', title: 'Real' }],
            action: { subject: { arg: 'uid' } },
          }),
        ),
      );
      const service = createService();

      service.send('tag it');
      await flush();

      expect(service.approvals()[0].targets).toEqual([{ uid: 'doc-2', title: 'Real' }]);
      expect(service.approvals()[0].action).toBeUndefined();
    });

    /**
     * A7 stage 3: the interrupt-form channel.
     *
     * The property every test here circles is that a form is **an approval that
     * carries values**, not a second kind of answer. It grants on
     * `approved === true` and on nothing else, and `fields` rides along on that
     * same grant — so the safety argument is the one already made for the card,
     * unchanged, rather than a new one.
     */
    describe('a gated write that declares a form', () => {
      /** A declaration exactly as `interruptFormFor` publishes one. */
      function formDeclaration(overrides: Record<string, unknown> = {}) {
        return {
          component: 'documentMetadataForm',
          props: {
            toolCallId: 'call-1',
            target: { uid: 'doc-1', title: 'Q3 supplier contract' },
            title: 'Edit metadata',
            submitLabel: 'Save changes',
            fields: [
              {
                name: 'dc:title',
                label: 'Title',
                type: 'text',
                editable: true,
                required: true,
                value: 'Title the model chose',
                source: 'proposed',
              },
              {
                name: 'dc:creator',
                label: 'Created by',
                type: 'text',
                value: 'jdoe',
                source: 'current',
              },
            ],
            ...overrides,
          },
        };
      }

      it('carries the validated form onto the approval the user answers', async () => {
        runner.script(raising(mutationInterrupt({ render: formDeclaration() })));
        const service = createService();

        service.send('retitle doc-1');
        await flush();

        expect(service.approvals()[0].form).toMatchObject({
          name: 'documentMetadataForm',
          props: { toolCallId: 'call-1', target: { uid: 'doc-1', title: 'Q3 supplier contract' } },
        });
      });

      it('grants with the submitted values on the same resume entry a card produces', async () => {
        runner.script(
          raising(mutationInterrupt({ render: formDeclaration() })),
          answeringRun('m1', 'Renamed it.'),
        );
        const service = createService();

        service.send('retitle doc-1');
        await flush();
        service.submitApprovalForm('call-1', { 'dc:title': 'A title the user typed' });
        await flush();

        // `approved: true` is what grants; `fields` is that same grant carrying
        // what the user typed. Not a second way to authorise a write.
        expect(runner.runs[1].resume).toEqual([
          {
            interruptId: 'call-1',
            status: 'resolved',
            payload: { approved: true, fields: { 'dc:title': 'A title the user typed' } },
          },
        ]);
      });

      it('omits fields entirely when the same write is approved from the card', async () => {
        runner.script(
          raising(mutationInterrupt({ render: formDeclaration() })),
          answeringRun('m1', 'Done.'),
        );
        const service = createService();

        service.send('retitle doc-1');
        await flush();
        service.respondToApproval('call-1', true);
        await flush();

        // The key is absent rather than an empty object: an empty `fields` would
        // be a submission overwriting every editable field with nothing, where
        // omitting it runs the held arguments unchanged.
        expect(runner.runs[1].resume).toEqual([
          { interruptId: 'call-1', status: 'resolved', payload: { approved: true } },
        ]);
      });

      it('cancels rather than submitting when the form is dismissed', async () => {
        runner.script(
          raising(mutationInterrupt({ render: formDeclaration() })),
          answeringRun('m1', 'Left it alone.'),
        );
        const service = createService();

        service.send('retitle doc-1');
        await flush();
        service.respondToApproval('call-1', false);
        await flush();

        expect(runner.runs[1].resume).toEqual([{ interruptId: 'call-1', status: 'cancelled' }]);
      });

      it('refuses a second submission for a decision already answered', async () => {
        runner.script(
          raising(mutationInterrupt({ render: formDeclaration() })),
          answeringRun('m1', 'Done.'),
        );
        const service = createService();

        service.send('retitle doc-1');
        await flush();
        service.submitApprovalForm('call-1', { 'dc:title': 'First' });
        service.submitApprovalForm('call-1', { 'dc:title': 'Second' });
        await flush();

        // One interrupt, one form, one submission, one write. The verdict guard
        // is what makes a double click a no-op rather than a second entry.
        expect(runner.runs[1].resume).toEqual([
          {
            interruptId: 'call-1',
            status: 'resolved',
            payload: { approved: true, fields: { 'dc:title': 'First' } },
          },
        ]);
      });

      /**
       * What the settled card shows.
       *
       * `AgentToolCall.args` is built once from the interrupt and settling used to patch
       * only `status`, so a ticked card kept the arguments the *model* proposed for the
       * life of the transcript. The prose beneath it correctly reported what was saved,
       * so the two disagreed — and a card, being structured and sitting beside a tick,
       * reads as the authoritative one. It is visible in this stage's own screenshot:
       * the settled card showed a description the user had deleted.
       *
       * This is the same rule as `submittedByUser`, applied to the screen instead of to
       * the model: a value nobody attributes is read as the system's own. The browser
       * already held everything needed to show the truth.
       */
      describe('what the card shows once a form has settled it', () => {
        const heldArgs = {
          uid: 'doc-1',
          properties: {
            'dc:title': 'Title the model chose',
            'dc:description': 'Description the model chose',
          },
        };

        /**
         * One run that streams the write *and* interrupts it, which is what a real
         * gated write does: the card comes from the streamed call, and the interrupt
         * carries the form. Testing the card without the stream would leave nothing
         * to assert on, because there would be no card.
         */
        function streamedAndInterrupted(render: unknown) {
          return async (subscriber: AgentSubscriber, fake: FakeAgentRunner) => {
            await toolCall('call-1', 'nuxeo.updateMetadata', heldArgs)(subscriber, fake);
            await fake.finishRun(subscriber, [
              {
                id: 'call-1',
                reason: 'nuxeo.updateMetadata',
                message: 'The assistant wants to run nuxeo.updateMetadata, which changes content.',
                toolCallId: 'call-1',
                metadata: {
                  kind: 'mutation_approval',
                  toolName: 'nuxeo.updateMetadata',
                  args: heldArgs,
                  render,
                },
              } as Interrupt,
            ]);
          };
        }

        function withValuesArg(overrides: Record<string, unknown> = {}) {
          return formDeclaration({ valuesArg: 'properties', ...overrides });
        }

        it('shows the values the user submitted, not the ones the model proposed', async () => {
          runner.script(streamedAndInterrupted(withValuesArg()), answeringRun('m1', 'Renamed it.'));
          const service = createService();

          service.send('retitle doc-1');
          await flush();
          service.submitApprovalForm('call-1', { 'dc:title': 'A title the user typed' });
          await flush();

          expect(service.toolCalls()[0].args['properties']).toEqual({
            'dc:title': 'A title the user typed',
            // Untouched by the submission, so still the model's — and still part of
            // what ran, which is why it stays on the card.
            'dc:description': 'Description the model chose',
          });
        });

        it('shows a field the user cleared as cleared', async () => {
          // The case from the screenshot. `null` is what an emptied control submits,
          // and the card previously kept displaying the text that was deleted.
          runner.script(streamedAndInterrupted(withValuesArg()), answeringRun('m1', 'Done.'));
          const service = createService();

          service.send('retitle doc-1');
          await flush();
          service.submitApprovalForm('call-1', {
            'dc:title': 'Kept',
            'dc:description': null,
          });
          await flush();

          expect(service.toolCalls()[0].args['properties']).toEqual({
            'dc:title': 'Kept',
            'dc:description': null,
          });
        });

        it('leaves the proposal alone when the write is approved from the card', async () => {
          // Nothing was authored by the user, so there is nothing to re-attribute.
          runner.script(streamedAndInterrupted(withValuesArg()), answeringRun('m1', 'Done.'));
          const service = createService();

          service.send('retitle doc-1');
          await flush();
          service.respondToApproval('call-1', true);
          await flush();

          expect(service.toolCalls()[0].args['properties']).toEqual({
            'dc:title': 'Title the model chose',
            'dc:description': 'Description the model chose',
          });
        });

        it('leaves the proposal alone when the declaration named no values argument', async () => {
          // Degrades to the pre-existing behaviour rather than guessing which
          // argument the values belong to.
          runner.script(streamedAndInterrupted(formDeclaration()), answeringRun('m1', 'Done.'));
          const service = createService();

          service.send('retitle doc-1');
          await flush();
          service.submitApprovalForm('call-1', { 'dc:title': 'A title the user typed' });
          await flush();

          expect(service.toolCalls()[0].args['properties']).toEqual({
            'dc:title': 'Title the model chose',
            'dc:description': 'Description the model chose',
          });
        });

        it('does not invent an argument the held call never had', async () => {
          // `valuesArg` is display-only and cannot create a value anywhere. The
          // gateway rebuilds the executed arguments from the tool's own declaration;
          // nothing here is sent back.
          runner.script(
            streamedAndInterrupted(withValuesArg({ valuesArg: 'somethingElse' })),
            answeringRun('m1', 'Done.'),
          );
          const service = createService();

          service.send('retitle doc-1');
          await flush();
          service.submitApprovalForm('call-1', { 'dc:title': 'A title the user typed' });
          await flush();

          expect(service.toolCalls()[0].args).not.toHaveProperty('somethingElse');
          expect(service.toolCalls()[0].args['properties']).toEqual({
            'dc:title': 'Title the model chose',
            'dc:description': 'Description the model chose',
          });
        });

        it('still records the settled status', async () => {
          runner.script(streamedAndInterrupted(withValuesArg()), answeringRun('m1', 'Done.'));
          const service = createService();

          service.send('retitle doc-1');
          await flush();
          service.submitApprovalForm('call-1', { 'dc:title': 'Typed' });
          await flush();

          expect(service.toolCalls()[0].status).toBe('complete');
        });
      });

      it('refuses to submit values for a write that declared no form', async () => {
        runner.script(raising(mutationInterrupt({})));
        const service = createService();

        service.send('tag doc-1');
        await flush();
        service.submitApprovalForm('call-1', { 'dc:title': 'Smuggled' });
        await flush();

        // The gateway would refuse this as `form_not_declared`. Not asking is
        // better than asking and being refused: the decision stays open on the
        // card, rather than the model having to explain a refusal the browser
        // could have avoided.
        expect(service.approvals()[0].verdict).toBeUndefined();
        expect(runner.runs).toHaveLength(1);
      });

      it.each([
        [
          'names a component this application does not register',
          { component: 'documentDeleteForm' },
        ],
        ['is not an object at all', 'documentMetadataForm'],
      ])('falls back to the approval card when the declaration %s', async (_label, render) => {
        runner.script(raising(mutationInterrupt({ render })));
        const service = createService();

        service.send('retitle doc-1');
        await flush();

        // The card is a fully consented write showing the same arguments, so this
        // costs a nicer affordance and never costs safety.
        expect(service.approvals()[0].form).toBeUndefined();
        expect(service.approvals()[0].args).toEqual({ uid: 'doc-1', tags: ['urgent'] });
      });

      it('refuses a declaration naming an interrupt other than its own', async () => {
        runner.script(
          raising(mutationInterrupt({ render: formDeclaration({ toolCallId: 'call-other' }) })),
        );
        const service = createService();

        service.send('retitle doc-1');
        await flush();

        expect(service.approvals()[0].form).toBeUndefined();
      });

      it('never renders the declaration as an argument line', async () => {
        runner.script(raising(mutationInterrupt({ render: formDeclaration() })));
        const service = createService();

        service.send('retitle doc-1');
        await flush();

        // `render` is protocol bookkeeping. Left in `args` it would print the
        // whole field set as text under the form that already shows it.
        expect(service.approvals()[0].args).not.toHaveProperty('render');
      });

      it('refuses a form on a frontend-tool interrupt, whatever it declares', async () => {
        runner.script(
          clientToolTurn('call-1', 'applyMetadata', { docId: 'doc-1', properties: {} }),
        );
        const service = createService();
        service.registerToolHandler('applyMetadata', () => 'wrote it');

        service.send('rename doc-1');
        await flush();

        // A browser-executed write runs from its own streamed arguments, so
        // submitted values would be silently dropped and the user would be told a
        // change had been made that had not. The gateway only attaches a
        // declaration to a write it owns; this fails closed if that ever changes.
        expect(service.approvals()[0].form).toBeUndefined();
      });
    });

    it('treats a new message as declining a decision the user skipped', async () => {
      runner.script(
        clientToolTurn('call-1', 'applyMetadata', { docId: 'doc-1', properties: {} }),
        answeringRun('m1', 'Sure, something else then.'),
      );
      const service = createService();
      const handler = vi.fn();
      service.registerToolHandler('applyMetadata', handler);

      service.send('rename doc-1');
      await flush();
      service.send('never mind, what is in my trash?');
      await flush();

      expect(handler).not.toHaveBeenCalled();
      expect(service.approvals()).toEqual([]);
      // Without this the SDK would refuse the run and the thread would be unusable.
      expect(runner.runs[1].resume).toEqual([{ interruptId: 'call-1', status: 'cancelled' }]);
      expect(service.error()).toBeNull();
    });
  });
});
