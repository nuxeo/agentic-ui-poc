import { requiredString } from '../tools/args';
import { createDefaultToolRegistry, DEFAULT_TOOLS } from '../tools/default-registry';
import { FRONTEND_TOOL_NAMES } from '../tools/frontend-tools';
import type { ToolRegistry } from '../tools/tool-registry';
import type { AgentTool, ToolContext } from '../tools/tool.types';
import type { DemoDataProvenance, ProvenanceLookup } from './demo-script.types';

/**
 * The only tools demo mode replaces, and why each one has to be replaced.
 *
 * Everything else in `DEFAULT_TOOLS` is left exactly as it ships and runs against
 * the configured Nuxeo as the signed-in caller, which is the whole reason demo mode
 * is built as a `ModelClient` rather than as a fake server: the tool layer, the
 * identity forwarding and the ACL enforcement are not simulated, they simply run.
 *
 * Both replacements below put `demoData: true` and a `demoNote` at the top of their
 * result. That is not documentation — `TOOL_CALL_RESULT.content` is rendered in the
 * tool card, so `demoData: true` is on screen, in the room, next to the tool name.
 * A driver cannot present a canned result as real without it being visible behind
 * them.
 */

/** Marker every non-real demo result carries, rendered in the tool card. */
export const DEMO_DATA_MARKER = 'demoData';

interface NuxeoDocumentEntry {
  readonly uid: string;
  readonly title?: string;
  readonly type?: string;
  readonly path?: string;
  readonly properties?: Record<string, unknown>;
}

/**
 * NXQL for the grounding search.
 *
 * Content-agnostic on purpose. A demo instance may hold eight documents or eighty
 * thousand, and a query written around "contract" returns nothing on a fresh one —
 * which reads, from the audience's side, as the agent being broken. Ordering by
 * modification date and excluding the repository's structural roots gives real
 * documents on any instance.
 *
 * The exclusion list is longer than the obvious roots because containers are
 * documents too, and they sort to the top. `UserWorkspace` and `Favorites` are
 * created per user, and `Collection` is created by the approval beat itself — so
 * without this, running the beats in the runbook's order makes the collection the
 * agent just created the newest document in the repository, and the next beat cites
 * it as a source. Neither is wrong, exactly, but both spend an audience's attention
 * on the wrong thing.
 */
export const DEMO_GROUNDING_NXQL =
  'SELECT * FROM Document WHERE ecm:isTrashed = 0 ' +
  "AND ecm:mixinType != 'HiddenInNavigation' " +
  "AND ecm:primaryType NOT IN ('Domain', 'WorkspaceRoot', 'SectionRoot', 'TemplateRoot', " +
  "'UserWorkspacesRoot', 'UserWorkspace', 'Favorites', 'Collection') " +
  'ORDER BY dc:modified DESC';

const GROUNDING_PAGE_SIZE = 4;

function readDescription(entry: NuxeoDocumentEntry): string | undefined {
  const description = entry.properties?.['dc:description'];
  return typeof description === 'string' && description.trim() ? description.trim() : undefined;
}

/**
 * `kd.ask` for an instance with no Content Intelligence Connector.
 *
 * Hybrid rather than canned, and the split is deliberate: the *answer* is scripted
 * because there is no Knowledge Discovery corpus to retrieve from, but every
 * citation is a document read live out of Nuxeo through the ordinary NXQL search,
 * as the caller, subject to the caller's ACLs. So the Sources strip in the demo
 * links to real documents in the audience's own repository, with real uids that
 * open real detail pages — which is the part of grounded citation worth showing.
 * Inventing document titles here would be caught within seconds by anyone who
 * knows the instance.
 */
