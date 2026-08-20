import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import {
  AGENT_FORM_CATALOGUE,
  AGENT_FORM_COMPONENTS,
  AgentFormCatalogue,
  MAX_AGENT_FORM_FIELDS,
  parseInterruptForm,
  provideAgentFormComponents,
  type AgentFormDefinition,
} from './agent-form';

/**
 * The interrupt-form mechanism, tested without any real form component.
 *
 * The properties below have to hold for a form component nobody has written yet,
 * for the same reason the widget registry's do. What is specific to the one form
 * that ships is in `libs/shared/ui/src/lib/document-metadata-form/`.
 *
 * The organising question for the refusal cases: **what does a refused form
 * degrade to?** An approval card, which is a fully consented write showing the
 * same arguments the form would have. So every check here failing closed costs a
 * nicer affordance and never costs safety — which is the direction the gateway's
 * own `declaredForm` degrades in, deliberately.
 */

const INTERRUPT = 'call_abc';
const UID = 'aaaaaaaa-1111-2222-3333-444444444444';

function formComponent(name = 'documentMetadataForm'): AgentFormDefinition {
  return {
    name,
    load: () => Promise.resolve({} as Type<unknown>),
    inputs: (props) => ({ target: props.target, fields: props.fields }),
    outputs: { submitted: 'submitted', cancelled: 'cancelled' },
  };
}

function catalogueOf(...forms: AgentFormDefinition[]): AgentFormCatalogue {
  return new AgentFormCatalogue(forms);
}

/** A declaration shaped exactly as the gateway publishes one. */
function declaration(overrides: Record<string, unknown> = {}) {
  return {
    component: 'documentMetadataForm',
    props: {
      toolCallId: INTERRUPT,
      target: { uid: UID, title: 'Records retention policy 2026', type: 'File', path: '/a/b' },
      title: 'Edit metadata',
      submitLabel: 'Save changes',
      fields: [
        {
          name: 'dc:title',
          label: 'Title',
          type: 'text',
          editable: true,
          required: true,
          maxLength: 250,
          value: 'Title the model chose',
          source: 'proposed',
        },
        { name: 'dc:creator', label: 'Created by', type: 'text', value: 'jdoe', source: 'current' },
      ],
      ...overrides,
    },
  };
}

function parse(value: unknown, interruptId = INTERRUPT) {
  return parseInterruptForm(value, interruptId, catalogueOf(formComponent()));
}

/** A declaration whose props carry one field, built from the given overrides. */
function withField(field: Record<string, unknown>) {
  return declaration({ fields: [{ ...BASE_FIELD, ...field }] });
}

const BASE_FIELD = {
  name: 'dc:title',
  label: 'Title',
  type: 'text',
  editable: true,
  value: 'A title',
  source: 'current',
};

describe('the form catalogue is the allowlist', () => {
  it('indexes what it was given', () => {
    const catalogue = catalogueOf(formComponent());

    expect(catalogue.names()).toEqual(['documentMetadataForm']);
    expect(catalogue.get('documentMetadataForm')?.name).toBe('documentMetadataForm');
  });

  it('answers nothing for a name inherited from Object.prototype', () => {
    const catalogue = catalogueOf(formComponent());

    expect(catalogue.get('toString')).toBeUndefined();
    expect(catalogue.get('constructor')).toBeUndefined();
  });

  it('refuses two components registered under one name', () => {
    // Last-one-wins is how a contributed component silently shadows a built-in,
    // so it is a configuration error thrown at bootstrap instead.
    expect(() => catalogueOf(formComponent(), formComponent())).toThrow(
      /Two form components are registered/,
    );
  });

  it.each([
    ['empty', ''],
    ['not an identifier', 'document metadata form'],
    ['a path', 'a/b'],
  ])('refuses a name that is %s', (_label, name) => {
    expect(() => catalogueOf(formComponent(name))).toThrow(/not a valid identifier/);
  });

  it('is empty in an application that registers nothing', () => {
    TestBed.configureTestingModule({});

    expect(TestBed.inject(AGENT_FORM_CATALOGUE).names()).toEqual([]);
  });

  it('is built from the multi-provider the composition root supplies', () => {
    TestBed.configureTestingModule({ providers: provideAgentFormComponents(formComponent()) });

    expect(TestBed.inject(AGENT_FORM_COMPONENTS)).toHaveLength(1);
    expect(TestBed.inject(AGENT_FORM_CATALOGUE).names()).toEqual(['documentMetadataForm']);
  });
});

