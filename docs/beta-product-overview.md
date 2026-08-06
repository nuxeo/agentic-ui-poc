# Nuxeo Satori Beta — Product Overview

> **Status:** Draft for review — pre-execution. Awaiting Product and leadership approval.
> **Audience:** Product and leadership
> **Companion:** [Nuxeo Satori Agentic Beta — Engineering Plan](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4230974026) (child page), mirrored in this repository at `docs/beta-engineering-plan.md`

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

Note that the first bullet is **not a migration path**. Nuxeo Satori does not and will not integrate with cloud Studio Designer for layouts — see section 6.1.

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
- **Human in the loop.** Anything that mutates content surfaces an approval card first. The agent proposes; the user approves, edits, or rejects.
- **Adaptive / generative UI.** The agent can assemble a purpose-built view from a catalogue of approved widgets — a compliance dashboard, a review queue, a comparison — rather than everyone getting the same static layout.
- **Persistent, shareable threads.** Conversations survive reload and are stored as Nuxeo documents in the user's workspace, so they inherit existing permissions and retention and are shared through the same permissions dialog as any other document.
- **Agent-driven navigation and filtering.** The agent can drive the app's own state — set search facets, build a selection — with the app validating every change.

### 3.7 Status summary

| Capability area                           | Today                         | After Beta                      |
| ----------------------------------------- | ----------------------------- | ------------------------------- |
| Core ECM, DAM, admin, workflow            | Complete                      | Hardened, gaps closed           |
| CIC: KD, KE, Content Lake                 | Complete                      | Feedback persistence fixed      |
| AI assists (single-shot)                  | Complete                      | Retained as fallback            |
| Streaming agent runtime                   | None                          | New                             |
| Human-in-the-loop approvals               | None                          | New                             |
| Adaptive / generative UI                  | None                          | New                             |
| Durable conversation threads              | None                          | New                             |
| Recipes                                   | None                          | Framework plus 3 recipes        |
| Admin control of AI/agent capability      | Per-browser user opt-out only | Server-side admin control       |
| Reusable component library                | None                          | New                             |
| Independent designer (Studio alternative) | None                          | Not currently planned — see 6.1 |
| Quality gates (test, E2E, a11y, SAST)     | Partial                       | Beta bar                        |

Four navigation entries — recently viewed, expired queue, favourites, clipboard — currently render "Coming soon". They will be implemented or removed before any beta user sees the product.

## 4. How customers use it

**The knowledge worker** asks for what they need instead of navigating to it: "contracts with ACME expiring this quarter that nobody has reviewed". The agent runs the search, explains what it did, and offers to save the result as a collection. Document summaries and suggested tags appear in place rather than as a separate task.

**The DAM and marketing user** searches assets descriptively, assembles a collection for a campaign, and exports it. Enrichment has already classified and tagged incoming assets, so search works before anyone has manually catalogued anything.

**The compliance and records officer** asks who can access a sensitive folder and gets an answer grounded in actual ACLs, runs an anomaly sweep over the audit log, and reviews flagged events in a view the agent assembles for the question asked.

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
- **Ad-hoc reporting** — falls directly out of the generative UI work, which lets the agent compose a dashboard from approved widgets

### Deferred to post-Beta

- **Bulk metadata cleanup** — propose corrections across a selection, approve or reject in bulk
- **Contract and records review** — surface documents due for review or expiry, assemble a review queue
- **Task triage** — summarise pending workflow tasks, propose an order of attack, act on approval

These three are deferred on schedule grounds, not feasibility: the tool layer built in Beta already covers them, so each is a configuration exercise once the framework exists. Product can swap any deferred recipe for a shipping one at no net cost, but the count of three should hold.

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
- Not all eight recipes — three ship, three are explicitly post-Beta, two are covered without a recipe
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

Two things are named on this page but deliberately not committed, and both are called out where they appear rather than buried: the three post-Beta recipes in section 5, and the independent designer in section 6.1, which is open decision 6.

If a capability is added to this page later, it needs a task in the engineering plan first. The Studio and recipe gaps found in review both came from claims written ahead of the work.

---

### References

- [Nuxeo Satori - Program overview](https://hyland.atlassian.net/wiki/spaces/ANB/pages/3851553213)
- [Studio Designer Integration — Status Report](https://hyland.atlassian.net/wiki/spaces/~71202090f2a61ef96d4f57a5104efe296c1f5b/pages/4042987740)
- [NXENG-615 — Nuxeo Satori component library for Beta release](https://hyland.atlassian.net/browse/NXENG-615)
- [NXENG-531 — Nuxeo Satori Beta Release quality checkup](https://hyland.atlassian.net/browse/NXENG-531)
- [Satori customized components](https://hyland.atlassian.net/wiki/spaces/ANB/pages/4185424775)
- [AG-UI protocol documentation](https://docs.ag-ui.com/introduction)
