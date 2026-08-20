import { DEMO_GROUNDING_NXQL } from './demo-tools';
import type { DemoFacts, DemoScript } from './demo-script.types';

/**
 * The scripted beats, ordered the way the runbook walks them
 * (`docs/beta-demo-runbook.md`).
 *
 * Each one exists to show something that cannot be shown any other way on a
 * machine with no HAIP credential and no `nuxeo-ai-package`. Read the honesty rules
 * at the top of `demo-script.types.ts` before adding or editing prose here: the
 * text may describe what the agent is doing, and must not assert what it found.
 * Findings come from tool cards and citations, which carry live data.
 */

/** Page size for the demo searches. Enough to look like a result set, small enough to read. */
const SEARCH_PAGE_SIZE = 5;

const RECENT_DOCUMENTS_ARGS = JSON.stringify({
  query: DEMO_GROUNDING_NXQL,
  pageSize: SEARCH_PAGE_SIZE,
});

/** Reads a document uid out of a real search result already in the conversation. */
function firstUidFrom(facts: DemoFacts, toolCallId: string): string | undefined {
  const result = facts.resultsByToolCallId[toolCallId];
  if (!result || typeof result !== 'object') return undefined;
  const entries = (result as { entries?: unknown }).entries;
  if (!Array.isArray(entries) || entries.length === 0) return undefined;
  const uid = (entries[0] as { uid?: unknown }).uid;
  return typeof uid === 'string' && uid.length > 0 ? uid : undefined;
}

/**
 * Arguments for a step that acts on the first document the previous search
 * returned. Returns `''` — which skips the call — when the search came back empty,
 * so an empty repository degrades to "nothing to look at" rather than to an error
 * card.
 */
function argsForFirstResult(searchCallId: string) {
  return (facts: DemoFacts): string => {
    const uid = firstUidFrom(facts, searchCallId);
    return uid ? JSON.stringify({ uid }) : '';
  };
}

/** True when a tool result carries a non-empty array under `field`. */
function hasItems(facts: DemoFacts, toolCallId: string, field: string): boolean {
  const result = facts.resultsByToolCallId[toolCallId];
  if (!result || typeof result !== 'object') return false;
  const items = (result as Record<string, unknown>)[field];
  return Array.isArray(items) && items.length > 0;
}

/**
 * Picks between two sentences on whether the live call actually returned anything.
 * Rule 2 in `demo-script.types.ts` forbids prose that asserts a finding, and "that
 * is the live result" asserts one the moment the repository is empty.
 *
 * Prose here also avoids saying *where* a tool card is on screen. The chat panel
 * renders its transcript and its tool cards in two separate loops
 * (`ai-chat-panel.component.html`), so every card appears after every message
 * regardless of when the call happened — "the card above" would be wrong on screen
 * even when it is right about the run.
 */
function textForResults(
  toolCallId: string,
  field: string,
  found: string,
  empty: string,
): (facts: DemoFacts) => string {
  return (facts) => (hasItems(facts, toolCallId, field) ? found : empty);
}

/**
 * The same idea for a call that returns one object rather than a list: `field`
 * present and non-empty means the call succeeded. A tool that failed returns
 * `{ error, code }` instead, and the closing sentence must not claim otherwise.
 */
function textForValue(
  toolCallId: string,
  field: string,
  succeeded: string,
  failed: string,
): (facts: DemoFacts) => string {
  return (facts) => {
    const result = facts.resultsByToolCallId[toolCallId];
    const value =
      result && typeof result === 'object' ? (result as Record<string, unknown>)[field] : undefined;
    return typeof value === 'string' && value.length > 0 ? succeeded : failed;
  };
}

/**
 * Beat 1 — streaming and one real server-side tool call.
 *
 * The smallest complete demonstration of the difference from the single-shot
 * Automation path: tokens arrive progressively, and between the two assistant
 * bubbles the agent ran an NXQL query against the audience's own repository as the
 * signed-in user.
 */
