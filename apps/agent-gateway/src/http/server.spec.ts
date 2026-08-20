import type { AddressInfo } from 'node:net';
import { request as httpRequest, type Server } from 'node:http';

import { EventSchemas, EventType } from '@ag-ui/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ModelClient, ModelStreamEvent } from '../agent/model-client';
import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import {
  jsonResponse,
  meResponse,
  recordingFetch,
  recordingLogger,
  ScriptedModelClient,
  testConfig,
  TEST_NUXEO_BASE_URL,
  TEST_SESSION_COOKIE,
  type RecordedLogLine,
  type RecordedRequest,
} from '../testing/test-doubles';
import { ToolRegistry } from '../tools/tool-registry';
import type { AgentTool } from '../tools/tool.types';
import { AGENT_CAPABILITIES } from './capabilities';
import { createGatewayServer } from './server';

/**
 * Integration tests over a real socket. The SSE path in particular is not worth
 * testing against a mock `ServerResponse`: header flushing, chunked framing and
 * client disconnect are exactly the behaviours a mock would paper over.
 */

interface Harness {
  readonly url: string;
  readonly nuxeoRequests: RecordedRequest[];
  readonly logLines: RecordedLogLine[];
  close(): Promise<void>;
}

const servers: Server[] = [];

async function startGateway(
  options: {
    readonly turns?: ModelStreamEvent[][];
    readonly tools?: readonly AgentTool[];
    readonly nuxeoResponder?: (request: RecordedRequest) => Response;
    readonly model?: ModelClient;
  } = {},
): Promise<Harness> {
  const recorder = recordingFetch(
    options.nuxeoResponder ??
      ((request) => (request.url.endsWith('/me') ? meResponse() : jsonResponse({}))),
  );
  const registry = new ToolRegistry();
  for (const tool of options.tools ?? []) registry.register(tool);
  const recorded = recordingLogger();

  const server = createGatewayServer({
    config: testConfig(),
    logger: recorded.logger,
    registry,
    nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
    model:
      options.model ??
      new ScriptedModelClient(options.turns ?? [[{ type: 'finish', reason: 'stop' }]]),
    fetchImpl: recorder.fetchImpl,
  });
  servers.push(server);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    nuxeoRequests: recorder.requests,
    logLines: recorded.lines,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((r) => server.close(r))));
});

const RUN_BODY = {
  threadId: 'thread-1',
  runId: 'run-1',
  messages: [{ id: 'm1', role: 'user', content: 'hello' }],
  tools: [],
  context: [],
};

async function readSseFrames(response: Response): Promise<Record<string, unknown>[]> {
  const text = await response.text();
  return text
    .split('\n\n')
    .filter((frame) => frame.startsWith('data: '))
    .map((frame) => JSON.parse(frame.slice('data: '.length)) as Record<string, unknown>);
}

