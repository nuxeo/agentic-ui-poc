# Consolidated Report: Agentic AI-Built Nuxeo Angular UI PoC

**Contributors:** Narasimha Koppula, Akshita Koppaka, Vivek Chaturvedi
**Timeline:** 6 working days (March 30 – April 6, 2026)
**Tool:** Cursor AI Agent (Claude)

---

## 1. Executive Summary

A team of three engineers used AI-assisted development (Cursor Agent) to build a full-featured Angular 19 application replicating the Nuxeo Web UI. The approach enabled rapid module scaffolding and pattern replication while maintaining architectural consistency and code quality.

**Key finding:** Agentic AI excels at rapid module scaffolding and pattern replication, but requires active human oversight for domain specifics, visual validation, security, and integration edge cases.

### Output at a Glance

| Metric                           | Value                                  |
| -------------------------------- | -------------------------------------- |
| Calendar time                    | 6 working days                         |
| Total commits                    | 108                                    |
| Pull requests merged             | 19 (with automated code review)        |
| Lines of code (TS + HTML + SCSS) | ~42,400                                |
| Source files                     | 247 (157 TS, 46 HTML, 44 SCSS)         |
| Feature modules                  | 8                                      |
| Shared libraries                 | 4                                      |
| Nuxeo API services               | 22                                     |
| Data models                      | 13                                     |
| Documentation files              | 7                                      |
| Docker/infra configs             | 3                                      |
| Satori UI components used        | 8 (5 original + 3 migrated post-audit) |

---

## 2. What Was Built — Daily Timeline

Each day produced shippable, tested features across all three workstreams:

### Day 1 — Mar 30 (Narasimha)

- Project scaffold: Nx monorepo, Angular 19, Satori design system
- Login page, dashboard with widgets, CI pipeline

### Day 2 — Mar 31 (Narasimha + Akshita)

- Browse page with folder navigation
- Document detail page (metadata, permissions, history)
- Search with NXQL
- Asset search results UI with filter drawer and aggregation models

### Day 3 — Apr 1 (All three)

- Collections, document viewer (PDF/image/video/audio)
- Tasks and workflow UI, starting processes from documents (Vivek)
- Migrated drawers to feature libs, global selection topbar (Akshita)
- Search favorites toggle, improved search interactions (Akshita)

### Day 4 — Apr 2 (All three)

- Administration panel: analytics, audit, cloud services, NXQL, users/groups, vocabularies (Vivek)
- User settings and profile pages (Akshita)
- Global search queue, queue mode, saved-search filters (Akshita)
- Secondary search, save-as-filter functionality (Akshita)
- Nuxeo Drive protocol integration (Narasimha)

### Day 5 — Apr 3 (Narasimha + Akshita)

- Trash with filters, bulk actions, saved searches (Narasimha)
- Saved search sharing, permissions workflows (Akshita)
- Stabilized CI lint and search/UI regressions (Akshita)
- PR review fixes across codebase

### Day 6 — Apr 6 (All three)

- ARender annotations viewer — Docker infra + Angular integration (Narasimha)
- SSO/SAML authentication support (Narasimha)
- Multiple themes with settings persistence (Vivek)
- Aligned search/assets filters with trash UI (Akshita)
- Security sanitization fixes, OpenSearch setup docs, PR review resolution

---

## 3. Where AI Assistance Excelled

All three contributors independently reported the same core strengths:

### Speed and Scaling

- **Rapid scaffolding:** 8 feature modules, 4 shared libraries, 22 API services generated in one week with consistent architecture
- **Pattern replication:** Once the first module was established, the agent replicated conventions flawlessly across all subsequent modules — lists, forms, dialogs, search drawers
- **No duplication:** Shared component library prevented code copy-paste across features

### Quality and Consistency

- **Clean architecture:** Feature modules properly isolated; zero cross-feature imports enforced by Nx module boundaries
- **Type safety:** Full TypeScript compliance with typed models, no `any` types in generated code
- **Convention enforcement:** Every component uses `inject()` over constructor, `signal()`/`computed()` for state, `input()`/`output()` for I/O
- **Responsive design:** All UI works on mobile and desktop without manual media query adjustments

