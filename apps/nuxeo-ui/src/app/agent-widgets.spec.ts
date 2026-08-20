import { TestBed } from '@angular/core/testing';

import {
  AGENT_FORM_CATALOGUE,
  AGENT_WIDGET_CATALOGUE,
  parseAgentWidgetEvent,
  type AgentFormDefinition,
  type AgentWidgetCatalogue,
  type AgentWidgetDefinition,
} from '@agentic-ui/shared/agent-client';

import { appConfig } from './app.config';
import { documentListWidget } from './agent-widgets';

/**
 * Conformance for every widget this application actually registers.
 *
 * The registry mechanism is tested in `libs/shared/agent-client` against widgets
 * invented for the purpose. This file is the other half: it reads the real
 * `provideAgentWidgets(...)` call out of `app.config.ts` and puts every widget
 * in it through the same hostile battery, so a widget added later — by us or by
 * a customer package the application picks up — inherits these properties
 * instead of having to remember them.
 *
 * It is deliberately written against the injected catalogue rather than an
 * imported list. A widget registered but not exported from here would escape a
 * test that imported; it cannot escape one that injects.
 */

const UID = 'aaaaaaaa-1111-2222-3333-444444444444';

/** Only the `provideAgentWidgets(...)` array, so no application service is built. */
function widgetProviders() {
  return appConfig.providers.filter((provider) => Array.isArray(provider)).flat();
}

/**
 * The smallest payload a widget accepts, discovered rather than declared.
 *
 * Keeping the battery free of per-widget knowledge is what lets it apply to a
 * widget written outside this repository.
 */
function acceptedPropsFor(widget: AgentWidgetDefinition): Record<string, unknown> | null {
  const probes: Record<string, unknown>[] = [
    { docIds: [UID] },
    { docId: UID },
    { docId: UID, fields: ['modified'] },
  ];
  return probes.find((probe) => widget.parseProps(probe) !== null) ?? null;
}

/**
 * Payloads a model steered by a poisoned document could produce. None of them
 * names a specific widget's props, which is the point: they must be refused by
 * a parser that has never seen them.
 */
const HOSTILE_PROPS: ReadonlyArray<readonly [string, unknown]> = [
  ['nothing at all', {}],
  ['model-authored rows', { rows: [{ uid: UID, title: 'Approved by Legal' }] }],
  ['a title beside nothing else', { title: 'Q4 contracts' }],
  ['a path traversal where an id goes', { docId: '../../../etc/passwd', docIds: ['../..'] }],
  ['a URL where an id goes', { docId: 'https://attacker.example/x' }],
  ['an html payload', { docId: '<img src=x onerror=alert(1)>' }],
  ['an unreasonably large list', { docIds: Array.from({ length: 500 }, () => UID) }],
  ['a name borrowed from Object.prototype', { docId: 'toString', docIds: ['constructor'] }],
  ['props that are not an object at all', 'docIds=aaaa'],
  ['props that are an array', [UID]],
];

