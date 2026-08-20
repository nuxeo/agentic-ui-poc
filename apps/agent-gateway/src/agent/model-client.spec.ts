import { describe, expect, it } from 'vitest';

import { HaipModelClient, readSseData, toModelStreamEvents } from './model-client';

async function* bytes(...chunks: string[]): AsyncGenerator<Uint8Array, void, undefined> {
  const encoder = new TextEncoder();
  for (const chunk of chunks) yield encoder.encode(chunk);
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const item of iterable) output.push(item);
  return output;
}

describe('readSseData', () => {
  it('yields one payload per frame', async () => {
    const frames = await collect(readSseData(bytes('data: {"a":1}\n\n', 'data: {"a":2}\n\n')));
    expect(frames).toEqual(['{"a":1}', '{"a":2}']);
  });

  // The classic streaming bug: a frame split across two TCP reads. Buffering has
  // to survive it, and it is far easier to prove here than through a live socket.
  it('reassembles a frame split across chunk boundaries', async () => {
    const frames = await collect(readSseData(bytes('data: {"a"', ':1}\n', '\ndata: [DONE]\n\n')));
    expect(frames).toEqual(['{"a":1}', '[DONE]']);
  });

  it('emits a trailing frame that was never terminated by a blank line', async () => {
    expect(await collect(readSseData(bytes('data: {"a":1}')))).toEqual(['{"a":1}']);
  });

  it('ignores comment and event-name lines', async () => {
    const frames = await collect(readSseData(bytes(': keep-alive\n\nevent: ping\n\ndata: x\n\n')));
    expect(frames).toEqual(['x']);
  });
});

describe('toModelStreamEvents', () => {
  it('maps content deltas to text events', () => {
    const events = toModelStreamEvents(
      { choices: [{ delta: { content: 'Hello' } }] },
      new Set<number>(),
    );
    expect(events).toEqual([{ type: 'text', delta: 'Hello' }]);
  });

  // AG-UI requires toolCallId AND toolCallName on the opening chunk and neither
  // afterwards; the wire format sends them only once, on the first delta.
  it('announces a tool call once, then emits argument deltas only', () => {
    const started = new Set<number>();

    const first = toModelStreamEvents(
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call-1',
                  function: { name: 'nuxeo.getDocument', arguments: '{"u' },
                },
              ],
            },
          },
        ],
      },
      started,
    );
    const second = toModelStreamEvents(
      { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: 'id":"a"}' } }] } }] },
      started,
    );

    expect(first).toEqual([
      { type: 'tool-call-start', index: 0, id: 'call-1', name: 'nuxeo.getDocument' },
      { type: 'tool-call-delta', index: 0, delta: '{"u' },
    ]);
    expect(second).toEqual([{ type: 'tool-call-delta', index: 0, delta: 'id":"a"}' }]);
  });

  it('waits for the delta that carries the tool name before announcing the call', () => {
    const started = new Set<number>();
    const events = toModelStreamEvents(
      { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '{}' } }] } }] },
      started,
    );

    expect(events).toEqual([]);
    expect(started.size).toBe(0);
  });

  it('normalises finish reasons, including the legacy function_call name', () => {
    expect(
      toModelStreamEvents({ choices: [{ finish_reason: 'function_call' }] }, new Set()),
    ).toEqual([{ type: 'finish', reason: 'tool_calls' }]);
    expect(toModelStreamEvents({ choices: [{ finish_reason: 'weird' }] }, new Set())).toEqual([
      { type: 'finish', reason: 'unknown' },
    ]);
  });

  it('ignores a chunk with no choices', () => {
    expect(toModelStreamEvents({}, new Set())).toEqual([]);
  });
});

describe('HaipModelClient', () => {
  function sseResponse(body: string): Response {
    return new Response(body, {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    });
  }

  it('sends the model, the tools and the bearer credential, and streams events', async () => {
    let captured: { url: string; init?: RequestInit } | undefined;
    const client = new HaipModelClient({
      baseUrl: 'https://haip.test/v1/',
      apiKey: 'secret-key',
      fetchImpl: async (url, init) => {
        captured = { url, init };
        return sseResponse('data: {"choices":[{"delta":{"content":"hi"}}]}\n\ndata: [DONE]\n\n');
      },
    });

    const events = await collect(
      client.stream({
        model: 'test-model',
        messages: [{ role: 'user', content: 'hello' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 't',
              description: 'd',
              parameters: { type: 'object', properties: {} },
            },
          },
        ],
        signal: new AbortController().signal,
      }),
    );

    expect(captured?.url).toBe('https://haip.test/v1/chat/completions');
    expect((captured?.init?.headers as Record<string, string>)['authorization']).toBe(
      'Bearer secret-key',
    );
    const body = JSON.parse(String(captured?.init?.body));
    expect(body).toMatchObject({ model: 'test-model', stream: true, tool_choice: 'auto' });
    expect(events).toEqual([{ type: 'text', delta: 'hi' }]);
  });

  it('serialises assistant tool calls and tool results into the wire format', async () => {
    let body: Record<string, unknown> = {};
    const client = new HaipModelClient({
      baseUrl: 'https://haip.test/v1',
      apiKey: 'k',
      fetchImpl: async (_url, init) => {
        body = JSON.parse(String(init?.body));
        return sseResponse('data: [DONE]\n\n');
      },
    });

    await collect(
      client.stream({
        model: 'm',
        messages: [
          { role: 'assistant', content: '', toolCalls: [{ id: 'c1', name: 'n', arguments: '{}' }] },
          { role: 'tool', content: '{"ok":true}', toolCallId: 'c1' },
        ],
        tools: [],
        signal: new AbortController().signal,
      }),
    );

    expect(body['messages']).toEqual([
      {
        role: 'assistant',
        content: '',
        tool_calls: [{ id: 'c1', type: 'function', function: { name: 'n', arguments: '{}' } }],
      },
      { role: 'tool', content: '{"ok":true}', tool_call_id: 'c1' },
    ]);
    expect(body['tools']).toBeUndefined();
  });

  it('raises ModelRequestError on a non-200 from the gateway', async () => {
    const client = new HaipModelClient({
      baseUrl: 'https://haip.test/v1',
      apiKey: 'k',
      fetchImpl: async () => new Response('rate limited', { status: 429 }),
    });

    await expect(
      collect(
        client.stream({
          model: 'm',
          messages: [],
          tools: [],
          signal: new AbortController().signal,
        }),
      ),
    ).rejects.toMatchObject({ status: 429 });
  });

  it('skips a keep-alive frame instead of failing the run', async () => {
    const client = new HaipModelClient({
      baseUrl: 'https://haip.test/v1',
      apiKey: 'k',
      fetchImpl: async () =>
        sseResponse('data: not-json\n\ndata: {"choices":[{"delta":{"content":"ok"}}]}\n\n'),
    });

    const events = await collect(
      client.stream({
        model: 'm',
        messages: [],
        tools: [],
        signal: new AbortController().signal,
      }),
    );

    expect(events).toEqual([{ type: 'text', delta: 'ok' }]);
  });
});