### Feedback Responsiveness

- **PR review resolution:** Addressed 13 Copilot review comments (XSS, race conditions, dead code, credential leaks) autonomously in one commit
- **Iterative narrowing:** After review or testing, follow-up rounds narrowed in on specific fixes without redoing everything
- **Documentation:** Generated 7 docs including architecture guide, developer guide, API integrations, and infrastructure setup guides — all with accurate code references

### Infrastructure as Code

- Created Docker Compose for ARender (6 containers + nginx auth proxy)
- Environment-based credential management
- Dev proxy configuration for local development

---

## 4. Where the Agent Struggled

### Domain Complexity (All contributors)

| Area                     | Detail                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- |
| Nuxeo permissions model  | Not obvious from API docs alone — required testing against actual user roles |
| Automation payloads      | Correct format for API calls required testing against live instance          |
| Saved search persistence | How/where to store search profiles needed human clarification                |
| Filter aggregation       | Nuxeo result structure required validation; model mapping adjusted manually  |
| Workflow behavior        | Had to be checked on a live Nuxeo instance for permissions and admin rules   |

### Integration and Infrastructure (Narasimha)

| Area                  | Detail                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Docker networking     | Used `localhost` instead of `host.docker.internal`; took multiple iterations                                     |
| ARender integration   | Generic Docker image lacked Nuxeo connector; required ~6 rounds of iterative debugging, decompiling Java classes |
| Hardcoded credentials | Committed Basic Auth headers and secrets; caught only by PR code review                                          |

### Code Quality Gaps (Akshita + Narasimha)

| Area                  | Detail                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| Memory leaks          | Missed `unsubscribe` on destroy; engineer added cleanup handlers       |
| Security sanitization | CodeQL flagged potential XSS; input validation added post-review       |
| CSS scoping           | `:host ::ng-deep` placed inside a class block — subtle Angular mistake |
| Race conditions       | Async blob fetches not guarded against navigation changes              |
| Import cleanup        | Duplicate imports needed consolidation after large generation batches  |
| Dev server config     | Wrong backend port (8180 vs 8080); proxy settings corrected manually   |

### Visual and UX (Vivek)

| Area              | Detail                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| Theme consistency | Required hands-on browser runs to confirm readability, contrast, and regression |
| Layout review     | Admin and task layouts needed visual inspection the agent cannot perform        |
| Completeness      | Large batches of changes still needed review for edge cases                     |

### Design System Awareness (Narasimha)

The project included `@hylandsoftware/satori-ui` (v0.1.5) — Hyland's own Angular design system — installed and configured from Day 1 via `provideSatori()` in `app.config.ts`. However, the agent **consistently defaulted to Angular Material** for UI primitives, ignoring available Satori components.

| What was available | What the agent used instead                                                                      | Scope of the gap                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `sat-breadcrumbs`  | Custom `<nav>` with `@for` loops, `routerLink`, and `mat-icon` separators                        | 4 pages (browse, collection-detail, document-detail, tasks) |
| `sat-status-tag`   | Custom `<span class="state-badge">`, `<span class="state-chip">`, `<span class="overdue-badge">` | 9 components, ~12 status indicators                         |
| `sat-category-tag` | Custom `<span class="type-badge">`, `<span class="tag-chip">`, `<span class="collection-chip">`  | 9 components, ~10 type/category labels                      |

Only 5 of 8 available Satori components were used during initial development (app-header, platform-nav, logo, avatar, and tag — with tag limited to a single page). The remaining 3 were discovered only when a human reviewed the Satori Storybook and asked: _"Why didn't you use these?"_

A dedicated migration pass was required to replace the custom implementations with Satori equivalents across 13 files. The root cause: the agent defaults to the most familiar, widely-documented library (Angular Material) unless explicitly instructed to prefer an organization's design system.

---

## 5. Where Human Judgment Was Non-Negotiable

All three contributors agree on these categories:

