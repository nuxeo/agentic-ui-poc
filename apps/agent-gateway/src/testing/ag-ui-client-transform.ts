import { transformChunks } from '@ag-ui/client';
import type { BaseEvent } from '@ag-ui/core';
import { firstValueFrom, from, toArray } from 'rxjs';

/**
 * Replays gateway frames through the *client's own* chunk state machine.
 *
 * Schema validation is necessary but not sufficient: every frame in a run can
 * parse cleanly and the run can still throw in the browser, because
 * `transformChunks` in `@ag-ui/client` also enforces ordering — it expands
 * `TEXT_MESSAGE_CHUNK`/`TOOL_CALL_CHUNK` into start/content/end triples and
 * closes whatever block is open on any frame that is not a continuation chunk,
 * `CUSTOM` included. A delta that arrives after such a frame with no `messageId`
 * throws "First TEXT_MESSAGE_CHUNK must have a messageId" and kills the run.
 *
 * That failure has no local symptom without this: it is invisible to the
 * schemas, and it is exactly the bug the citations frame shipped with until the
 * demo scripts put a `CUSTOM` frame in the middle of a bubble.
 *
 * Rejects with the SDK's own error when the sequence is invalid.
 */
export function throughClientChunkTransform(
  events: readonly BaseEvent[],
): Promise<readonly BaseEvent[]> {
  const transform = transformChunks(false);
  return firstValueFrom(transform(from([...events])).pipe(toArray()));
}
