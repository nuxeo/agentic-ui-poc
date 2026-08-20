import type {
  ModelClient,
  ModelRequest,
  ModelStreamEvent,
  ModelMessage,
} from '../agent/model-client';
import type { Logger } from '../logging/logger';
import type { DemoFacts, DemoScript, DemoTurnBody } from './demo-script.types';

/**
 * A `ModelClient` that replays a script instead of calling a model.
 *
 * It is deliberately the *only* substituted component. `runAgent` frames the
 * events, the registry executes the tools, `NuxeoRestClient` talks to Nuxeo as the
 * caller, and `sse.ts` writes the wire format — all unchanged. What the browser
 * receives is therefore not a simulation of the protocol; it is the protocol, with a
 * fixed transcript behind it.
 *
 * ## Why it is stateless
 *
 * A conversation spans several `POST /agent/run` requests: the browser resumes an
 * approval with a new run, and a cancelled run leaves nothing behind. A client that
 * held a cursor would desynchronise the first time a user cancelled and retried, and
 * would be wrong outright if two people demoed against one gateway. So the position
 * in the script is *derived* from the conversation the loop hands over, the same way
 * a real model has to work it out from the messages: every scripted turn either ends
 * in a tool call or ends the run, so the number of tool results since the last user
 * message is the number of turns already replayed.
 */

/** `speed` multiplies delays: 2 is twice as fast. Tests use a large number. */
export interface DemoModelClientOptions {
  readonly scripts: readonly DemoScript[];
  readonly speed: number;
  readonly logger: Logger;
}

/** Timing at speed 1. Tuned to read as "thinking", not as "lagging". */
const TIMING = {
  /** Between text chunks. ~25 chars a chunk gives a comfortable reading pace. */
  textChunkMs: 45,
  /** Before the first token, so the thinking step is legible before text arrives. */
  firstTokenMs: 260,
  /** Between thinking steps. */
  thinkingMs: 320,
  /** Before a tool call opens, and between its argument chunks. */
  toolCallMs: 220,
} as const;

/** Characters per streamed text chunk. Word-aligned, so the pace looks like typing. */
const TEXT_CHUNK_CHARS = 25;

const DEFAULT_ARG_CHUNKS = 2;

/**
 * Message of the rejection a cancelled pause throws.
 *
 * It never reaches the user: `runAgent` returns without a terminal event when
 * `signal.aborted`, which is precisely what ADR 001 requires of a cancelled run.
 */
export const CANCELLED = 'demo run cancelled';

export function createDemoModelClient(options: DemoModelClientOptions): ModelClient {
  return {
    stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
      return replay(options, request);
    },
  };
}

/* ------------------------------------------------------------------ selection */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The prompt that started the current exchange. */
function lastUserMessage(messages: readonly ModelMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === 'user') return message.content;
  }
  return '';
}

/**
 * Picks the script for a prompt: exact normalised match first, then trigger
 * substrings.
 *
 * Exact-first matters because the runbook prints a sentence for the driver to type
 * and that sentence must select the beat it documents, even if another script's
 * trigger happens to appear in it.
 */
export function selectScript(
  scripts: readonly DemoScript[],
  prompt: string,
): DemoScript | undefined {
  const normalized = normalize(prompt);
  if (!normalized) return undefined;

  const exact = scripts.find((script) => normalize(script.prompt) === normalized);
  if (exact) return exact;

  return scripts.find((script) =>
    script.triggers.some((trigger) => normalized.includes(normalize(trigger))),
  );
}

/**
 * What the gateway says when it does not recognise the prompt.
 *
 * A demo gateway must never improvise. Saying "I do not have a script for that,
 * here are the ones I have" is recoverable in front of an audience; a plausible
 * invented answer is not, and neither is silence.
 */
export function unmatchedPromptText(scripts: readonly DemoScript[]): string {
  const list = scripts.map((script) => `- "${script.prompt}"`).join('\n');
  return [
    'This gateway is running in scripted demo mode, so it has no model behind it and will not ' +
      'improvise an answer. Ask me one of these instead:',
    '',
    list,
  ].join('\n');
}