| Responsibility                  | Why Humans Are Still Required                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Visual acceptance testing**   | Agent cannot see the running app; every UI change needed a human to open a browser and confirm it looks right       |
| **Live system validation**      | Workflow, admin, and search behavior had to be tested against a running Nuxeo instance                              |
| **Security review**             | Credential handling, XSS vectors, input sanitization — automated reviewers caught issues the agent initially missed |
| **Domain expertise**            | Nuxeo API quirks, permission models, automation payload formats are not inferable from code alone                   |
| **Prioritization and approval** | Deciding what to build next, accepting or rejecting results, steering the agent when output was wrong               |
| **Infrastructure debugging**    | Docker container health, network connectivity, server configuration — beyond the agent's reach                      |
| **Branch protection / CI**      | Push to `main` blocked by CodeQL; agent needed to be told to use feature branches                                   |

---

## 6. Consolidated Insights

### Why This Succeeded

1. **Clear scope:** MVP defined upfront with specific modules and measurable progress — not an open-ended "build a CMS UI"
2. **Architecture-first:** Layer boundaries established before feature generation; AI stayed consistent throughout
3. **Live validation:** Each feature tested on a real Nuxeo instance the same day; caught API mismatches immediately
4. **Iterative feedback loops:** Engineer tests → logs findings → AI adjusts — simple and effective
5. **Pattern documentation:** Nuxeo API discoveries logged in repo docs, preventing re-learning across team members
6. **Automated review as safety net:** Copilot and CodeQL reviewers caught real security and quality issues that the agent missed

### Where AI Fell Short

1. **Domain edge cases:** Automation payload formats, permission models, and API quirks needed manual testing against a live instance
2. **Small but real bugs:** Import cleanup, memory leaks, and accessibility tweaks require human review every time
3. **Security:** Input validation and sanitization require explicit oversight; AI can generate code that _looks_ safe but isn't
4. **Configuration:** Proxy ports, environment-specific paths, Docker networking, and CI settings need human verification
5. **Visual fidelity:** The agent cannot validate its own output against a design or running application
6. **Design system underutilization:** The agent defaulted to Angular Material for breadcrumbs, status badges, and type labels despite a custom design system (`@hylandsoftware/satori-ui`) being installed and partially used. A post-build audit found 3 unused Satori components that should have been used across 13+ locations, requiring a separate migration pass

---

## 7. Cost-Benefit Analysis

| Category         | Traditional Approach (est.)            | AI-Assisted (actual)                                               |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------ |
| Calendar time    | 4–6 weeks                              | 6 days                                                             |
| Team size needed | 2–3 FTEs                               | 3 engineers + agent (each ~50% coding, ~50% review/testing)        |
| Code consistency | Variable (depends on team discipline)  | Uniform patterns enforced by agent                                 |
| Documentation    | Often skipped under deadline pressure  | 7 documents auto-generated with accurate references                |
| Technical debt   | Higher (shortcuts under time pressure) | Lower (consistent conventions, typed models, module boundaries)    |
| Security posture | Depends on individual discipline       | Requires automated review (Copilot/CodeQL) as mandatory safety net |

---

## 8. Recommendations for Future Projects

1. **Agree on visual and design rules early** — themes, component library, and design tokens before broad generation. Fewer rounds of change later. _(Vivek)_
2. **Keep automated code review mandatory** — fast AI-driven delivery benefits enormously from a second pass for safety, quality, and accessibility. _(All three)_
3. **Establish architecture and conventions first** — one well-built feature module becomes the template the agent replicates across the entire application. _(Narasimha + Akshita)_
4. **Log manual interventions** — track every case where human coding was required so the organization knows precisely where humans are still necessary. _(Vivek)_
5. **Test against live systems daily** — API mismatches, permission quirks, and payload format issues surface only when running against a real backend. _(Akshita)_
6. **Human-in-the-loop is non-negotiable** — the ideal workflow is: agent builds → human validates → automated reviewers catch gaps → agent fixes. _(All three)_
7. **Explicitly declare the component library hierarchy** — tell the agent which design system to prefer over generic alternatives. Without explicit instruction, the agent defaults to Angular Material. A simple rule like "prefer Satori UI components over Angular Material where available" would have prevented the migration rework. _(Narasimha)_

---

_Report consolidated from individual contributions by Narasimha Koppula, Akshita Koppaka, and Vivek Chaturvedi. Source pages available on Confluence._