export const demoAskKnowledgeDiscoveryTool: AgentTool = {
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
    const question = requiredString(args, 'question');
    const list = await nuxeo.json<{ entries?: readonly NuxeoDocumentEntry[] }>(caller, {
      method: 'GET',
      path: '/nuxeo/api/v1/search/lang/NXQL/execute',
      query: { query: DEMO_GROUNDING_NXQL, pageSize: GROUNDING_PAGE_SIZE, currentPageIndex: 0 },
      headers: { properties: 'dublincore' },
      signal,
    });

    const entries = list.entries ?? [];
    return {
      [DEMO_DATA_MARKER]: true,
      demoNote:
        'Knowledge Discovery is not installed on this instance, so the answer text is scripted. ' +
        'The citations are real documents read live from this Nuxeo repository as the signed-in ' +
        'user, through the same NXQL search the product uses.',
      question,
      status: 'Complete',
      answer:
        'Grounded in the documents listed as sources. Each source is a live document in this ' +
        'repository; open one to see it.',
      citations: entries.map((entry) => ({
        uid: entry.uid,
        title: entry.title ?? entry.uid,
        ...(entry.path ? { path: entry.path } : {}),
        ...(entry.type ? { type: entry.type } : {}),
        ...(readDescription(entry) ? { excerpt: readDescription(entry) as string } : {}),
      })),
    };
  },
};

/**
 * `ai.summarizeDocument` for an instance without `nuxeo-ai-package`.
 *
 * Fully canned, and the placeholder says so in the field the model reads and the
 * card renders. It could have been left to fail — `AI.Summarize` 404s and the loop
 * already turns that into a clean tool error the model recovers from — but the
 * point of the beat is the shape of a multi-step plan, and a red error card in the
 * middle of it teaches the audience the wrong lesson about a capability that works
 * fine wherever the bundle is installed.
 *
 * What it must not do is produce plausible-looking summary prose. A sentence about
 * a real document that no model wrote is the single most damaging thing this file
 * could contain, so the placeholder is unmistakable on screen instead.
 */
export const demoSummarizeDocumentTool: AgentTool = {
  name: 'ai.summarizeDocument',
  description: "Generate a summary of a document's content.",
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string', description: 'Document uid.' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args) {
    const uid = requiredString(args, 'uid');
    return {
      [DEMO_DATA_MARKER]: true,
      demoNote:
        'AI.Summarize is served by the nuxeo-ai-package marketplace bundle, which is not ' +
        'installed on this instance. Nothing read this document.',
      uid,
      summary: 'PLACEHOLDER — not a summary of this document. AI.Summarize is not installed here.',
    };
  },
};

export interface DemoToolOverride {
  readonly tool: AgentTool;
  readonly provenance: 'hybrid' | 'canned';
}

export const DEMO_TOOL_OVERRIDES: readonly DemoToolOverride[] = [
  { tool: demoAskKnowledgeDiscoveryTool, provenance: 'hybrid' },
  { tool: demoSummarizeDocumentTool, provenance: 'canned' },
];

/**
 * The demo tool set: the shipped registry with the two replacements swapped in
 * through `createDefaultToolRegistry`'s documented `exclude`/`additional` options.
 * No gateway internals are touched — this is the same extension point a customer
 * adding their own tool uses, which is worth knowing because it means demo mode
 * cannot drift from the real registry's behaviour without the real registry
 * changing too.
 */
export function createDemoToolRegistry(): ToolRegistry {
  const overridden = DEMO_TOOL_OVERRIDES.map((override) => override.tool.name);
  return createDefaultToolRegistry({
    exclude: overridden,
    additional: DEMO_TOOL_OVERRIDES.map((override) => override.tool),
  });
}

/**
 * What the composed registry will actually do with a given tool name, which is the
 * fact `validateDemoScripts` checks every script declaration against.
 */
export const demoToolProvenance: ProvenanceLookup = (name): DemoDataProvenance | undefined => {
  const override = DEMO_TOOL_OVERRIDES.find((entry) => entry.tool.name === name);
  if (override) return override.provenance;
  if (DEFAULT_TOOLS.some((tool) => tool.name === name)) return 'real-nuxeo';
  // A frontend tool is not served by the registry at all — the loop hands the run
  // back to the browser. That is the real human-in-the-loop path, not a stand-in.
  return FRONTEND_TOOL_NAMES.includes(name) ? 'frontend' : undefined;
};
