import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import type { AgentFormProps } from '@agentic-ui/shared/agent-client';

import { documentMetadataForm } from './document-metadata-form.agent-form';

/**
 * The `documentMetadataForm` definition.
 *
 * Small, because the channel does the validating: a form definition brings no
 * `parseProps`, since ADR 001 fixes one props shape that `agent-form.ts` checks
 * centrally for every form component. What is left to pin is the name the gateway
 * puts on the wire, that props are translated rather than spread, and that the
 * component loads lazily.
 */

const props: AgentFormProps = {
  toolCallId: 'call_abc',
  target: { uid: 'aaaaaaaa-1111-2222-3333-444444444444', title: 'Q3 review' },
  title: 'Edit metadata',
  submitLabel: 'Save changes',
  fields: [
    {
      name: 'dc:title',
      label: 'Title',
      type: 'text',
      editable: true,
      value: 'A title',
      source: 'current',
    },
  ],
};

describe('documentMetadataForm', () => {
  it('is named what the gateway declares', () => {
    // `nuxeo-document-tools.ts` declares `component: 'documentMetadataForm'`. The
    // two are pinned to each other by the conformance test in
    // `apps/agent-gateway/src/agent/render-events.spec.ts`, which reads both off
    // disk because the gateway may import no workspace library.
    expect(documentMetadataForm.name).toBe('documentMetadataForm');
  });

  it('translates props into inputs by name rather than spreading them', () => {
    expect(documentMetadataForm.inputs(props)).toEqual({
      target: props.target,
      title: 'Edit metadata',
      submitLabel: 'Save changes',
      fields: props.fields,
    });
  });

  it('does not hand the component the interrupt id', () => {
    // The component answers nothing itself, so it has no use for the id — the
    // panel holds the correlation. Passing it would invite a component that
    // thought it could answer.
    expect(documentMetadataForm.inputs(props)).not.toHaveProperty('toolCallId');
  });

  it('names the two outputs the host wires', () => {
    expect(documentMetadataForm.outputs).toEqual({
      submitted: 'submitted',
      cancelled: 'cancelled',
    });
  });

  it('loads its component lazily', async () => {
    const componentType = await documentMetadataForm.load();

    expect(componentType.name).toContain('DocumentMetadataFormComponent');
  });

  it('declares outputs the component actually exposes as outputs', async () => {
    // The host refuses to wire a named property that is not an `OutputRef`, so a
    // definition naming the wrong thing degrades to the approval card. This
    // catches it here instead, where the reason is visible. Checked against a
    // real instance rather than the prototype: `output()` creates an instance
    // field, so the prototype says nothing about it.
    const componentType = await documentMetadataForm.load();
    const fixture = TestBed.createComponent(componentType);
    const instance = fixture.componentInstance as Record<string, unknown>;

    for (const output of Object.values(documentMetadataForm.outputs)) {
      expect(typeof (instance[output] as { subscribe?: unknown })?.subscribe).toBe('function');
    }
  });
});