describe('the widgets this application registers', () => {
  let catalogue: AgentWidgetCatalogue;
  let widgets: readonly AgentWidgetDefinition[];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: widgetProviders() });
    catalogue = TestBed.inject(AGENT_WIDGET_CATALOGUE);
    widgets = catalogue.names().map((name) => catalogue.get(name) as AgentWidgetDefinition);
  });

  it('registers the two stage-1 widgets and nothing else', () => {
    // A guard on scope. Each widget is a component the agent can cause to appear
    // in a user's transcript, so growing this list is a decision, not a detail.
    expect(widgets.map((widget) => widget.name)).toEqual(['documentCard', 'documentList']);
  });

  it('registers one widget contributed by a library rather than written here', () => {
    // `documentCard` ships from `libs/shared/ui` beside its component and is
    // registered by one more argument in `app.config.ts`. That path is what a
    // customer package uses, so it has to stay exercised rather than described.
    expect(catalogue.get('documentCard')).toBeDefined();
  });

  it('refuses every hostile payload, for every widget, without naming any of them', () => {
    // One assertion over the cross product on purpose: the battery must not need
    // editing when a widget is added, only re-running.
    const mounted: string[] = [];

    for (const widget of widgets) {
      for (const [label, props] of HOSTILE_PROPS) {
        const request = { toolCallId: 'call-1', component: widget.name, props };
        const parsed = parseAgentWidgetEvent(request, catalogue);
        if (parsed?.status !== 'rejected') mounted.push(`${widget.name}: ${label}`);
      }
    }

    expect(mounted).toEqual([]);
  });

  it('stops accepting a valid request the moment an undeclared key is added', () => {
    // Widgets differ in what a valid request looks like, so this is built from
    // each widget's own answer rather than from a literal.
    for (const widget of widgets) {
      const accepted = acceptedPropsFor(widget);
      expect(accepted)
        .withContext(`${widget.name} accepted none of the probe payloads`)
        .not.toBeNull();

      expect(widget.parseProps({ ...accepted, title: 'Approved by Legal' }))
        .withContext(`${widget.name} tolerated an undeclared prop`)
        .toBeNull();
    }
  });

  it('translates only identifiers and enums into component inputs', () => {
    // The second half of the boundary. Whatever the parser returned, the inputs
    // handed to the component must be identifiers, enums and the application's
    // own presentation choices — a string long enough to be prose is content,
    // and content must never reach a component input.
    for (const widget of widgets) {
      const props = widget.parseProps(acceptedPropsFor(widget) ?? {});
      const inputs = widget.inputs(props as never);
      const scalars = Object.values(inputs).flatMap((value) =>
        Array.isArray(value) ? value : [value],
      );

      for (const value of scalars) {
        expect(typeof value)
          .withContext(`${widget.name} passes a non-scalar input`)
          .toMatch(/string|number|boolean/);
        if (typeof value !== 'string') continue;
        expect(value.length)
          .withContext(`${widget.name} passes a suspiciously long input`)
          .toBeLessThanOrEqual(64);
      }
    }
  });

  /**
   * A7 stage 2. Selection is optional, and a widget that opts in may only offer
   * documents it was given as props.
   *
   * That is what keeps an agent proposal inside what the user can see: the
   * offered set is the closed list a proposal is intersected with, so a widget
   * inventing uids here — or reading them from anywhere but its validated props
   * — would reopen exactly the hole the proposal channel exists to close.
   */
  it('offers only documents that came from its own validated props', () => {
    for (const widget of widgets) {
      if (!widget.selection) continue;
      const accepted = acceptedPropsFor(widget) ?? {};
      const props = widget.parseProps(accepted);
      const offered = widget.selection.offers(props as never);

      const fromProps = new Set(Object.values(accepted).flat());
      for (const uid of offered) {
        expect(fromProps.has(uid))
          .withContext(`${widget.name} offered ${uid}, which is not in its props`)
          .toBe(true);
      }
    }
  });

  it('cannot express a selection, only a suggestion', () => {
    // The definition contract has no way to say "this is selected". If one is
    // ever added, the reviewer has to delete this test to do it.
    for (const widget of widgets) {
      if (!widget.selection) continue;
      const inputs = widget.selection.inputs(['doc-1']);
      const names = Object.keys(inputs).join(' ');

      expect(names)
        .withContext(`${widget.name} maps proposals onto a selection-shaped input`)
        .not.toMatch(/^selected|Selected|selectedIds/);
      expect(Object.keys(widget.selection)).toEqual(['offers', 'inputs']);
    }
  });
});

/**
 * A7 stage 3: the form components this application registers, and the boundary
 * between the two registries.
 *
 * The read-only registry above is guaranteed by every member taking identifiers
 * and enums and never content. A form's props necessarily carry content — the
 * target's title, each field's label and current value — which is legitimate
 * because the gateway resolved them from Nuxeo as the caller, and is not a rule
 * the widget registry can absorb. Keeping them in two tokens is what lets each
 * guarantee be stated for a whole registry rather than for some members of it.
 *
 * Written against the injected catalogues rather than imported lists, for the
 * reason the widget battery is: a component registered but not exported here
 * would escape a test that imported.
 */
