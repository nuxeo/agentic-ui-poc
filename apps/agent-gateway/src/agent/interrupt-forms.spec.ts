import { describe, expect, it } from 'vitest';

import { DEFAULT_TOOLS } from '../tools/default-registry';
import { requiresApproval } from '../tools/mutation-policy';
import type {
  AgentTool,
  JsonSchemaObject,
  MutationFormSpec,
  MutationSpec,
} from '../tools/tool.types';
import { declaredForm, interruptFormFor, overlayFormSubmission } from './interrupt-forms';
import type { ApprovalTarget } from './write-preflight';

/**
 * The half of the form rule the end-to-end suite cannot reach: what happens to a
 * *declaration* that is wrong, rather than to a submission that is hostile.
 *
 * Both directions matter and they fail differently. A hostile submission must be
 * refused loudly, because someone is on the other end of it. A wrong declaration
 * must degrade **silently to the approval card**, because the card is a fully
 * consented write and refusing would take a working capability away over a
 * mistake in our own source. Every case below is one way a declaration could
 * widen a write past what the form shows, and every one of them ends in "no form
 * at all".
 */

type FormCapable = Pick<AgentTool, 'mutation' | 'parameters'>;

const PARAMETERS: JsonSchemaObject = {
  type: 'object',
  properties: { uid: { type: 'string' }, properties: { type: 'object' }, note: { type: 'string' } },
  required: ['uid', 'properties'],
  additionalProperties: false,
};

const FORM: MutationFormSpec = {
  component: 'documentMetadataForm',
  valuesArg: 'properties',
  title: 'Edit metadata',
  submitLabel: 'Save',
  fields: [
    { name: 'dc:title', label: 'Title', type: 'text', editable: true },
    { name: 'dc:created', label: 'Created', type: 'date' },
  ],
};

function tool(
  form: Partial<MutationFormSpec> | undefined,
  spec: Partial<MutationSpec> = {},
  parameters: JsonSchemaObject = PARAMETERS,
): FormCapable {
  return {
    parameters,
    mutation: {
      action: 'Change metadata on',
      subject: { arg: 'uid', changed: true },
      ...spec,
      ...(form ? { form: { ...FORM, ...form } } : {}),
    },
  };
}

const HELD = { uid: 'doc-1', properties: { 'dc:title': 'Held title' } };

async function noCurrentValues(): Promise<null> {
  return null;
}

describe('a declaration that could widen the write raises no form', () => {
  it('accepts the declaration the shipped metadata tool makes', () => {
    expect(declaredForm(tool({}))).toMatchObject({ valuesArg: 'properties' });
  });

  it('raises none when the tool declares no mutation at all', () => {
    expect(declaredForm({ parameters: PARAMETERS, mutation: undefined })).toBeUndefined();
  });

  it('raises none when the tool declares a mutation but no form', () => {
    expect(declaredForm(tool(undefined))).toBeUndefined();
  });

  // The single most important one. Were the values argument the same as the
  // argument naming the target, a submitted value would land on the document id
  // and the payload would choose what gets written — the exact thing rule 3
  // forbids, arriving through a declaration rather than through a payload.
  it('raises none when the values argument is the argument naming the target', () => {
    expect(declaredForm(tool({ valuesArg: 'uid' }))).toBeUndefined();
  });

  it('raises none when the values argument is the second document argument', () => {
    const spec = { into: { arg: 'note', preposition: 'into' } };
    expect(declaredForm(tool({ valuesArg: 'note' }, spec))).toBeUndefined();
  });

  it('raises none when the values argument is the literal the user authorises', () => {
    expect(declaredForm(tool({ valuesArg: 'note' }, { value: 'note' }))).toBeUndefined();
  });

  it('raises none when the values argument is not an argument the tool accepts', () => {
    expect(declaredForm(tool({ valuesArg: 'nowhere' }))).toBeUndefined();
  });

  // An ambiguous allowlist is not an allowlist.
  it('raises none for a duplicated field name', () => {
    const fields = [
      { name: 'dc:title', label: 'Title', type: 'text' as const, editable: true },
      { name: 'dc:title', label: 'Title again', type: 'text' as const },
    ];
    expect(declaredForm(tool({ fields }))).toBeUndefined();
  });

  // Assigning into the values object by field name is a prototype write for
  // exactly three names. No payload can reach this — the allowlist is the
  // declaration — but a declaration can name one by accident.
  it.each(['__proto__', 'constructor', 'prototype'])('raises none for a field named %s', (name) => {
    const fields = [{ name, label: 'Sneaky', type: 'text' as const, editable: true }];
    expect(declaredForm(tool({ fields }))).toBeUndefined();
  });

  it('raises none for a blank field name', () => {
    const fields = [{ name: '  ', label: 'Nameless', type: 'text' as const, editable: true }];
    expect(declaredForm(tool({ fields }))).toBeUndefined();
  });

  // A form with nothing writable is an approval card with extra steps, and it
  // would collect a submission it then discards entirely.
  it('raises none when no field is editable', () => {
    const fields = [{ name: 'dc:title', label: 'Title', type: 'text' as const }];
    expect(declaredForm(tool({ fields }))).toBeUndefined();
  });

  // Because the executed arguments are rebuilt from the declaration rather than
  // filtered, a required argument the declaration cannot supply would produce a
  // partial write. The card, which runs the model's own complete arguments, is
  // the correct fallback.
  it('raises none when the declaration cannot supply a required argument', () => {
    const parameters: JsonSchemaObject = { ...PARAMETERS, required: ['uid', 'properties', 'note'] };
    expect(declaredForm(tool({}, {}, parameters))).toBeUndefined();
  });
});

