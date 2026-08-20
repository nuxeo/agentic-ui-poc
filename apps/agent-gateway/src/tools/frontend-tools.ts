import type { FrontendToolContract } from './tool.types';

/**
 * Human-in-the-loop tools: declared by the browser in `RunAgentInput.tools`,
 * executed by the browser, never by the gateway.
 *
 * How a turn using one of these actually plays out, because it is the part most
 * easily got wrong on either side:
 *
 *  1. The client sends its tool declarations in `RunAgentInput.tools`. The
 *     gateway merges them with the server-side registry and offers both to the
 *     model. It does not need to recognise the names — anything the client
 *     declares that the registry does not own is treated as client-executed.
 *  2. The model calls one. The gateway streams the `TOOL_CALL_CHUNK` frames so
 *     the client can render the prompt as the arguments arrive, then ends the
 *     run with AG-UI's own interrupt outcome:
 *
 *       RUN_FINISHED { outcome: { type: "interrupt", interrupts: [
 *         { id, reason: "client_tool", toolCallId, metadata: { toolName, arguments } }
 *       ] } }
 *
 *     `id` is the `toolCallId`. The gateway does not invent a result and does
 *     not hang waiting for one.
 *  3. The client renders its UI, gets the human decision, and starts a **new
 *     run**. Either resumption form works, and they can be combined:
 *
 *       - `resume: [{ interruptId, status: "resolved" | "cancelled", payload }]`,
 *         where `payload` is the JSON in `result` below; or
 *       - a `role: "tool"` message whose `toolCallId` matches and whose
 *         `content` is that JSON, stringified.
 *
 *     A `resume` entry already answered by a tool message is ignored, so a
 *     client that sends both does not double-answer the model.
 *
 * The `result` schemas are the contract the client implements against. A tool
 * message that does not match is not rejected — the model simply sees whatever
 * was sent — so keep them in step.
 */

export const confirmActionTool: FrontendToolContract = {
  name: 'confirmAction',
  description:
    'Ask the user to approve an action before it runs. Use this before anything that ' +
    'creates, modifies, moves or deletes content in Nuxeo.',
  parameters: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'One sentence describing what will happen.' },
      action: { type: 'string', description: 'Machine-readable identifier for the action.' },
      details: { type: 'string', description: 'Optional extra context for the user.' },
    },
    required: ['summary'],
  },
  // The verdict, not a tool output: `confirmAction` has no browser handler,
  // because the approval prompt itself is the answer the agent is waiting for.
  result: {
    type: 'object',
    properties: {
      approved: { type: 'boolean' },
      reason: { type: 'string', description: 'Present when the user declined.' },
    },
    required: ['approved'],
  },
};

export const navigateToTool: FrontendToolContract = {
  name: 'navigateTo',
  description:
    'Navigate the user interface to a route, for example a document detail page or a ' +
    'search result list. Read-only: it changes what is on screen, never repository content.',
  parameters: {
    type: 'object',
    properties: {
      route: { type: 'string', description: 'Application route such as /doc/<uid>.' },
      reason: { type: 'string', description: 'Why the agent is navigating there.' },
    },
    required: ['route'],
  },
  result: {
    type: 'string',
    description:
      'Confirmation sentence, e.g. "Navigated to /doc/abc-123." A route that does ' +
      'not start with "/" is refused and the sentence says so.',
  },
};

export const applyMetadataTool: FrontendToolContract = {
  name: 'applyMetadata',
  description:
    'Write metadata properties onto a document. Mutates repository content, so the user ' +
    'must approve it first.',
  parameters: {
    type: 'object',
    properties: {
      // `docId`, not `uid`. The browser handler reads `args['docId']` and refuses
      // the write when it is absent, so the two names are not interchangeable.
      docId: { type: 'string', description: 'Document UID to update.' },
      properties: {
        type: 'object',
        description: 'Map of Nuxeo property xpath to new value.',
      },
    },
    required: ['docId', 'properties'],
  },
  result: {
    type: 'string',
    description:
      'Confirmation sentence naming the document, or a sentence beginning "Refused" when the ' +
      'arguments were incomplete or Nuxeo rejected the write.',
  },
};

export const selectDocumentsTool: FrontendToolContract = {
  name: 'selectDocuments',
  description:
    'Suggest documents for the user to select. This highlights them in the list on screen; it ' +
    'does NOT select them. Only the user can select, by ticking the box. A suggestion you make ' +
    'here will never come back to you as a user selection, so do not treat these documents as ' +
    'chosen and do not act on them until the user confirms. Documents that are not currently ' +
    'on screen cannot be suggested.',
  parameters: {
    type: 'object',
    properties: {
      docIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'UIDs of documents already shown in the conversation, to highlight.',
      },
    },
    required: ['docIds'],
  },
  result: {
    type: 'string',
    description:
      'Sentence saying how many documents were highlighted and how many were refused because ' +
      'they are not on screen. Never a confirmation that anything was selected.',
  },
};

/**
 * The four HITL tools the chat surface implements (plan A3).
 *
 * These mirror `FRONTEND_AGENT_TOOLS` in
 * `libs/shared/agent-client/src/lib/agent-tools.ts`, which is the declaration the
 * model actually receives. `frontend-tools.spec.ts` pins the argument names, so
 * a rename on either side fails a test here rather than producing a tool call
 * the browser handler silently ignores.
 */
export const FRONTEND_TOOL_CONTRACTS: readonly FrontendToolContract[] = [
  confirmActionTool,
  navigateToTool,
  applyMetadataTool,
  selectDocumentsTool,
];

export const FRONTEND_TOOL_NAMES: readonly string[] = FRONTEND_TOOL_CONTRACTS.map(
  (contract) => contract.name,
);
