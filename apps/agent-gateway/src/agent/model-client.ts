import type { ModelToolSchema } from '../tools/tool-registry';

/**
 * The model side of the loop.
 *
 * `ModelClient` is an interface, not a class, so the agent loop can be tested
 * without a network or an API key — which matters more than usual here, because
 * the interesting behaviour of the loop is event ordering, not model output.
 *
 * `HaipModelClient` speaks the OpenAI-compatible streaming chat-completions
 * shape that the HAIP gateway exposes. `HAIP_API_KEY` is the one credential this
 * process holds and it goes nowhere except this request.
 */

export interface ModelToolCallMessagePart {
  readonly id: string;
  readonly name: string;
  readonly arguments: string;
}

export type ModelMessage =
  | { readonly role: 'system' | 'user'; readonly content: string }
  | {
      readonly role: 'assistant';
      readonly content: string;
      readonly toolCalls?: readonly ModelToolCallMessagePart[];
    }
  | { readonly role: 'tool'; readonly content: string; readonly toolCallId: string };

export interface ModelRequest {
  readonly model: string;
  readonly messages: readonly ModelMessage[];
  readonly tools: readonly ModelToolSchema[];
  readonly signal: AbortSignal;
}

export type ModelStreamEvent =
  | { readonly type: 'text'; readonly delta: string }
  | {
      readonly type: 'tool-call-start';
      readonly index: number;
      readonly id: string;
      readonly name: string;
    }
  | { readonly type: 'tool-call-delta'; readonly index: number; readonly delta: string }
  /**
   * A step in the model's own reasoning, surfaced to the user as a thinking step
   * rather than as transcript text.
   *
   * Separate from `text` because the two render in different places and must not
   * be confused: reasoning is a progress indicator that disappears when the run
   * ends, while text is the answer that stays. `label` is what the user reads;
   * `detail` is the optional second line. `done` closes an open step.
   */
  | {
      readonly type: 'thinking';
      readonly id: string;
      readonly label: string;
      readonly detail?: string;
      readonly done?: boolean;
    }
  | { readonly type: 'finish'; readonly reason: ModelFinishReason };

export type ModelFinishReason = 'stop' | 'tool_calls' | 'length' | 'content_filter' | 'unknown';

export interface ModelClient {
  stream(request: ModelRequest): AsyncIterable<ModelStreamEvent>;
}

export class ModelRequestError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(`Model gateway returned ${status}`);
    this.name = 'ModelRequestError';
  }
}

/**
 * Splits an SSE byte stream into `data:` payloads. Exported because chunk
 * boundaries are the classic source of streaming bugs — a frame split mid-JSON
 * across two TCP reads — and that is far easier to test directly than through a
 * live HTTP response.
 */
export async function* readSseData(
  stream: AsyncIterable<Uint8Array>,
): AsyncGenerator<string, void, undefined> {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const payload = frameData(frame);
      if (payload !== undefined) yield payload;
      boundary = buffer.indexOf('\n\n');
    }
  }

  const tail = frameData(buffer);
  if (tail !== undefined) yield tail;
}

function frameData(frame: string): string | undefined {
  const lines = frame
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.startsWith('data:'));
  if (lines.length === 0) return undefined;
  return lines.map((line) => line.slice('data:'.length).trimStart()).join('\n');
}

interface OpenAiStreamDelta {
  readonly content?: string | null;
  /** Reasoning traces. `reasoning_content` is the widely-adopted spelling; some gateways send `reasoning`. */
  readonly reasoning_content?: string | null;
  readonly reasoning?: string | null;
  readonly tool_calls?: readonly {
    readonly index?: number;
    readonly id?: string;
    readonly function?: { readonly name?: string; readonly arguments?: string };
  }[];
}

interface OpenAiStreamChunk {
  readonly choices?: readonly {
    readonly delta?: OpenAiStreamDelta;
    readonly finish_reason?: string | null;
  }[];
}

/**
 * The single thinking step reasoning deltas accumulate into.
 *
 * One step rather than one per delta: the client's `startThinkingStep` replaces a
 * step's detail rather than appending to it, so a stable id plus the running
 * buffer is what makes reasoning read as it arrives instead of flickering.
 */
export const REASONING_STEP_ID = 'reasoning';

/** Mutable accumulator for the reasoning buffer across chunks of one turn. */
export interface ReasoningBuffer {
  text: string;
}

