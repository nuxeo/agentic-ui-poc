# Nuxeo Satori Beta — Product Overview

> **Status:** Draft for review — pre-execution. Awaiting Product and leadership approval.
> **Audience:** Product and leadership
> **Companion:** [Nuxeo Satori Agentic Beta — Engineering Plan](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4230974026) (child page), mirrored in this repository at `docs/beta-engineering-plan.md`

> **Changed 7 August 2026 — generative UI.** Two investigations costed the generative-UI work
> properly for the first time and found that the version described here was both the wrong shape
> and roughly three times the size implied. Four things on this page changed as a result: the
> generative-UI bullet in 3.6 now describes the application's own components rendered in the chat
> rather than an agent composing a dashboard; the status table in 3.7 splits accordingly; ad-hoc
> reporting moves from "delivered in Beta without needing a recipe" to post-Beta; and the Level 4
> custom-widgets extension point is scoped to read-only widgets. The compliance-officer scenario
> in section 4 is reworded for the same reason. Nothing was deleted — each item is still on the
> page, marked with where it now lands. This is recorded rather than silently applied because
> leadership has read the earlier scope.

---

## 1. What this is

Nuxeo Satori is a modern Angular 19 content UI for Nuxeo, built on Hyland's Satori design system, that replaces the deprecated Polymer Web UI and is native to Content Intelligence (CIC) rather than bolted onto it.

The Beta adds one thing the POC fundamentally does not have: a real **agent runtime**.

**Today (verified in code):** the assistant sends one HTTP request and appends one reply. There is no streaming anywhere in the codebase, no multi-step tool loop, no approval step, and no conversation persistence — chat history lives in an in-memory signal that is wiped on reload. The ten AI features that do work are each a single button wired to a single call.

**Proposed for Beta (none of this exists yet):** hand a goal to an agent that plans, calls Nuxeo and CIC tools across multiple steps, streams its progress, pauses for human approval before it changes anything, and remembers the conversation across sessions.

That gap is the difference between "AI features in a content app" and "an agentic content application", and it is what would differentiate this from every other ECM UI refresh. Everything in section 3.6 is new build, not hardening of something already there.

## 2. The shift we are selling

Describing the legacy Polymer Web UI world on the left, and where Nuxeo Satori is heading on the right:

- **From** UI customization through cloud Studio Designer, gated on engineering and PS — **to** configuration owned by the product itself, extended through a real component library
- **From** one layout for every role — **to** a workspace that adapts to role, task, and described intent
- **From** navigating deep folder trees and taxonomies — **to** describing what you want in plain language
- **From** AI as a set of buttons — **to** AI that proposes and acts, with the human approving

Two qualifications, because this section is direction of travel and the rest of the page is commitment. The first bullet is **not a migration path**: Nuxeo Satori does not and will not integrate with cloud Studio Designer for layouts — see section 6.1. And the second bullet describes where the product is heading, not what Beta ships. What Beta ships against it is described in 3.6: the application's own components rendered in the conversation, chosen by the question. A workspace that lays itself out differently per role is beyond Beta.

## 3. What the product includes

### 3.1 Core ECM — available today

Folder browse with tree navigation, multi-select and configurable columns. Faceted search with saved and shareable searches. Document detail covering metadata, preview, versions, permissions and ACLs, audit history, comments, and rich note editing. Collections with full membership and permission management, including external sharing. Workflow tasks. Trash with filters. Bulk and single-document export in blob, ZIP, XML and CSV forms. Import via drag-and-drop upload and CSV. Nuxeo Drive and ARender / NEV viewer integration.

### 3.2 Administration — available today

Users and groups with full CRUD and an invite flow, vocabularies, audit log with natural-language filtering and AI summarisation, analytics with AI anomaly detection, an NXQL console, and cloud service connections.

### 3.3 DAM — available today

Asset-centric faceted search, asset drawer and results views, rich-media preview.

### 3.4 CIC-native intelligence — available today

Knowledge Discovery gives grounded question answering with agent selection and inline citations backed by a citation viewer. A feedback control is present but currently records the rating in the browser only and never sends it upstream; the plan fixes this. Knowledge Enrichment auto-derives classification, tags, summaries, named entities and image descriptions, and maps them onto Nuxeo metadata. Content Lake ingestion pushes documents and blobs upstream for indexing.

