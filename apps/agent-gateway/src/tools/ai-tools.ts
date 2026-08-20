import { optionalInteger, optionalString, requiredString } from './args';
import type { AgentTool, ToolContext } from './tool.types';

/**
 * Document-intelligence tools backed by the `nuxeo-ai-package` Automation
 * operations already deployed on the Nuxeo server (AGENTS/10-ai-features.md).
 *
 * Two things worth stating, because they look like duplication and are not.
 *
 * The gateway calls these rather than re-implementing summarisation against
 * HAIP directly, so a customer running both the gateway and the Automation
 * fallback gets the same answer from both paths. Model choice and prompt text
 * stay in one place — the marketplace bundle — instead of drifting between two.
 *
 * These operations take flat scalar parameters, so nothing needs flattening.
 * The flattening the tool layer replaces is `AiGatewayService.chat()` and
 * `.analyzeSentiment()`, which JSON-stringify whole conversations and comment
 * threads into `historyJson` / `commentsJson` because an Automation operation
 * cannot take a structured array. The agent loop owns conversation history
 * natively, so there is no `historyJson` anywhere in this gateway, and
 * `ai.analyzeCommentSentiment` below takes a real typed array of comments and
 * does the stringification once, at the Automation boundary, rather than making
 * it the caller's problem.
 */

interface AutomationBlobResponse {
  readonly value?: unknown;
}

/** `nuxeo-ai-package` operations may answer as a raw object or a `{ value }` wrapper. */
function unwrap<T>(response: T | AutomationBlobResponse): T {
  if (response && typeof response === 'object' && 'value' in response) {
    return (response as AutomationBlobResponse).value as T;
  }
  return response as T;
}

export const summarizeDocumentTool: AgentTool = {
  name: 'ai.summarizeDocument',
  description: "Generate a summary of a document's content.",
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string', description: 'Document uid.' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const docId = requiredString(args, 'uid');
    const result = await nuxeo.automation<unknown>(caller, 'AI.Summarize', { docId }, { signal });
    return { uid: docId, ...(unwrap(result) as Record<string, unknown>) };
  },
};

export const classifyDocumentTool: AgentTool = {
  name: 'ai.classifyDocument',
  description: 'Classify a document into a content category with a confidence score.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const docId = requiredString(args, 'uid');
    const result = await nuxeo.automation<unknown>(caller, 'AI.Classify', { docId }, { signal });
    return { uid: docId, ...(unwrap(result) as Record<string, unknown>) };
  },
};

export const suggestTagsTool: AgentTool = {
  name: 'ai.suggestTags',
  description:
    'Suggest tags for a document. Suggestion only — use nuxeo.tagDocument to actually apply them.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const docId = requiredString(args, 'uid');
    const result = await nuxeo.automation<unknown>(caller, 'AI.SuggestTags', { docId }, { signal });
    return { uid: docId, ...(unwrap(result) as Record<string, unknown>) };
  },
};

export const findSimilarDocumentsTool: AgentTool = {
  name: 'ai.findSimilarDocuments',
  description: 'Find documents semantically similar to a given document.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string' },
      limit: { type: 'number', description: 'Maximum results, default 5.' },
    },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const docId = requiredString(args, 'uid');
    const result = await nuxeo.automation<unknown>(
      caller,
      'AI.Similar',
      { docId, limit: optionalInteger(args, 'limit', 5, 25) },
      { signal },
    );
    return { uid: docId, ...(unwrap(result) as Record<string, unknown>) };
  },
};

export const detectAuditAnomaliesTool: AgentTool = {
  name: 'ai.detectAuditAnomalies',
  description:
    'Detect unusual activity in the audit trail over a time range, e.g. "24h", "7d". Useful for ' +
    'access reviews.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      timeRange: { type: 'string', description: 'Time window, default "24h".' },
    },
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const timeRange = optionalString(args, 'timeRange') ?? '24h';
    const result = await nuxeo.automation<unknown>(
      caller,
      'AI.Anomalies',
      { timeRange },
      { signal },
    );
    return { timeRange, ...(unwrap(result) as Record<string, unknown>) };
  },
};

interface CommentInput {
  readonly id?: unknown;
  readonly text?: unknown;
}

export const analyzeCommentSentimentTool: AgentTool = {
  name: 'ai.analyzeCommentSentiment',
  description: 'Analyse the sentiment of a comment thread and produce a digest.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      comments: {
        type: 'array',
        description: 'The comments to analyse.',
        items: {
          type: 'object',
          properties: { id: { type: 'string' }, text: { type: 'string' } },
          required: ['id', 'text'],
        },
      },
    },
    required: ['comments'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const raw = args['comments'];
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new Error('"comments" is required and must be a non-empty array.');
    }
    const comments = (raw as CommentInput[]).map((comment, index) => ({
      id: typeof comment.id === 'string' ? comment.id : String(index),
      text: typeof comment.text === 'string' ? comment.text : '',
    }));
    const result = await nuxeo.automation<unknown>(
      caller,
      'AI.Sentiment',
      // The Automation operation cannot take an array parameter, so the encoding
      // happens here, once, instead of leaking into every caller's signature.
      { commentsJson: JSON.stringify(comments) },
      { signal },
    );
    return unwrap(result);
  },
};

export const aiTools: readonly AgentTool[] = [
  summarizeDocumentTool,
  classifyDocumentTool,
  suggestTagsTool,
  findSimilarDocumentsTool,
  detectAuditAnomaliesTool,
  analyzeCommentSentimentTool,
];