describe('GET /agent/capabilities', () => {
  it('answers the probe without authentication, so "not deployed" is distinguishable from 401', async () => {
    const gateway = await startGateway();

    const response = await fetch(`${gateway.url}/agent/capabilities`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(AGENT_CAPABILITIES);
    await gateway.close();
  });

  it('reports the pinned AG-UI protocol version and the run endpoint', () => {
    expect(AGENT_CAPABILITIES).toMatchObject({
      agentRuntime: true,
      protocol: 'ag-ui',
      protocolVersion: '0.0.57',
      transports: ['sse'],
      endpoints: { run: '/agent/run' },
    });
  });

  it('exposes no user data and no configuration', () => {
    const serialized = JSON.stringify(AGENT_CAPABILITIES);
    expect(serialized).not.toMatch(/nuxeo\.test|haip|key|token/i);
  });
});

describe('GET /agent/health', () => {
  it('is a plain liveness probe', async () => {
    const gateway = await startGateway();
    const response = await fetch(`${gateway.url}/agent/health`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
    await gateway.close();
  });
});

describe('POST /agent/run authentication', () => {
  /**
   * The regression test that matters most. An agent that reached Nuxeo before
   * the caller was validated — or that fell back to a service account when the
   * session was missing — would read documents the user cannot see, silently.
   * Asserting "401" alone would not catch it: a gateway that queried Nuxeo and
   * *then* returned 401 would still pass. So this asserts on the requests that
   * left the process.
   */
  it('returns 401 and makes no Nuxeo call at all when no session is presented', async () => {
    const gateway = await startGateway();

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(RUN_BODY),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthenticated' });
    expect(gateway.nuxeoRequests).toHaveLength(0);
    await gateway.close();
  });

  it('returns 401 when Nuxeo rejects the session, and reaches no other endpoint', async () => {
    const gateway = await startGateway({
      nuxeoResponder: (request) =>
        request.url.endsWith('/me') ? jsonResponse({}, 401) : jsonResponse({}),
    });

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        cookie: 'JSESSIONID=expired',
      },
      body: JSON.stringify(RUN_BODY),
    });

    expect(response.status).toBe(401);
    expect(gateway.nuxeoRequests.map((request) => request.url)).toEqual([
      `${TEST_NUXEO_BASE_URL}/nuxeo/api/v1/me`,
    ]);
    await gateway.close();
  });

  it('validates the caller before parsing the body, so an invalid body cannot probe Nuxeo state', async () => {
    const gateway = await startGateway();

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });

    expect(response.status).toBe(401);
    await gateway.close();
  });

  it('forwards the caller cookie to /me rather than a credential of its own', async () => {
    const gateway = await startGateway();

    await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        cookie: TEST_SESSION_COOKIE,
      },
      body: JSON.stringify(RUN_BODY),
    });

    const meRequest = gateway.nuxeoRequests[0];
    expect(meRequest?.url).toBe(`${TEST_NUXEO_BASE_URL}/nuxeo/api/v1/me`);
    expect(meRequest?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
    expect(meRequest?.headers['authorization']).toBeUndefined();
    await gateway.close();
  });
});

describe('POST /agent/run request validation', () => {
  it('rejects a body missing the required tools and context arrays', async () => {
    const gateway = await startGateway();

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: JSON.stringify({ threadId: 't', runId: 'r', messages: [] }),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string; issues: { path: string }[] };
    expect(body.error).toBe('invalid_run_agent_input');
    expect(body.issues.map((issue) => issue.path).sort()).toEqual(['context', 'tools']);
    await gateway.close();
  });

  it('rejects an unparseable body with 400 once the caller is known', async () => {
    const gateway = await startGateway();

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: '{ not json',
    });

    expect(response.status).toBe(400);
    await gateway.close();
  });

  it('rejects any method other than POST on /agent/run', async () => {
    const gateway = await startGateway();
    const response = await fetch(`${gateway.url}/agent/run`);
    expect(response.status).toBe(405);
    await gateway.close();
  });

  it('404s an unknown path', async () => {
    const gateway = await startGateway();
    const response = await fetch(`${gateway.url}/agent/nope`);
    expect(response.status).toBe(404);
    await gateway.close();
  });
});

