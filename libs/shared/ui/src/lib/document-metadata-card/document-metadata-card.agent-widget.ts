import {
  exactProps,
  parseEnumList,
  parseUid,
  type AgentWidgetDefinition,
} from '@agentic-ui/shared/agent-client';

import { DOCUMENT_CARD_FIELDS, type DocumentCardField } from './document-card-fields';

export interface DocumentCardWidgetProps {
  readonly docId: string;
  readonly fields?: readonly DocumentCardField[];
}

/**
 * The `documentCard` widget: a read-only metadata card for one document.
 *
 * **This file is the worked example of the extension point.** It sits beside the
 * component in a library rather than in `apps/nuxeo-ui`, and registering it is
 * one more argument to `provideAgentWidgets(...)` in `app.config.ts`. Nothing in
 * `apps/nuxeo-ui/src/app/shell` knows this widget exists. A customer library
 * exporting its own `AgentWidgetDefinition` is doing exactly what this does, and
 * `docs/generative-ui-widgets.md` is written from this file.
 *
 * It also demonstrates the two prop shapes the contract supports and no others.
 * `docId` is an identifier — the card re-reads the document under the caller's
 * own session, so the fields are Nuxeo's answer rather than the model's. `fields`
 * is an enum list — the agent chooses between presentations the application
 * already ships, and a field outside the set rejects the whole request rather
 * than being dropped, so "show me the creator" cannot degrade silently into a
 * card that does not.
 */
export const documentCardWidget: AgentWidgetDefinition<DocumentCardWidgetProps> = {
  name: 'documentCard',

  parseProps: (props) => {
    if (!exactProps(props, ['docId'], ['fields'])) return null;

    const docId = parseUid(props['docId']);
    if (!docId) return null;

    // Absent is a legitimate request for the card's own default. Present but
    // unrecognised is a request the producer got wrong, and is refused.
    if (!('fields' in props)) return { docId };
    const fields = parseEnumList(props['fields'], DOCUMENT_CARD_FIELDS);
    return fields ? { docId, fields } : null;
  },

  load: () =>
    import('./document-metadata-card.component').then((m) => m.DocumentMetadataCardComponent),

  inputs: (props) => ({
    docId: props.docId,
    ...(props.fields ? { fields: props.fields } : {}),
  }),
};