### 3.5 AI assists — available today

Served by the standalone `nuxeo-ai-package` marketplace bundle: natural-language to NXQL search, document summarisation, tag suggestion, classification, similar-document discovery, dashboard insights, audit anomaly detection, and comment sentiment. All single-shot request/response, all behind a user-level opt-out.

### 3.6 The agentic layer — proposed, does not exist today

- **Streaming assistant.** Responses appear token by token, with visible intermediate steps instead of a spinner, and can be cancelled mid-run.
- **Multi-step tool use.** The agent searches, reads documents, inspects tasks, applies tags, classifies, and queries Knowledge Discovery as a chain of steps toward a goal — not one call per button press.
- **Human in the loop.** Anything that mutates content surfaces an approval card first. The agent proposes; the user approves, edits, or rejects. **This is enforced by the server, not by the model.** A live test on 6 August found that a model instructed to skip confirmation performed five unapproved writes, because the gate had depended on the model choosing to ask. Approval is now a property of the tool, checked by the gateway at the moment of execution. A write is never executed in the turn it is requested; the run stops and returns one approval request per write, each naming its own target. Approval comes back on a channel only the browser can write to, so no model output, claimed prior authorisation, or user instruction can produce one — and a tool that fails to declare itself read-only is treated as a write by default. Approving one write does not carry to the next. The distinction matters — a gate that relies on model cooperation holds most of the time, which means it passes rehearsal and fails in production.
- **Generative UI — the application's own components, rendered in the chat.** An answer can render the product's own interface inline in the conversation instead of describing it in prose: ask what is in a folder and a document list appears; ask about a document and its metadata card appears. The agent chooses which component by choosing which tool it calls, from a closed registry the application owns, validates and mounts. In Beta these components are read-only, plus one editable form — metadata edit — whose submission answers the same server-side approval gate as any other write rather than opening a second, ungated write path.

  **Deferred to post-Beta, and named here rather than left to be discovered:** the agent composing a layout of its own from a catalogue of widgets, which is what "adaptive layout" has previously meant on this page. The reason is evidence, not caution. The closest existing implementation of this idea inside Hyland was taken apart in detail in August 2026: every functional surface in their demonstration — upload form, document list, metadata form, delete dialog — came from a fixed tool-to-component mapping or a developer-authored composition, none was composed by the model, their own system prompt tells the model to avoid the composed path, and their evaluation suite does not exercise it. Building the tier that carried the demo and deferring the tier that did not is the largest scope reduction in the Beta plan and the best supported. Chat-rendered upload, delete confirmation and permission editing are also out of Beta scope; the engineering plan names each one.

- **Persistent, shareable threads.** Conversations survive reload and are stored as Nuxeo documents in the user's workspace, so they inherit existing permissions and retention and are shared through the same permissions dialog as any other document.
- **Agent-driven navigation and selection.** The agent can drive the app's own state — move the user to a filtered view, build a selection that later turns can act on — with the app validating every change. This works on the current build.

### 3.7 Status summary

| Capability area                           | Today                         | After Beta                                 |
| ----------------------------------------- | ----------------------------- | ------------------------------------------ |
| Core ECM, DAM, admin, workflow            | Complete                      | Hardened, gaps closed                      |
| CIC: KD, KE, Content Lake                 | Complete                      | Feedback persistence fixed                 |
| AI assists (single-shot)                  | Complete                      | Retained as fallback                       |
| Streaming agent runtime                   | None                          | New                                        |
| Human-in-the-loop approvals               | None                          | New                                        |
| Generative UI: app components in chat     | None                          | Read-only, plus one editable metadata form |
| Model-composed views / ad-hoc reporting   | None                          | Post-Beta — see 3.6                        |
| Durable conversation threads              | None                          | New                                        |
| Recipes                                   | None                          | Framework plus 3 recipes                   |
| Admin control of AI/agent capability      | Per-browser user opt-out only | Server-side admin control                  |
| Reusable component library                | None                          | New                                        |
| Independent designer (Studio alternative) | None                          | Not currently planned — see 6.1            |
| Quality gates (test, E2E, a11y, SAST)     | Partial                       | Beta bar                                   |