/* -------------------------------------------------------------- turn position */

/**
 * Tool results seen since the last user message — which is the number of scripted
 * turns already replayed for this prompt.
 *
 * Holds across requests because the browser resends the whole conversation, and
 * because `runAgent` turns a `resume` entry into exactly one tool message. A
 * frontend tool that was never answered leaves no tool message, so an abandoned
 * approval replays its own turn again rather than skipping ahead.
 */
export function turnIndexFrom(messages: readonly ModelMessage[]): number {
  const sinceLastUser: ModelMessage[] = [];
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message === undefined || message.role === 'user') break;
    sinceLastUser.push(message);
  }
  return sinceLastUser.filter((message) => message.role === 'tool').length;
}

/**
 * Whether the most recent tool result was a declined approval.
 *
 * Three shapes reach here, all legitimate, because ADR 001 lets a client resume
 * either way and `runAgent` normalises `resume` into a tool message:
 *
 *   {"status":"cancelled"}                             — resume, cancelled
 *   {"status":"resolved","result":{"approved":false}}  — resume, resolved with a verdict
 *   {"approved":false,"reason":"…"}                    — a role:"tool" message
 *
 * Anything unparseable counts as *not* declined, so the failure mode of a
 * malformed answer is the approved branch — which is wrong, but the approved branch
 * asks the user again through a real tool card rather than silently doing nothing.
 */
export function lastApprovalDeclined(messages: readonly ModelMessage[]): boolean {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message === undefined || message.role === 'user') return false;
    if (message.role !== 'tool') continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(message.content);
    } catch {
      return false;
    }
    if (!parsed || typeof parsed !== 'object') return false;
    const record = parsed as Record<string, unknown>;

    if (record['status'] === 'cancelled') return true;
    if (record['approved'] === false) return true;
    const result = record['result'];
    if (result && typeof result === 'object') {
      return (result as Record<string, unknown>)['approved'] === false;
    }
    return false;
  }
  return false;
}

/**
 * Tool results for this exchange, keyed by `toolCallId`, so a scripted step can
 * compute its arguments from data only the live repository knows.
 */
export function factsFrom(messages: readonly ModelMessage[]): DemoFacts {
  const resultsByToolCallId: Record<string, unknown> = {};
  const results: unknown[] = [];
  for (const message of messages) {
    if (message.role !== 'tool') continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(message.content);
    } catch {
      continue;
    }
    resultsByToolCallId[message.toolCallId] = parsed;
    results.push(parsed);
  }
  return { resultsByToolCallId, results };
}

/* ------------------------------------------------------------------- replaying */

/** Word-aligned chunks, so text does not break mid-word on screen. */
export function chunkText(text: string, size = TEXT_CHUNK_CHARS): string[] {
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    let end = Math.min(cursor + size, text.length);
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > cursor) end = space + 1;
    }
    chunks.push(text.slice(cursor, end));
    cursor = end;
  }
  return chunks;
}

/** Splits an argument string into `count` pieces so the tool card fills in. */
export function chunkArguments(args: string, count: number): string[] {
  const pieces = Math.max(1, Math.min(count, args.length));
  const size = Math.ceil(args.length / pieces);
  const chunks: string[] = [];
  for (let cursor = 0; cursor < args.length; cursor += size) {
    chunks.push(args.slice(cursor, cursor + size));
  }
  return chunks.length > 0 ? chunks : [args];
}