describe('the form the interrupt publishes', () => {
  const targets: readonly ApprovalTarget[] = [
    { uid: 'doc-1', title: 'Retention policy', type: 'File', path: '/ws/policy' },
  ];

  it('takes its target from the held call and its title from the resolved read', async () => {
    const form = await interruptFormFor(tool({}), 'call-1', HELD, targets, noCurrentValues);

    expect(form?.props.target).toEqual({
      uid: 'doc-1',
      title: 'Retention policy',
      type: 'File',
      path: '/ws/policy',
    });
    expect(form?.props.toolCallId).toBe('call-1');
  });

  it('prefers the model’s proposal over the stored value, and says which it used', async () => {
    const form = await interruptFormFor(tool({}), 'call-1', HELD, targets, async () => ({
      'dc:title': 'Stored title',
      'dc:created': '2026-01-04',
    }));

    expect(form?.props.fields).toEqual([
      expect.objectContaining({ value: 'Held title', source: 'proposed', editable: true }),
      expect.objectContaining({ value: '2026-01-04', source: 'current', editable: false }),
    ]);
  });

  // A multi-valued property has no single-line form field, and rendering the
  // first entry of a list would be a quiet lie about what is stored.
  it('renders a non-scalar stored value as empty rather than as something else', async () => {
    const form = await interruptFormFor(
      tool({}),
      'call-1',
      { uid: 'doc-1' },
      targets,
      async () => ({
        'dc:title': ['one', 'two'],
      }),
    );

    expect(form?.props.fields[0]).toMatchObject({ value: null, source: 'current' });
  });

  it('raises no form when the held call names no target', async () => {
    const form = await interruptFormFor(
      tool({}),
      'call-1',
      { properties: {} },
      [],
      noCurrentValues,
    );

    expect(form).toBeUndefined();
  });

  // One form edits one document. A write over several is not one form, and
  // picking one of them to be "the" target is precisely the confusion the target
  // rule exists to prevent.
  it('raises no form when the target argument holds several documents', async () => {
    const held = { uid: ['doc-1', 'doc-2'], properties: {} };
    const form = await interruptFormFor(tool({}), 'call-1', held, [], noCurrentValues);

    expect(form).toBeUndefined();
  });

  it('raises no form for a tool that declares none', async () => {
    const form = await interruptFormFor(tool(undefined), 'call-1', HELD, targets, noCurrentValues);

    expect(form).toBeUndefined();
  });
});

