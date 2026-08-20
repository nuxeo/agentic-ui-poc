import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { RunAgentInputSchema } from '@ag-ui/core';

import { runAgent, type AgentRunDeps } from '../agent/run-agent';
import {
  resolveCaller,
  UnauthenticatedCallerError,
  type CallerIdentity,
  type FetchLike,
} from '../identity/caller-identity';
import { AGENT_CAPABILITIES, type AgentRuntimeCapabilities } from './capabilities';
import { SseStream } from './sse';

/**
 * HTTP surface. Three routes, exactly as ADR 001 specifies:
 *
 *   GET  /agent/capabilities   unauthenticated capability probe
 *   GET  /agent/health         liveness for the orchestrator
 *   POST /agent/run            the run, streamed as AG-UI events
 *
 * Built on `node:http` rather than a framework. The routing is three string
 * comparisons, and the streaming path needs direct control of when headers
 * flush anyway, so a framework would add a dependency to patch and scan without
 * removing any code worth removing.
 */

const MAX_BODY_BYTES = 1_048_576;

export interface GatewayServerDeps extends AgentRunDeps {
  /** Overridable for tests; production passes the global `fetch`. */
  readonly fetchImpl?: FetchLike;
  /**
   * What `GET /agent/capabilities` answers. Defaults to the live payload; the
   * demo entry point passes one carrying its disclosure, so the running mode is
   * readable from outside the process.
   */
  readonly capabilities?: AgentRuntimeCapabilities;
}

export type RequestHandler = (request: IncomingMessage, response: ServerResponse) => Promise<void>;

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

export class PayloadTooLargeError extends Error {}

export async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    if (size > MAX_BODY_BYTES) {
      throw new PayloadTooLargeError('Request body too large.');
    }
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return undefined;
  return JSON.parse(text) as unknown;
}

export function createRequestHandler(deps: GatewayServerDeps): RequestHandler {
  return async (request, response) => {
    const path = (request.url ?? '/').split('?')[0];

    if (request.method === 'GET' && path === '/agent/health') {
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (request.method === 'GET' && path === '/agent/capabilities') {
      sendJson(response, 200, deps.capabilities ?? AGENT_CAPABILITIES);
      return;
    }

    if (path === '/agent/run') {
      if (request.method !== 'POST') {
        sendJson(response, 405, { error: 'method_not_allowed' });
        return;
      }
      await handleRun(deps, request, response);
      return;
    }

    sendJson(response, 404, { error: 'not_found' });
  };
}

async function handleRun(
  deps: GatewayServerDeps,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  // Identity first, before the body is even parsed. Nothing downstream of here
  // runs for a caller Nuxeo has not vouched for, and nothing upstream of here
  // touches Nuxeo — so an unauthenticated request cannot reach the repository
  // at all, which is the property the tests pin down.
  let caller: CallerIdentity;
  try {
    caller = await resolveCaller(request.headers, {
      nuxeoBaseUrl: deps.config.nuxeoBaseUrl,
      ...(deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : {}),
    });
  } catch (error) {
    if (error instanceof UnauthenticatedCallerError) {
      deps.logger.warn('rejected unauthenticated run', { reason: error.message });
      sendJson(response, 401, { error: 'unauthenticated' });
      return;
    }
    throw error;
  }

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const tooLarge = error instanceof PayloadTooLargeError;
    sendJson(response, tooLarge ? 413 : 400, {
      error: tooLarge ? 'payload_too_large' : 'invalid_json',
    });
    return;
  }

  // `tools` and `context` are required arrays in the 0.0.57 schema. HttpAgent
  // always sends them; hand-rolled callers frequently do not, and a 400 naming
  // the field is a far better debugging experience than an empty stream.
  const parsed = RunAgentInputSchema.safeParse(body);
  if (!parsed.success) {
    sendJson(response, 400, {
      error: 'invalid_run_agent_input',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  const stream = new SseStream(request, response);
  stream.open();

  const abortController = new AbortController();
  /**
   * Cancellation, on the only event that actually reports it.
   *
   * Node emits `close` on the *request* when the request message is complete, which
   * for a POST with a body already read is before this line runs — a listener there
   * never fires, so a run kept working after the user pressed Stop until its next
   * write happened to fail. `close` on the *response* is the disconnect.
   *
   * Aborting matters beyond politeness: without it an in-flight tool keeps its
   * Nuxeo request open, and a cancelled run can still write to the repository.
   *
   * The log line is the only trace a cancelled run leaves at all — ADR 001 requires
   * no terminal event — so "Stop stopped the server" and "Stop only hid the answer"
   * are otherwise indistinguishable.
   */
  const stopOnDisconnect = () => {
    deps.logger.info('run cancelled by the client', {
      runId: parsed.data.runId,
      threadId: parsed.data.threadId,
    });
    abortController.abort();
  };
  response.on('close', stopOnDisconnect);

  const timeout = setTimeout(() => abortController.abort(), deps.config.runTimeoutMs);

  try {
    await runAgent(deps, {
      input: parsed.data,
      caller,
      emit: (event) => stream.send(event),
      signal: abortController.signal,
    });
  } finally {
    clearTimeout(timeout);
    // Removed before `stream.end()`, which is what closes the response: `close`
    // fires on an orderly finish too, and logging that as a cancellation would make
    // the line useless for the one question it exists to answer.
    response.off('close', stopOnDisconnect);
    stream.end();
  }
}

export function createGatewayServer(deps: GatewayServerDeps): Server {
  const handler = createRequestHandler(deps);
  return createServer((request, response) => {
    handler(request, response).catch((error: unknown) => {
      deps.logger.error('unhandled request failure', {
        detail: error instanceof Error ? error.message : String(error),
      });
      if (!response.headersSent) {
        sendJson(response, 500, { error: 'internal_error' });
      } else {
        response.end();
      }
    });
  });
}
