import { EventType, type BaseEvent } from '@ag-ui/core';

/**
 * SSE frames recorded from `apps/agent-gateway`, replayed at the real
 * `@ag-ui/client` `HttpAgent` rather than at a hand-written double.
 *
 * This exists because the worst defects in this adapter were invisible to a scripted
 * double. `AbstractAgent` keeps a `pendingInterrupts` list and refuses — before the
 * fetch — to start a run that does not address it, and the gateway ends every
 * frontend-tool turn with *both* `TOOL_CALL_CHUNK` frames and an interrupt for the
 * same `toolCallId`. Only a real agent fed real frames exercises that pair.
 *
 * The shapes are the gateway's, verbatim: `TOOL_CALL_CHUNK` opens with `toolCallId`
 * plus `toolCallName` and continues with `delta` only (SDK rule 2), and the interrupt
 * carries `id === toolCallId`, `reason` = the tool name, a human `message`, and
 * `metadata: { kind: 'client_tool', toolName, args }`.
 */

type GatewayEvent = BaseEvent & Record<string, unknown>;

/** `metadata.kind` the gateway stamps on every frontend-tool interrupt. */
export const CLIENT_TOOL_INTERRUPT_KIND = 'client_tool';

/** One `data: <json>\n\n` frame, which is what `SseStream` writes through `EventEncoder`. */
export function sseFrame(event: GatewayEvent): string {
  return `data: ${JSON.stringify({ timestamp: 1, ...event })}\n\n`;
}

export function sseBody(...events: GatewayEvent[]): string {
  return events.map(sseFrame).join('');
}

export interface RecordedInterrupt {
  readonly toolCallId: string;
  readonly toolName: string;
  readonly args: Record<string, unknown>;
  readonly message?: string;
}

export function runStarted(runId: string): GatewayEvent {
  return { type: EventType.RUN_STARTED, threadId: 'thread-1', runId };
}

export function textChunk(messageId: string, delta: string): GatewayEvent {
  return { type: EventType.TEXT_MESSAGE_CHUNK, messageId, role: 'assistant', delta };
}

/** The opening chunk of a call, then one delta carrying the whole argument JSON. */
export function toolCallChunks(
  toolCallId: string,
  toolCallName: string,
  args: Record<string, unknown>,
): GatewayEvent[] {
  return [
    { type: EventType.TOOL_CALL_CHUNK, toolCallId, toolCallName },
    { type: EventType.TOOL_CALL_CHUNK, toolCallId, delta: JSON.stringify(args) },
  ];
}

export function runFinishedSuccess(runId: string): GatewayEvent {
  return {
    type: EventType.RUN_FINISHED,
    threadId: 'thread-1',
    runId,
    outcome: { type: 'success' },
    result: { stopReason: 'complete', steps: 1 },
  };
}

/** `RUN_FINISHED` with AG-UI's own interrupt outcome, as `describeInterrupt` builds it. */
export function runFinishedInterrupt(
  runId: string,
  ...interrupts: RecordedInterrupt[]
): GatewayEvent {
  return {
    type: EventType.RUN_FINISHED,
    threadId: 'thread-1',
    runId,
    outcome: {
      type: 'interrupt',
      interrupts: interrupts.map((interrupt) => ({
        id: interrupt.toolCallId,
        reason: interrupt.toolName,
        message: interrupt.message ?? `The assistant wants to run ${interrupt.toolName}.`,
        toolCallId: interrupt.toolCallId,
        metadata: {
          kind: CLIENT_TOOL_INTERRUPT_KIND,
          toolName: interrupt.toolName,
          args: interrupt.args,
        },
      })),
    },
  };
}

/** A turn that streams frontend tool calls and hands the run back on an interrupt. */
export function frontendToolTurn(
  runId: string,
  interrupts: RecordedInterrupt[],
  text?: string,
): string {
  return sseBody(
    runStarted(runId),
    ...(text ? [textChunk(`msg-${runId}`, text)] : []),
    ...interrupts.flatMap((interrupt) =>
      toolCallChunks(interrupt.toolCallId, interrupt.toolName, interrupt.args),
    ),
    runFinishedInterrupt(runId, ...interrupts),
  );
}

/** A plain answering turn with no tool call. */
export function answeringTurn(runId: string, text: string): string {
  return sseBody(runStarted(runId), textChunk(`msg-${runId}`, text), runFinishedSuccess(runId));
}

/**
 * A turn that speaks, calls a gateway-side tool, and speaks again — the shape of demo
 * beats 1 and 4, and the only shape that shows whether the transcript keeps the order
 * the run actually happened in.
 */
export function narratedToolTurn(
  runId: string,
  opening: string,
  call: { toolCallId: string; toolName: string; args: Record<string, unknown>; result: string },
  closing: string,
): string {
  return sseBody(
    runStarted(runId),
    textChunk(`msg-${runId}-opening`, opening),
    ...toolCallChunks(call.toolCallId, call.toolName, call.args),
    {
      type: EventType.TOOL_CALL_RESULT,
      messageId: `result-${runId}`,
      toolCallId: call.toolCallId,
      content: call.result,
      role: 'tool',
    },
    textChunk(`msg-${runId}-closing`, closing),
    runFinishedSuccess(runId),
  );
}