describe('overlay-and-restrict, by field type', () => {
  const typed = tool({
    fields: [
      { name: 'text', label: 'Text', type: 'text', editable: true },
      { name: 'count', label: 'Count', type: 'number', editable: true },
      { name: 'flag', label: 'Flag', type: 'boolean', editable: true },
      { name: 'when', label: 'When', type: 'date', editable: true },
      { name: 'note', label: 'Note', type: 'multiline', editable: true },
    ],
  });

  function overlay(fields: unknown) {
    return overlayFormSubmission(typed, { uid: 'doc-1', properties: {} }, fields);
  }

  it('takes a value of the declared type for each kind of field', () => {
    const result = overlay({
      text: 'a',
      count: 2,
      flag: false,
      when: '2026-08-07T00:00:00.000Z',
      note: '',
    });

    expect(result).toMatchObject({
      ok: true,
      args: {
        uid: 'doc-1',
        properties: {
          text: 'a',
          count: 2,
          flag: false,
          when: '2026-08-07T00:00:00.000Z',
          note: '',
        },
      },
    });
  });

  // Coercion is how a form ends up writing 0 for an empty box, or true for the
  // string "false". The declared type is a claim about the value, not a request
  // to convert it.
  const rejected = [
    { what: 'a numeric string for a number', fields: { count: '2' } },
    { what: 'an infinite number', fields: { count: Number.POSITIVE_INFINITY } },
    { what: 'a string for a boolean', fields: { flag: 'true' } },
    { what: 'an unparseable date', fields: { when: 'the day before yesterday' } },
    { what: 'a number for a date', fields: { when: 20260807 } },
  ] as const;

  it.each(rejected)('refuses $what', ({ fields }) => {
    expect(overlay(fields)).toMatchObject({
      ok: false,
      rejection: { code: 'invalid_form_submission' },
    });
  });

  it('clears an optional field submitted as null', () => {
    expect(overlay({ text: null })).toMatchObject({
      ok: true,
      args: { properties: { text: null } },
    });
  });

  it('refuses a submission for a tool that declares no form', () => {
    const result = overlayFormSubmission(tool(undefined), HELD, { 'dc:title': 'x' });

    expect(result).toMatchObject({ ok: false, rejection: { code: 'form_not_declared' } });
  });

  it('refuses a submission when the held call names no target', () => {
    const result = overlayFormSubmission(tool({}), { properties: {} }, { 'dc:title': 'x' });

    expect(result).toMatchObject({ ok: false, rejection: { code: 'invalid_form_submission' } });
  });

  // The held values argument being something other than an object is the model's
  // mistake, not the user's. The submission still applies; there is simply
  // nothing to overlay it onto.
  it('overlays onto an empty set when the held call carried no values object', () => {
    const result = overlayFormSubmission(
      tool({}),
      { uid: 'doc-1', properties: 'nonsense' },
      {
        'dc:title': 'From the form',
      },
    );

    expect(result).toMatchObject({
      ok: true,
      args: { uid: 'doc-1', properties: { 'dc:title': 'From the form' } },
    });
  });

  // The rebuild-versus-filter distinction, asserted as an exact object because
  // that is the only assertion that can see it. A merge that spreads the payload
  // over the held arguments still writes the right document — the target is
  // reinstated afterwards — and still writes the right properties, so every
  // assertion made on the outgoing Nuxeo request passes. What it also does is
  // carry payload-authored keys into the tool's argument object, where the next
  // tool to read one of them is the bug. Only "these arguments and no others"
  // catches it.
  it('emits only the arguments the declaration names, however much the payload sends', () => {
    const held = { uid: 'doc-1', properties: { 'dc:title': 'Held' }, note: 'held note' };
    const result = overlayFormSubmission(tool({}), held, {
      'dc:title': 'From the form',
      uid: 'doc-victim',
      note: 'from the payload',
      whatever: { nested: true },
    });

    expect(result).toEqual({
      ok: true,
      applied: ['dc:title'],
      args: { uid: 'doc-1', properties: { 'dc:title': 'From the form' } },
    });
  });

  it('reports which declared fields the submission actually set', () => {
    const result = overlay({ text: 'a', undeclared: 'b' });

    expect(result).toMatchObject({ ok: true, applied: ['text'] });
  });
});

describe('the shipped tool set declares forms it can honour', () => {
  const withForms = DEFAULT_TOOLS.filter((entry) => entry.mutation?.form !== undefined);

  // Plan A7 stage 3 commits to one form and to one form only. A second one
  // appearing without this test being updated is a scope change nobody decided.
  it('declares exactly one form, on metadata edit', () => {
    expect(withForms.map((entry) => entry.name)).toEqual(['nuxeo.updateMetadata']);
  });

  // A declaration that fails validation degrades to a card silently, which is the
  // right runtime behaviour and the wrong thing to discover in production. This
  // is what stops the fallback hiding a bug in our own source.
  it('makes every declared form one the gateway will actually raise', () => {
    const rejectedForms = withForms.filter((entry) => declaredForm(entry) === undefined);

    expect(rejectedForms.map((entry) => entry.name)).toEqual([]);
  });

  it('declares a form only on a tool that is gated in the first place', () => {
    const ungated = withForms.filter((entry) => !requiresApproval(entry));

    expect(ungated.map((entry) => entry.name)).toEqual([]);
  });

  // A form answer is a write with no approval card behind it, so every field it
  // can set has to be one somebody chose to expose. A declaration where
  // everything is writable by default would be the opposite of that.
  it('marks each writable field explicitly, and leaves the rest display-only', () => {
    const fields = withForms.flatMap((entry) => entry.mutation?.form?.fields ?? []);
    const writable = fields.filter((field) => field.editable === true);

    expect(fields.length).toBeGreaterThan(writable.length);
    expect(writable.map((field) => field.name)).toEqual(['dc:title', 'dc:description']);
  });
});
