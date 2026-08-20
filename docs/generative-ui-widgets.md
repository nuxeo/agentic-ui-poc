# Contributing a chat widget

> **Audience:** anyone adding a component the agent can cause to appear inside the chat panel —
> including from a package outside this repository. That is the Level 4 extensibility claim on the
> [product overview](beta-product-overview.md), and this document is the scope of it.
>
> **Status:** plan [A7](beta-engineering-plan.md) stages 1, 2 and 3, all complete as of
> 7 August 2026. The transport is **agreed and implemented** in
> [ADR 001](adr/001-agent-runtime.md), "Generative UI render transport": it survived a second widget
> without gaining a field, which is what promoted it from provisional. Two widgets ship —
> `documentList` and `documentCard` — and the second one is the worked example this page is written
> from.
>
> **This page is about read-only widgets.** Stage 3 added a second, separate channel for a component
> that _answers_ a gated write by submitting a form. It has its own registry, its own token and its
> own contract — see [Contributing a chat form](#contributing-a-chat-form-the-other-channel) at the
> bottom, and read this page first, because the two are easy to confuse and the difference is
> load-bearing.

## What a widget is, and what it is not

When the agent runs a read tool, the gateway may emit a `CUSTOM` `render` event naming a widget.
The browser resolves that name against a registry, validates the props, and mounts an Angular
component under the tool card in the transcript.

A widget **is** a read-only view of something identified by uid. A widget **is not**:

- a way for the model to author layout — it names a widget, it does not compose one;
- a way for the model to author content — props are identifiers and enums, never rows or titles;
- a place to write. A write performed from a mounted component leaves the browser carrying the
  user's Nuxeo session and never reaches the gateway's approval gate. The gate is not bypassed on
  that path so much as absent from it. A component that needs to _cause_ a write goes on the
  other channel, below, where the gateway performs it.

## The five-minute version

A widget is one object, provided at bootstrap.

```ts
// my-widget/my-widget.agent-widget.ts
import { exactProps, parseUid, type AgentWidgetDefinition } from '@agentic-ui/shared/agent-client';

export interface MyWidgetProps {
  readonly docId: string;
}

export const myWidget: AgentWidgetDefinition<MyWidgetProps> = {
  name: 'myWidget',

  // Untrusted props in, validated props or null out. Null means "do not mount".
  parseProps: (props) => {
    if (!exactProps(props, ['docId'])) return null;
    const docId = parseUid(props['docId']);
    return docId ? { docId } : null;
  },

  // A dynamic import, so a widget nobody triggers costs nothing at load.
  load: () => import('./my-widget.component').then((m) => m.MyWidgetComponent),

  // Validated props to component inputs. Add the application's own choices here.
  inputs: (props) => ({ docId: props.docId, density: 'compact' }),
};
```

```ts
// apps/nuxeo-ui/src/app/app.config.ts
provideAgentWidgets(documentListWidget, documentCardWidget, myWidget),
```

That is the whole registration surface. Nothing in `apps/nuxeo-ui/src/app/shell` changes, which is
the test of whether this is an extension point or just a place where extensions happen to be
written down.

`provideAgentWidgets` is an Angular multi-provider (`libs/shared/agent-client/src/lib/agent-widget.ts`,
`AGENT_WIDGETS` and `AGENT_WIDGET_CATALOGUE`). It is a token rather than a constant map because a
widget contributed from outside this repository cannot edit a constant in `libs/shared`; ADR 001
records the change, made while the second widget was being built. The allowlist is still closed —
providers are evaluated at bootstrap, before the first token of the first run — and there is still
no path from anything on the wire to a new entry.

## The two widgets that ship

| Name           | Props                                      | Component                                                                                                  |
| -------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `documentList` | `docIds: string[]`                         | `DocumentListPageComponent` (`libs/features/document-lists`), via `apps/nuxeo-ui/src/app/agent-widgets.ts` |
| `documentCard` | `docId: string`, optional `fields: enum[]` | `DocumentMetadataCardComponent` (`libs/shared/ui/src/lib/document-metadata-card/`)                         |

The card is worth reading before you write anything, because it is the one that shaped the contract.
It is a **new** component, not an extraction: the read-only metadata surface this application
already had lives inside its edit dialogs and inside `document-detail`, and neither travels
(`libs/shared/ui/src/lib/document-metadata-card/document-metadata-card.component.ts:62-81`). Writing
a small honest one instead was cheaper than untangling either, and it is the shape a customer
contribution takes anyway.

Its second prop is why validation is per-widget. A single-object widget with a caller-chosen field
list does not fit a props shape designed around an array of uids, so there is no central parser to
extend — each definition brings its own `parseProps` and the shared code supplies only the
validators it is built from.

## Where a definition may live

| Component lives in                        | Definition may live                      | Why                                                               |
| ----------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| `libs/shared/**`, or your own npm package | beside the component                     | `scope:shared → scope:shared` is permitted                        |
| `libs/features/**`                        | `apps/nuxeo-ui/src/app/agent-widgets.ts` | only `scope:app` may name a feature library (`eslint.config.mjs`) |

Both shapes ship today and are worth reading in that order. `documentCardWidget`
(`libs/shared/ui/src/lib/document-metadata-card/`) is the contributed shape: definition, component
and tests together in a library. `documentListWidget` (`apps/nuxeo-ui/src/app/agent-widgets.ts`)
is the constrained shape, and it is constrained by lint rather than by design.

### Publish definitions from an entry point that pulls no component

`app.config.ts` is in the initial bundle, so anything it imports is too. Registering
`documentCardWidget` through the main `@agentic-ui/shared/ui` barrel pulled every component in that
library into the initial chunk and overran the 2 MB budget by 251 kB, because a barrel of Angular
components does not tree-shake in practice. It is published from
`@agentic-ui/shared/ui/agent-widgets` instead, and that file imports no component.

Two rules follow, and they apply to an external package exactly as they do here:

- Export definitions from a **dedicated entry point**, not from your library's main barrel.
- Keep the definition file free of any import from the component file. Put shared constants — the
  enum your parser validates against, for instance — in their own Angular-free module, the way
  `document-card-fields.ts` holds `DOCUMENT_CARD_FIELDS`. A definition that reaches into the
  component pulls the component in at registration, which spends exactly the laziness `load()`
  exists to buy.

## The four rules, and what enforces each

**1. Props are identifiers and enums. Never content.**

The widget re-fetches through the ordinary services under the caller's own session. That is what
makes a fabricated row inexpressible, makes a link to an attacker-controlled host inexpressible,
and gets ACL enforcement from Nuxeo for free. Treat every prop as hostile: it arrives from a
language model that can be steered by document content an attacker wrote.

Use the supplied validators rather than writing your own — they are the difference between getting
this right by default and getting it right by having read this page.

| Helper                                   | For                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `parseUid(value)`                        | one document uid. Refuses paths, URLs, query strings and anything not uid-shaped |
| `parseUidList(value, max?)`              | a list of uids. Atomic, de-duplicated, capped at `MAX_WIDGET_DOCUMENT_IDS`       |
| `parseEnum(value, allowed)`              | one member of a closed set                                                       |
| `parseEnumList(value, set)`              | several. Atomic and de-duplicated                                                |
| `exactProps(props, required, optional?)` | no undeclared key, and every required one present                                |

**2. Reject atomically, and never repair.** One malformed uid rejects the whole request; return
`null` rather than a filtered list. A partially populated component is a more convincing lie than
an absent one, and a silent fallback to a default makes a malformed request indistinguishable from
a well-formed one.

**3. Translate, do not spread.** `inputs` exists so validated props become component inputs by
name, chosen by you. The application's own presentation choices — density, list kind, which columns
— belong here, not in the props: they are not the model's to make. A component that later gains a
dangerous input does not become reachable until someone writes it into this function.

**4. Read-only, and tear down.** Inject no service that can write. Use `takeUntilDestroyed()` on
every subscription and revoke every blob URL on destroy — a mounted widget lives in a transcript
that is cleared, re-ordered and re-rendered constantly, and a leak here would not be noticed until
every message had one.

## Taking part in selection, if your widget shows a list

A7 stage 2 added an optional `selection` block to the definition
(`libs/shared/agent-client/src/lib/agent-widget.ts:109-112`). Omit it and your widget cannot be
ticked, which is the right answer for anything showing one document — `documentCard` omits it.

```ts
selection: {
  // The uids this widget is putting in front of the user, read from validated props.
  offers: (props) => props.docIds,
  // Live proposals in, component inputs out. Translated, like `inputs`.
  inputs: (proposed) => ({ proposedIds: proposed }),
},
```

Two things about this are load-bearing and neither is obvious from the shape.

**`offers` is read from props, not from what the component ended up rendering.** The store has to
know the closed set a proposal may draw from before the lazy chunk has downloaded, and props have
already been through your parser, so every uid in the offered set is one the application was
willing to render. A widget that under-reports makes proposals for its rows impossible; one that
over-reports lets the agent suggest a row nobody can see.

**Nothing here can express a selection, and that is deliberate.** A proposal is a suggestion the
user accepts with an ordinary tick, and the tick goes to `SelectionService` on the same path as
every other list in the application. `AgentSelectionStore` holds proposals only, has no method that
writes a user selection, and does not import `SelectionService`
(`libs/shared/agent-client/src/lib/agent-selection.ts`). Read your widget's user selection from
`SelectionService` yourself, exactly as the browse, search and trash lists do. If you find yourself
wanting a convenience method on the proposal store that also selects, stop: the absence of that
method is the guarantee.

## Your widget is not a form

`documentMetadataForm` is **not** a widget and must not be registered as one. It travels on a
different channel — `metadata.render` on an approval interrupt, not a `CUSTOM` `render` event — and
it submits, which is the one thing a widget may not do. The two name-spaces are disjoint on purpose
(`apps/agent-gateway/src/tools/tool.types.ts:81` versus
`apps/agent-gateway/src/agent/render-events.ts:38`), and `render-events.spec.ts` treats every name
in the widget registry as a read-only render-event widget. Registering a submitting component there
to make it appear would make that test agree with something untrue. See ADR 001, "What the interrupt
carries, and what answers it".

## Design for 320–720px

The panel **starts** at 400px and the user can drag it between 320px and 720px, so design against
a range rather than a number. Every existing page list has a layout floor between 680px and 776px,
which is why a page component dropped into the panel needs a design pass regardless.

The grip is `apps/nuxeo-ui/src/app/shell/panel-resize-handle/`; the width lives on `AiChatService`
alongside `panelOpen` (the panel component is destroyed on every close, so a width held there would
reset on each toggle) and is persisted per browser. `AI_PANEL_MIN_WIDTH` / `AI_PANEL_MAX_WIDTH` in
`libs/shared/ai-client/src/lib/ai-chat-panel-size.ts` are the bounds; a narrow window lowers the
maximum further so the page behind the panel keeps at least `AI_PANEL_MIN_CONTENT_WIDTH`.

This is the reason the container-query advice below is a rule and not a preference. A widget built
against a media query is correct at one panel width and wrong at every other, and the user can now
choose any of them — including _while the widget is mounted_, with no re-render. A widget written
against its own inline size adapts for free; the two shipped widgets already did, so neither needed
a change when the panel became resizable.

Two things follow from the page-list floor.

Budget 1–2 days per widget for this and do not expect it to shrink. It did not on the second one:
nothing from the list's design pass transferred to the card, which needed its own container-query
breakpoint at 260px (`libs/shared/ui/src/lib/document-metadata-card/document-metadata-card.component.scss`).
The registry machinery got cheaper per widget; this did not, because it is judgement about one
component's content rather than plumbing.

**Use a container query, not a media query.** The card is 400px wide inside a 1440px viewport, so
the viewport width says nothing useful about the room it has — and now says even less, because the
panel's width is the user's choice rather than a constant:

```scss
:host {
  container-type: inline-size;
}
@container (max-width: 260px) {
  /* … */
}
```

And prefer a `density` input over a second component when adapting an existing page component.
`DocumentListPageComponent` takes `density: 'compact'`, which drops the header row and the type,
contributor and date columns; nothing about the data changes, only which of it is shown, and the
full-width pages are unaffected because they never set it.

## What the registry does with your definition

- **Duplicate names throw at bootstrap.** Last-one-wins is how a contributed widget shadows a
  built-in, so it is a configuration error rather than a silent override.
- **A parser that throws is a refusal**, not a broken transcript. Contributed code is code we did
  not write, and one bad widget must not take the run down with it.
- **An unregistered name is refused with a notice**, not a blank space. A widget that silently
  fails to appear is indistinguishable from a gateway that never asked for one, and those are very
  different bugs.
- **An application that registers nothing still runs.** Every render event is refused, and the
  panel behaves exactly as it does without generative UI at all.

## The gateway half

A widget only appears if some tool's result mounts it. That mapping lives in
`apps/agent-gateway/src/agent/render-events.ts`, keyed on the **registered tool name** — the model
chooses the widget by choosing the tool, and there is no field on the wire it can steer to select
one. A tool absent from the map renders nothing, which is the pre-existing behaviour.

The two name lists cannot be one module, because `scope:agent-gateway` may depend on no workspace
library. `render-events.spec.ts` pins them to each other by reading the browser sources off disk;
a name the browser does not register fails that test rather than producing a widget that silently
never appears.

## Tests a contribution is expected to bring

`libs/shared/ui/src/lib/document-metadata-card/` is the worked example of all three.

1. **Parser tests** for what your widget refuses: content where an identifier goes, a value outside
   your enum, an undeclared key, a missing required prop.
2. **Component tests** that it reads what it shows rather than being handed it, that it offers no
   action that writes, and that it unsubscribes on destroy.
3. Nothing for the generic hostile cases. `apps/nuxeo-ui/src/app/agent-widgets.spec.ts` runs a
   shared battery over every registered widget, so your widget inherits those the moment it is
   registered.

## Contributing a chat form — the other channel

A **form component** answers a gated write. The model calls a mutating tool, the gateway gates it
exactly as it gates every other write and ends the run on an interrupt; when the tool's own
registration declares a form, that interrupt carries the declaration and the browser renders the
form instead of a Decline / Approve card. Submitting it answers that same interrupt.

One ships today: `documentMetadataForm`, in
`libs/shared/ui/src/lib/document-metadata-form/`. Read it before writing another.

### The two channels are not one registry, and that is deliberate

|                 | **Widget** (this page)                   | **Form** (this section)                  |
| --------------- | ---------------------------------------- | ---------------------------------------- |
| Registered with | `provideAgentWidgets(...)`               | `provideAgentFormComponents(...)`        |
| Token           | `AGENT_WIDGETS`                          | `AGENT_FORM_COMPONENTS`                  |
| Arrives on      | `CUSTOM` event named `render`            | `metadata.render` on an **interrupt**    |
| Props           | identifiers and enums, **never content** | may carry gateway-resolved content       |
| Brings a parser | yes, its own `parseProps`                | **no** — the channel validates centrally |
| May submit      | no                                       | yes; still may not write                 |
| Answered by     | nothing, it is display                   | a `resume` entry the panel sends         |

**Do not register a form as a widget to make it render.** It is three lines and it would pass code
review, and it would demote the widget registry's guarantee — "props are identifiers, never
content" — from a property of the registry to a property of some members of it.
`apps/agent-gateway/src/agent/render-events.spec.ts` fails if the two name-spaces ever share a
name. ADR 001, "The two channels get two registries", records the full reasoning.

### The shape

```ts
// my-form/my-form.agent-form.ts — imports no component
import type { AgentFormDefinition } from '@agentic-ui/shared/agent-client';

export const myForm: AgentFormDefinition = {
  name: 'myForm', // must match the tool's `mutation.form.component`
  load: () => import('./my-form.component').then((m) => m.MyFormComponent),
  // Translated by name, not spread — same rule as a widget's `inputs`.
  inputs: (props) => ({ target: props.target, fields: props.fields }),
  outputs: { submitted: 'submitted', cancelled: 'cancelled' },
};
```

```ts
// apps/nuxeo-ui/src/app/app.config.ts
provideAgentFormComponents(documentMetadataForm, myForm),
```

There is no `parseProps`, because ADR 001 fixes one props shape for the whole channel and
`libs/shared/agent-client/src/lib/agent-form.ts` validates it for every form. Publish from a
component-free entry point (`libs/shared/ui/src/agent-forms.ts`) for the same bundle reason widgets
do.

### The rules your component inherits

1. **It emits; it does not write.** `submitted` carries the values the user typed and the panel
   answers the interrupt. Injecting a service that could write is the one thing that voids the whole
   design — the write would leave on the user's session and the gateway would hold no record of it.
2. **Only `editable: true` fields may be submitted.** The gateway rebuilds the executed arguments
   from its own declaration, so anything else is dropped however you send it. Sending a display-only
   field makes the request read, to anyone auditing it, as though the user had changed it.
3. **An absent `target.title` MUST render as the bare uid.** Its absence means Nuxeo would not
   answer for this caller. A wrong name on the affordance authorising a write is worse than an
   unfriendly one.
4. **Mark a `source: 'proposed'` value as the model's.** The user is reviewing a suggestion, and
   they can only do that if the form says which values are suggestions.
5. **Validate as a courtesy, never as the enforcement.** `required` and `maxLength` are enforced
   server-side whatever the browser does. Being wrong here can waste a round trip; it cannot widen a
   write.
6. **A form that cannot be mounted falls back to the approval card.** Not to a submission, and not
   to a decline — the user has not decided yet.

### The gateway half

A form only appears if a tool declares one, in the same `MutationSpec` that supplies the approval
row's phrasing (`apps/agent-gateway/src/tools/nuxeo-document-tools.ts`, `updateMetadataTool`). The
declaration names the component, the single argument submitted values land in, and the field set with
its editability. Every validation failure in `declaredForm` degrades to **no form**, meaning an
ordinary approval card, rather than to a narrower form.

One more gateway obligation, learned from a live defect rather than reasoned out: a tool whose write
can be form-submitted must report **the values as stored and the fact that a person authored them**.
Told only which fields changed, a model reports the change using the value it proposed — and tells
the user their edit was saved under text they had just replaced. See ADR 001, "A result MUST say
when a person authored the values".

### Tests a form contribution brings

`libs/shared/ui/src/lib/document-metadata-form/` is the worked example.

1. **Component tests** that it submits only editable fields, types each value as declared, renders
   an unresolved target as the bare uid, and reaches no service that could write.
2. **Definition tests** that the name matches the tool's declaration and that the outputs it names
   are really outputs — the host refuses to wire a named property that is not one, which degrades to
   the card.
3. **Nothing for the channel's own validation.** `agent-form.spec.ts` covers the hostile payloads
   centrally, and `agent-widgets.spec.ts` asserts your component shares no name with a widget and
   reaches no writing service.