const recentActivityScript: DemoScript = {
  id: 'recent-activity',
  prompt: 'What has changed in this repository recently?',
  triggers: [
    'changed recently',
    'recent changes',
    'what has changed',
    'recently modified',
    // The chat panel's own welcome chips, so a driver who clicks one instead of
    // typing the runbook's sentence still lands on a beat.
    'modified today',
    'recent uploads',
  ],
  demonstrates:
    'Token streaming, and one real NXQL search executed against the live repository as the ' +
    'signed-in user.',
  turns: [
    {
      thinking: [
        {
          id: 'plan',
          label: 'Planning',
          detail: 'Query the repository for recently modified documents.',
        },
      ],
      text:
        'Let me look at what has moved most recently. I will run a repository search ordered by ' +
        'modification date — it runs as you, so anything you cannot read will not come back.',
      toolCall: {
        id: 'demo_recent_search',
        name: 'nuxeo.searchDocuments',
        args: RECENT_DOCUMENTS_ARGS,
        provenance: 'real-nuxeo',
      },
    },
    {
      factsFrom: 'demo_recent_search',
      text: textForResults(
        'demo_recent_search',
        'entries',
        'The `nuxeo.searchDocuments` card shows exactly what I ran — the NXQL, and what Nuxeo ' +
          'returned for your session. Ask me about any of those documents and I will read it ' +
          'properly.',
        'The search came back empty, so there is nothing recent to report. That is the real ' +
          'answer from your repository, not a failure — add a document and ask me again.',
      ),
    },
  ],
};

/**
 * Beat 2 — a multi-step plan with thinking steps.
 *
 * Three tool calls in one turn-by-turn plan, where step two acts on a uid step one
 * discovered. The third call is the honest gap: `AI.Summarize` needs
 * `nuxeo-ai-package`, which this instance does not have, so the placeholder says so
 * on screen and the closing text names it.
 */
const documentOverviewScript: DemoScript = {
  id: 'document-overview',
  prompt: 'Give me an overview of the most recently modified document.',
  triggers: ['overview of the most recent', 'most recently modified document', 'walk me through'],
  demonstrates:
    'A multi-step plan with visible thinking steps: real search, then a real document read of a ' +
    'uid discovered at runtime, then the one canned step (AI.Summarize is not installed).',
  turns: [
    {
      thinking: [
        {
          id: 'plan',
          label: 'Planning three steps',
          detail: 'Find the newest document, read it, then summarise it.',
        },
      ],
      text:
        'I will do this in three steps: find the most recently modified document, read its ' +
        'metadata, then try to summarise it.',
      toolCall: {
        id: 'demo_overview_search',
        name: 'nuxeo.searchDocuments',
        args: RECENT_DOCUMENTS_ARGS,
        provenance: 'real-nuxeo',
      },
    },
    {
      thinking: [
        { id: 'read', label: 'Reading the document', detail: 'Fetching its full metadata set.' },
      ],
      toolCall: {
        id: 'demo_overview_read',
        name: 'nuxeo.getDocument',
        // The uid comes out of the previous step's real result, not out of this file.
        args: argsForFirstResult('demo_overview_search'),
        ifSkipped:
          'The search returned no documents, so there is nothing for me to read. Add a document ' +
          'to the repository and ask me again.',
        provenance: 'real-nuxeo',
      },
    },
    {
      thinking: [{ id: 'summarise', label: 'Summarising' }],
      toolCall: {
        id: 'demo_overview_summary',
        name: 'ai.summarizeDocument',
        args: argsForFirstResult('demo_overview_search'),
        ifSkipped: 'With no document to read, there is nothing to summarise either.',
        provenance: 'canned',
        why:
          'AI.Summarize is served by the nuxeo-ai-package marketplace bundle, which is not ' +
          'installed on this instance. The step returns labelled placeholder text so the shape ' +
          'of the plan is visible without inventing a summary.',
      },
    },
    {
      factsFrom: 'demo_overview_read',
      text:
        'The first two steps are real: the search and the document read both went to this Nuxeo ' +
        'instance as you. The third did not — `AI.Summarize` comes from the `nuxeo-ai-package` ' +
        'bundle, which is not installed here, so that card is labelled placeholder text rather ' +
        'than a summary. Install the bundle and the same tool call returns a real one.',
    },
  ],
};