function readReasoningDelta(delta: OpenAiStreamDelta | undefined): string {
  const raw = delta?.reasoning_content ?? delta?.reasoning;
  return typeof raw === 'string' ? raw : '';
}

function toFinishReason(raw: string): ModelFinishReason {
  switch (raw) {
    case 'stop':
    case 'tool_calls':
    case 'length':
    case 'content_filter':
      return raw;
    // Some gateways still emit the pre-parallel-tool-call name.
    case 'function_call':
      return 'tool_calls';
    default:
      return 'unknown';
  }
}

/**
 * Turns one decoded chunk into AG-UI-shaped events.
 *
 * The `startedToolCalls` set exists because the streaming format sends a tool
 * call's `id` and `name` only on its first delta, while the AG-UI SDK requires
 * both on the first `TOOL_CALL_CHUNK` and neither afterwards. Tracking which
 * indices have been announced is what keeps those two rules compatible.
 */
export function toModelStreamEvents(
  payload: unknown,
  startedToolCalls: Set<number>,
  reasoning: ReasoningBuffer = { text: '' },
): ModelStreamEvent[] {
  const chunk = payload as OpenAiStreamChunk;
  const choice = chunk.choices?.[0];
  if (!choice) return [];

  const events: ModelStreamEvent[] = [];

  const reasoningDelta = readReasoningDelta(choice.delta);
  if (reasoningDelta.length > 0) {
    reasoning.text += reasoningDelta;
    events.push({
      type: 'thinking',
      id: REASONING_STEP_ID,
      label: 'Reasoning',
      detail: reasoning.text,
    });
  }

  const content = choice.delta?.content;
  if (typeof content === 'string' && content.length > 0) {
    events.push({ type: 'text', delta: content });
  }

  for (const call of choice.delta?.tool_calls ?? []) {
    const index = call.index ?? 0;
    if (!startedToolCalls.has(index)) {
      const id = call.id ?? `call_${index}`;
      const name = call.function?.name;
      // A first delta without a name is unusable: AG-UI requires toolCallName on
      // the opening chunk. Wait for the delta that carries it.
      if (!name) continue;
      startedToolCalls.add(index);
      events.push({ type: 'tool-call-start', index, id, name });
    }
    const argumentsDelta = call.function?.arguments;
    if (typeof argumentsDelta === 'string' && argumentsDelta.length > 0) {
      events.push({ type: 'tool-call-delta', index, delta: argumentsDelta });
    }
  }

  if (choice.finish_reason) {
    // Close the reasoning step before the turn ends, or it stays spinning until
    // the whole run finishes.
    if (reasoning.text.length > 0) {
      events.push({ type: 'thinking', id: REASONING_STEP_ID, label: 'Reasoning', done: true });
    }
    events.push({ type: 'finish', reason: toFinishReason(choice.finish_reason) });
  }
  return events;
}

function toWireMessage(message: ModelMessage): Record<string, unknown> {
  if (message.role === 'tool') {
    return { role: 'tool', content: message.content, tool_call_id: message.toolCallId };
  }
  if (message.role === 'assistant' && message.toolCalls?.length) {
    return {
      role: 'assistant',
      content: message.content,
      tool_calls: message.toolCalls.map((call) => ({
        id: call.id,
        type: 'function',
        function: { name: call.name, arguments: call.arguments },
      })),
    };
  }
  return { role: message.role, content: message.content };
}

export interface HaipModelClientOptions {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>;
}

export class HaipModelClient implements ModelClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: (input: string, init?: RequestInit) => Promise<Response>;

  constructor(options: HaipModelClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async *stream(request: ModelRequest): AsyncGenerator<ModelStreamEvent, void, undefined> {
    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        stream: true,
        messages: request.messages.map(toWireMessage),
        ...(request.tools.length > 0 ? { tools: request.tools, tool_choice: 'auto' } : {}),
      }),
      signal: request.signal,
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '');
      throw new ModelRequestError(response.status, detail.slice(0, 512));
    }

    const startedToolCalls = new Set<number>();
    const reasoning: ReasoningBuffer = { text: '' };
    for await (const data of readSseData(response.body as AsyncIterable<Uint8Array>)) {
      if (data === '[DONE]') return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch {
        // A gateway keep-alive or comment frame. Ignore rather than fail the run.
        continue;
      }
      yield* toModelStreamEvents(parsed, startedToolCalls, reasoning);
    }
  }
}