describe('parseInterruptForm', () => {
  it('reads the declaration ADR 001 publishes', () => {
    expect(parse(declaration())).toEqual({
      name: 'documentMetadataForm',
      props: {
        toolCallId: INTERRUPT,
        target: { uid: UID, title: 'Records retention policy 2026', type: 'File', path: '/a/b' },
        title: 'Edit metadata',
        submitLabel: 'Save changes',
        fields: [
          {
            name: 'dc:title',
            label: 'Title',
            type: 'text',
            editable: true,
            required: true,
            maxLength: 250,
            value: 'Title the model chose',
            source: 'proposed',
          },
          {
            name: 'dc:creator',
            label: 'Created by',
            type: 'text',
            editable: false,
            value: 'jdoe',
            source: 'current',
          },
        ],
      },
    });
  });

  describe('the component name is the browser‘s to allow', () => {
    it('refuses a component this application does not register', () => {
      expect(parse({ ...declaration(), component: 'documentDeleteForm' })).toBeNull();
    });

    it('refuses a name borrowed from Object.prototype', () => {
      expect(parse({ ...declaration(), component: 'constructor' })).toBeNull();
    });

    it.each([
      ['absent', undefined],
      ['not a string', 7],
      ['empty', ''],
    ])('refuses a component that is %s', (_label, component) => {
      expect(parse({ ...declaration(), component })).toBeNull();
    });
  });

  describe('the form answers the interrupt it arrived on, and no other', () => {
    it('refuses a declaration naming a different interrupt', () => {
      // The correlation check, and it is not a formality: a form submitting
      // against another interrupt would answer a decision the user never saw.
      expect(parse(declaration({ toolCallId: 'call_other' }))).toBeNull();
    });

    it.each([
      ['absent', undefined],
      ['not a string', 7],
      ['null', null],
    ])('refuses a toolCallId that is %s', (_label, toolCallId) => {
      expect(parse(declaration({ toolCallId }))).toBeNull();
    });

    it('returns the interrupt‘s own id rather than the payload‘s copy of it', () => {
      // Same value, different provenance. The props the component mounts with
      // carry the id this browser matched, not the one the payload asserted.
      expect(parse(declaration())?.props.toolCallId).toBe(INTERRUPT);
    });
  });

  describe('the target', () => {
    it('renders as the bare uid when Nuxeo did not answer for this caller', () => {
      // ADR 001: absent means unresolved, and the only honest rendering of an
      // unresolved uid is the uid. A missing title must not be substituted from
      // metadata.args or from anything the model supplied.
      const parsed = parse(declaration({ target: { uid: UID } }));

      expect(parsed?.props.target).toEqual({ uid: UID });
      expect(parsed?.props.target.title).toBeUndefined();
    });

    it.each([
      ['a path traversal', '../../../etc/passwd'],
      ['a URL', 'https://attacker.example/x'],
      ['a query string', `${UID}?properties=*`],
      ['empty', ''],
      ['not a string', 7],
    ])('refuses a uid that is %s', (_label, uid) => {
      expect(parse(declaration({ target: { uid } }))).toBeNull();
    });

    it.each([
      ['absent', undefined],
      ['not an object', 'a document'],
      ['an array', [UID]],
    ])('refuses a target that is %s', (_label, target) => {
      expect(parse(declaration({ target }))).toBeNull();
    });

    it('drops an unusable label rather than the whole form, showing less instead', () => {
      const parsed = parse(declaration({ target: { uid: UID, title: 7, path: 'x'.repeat(5000) } }));

      expect(parsed?.props.target).toEqual({ uid: UID });
    });
  });

  describe('the field set is atomic', () => {
    it.each([
      ['not an array', { name: 'dc:title' }],
      ['empty', []],
      ['longer than the cap', Array.from({ length: MAX_AGENT_FORM_FIELDS + 1 }, () => BASE_FIELD)],
    ])('refuses fields that are %s', (_label, fields) => {
      expect(parse(declaration({ fields }))).toBeNull();
    });

    it('refuses the whole form for one bad field rather than dropping it', () => {
      // A form missing a field it was declared with is a form whose submission
      // means something other than what the user was shown.
      const fields = [BASE_FIELD, { ...BASE_FIELD, name: 'dc:description', type: 'colour' }];

      expect(parse(declaration({ fields }))).toBeNull();
    });

    it('refuses a duplicate field name, which would make the submission ambiguous', () => {
      expect(parse(declaration({ fields: [BASE_FIELD, { ...BASE_FIELD }] }))).toBeNull();
    });

    it('refuses a form with nothing writable, which the card answers better', () => {
      expect(parse(withField({ editable: false }))).toBeNull();
      expect(parse(withField({ editable: undefined }))).toBeNull();
    });
  });

  describe('editability is deny-by-default, strictly', () => {
    it('honours only a literal true', () => {
      expect(parse(withField({ editable: true }))?.props.fields[0].editable).toBe(true);
    });

    it.each([
      ['the string "true"', 'true'],
      ['1', 1],
      ['the string "yes"', 'yes'],
      ['an object', {}],
    ])('refuses to make a field writable for %s', (_label, editable) => {
      // Falls to display-only, so the form has nothing writable and the whole
      // declaration is refused. The omission a producer makes leaves a field
      // read-only rather than writable, which is the direction it must fall.
      expect(parse(withField({ editable }))).toBeNull();
    });

    it('reports a field with no editable key as display-only rather than dropping it', () => {
      const fields = [BASE_FIELD, { ...BASE_FIELD, name: 'dc:creator', editable: undefined }];

      expect(parse(declaration({ fields }))?.props.fields[1]).toMatchObject({
        name: 'dc:creator',
        editable: false,
      });
    });
  });

  describe('the field name is an object key, never a path', () => {
    it('accepts a Nuxeo xpath', () => {
      expect(parse(withField({ name: 'dc:title' }))?.props.fields[0].name).toBe('dc:title');
    });

    it.each([
      ['__proto__', '__proto__'],
      ['constructor', 'constructor'],
      ['prototype', 'prototype'],
    ])('refuses %s, which would assign to a prototype', (_label, name) => {
      expect(parse(withField({ name }))).toBeNull();
    });

    it.each([
      ['a path', 'a/b'],
      ['a query string', 'dc:title?x=1'],
      ['empty', ''],
      ['not a string', 7],
      ['unreasonably long', 'a'.repeat(200)],
    ])('refuses a name that is %s', (_label, name) => {
      expect(parse(withField({ name }))).toBeNull();
    });
  });

  describe('the declared type governs the value', () => {
    it.each([
      ['text', 'A title'],
      ['multiline', 'Several\nlines'],
      ['date', '2026-08-07T00:00:00.000Z'],
    ])('accepts a string for %s', (type, value) => {
      expect(parse(withField({ type, value }))?.props.fields[0].value).toBe(value);
    });

    it('accepts a finite number for number', () => {
      expect(parse(withField({ type: 'number', value: 42 }))?.props.fields[0].value).toBe(42);
    });

    it('accepts a boolean for boolean, including false', () => {
      expect(parse(withField({ type: 'boolean', value: false }))?.props.fields[0].value).toBe(
        false,
      );
    });

    it('accepts null for any type, which renders as an empty control', () => {
      expect(parse(withField({ value: null, source: 'empty' }))?.props.fields[0].value).toBeNull();
    });

    it.each([
      ['a numeric string where a number goes', 'number', '42'],
      ['NaN where a number goes', 'number', Number.NaN],
      ['a string where a boolean goes', 'boolean', 'true'],
      ['a number where text goes', 'text', 7],
      ['an object anywhere', 'text', { toString: 'x' }],
      ['an array anywhere', 'text', ['a']],
    ])('refuses %s', (_label, type, value) => {
      // Refused rather than nulled. Nulling would show an empty box where the
      // model proposed something, which reads as "there is no value" — and the
      // gateway would refuse that value on submission anyway.
      expect(parse(withField({ type, value }))).toBeNull();
    });

    it.each([
      ['outside the five types', 'colour'],
      ['absent', undefined],
      ['not a string', 7],
    ])('refuses a type that is %s', (_label, type) => {
      expect(parse(withField({ type }))).toBeNull();
    });
  });

  describe('the source says who authored the value', () => {
    it.each([['proposed'], ['current'], ['empty']])('accepts %s', (source) => {
      expect(parse(withField({ source }))?.props.fields[0].source).toBe(source);
    });

    it.each([
      ['a value outside the set', 'model'],
      ['absent', undefined],
    ])('refuses %s, because the form must be able to mark a suggestion', (_label, source) => {
      // `source` is how the user is told they are reviewing a suggestion rather
      // than an existing value. A form that cannot say which is which is worse
      // than the card, which shows the proposed arguments plainly.
      expect(parse(withField({ source }))).toBeNull();
    });
  });

  describe('required and maxLength', () => {
    it('carries them only when declared', () => {
      const field = parse(withField({ required: true, maxLength: 250 }))?.props.fields[0];

      expect(field).toMatchObject({ required: true, maxLength: 250 });
    });

    it('omits them rather than defaulting when absent', () => {
      const field = parse(withField({}))?.props.fields[0];

      expect(field).not.toHaveProperty('required');
      expect(field).not.toHaveProperty('maxLength');
    });

    it('treats a non-true required as absent', () => {
      expect(parse(withField({ required: 'yes' }))?.props.fields[0]).not.toHaveProperty('required');
    });

    it.each([
      ['zero', 0],
      ['negative', -1],
      ['fractional', 1.5],
      ['absurd', 10_000_000],
      ['not a number', '250'],
    ])('refuses a maxLength that is %s', (_label, maxLength) => {
      expect(parse(withField({ maxLength }))).toBeNull();
    });
  });

  describe('the prose the form shows', () => {
    it.each([
      ['title', 'title'],
      ['submitLabel', 'submitLabel'],
    ])('refuses an absent %s', (_label, key) => {
      expect(parse(declaration({ [key]: undefined }))).toBeNull();
    });

    it.each([
      ['not a string', 7],
      ['empty', ''],
      ['unreasonably long', 'a'.repeat(5000)],
    ])('refuses a title that is %s', (_label, title) => {
      expect(parse(declaration({ title }))).toBeNull();
    });
  });

  /**
   * Which held argument the submitted values nest under.
   *
   * Display only, and that is the whole of its safety: it exists so the settled tool
   * card can show what *ran* instead of what the model proposed, and the browser never
   * builds a request from it — a submission is a flat map of field names, and
   * `overlayFormSubmission` reads this name from the tool's own declaration server-side.
   * Nothing done with it here can move a value anywhere.
   *
   * So a bad one is dropped individually rather than refusing the form, like the target's
   * optional title: the cost is the card showing the proposal, which is the behaviour
   * before this field existed.
   */
  describe('the argument submitted values belong to', () => {
    it('is carried through when it names an argument plausibly', () => {
      expect(parse(declaration({ valuesArg: 'properties' }))?.props.valuesArg).toBe('properties');
    });

    it('is simply absent when the gateway did not send one', () => {
      expect(parse(declaration())?.props.valuesArg).toBeUndefined();
    });

    it.each([
      ['not a string', 7],
      ['empty', ''],
      ['shaped like a path', 'a/b'],
      ['shaped like a prototype reach', '__proto__'],
      ['constructor', 'constructor'],
      ['unreasonably long', 'a'.repeat(200)],
    ])('drops one that is %s, keeping the form', (_label, valuesArg) => {
      const parsed = parse(declaration({ valuesArg }));

      // The form still mounts — this field is a card label, not a control.
      expect(parsed).not.toBeNull();
      expect(parsed?.props.valuesArg).toBeUndefined();
    });
  });

  describe('payloads that are not declarations at all', () => {
    it.each([
      ['null', null],
      ['a string', 'documentMetadataForm'],
      ['an array', [{ component: 'documentMetadataForm' }]],
      ['an empty object', {}],
      ['props that are not an object', { component: 'documentMetadataForm', props: 'x' }],
      ['props that are an array', { component: 'documentMetadataForm', props: [] }],
    ])('refuses %s', (_label, value) => {
      expect(parse(value)).toBeNull();
    });
  });

  it('refuses everything when the application registered no form component', () => {
    expect(parseInterruptForm(declaration(), INTERRUPT, catalogueOf())).toBeNull();
  });
});