/**
 * Sleeps, unless the run has been cancelled.
 *
 * Rejecting on abort rather than returning early is what makes cancellation
 * immediate: the generator unwinds at the first `await`, so a run cancelled during
 * a pause stops there instead of finishing the turn it was in. `runAgent` checks
 * `signal.aborted` before it treats a throw as an error, so the rejection never
 * reaches the user as a failed run.
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(new Error(CANCELLED));
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    let onAbort: () => void = () => undefined;
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    onAbort = () => {
      clearTimeout(timer);
      reject(new Error(CANCELLED));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function resolveBody(script: DemoScript, index: number, declined: boolean): DemoTurnBody | 'end' {
  const turn = script.turns[index];
  if (!turn) return 'end';
  if (declined && turn.ifDeclined) return turn.ifDeclined;
  return turn;
}

async function* replay(
  options: DemoModelClientOptions,
  request: ModelRequest,
): AsyncGenerator<ModelStreamEvent, void, undefined> {
  const { scripts, speed, logger } = options;
  const { messages, signal } = request;
  const scaled = (ms: number): number => Math.max(0, Math.round(ms / Math.max(speed, 0.01)));
  const pause = (ms: number): Promise<void> => delay(scaled(ms), signal);

  const prompt = lastUserMessage(messages);
  const script = selectScript(scripts, prompt);
  if (!script) {
    logger.warn('demo prompt did not match a script', { prompt });
    yield* streamText(unmatchedPromptText(scripts), pause);
    yield { type: 'finish', reason: 'stop' };
    return;
  }

  const index = turnIndexFrom(messages);
  const body = resolveBody(script, index, lastApprovalDeclined(messages));
  if (body === 'end') {
    // Past the end of the script: the audience asked a follow-up inside a finished
    // beat. Say so rather than replaying turn 0 and looping forever.
    logger.info('demo script exhausted', { script: script.id, turn: index });
    yield* streamText(
      'That is the end of this scripted beat. Start a new question to run another one.',
      pause,
    );
    yield { type: 'finish', reason: 'stop' };
    return;
  }

  logger.info('replaying demo turn', { script: script.id, turn: index });
  yield* streamTurn(body, { pause, facts: factsFrom(messages) });
}

interface ReplayContext {
  readonly pause: (ms: number) => Promise<void>;
  readonly facts: DemoFacts;
}

async function* streamText(
  text: string,
  pause: (ms: number) => Promise<void>,
): AsyncGenerator<ModelStreamEvent, void, undefined> {
  await pause(TIMING.firstTokenMs);
  let first = true;
  for (const chunk of chunkText(text)) {
    if (!first) await pause(TIMING.textChunkMs);
    first = false;
    yield { type: 'text', delta: chunk };
  }
}

async function* streamTurn(
  body: DemoTurnBody,
  context: ReplayContext,
): AsyncGenerator<ModelStreamEvent, void, undefined> {
  const { pause, facts } = context;
  if (body.pauseMs) await pause(body.pauseMs);

  for (const step of body.thinking ?? []) {
    yield {
      type: 'thinking',
      id: step.id,
      label: step.label,
      ...(step.detail ? { detail: step.detail } : {}),
    };
    await pause(TIMING.thinkingMs);
  }

  const args = body.toolCall
    ? typeof body.toolCall.args === 'function'
      ? body.toolCall.args(facts)
      : body.toolCall.args
    : '';
  // An empty computed argument set means the live data this step needed is not
  // there. `ifSkipped` — which the script validator insists on — replaces the call.
  const skipped = Boolean(body.toolCall) && args === '';

  const text = typeof body.text === 'function' ? body.text(facts) : body.text;
  const spoken = skipped ? (body.toolCall?.ifSkipped ?? text) : text;
  if (spoken) yield* streamText(spoken, pause);

  // Close the thinking steps once the turn's visible work is done, so the panel
  // stops showing a spinner on a step that has finished.
  for (const step of body.thinking ?? []) {
    yield { type: 'thinking', id: step.id, label: step.label, done: true };
  }

  if (!body.toolCall || skipped) {
    yield { type: 'finish', reason: 'stop' };
    return;
  }

  await pause(TIMING.toolCallMs);
  yield { type: 'tool-call-start', index: 0, id: body.toolCall.id, name: body.toolCall.name };
  const chunks = chunkArguments(args, body.toolCall.argChunks ?? DEFAULT_ARG_CHUNKS);
  for (const chunk of chunks) {
    await pause(TIMING.toolCallMs);
    yield { type: 'tool-call-delta', index: 0, delta: chunk };
  }
  yield { type: 'finish', reason: 'tool_calls' };
}