/**
 * Beat 3 — the approval gate, in both directions.
 *
 * The card in this beat is raised by the **gateway**, not requested by the model.
 * `nuxeo.createCollection` is a mutating tool, so `runAgent` refuses to execute it,
 * ends the run with AG-UI's real interrupt outcome, and only runs the call on the
 * next request if that request carries a human approval for that exact
 * `toolCallId`. Approving performs a real write against the real repository;
 * declining writes nothing.
 *
 * The script deliberately does **not** call `confirmAction` first. It used to, and
 * that was the demo of a gate the model could skip — which it did, live. Asking
 * the model to raise a card it is not needed for would now produce two cards for
 * one write, and would put the weaker mechanism in front of the audience.
 */
const approvalScript: DemoScript = {
  id: 'collection-approval',
  prompt: 'Put those documents into a new collection for me.',
  triggers: ['new collection', 'into a collection', 'organise those', 'organize those'],
  demonstrates:
    'The server-enforced approval gate. The write is stopped by the gateway before it runs, not ' +
    'by the model choosing to ask. Approve and a collection is genuinely created in this ' +
    'repository; decline and nothing is written.',
  turns: [
    {
      thinking: [
        {
          id: 'plan',
          label: 'Checking what this changes',
          detail: 'Creating a collection writes to the repository.',
        },
      ],
      text:
        'Creating a collection changes the repository. I will ask for it — and the gateway will ' +
        'stop the run and put the decision in front of you before anything is written. That is ' +
        'not up to me.',
      toolCall: {
        id: 'demo_create_collection',
        name: 'nuxeo.createCollection',
        args: JSON.stringify({
          name: 'Agent demo — recent documents',
          description: 'Created by the Nuxeo agent during a Beta demo.',
        }),
        provenance: 'real-nuxeo',
      },
    },
    {
      factsFrom: 'demo_create_collection',
      text: textForValue(
        'demo_create_collection',
        'uid',
        "Done. The `nuxeo.createCollection` card holds Nuxeo's own response to " +
          '`Collection.Create`, run as you, so the collection is really there — you will find it ' +
          'under Collections.',
        'Nuxeo refused the write, and the `nuxeo.createCollection` card says why. Nothing was ' +
          'created: an agent that reports success it did not get is worse than one that fails.',
      ),
      ifDeclined: {
        text:
          'Understood — I have not created anything. No write reached Nuxeo, and the collection ' +
          'does not exist. I could not have gone ahead anyway: the gateway never ran the call. ' +
          'Tell me what you would rather do instead.',
      },
    },
  ],
};

/**
 * Beat 4 — grounded citations.
 *
 * The answer text is scripted because there is no Knowledge Discovery corpus on
 * this instance. Every source card underneath it is a real document, read live from
 * Nuxeo by NXQL as the signed-in user, with a real uid that opens a real detail
 * page. That is the half of grounding worth demonstrating, and the half that would
 * be caught instantly if it were invented.
 */
