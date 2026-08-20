import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import {
  AGENT_WIDGET_CATALOGUE,
  AGENT_WIDGETS,
  AgentWidgetCatalogue,
  MAX_WIDGET_DOCUMENT_IDS,
  exactProps,
  parseAgentWidgetEvent,
  parseEnum,
  parseEnumList,
  parseUid,
  parseUidList,
  provideAgentWidgets,
  type AgentWidgetDefinition,
} from './agent-widget';

/**
 * The registry mechanism, tested without any real widget.
 *
 * Every widget in the repository is a *use* of what is checked here; the
 * properties below have to hold for a widget nobody in this repository has
 * written yet, which is the whole claim behind calling the registry a public
 * extension point. The two widgets we ship are checked against their own
 * parsers in `apps/nuxeo-ui/src/app/agent-widgets.spec.ts`, which also runs a
 * hostile-props battery over whatever the composition root actually registered.
 */

const UID = 'aaaaaaaa-1111-2222-3333-444444444444';

/** A widget that accepts exactly `{ docIds }`, standing in for a contributed one. */
function listWidget(name = 'documentList'): AgentWidgetDefinition<{ docIds: readonly string[] }> {
  return {
    name,
    parseProps: (props) => {
      if (!exactProps(props, ['docIds'])) return null;
      const docIds = parseUidList(props['docIds']);
      return docIds ? { docIds } : null;
    },
    load: () => Promise.resolve({} as Type<unknown>),
    inputs: (props) => ({ docIds: props.docIds }),
  };
}

function catalogueOf(...widgets: AgentWidgetDefinition<never>[]): AgentWidgetCatalogue {
  return new AgentWidgetCatalogue(widgets as readonly AgentWidgetDefinition[]);
}

describe('the catalogue is the allowlist', () => {
  it('indexes what it was given', () => {
    const catalogue = catalogueOf(listWidget() as AgentWidgetDefinition<never>);

    expect(catalogue.names()).toEqual(['documentList']);
    expect(catalogue.get('documentList')?.name).toBe('documentList');
  });

  it('answers nothing for a name inherited from Object.prototype', () => {
    // A `Record` would have answered `toString` with a function, and
    // `widget.load()` would then have been a call to something the model named.
    const catalogue = catalogueOf(listWidget() as AgentWidgetDefinition<never>);

    expect(catalogue.get('toString')).toBeUndefined();
    expect(catalogue.get('constructor')).toBeUndefined();
    expect(catalogue.get('__proto__')).toBeUndefined();
  });

  it('refuses two widgets claiming one name rather than letting the last one win', () => {
    // Last-one-wins is how a contributed widget shadows a built-in: register
    // `documentList` after the application did and every search result mounts
    // your component instead.
    expect(() =>
      catalogueOf(listWidget() as AgentWidgetDefinition<never>, listWidget() as never),
    ).toThrow(/documentList/);
  });

  it.each(['', 'Document List', '../evil', 'document/list', 'a'.repeat(60), 'DocumentList'])(
    'refuses %p as a widget name',
    (name) => {
      expect(() => catalogueOf(listWidget(name) as AgentWidgetDefinition<never>)).toThrow();
    },
  );

  it('is empty when nothing was registered, and refuses everything', () => {
    const catalogue = catalogueOf();

    expect(catalogue.names()).toEqual([]);
    expect(
      parseAgentWidgetEvent(
        { toolCallId: 'call-1', component: 'documentList', props: { docIds: [UID] } },
        catalogue,
      ),
    ).toMatchObject({ status: 'rejected', reason: 'unknown-widget' });
  });
});

describe('registration is a provider, so the allowlist is fixed at bootstrap', () => {
  it('builds the catalogue from what the composition root provided', () => {
    TestBed.configureTestingModule({
      providers: [provideAgentWidgets(listWidget(), listWidget('documentCard'))],
    });

    expect(TestBed.inject(AGENT_WIDGET_CATALOGUE).names()).toEqual([
      'documentCard',
      'documentList',
    ]);
  });

  it('recognises no widget at all when the application registered none', () => {
    // The graceful-degradation floor. An application that never calls
    // `provideAgentWidgets` still runs; every render event is simply refused.
    TestBed.configureTestingModule({ providers: [] });

    expect(TestBed.inject(AGENT_WIDGET_CATALOGUE).names()).toEqual([]);
  });

  it('lets a library contribute without the application listing its widgets', () => {
    // What a customer package does: export definitions, have the app spread them.
    const fromALibrary = [listWidget('libraryOne'), listWidget('libraryTwo')];
    TestBed.configureTestingModule({ providers: [provideAgentWidgets(...fromALibrary)] });

    expect(TestBed.inject(AGENT_WIDGETS).map((widget) => widget.name)).toEqual([
      'libraryOne',
      'libraryTwo',
    ]);
  });

  it('builds the catalogue once, not per render event', () => {
    // The duplicate-name check walks every registration, and a render event is
    // an untrusted input arriving at whatever rate a gateway sends it.
    TestBed.configureTestingModule({ providers: [provideAgentWidgets(listWidget())] });

    expect(TestBed.inject(AGENT_WIDGET_CATALOGUE)).toBe(TestBed.inject(AGENT_WIDGET_CATALOGUE));
  });
});