Four navigation entries — recently viewed, expired queue, favourites, clipboard — currently render "Coming soon". They will be implemented or removed before any beta user sees the product.

## 4. How customers use it

**The knowledge worker** asks for what they need instead of navigating to it: "contracts with ACME expiring this quarter that nobody has reviewed". The agent runs the search, explains what it did, and offers to save the result as a collection. Document summaries and suggested tags appear in place rather than as a separate task.

**The DAM and marketing user** searches assets descriptively, assembles a collection for a campaign, and exports it. Enrichment has already classified and tagged incoming assets, so search works before anyone has manually catalogued anything.

**The compliance and records officer** asks who can access a sensitive folder and gets an answer grounded in actual ACLs, runs an anomaly sweep over the audit log, and reviews the flagged events in a review list rendered in the conversation. That view is defined by the access-review recipe rather than composed on the fly by the model — the distinction is section 3.6, and it is the difference between something Beta ships and something Beta defers.

**The administrator** manages users, groups, vocabularies and cloud connections in the UI, and reviews agent activity through the standard Nuxeo audit trail — because every agent action is performed as the requesting user, not a service account. New in Beta, they also get server-side control over which AI and agent capabilities are enabled, which recipes are offered, and which write tools the agent may use at all. Today that control is only a per-browser user opt-out, which is not sufficient once an agent can change content.

**The developer or partner** consumes the published Nuxeo Satori component library to build a branded, customer-specific application in Angular, instead of forking Polymer Web UI or going fully headless and rebuilding from zero. This is the churn-reducing capability the program exists to prove.

## 5. Recipes

Recipes are pre-built, configurable use-case templates: a goal, the tools the agent may use, the approval points, and the view it renders. They are how a customer gets value on day one without writing prompts, and how the "described intent" model becomes concrete rather than open-ended.

The expensive part is the framework, not the individual recipe. So Beta funds the declarative recipe framework plus three recipes chosen to prove it end to end, and is explicit about what is deferred.

### Shipping in Beta

- **Find and assemble** — turn a described need into a result set, then into a saved search or collection
- **Intake and classify** — on upload, enrich, propose classification, tags and summary, route to the right folder on approval
- **Access review** — answer "who can see what" from real ACLs and highlight anomalies

### Delivered in Beta without needing a recipe

- **Grounded Q&A** — already shipping today through Knowledge Discovery, with citations back to source documents

### Deferred to post-Beta

- **Bulk metadata cleanup** — propose corrections across a selection, approve or reject in bulk
- **Contract and records review** — surface documents due for review or expiry, assemble a review queue
- **Task triage** — summarise pending workflow tasks, propose an order of attack, act on approval
- **Ad-hoc reporting** — compose a view for the question just asked. **Moved here on 7 August 2026.** It was previously listed as falling directly out of the generative-UI work. It does not: it needs the agent to compose a layout of its own, and section 3.6 defers that tier to post-Beta. Beta delivers the components such a view would be assembled from, and the fixed views the three shipping recipes render — not composition on demand.

The first three are deferred on schedule grounds, not feasibility: the tool layer built in Beta already covers them, so each is a configuration exercise once the framework exists. Product can swap any of those three for a shipping recipe at no net cost, and the count of three shipping recipes should hold. Ad-hoc reporting is deferred on a different basis and cannot be swapped in the same way — what it waits on is a capability, not a configuration.

## 6. Can customers customise it?

Reducing the Studio dependency is an explicit program goal, so this is the most important section for review — and the one where the honest answer is most different from the obvious assumption.

### 6.1 Studio Designer: what is and is not possible

This was investigated and concluded in [Studio Designer Integration — Status Report](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4042987740). The findings are binding on everything below.

Cloud Studio Designer and this UI are two separate systems that cannot fully talk to each other. Configurations live on Hyland's cloud platform until someone clicks Deploy, there is no supported API for reading Studio project configurations, and nothing can ever flow back from this UI into a Studio project. The integration is permanently one-directional at best.