const groundedAnswerScript: DemoScript = {
  id: 'grounded-answer',
  prompt: 'Answer from the repository and cite your sources.',
  triggers: ['cite your sources', 'with citations', 'where did that come from', 'show me sources'],
  demonstrates:
    'Grounded citations rendering as source cards. The prose is scripted; every citation is a ' +
    'real document read live from this repository.',
  turns: [
    {
      thinking: [
        {
          id: 'ground',
          label: 'Retrieving grounding',
          detail: 'Pulling the documents an answer would have to rest on.',
        },
      ],
      text: 'Let me pull the documents an answer should rest on, so you can check them yourself.',
      toolCall: {
        id: 'demo_kd_ask',
        name: 'kd.ask',
        args: JSON.stringify({
          agentId: 'demo-agent',
          question: 'What is in this repository?',
        }),
        provenance: 'hybrid',
        why:
          'Knowledge Discovery needs the Content Intelligence Connector, which is not installed ' +
          'on this instance, so the answer sentence is scripted. The citations are not: they are ' +
          'real documents read live from Nuxeo by NXQL, as the signed-in user.',
      },
    },
    {
      factsFrom: 'demo_kd_ask',
      text: textForResults(
        'demo_kd_ask',
        'citations',
        'Every source below is a document in this repository, not a reference I made up — click ' +
          'one and it opens. Grounding is what makes an answer checkable: the assistant has to ' +
          'show you what it stood on, and you get to disagree with it.',
        'There are no readable documents to ground an answer in, so I have nothing to cite. An ' +
          'assistant that cannot show its sources should say so rather than answer anyway.',
      ),
    },
  ],
};

/**
 * Beat 5 — cancellation.
 *
 * Deliberately slow, because cancelling something instantaneous demonstrates
 * nothing. The audit read is a real call; if nobody presses Stop the run finishes
 * normally, which is the point — cancel is a user affordance, not an error path.
 */
const longRunScript: DemoScript = {
  id: 'long-audit-review',
  prompt: 'Run an access review over the repository audit trail.',
  triggers: ['access review', 'audit trail', 'audit review', 'take your time'],
  demonstrates:
    'Cancellation. A deliberately slow run with a real audit read, so there is time to press ' +
    'Stop and see the stream end mid-sentence.',
  turns: [
    {
      // Long enough that a presenter has time to say "watch, I can stop it" and
      // then do so. Cancelling something instantaneous demonstrates nothing.
      pauseMs: 1200,
      thinking: [
        {
          id: 'scope',
          label: 'Scoping the review',
          detail: 'Deciding which audit categories matter.',
        },
        {
          id: 'window',
          label: 'Choosing a time window',
          detail: 'Recent activity first, then widen if needed.',
        },
        {
          id: 'permissions',
          label: 'Checking what I am allowed to read',
          detail: 'The audit log is filtered to the caller, like everything else.',
        },
      ],
      text:
        'An access review has to look at three things: who touched what, which permissions are ' +
        'unusual, and whether anything changed outside working hours. I will start with the ' +
        'audit trail. This one takes a while, so you can stop me at any point with the button ' +
        'next to the message box — the connection closes, the run stops server-side, and nothing ' +
        'is left half-done.',
      toolCall: {
        id: 'demo_audit_search',
        name: 'nuxeo.searchAuditLog',
        args: JSON.stringify({ pageSize: 20 }),
        provenance: 'real-nuxeo',
        argChunks: 2,
      },
    },
    {
      pauseMs: 1200,
      factsFrom: 'demo_audit_search',
      thinking: [
        { id: 'correlate', label: 'Correlating events', detail: 'Grouping by user and category.' },
        { id: 'outliers', label: 'Looking for outliers', detail: 'Unusual actors, unusual hours.' },
      ],
      text: textForResults(
        'demo_audit_search',
        'entries',
        'The `nuxeo.searchAuditLog` card is a live read of this repository. In a full review the ' +
          'next steps would be reading the ' +
          'ACLs on anything that looked unusual and asking you to confirm before changing a ' +
          'permission — the same approval you saw a moment ago.',
        'The audit query returned nothing readable, so there is no activity for me to review. ' +
          'The audit log needs to be enabled and populated before this is useful.',
      ),
    },
  ],
};

export const DEMO_SCRIPTS: readonly DemoScript[] = [
  recentActivityScript,
  documentOverviewScript,
  approvalScript,
  groundedAnswerScript,
  longRunScript,
];
