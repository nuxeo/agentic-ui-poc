import {
  exactProps,
  parseUidList,
  type AgentWidgetDefinition,
} from '@agentic-ui/shared/agent-client';

/**
 * The widgets this application contributes to the chat panel.
 *
 * **This file is here because `apps/nuxeo-ui` is the only project allowed to name
 * a feature.** `eslint.config.mjs` permits `scope:app → scope:features` and
 * refuses `scope:shared → scope:features`, so a widget whose component lives in
 * `libs/features` can only be registered from the composition root. That is the
 * same rule that puts the content adapter binding here, and it is a lint
 * constraint rather than a design one: `documentCardWidget` ships from
 * `libs/shared/ui` alongside its component precisely because it can.
 *
 * Both are handed to `provideAgentWidgets(...)` in `app.config.ts`. Adding a
 * third — from this repository or from a customer's own library — is one entry
 * in that call and no change to the panel.
 *
 * Every definition here is read-only and takes identifiers rather than content,
 * which is what makes it safe to mount something the agent asked for. See
 * `AgentWidgetDefinition` for the full contract.
 */

interface DocumentListWidgetProps {
  readonly docIds: readonly string[];
}

/**
 * A compact document list, mounted when the agent searches or lists a folder.
 *
 * Props are uids and nothing else. The component re-reads each one through
 * `DocumentService` under the caller's session, so the rows are Nuxeo's answer
 * to this user rather than the model's account of it, and a document the caller
 * cannot read simply does not appear.
 */
export const documentListWidget: AgentWidgetDefinition<DocumentListWidgetProps> = {
  name: 'documentList',

  parseProps: (props) => {
    if (!exactProps(props, ['docIds'])) return null;
    const docIds = parseUidList(props['docIds']);
    return docIds ? { docIds } : null;
  },

  load: () => import('@agentic-ui/feature-document-lists').then((m) => m.DocumentListPageComponent),

  // `kind`, `density` and `selectable` are the application's choices, not the
  // model's, and `by-id` is a read-only list definition: it offers no remove
  // action, so a component mounted from a tool call carries no write the gateway
  // holds no record of. Selection is not a write — it goes to `SelectionService`
  // and stays in the browser.
  inputs: (props) => ({
    kind: 'by-id',
    docIds: props.docIds,
    density: 'compact',
    selectable: true,
  }),

  // The rows this list shows are exactly its validated `docIds`, so the offered
  // set is the props. A proposal naming anything else has no row to attach to
  // and never becomes visible.
  selection: {
    offers: (props) => props.docIds,
    inputs: (proposed) => ({ proposedIds: proposed }),
  },
};