describe('POST /agent/run streaming', () => {
  it('streams AG-UI events with the framing headers proxies must not buffer', async () => {
    const gateway = await startGateway({
      turns: [
        [
          { type: 'text', delta: 'Hello' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        cookie: TEST_SESSION_COOKIE,
      },
      body: JSON.stringify(RUN_BODY),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/event-stream');
    expect(response.headers.get('cache-control')).toBe('no-cache, no-transform');
    // Without this a proxy buffers the whole run and streaming silently degrades
    // to request/response, with correct content delivered all at once.
    expect(response.headers.get('x-accel-buffering')).toBe('no');

    const frames = await readSseFrames(response);
    expect(frames.map((frame) => frame['type'])).toEqual([
      EventType.RUN_STARTED,
      EventType.TEXT_MESSAGE_CHUNK,
      EventType.RUN_FINISHED,
    ]);
    expect(frames[0]).toMatchObject({ threadId: 'thread-1', runId: 'run-1' });
    await gateway.close();
  });

  it('stamps every event with a timestamp so field latency is debuggable', async () => {
    const gateway = await startGateway();

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: JSON.stringify(RUN_BODY),
    });

    for (const frame of await readSseFrames(response)) {
      expect(typeof frame['timestamp']).toBe('number');
    }
    await gateway.close();
  });

  // Citations are the one payload whose loss is completely silent: the client
  // reads them from this frame and nowhere else, so if the encoder or the
  // framing mangles it, a grounded answer simply renders without its sources.
  it('carries grounded citations to the wire as a CUSTOM frame', async () => {
    const grounded: AgentTool = {
      name: 'kd.ask',
      description: 'ask',
      mutating: false,
      parameters: { type: 'object', properties: {} },
      execute: async () => ({
        answer: 'Two contracts matched.',
        citations: [{ objectId: 'src-1__doc-1', title: 'Contract A', excerpt: 'clause 4' }],
      }),
    };

    const gateway = await startGateway({
      tools: [grounded],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'kd.ask' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [
          { type: 'text', delta: 'Two contracts matched.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: JSON.stringify(RUN_BODY),
    });

    const frames = await readSseFrames(response);
    const custom = frames.find((frame) => frame['type'] === EventType.CUSTOM);
    const bubble = frames.find(
      (frame) => frame['type'] === EventType.TEXT_MESSAGE_CHUNK && frame['messageId'],
    );

    expect(custom?.['name']).toBe('citations');
    expect(custom?.['value']).toEqual({
      messageId: bubble?.['messageId'],
      citations: [{ uid: 'doc-1', title: 'Contract A', excerpt: 'clause 4' }],
    });
    await gateway.close();
  });

  // What actually leaves the socket, parsed by the schemas the browser SDK parses
  // it with. The unit-level check in run-agent.spec.ts cannot see the encoder, and
  // the encoder is where the timestamp and the JSON round-trip happen.
  it('emits frames the client SDK can parse, end to end over the wire', async () => {
    const gateway = await startGateway({
      turns: [
        [
          { type: 'text', delta: 'Hello' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: JSON.stringify(RUN_BODY),
    });

    for (const frame of await readSseFrames(response)) {
      const parsed = EventSchemas.safeParse(frame);
      expect(parsed.success ? [] : parsed.error.issues).toEqual([]);
    }
    await gateway.close();
  });

  it('carries the caller identity into the tools the run executes', async () => {
    const searchTool: AgentTool = {
      name: 'nuxeo.searchDocuments',
      description: 'search',
      mutating: false,
      parameters: { type: 'object', properties: {} },
      execute: async (_args, context) =>
        context.nuxeo.json(context.caller, {
          method: 'GET',
          path: '/nuxeo/api/v1/search/lang/NXQL/execute',
          query: { query: 'SELECT * FROM Document' },
        }),
    };

    const gateway = await startGateway({
      tools: [searchTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.searchDocuments' },
          { type: 'tool-call-delta', index: 0, delta: '{}' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ],
      nuxeoResponder: (request) =>
        request.url.endsWith('/me') ? meResponse() : jsonResponse({ entries: [] }),
    });

    await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: JSON.stringify(RUN_BODY),
    });

    const searchRequest = gateway.nuxeoRequests.find((request) => request.url.includes('NXQL'));
    expect(searchRequest).toBeDefined();
    expect(searchRequest?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
    await gateway.close();
  });

  it('reports a failure that happened after the stream opened as an in-band RUN_ERROR', async () => {
    const explodingTool: AgentTool = {
      name: 'nuxeo.explode',
      description: 'explode',
      mutating: false,
      parameters: { type: 'object', properties: {} },
      execute: async () => {
        throw new Error('boom');
      },
    };

    const gateway = await startGateway({
      tools: [explodingTool],
      turns: [
        [
          { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.explode' },
          { type: 'finish', reason: 'tool_calls' },
        ],
        [{ type: 'finish', reason: 'stop' }],
      ],
    });

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: JSON.stringify(RUN_BODY),
    });

    // Once the first byte is written the status is fixed at 200; failures after
    // that point must be reported in-band, never as a mid-stream status change.
    expect(response.status).toBe(200);
    const frames = await readSseFrames(response);
    const toolResult = frames.find((frame) => frame['type'] === EventType.TOOL_CALL_RESULT);
    expect(JSON.parse(String(toolResult?.['content']))).toMatchObject({ code: 'AGENT_ERROR' });
    await gateway.close();
  });
});

/**
 * Cancellation is the one outcome with no event to assert on: ADR 001 requires the
 * socket to close with no terminal frame. The log line is therefore the contract,
 * and it is also what the demo runbook points at to show that Stop actually stops
 * the server rather than only hiding the answer.
 */
describe('POST /agent/run cancellation', () => {
  /** Streams one chunk, then hangs until the run is aborted, recording that it was. */
  class HangingModelClient implements ModelClient {
    aborted = false;

    async *stream(request: {
      readonly signal: AbortSignal;
    }): AsyncGenerator<ModelStreamEvent, void, undefined> {
      yield { type: 'text', delta: 'thinking' };
      await new Promise<void>((resolve) => {
        const settle = () => {
          this.aborted = true;
          resolve();
        };
        if (request.signal.aborted) settle();
        else request.signal.addEventListener('abort', settle, { once: true });
      });
    }
  }

  async function destroyMidStream(url: string): Promise<void> {
    await new Promise<void>((resolve) => {
      const request = httpRequest(
        url,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
        },
        (response) => {
          // Destroy on the first streamed byte, so the abort lands mid-run.
          response.once('data', () => {
            request.destroy();
            resolve();
          });
        },
      );
      request.end(JSON.stringify(RUN_BODY));
    });
  }

  /**
   * Raw `node:http` rather than `fetch`: what has to be simulated here is the socket
   * going away mid-stream, and an aborted `fetch` in undici does not reliably tear the
   * connection down — the browser does, which is why this defect would otherwise only
   * ever appear in a live demo.
   */
  it('logs the cancellation, with the run it belongs to, when the client disconnects', async () => {
    const gateway = await startGateway({ model: new HangingModelClient() });

    await destroyMidStream(`${gateway.url}/agent/run`);

    await vi.waitFor(() =>
      expect(
        gateway.logLines.find((line) => line.message === 'run cancelled by the client')?.fields,
      ).toMatchObject({ runId: 'run-1', threadId: 'thread-1' }),
    );
    await gateway.close();
  });

  /**
   * The regression that matters. Until the disconnect listener moved from `request`
   * to `response` this signal never fired, so work already in flight — a tool holding
   * an open Nuxeo write — ran to completion after the user had pressed Stop.
   */
  it('aborts work already in flight rather than waiting for the next failed write', async () => {
    const model = new HangingModelClient();
    const gateway = await startGateway({ model });

    await destroyMidStream(`${gateway.url}/agent/run`);

    await vi.waitFor(() => expect(model.aborted).toBe(true));
    await gateway.close();
  });

  it('does not log a cancellation for a run that finished on its own', async () => {
    const gateway = await startGateway();

    const response = await fetch(`${gateway.url}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: TEST_SESSION_COOKIE },
      body: JSON.stringify(RUN_BODY),
    });
    await readSseFrames(response);

    expect(gateway.logLines.map((line) => line.message)).not.toContain(
      'run cancelled by the client',
    );
    await gateway.close();
  });
});
