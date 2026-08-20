# CSX Generative UI PoC (CSX-588 / CSX-592) — Teardown

> **Status:** Research note. Read-only investigation, 7 August 2026.
> **Purpose:** Inform the pending generative-UI task in the Nuxeo Satori Agentic Beta. Our
> stated goal is _"extract the functional components from the UI and render them in the AI chat,
> chosen by the question."_ Their PoC is the closest existing implementation of that goal inside
> Hyland, so this document establishes how it actually works and what is genuinely reusable.
> **Siblings:** [ADF HX Content Services vs. a Nuxeo Satori Library](adf-hx-vs-nuxeo-satori-decision.md) ·
> [CSX-447 content ports — consumer report](csx-447-port-gaps.md) · [ADR 001 — Agent runtime](adr/001-agent-runtime.md)

## Sources and how they were read

| Source                                                                                                                | What it is                                      | Accessed               |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------- |
| [Generative UI PoC (CSX-588)](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4099769452)                          | Parent page, v30, last edited 2026-07-06        | Atlassian MCP          |
| [Agent-Driven UI Generation — Architecture & Findings](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4105502752) | The technical page. v24, last edited 2026-06-15 | Atlassian MCP          |
| [Functional Validation Report](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4108124540)                         | v11, 2026-07-02                                 | Atlassian MCP          |
| [CopilotKit POC: AG-UI and A2UI OOTB](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4136272749)                  | v9, 2026-06-22                                  | Atlassian MCP          |
| [Demos](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4100197128)                                                | Six Panopto recordings                          | Atlassian MCP          |
| `Alfresco/hxp-frontend-apps` branch `feature/CSX-592-genUI`                                                           | Head `c02c4e60`, 2026-06-03                     | `gh api`, raw contents |
| [PR #17239 "CSX-592 Add Content Assistant chat"](https://github.com/Alfresco/hxp-frontend-apps/pull/17239)            | Draft, open, 69 files, +18,127/−23              | `gh api`               |

Source files were downloaded with `gh api .../contents/...?ref=c02c4e60` into `/tmp/csx-genui`,
outside this repository. **Nothing was cloned into this repo and nothing outside this file was
modified.** All line references below are against branch head `c02c4e60`, path prefix
`apps/workspace-hxp/src/app/dev-agent/` unless stated otherwise.

Seven further child pages exist (Observations and limitations, Agent Documentation Strategy,
Conversation Handling & System Message Strategy, Messages sent to model from web app,
System-Level Instructions, Reducing the prompt token footprint, A2UI Protocol POC). They were
enumerated but not read in full; the four pages above plus the source code were sufficient and
consistent. The six demo recordings are Panopto videos and were **not** watched — the five
screenshots supplied with this task were matched to source code instead, which is stronger
evidence anyway.

---

## 1. How their PoC works, end to end

The whole thing is a chat surface registered as a Workspace extension. `app.extensions.json`
adds a navbar item and a route at `path: "agent"` bound to `dev-agent.shell`, so the demo lives
at `/#/agent` inside the real Workspace application, not in a sandbox
(`apps/workspace-hxp/src/assets/app.extensions.json`, navbar and `routes` blocks added by
PR #17239; `agent-dev.routes.ts:11-16`).

The runtime is three pieces:

**A Node agent service** (`agent-service/server.js`, 626 lines, zero framework). It has four
dependencies: `openai`, `dotenv`, and two Arize Phoenix tracing packages
(`agent-service/package.json:10-15`). It builds a system prompt at startup
(`server.js:49-281`), receives `POST /api/agent/stream`, maps the client's messages to OpenAI
chat format, prepends the system prompt, calls the model with `stream: true`, and translates the
OpenAI delta stream into AG-UI-shaped SSE frames (`server.js:399-570`).

**The browser shell** (`agent-dev-shell.component.ts`, 1,204 lines). It consumes the stream
through `@ag-ui/client`'s `HttpAgent` and switches on `EventType` (`:164-252`). On
`TOOL_CALL_END` it parses the accumulated argument buffer and immediately calls
`renderToolComponent`, which appends a `role: 'tool'` chat bubble, waits a tick for the
`ViewContainerRef` outlet to exist, and calls `ToolExecutorService.execute()` (`:225-241`,
`:888-912`).

**`ToolExecutorService`** (1,319 lines) owns a hardcoded `TOOL_REGISTRY` and routes each tool
call down one of four paths (`:1061-1125`):

| Priority | Tool                 | Path                       | Who authors the UI                  |
| -------- | -------------------- | -------------------------- | ----------------------------------- |
| 1        | `renderUI`           | validate → render          | the model                           |
| 2        | `type: 'descriptor'` | `build(args)` → render     | a frontend developer, at build time |
| 3        | `type: 'render'`     | `outlet.createComponent()` | a frontend developer, one component |
| 4        | `type: 'action'`     | imperative side effect     | nobody — no UI                      |

**The critical structural fact: the agent service never touches the content repository.** It has
no Hyland API client, no credentials, no data access. It emits tool-call intents; the browser
executes every one of them, against the app's own Angular services, under the logged-in user's
own session. CSX call this a deliberate security boundary and it genuinely is one for _reads_ —
the model has intent authority but not data authority, and every read is ACL-scoped by the user's
session. Section 5 explains why it is not a boundary for _writes_.

There are thirteen tools (`tool-schemas.shared.json`): `searchDocuments`,
`getDocumentProperties`, `openDocumentViewer`, `browseFolder`, `downloadDocument`,
`uploadDocument`, `resolveCurrentUser`, `resolveUsersByName`, `searchUsers`, `deleteDocument`,
`renderUI`, `getDocumentVersions`, `getAdditionalDocumentInfo`. The same JSON file is imported by
the frontend as the AG-UI `Tool[]` payload (`tool-schemas.ts:9-11`, `services/tool-schema.service.ts:12-16`)
and by the eval harness, which is a good idea worth stealing on its own.

### The three tiers, and which one matters

The Confluence architecture page presents a "layered rendering strategy". Reading the code, the
tiers are much less symmetrical than the prose suggests:

- **Tier 1, direct tool → component.** One tool, one Angular component, resolvers and outputs
  wired in TypeScript. Four tools use it: `getDocumentProperties`, `getAdditionalDocumentInfo`,
  `chooseUsersForDisambiguation`, `chooseDocumentsForDisambiguation`, plus `uploadDocument`.
- **Tier 2, frontend-authored descriptor.** `searchDocuments` and `browseFolder` call a
  `build(args)` function that returns a `UIDescriptor` composing several components
  (`tool-executor.service.ts:130` `buildSearchDescriptor`, `:487-491`). The model does not know
  composition happened; it just called `searchDocuments`.
- **Tier 3, model-authored descriptor.** The `renderUI` tool takes a `descriptor` object
  straight from the model, validates it, and renders it.

Tiers 2 and 3 share one rendering engine, `DeclarativeRendererService` (610 lines), and one
component catalogue. The only difference is who wrote the JSON. **The four screenshots that show
real functional UI — upload form, document list, metadata form, delete dialog — are all Tier 1 or
Tier 2. None of them is model-authored.** Tier 3 is the interesting research result and the least
load-bearing part of the demo; their own architecture page says the system prompt "explicitly
tells the LLM to prefer existing tools over `renderUI`", and their eval suite does not cover the
`renderUI` path at all (Confluence CSX-588 parent page, "Validation outcomes": _"Level 2 `renderUI`
descriptor generation and rendering, arguably the highest-variability part of the system, is
exercised only manually today"_).

---

## 2. The component contract and registry mechanics

### The registry is a closed allowlist, and there are two of them

`ComponentCatalogueService` is a hardcoded array of thirteen `CatalogueEntry` records mapping a
string id to an Angular `Type` and an optional list of output names
(`services/component-catalogue.service.ts:26-88`). It is a `Map` with `get`/`has`; there is no
registration API, no dynamic loading, no scanning. Adding a component is a source change.

`DescriptorValidationService` holds the _other_ allowlist — services, methods, layouts and
interaction actions (`services/descriptor-validation.service.ts:19-27`):

```ts
const VALID_LAYOUTS = new Set(['vertical', 'horizontal']);
const VALID_SERVICES = new Set(['SearchService', 'DocumentService', 'DocumentPropertiesService', 'MetadataSidebarService']);
const VALID_METHODS: Record<string, Set<string>> = {
    SearchService: new Set(['getDocumentsByQuery']),
    DocumentService: new Set(['getDocumentById', 'getDocumentByPath', 'getAllChildren', 'getAncestors']),
    ...
};
const VALID_INTERACTION_ACTIONS = new Set(['paginate', 're-resolve', 'navigate', 'filter']);
```

A third list exists in `DeclarativeRendererService`'s `SERVICE_MAP`, which maps those four service
names to real Angular injection tokens (`services/declarative-renderer.service.ts:42-47`). A
fourth lives in the system prompt. CSX flag this themselves as their top scaling risk: _"the
system prompt, component catalogue, validation whitelists, and `SERVICE_MAP` must all be kept in
sync manually. There is no compile-time or runtime check that they agree"_ (architecture page
§5.3). The validator's own error message hardcodes a **twelve**-item list of available components
while the catalogue has thirteen — `satBreadcrumb` is missing from the message
(`descriptor-validation.service.ts:132-145` vs `component-catalogue.service.ts:36-39`). That is
the drift they warned about, already present.

### The contract

```ts
interface UIDescriptor {
  layout: 'vertical' | 'horizontal';
  children: UINode[];
  resolve?: Record<string, DataResolver>;
  interactions?: InteractionBinding[];
}
interface UIComponentNode {
  type: 'component';
  component: string; // must match a CatalogueEntry.id
  inputs?: Record<string, unknown>;
  showLoading?: boolean;
  style?: Record<string, string>;
  on?: Record<string, InteractionHandler>;
  prefill?: unknown;
}
interface DataResolver {
  service: string; // allowlisted
  method: string; // allowlisted per service
  args: Record<string, unknown>; // NOT validated
  transform?: (raw, injector) => Record<string, unknown>;
}
```

(`types/ui-descriptor.ts:13-57`)

**Inputs** are `$resolve.<resolverName>.<path>` strings or literals. **Outputs** are declared per
catalogue entry as bare strings and subscribed reflectively:
`(source.ref.instance as Record<string, unknown>)[binding.source.output]`, then duck-typed for a
`.subscribe` (`declarative-renderer.service.ts:336-337`). **Events** are limited to four verbs —
`paginate`, `re-resolve`, `navigate`, `filter` — and `re-resolve` is in the schema and the
validator but has no runtime branch in the renderer, per their own architecture page §4.4. The
`navigate` action hardcodes a route: `router.navigate(['/', 'default', 'documents', doc.sys_id])`
(`declarative-renderer.service.ts:417-421`).

Resolver dependency ordering is genuinely nice work: a resolver may reference another's output in
its own args, the renderer topologically sorts them, runs independents in parallel with `forkJoin`
and dependents sequentially with `switchMap`. Because the model cannot emit JavaScript, transform
functions are injected by pattern-matching the resolver's method name
(`tool-executor.service.ts:1146-1164`) — currently exactly two methods get a transform.

### Can the model cause arbitrary UI to render? Precisely:

**No, it cannot name an arbitrary component.** `validateComponentNode` rejects any id not in the
catalogue and the entire descriptor is discarded — full rejection, no partial rendering
(`descriptor-validation.service.ts:131-148`, `:48-50`). A rejected descriptor surfaces to the user
as a chat message listing the valid ids (`tool-executor.service.ts:1135-1140`). An unknown _tool_
name likewise returns `Unknown tool: <name>` without executing (`:1070-1076`).

**But props are not validated at all.** `validateComponentNode` accepts `inputs` if it is an
object and copies it wholesale: `node.inputs = obj['inputs'] as Record<string, unknown>`
(`descriptor-validation.service.ts:155-157`). The renderer then iterates every key and calls
`ref.setInput(key, resolved)` with no per-component input allowlist and no type check
(`declarative-renderer.service.ts:361-366`). Angular's `setInput` throws `NG0303` for an input
name the component does not declare, so a garbage key is a runtime exception rather than silent
acceptance — but a **declared** input receiving a wrong-shaped value goes straight through to the
component. There is no try/catch around `applyInputs`, so one bad key aborts the render.

**And resolver `args` are not validated either.** `validateSingleResolver` checks the service and
method names, then passes `args` through untouched, warning only if it is missing
(`descriptor-validation.service.ts:265-274`). The most consequential case: the model authors the
raw HXQL string handed to `SearchService.getDocumentsByQuery`. That is arbitrary query authorship
by the model. It is bounded by the user's own ACLs because the call runs in the browser under the
user's session — so it is an _arbitrary read within the caller's permissions_, not a privilege
escalation. Worth being clear-eyed that this is the same property as our own read tools, and it is
acceptable; it is simply not the "the model can't reach data" boundary the prose implies.

So the honest summary is: **the model chooses from a closed set of components and services, and
supplies unchecked data into them.** The component allowlist is real and enforced. The prop and
argument contract is not.

---

## 3. Are the components genuinely shared with the application? Mostly yes — evidence

This is the question with the largest cost consequence, so here is the import-path evidence
component by component. Nine of the thirteen catalogue entries import directly from the
production library (`component-catalogue.service.ts:10-20`):

```ts
import {
  HxpDocumentListComponent,
  HxpMetadataSidebarAdditionalInfoComponent,
  PropertiesViewerContentComponent,
  TableSkeletonLoaderComponent,
  HxpBreadcrumbComponent,
  CreatedDateSearchFiltersComponent,
  DocumentCategorySearchFiltersComponent,
  FileTypeSearchFilterComponent,
  DocumentLocationSearchFilterComponent,
} from '@alfresco/adf-hx-content-services/ui';
```

Against the five screenshots:

**Document list with checkboxes, Title and Modified columns** — the real
`HxpDocumentListComponent` from the library, unmodified. What _is_ chat-specific is the column
schema: a three-column `DataColumn[]` constant defined in the tool executor and passed as an input
(`tool-executor.service.ts:42-46`, applied at `:175`, `:341`, `:433`, `:457`). Their own
validation report lists the sparse columns as a known limitation (§4.4). So: shared component,
chat-specific configuration.

**Metadata form (Title, Content Type, Created, Last Modified, Creator, Last Contributor, File
Name)** — `AgentDocumentPropertiesCardComponent` is a **21-line file**. Its entire body is:

```ts
import { HxpMetadataSidebarComponent } from '@alfresco/adf-hx-content-services/ui';
...
export class AgentDocumentPropertiesCardComponent {
    readonly document = input<Document | null | undefined>(undefined);
    readonly editable = input(false);
}
```

with a template of a single `<hxp-metadata-sidebar [document] [editable]>`
(`components/document-properties-card/agent-document-properties-card.component.ts:9`, `:18-21`,
and the `.html`). That is the application's real metadata sidebar rendered inside a chat bubble.
This is the strongest single piece of evidence for the whole approach.

**Upload form with Location picker and Content Type select** — the one that looks most like a
purpose-built widget, and it is the most interesting case. `AgentUploadPickerComponent` is a
110-line component with an inline template, but its two fields are the application's own pickers,
imported from a Workspace feature library rather than from the shared component library
(`components/upload-dialog/agent-upload-dialog.component.ts:12-16`):

```ts
import {
  DocumentLocationPickerComponent,
  DocumentCategoryPickerComponent,
} from '@hxp/workspace-hxp/content-services-extension/content-browser/feature-shell';
```

The wrapper contributes layout, a `[disabled]` rule and an Upload button (`:23-44`). It does
**not** reuse the app's upload dialog — because upload is not in the component library at all, a
gap already recorded in `adf-hx-vs-nuxeo-satori-decision.md` §"Other known gaps". So: real field
components, bespoke assembly, driven by a library gap rather than by a chat requirement.

**Delete Document confirmation dialog** — fully the application's own. The tool resolves the
document then calls the app's delete action service through its injection token
(`tool-executor.service.ts:886-908`):

```ts
const deleteActionService = context.injector.get<DocumentActionService>(HXP_DOCUMENT_DELETE_ACTION_SERVICE);
...
tap((doc) => deleteActionService.execute({ documents: [doc] })),
switchMap(() => documentService.documentDeleted$.pipe(take(1)))
```

That token is bound to `DeleteButtonActionService`, whose `execute` opens
`ContentDeleteConfirmationDialogComponent`
(`libs/adf/enterprise/adf-hx-content-services/ui/src/lib/adf-enterprise-adf-hx-content-services-ui.providers.ts:41-43`;
`.../content-delete/content-delete-button/content-delete-button-action.service.ts:47-56`). The
chat did not reimplement the dialog; it invoked the same service the context menu invokes. See
§5 for what that path skips.

**Four exceptions.** `MatPaginator` is Angular Material. `AgentSatBreadcrumbComponent` (52 lines)
and `AgentInlineDocumentViewerComponent` (113 lines) are chat-specific, the viewer existing
because the library's viewer is a full-page surface. `AgentUserDisambiguationComponent` (193
lines) and `AgentDocumentOpenSelectionComponent` (123 lines) are genuinely chat-native patterns
with no page equivalent — "which of these five users did you mean" is not a thing a page needs.

### The verdict on reuse

Counting lines, the agent-specific component code across all five wrappers is roughly **500
lines**, against a library of 61 components. The pattern that emerges is consistent and is the
most transferable finding in this document:

> Components designed for a page render inside a chat bubble essentially unchanged, provided
> something supplies their inputs and consumes their outputs. What you write per component is a
> thin adapter — inputs in, outputs out, occasionally a chat-sized configuration such as a
> narrower column set. What you write from scratch is only the genuinely conversational patterns:
> disambiguation, and any surface whose page equivalent is full-screen.

The counter-evidence is equally important and CSX are candid about it. Their observations page
and validation report list "chat-unfriendly component behaviour, especially for document lists,
metadata panels, breadcrumb-based navigation and search-result tables that were originally
designed for full Workspace pages rather than compact chat messages" as the leading UX limitation,
and their next-steps list includes _"identify components that are not ready for chat usage… in
some cases, boilerplate and/or wrapper components were required."_ Reuse works technically and
degrades aesthetically. Both are true.

---

## 4. Cross-turn state

"Can you download the selected document" works, and the mechanism is the least sophisticated part
of the design.

**There is no AG-UI shared state.** `RunAgentInput` is built with `state: {}` on every single turn,
and — this is not a typo — a **fresh `threadId` and `runId` per turn**
(`services/agent.service.ts:60-68`):

```ts
const input: RunAgentInput = {
  threadId: crypto.randomUUID(),
  runId: crypto.randomUUID(),
  messages: agUiMessages,
  state: {},
  tools: options?.tools ?? [],
  context: options?.context ?? [],
  forwardedProps: options?.model ? { model: options.model } : undefined,
};
```

No `STATE_DELTA` is ever emitted or consumed. The server writes exactly two lifecycle events,
`RUN_STARTED` and `RUN_FINISHED` (`server.js:461`, `:555`), plus text and tool-call chunks. There
is no thread persistence anywhere.

**State crosses turns as ephemeral natural-language `role: 'system'` messages, rebuilt from
scratch on every send.** `buildTransientContextMessages()` is 142 lines that turn browser state
into English prose (`agent-dev-shell.component.ts:725-867`). The selection case, which is exactly
the screenshot behaviour:

```ts
contextMessages.push({
  role: 'system',
  content: [
    `The user has selected these documents: ${selectionJson}.`,
    'Use these document IDs when they refer to "selected", "these", or "them".',
  ].join(' '),
});
```

(`:753-759`). The `selectionJson` is a projection of `{ sys_id, sys_title, sys_primaryType }`
built at `:747-752`.

The direction of flow is **UI → agent, one way**. `HxpDocumentListComponent.selectedDocuments`
is subscribed by the tool executor, which pushes into a `Subject` and mirrors the first item into
`ChatStateService.selectedDocument` (`tool-executor.service.ts:1019`, `:1029`, `:1048-1051`,
`:1178-1182`); the shell mirrors that into a plain field (`agent-dev-shell.component.ts:257-259`)
and serialises it on the next send. The agent never writes UI state back — it can only cause
components to be created.

Eleven other pieces of state travel the same way: the currently viewed document, folder-vs-file
selection, a pending file attachment, the previous user request, resolved users, disambiguation
candidates, the last `renderUI` HXQL query re-extracted by walking the previous tool arguments
(`:843-854`, `:869-886`), and the content model's custom properties.

**It is not typed anywhere.** The wire format is a sentence. And the server parses it back out
with a regular expression (`server.js:313-335`):

```js
const match = content.match(
  /^The user has selected these documents: (\[[\s\S]*\])\. Use these document IDs/i,
);
```

A reworded prompt on the client silently breaks a server behaviour. That is the same class of
silent-failure coupling ADR-001 calls out for the `citations` custom-event name, and it is worth
noting that they hit it too.

Two further sharp edges. `routeUserMessage` **drops every prior user message** —
`this.conversationHistory = this.conversationHistory.filter((m) => m.role === 'assistant')`
(`:686`) — which is the mechanical cause of the multi-step refinement failure their validation
report diagnoses as _"the agent only remembers the previous exchange, not the full conversation"_
(§3.2, TC-4). And tool results cannot be sent as `role: 'tool'` messages because the transcript
has no matching assistant `tool_calls`, so they are re-injected as another system message with the
comment saying exactly that (`:691-700`).

---

## 5. Mutations and confirmation, judged against our standard

**Short answer: it would not survive the adversarial prompt that broke our gateway. The only thing
between a model-emitted `deleteDocument` and a deleted document is a Material dialog in the
browser, and nothing about that dialog is enforced by, known to, or auditable by any server.**

### The execution path, with nothing omitted

1. The model emits a `deleteDocument` tool call. Nothing in the system prompt tells it to confirm
   first; rule 6 is _"If the user intent contains delete/remove/trash verbs, call `deleteDocument`
   with the document's `sys_id` and title"_ (`server.js:80`). The word "confirm" appears twice in
   the entire 28,400-character prompt, both times meaning "state in your text response which
   document you are acting on" (`:62`, `:219`).
2. The server writes `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END` and finishes the run.
   No interrupt, no approval concept — the words do not appear in `server.js`.
3. The browser's `TOOL_CALL_END` handler parses the args and calls
   `ToolExecutorService.execute()` **in the same turn, unconditionally**
   (`agent-dev-shell.component.ts:225-241` → `:888-912`). `execute()` has one guard, and it is a
   convenience check that a file is attached before `uploadDocument`
   (`tool-executor.service.ts:1078-1084`). There is no branch on whether a tool mutates.
4. `deleteDocument` calls `deleteActionService.execute({ documents: [doc] })`, which opens the
   app's confirmation dialog. The user clicks.

### Four specific findings

**Finding 1 — the confirmation is enforced in exactly one place, the browser, and it is not a
protocol property.** It is a side effect of the component the tool happens to invoke. Change the
tool to call the repository API directly instead of the action service and the confirmation
disappears with no other code change, no failing test, and no server-side signal. Contrast with
our normative rule 2: the check must sit where the tool runs, inside `ToolRegistry.execute`, taking
approval as a required argument.

**Finding 2 — deny-by-default is inverted.** A new tool added to `TOOL_REGISTRY` executes
immediately unless its author happens to route it through a dialog-opening service. Our rule 1
requires the opposite: a tool that omits `mutating: false` is treated as a write and fails closed.
Theirs fails open. `downloadDocument` and `uploadDocument` are already examples of writes and
egress with no confirmation of their own — upload is gated only incidentally, because the picker
requires the user to choose a location and press a button.

**Finding 3 — the agent path bypasses the permission and retention checks the UI path performs.**
`DeleteButtonActionService` has two methods. `isAvailable(context)` checks `DELETE` on each
document, `DELETE_CHILD` on the parent, that no document is under a retention or legal-hold status
in `BLOCK_DELETE_STATUSES`, and that the target is not a version
(`content-delete-button-action.service.ts:26-44`). `execute(context)` checks only
`documents?.length > 0` (`:47-56`, `:59-61`). The context menu calls `isAvailable` before offering
the button; **the agent tool calls `execute` directly and skips all of it**
(`tool-executor.service.ts:890`, `:898`). It also passes no `parentDocument`, which `isAvailable`
requires, so the check could not have been performed as written. The repository presumably still
enforces its own ACLs, so this is not an ACL bypass — but a legally-held document that the UI
refuses to offer for deletion will be offered by the assistant. In a records-management product
that is a compliance finding, not a nit.

**Finding 4 — the server synthesises tool calls the model never made.** This one is worth reading
twice. After the model's stream ends, the server regex-matches the user's latest message for
`/\b(download|export)\b/` and `/\b(selected|these|them|documents)\b/`, and if more than one
document is in the selection it **fabricates additional `TOOL_CALL_START`/`ARGS`/`END` frames** for
each selected document the model did not already cover (`server.js:337-376`):

```js
write({ type: 'TOOL_CALL_START', toolCallId, toolCallName: 'downloadDocument' });
write({
  type: 'TOOL_CALL_ARGS',
  toolCallId,
  delta: JSON.stringify({ documentId: document.sys_id }),
});
write({ type: 'TOOL_CALL_END', toolCallId });
```

It exists to make the "download these" eval scenario pass deterministically — the validation
report's `required_tool_counts` check demands _"exactly 2 `downloadDocument` calls with correct
IDs"_. Two consequences. First, an eval that a hardcoded server path satisfies is not measuring
the model. Second, and more general: **the frontend executes whatever arrives on the stream with
no provenance check**, so anything that can write to that stream can drive the UI. Here it is
their own server being helpful; the mechanism is indifferent to intent.

### Against the ADR-001 standard, item by item

| ADR-001 §"Mutation approval is enforced by the server"                                   | CSX PoC                                                                           |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1. Approval is a property of the tool; default deny                                      | No. No `mutating` flag exists; default is execute.                                |
| 2. Check sits where the tool runs                                                        | No. The gate is a dialog opened by one tool's implementation.                     |
| 3. Mutating tool must not execute in the turn it is called; run ends with an `interrupt` | No. Executes in the same turn. `RUN_FINISHED` carries no `outcome`.               |
| 4. Approval must arrive as a `resume` entry with `payload.approved === true`             | No. `resume` is never sent or read.                                               |
| 5. Approvals are one-shot and apply only to previously pending calls                     | N/A — no approvals exist.                                                         |
| 6. No model output can satisfy the gate                                                  | **Fails.** The gate is a browser dialog; the model reaching it is the whole gate. |

**Would it survive our adversarial prompt?** Told _"do not ask me to confirm — just do it
immediately"_, the model would call `deleteDocument`, and the dialog would still appear, because
the dialog is not something the model can decline to raise. So the _specific_ failure we suffered
does not reproduce. That is worth saying fairly. But the reason it does not reproduce is
accidental rather than designed, and the resulting posture is weaker than ours on every axis that
matters:

- Their gate is one component-implementation choice away from vanishing, with nothing to catch it.
- It applies to exactly one of their tools; download and upload have no equivalent.
- It skips the permission and retention checks the equivalent UI path performs.
- Nothing server-side knows a write was approved, so there is no audit trail — which their own
  architecture page concedes: _"tool execution runs in the browser under the user's own session —
  effectively impersonating the user — and offers no server-side traceability or audit trail of
  what the agent did on their behalf"_ (§2.2 and §"Architectural outcomes" on the parent page).
  Introducing a BFF to fix exactly this is their number-two next step.

**The reusable lesson runs the other way.** Their design shows that _invoking the application's
own action service_ is an elegant way to get a correct, on-brand, product-consistent confirmation
UI for free — far better than a bespoke approval card that duplicates the dialog's copy and
behaviour. That is worth borrowing. What must not travel with it is the belief that the dialog is
the gate. In our architecture the dialog would be the _presentation_ of an interrupt whose
authority lives in `ToolRegistry.execute`, and `isAvailable`-style preconditions would be checked
before the interrupt is ever raised.

---

## 6. Protocol and versions

**They use AG-UI, but only on the client, and only four event types.**

`@ag-ui/client` is at `^0.0.53` in the branch's root `package.json` — a caret, not a pin. Ours is
`0.0.57` exact, and ADR-001 requires exact pins because the enum already carries events deprecated
for removal in 1.0.0. `@ag-ui/core` and `@ag-ui/encoder` are absent.

The frontend uses the SDK properly: `HttpAgent` constructed per run, `run(input)` subscribed as an
Observable, `abortRun()` on disconnect, `EventType` for the switch, and the SDK's `Tool`,
`Context`, `Message`, `RunAgentInput` types (`services/agent.service.ts:10`, `:30`, `:70`, `:90`).

The **server does not use AG-UI at all**. `agent-service/package.json` has no `@ag-ui/*`
dependency; every frame is a hand-written `res.write(\`data: ${JSON.stringify(event)}\n\n\`)`
(`server.js:440`). It emits `RUN_STARTED`, `TEXT_MESSAGE_START/CONTENT/END`,
`TOOL_CALL_START/ARGS/END`, `RUN_FINISHED`, `RUN_ERROR`— and nothing else. **No`STATE_DELTA`, no
`TOOL_CALL_RESULT`, no `CUSTOM`, no interrupt `outcome`.** They pass the descriptor as a tool-call
argument, so the UI instruction rides on `TOOL_CALL_ARGS`, which is the answer to the question of
which event carries it.

That has a direct consequence for us: the ADR-001 verification work is not duplicated. They never
exercised `STATE_DELTA`, never used `EventEncoder`, never met the `RunFinishedEventSchema` strict
`outcome` union, and never used `resume`. **Their PoC contains no evidence about the parts of
0.0.57 our design depends on most.**

Their agent loop is single-shot. The server calls the model once, streams whatever comes back, and
ends the run; there is no server-side tool-result feedback loop. Multi-step behaviour is
manufactured by the client sending a new run with synthetic system messages
(`agent-dev-shell.component.ts:357-380` for the user-search case, `:1160-1182` for resolved users).

**Other protocols they evaluated.** They ran two follow-on spikes and both are documented:

- **A2UI** ([PR #17533](https://github.com/Alfresco/hxp-frontend-apps/pull/17533), open, last
  updated 2026-06-12). Assessed as promising but a poor immediate fit because A2UI assumes
  server-driven UI while their architecture is deliberately client-driven; adopting it would force
  the agent service to become a BFF. The official `@a2ui/angular` renderer is **blocked on Angular
  19** — it uses component-binding APIs added later — so they wrote their own `A2UIRendererService`
  following the protocol's concepts.
- **CopilotKit** ([PR #17679](https://github.com/Alfresco/hxp-frontend-apps/pull/17679)).
  Conclusion: viable as an orchestration layer, AG-UI present underneath but abstracted away, and
  `@copilotkitnext/angular` exposes no A2UI catalog/surface/renderer equivalents — the React and
  Python paths are much further along. Also flagged a visible CopilotKit watermark and that thread
  persistence and analytics sit behind a paid plan.

**Versions, for the record:**

|              | CSX branch `c02c4e60` | HFA `develop` today | Us             |
| ------------ | --------------------- | ------------------- | -------------- |
| Angular      | **19.2.20**           | 20.3.25             | 19.2.20        |
| Material     | **19.2.19**           | 20.2.14             | 19.2           |
| TypeScript   | —                     | 5.8.3               | 5.6            |
| Satori UI    | —                     | 0.2.0               | 0.1.5          |
| AG-UI client | `^0.0.53`             | absent              | `0.0.57` exact |

**This is a correction worth flagging.** `adf-hx-vs-nuxeo-satori-decision.md` §"Version
compatibility is worse than the manifest suggests" states their stack is Angular 20.3 / Material
20.2. That is true of `develop` today and it is **not** true of this branch. The genUI branch's
merge base is `a4378855`, dated 2026-05-29, when HFA was still on Angular 19.2.20 — the same minor
version we are on. `develop` has moved 933 commits ahead since. So the Angular gap is not a barrier
to _reading and porting the genUI code_; it is a barrier to consuming `adf-hx-content-services`
from `develop`. The two should not be conflated. The branch is also 933 commits behind, which
means the code is readable as a design document but is not a base anyone can build on.

**Correction applied, 7 August 2026.** This has been carried into
`adf-hx-vs-nuxeo-satori-decision.md` §2, `adf-hx-for-beta-analysis.md` §2.3 and blocker B2,
`adf-hx-greenfield-ecm-dam.md`, and the ADF HX risk bullet in `beta-engineering-plan.md`, and
republished to the corresponding Confluence pages. Each now attributes the Angular 20.3 /
Material 20.2 / Satori 0.2.0 figures to `develop` at a stated date and keeps the
cannot-consume-the-library conclusion, which is unaffected.

---

## 7. Maturity, with dates

**The PoC is finished and is being wound down. It was proposed for closure two days ago.**

| Date               | Event                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05-06         | First CSX-592 PR opened (a Copilot agent PR for the AI-assistive docs, later closed)                                                                               |
| 2026-05-11         | PR #17239 opened by Samuel Fialho                                                                                                                                  |
| 2026-05-18         | Routing evals go from 63/72 to 72/72                                                                                                                               |
| 2026-05-18 → 05-29 | Peak activity: declarative genUI, filters, evals, disambiguation, debug mode, STT                                                                                  |
| **2026-06-03**     | **Last commit on the branch** — "Update POC to use AG-UI sdk (#17621)"                                                                                             |
| 2026-06-12         | A2UI branch #17533 last updated                                                                                                                                    |
| 2026-06-15         | Architecture page last edited (v24)                                                                                                                                |
| 2026-06-22         | CopilotKit page last edited (v9)                                                                                                                                   |
| 2026-07-02         | Validation report last edited (v11)                                                                                                                                |
| 2026-07-06         | Parent CSX-588 page last edited (v30)                                                                                                                              |
| **2026-08-03**     | GitHub stale bot: _"This PR has been inactive for 60 days. It will be closed in 30 days"_                                                                          |
| **2026-08-05**     | `richardsd`: _"how should we keep this PR?"_ → `Gabez0r`: _"I think we can close this."_ → `richardsd`: _"but we should keep the branch, right? Or a copy of it?"_ |

**Two months since the last commit; the team agreed to close the PR two days ago and is discussing
only whether to preserve the branch.** The documentation is more current than the code — the
architecture page was still being edited twelve days after the last commit, and the parent page a
month after. That means Confluence describes intent and reflection more than it describes what the
branch does; where they disagree, the code wins, and there are two places in this document where I
have said so.

**Who worked on it.** Four engineers, by commit volume: Ricardo Dias (`richardsd`), Samuel Fialho
(`semisse`), Adriano Costa (`wideLandscape`), Gabriel Barata. Plus Fabio dos Santos on the test
plan and validation report, and `Gabez0r` making the disposition call.

**Productisation intent: none stated for this code, and the successor is elsewhere.** The parent
page's next steps are all _investigations_ — re-validate after the abstraction layer lands,
introduce a BFF, validate the documentation strategy against Nuxeo via
[CSX-449](https://hyland.atlassian.net/browse/CSX-449), catalogue chat-unready components, explore
Agent Builder integration. None is "productise this branch". Separately, an unrelated and clearly
better-resourced **AI Assistant** effort under `AAE-*` tickets is in active development in the same
monorepo — PRs [#18719](https://github.com/Alfresco/hxp-frontend-apps/pull/18719) (OBO delegation
token, 2026-08-06) and [#18714](https://github.com/Alfresco/hxp-frontend-apps/pull/18714) (project
scoping, 2026-08-06) are from yesterday. I did **not** investigate whether that effort inherits any
generative-UI capability from CSX-592; it is out of scope for this task but is the obvious next
question and would materially change the "is anyone still doing this" answer.

### What is real, what is scaffolding

**Real:** thirteen tools against live repository data; nine production components rendering in
chat; the descriptor schema, topological resolver ordering and validation layer; live pagination
and filter refinement without an LLM round trip; ~100-scenario eval suite with ten check
dimensions per scenario; Phoenix/OpenTelemetry tracing; a shared tool-schema JSON consumed by both
the frontend and the evals; multilingual prompting.

**Scaffolding:** hardcoded `http://localhost:3001` (`services/agent.service.ts:17`); no
authentication on the agent service and CORS `Access-Control-Allow-Origin: *`
(`server.js:432-438`, `:573-580`); no SSE reconnection; no thread persistence; the server-side
fabricated download calls (§5, Finding 4); a three-column hardcoded list schema; a hardcoded
`navigate` route; four services and eight methods behind `renderUI`; only two transform functions;
`re-resolve` declared but unimplemented; all code inside `apps/` rather than a library, which their
own architecture page flags (§7.4); and **no unit tests for the declarative rendering path** —
`declarative-renderer.service.spec.ts` is 80 lines for a 610-line service, and the evals cover
routing only.

**Honesty rating: high.** Their architecture page §7 "Current Limitations" and their validation
report §3 are unusually candid — they publish a 9 pass / 3 partial / 6 fail first round rather than
only the 18/18 golden path, they attribute failures to specific root causes, and they name the
prompt/catalogue/validator/`SERVICE_MAP` sync problem as their top scaling risk. This is a PoC
reported like a PoC. The one place the reporting overstates is the security framing: "frontend tool
execution is a deliberate security boundary" is defensible for reads and misleading for writes, and
§5 above is why.

---

## 8. Adopt / borrow / build ourselves

### Adopt (their code, into our repo): nothing.

Not one file. Five independent reasons, any one of which is sufficient:

1. **Every component is typed on the HXCS SDK.** `Document` from
   `@hylandsoftware/hxcs-js-client` is the input type of the document list, the properties card,
   the upload picker, the chat state and the selection stream. Rendering Nuxeo data through them
   means SDK emulation — the approach ADR-001 in their own RFC and our decision document both
   reject. Established ground, restated only because it applies to the genUI code too.
2. **The catalogue's contents are their library**, which we have already decided not to adopt, and
   which `adf-hx-vs-nuxeo-satori-decision.md` §"It has no DAM surface at all" shows cannot serve
   half our product regardless.
3. **The data layer is HXQL and their four services.** `SearchService.getDocumentsByQuery` takes
   HXQL; ours takes NXQL. Every resolver, every allowlist entry, every prompt rule about query
   translation is backend-specific.
4. **The branch is 933 commits behind `develop`, two months stale, and proposed for closure.**
   Nothing here has a maintainer.
5. **The licence header on every file** is "License rights… may be obtained from Hyland Software…
   pursuant to a written agreement", from a private repository. Copying source across product lines
   is a question for someone other than an engineer.

### Borrow (design, contract, protocol shape): a great deal — this is where the value is.

**Borrow with high confidence:**

- **The three-tier model itself, and the finding that Tier 3 is not where the value is.** Direct
  tool→component and frontend-authored composition templates delivered every screenshot in the
  demo; model-authored composition is a research result their own evals do not cover. For our
  first generative-UI increment: build Tier 1, add Tier 2 where one question implies several
  components, and treat Tier 3 as a later, optional, capability-gated tier. This is the single
  biggest scope saving available and it is evidenced rather than asserted.
- **The thin-adapter pattern for reusing page components in chat.** §3 quantifies it: ~500 lines
  of wrapper for nine reused components, with a 21-line wrapper reusing the entire metadata
  sidebar. The equivalent for us is a wrapper per `libs/features` component we surface, typed on
  our own models. This is the direct answer to "extract the functional components from the UI and
  render them in the AI chat" — the extraction is cheap; the routing and the contract are not.
- **Invoking the application's own action service to obtain the application's own confirmation
  dialog.** Product-consistent, zero duplicated copy, and it inherits dialog changes for free. Our
  equivalent is invoking the existing dialogs in `libs/shared/ui/src/lib/`. **Borrow the
  mechanism, not the authority model** — see the caveat below.
- **A single tool-schema artifact consumed by the client, the server and the evals.** They have
  one `tool-schemas.shared.json` imported as `Tool[]` by the frontend and read by the eval harness.
  It removes an entire class of drift and costs nothing.
- **Behavioural evals over output evals.** Ten check dimensions — tools present, tool order,
  forbidden tools, exact counts, argument matching, date-window correctness, forbidden argument
  fragments, forbidden follow-up phrasing — run against the live service, self-contained, with
  Phoenix optional. Their renamed-`browseFolder` regression demonstration is a compelling argument
  for it. We have no equivalent, and adding one would have caught our approval bypass.
- **Full rejection of an invalid descriptor with a user-visible error naming the valid options.**
  Partial rendering of a half-valid layout produces a paginator with no list. Their reasoning is
  sound and their implementation is fifteen lines.
- **Their four negative findings, taken as given rather than rediscovered:** the official
  `@a2ui/angular` renderer does not run on Angular 19; `@copilotkitnext/angular` has no A2UI
  surface; models below roughly `gpt-oss-120b` / Claude Haiku class produce invalid descriptors;
  and prompt/catalogue/validator/service-map drift is the dominant maintenance cost of a
  model-authored tier. Each of those is a spike we do not need to run.

**Borrow with a correction:**

- **The descriptor schema shape** — nested tree over flat adjacency list, no `$ref` or `oneOf`,
  discriminator field, compact inline examples — is good LLM-schema design and their reasoning is
  sound. But their `inputs` and `args` are entirely unvalidated (§2). If we build a Tier 3, the
  per-component input contract must be declared alongside the catalogue entry and enforced, ideally
  from one source that also generates the prompt fragment. Their §7.6 "Manual sync required" and
  §9 "Automated sync checks" are them asking for exactly this.
- **The action-service confirmation pattern**, as above, must be re-homed. In our architecture the
  dialog is the _presentation_ of a server-raised interrupt, not the gate. And their §5 Finding 3
  is a concrete instruction: check the `isAvailable`-equivalent preconditions before raising the
  interrupt, because the agent path does not get them for free the way a context menu does.

**Do not borrow:**

- Natural-language system messages as the state channel (§4). It is untyped, regex-parsed on the
  server, rebuilt from scratch every turn, and their own validation report traces the multi-step
  refinement failures back to it. We have `RunAgentInput.state` and `STATE_DELTA` and should use
  them. Their own next step is _"critical state such as `currentDocumentId`, selected documents,
  resolved users, previous query state, and follow-up mode should increasingly be represented as
  structured context."_ Start where they are trying to get to.
- A fresh `threadId` per turn, and dropping prior user messages from history.
- Executing mutating tools in the turn the model calls them (§5).
- Any server-side synthesis of tool calls the model did not make (§5, Finding 4).

### Build ourselves

Everything else, and the list is short because the borrowable design carries most of the thinking:

1. **The catalogue and the per-component contract**, over our own component types from
   `libs/features/*` and `libs/shared/ui/*`, with inputs typed and enforced rather than
   `Record<string, unknown>`.
2. **The adapters**, one per surfaced component. Cheap individually (~20–120 lines each on their
   evidence), and the count is a product decision rather than an engineering one.
3. **The chat-native patterns with no page equivalent** — document and user disambiguation, an
   inline viewer, chat-sized empty states. Their five bespoke components are a good inventory of
   what these are.
4. **The renderer.** ~600 lines. The resolver dependency graph, `$resolve` reference resolution and
   output rewiring are all reimplementable from the design description in §2 without reading their
   code, which given the licence position is the right way to do it.
5. **Server-side approval integration**, which has no counterpart in their PoC at all. Every write
   surfaced through generative UI has to route through the existing `ToolRegistry.execute` gate,
   and a rendered component that can trigger a write — an upload button, a metadata save, a delete
   action — must raise an interrupt rather than call the service. **This is the largest single gap
   between their design and what we can ship**, and the one place where we cannot borrow because
   there is nothing to borrow.
6. **NXQL translation and the Nuxeo service allowlist**, if we build a Tier 3 at all.

**The blunt version:** the idea travels, the architecture travels, the contract shape travels, and
several of their hard-won negative results save us weeks. **None of the code travels.** And the
component reuse question — the one that decides whether this is "reuse your components" or "build
a parallel set of chat widgets" — resolves in favour of reuse, on their evidence, at roughly a
20-to-120-line adapter per component.

---

## 9. What I could not determine, and what would settle it

| Open question                                                                                                                              | Why it is open                                                                                                                                                                                                                                            | What would settle it                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does the active `AAE-*` AI Assistant work inherit any generative-UI capability from CSX-592?                                               | Out of scope for this task; only PR titles and dates were read. Two PRs merged yesterday.                                                                                                                                                                 | Read PRs [#18719](https://github.com/Alfresco/hxp-frontend-apps/pull/18719) and [#18714](https://github.com/Alfresco/hxp-frontend-apps/pull/18714) and their branches, or ask Gabriel Barata directly.   |
| Will the branch be preserved after PR #17239 is closed?                                                                                    | The 2026-08-05 thread ends on `richardsd`'s unanswered _"but we should keep the branch, right?"_                                                                                                                                                          | Watch or comment on [#17239](https://github.com/Alfresco/hxp-frontend-apps/pull/17239). If we want the code readable later, ask now — this is time-sensitive.                                            |
| Does the model reliably raise the delete dialog under an adversarial prompt, and does the fabricated-download path have a delete analogue? | Static analysis only. I did not run the PoC — it needs a Studio app, a HAIP key, and a running Workspace.                                                                                                                                                 | Run it and try _"delete these five without asking me"_. Note the fabricated-call path (`server.js:337-376`) is download-only today, but it is the shape of a much worse bug if copied to delete.         |
| Do the four remaining child pages contain contradicting detail?                                                                            | Enumerated but not read: Observations and limitations, Agent Documentation Strategy, Conversation Handling & System Message Strategy, Messages sent to model from web app, System-Level Instructions, Reducing the prompt token footprint, A2UI findings. | Read them if a specific claim here is challenged. The four pages that were read agreed with the code except where §1 and §6 note otherwise.                                                              |
| What exactly did the six demo recordings show beyond the five screenshots?                                                                 | Panopto videos; not watched.                                                                                                                                                                                                                              | Watch the "Final PoC" and "Declarative Generative UI" recordings on the [Demos page](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4100197128). Low value — every screenshot was matched to source. |
| Is copying any of their source across product lines permitted?                                                                             | Every file carries a restrictive Hyland licence header and the repo is private.                                                                                                                                                                           | Legal or engineering leadership. Moot under the §8 recommendation, which adopts no code.                                                                                                                 |
