import { EventSchemas, EventType, type BaseEvent, type RunAgentInput } from '@ag-ui/core';
import { describe, expect, it } from 'vitest';

import { NuxeoRequestError, NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import { throughClientChunkTransform } from '../testing/ag-ui-client-transform';
import {
  FailingModelClient,
  jsonResponse,
  recordingFetch,
  ScriptedModelClient,
  testCaller,
  testConfig,
  testLogger,
  TEST_NUXEO_BASE_URL,
} from '../testing/test-doubles';
import { ToolRegistry } from '../tools/tool-registry';
import type { AgentTool } from '../tools/tool.types';
import type { ModelStreamEvent } from './model-client';
import {
  CLIENT_TOOL_INTERRUPT_REASON,
  runAgent,
  THINKING_EVENT_NAME,
  toUserFacingError,
} from './run-agent';

type Recorded = BaseEvent & Record<string, unknown>;

function input(overrides: Partial<RunAgentInput> = {}): RunAgentInput {
  return {
    threadId: 'thread-1',
    runId: 'run-1',
    messages: [{ id: 'm1', role: 'user', content: 'find my contracts' }],
    tools: [],
    context: [],
    ...overrides,
  } as RunAgentInput;
}

const echoTool: AgentTool = {
  name: 'nuxeo.echo',
  description: 'echo',
  mutating: false,
  parameters: { type: 'object', properties: {} },
  execute: async (args) => ({ echoed: args }),
};

interface HarnessOptions {
  readonly turns: ModelStreamEvent[][];
  readonly tools?: readonly AgentTool[];
  readonly runInput?: RunAgentInput;
  readonly signal?: AbortSignal;
  readonly maxSteps?: number;
}

async function run(options: HarnessOptions): Promise<Recorded[]> {
  const events: Recorded[] = [];
  const recorder = recordingFetch(() => jsonResponse({}));
  const registry = new ToolRegistry();
  for (const tool of options.tools ?? []) registry.register(tool);

  let counter = 0;
  await runAgent(
    {
      config: testConfig(options.maxSteps === undefined ? {} : { maxSteps: options.maxSteps }),
      model: new ScriptedModelClient(options.turns),
      registry,
      nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
      logger: testLogger(),
      newId: () => `id-${(counter += 1)}`,
    },
    {
      input: options.runInput ?? input(),
      caller: testCaller(),
      emit: (event) => {
        events.push(event);
        return true;
      },
      signal: options.signal ?? new AbortController().signal,
    },
  );
  return events;
}

const types = (events: Recorded[]) => events.map((event) => event.type);

describe('runAgent event sequence', () => {
  it('emits RUN_STARTED first and RUN_FINISHED last for a text-only turn', async () => {
    const events = await run({
      turns: [
        [
          { type: 'text', delta: 'Hello ' },
          { type: 'text', delta: 'there' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    expect(types(events)).toEqual([
      EventType.RUN_STARTED,
      EventType.TEXT_MESSAGE_CHUNK,
      EventType.TEXT_MESSAGE_CHUNK,
      EventType.RUN_FINISHED,
    ]);
    expect(events[0]).toMatchObject({ threadId: 'thread-1', runId: 'run-1' });
  });

  /**
   * A run that suggests nothing says nothing about the selection.
   *
   * This was briefly the other way round — every run opened with an empty
   * proposal slice so the state channel was never silent. It retracted live
   * suggestions, because a frontend tool hands the turn back and the
   * continuation arrives as a second run. Retraction is the browser's job now,
   * and this pins the gateway's half of that.
   */
  it('says nothing about the selection on a run that suggests nothing', async () => {
    const events = await run({
      model: new ScriptedModelClient([[{ type: 'text', delta: 'hi' }]]),
    });

    expect(types(events)).not.toContain(EventType.STATE_SNAPSHOT);
    expect(types(events)).not.toContain(EventType.STATE_DELTA);
  });

  // SDK rule 1: the first chunk of a message must carry a messageId, and later
  // chunks must not repeat the opening fields.
  it('puts messageId and role on the first text chunk only', async () => {
    const events = await run({
      turns: [
        [
          { type: 'text', delta: 'a' },
          { type: 'text', delta: 'b' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    expect(events[1]).toMatchObject({ messageId: 'id-1', role: 'assistant', delta: 'a' });
    expect(events[2]).toEqual({ type: EventType.TEXT_MESSAGE_CHUNK, delta: 'b' });
  });

  // SDK rules 2 and 3, and the spike's hard-won finding: a tool call closes the
  // open text message, so the text after it needs a *new* messageId or the
  // transcript renders as one message and then silently splits.
  it('allocates a fresh messageId for the text segment after a tool call', async () => {
    const events = await run({
      tools: [echoTool],
      turns: [
        [
          { type: 'text', delta: 'Looking… ' },
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'tool-call-delta', index: 0, delta: '{}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'Found it.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const textChunks = events.filter((event) => event.type === EventType.TEXT_MESSAGE_CHUNK);
    expect(textChunks[0]?.['messageId']).toBeDefined();
    expect(textChunks[1]?.['messageId']).toBeDefined();
    expect(textChunks[0]?.['messageId']).not.toBe(textChunks[1]?.['messageId']);
  });

  it('opens a tool call with both id and name, then sends deltas alone', async () => {
    const events = await run({
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'tool-call-delta', index: 0, delta: '{"a"' },
          { type: 'tool-call-delta', index: 0, delta: ':1}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ],
    });

    const chunks = events.filter((event) => event.type === EventType.TOOL_CALL_CHUNK);
    expect(chunks[0]).toMatchObject({ toolCallId: 'call-1', toolCallName: 'nuxeo.echo' });
    expect(chunks[0]?.['delta']).toBeUndefined();
    expect(chunks[1]).toEqual({
      type: EventType.TOOL_CALL_CHUNK,
      toolCallId: 'call-1',
      delta: '{"a"',
    });
    expect(chunks[2]?.['toolCallName']).toBeUndefined();
  });

  it('executes the tool and emits TOOL_CALL_RESULT with stringified JSON content', async () => {
    const events = await run({
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'tool-call-delta', index: 0, delta: '{"a":1}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ],
    });

    const result = events.find((event) => event.type === EventType.TOOL_CALL_RESULT);
    expect(result).toMatchObject({ toolCallId: 'call-1', role: 'tool' });
    expect(typeof result?.['content']).toBe('string');
    expect(JSON.parse(String(result?.['content']))).toEqual({ echoed: { a: 1 } });
    expect(result?.['messageId']).toBeDefined();
  });

  it('emits exactly one terminal event per run', async () => {
    const events = await run({
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'done' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const terminal = types(events).filter(
      (type) => type === EventType.RUN_FINISHED || type === EventType.RUN_ERROR,
    );
    expect(terminal).toEqual([EventType.RUN_FINISHED]);
  });
});

describe('runAgent human-in-the-loop handling', () => {
  it('hands a client-declared tool back to the browser instead of executing it', async () => {
    const events = await run({
      runInput: input({
        tools: [
          {
            name: 'confirmAction',
            description: 'Ask the user to approve.',
            parameters: { type: 'object', properties: {} },
          },
        ],
      }),
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-9', name: 'confirmAction' },
          { type: 'tool-call-delta', index: 0, delta: '{"summary":"Move 3 files"}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ],
    });

    const finished = events.at(-1);
    expect(finished?.type).toBe(EventType.RUN_FINISHED);
    expect(finished?.['outcome']).toEqual({
      type: 'interrupt',
      interrupts: [
        {
          id: 'call-9',
          // The client renders `reason` as the tool name and `message` as the
          // prompt. A protocol constant in either slot reaches the user.
          reason: 'confirmAction',
          message: 'Move 3 files',
          toolCallId: 'call-9',
          metadata: {
            kind: CLIENT_TOOL_INTERRUPT_REASON,
            toolName: 'confirmAction',
            args: { summary: 'Move 3 files' },
          },
        },
      ],
    });
  });

  it('falls back to a readable prompt when the tool call carries no summary', async () => {
    const events = await run({
      runInput: input({
        tools: [{ name: 'selectDocuments', description: 'Pick.', parameters: {} }],
      }),
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-4', name: 'selectDocuments' },
          { type: 'tool-call-delta', index: 0, delta: '{"docIds":["a"]}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ],
    });

    const interrupts = (events.at(-1)?.['outcome'] as { interrupts: Record<string, unknown>[] })
      .interrupts;
    expect(interrupts[0]['message']).toBe('The assistant wants to run selectDocuments.');
    expect(interrupts[0]['metadata']).toMatchObject({ args: { docIds: ['a'] } });
  });

  it('still opens the interrupt when the model streams malformed arguments', async () => {
    const events = await run({
      runInput: input({ tools: [{ name: 'confirmAction', description: 'Ask.', parameters: {} }] }),
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-5', name: 'confirmAction' },
          { type: 'tool-call-delta', index: 0, delta: '{"summary": ' },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ],
    });

    const interrupts = (events.at(-1)?.['outcome'] as { interrupts: Record<string, unknown>[] })
      .interrupts;
    expect(interrupts[0]).toMatchObject({ id: 'call-5', reason: 'confirmAction' });
    expect(interrupts[0]['metadata']).toMatchObject({ args: {} });
  });

  // A write sharing a turn with the confirmAction meant to gate it gets its own
  // interrupt, not a deferral: the confirmation the model asked for is its own
  // decision, and the write is gated whether or not the model asked at all.
  it('raises a separate approval for a write called alongside a client tool', async () => {
    let executed = 0;
    const mutating: AgentTool = {
      name: 'nuxeo.mutate',
      description: 'mutate',
      parameters: { type: 'object', properties: {} },
      mutating: true,
      execute: async () => {
        executed += 1;
        return { ok: true };
      },
    };

    const events = await run({
      tools: [mutating],
      runInput: input({
        tools: [{ name: 'confirmAction', description: 'Ask.', parameters: {} }],
      }),
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'confirmAction' },
          { type: 'tool-call-start', index: 1, id: 'call-2', name: 'nuxeo.mutate' },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ],
    });

    expect(executed).toBe(0);
    expect(events.some((event) => event.type === EventType.TOOL_CALL_RESULT)).toBe(false);
    const outcome = events.at(-1)?.['outcome'] as { interrupts: Record<string, unknown>[] };
    expect(outcome.interrupts.map((interrupt) => interrupt['id'])).toEqual(['call-1', 'call-2']);
  });

  // A read is safe to run but pointless before the decision lands, so it is
  // deferred and the model calls it again once the run resumes.
  it('defers a read-only server tool that shares a turn with a decision', async () => {
    const events = await run({
      tools: [echoTool],
      runInput: input({
        tools: [{ name: 'confirmAction', description: 'Ask.', parameters: {} }],
      }),
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'confirmAction' },
          { type: 'tool-call-start', index: 1, id: 'call-2', name: 'nuxeo.echo' },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ],
    });

    const deferred = events.find((event) => event.type === EventType.TOOL_CALL_RESULT);
    expect(deferred).toMatchObject({ toolCallId: 'call-2' });
    expect(JSON.parse(String(deferred?.['content']))).toMatchObject({ status: 'deferred' });
  });

  it('resumes from a ResumeEntry answering the interrupt id', async () => {
    const model = new ScriptedModelClient([
      [
        { type: 'text', delta: 'Moved them.' },
        { type: 'finish', reason: 'stop' },
      ],
    ]);
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model,
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input({
          messages: [
            { id: 'm1', role: 'user', content: 'move them' },
            {
              id: 'm2',
              role: 'assistant',
              content: '',
              toolCalls: [
                {
                  id: 'call-9',
                  type: 'function',
                  function: { name: 'confirmAction', arguments: '{}' },
                },
              ],
            },
          ],
          resume: [{ interruptId: 'call-9', status: 'resolved', payload: { confirmed: true } }],
        }),
        caller: testCaller(),
        emit: () => true,
        signal: new AbortController().signal,
      },
    );

    expect(model.requests[0]?.messages.at(-1)).toEqual({
      role: 'tool',
      toolCallId: 'call-9',
      content: '{"status":"resolved","result":{"confirmed":true}}',
    });
  });

  it('does not answer an interrupt twice when the client sends both forms', async () => {
    const model = new ScriptedModelClient([[{ type: 'finish', reason: 'stop' }]]);
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model,
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input({
          messages: [
            { id: 'm1', role: 'user', content: 'move them' },
            { id: 'm2', role: 'tool', content: '{"confirmed":true}', toolCallId: 'call-9' },
          ],
          resume: [{ interruptId: 'call-9', status: 'resolved', payload: { confirmed: true } }],
        }),
        caller: testCaller(),
        emit: () => true,
        signal: new AbortController().signal,
      },
    );

    const toolMessages = (model.requests[0]?.messages ?? []).filter((m) => m.role === 'tool');
    expect(toolMessages).toHaveLength(1);
  });

  it('passes a cancelled interrupt to the model as a refusal', async () => {
    const model = new ScriptedModelClient([[{ type: 'finish', reason: 'stop' }]]);
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model,
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input({
          resume: [{ interruptId: 'call-9', status: 'cancelled' }],
        }),
        caller: testCaller(),
        emit: () => true,
        signal: new AbortController().signal,
      },
    );

    expect(model.requests[0]?.messages.at(-1)).toEqual({
      role: 'tool',
      toolCallId: 'call-9',
      content: '{"status":"cancelled"}',
    });
  });

  it('offers both server and client tools to the model', async () => {
    const model = new ScriptedModelClient([[{ type: 'finish', reason: 'stop' }]]);
    const registry = new ToolRegistry().register(echoTool);
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model,
        registry,
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input({
          tools: [{ name: 'navigateTo', description: 'Go somewhere.', parameters: {} }],
        }),
        caller: testCaller(),
        emit: () => true,
        signal: new AbortController().signal,
      },
    );

    const offered = model.requests[0]?.tools.map((tool) => tool.function.name);
    expect(offered).toEqual(['nuxeo.echo', 'navigateTo']);
  });

  it('resumes from a tool message the client posted back', async () => {
    const model = new ScriptedModelClient([
      [
        { type: 'text', delta: 'Moved them.' },
        { type: 'finish', reason: 'stop' },
      ],
    ]);
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model,
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input({
          messages: [
            { id: 'm1', role: 'user', content: 'move them' },
            {
              id: 'm2',
              role: 'assistant',
              content: '',
              toolCalls: [
                {
                  id: 'call-9',
                  type: 'function',
                  function: { name: 'confirmAction', arguments: '{}' },
                },
              ],
            },
            { id: 'm3', role: 'tool', content: '{"confirmed":true}', toolCallId: 'call-9' },
          ],
        }),
        caller: testCaller(),
        emit: () => true,
        signal: new AbortController().signal,
      },
    );

    const sent = model.requests[0]?.messages ?? [];
    expect(sent.at(-1)).toEqual({
      role: 'tool',
      content: '{"confirmed":true}',
      toolCallId: 'call-9',
    });
  });

  it('passes application context to the model as a system message', async () => {
    const model = new ScriptedModelClient([[{ type: 'finish', reason: 'stop' }]]);
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model,
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input({ context: [{ description: 'Current page', value: '/browse' }] }),
        caller: testCaller(),
        emit: () => true,
        signal: new AbortController().signal,
      },
    );

    expect(JSON.stringify(model.requests[0]?.messages)).toContain('Current page: /browse');
  });
});

describe('runAgent failure and cancellation', () => {
  it('ends in RUN_ERROR with a clean message when the model call fails', async () => {
    const events: Recorded[] = [];
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model: new FailingModelClient(
          new Error('connect ECONNREFUSED 10.0.3.14:8443 while calling haip-internal'),
        ),
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input(),
        caller: testCaller(),
        emit: (event) => {
          events.push(event);
          return true;
        },
        signal: new AbortController().signal,
      },
    );

    const error = events.at(-1);
    expect(error?.type).toBe(EventType.RUN_ERROR);
    // ADR 001: no stack traces, no NXQL, no internal hostnames in what the user sees.
    expect(String(error?.['message'])).not.toMatch(/ECONNREFUSED|10\.0\.3\.14|haip-internal/);
    expect(error?.['code']).toBe('AGENT_ERROR');
  });

  // A failing tool is not a failing run: the model is told and usually recovers.
  it('reports a tool failure to the model rather than aborting the run', async () => {
    const failingTool: AgentTool = {
      name: 'nuxeo.boom',
      description: 'boom',
      mutating: false,
      parameters: { type: 'object', properties: {} },
      execute: async () => {
        throw new NuxeoRequestError(403, '/nuxeo/api/v1/id/secret', 'Privilege denied');
      },
    };

    const events = await run({
      tools: [failingTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.boom' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'You do not have access.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const result = events.find((event) => event.type === EventType.TOOL_CALL_RESULT);
    expect(JSON.parse(String(result?.['content']))).toEqual({
      error: 'You do not have permission to perform that action in Nuxeo.',
      code: 'NUXEO_FORBIDDEN',
    });
    expect(types(events).at(-1)).toBe(EventType.RUN_FINISHED);
  });

  it('tells the model when it called a tool that does not exist', async () => {
    const events = await run({
      runInput: input(),
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'tool-call-delta', index: 0, delta: 'not json' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ],
    });

    const result = events.find((event) => event.type === EventType.TOOL_CALL_RESULT);
    expect(JSON.parse(String(result?.['content']))).toMatchObject({
      error: 'Tool arguments were not valid JSON.',
    });
  });

  // ADR 001, cancellation: an aborted run emits no terminal event. The SDK
  // treats the closed socket as a normal abort, and a RUN_ERROR here would
  // surface a scary message for something the user did on purpose.
  it('emits no terminal event when the run is aborted', async () => {
    const controller = new AbortController();
    const events: Recorded[] = [];
    const recorder = recordingFetch(() => jsonResponse({}));

    await runAgent(
      {
        config: testConfig(),
        model: new FailingModelClient(new Error('aborted')),
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input(),
        caller: testCaller(),
        emit: (event) => {
          events.push(event);
          controller.abort();
          return true;
        },
        signal: controller.signal,
      },
    );

    // What matters is the absence of a terminal event: a cancelled run closes
    // the socket rather than sending RUN_FINISHED or RUN_ERROR.
    expect(types(events)).toEqual([EventType.RUN_STARTED]);
  });

  it('stops immediately when the client socket has already gone', async () => {
    const recorder = recordingFetch(() => jsonResponse({}));
    const emitted: Recorded[] = [];

    await runAgent(
      {
        config: testConfig(),
        model: new ScriptedModelClient([[{ type: 'text', delta: 'hi' }]]),
        registry: new ToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: input(),
        caller: testCaller(),
        emit: (event) => {
          emitted.push(event);
          return false;
        },
        signal: new AbortController().signal,
      },
    );

    expect(types(emitted)).toEqual([EventType.RUN_STARTED]);
  });

  it('stops at the configured step ceiling rather than looping forever', async () => {
    const toolCallTurn: ModelStreamEvent[] = [
      { type: 'tool-call-start', index: 0, id: 'call-x', name: 'nuxeo.echo' },
      { type: 'tool-call-delta', index: 0, delta: '{}' },
      { type: 'finish', reason: 'tool_calls' },
    ];

    const events = await run({
      maxSteps: 2,
      tools: [echoTool],
      turns: [toolCallTurn, toolCallTurn, toolCallTurn],
    });

    expect(events.at(-1)).toMatchObject({
      type: EventType.RUN_FINISHED,
      outcome: { type: 'success' },
      result: { stopReason: 'max_steps', steps: 2 },
    });
  });
});

/**
 * Citations reach the browser on their own `CUSTOM` event and nowhere else. The
 * client never reads `TOOL_CALL_RESULT` for them, so every assertion here stands
 * between a grounded answer and one whose sources vanish silently.
 */
describe('runAgent citation transport', () => {
  const groundedTool: AgentTool = {
    name: 'kd.ask',
    description: 'ask',
    mutating: false,
    parameters: { type: 'object', properties: {} },
    execute: async () => ({
      answer: 'Two contracts matched.',
      citations: [
        { objectId: 'src-1__doc-1', title: 'Contract A', excerpt: 'clause 4' },
        { objectId: 'src-1__doc-2', title: 'Contract B' },
      ],
    }),
  };

  /** Tool call, then the assistant text that cites its result. */
  const groundedTurns: ModelStreamEvent[][] = [
    [
      { type: 'tool-call-start', index: 0, id: 'call-1', name: 'kd.ask' },
      { type: 'tool-call-delta', index: 0, delta: '{}' },
      { type: 'finish', reason: 'tool_calls' },
    ],
    [
      { type: 'text', delta: 'Two contracts ' },
      { type: 'text', delta: 'matched.' },
      { type: 'finish', reason: 'stop' },
    ],
  ];

  it('emits the citations as a CUSTOM event the client recognises', async () => {
    const events = await run({ tools: [groundedTool], turns: groundedTurns });

    const custom = events.find((event) => event.type === EventType.CUSTOM);
    expect(custom?.['name']).toBe('citations');
    expect(custom?.['value']).toEqual({
      messageId: 'id-2',
      citations: [
        { uid: 'doc-1', title: 'Contract A', excerpt: 'clause 4' },
        { uid: 'doc-2', title: 'Contract B' },
      ],
    });
  });

  /**
   * The correlation, which is the part that silently goes wrong. Emitting at the
   * moment the tool returns would key the citations to whatever bubble was open
   * then — the text before the tool call, or nothing at all. They must land on
   * the message that follows.
   */
  it('attaches citations to the assistant message that follows the tool call', async () => {
    const events = await run({
      tools: [groundedTool],
      turns: [
        [
          { type: 'text', delta: 'Let me check.' },
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'kd.ask' },
          { type: 'tool-call-delta', index: 0, delta: '{}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'Two contracts matched.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const firstBubble = events.find((event) => event.type === EventType.TEXT_MESSAGE_CHUNK);
    const secondBubble = events.filter(
      (event) => event.type === EventType.TEXT_MESSAGE_CHUNK && event['messageId'],
    )[1];
    const custom = events.find((event) => event.type === EventType.CUSTOM);

    expect(firstBubble?.['messageId']).not.toBe(secondBubble?.['messageId']);
    expect((custom?.['value'] as { messageId: string }).messageId).toBe(
      secondBubble?.['messageId'],
    );
  });

  /**
   * Not merely "after the bubble opened" but after its last delta: a `CUSTOM`
   * frame closes the open text block in the client, so one emitted between two
   * deltas orphans every delta after it (rule 4). Sitting at the end of the
   * segment is what makes both the attachment and the streaming survive.
   */
  it('emits the CUSTOM event after the last chunk of the bubble it attaches to', async () => {
    const events = await run({ tools: [groundedTool], turns: groundedTurns });

    const order = types(events);
    const custom = order.indexOf(EventType.CUSTOM);
    expect(custom).toBe(order.lastIndexOf(EventType.TEXT_MESSAGE_CHUNK) + 1);
    expect(order.indexOf(EventType.TEXT_MESSAGE_CHUNK)).toBeLessThan(custom);
    expect(order.indexOf(EventType.RUN_FINISHED)).toBeGreaterThan(custom);
  });

  it('emits one CUSTOM event, not one per text chunk', async () => {
    const events = await run({ tools: [groundedTool], turns: groundedTurns });

    expect(events.filter((event) => event.type === EventType.CUSTOM)).toHaveLength(1);
  });

  it('merges citations from several grounded tools into one event', async () => {
    const second: AgentTool = {
      name: 'kd.other',
      description: 'ask',
      mutating: false,
      parameters: { type: 'object', properties: {} },
      execute: async () => ({ citations: [{ uid: 'doc-3', title: 'Contract C' }] }),
    };

    const events = await run({
      tools: [groundedTool, second],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'kd.ask' },
          { type: 'tool-call-start', index: 1, id: 'call-2', name: 'kd.other' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'Three matched.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const custom = events.find((event) => event.type === EventType.CUSTOM);
    expect((custom?.['value'] as { citations: unknown[] }).citations).toHaveLength(3);
  });

  it('says nothing when no tool returned grounding', async () => {
    const events = await run({
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'done' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    expect(types(events)).not.toContain(EventType.CUSTOM);
  });

  // There is no bubble to attach to, and the client drops a citation event with
  // no resolvable message id anyway. Emitting one would be noise on the wire.
  it('drops grounding when the run produces no assistant text after it', async () => {
    const events = await run({
      tools: [groundedTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'kd.ask' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ],
    });

    expect(types(events)).not.toContain(EventType.CUSTOM);
  });
});

/**
 * Generative UI. The run has to keep producing exactly today's frames and add
 * one, so every assertion here is either "the render event is right" or "nothing
 * else moved".
 */
describe('runAgent render transport', () => {
  const searchTool: AgentTool = {
    name: 'nuxeo.searchDocuments',
    description: 'search',
    mutating: false,
    parameters: { type: 'object', properties: {} },
    execute: async () => ({
      totalSize: 1,
      entries: [{ uid: 'aaaaaaaa-1111-2222-3333-444444444444', title: 'Retention policy 2026' }],
    }),
  };

  const searchTurns: ModelStreamEvent[][] = [
    [
      { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.searchDocuments' },
      { type: 'tool-call-delta', index: 0, delta: '{"query":"SELECT * FROM Document"}' },
      { type: 'finish', reason: 'tool_calls' },
    ],
    [
      { type: 'text', delta: 'Here is what I found.' },
      { type: 'finish', reason: 'stop' },
    ],
  ];

  it('emits a render CUSTOM event keyed to the call that produced the result', async () => {
    const events = await run({ tools: [searchTool], turns: searchTurns });

    const render = events.find((event) => event['name'] === 'render');
    expect(render).toMatchObject({
      type: EventType.CUSTOM,
      value: {
        toolCallId: 'call-1',
        component: 'documentList',
        props: { docIds: ['aaaaaaaa-1111-2222-3333-444444444444'] },
      },
    });
  });

  // The tool card is the fallback, and it has to arrive first so a client that
  // renders the widget can attach it to something already on screen.
  it('emits it immediately after that call’s TOOL_CALL_RESULT', async () => {
    const events = await run({ tools: [searchTool], turns: searchTurns });

    const result = events.findIndex((event) => event.type === EventType.TOOL_CALL_RESULT);
    const render = events.findIndex((event) => event['name'] === 'render');
    expect(render).toBe(result + 1);
  });

  it('leaves the tool call and its result untouched', async () => {
    const events = await run({ tools: [searchTool], turns: searchTurns });

    const result = events.find((event) => event.type === EventType.TOOL_CALL_RESULT);
    expect(result).toMatchObject({ toolCallId: 'call-1' });
    expect(JSON.parse(result?.['content'] as string)).toEqual({
      totalSize: 1,
      entries: [{ uid: 'aaaaaaaa-1111-2222-3333-444444444444', title: 'Retention policy 2026' }],
    });
  });

  it('emits nothing for a tool that mounts no widget', async () => {
    const events = await run({
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'done' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    expect(events.some((event) => event['name'] === 'render')).toBe(false);
  });

  it('emits nothing when the search found nothing', async () => {
    const empty: AgentTool = {
      ...searchTool,
      execute: async () => ({ totalSize: 0, entries: [] }),
    };

    const events = await run({ tools: [empty], turns: searchTurns });

    expect(events.some((event) => event['name'] === 'render')).toBe(false);
  });

  it('emits nothing when the tool failed', async () => {
    const failing: AgentTool = {
      ...searchTool,
      execute: async () => {
        throw new NuxeoRequestError(500, '/nuxeo/api/v1/search', '');
      },
    };

    const events = await run({ tools: [failing], turns: searchTurns });

    expect(events.some((event) => event['name'] === 'render')).toBe(false);
  });

  // The whole security claim in one assertion: the panel mounts a list of uids
  // Nuxeo returned, and the model's own words are not on the wire at all.
  it('carries no content the model authored', async () => {
    const events = await run({ tools: [searchTool], turns: searchTurns });

    const render = events.find((event) => event['name'] === 'render');
    expect(JSON.stringify(render?.['value'])).not.toContain('Retention policy');
    expect(JSON.stringify(render?.['value'])).not.toContain('SELECT');
  });
});

/**
 * The gateway's only real contract test. `@ag-ui/client` parses every frame it
 * receives against these same schemas, so an event that fails here throws in the
 * browser mid-run — and `RunFinishedSuccessOutcomeSchema` is strict, which makes
 * "add one useful field to outcome" a breaking change with no local symptom.
 */
describe('every emitted frame validates against the AG-UI schemas', () => {
  const scenarios: Record<string, HarnessOptions> = {
    'text only': {
      turns: [
        [
          { type: 'text', delta: 'hello' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    },
    'server tool call': {
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'tool-call-delta', index: 0, delta: '{}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'done' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    },
    'client tool interrupt': {
      runInput: input({ tools: [{ name: 'confirmAction', description: 'Ask.', parameters: {} }] }),
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-9', name: 'confirmAction' },
          { type: 'tool-call-delta', index: 0, delta: '{"summary":"x"}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ],
    },
    'grounded citations': {
      tools: [
        {
          name: 'kd.ask',
          description: 'ask',
          mutating: false,
          parameters: { type: 'object', properties: {} },
          execute: async () => ({ citations: [{ objectId: 'src__doc-1', title: 'A' }] }),
        },
      ],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'kd.ask' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'Grounded.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    },
    'generative UI render event': {
      tools: [
        {
          name: 'nuxeo.searchDocuments',
          description: 'search',
          mutating: false,
          parameters: { type: 'object', properties: {} },
          execute: async () => ({ entries: [{ uid: 'aaaa-1111' }] }),
        },
      ],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.searchDocuments' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'Found one.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    },
    'reasoning interleaved with text': {
      turns: [
        [
          { type: 'thinking', id: 'plan', label: 'Planning' },
          { type: 'text', delta: 'First, ' },
          { type: 'thinking', id: 'plan', label: 'Planning', done: true },
          { type: 'text', delta: 'then this.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    },
    'step ceiling': {
      maxSteps: 1,
      tools: [echoTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.echo' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ],
    },
  };

  it.each(Object.entries(scenarios))('%s', async (_name, options) => {
    for (const event of await run(options)) {
      const parsed = EventSchemas.safeParse(event);
      expect(
        parsed.success ? [] : parsed.error.issues.map((issue) => `${event.type}: ${issue.message}`),
      ).toEqual([]);
    }
  });

  it.each(Object.entries(scenarios))(
    '%s survives the client chunk transform',
    async (_name, options) => {
      await expect(throughClientChunkTransform(await run(options))).resolves.toBeInstanceOf(Array);
    },
  );

  it('rejects a bare text chunk after a CUSTOM frame, so the transform test has teeth', async () => {
    await expect(
      throughClientChunkTransform([
        { type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm', role: 'assistant', delta: 'a' },
        { type: EventType.CUSTOM, name: THINKING_EVENT_NAME, value: {} },
        { type: EventType.TEXT_MESSAGE_CHUNK, delta: 'b' },
      ] as Recorded[]),
    ).rejects.toThrow('First TEXT_MESSAGE_CHUNK must have a messageId');
  });

  it('rejects a RUN_FINISHED outcome the SDK would refuse, so this test has teeth', () => {
    const invalid = {
      type: EventType.RUN_FINISHED,
      threadId: 't',
      runId: 'r',
      outcome: { status: 'awaiting_client_tool' },
    };
    expect(EventSchemas.safeParse(invalid).success).toBe(false);
  });
});

describe('toUserFacingError', () => {
  it.each([
    [404, 'NUXEO_NOT_FOUND'],
    [403, 'NUXEO_FORBIDDEN'],
    [401, 'NUXEO_FORBIDDEN'],
    [500, 'NUXEO_ERROR'],
  ])('maps a Nuxeo %i to %s', (status, code) => {
    expect(
      toUserFacingError(new NuxeoRequestError(status, '/nuxeo/api/v1/id/x', '')),
    ).toMatchObject({ code });
  });

  it('never leaks the underlying detail into the user-facing message', () => {
    const safe = toUserFacingError(
      new NuxeoRequestError(500, '/nuxeo/api/v1/search', 'SELECT * FROM Document WHERE secret=1'),
    );
    expect(safe.message).not.toContain('SELECT');
  });
});
