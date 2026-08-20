import { optionalString, optionalStringArray, requiredString } from './args';
import type { AgentTool, ToolContext } from './tool.types';

/**
 * Knowledge Discovery and Knowledge Enrichment, reached through the Hyland
 * Content Intelligence Connector installed on the Nuxeo server.
 *
 * The connector is what keeps tenant secrets out of this process: it holds the
 * OAuth credential and the `hxai-environment` header, and we call it as an
 * ordinary Nuxeo automation operation carrying the caller's session. The
 * gateway therefore needs no Content Intelligence credential of its own, for
 * the same reason it needs no Nuxeo credential.
 *
 * Operation ids and the response envelope match
 * `libs/shared/kd-client/src/lib/kd.config.ts` and `ke.config.ts`. Note the
 * connector serves these from `/nuxeo/site/automation/…`, not
 * `/nuxeo/api/v1/automation/…`.
 */

const KD_ASK_OPERATION = 'HylandKnowledgeDiscovery.askQuestionAndGetAnswer';
const KD_LIST_AGENTS_OPERATION = 'HylandKnowledgeDiscovery.getAllAgents';
const KE_ENRICH_OPERATION = 'HylandKnowledgeEnrichment.Enrich';

/**
 * Every CIC operation answers with this envelope. `responseCode` is the
 * *upstream* HTTP status, so a 200 from Nuxeo can still be carrying a 403 from
 * Discovery — unwrapping is not optional.
 */
interface CicEnvelope<T> {
  readonly response: T;
  readonly responseCode?: number;
  readonly responseMessage?: string;
}

export class ContentIntelligenceError extends Error {
  constructor(
    readonly responseCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ContentIntelligenceError';
  }
}

function unwrapEnvelope<T>(envelope: CicEnvelope<T>): T {
  if (!envelope || typeof envelope !== 'object') {
    throw new ContentIntelligenceError(
      -1,
      'Unexpected response from the Content Intelligence connector.',
    );
  }
  const { responseCode, responseMessage, response } = envelope;
  if (responseCode !== undefined && (responseCode < 200 || responseCode >= 300)) {
    throw new ContentIntelligenceError(
      responseCode,
      responseMessage || `Content Intelligence returned HTTP ${responseCode}.`,
    );
  }
  return response;
}

function cicAutomationPath(operationId: string): string {
  return `/nuxeo/site/automation/${encodeURIComponent(operationId)}`;
}

interface KdAgentSummary {
  readonly id?: string;
  readonly name?: string;
  readonly description?: string;
}

export const listKnowledgeAgentsTool: AgentTool = {
  name: 'kd.listAgents',
  description:
    'List the Knowledge Discovery agents available to answer questions. Call this first when the ' +
    'user has not named an agent.',
  mutating: false,
  parameters: { type: 'object', properties: {}, additionalProperties: false },
  async execute(_args, { caller, nuxeo, signal }: ToolContext) {
    const envelope = await nuxeo.json<CicEnvelope<KdAgentSummary[] | { agents: KdAgentSummary[] }>>(
      caller,
      { method: 'POST', path: cicAutomationPath(KD_LIST_AGENTS_OPERATION), json: {}, signal },
    );
    const response = unwrapEnvelope(envelope);
    const agents = Array.isArray(response) ? response : (response?.agents ?? []);
    return {
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
      })),
    };
  },
};

interface KdCitation {
  readonly objectId?: string;
  readonly referenceId?: string;
  readonly title?: string;
  readonly score?: number;
  readonly excerpt?: string;
}

interface KdAnswer {
  readonly questionId?: string;
  readonly answer?: string;
  readonly status?: string;
  readonly citations?: readonly KdCitation[];
}

export const askKnowledgeDiscoveryTool: AgentTool = {
  name: 'kd.ask',
  description:
    'Ask a Knowledge Discovery agent a grounded question over the ingested corpus and get an ' +
    'answer with citations.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      agentId: { type: 'string', description: 'Agent id from kd.listAgents.' },
      question: { type: 'string' },
    },
    required: ['agentId', 'question'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const agentId = requiredString(args, 'agentId');
    const question = requiredString(args, 'question');
    const envelope = await nuxeo.json<CicEnvelope<KdAnswer>>(caller, {
      method: 'POST',
      path: cicAutomationPath(KD_ASK_OPERATION),
      json: { params: { agentId, question } },
      signal,
    });
    const answer = unwrapEnvelope(envelope) ?? {};
    return {
      questionId: answer.questionId ?? null,
      status: answer.status ?? 'Complete',
      answer: answer.answer ?? '',
      // The runtime lifts this array onto the `CUSTOM` citations event, which is
      // the only path the chat surface reads — see src/agent/citations.ts. It
      // stays in the tool result as well so the model can write "[1]" prose
      // about the same sources it is grounded in.
      //
      // `objectId` is Content Lake's `sourceId__documentId`; the normaliser
      // reduces it to the Nuxeo uid the panel can navigate to.
      citations: (answer.citations ?? []).map((citation) => ({
        objectId: citation.objectId,
        title: citation.title,
        excerpt: citation.excerpt,
        score: citation.score,
      })),
    };
  },
};

const KE_DEFAULT_ACTIONS = ['text-summary', 'text-classification'];

/**
 * Trigger Knowledge Enrichment on a document.
 *
 * `HylandKnowledgeEnrichment.Enrich` takes the content as a multipart blob, so
 * the gateway first fetches the document's binary *as the caller* and then posts
 * it to the connector. Two consequences worth knowing: a user who cannot read
 * the blob cannot enrich it, which is the correct behaviour and falls out of the
 * identity forwarding for free; and the blob passes through this process, so
 * very large binaries are bounded by `AGENT_RUN_TIMEOUT_MS` rather than streamed.
 */
export const enrichDocumentTool: AgentTool = {
  name: 'ke.enrichDocument',
  description:
    'Run Knowledge Enrichment over a document to extract a summary, a classification, named ' +
    'entities and metadata from its content.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string' },
      actions: {
        type: 'array',
        items: { type: 'string' },
        description: `Enrichment actions, default ${KE_DEFAULT_ACTIONS.join(', ')}.`,
      },
      xpath: {
        type: 'string',
        description: 'Blob xpath to enrich, default "file:content".',
      },
    },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const xpath = optionalString(args, 'xpath') ?? 'file:content';
    const actions = optionalStringArray(args, 'actions') ?? KE_DEFAULT_ACTIONS;

    const blob = await nuxeo.binary(caller, {
      method: 'GET',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@blob/${encodeURIComponent(xpath)}`,
      signal,
    });

    const form = new FormData();
    form.append(
      'request',
      new Blob([JSON.stringify({ params: { actions: actions.join(',') } })], {
        type: 'application/json',
      }),
    );
    form.append('input', new Blob([blob.data], { type: blob.contentType }), blob.filename);

    const response = await nuxeo.fetch(caller, {
      method: 'POST',
      path: cicAutomationPath(KE_ENRICH_OPERATION),
      body: form,
      accept: 'application/json, text/plain',
      signal,
    });

    const text = await response.text();
    const parsed: unknown = text ? JSON.parse(text) : {};
    const payload =
      parsed && typeof parsed === 'object' && 'responseCode' in parsed
        ? unwrapEnvelope(parsed as CicEnvelope<unknown>)
        : parsed;
    return { uid, actions, result: payload };
  },
};

export const contentIntelligenceTools: readonly AgentTool[] = [
  listKnowledgeAgentsTool,
  askKnowledgeDiscoveryTool,
  enrichDocumentTool,
];