/**
 * The boundary where an untrusted payload becomes a mountable request.
 *
 * These are security properties, not the happy path. Every payload below is one
 * a language model steered by a poisoned document could plausibly produce, and
 * the assertion is always that it renders nothing rather than something wrong.
 */
describe('parseAgentWidgetEvent', () => {
  const catalogue = catalogueOf(listWidget() as AgentWidgetDefinition<never>);
  const valid = { toolCallId: 'call-1', component: 'documentList', props: { docIds: [UID] } };
  const parse = (value: unknown) => parseAgentWidgetEvent(value, catalogue);

  it('accepts the shape the gateway sends', () => {
    expect(parse(valid)).toEqual({
      toolCallId: 'call-1',
      status: 'ready',
      name: 'documentList',
      props: { docIds: [UID] },
    });
  });

  describe('a name the catalogue does not hold is refused', () => {
    it.each([
      'documentViewer',
      'DocumentList',
      'metadataForm',
      '../feature-browse/browse.component',
      '',
    ])('refuses the widget name %p', (component) => {
      expect(parse({ ...valid, component })).toEqual({
        toolCallId: 'call-1',
        status: 'rejected',
        reason: 'unknown-widget',
      });
    });

    it('refuses a component that is not a string at all', () => {
      expect(parse({ ...valid, component: { name: 'documentList' } })).toMatchObject({
        status: 'rejected',
        reason: 'unknown-widget',
      });
    });

    it('never calls a parser for a name it did not recognise', () => {
      const widget = listWidget();
      const parseProps = vi.spyOn(widget, 'parseProps');

      parseAgentWidgetEvent(
        { ...valid, component: 'somethingElse' },
        catalogueOf(widget as AgentWidgetDefinition<never>),
      );

      expect(parseProps).not.toHaveBeenCalled();
    });
  });

  describe('the widget validates its own props', () => {
    it.each([
      ['not an object', 'docIds=aaaa'],
      ['an array', [UID]],
      ['null', null],
    ])('refuses props that are %s without consulting the widget', (_name, props) => {
      const widget = listWidget();
      const parseProps = vi.spyOn(widget, 'parseProps');

      const result = parseAgentWidgetEvent(
        { ...valid, props },
        catalogueOf(widget as AgentWidgetDefinition<never>),
      );

      expect(result).toMatchObject({ status: 'rejected', reason: 'invalid-props' });
      expect(parseProps).not.toHaveBeenCalled();
    });

    it('mounts what the parser returned, not what arrived', () => {
      // The parser's output is the props, so a widget cannot be handed a key it
      // did not itself produce even if the payload carried one.
      const widget: AgentWidgetDefinition = {
        ...listWidget(),
        parseProps: () => ({ docIds: ['normalised'] }),
      };

      expect(
        parseAgentWidgetEvent(
          { ...valid, props: { docIds: [UID], extra: 'x' } },
          catalogueOf(widget as AgentWidgetDefinition<never>),
        ),
      ).toMatchObject({ props: { docIds: ['normalised'] } });
    });

    it('treats a parser that throws as a refusal rather than breaking the run', () => {
      // A contributed parser is code we did not write. One that throws on a
      // hostile payload must cost that widget its mount, not the transcript.
      const widget: AgentWidgetDefinition = {
        ...listWidget(),
        parseProps: () => {
          throw new Error('contributed code is not our code');
        },
      };

      expect(
        parseAgentWidgetEvent(valid, catalogueOf(widget as AgentWidgetDefinition<never>)),
      ).toMatchObject({ status: 'rejected', reason: 'invalid-props' });
    });

    it('refuses a parser that returns a non-object rather than mounting on it', () => {
      const widget: AgentWidgetDefinition = {
        ...listWidget(),
        parseProps: () => null,
      };

      expect(
        parseAgentWidgetEvent(valid, catalogueOf(widget as AgentWidgetDefinition<never>)),
      ).toMatchObject({ status: 'rejected', reason: 'invalid-props' });
    });
  });

  describe('a payload with nowhere to attach is dropped entirely', () => {
    it.each([
      ['no toolCallId', { component: 'documentList', props: { docIds: [UID] } }],
      ['an empty toolCallId', { ...valid, toolCallId: '' }],
      ['a non-string toolCallId', { ...valid, toolCallId: 7 }],
      ['an implausibly long toolCallId', { ...valid, toolCallId: 'c'.repeat(500) }],
      ['a payload that is not an object', 'documentList'],
      ['a payload that is an array', [valid]],
      ['nothing at all', undefined],
    ])('drops %s', (_name, value) => {
      expect(parse(value)).toBeNull();
    });
  });
});

