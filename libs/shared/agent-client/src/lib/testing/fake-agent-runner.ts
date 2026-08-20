import type { AgentSubscriber, RunAgentParameters, RunAgentResult } from '@ag-ui/client';
import type { Interrupt, Message, State } from '@ag-ui/core';

import type { AgentRunner } from '../agent-runtime.service';

/**
 * A scripted stand-in for `HttpAgent`. Each queued script is one `POST /agent/run`: it
 * receives the subscriber and drives the callbacks the SDK would drive after normalising
 * the SSE frames, so the adapter under test sees the same sequence a real gateway produces.
 *
 * The double models `pendingInterrupts` with the same throwing behaviour as the real
 * `AbstractAgent`, because a double that cannot fail the way the SDK fails hides a whole
 * class of defect. `agent-runtime.http.spec.ts` drives the real `HttpAgent` over recorded
 * frames as the backstop for everything this cannot model.
 */
export type RunScript = (subscriber: AgentSubscriber, runner: FakeAgentRunner) => Promise<void>;

export class FakeAgentRunner implements AgentRunner {
  threadId = 'thread-1';
  messages: Message[] = [];
  state: State = {};
  headers: Record<string, string> = {};
  pendingInterrupts: Interrupt[] = [];

  readonly runs: RunAgentParameters[] = [];
  readonly headersPerRun: Array<Record<string, string>> = [];
  aborted = 0;

  private readonly subscribers: AgentSubscriber[] = [];
  private readonly scripts: RunScript[] = [];
  private failure: Error | null = null;

  script(...scripts: RunScript[]): void {
    this.scripts.push(...scripts);
  }

  failNextRunWith(error: Error): void {
    this.failure = error;
  }

  subscribe(subscriber: AgentSubscriber): { unsubscribe: () => void } {
    this.subscribers.push(subscriber);
    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(subscriber);
        if (index >= 0) this.subscribers.splice(index, 1);
      },
    };
  }

  async runAgent(
    parameters?: RunAgentParameters,
    subscriber?: AgentSubscriber,
  ): Promise<RunAgentResult> {
    this.assertInterruptsAddressed(parameters);
    this.runs.push(parameters ?? {});
    this.headersPerRun.push({ ...this.headers });

    if (this.failure) {
      const error = this.failure;
      this.failure = null;
      throw error;
    }

    const target = subscriber ?? this.subscribers[0];
    const script = this.scripts.shift();
    if (target && script) await script(target, this);
    return { result: undefined, newMessages: [] };
  }

  abortRun(): void {
    this.aborted += 1;
  }

  addMessage(message: Message): void {
    this.messages = [...this.messages, message];
  }

  setMessages(messages: Message[]): void {
    this.messages = [...messages];
  }

  /**
   * Reports a run the way a gateway ends one, and updates `pendingInterrupts` exactly as
   * `defaultApplyEvents` does on `RUN_FINISHED`: replaced by the new interrupts, or emptied
   * on success. Scripts go through this rather than calling `onRunFinishedEvent` directly,
   * so a script cannot emit an interrupt without also arming the SDK's refusal to start the
   * next run — which is the failure the adapter has to handle.
   */
  async finishRun(
    subscriber: AgentSubscriber,
    interrupts: Interrupt[] = [],
    runId = `run-${this.runs.length}`,
  ): Promise<void> {
    const params = subscriberParams(this);
    const finished = { type: 'RUN_FINISHED', threadId: this.threadId, runId };
    if (interrupts.length > 0) {
      await subscriber.onRunFinishedEvent?.({
        event: finished as never,
        ...params,
        outcome: 'interrupt',
        interrupts,
      } as never);
      this.pendingInterrupts = [...interrupts];
      return;
    }
    await subscriber.onRunFinishedEvent?.({
      event: finished as never,
      ...params,
      outcome: 'success',
      result: { stopReason: 'complete' },
    } as never);
    this.pendingInterrupts = [];
  }

  /**
   * The check `AbstractAgent.onInitialize` performs, verified against `@ag-ui/client`
   * 0.0.57. It throws *before* the fetch, so a run that leaves an interrupt unanswered
   * never reaches the gateway at all — the symptom is a connection-style error with no
   * server-side trace of the request.
   */
  private assertInterruptsAddressed(parameters?: RunAgentParameters): void {
    if (this.pendingInterrupts.length === 0) return;
    const addressed = new Set((parameters?.resume ?? []).map((entry) => entry.interruptId));
    const unaddressed = this.pendingInterrupts
      .map((interrupt) => interrupt.id)
      .filter((id) => !addressed.has(id));
    if (unaddressed.length === 0) return;
    throw new Error(
      `Thread has ${unaddressed.length} pending interrupt(s) not addressed by resume: ` +
        unaddressed.join(', '),
    );
  }
}

/** Minimal params object; the adapter only reads the event and SDK-computed extras. */
export function subscriberParams(runner: FakeAgentRunner) {
  return {
    messages: runner.messages,
    state: runner.state,
    // The adapter never touches `agent` or `input`, so structural stand-ins are enough.
    agent: runner as never,
    input: { threadId: runner.threadId, runId: 'run-1' } as never,
  };
}
