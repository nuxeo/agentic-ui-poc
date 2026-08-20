import type { Tool } from '@ag-ui/core';

/**
 * The four frontend-declared tools. The gateway advertises them to the model but never
 * executes them: it emits the tool call, ends the run, and waits for the browser to send
 * the result back on the next `POST /agent/run` (ADR 001, "WebSocket instead of SSE").
 *
 * `description` is required by `ToolSchema`, and `tools` is a required array on
 * `RunAgentInput` — a run that omits it is a `400` from the gateway.
 */

/** Tools that change repository content, and so must not run without a human decision. */
export const APPROVAL_REQUIRED_TOOLS: ReadonlySet<string> = new Set([
  'confirmAction',
  'applyMetadata',
]);

export const CONFIRM_ACTION_TOOL: Tool = {
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
};

export const NAVIGATE_TO_TOOL: Tool = {
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
};

export const APPLY_METADATA_TOOL: Tool = {
  name: 'applyMetadata',
  description:
    'Write metadata properties onto a document. Mutates repository content, so the user ' +
    'must approve it first.',
  parameters: {
    type: 'object',
    properties: {
      docId: { type: 'string', description: 'Document UID to update.' },
      properties: {
        type: 'object',
        description: 'Map of Nuxeo property xpath to new value.',
      },
    },
    required: ['docId', 'properties'],
  },
};

export const SELECT_DOCUMENTS_TOOL: Tool = {
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
};

export const FRONTEND_AGENT_TOOLS: readonly Tool[] = [
  CONFIRM_ACTION_TOOL,
  NAVIGATE_TO_TOOL,
  APPLY_METADATA_TOOL,
  SELECT_DOCUMENTS_TOOL,
];

export function toolRequiresApproval(name: string): boolean {
  return APPROVAL_REQUIRED_TOOLS.has(name);
}
