import { readdirSync, readFileSync } from 'node:fs';
import { request as httpRequest, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join, resolve } from 'node:path';

import { EventType } from '@ag-ui/core';
import { afterEach, describe, expect, it } from 'vitest';

import type { ModelClient, ModelStreamEvent } from '../agent/model-client';
import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import {
  jsonResponse,
  meResponse,
  recordingFetch,
  ScriptedModelClient,
  testConfig,
  testLogger,
  TEST_NUXEO_BASE_URL,
  TEST_SESSION_COOKIE,
} from '../testing/test-doubles';
import { ToolRegistry } from '../tools/tool-registry';
import type { AgentTool } from '../tools/tool.types';
import { AGENT_CAPABILITIES, demoCapabilities } from './capabilities';
import { createGatewayServer } from './server';

/**
 * Every `features` flag on the probe, checked against what the gateway does.
 *
 * This file exists because `sharedState: true` sat on the probe for the whole of
 * Phase 1 while no `STATE_DELTA` was ever emitted. Nothing caught it, and nothing
 * could have: a boolean literal in an object literal agrees with every test that
 * reads the same literal back. `server.spec.ts` asserted the endpoint returns
 * `AGENT_CAPABILITIES` — true, and true of a lie.
 *
 * So each flag here is compared against evidence gathered from the running
 * gateway rather than against an expected constant, and every assertion is
 * `expect(flag).toBe(observed)` rather than `toBe(true)`. That fails in both
 * directions, which is the property that matters: advertising something
 * unimplemented fails, and implementing something still advertised as absent
 * fails too — so whoever builds the shared-state channel is told to flip the flag
 * by a red test rather than by remembering.
 */

const SRC_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');

/** Non-test gateway sources: the code that can actually put a frame on the wire. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'testing' ? [] : sourceFiles(full);
    const isSource =
      entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts');
    return isSource ? [full] : [];
  });
}

/**
 * Every AG-UI event type this gateway is capable of emitting, read from the emit
 * sites themselves rather than from one exercised run.
 *
 * A behavioural probe can only show that a given scenario emitted no state event;
 * it cannot show that no scenario does, and the demo gateway is a second code
 * path that a socket test would have to reach separately. Matching on
 * `type: EventType.X` — the shape of an emitted frame — keeps a mention in a
 * comment or an import from counting as an implementation.
 */
