import type { AgentFormDefinition } from '@agentic-ui/shared/agent-client';

/**
 * The `documentMetadataForm` component: the one submitting component A7 ships.
 *
 * Deliberately smaller than an `AgentWidgetDefinition`. There is no `parseProps`,
 * because the interrupt-form channel has one normative props shape that
 * `agent-form.ts` validates centrally for every form; and no `selection`, because
 * a form edits one document rather than offering rows to tick.
 *
 * It is registered through `provideAgentFormComponents(...)` — a **different
 * token** from the read-only widgets, which is the decision recorded in ADR 001
 * rather than an implementation convenience. The short version: a render-event
 * widget's props are identifiers and enums and never content, and that holds for
 * every member of that registry without exception. A form's props necessarily
 * carry content — the target's title, each field's label, each field's current
 * value — which is legitimate because the gateway resolved them from Nuxeo under
 * the caller's own credentials, and is not a rule the other registry can absorb
 * without its guarantee becoming conditional on which member you are holding.
 *
 * The component this names **may submit and still may not write.** It emits the
 * values the user typed; the panel answers the interrupt the write is held on;
 * the gateway performs the write behind the approval gate it was already behind.
 */
export const documentMetadataForm: AgentFormDefinition = {
  name: 'documentMetadataForm',

  load: () =>
    import('./document-metadata-form.component').then((m) => m.DocumentMetadataFormComponent),

  // Translated by name rather than spread, exactly as a widget's inputs are, and
  // for the same reason: a component that later gains a dangerous input does not
  // become reachable until someone writes it into this function. `toolCallId` is
  // deliberately not passed — the component answers nothing itself, so it has no
  // use for the id, and the panel holds the correlation.
  inputs: (props) => ({
    target: props.target,
    title: props.title,
    submitLabel: props.submitLabel,
    fields: props.fields,
  }),

  outputs: { submitted: 'submitted', cancelled: 'cancelled' },
};
