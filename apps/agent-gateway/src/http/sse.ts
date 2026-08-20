import type { IncomingMessage, ServerResponse } from 'node:http';

import { EventEncoder } from '@ag-ui/encoder';
import type { BaseEvent } from '@ag-ui/core';

/**
 * SSE framing for a single run.
 *
 * `EventEncoder` from `@ag-ui/encoder` produces the frames rather than string
 * concatenation, so protobuf negotiation comes for free when a client asks for
 * it via `Accept`.
 *
 * The headers are ADR 001 "Response framing", and `no-transform` plus
 * `X-Accel-Buffering: no` are load-bearing. Without them an intermediate proxy
 * may buffer the whole response, and the failure is nasty precisely because it
 * looks like success: the content is correct, it just all arrives at the end.
 */
export class SseStream {
  private readonly encoder: EventEncoder;
  private closed = false;

  constructor(
    request: IncomingMessage,
    private readonly response: ServerResponse,
    private readonly now: () => number = Date.now,
  ) {
    this.encoder = new EventEncoder({ accept: request.headers.accept });

    // `response`, not `request`. Node emits `close` on the IncomingMessage when the
    // request *message* is complete — for a POST whose body has already been read,
    // that is before this constructor runs, so a listener there is dead code that
    // reads as if it were handling disconnects. `close` on the ServerResponse is
    // the event that fires when the socket goes away mid-stream.
    response.on('close', () => {
      this.closed = true;
    });
  }

  /** Flushes 200 and the headers before the loop starts, so the client sees the status now. */
  open(): void {
    this.response.statusCode = 200;
    this.response.setHeader('Content-Type', this.encoder.getContentType());
    this.response.setHeader('Cache-Control', 'no-cache, no-transform');
    this.response.setHeader('Connection', 'keep-alive');
    this.response.setHeader('X-Accel-Buffering', 'no');
    this.response.flushHeaders();
  }

  get isClosed(): boolean {
    return this.closed;
  }

  /** Returns false once the client has gone, which is the loop's signal to stop. */
  send(event: BaseEvent & Record<string, unknown>): boolean {
    if (this.closed || this.response.writableEnded) return false;
    // ADR 001: the gateway SHOULD stamp timestamps — it is what makes latency
    // debuggable from a captured stream in the field.
    this.response.write(this.encoder.encodeSSE({ timestamp: this.now(), ...event }));
    return true;
  }

  end(): void {
    if (!this.response.writableEnded) {
      this.response.end();
    }
  }
}