describe('the form components this application registers', () => {
  let forms: readonly AgentFormDefinition[];
  let widgetNames: readonly string[];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: widgetProviders() });
    const catalogue = TestBed.inject(AGENT_FORM_CATALOGUE);
    forms = catalogue.names().map((name) => catalogue.get(name) as AgentFormDefinition);
    widgetNames = TestBed.inject(AGENT_WIDGET_CATALOGUE).names();
  });

  it('registers the one stage-3 form and nothing else', () => {
    // A guard on scope. Each entry is a component that may submit a gated write,
    // so growing this list is a decision, not a detail.
    expect(forms.map((form) => form.name)).toEqual(['documentMetadataForm']);
  });

  it('registers it from a library rather than from this app', () => {
    // `documentMetadataForm` ships from `libs/shared/ui` beside its component and
    // is registered by one more argument in `app.config.ts`. That is the path a
    // customer package uses, so it stays exercised rather than described.
    expect(TestBed.inject(AGENT_FORM_CATALOGUE).get('documentMetadataForm')).toBeDefined();
  });

  it('shares no name with a read-only widget', () => {
    // A name in both registries is the merge this design refuses, arrived at by
    // accident: either channel would mount it, and the widget registry's
    // guarantee would be false without anything saying so. The gateway-side
    // conformance test asserts the same thing off disk.
    for (const form of forms) {
      expect(widgetNames)
        .withContext(`${form.name} is registered as a widget as well as a form`)
        .not.toContain(form.name);
    }
  });

  it('brings no props parser, because the channel validates centrally', () => {
    // ADR 001 fixes one props shape for every form, unlike widgets. A definition
    // carrying its own parser would be a second place that decision could be
    // made, and the two could disagree.
    for (const form of forms) {
      expect(Object.keys(form).sort()).toEqual(['inputs', 'load', 'name', 'outputs']);
    }
  });

  it('translates props into inputs and passes no interrupt id', () => {
    for (const form of forms) {
      const inputs = form.inputs({
        toolCallId: 'call-1',
        target: { uid: UID, title: 'A document' },
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
      });

      // The component answers nothing itself; the panel holds the correlation.
      expect(Object.keys(inputs))
        .withContext(`${form.name} hands the component the interrupt id`)
        .not.toContain('toolCallId');
    }
  });

  it('mounts a component that reaches no service able to write', async () => {
    // The property that makes a submitting component safe: it emits values and the
    // gateway performs the write, behind the gate it was already behind. A
    // component calling a domain service directly is the "lift the edit dialog"
    // defect, which the gateway holds no record of.
    for (const form of forms) {
      const componentType = await form.load();

      expect(componentType.toString())
        .withContext(`${form.name} reaches a service that could write`)
        .not.toMatch(/updateDocument|BrowseService|HttpClient/);
    }
  });
});

describe('the documentList widget', () => {
  const parse = documentListWidget.parseProps;

  it('accepts a list of uids and nothing else', () => {
    expect(parse({ docIds: [UID] })).toEqual({ docIds: [UID] });
  });

  it('mounts the by-id list, which is read-only by construction', () => {
    // `by-id` is the one list definition with no remove action. A component
    // mounted from a tool call must not carry a write the gateway holds no
    // record of, and that is a property of the definition rather than of a
    // reviewer having noticed.
    expect(documentListWidget.inputs({ docIds: [UID] })).toEqual({
      kind: 'by-id',
      docIds: [UID],
      density: 'compact',
      // Selection is not a write: it goes to `SelectionService` and stays in the
      // browser. What it does *not* switch on is any of `by-id`'s absent
      // actions, because that definition has none to switch on.
      selectable: true,
    });
  });

  it('offers exactly the documents it was told to show', () => {
    expect(documentListWidget.selection?.offers({ docIds: [UID] })).toEqual([UID]);
  });

  it('feeds proposals in as suggestions rather than as ticks', () => {
    expect(documentListWidget.selection?.inputs([UID])).toEqual({ proposedIds: [UID] });
  });

  it('never lets the model choose the list kind or the density', () => {
    expect(parse({ docIds: [UID], kind: 'favorites' })).toBeNull();
    expect(parse({ docIds: [UID], density: 'comfortable' })).toBeNull();
  });

  it('loads its component lazily', async () => {
    const componentType = await documentListWidget.load();

    // `toContain` rather than equality: the bundler suffixes class names when a
    // symbol is emitted into more than one chunk, which is what lazy means here.
    expect(componentType.name).toContain('DocumentListPageComponent');
  });
});