After a Studio project is deployed to the Nuxeo server, this UI can read document types, custom field definitions, and registered search configurations. What it largely cannot read is **layouts** — the most visual and most heavily customised part — because they are stored as raw Polymer-format HTML. A parser handles standard cases; complex customisations may not translate.

The concluded direction is Option A from that report: **an independent designer** that manages its own configurations stored directly on the Nuxeo server, operating separately from cloud Studio. Teams on the new UI use it; teams on legacy Web UI continue with cloud Studio. No sync is attempted.

**Two consequences leadership needs to weigh.** First, a customer with heavily customised Studio layouts does not carry them over — those layouts have to be rebuilt in the new UI. For an account chosen precisely because it customises heavily, that is a real migration cost, not a footnote. Second, the independent designer **does not exist in the codebase today**: there is no match for "studio" or "designer" anywhere in `apps/` or `libs/`. The program page lists "Alternative for Nuxeo Studio (Designer)" in the v0.2 POC scope without a completion mark, and it is not in the current Beta plan. If Beta needs it, that is a fourth workstream to fund.

### 6.2 The customization levels

**Level 0 — End-user preferences, no configuration.** Light and dark theme, AI opt-out, saved searches, column layouts, drawer filters. Persisted per user. Working today.

**Level 1 — Administrative configuration, no code.** Vocabularies, users and groups, permissions and ACLs, and cloud service connections, all managed in the admin UI. Document types, field definitions and search configurations authored in Studio are picked up after deployment.

A caveat on this level: navigation entries are **not** runtime-configurable today. `PLATFORM_NAV_ITEMS` in `apps/nuxeo-ui/src/app/platform-nav-items.ts` is a hardcoded TypeScript constant, so changing the nav means a code change and a rebuild. Making navigation and feature gating deployment-configurable is work that is not currently in the plan.

**Level 2 — Recipes and agent configuration, low code.** Declarative recipe definitions loaded as configuration rather than compiled in: goal, permitted tools, approval points, rendered view. Administrators additionally control which capabilities, recipes and agent write tools are enabled at all. Guardrails and model selection for Knowledge Discovery agents are managed in the Hyland Insight admin UI.

**Level 3 — Component library consumption, code.** The published, versioned Nuxeo Satori library — components, services and models — consumed from the customer's own Angular application. Shaped behind a `satori-content`-style abstraction so the eventual migration to the shared Hyland library is an adapter swap, not a rewrite. This is the answer to "we heavily customise our Web UI".

**Level 4 — Extension points, code.** Register custom agent tools, contribute custom widgets to the generative-UI registry, and theme via Satori design tokens. Both the tool registry and the widget registry ship as documented public extension points rather than internal details.

The widget extension point carries one scope statement in Beta, because it is a security property rather than a limitation we intend to lift casually. A contributed widget is **read-only**: it is handed identifiers — document ids, a column set — and re-fetches its own data through the ordinary services under the signed-in user's session. It is never handed content to display. That is what makes it impossible for a widget to show a row the user is not entitled to see, or a link the agent invented. A widget that needs to change something does it by registering a tool, so the write inherits the server-side approval gate rather than going around it.

The content-service interfaces are _shaped_ so a non-Nuxeo backend is possible later, but no such adapter is built or supported in Beta — see below.

### Not customisable in Beta

Per the NXENG-615 scope: themes other than light and dark, non-Satori/Material components, `satori-content` migration, customer-specific integrations such as FileNet, YouTube and Aspera, and non-Nuxeo backends.

Add to that, per section 6.1: any two-way sync with cloud Studio Designer, and reuse of existing Studio-authored Polymer layouts beyond the standard cases the parser handles.

## 7. Packaging and deployment

The product ships as Nuxeo Marketplace packages, deployable to both Nuxeo Cloud and OnPrem:

- `nuxeo-agentic-ui-package` — the Angular UI, served from the Nuxeo WAR. Exists today.
- `nuxeo-ai-package` — the AI operations, a standalone Java bundle. Exists today.
- The agent runtime — **new, and its packaging is an open decision** (see section 9). Hosting it inside the existing AI package keeps OnPrem to two artifacts; a separate service would add a third and require customers to run and reverse-proxy an additional runtime.

