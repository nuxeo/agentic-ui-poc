# Agentic AI PoC — Personal report

**Vivek Chaturvedi**

**Role during the PoC:** Direct and review work produced with AI assistance, rather than writing most application code by hand. Any required manual coding was treated as an obstacle to log, per PoC rules.

**Scope:** Describes only work attributed here; features and effort from other contributors are out of scope.

---

## Executive summary

AI-assisted development covered three main areas of the Nuxeo UI proof of concept: **work and tasks** (including starting processes from a document), a full **Administration** experience for administrators, and **appearance and themes** so users can switch themes and the app stays aligned with the design system.

Work involved prompting, review, and browser validation. The AI was strong at covering **many screens quickly** and **applying the same patterns** across them; **confirmation** against a live repository, **visual** checks of layouts and flows, and **iteration** when something was wrong or incomplete still depended on human judgment.

---

## Deliverables, chronologically (by date)

Dates reflect when work was **completed and integrated** during the PoC window (**April 2026**). Descriptions are feature-focused, not technical.

### Wednesday, April 1, 2026

- **Tasks and work:** A dedicated **tasks** experience so people can see their work, open a task for detail, and use flows consistent with the rest of the app.
- **Processes from documents:** From **document** views, users can **start** the business processes that apply to that document, aligned with what the repository allows for that item.
- **Follow-up in the same theme:** Adjustments so **starting a process** behaves reliably and matches the platform’s rules.

### Thursday, April 2, 2026

- **Administration (administrators only):** A full **Administration** area including **analytics**, **audit**, **cloud services**, **query** tools for admins, **users and groups** (lists, details, and forms), **vocabularies**, and surfacing of relevant **platform APIs**. Access is **admin-only**, and navigation reflects that.
- **Documentation:** Material for others to understand how **Administration** fits the platform.
- **Refinement:** Tightened **who can enter** Administration, **group** management screens, and the **main application shell** after review.
- **Processes (consistency):** Consolidated how **starting a process** is handled so behavior is **single and consistent** across document-related flows.

### Monday, April 6, 2026

- **Themes and overall look:** **Multiple themes**, including a clear place under **Settings** to choose one. The app **remembers** the choice.
- **Consistency:** The selected look applies broadly—shell, settings, administration, browsing, collections, document views, tasks, trash, and shared actions such as export and share—so the product reads as **one coherent experience** aligned with the **design system**, not mixed one-off styling.
- **Small follow-up:** A minor tweak to theme behavior after the first pass.

---

## Where AI assistance helped

- **Speed across many screens:** New areas (tasks, administration) and wide visual updates (themes) came together faster than typical hand-coding for the same surface area.
- **Repeated patterns:** Lists, forms, and navigation behaved consistently once the first patterns were set.
- **Responded to feedback:** After review or testing, follow-up rounds could narrow in on specific fixes without redoing everything.

---

## Where human judgment was still required

- **Truth against the real system:** Workflow and admin behavior had to be **checked** on a live Nuxeo instance (permissions, who counts as an administrator, and similar).
- **Completeness:** Large batches of changes still needed **review** for edge cases (for example, switching context between different admin records).
- **What it looks like:** Theme and admin layouts required **hands-on** runs through the app to confirm readability, contrast, and that nothing obvious regressed.
- **Scope of the tool:** The effort centered on the **client application**; the AI was not treated as responsible for proving server or container setups end to end.

---

## Human responsibilities alongside the AI

- Prioritization and **approval** of work, or sending it back for changes.
- **Running** the application and **testing** tasks, administration, and theme switching.
- **Steering** the AI when the first result was wrong or incomplete.
- Logging **unavoidable hand-written application code** as an obstacle when it occurred.

---

## Outcomes tracked (PoC lens)

| Topic                    | Notes                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Capability delivered** | Tasks and workflows, administration, and theming—as in the dated deliverables—against the MVP checklist rows that apply to this scope. |
| **Friction**             | Rework, integration surprises, or obstacles such as required manual coding.                                                            |

---

## Recommendations

1. **Agree on visual and design rules early** (themes and global look) before a broad refresh—fewer rounds of change later.
2. **Keep automated review** on merged changes—fast delivery benefits from a second pass for safety and quality.
3. **Record** when manual coding was required so the PoC shows where humans are still necessary.

---

_End of report._
