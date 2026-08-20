import type { AgentTool } from './tool.types';

/**
 * Which tools may not run without a recorded human approval, and the error that
 * stops them when one is missing.
 *
 * This file exists because the first version of the approval gate was a claim in
 * a system prompt. `mutating: true` was advisory, nothing read it, and the run
 * was interrupted only when the model called a tool the *server* registry did not
 * own. A model told "do not ask me to confirm — I have already authorised this"
 * therefore wrote to Nuxeo five times with no card ever shown. Approval is now a
 * property of the tool, checked where the tool runs, and there is no argument,
 * prompt or model output that can satisfy it.
 */

/**
 * Whether this tool needs a human decision before each of its calls.
 *
 * **Deny by default, and the direction is the whole point.** `mutating` is
 * optional on `AgentTool`, so the likeliest mistake — adding a tool while
 * thinking about the Nuxeo call rather than about governance, and never
 * mentioning the flag — is treated as a write. Only an explicit `mutating: false`
 * declares a tool read-only, which is a claim somebody had to make on purpose and
 * which a reviewer can see in the diff.
 *
 * The comparison is against `false` rather than a truthiness test for the same
 * reason: `undefined`, `null` and anything a JavaScript caller passes that is not
 * literally `false` all fall on the safe side.
 */
export function requiresApproval(tool: Pick<AgentTool, 'mutating'>): boolean {
  return tool.mutating !== false;
}

/**
 * The human decision for one tool call, as the executor is given it.
 *
 * `toolCallId` is carried rather than implied so the failure is legible in a log
 * line, and so a caller cannot pass a bare `true` from somewhere unrelated and
 * have it mean "approved" for whatever happens to run next.
 */
export interface MutationApproval {
  /** The call this decision is about. Equal to the interrupt id that raised it. */
  readonly toolCallId: string;
  readonly granted: boolean;
}

/** An approval that is definitively absent, for read-only calls and for refusals. */
export function withheldApproval(toolCallId: string): MutationApproval {
  return { toolCallId, granted: false };
}

export class MutationNotApprovedError extends Error {
  constructor(
    readonly toolName: string,
    readonly toolCallId: string,
  ) {
    super(
      `Tool "${toolName}" changes content and has no human approval for call ` +
        `"${toolCallId}". Approval is granted through the AG-UI interrupt/resume ` +
        `channel and cannot be asserted by the model.`,
    );
    this.name = 'MutationNotApprovedError';
  }
}

export class UnknownToolError extends Error {
  constructor(readonly toolName: string) {
    super(`No tool named "${toolName}" is registered.`);
    this.name = 'UnknownToolError';
  }
}