function emittableEventTypes(): Set<string> {
  const emitted = new Set<string>();
  const pattern = /type:\s*(?:EventType\.([A-Z_]+)|['"]([A-Z_]+)['"])/g;
  for (const file of sourceFiles(SRC_ROOT)) {
    for (const match of readFileSync(file, 'utf8').matchAll(pattern)) {
      const name = match[1] ?? match[2];
      if (name) emitted.add(name);
    }
  }
  return emitted;
}

interface Harness {
  readonly url: string;
}

const servers: Server[] = [];

async function startGateway(options: {
  readonly model: ModelClient;
  readonly tools?: readonly AgentTool[];
}): Promise<Harness> {
  const recorder = recordingFetch((request) =>
    request.url.endsWith('/me') ? meResponse() : jsonResponse({}),
  );
  const registry = new ToolRegistry();
  for (const tool of options.tools ?? []) registry.register(tool);

  const server = createGatewayServer({
    config: testConfig(),
    logger: testLogger(),
    registry,
    nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
    model: options.model,
    fetchImpl: recorder.fetchImpl,
  });
  servers.push(server);

  await new Promise<void>((ready) => server.listen(0, '127.0.0.1', ready));
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}` };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((r) => server.close(r))));
});

function runBody(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    threadId: 'thread-1',
    runId: 'run-1',
    messages: [{ id: 'm1', role: 'user', content: 'hello' }],
    tools: [],
    context: [],
    ...overrides,
  });
}

async function postRun(gateway: Harness, body = runBody()): Promise<Record<string, unknown>[]> {
  const response = await fetch(`${gateway.url}/agent/run`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      cookie: TEST_SESSION_COOKIE,
    },
    body,
  });
  const text = await response.text();
  return text
    .split('\n\n')
    .filter((frame) => frame.startsWith('data: '))
    .map((frame) => JSON.parse(frame.slice('data: '.length)) as Record<string, unknown>);
}

function readOnlyTool(name: string): AgentTool {
  return {
    name,
    description: 'reads',
    mutating: false,
    parameters: { type: 'object', properties: {} },
    execute: async () => ({ entries: [] }),
  };
}

function mutatingTool(name: string): AgentTool {
  return {
    name,
    description: 'writes',
    mutating: true,
    parameters: { type: 'object', properties: {} },
    execute: async () => ({ updated: true }),
  };
}

describe('the capability probe advertises only what is implemented', () => {
  /**
   * The guard on the guard. A flag added without a probe below would otherwise be
   * exactly as unverifiable as `sharedState` was, and this file would give false
   * assurance that the whole set had been checked.
   */
  it('advertises no feature this spec does not compare against the implementation', () => {
    const probed = [
      'streaming',
      'toolCalls',
      'humanInTheLoop',
      'sharedState',
      'threadPersistence',
      'cancel',
    ];

    expect(
      Object.keys(AGENT_CAPABILITIES.features).sort(),
      'Every advertised feature needs a test in this file that derives its value ' +
        'from the gateway rather than restating the literal.',
    ).toEqual(probed.sort());
  });

  it('advertises streaming only if events arrive incrementally and unbuffered', async () => {
    const gateway = await startGateway({
      model: new ScriptedModelClient([
        [
          { type: 'text', delta: 'Two ' },
          { type: 'text', delta: 'contracts.' },
          { type: 'finish', reason: 'stop' },
        ],
      ]),
    });

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        cookie: TEST_SESSION_COOKIE,
      },
      body: runBody(),
    });
    const frames = (await response.text())
      .split('\n\n')
      .filter((frame) => frame.startsWith('data: '))
      .map((frame) => JSON.parse(frame.slice('data: '.length)) as Record<string, unknown>);

    // Chunked delivery is only half of it: the framing headers are what stop a
    // proxy turning the stream back into one response at the end, which looks
    // like success and is not streaming.
    const chunks = frames.filter((frame) => frame['type'] === EventType.TEXT_MESSAGE_CHUNK);
    const streams =
      chunks.length > 1 &&
      response.headers.get('content-type') === 'text/event-stream' &&
      response.headers.get('cache-control') === 'no-cache, no-transform' &&
      response.headers.get('x-accel-buffering') === 'no';

    expect(AGENT_CAPABILITIES.features['streaming']).toBe(streams);
  });

  it('advertises toolCalls only if a called tool runs and returns a result', async () => {
    const gateway = await startGateway({
      tools: [readOnlyTool('nuxeo.searchDocuments')],
      model: new ScriptedModelClient([
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.searchDocuments' },
          { type: 'tool-call-delta', index: 0, delta: '{}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ]),
    });

    const frames = await postRun(gateway);
    const types = frames.map((frame) => frame['type']);
    const runsTools =
      types.includes(EventType.TOOL_CALL_CHUNK) && types.includes(EventType.TOOL_CALL_RESULT);

    expect(AGENT_CAPABILITIES.features['toolCalls']).toBe(runsTools);
  });

  it('advertises humanInTheLoop only if a write actually pauses for a decision', async () => {
    const gateway = await startGateway({
      tools: [mutatingTool('nuxeo.updateMetadata')],
      model: new ScriptedModelClient([
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.updateMetadata' },
          { type: 'tool-call-delta', index: 0, delta: '{}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ]),
    });

    const frames = await postRun(gateway);
    const finished = frames.find((frame) => frame['type'] === EventType.RUN_FINISHED);
    const outcome = finished?.['outcome'] as { type?: string; interrupts?: unknown[] } | undefined;
    const pauses = outcome?.type === 'interrupt' && (outcome.interrupts?.length ?? 0) > 0;

    expect(AGENT_CAPABILITIES.features['humanInTheLoop']).toBe(pauses);
  });

  /**
   * The flag this file was written for.
   *
   * `sharedState` claimed a channel that has never carried a byte. The client
   * holds a `sharedState` signal and three handlers for it, so nothing would have
   * errored — the signal simply stays `{}` forever, and a feature gated on the
   * flag renders an affordance that never updates.
   */
  it('advertises sharedState only if a state event is emitted somewhere in the gateway', async () => {
    const emittable = emittableEventTypes();
    const canEmitState =
      emittable.has(EventType.STATE_DELTA) || emittable.has(EventType.STATE_SNAPSHOT);

    expect(
      AGENT_CAPABILITIES.features['sharedState'],
      'Flip this flag in the same change that starts emitting STATE_DELTA — a ' +
        'client gating on it has no way to discover that the channel is silent.',
    ).toBe(canEmitState);

    // And confirmed on the wire, on the run that authors the one slice this
    // gateway writes: a `selectDocuments` call, which reflects its argument into
    // shared state so the browser can render the suggestion.
    //
    // Deliberately *not* asserted for every run. A7 stage 2 briefly opened each
    // run with an empty snapshot so that any run would satisfy this test, and
    // that turned out to retract the suggestion the previous run had just made —
    // a run is not a turn, and a frontend tool splits one turn across two runs.
    // The honest claim is that the channel carries the slice when there is
    // something to say, which is what is checked here.
    const gateway = await startGateway({
      model: new ScriptedModelClient([
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'selectDocuments' },
          {
            type: 'tool-call-delta',
            index: 0,
            delta: '{"docIds":["11111111-2222-3333-4444-555555555555"]}',
          },
          { type: 'finish', reason: 'tool_calls' },
        ],
      ]),
    });

    const observed = (
      await postRun(gateway, runBody({ tools: [{ name: 'selectDocuments', description: 'x' }] }))
    ).map((frame) => frame['type']);
    expect(
      observed.some((type) => type === EventType.STATE_DELTA || type === EventType.STATE_SNAPSHOT),
    ).toBe(AGENT_CAPABILITIES.features['sharedState']);
  });

  it('advertises threadPersistence only if a second run recovers the first turn', async () => {
    const model = new ScriptedModelClient([
      [
        { type: 'text', delta: 'Noted.' },
        { type: 'finish', reason: 'stop' },
      ],
      [
        { type: 'text', delta: 'Still here.' },
        { type: 'finish', reason: 'stop' },
      ],
    ]);
    const gateway = await startGateway({ model });

    await postRun(
      gateway,
      runBody({ messages: [{ id: 'm1', role: 'user', content: 'remember the apples' }] }),
    );
    // Same thread, and the client sends nothing of the first turn. A gateway that
    // persisted threads would load it back before calling the model.
    await postRun(gateway, runBody({ runId: 'run-2', messages: [] }));

    const secondTurn = model.requests[1]?.messages ?? [];
    const recalled = secondTurn.some((message) => message.content.includes('remember the apples'));

    expect(AGENT_CAPABILITIES.features['threadPersistence']).toBe(recalled);
  });

  it('advertises cancel only if a disconnect aborts work already in flight', async () => {
    /** Streams one chunk, then hangs until aborted, recording that it was. */
    class HangingModelClient implements ModelClient {
      aborted = false;

      async *stream(request: {
        readonly signal: AbortSignal;
      }): AsyncGenerator<ModelStreamEvent, void, undefined> {
        yield { type: 'text', delta: 'thinking' };
        await new Promise<void>((settled) => {
          const settle = () => {
            this.aborted = true;
            settled();
          };
          if (request.signal.aborted) settle();
          else request.signal.addEventListener('abort', settle, { once: true });
        });
      }
    }

    const model = new HangingModelClient();
    const gateway = await startGateway({ model });

    // Raw `node:http`, because an aborted `fetch` in undici does not reliably tear
    // the connection down and the browser does — so the disconnect this flag
    // promises to honour would otherwise only ever be exercised in a live demo.
    await new Promise<void>((done) => {
      const outbound = httpRequest(
        `${gateway.url}/agent/run`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
        },
        (response) => {
          response.once('data', () => {
            outbound.destroy();
            done();
          });
        },
      );
      outbound.end(runBody());
    });

    const deadline = Date.now() + 2_000;
    while (!model.aborted && Date.now() < deadline) {
      await new Promise((tick) => setTimeout(tick, 10));
    }

    expect(AGENT_CAPABILITIES.features['cancel']).toBe(model.aborted);
  });
});

describe('the probe stays consistent with its other statements of itself', () => {
  /**
   * Demo mode substitutes the model and two tools and shares every other line of
   * the runtime, so it can never support a feature the live gateway lacks.
   * Spreading `AGENT_CAPABILITIES` gives that for free today; asserting it keeps
   * a later "just for the demo" override from quietly re-opening the same gap on
   * the one gateway an audience actually watches.
   */
  it('never lets demo mode claim a feature the live gateway does not have', () => {
    expect(demoCapabilities([]).features).toEqual(AGENT_CAPABILITIES.features);
  });

  /**
   * ADR 001 publishes the probe body verbatim and is normative for both teams, so
   * the browser half is built against the document rather than against this
   * object. The false `sharedState` was in both places, which is precisely how it
   * survived review — each copy corroborated the other.
   */
  it('matches the probe body published in ADR 001', () => {
    const adr = readFileSync(join(REPO_ROOT, 'docs', 'adr', '001-agent-runtime.md'), 'utf8');
    const block = [...adr.matchAll(/```json\n([\s\S]*?)```/g)]
      .map((match) => match[1] ?? '')
      .find((body) => body.includes('"agentRuntime"'));

    expect(block, 'ADR 001 no longer publishes a capability probe body.').toBeDefined();
    const documented = JSON.parse(block ?? '{}') as { features?: Record<string, boolean> };
    expect(documented.features).toEqual(AGENT_CAPABILITIES.features);
  });
});
