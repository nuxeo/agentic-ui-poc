import type { GatewayConfig } from '../config';
import type { CallerIdentity, FetchLike } from '../identity/caller-identity';
import { createSilentLogger, type Logger } from '../logging/logger';
import type { ModelClient, ModelRequest, ModelStreamEvent } from '../agent/model-client';

/** Shared doubles. Kept out of the spec files so every test exercises the same fakes. */

export const TEST_NUXEO_BASE_URL = 'https://nuxeo.test';

export function testConfig(overrides: Partial<GatewayConfig> = {}): GatewayConfig {
  return {
    nuxeoBaseUrl: TEST_NUXEO_BASE_URL,
    haipBaseUrl: 'https://haip.test/v1',
    haipApiKey: 'test-model-key',
    agentModel: 'test-model',
    port: 0,
    maxSteps: 4,
    runTimeoutMs: 5_000,
    ...overrides,
  };
}

export const TEST_SESSION_COOKIE = 'JSESSIONID=caller-session';

export function testCaller(overrides: Partial<CallerIdentity> = {}): CallerIdentity {
  return {
    principalId: 'jdoe',
    isAdministrator: false,
    credentialHeaders: { cookie: TEST_SESSION_COOKIE },
    ...overrides,
  };
}

export interface RecordedRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body: string | undefined;
}

export interface RecordingFetch {
  readonly fetchImpl: FetchLike;
  readonly requests: RecordedRequest[];
  /** Queue a response for the next matching call; falls back to `{}` with 200. */
  respondWith(response: Response): void;
}

function headerRecord(init: HeadersInit | undefined): Record<string, string> {
  const headers: Record<string, string> = {};
  new Headers(init).forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  return headers;
}

/**
 * A `fetch` that records every outbound call. The recording is what the identity
 * tests assert on: not "the tool returned something", but "every single request
 * that left this process carried the caller's credential".
 */
export function recordingFetch(
  handler?: (request: RecordedRequest) => Response | undefined,
): RecordingFetch {
  const requests: RecordedRequest[] = [];
  const queued: Response[] = [];

  const fetchImpl: FetchLike = async (input, init) => {
    const body =
      typeof init?.body === 'string'
        ? init.body
        : init?.body === undefined
          ? undefined
          : '[binary]';
    const recorded: RecordedRequest = {
      url: input,
      method: init?.method ?? 'GET',
      headers: headerRecord(init?.headers),
      body,
    };
    requests.push(recorded);

    const queuedResponse = queued.shift();
    if (queuedResponse) return queuedResponse;

    const handled = handler?.(recorded);
    if (handled) return handled;

    return jsonResponse({});
  };

  return {
    fetchImpl,
    requests,
    respondWith(response) {
      queued.push(response);
    },
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** The `/me` payload Nuxeo returns for a valid session. */
export function meResponse(id = 'jdoe'): Response {
  return jsonResponse({ 'entity-type': 'user', id, isAdministrator: false });
}

/** Replays a fixed event script, so loop tests do not need a model or a network. */
export class ScriptedModelClient implements ModelClient {
  readonly requests: ModelRequest[] = [];

  constructor(private readonly turns: ModelStreamEvent[][]) {}

  async *stream(request: ModelRequest): AsyncGenerator<ModelStreamEvent, void, undefined> {
    this.requests.push(request);
    const turn = this.turns[this.requests.length - 1] ?? [];
    for (const event of turn) {
      // Yield across a macrotask so the loop's abort checks are reachable.
      await Promise.resolve();
      yield event;
    }
  }
}

export class FailingModelClient implements ModelClient {
  constructor(private readonly error: Error) {}

  // eslint-disable-next-line require-yield
  async *stream(): AsyncGenerator<ModelStreamEvent, void, undefined> {
    throw this.error;
  }
}

export function testLogger(): Logger {
  return createSilentLogger();
}

export interface RecordedLogLine {
  readonly level: 'info' | 'warn' | 'error';
  readonly message: string;
  readonly fields: Record<string, unknown>;
}

/**
 * A logger whose output can be asserted on, for behaviour whose only observable
 * effect is a log line — cancellation, which by contract emits no event at all.
 */
export function recordingLogger(): { logger: Logger; lines: RecordedLogLine[] } {
  const lines: RecordedLogLine[] = [];
  const make = (base: Record<string, unknown>): Logger => ({
    info: (message, fields) =>
      lines.push({ level: 'info', message, fields: { ...base, ...fields } }),
    warn: (message, fields) =>
      lines.push({ level: 'warn', message, fields: { ...base, ...fields } }),
    error: (message, fields) =>
      lines.push({ level: 'error', message, fields: { ...base, ...fields } }),
    child: (fields) => make({ ...base, ...fields }),
  });
  return { logger: make({}), lines };
}