/**
 * The helpers a contributed widget is expected to build its parser out of.
 *
 * They are exported, so they are API, and they are the difference between a
 * contributor getting the rules right by default and getting them right by
 * having read the documentation.
 */
describe('the prop validators offered to contributors', () => {
  describe('exactProps', () => {
    it('accepts exactly the required keys', () => {
      expect(exactProps({ docIds: [] }, ['docIds'])).toBe(true);
    });

    it('refuses an extra key rather than ignoring it', () => {
      // An ignored key is how `title` sneaks in beside `docIds` and how the next
      // person assumes it is honoured.
      expect(exactProps({ docIds: [], title: 'Q4' }, ['docIds'])).toBe(false);
    });

    it('refuses a missing required key', () => {
      expect(exactProps({}, ['docIds'])).toBe(false);
    });

    it('allows a declared optional key and still refuses an undeclared one', () => {
      expect(exactProps({ docId: 'a', fields: [] }, ['docId'], ['fields'])).toBe(true);
      expect(exactProps({ docId: 'a' }, ['docId'], ['fields'])).toBe(true);
      expect(exactProps({ docId: 'a', columns: [] }, ['docId'], ['fields'])).toBe(false);
    });
  });

  describe('parseUid', () => {
    it('accepts a uid Nuxeo would issue', () => {
      expect(parseUid(UID)).toBe(UID);
    });

    it.each([
      ['a path traversal', '../../../etc/passwd'],
      ['a query string', 'aaaa?properties=*'],
      ['a URL', 'https://attacker.example/x'],
      ['an encoded slash', 'aaaa%2Fbbbb'],
      ['a script tag', '<script>alert(1)</script>'],
      ['whitespace', 'aaaa bbbb'],
      ['a leading dot', '.aaaa'],
      ['an empty string', ''],
      ['something longer than any uid', 'a'.repeat(200)],
      ['a number', 7],
      ['an object', { uid: UID }],
      ['null', null],
    ])('refuses %s', (_name, value) => {
      // `DocumentService.getById` interpolates the uid into a path without
      // encoding it, so the charset is the control that matters.
      expect(parseUid(value)).toBeNull();
    });
  });

  describe('parseUidList', () => {
    it('refuses the whole list when one entry is malformed', () => {
      expect(parseUidList([UID, '../etc/passwd'])).toBeNull();
    });

    it('refuses an empty list, which would mount an empty table', () => {
      expect(parseUidList([])).toBeNull();
    });

    it('refuses something that is not a list', () => {
      expect(parseUidList(UID)).toBeNull();
    });

    it('refuses a list over the cap rather than truncating it', () => {
      const over = Array.from({ length: MAX_WIDGET_DOCUMENT_IDS + 1 }, (_, i) => `uid-${i}`);

      expect(parseUidList(over)).toBeNull();
    });

    it('accepts a list exactly at the cap', () => {
      const at = Array.from({ length: MAX_WIDGET_DOCUMENT_IDS }, (_, i) => `uid-${i}`);

      expect(parseUidList(at)).toHaveLength(MAX_WIDGET_DOCUMENT_IDS);
    });

    it('collapses duplicates in place, which are repetitive rather than wrong', () => {
      expect(parseUidList([UID, UID, 'uid-2'])).toEqual([UID, 'uid-2']);
    });
  });

  describe('parseEnum and parseEnumList', () => {
    const allowed = ['type', 'created', 'modified'] as const;

    it('accepts a member', () => {
      expect(parseEnum('created', allowed)).toBe('created');
    });

    it('refuses a non-member rather than falling back to a default', () => {
      // A silent fallback makes a malformed request indistinguishable from a
      // well-formed one, which is how "show the creator" becomes a card that
      // quietly does not.
      expect(parseEnum('dc:creator', allowed)).toBeNull();
      expect(parseEnum('CREATED', allowed)).toBeNull();
      expect(parseEnum('toString', allowed)).toBeNull();
      expect(parseEnum(0, allowed)).toBeNull();
    });

    it('refuses the whole list when one member is unrecognised', () => {
      expect(parseEnumList(['type', 'ssn'], allowed)).toBeNull();
    });

    it('refuses an empty list and a non-list', () => {
      expect(parseEnumList([], allowed)).toBeNull();
      expect(parseEnumList('type', allowed)).toBeNull();
    });

    it('cannot be padded past the size of the set it draws from', () => {
      expect(parseEnumList(['type', 'type', 'type', 'type'], allowed)).toBeNull();
    });

    it('collapses duplicates and keeps the order asked for', () => {
      expect(parseEnumList(['modified', 'type', 'modified'], allowed)).toEqual([
        'modified',
        'type',
      ]);
    });
  });
});