Wherever it lands, the app degrades gracefully: if the agent runtime is not deployed, the UI falls back to today's single-shot AI rather than breaking.

## 8. What Beta is not

Stating this plainly, because it is easy to over-read a demo:

- Not for production content, and carries no GA commitment
- Not a `satori-content` implementation — it is the placeholder that de-risks and informs it
- Not feature-parity with Polymer Web UI
- Not a Studio Designer replacement, and not a path that carries existing Studio layouts across
- Not all eight recipes — three ship, four are explicitly post-Beta, and grounded Q&A is covered without a recipe
- Not an agent that designs its own screens. Components rendered in the chat come from a registry the application owns and validates; model-composed layout is post-Beta, and chat-rendered upload, delete confirmation and permission editing are out of scope
- Targeted at a small set of validation customers, with The Church as first adopter

## 9. Open decisions for review

1. **Where does the agent runtime live?** Extending the existing `nuxeo-ai-package` keeps OnPrem simple and follows the precedent already set; a separate TypeScript service gets first-class AG-UI SDK support but adds a deployment artifact. This is a product and field-operations decision as much as a technical one.
2. **Scope contradiction in the epic.** [NXENG-615](https://hyland.atlassian.net/browse/NXENG-615) lists "JIT/agentic runtime UI" and "any NEW functionality not currently in the POC" as out of scope for Beta, while the program overview places AG-UI adaptive layout in v1. Everything in section 3.6 is new functionality. The epic text needs amending, or the agentic layer needs deferring — it cannot be both.
3. **Conflicting Beta dates.** The program page's capabilities section says Beta is planned for Q1 2027; the version table and both epics say Q3/Q4 2026. It is currently August 2026. This materially changes what fits.
4. **The >90% unit coverage gate is not reachable** on the existing codebase within the Beta window. Proposal: 90% on new library services and the agent runtime, 70% on feature components with logic. Needs sign-off before it becomes a merge blocker.
5. **Confirm the three Beta recipes.** Section 5 proposes find-and-assemble, intake-and-classify, and access review. Product can swap any of the three deferred recipes in at no net cost, but the count should stay at three. Also needed: which validation customer signs off on each.
6. **Is the independent designer in Beta scope?** Section 6.1 concludes it is the right direction, the program page lists it under v0.2 without a completion mark, and it does not exist in the codebase. Without it, "reduced or no Studio dependency" is a statement about layouts the customer must rebuild by hand rather than reconfigure. Funding it is a fourth workstream alongside the three in the engineering plan.
7. **How do we position the Studio layout migration cost** with the first adopters, who were selected partly because they customise heavily?

## 10. Commitment basis

Every capability on this page is either verified working in the code today or maps to a specific funded task in the companion engineering plan, which carries the mapping explicitly in its traceability section. Nothing here is aspirational.

Three things are named on this page but deliberately not committed, and each is called out where it appears rather than buried: the post-Beta recipes in section 5, including ad-hoc reporting; the model-composed generative UI in section 3.6; and the independent designer in section 6.1, which is open decision 6.

If a capability is added to this page later, it needs a task in the engineering plan first. The Studio and recipe gaps found in review both came from claims written ahead of the work. The generative-UI change of 7 August is the rule working in the other direction: a task was costed, the claim it supported turned out to be larger than the task, and the claim moved rather than the task being stretched to cover it. That is the trade this page exists to make, and it is cheaper to make it now than in a Beta review.

---

### References

- [Nuxeo Satori - Program overview](https://hyland.atlassian.net/wiki/spaces/ANB/pages/3851553213)
- [Studio Designer Integration — Status Report](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4042987740)
- [NXENG-615 — Nuxeo Satori component library for Beta release](https://hyland.atlassian.net/browse/NXENG-615)
- [NXENG-531 — Nuxeo Satori Beta Release quality checkup](https://hyland.atlassian.net/browse/NXENG-531)
- [Satori customized components](https://hyland.atlassian.net/wiki/spaces/ANB/pages/4185424775)
- [AG-UI protocol documentation](https://docs.ag-ui.com/introduction)
