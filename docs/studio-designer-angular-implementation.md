# Nuxeo Studio Designer — Angular Implementation Plan

**Audience:** Leadership & Architecture Review Board
**Date:** April 2026
**Status:** Proposal — Ready for Review

---

## Executive Summary

Nuxeo Studio Designer is Hyland's low-code tool for building custom UI experiences on the Nuxeo Platform. Today, Studio Designer generates **Polymer-based web components** that only render inside the default Nuxeo Web UI. Our Angular application bypasses Web UI entirely, meaning none of those Studio customizations work in our frontend.

This document presents a comprehensive plan to **re-implement all Studio Designer functionalities as native Angular capabilities**, giving customers the same configuration power with a modern, performant, and maintainable frontend built on Angular 19, Hyland Satori Design System, and our Nx monorepo architecture.

### Business Value

| Benefit                        | Impact                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preserve Studio investment** | Customers keep using Studio to define document types, schemas, workflows, and vocabularies — the Angular UI consumes those definitions at runtime |
| **Modern UX**                  | Angular Material + Satori delivers a faster, more accessible, and responsive experience than Polymer-based Web UI                                 |
| **Maintainability**            | Single Angular codebase with Nx module boundaries vs. scattered Polymer elements with deep framework coupling                                     |
| **AI-augmented**               | Dynamic layouts integrate with our existing AI backend (auto-classify, suggest tags, NL search) — features that Polymer Web UI does not offer     |
| **Performance**                | Lazy-loaded Angular modules, signal-based reactivity, and tree-shaking produce smaller, faster bundles                                            |

---

## Scope: Studio Designer Feature Coverage

The following table maps **every Studio Designer capability** to its Angular implementation status and plan.

| #   | Studio Designer Feature                      | Current Status                         | Angular Implementation Plan                                  | Priority |
| --- | -------------------------------------------- | -------------------------------------- | ------------------------------------------------------------ | -------- |
| 1   | Document Type Layouts (Create)               | **Built** — Layout Engine              | Dynamic Layout Engine (`create` mode)                        | P0       |
| 2   | Document Type Layouts (Edit)                 | **Built** — Layout Engine              | Dynamic Layout Engine (`edit` mode)                          | P0       |
| 3   | Document Type Layouts (View/Metadata/Import) | **Built** — Layout Engine              | Dynamic Layout Engine (`view` / `metadata` / `import` modes) | P0       |
| 4   | Page Provider Search Forms                   | Hardcoded filter bar + quick filters   | Dynamic Search Form Renderer                                 | P0       |
| 5   | Page Provider Result Columns                 | Configurable column picker (manual)    | Schema-driven column definitions                             | P1       |
| 6   | Workflow Task Layouts                        | No task form rendering                 | Dynamic Task Form Renderer                                   | P1       |
| 7   | Vocabularies / Directories                   | **Built** — NxDirectoryWidget          | Universal Directory Widget (flat, hierarchical, L10n)        | P0       |
| 8   | Document Actions & Toolbars                  | Hardcoded header actions               | Configurable Action Registry                                 | P1       |
| 9   | Tabs & Sub-tabs                              | Hardcoded 5-tab layout                 | Dynamic Tab Registry                                         | P2       |
| 10  | Themes & Branding                            | Satori theming + custom theme page     | Theme token mapping from Studio                              | P2       |
| 11  | Translations / i18n                          | ngx-translate (partial)                | Studio label bundle integration                              | P2       |
| 12  | Automation Chains / Scripting                | Server-side (no UI change needed)      | Operation invocation service                                 | P1       |
| 13  | Document Templates                           | Hardcoded business templates           | Studio-driven template registry                              | P1       |
| 14  | Content Enrichers                            | Used in API calls already              | Enricher registry from Studio config                         | P2       |
| 15  | Web UI Slots & Contributions                 | **Built** — SlotRegistryService        | Angular extension points (SlotRegistry + NgComponentOutlet)  | P0       |
| 16  | Field Validation (custom)                    | **Built** — ValidationService          | Regex, cross-field, pluggable custom validators              | P0       |
| 17  | Bulk Edit Forms                              | **Built** — BulkEditRendererComponent  | Checklist-style multi-document edit form                     | P1       |
| 18  | Layout Blocks (reusable)                     | **Built** — LayoutBlockRegistryService | Named reusable field groups inlined at resolve-time          | P1       |
| 19  | Facet Schema Resolution                      | **Built** — SchemaRegistryService      | Facet → schema mapping with runtime resolution               | P0       |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Nuxeo Server                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │ REST API    │  │ Config API   │  │ Studio-Generated Config     │ │
│  │ /api/v1     │  │ /config/     │  │ (types, schemas, workflows, │ │
│  │ documents,  │  │ types,       │  │  page providers, vocabs,    │ │
│  │ automation  │  │ schemas,     │  │  layouts, translations)     │ │
│  └──────┬──────┘  │ facets       │  └─────────────────────────────┘ │
│         │         └──────┬───────┘                                   │
└─────────┼────────────────┼───────────────────────────────────────────┘
          │                │
          ▼                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Angular Application                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  libs/shared/nuxeo-studio                                       │ │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │ │
│  │  │ Schema Registry │  │ Layout Registry │  │ Widget Registry  │ │ │
│  │  │ Fetches & caches│  │ Resolves layout │  │ Maps field types │ │ │
│  │  │ type/schema     │  │ for doc type +  │  │ to Angular       │ │ │
│  │  │ definitions     │  │ mode (create/   │  │ components       │ │ │
│  │  │ from /config/*  │  │ edit/view)      │  │                  │ │ │
│  │  └───────┬────────┘  └────────┬────────┘  └────────┬─────────┘ │ │
│  │          │                    │                     │           │ │
│  │          ▼                    ▼                     ▼           │ │
│  │  ┌─────────────────────────────────────────────────────────────┐│ │
│  │  │              Layout Engine (LayoutRendererComponent)         ││ │
│  │  │  Dynamically composes widgets based on schema + layout def  ││ │
│  │  └─────────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  libs/shared/nuxeo-widgets (Widget Library)                     │ │
│  │  NxText | NxTextarea | NxDate | NxSelect | NxDirectory |        │ │
│  │  NxUser | NxCheckbox | NxRadio | NxBlob | NxHtmlEditor |        │ │
│  │  NxTag  | NxTable   | NxComplex | NxList | NxToggle             │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Feature Modules (consume Layout Engine)                        │ │
│  │  Browse → create dialog uses layout engine for doc type         │ │
│  │  Document Detail → view/edit layouts rendered dynamically       │ │
│  │  Search → page provider search forms rendered from config       │ │
│  │  Tasks → workflow task forms rendered from task definition       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Feature-by-Feature Implementation Detail

### 1. Document Type Layouts (Create / Edit / View)

**What Studio Designer Does:**
Studio Designer lets administrators visually build forms for each document type across three modes — **Create**, **Edit**, and **View** (also called Metadata). Each layout is a Polymer HTML template containing widgets like `<nuxeo-input>`, `<nuxeo-date-picker>`, `<nuxeo-directory-suggestion>`, arranged in rows and columns.

**What We Build in Angular:**

#### Schema Registry Service

A singleton service that fetches and caches document type and schema definitions from the Nuxeo REST API:

```
GET /nuxeo/api/v1/config/types/{docType}
GET /nuxeo/api/v1/config/schemas/{schema}
```

Returns the full list of fields, their data types (`string`, `date`, `integer`, `float`, `boolean`, `blob`, `complex`, `string[]`), constraints (required, regex patterns, min/max), and associated vocabularies.

#### Layout Configuration Format

A JSON structure that maps each document type + mode to an ordered list of field widgets:

```json
{
  "docType": "Contract",
  "mode": "create",
  "sections": [
    {
      "label": "General",
      "fields": [
        { "xpath": "dc:title", "widget": "text", "required": true },
        { "xpath": "dc:description", "widget": "textarea" },
        { "xpath": "contract:type", "widget": "directory", "directory": "contractType" },
        { "xpath": "contract:effectiveDate", "widget": "date" },
        { "xpath": "contract:amount", "widget": "number", "min": 0 }
      ]
    },
    {
      "label": "Classification",
      "fields": [
        { "xpath": "dc:nature", "widget": "directory", "directory": "nature" },
        {
          "xpath": "dc:subjects",
          "widget": "directory",
          "directory": "l10nsubjects",
          "multiple": true
        }
      ]
    }
  ]
}
```

#### Layout Renderer Component

A single Angular component that takes `docType`, `mode`, and `document` as inputs and dynamically renders the appropriate form:

```
<nx-layout-renderer
  [docType]="'Contract'"
  [mode]="'edit'"
  [document]="currentDocument"
  (save)="onSave($event)"
/>
```

#### Auto-Generation Fallback

When no explicit layout configuration exists for a document type, the engine **auto-generates** a form by introspecting the schema — every field gets a default widget based on its data type. This ensures every document type is usable immediately without manual configuration.

**Replaces:**

- Current hardcoded `EditMetadataDialogComponent` (6 Dublin Core fields only)
- Current hardcoded `CreateImportDialogComponent` (fixed business templates)
- Current hardcoded properties panel in Document Detail

---

### 2. Widget Library

**What Studio Designer Offers:**
The Studio Designer toolbox provides a catalog of widgets for each schema field type. From the Studio DOM analysis, we identified the complete list:

| Studio Widget         | Nuxeo Element                   | Angular Equivalent               | Schema Type               |
| --------------------- | ------------------------------- | -------------------------------- | ------------------------- |
| Text                  | `nuxeo-input`                   | `NxTextWidgetComponent`          | `string`                  |
| Textarea              | `nuxeo-textarea`                | `NxTextareaWidgetComponent`      | `string` (long)           |
| Date Picker           | `nuxeo-date-picker`             | `NxDateWidgetComponent`          | `date`                    |
| Checkbox              | `paper-checkbox`                | `NxCheckboxWidgetComponent`      | `boolean`                 |
| Toggle                | `paper-toggle-button`           | `NxToggleWidgetComponent`        | `boolean`                 |
| Radio Button          | radio group                     | `NxRadioWidgetComponent`         | `string` (enum)           |
| Integer               | `nuxeo-input[type=number]`      | `NxNumberWidgetComponent`        | `integer` / `long`        |
| Float                 | `nuxeo-input[type=number]`      | `NxNumberWidgetComponent`        | `float` / `double`        |
| Vocabulary Suggestion | `nuxeo-directory-suggestion`    | `NxDirectoryWidgetComponent`     | `string` + directory      |
| L10n Vocabulary       | `nuxeo-directory-suggestion`    | `NxDirectoryWidgetComponent`     | `string` + l10n directory |
| User/Group Suggestion | `nuxeo-user-group-suggestion`   | `NxUserGroupWidgetComponent`     | `string` (user ref)       |
| Document Suggestion   | `nuxeo-document-suggestion`     | `NxDocSuggestionWidgetComponent` | `string` (doc ref)        |
| Blob / File Upload    | `nuxeo-file` / `nuxeo-dropzone` | `NxBlobWidgetComponent`          | `blob`                    |
| HTML Editor           | Rich text editor                | `NxHtmlEditorWidgetComponent`    | `string` (HTML)           |
| Tag Suggestion        | `nuxeo-tag-suggestion`          | `NxTagWidgetComponent`           | `string[]`                |
| Data Table            | `nuxeo-data-table`              | `NxDataTableWidgetComponent`     | `complex[]`               |
| Complex (nested)      | Nested layout                   | `NxComplexWidgetComponent`       | `complex`                 |

Each widget component implements a common interface:

```typescript
interface NxWidget {
  xpath: string; // e.g. "dc:title"
  value: unknown; // bound to document property
  mode: 'create' | 'edit' | 'view';
  required: boolean;
  label: string;
  constraints: FieldConstraint[];
  valueChange: EventEmitter<unknown>;
}
```

All widgets support three rendering modes:

- **Create**: Empty form field, validation active
- **Edit**: Pre-filled form field, validation active
- **View**: Read-only display with appropriate formatting

---

### 3. Page Provider Search Forms

**What Studio Designer Does:**
Studio lets administrators configure **Page Providers** — named, parameterized NXQL queries with:

- A **search form** layout (filter widgets above the result table)
- A **result column** configuration (which properties appear as columns, their order, format)
- **Aggregation** definitions (faceted filters like checkboxes, date ranges, histograms)

**What We Build in Angular:**

#### Page Provider Registry Service

Fetches page provider configuration from the Nuxeo REST API:

```
GET /nuxeo/api/v1/config/searchForms
POST /nuxeo/api/v1/search/pp/{providerName}/execute
```

#### Dynamic Search Form Renderer

A component that renders filter widgets based on the page provider's predicate definitions:

```
<nx-search-form
  [pageProvider]="'default_search'"
  (search)="onSearch($event)"
/>
```

This renders the appropriate filter widgets (text, date range, directory select, user picker, etc.) based on the page provider's configuration, including:

- **Full-text** search bar
- **Date range** pickers (created, modified)
- **Directory** dropdowns (nature, subjects, coverage)
- **Document type** multi-select
- **User/group** pickers (author, contributors)
- **Custom predicate** fields from custom schemas

#### Dynamic Result Columns

Result tables render columns defined by the page provider configuration, not hardcoded column lists:

```
<nx-result-table
  [pageProvider]="'default_search'"
  [results]="searchResults"
  [columns]="providerColumns"
/>
```

#### Aggregation Sidebar

Faceted search aggregation widgets (checkboxes, date histograms, term aggregations) are dynamically rendered based on the page provider's aggregation configuration.

**Replaces:**

- Current hardcoded quick filter buttons
- Current hardcoded column definitions
- Current manual column settings dialog

---

### 4. Workflow Task Layouts

**What Studio Designer Does:**
Studio allows defining **workflow models** with tasks. Each task has:

- A **task layout** — the form shown when a user processes a task
- **Task variables** — input fields (approve/reject comment, due date, assignees)
- **Task buttons** — action buttons that trigger transitions (Approve, Reject, Delegate)

**What We Build in Angular:**

#### Task Layout Renderer

A component that fetches the task definition from the Nuxeo API and dynamically renders the task form:

```
GET /nuxeo/api/v1/task/{taskId}
→ Returns task variables, layout info, available transitions
```

```
<nx-task-form
  [taskId]="currentTaskId"
  (complete)="onTaskComplete($event)"
/>
```

The form renders:

- Task directive text (instructions to the user)
- Variable fields using the same Widget Library (text, date, user picker, etc.)
- Transition buttons (Approve, Reject, etc.) dynamically based on task node

#### Workflow Graph Visualization

An interactive workflow progress indicator showing:

- Completed steps (green)
- Current step (highlighted)
- Upcoming steps (grey)
- Escalation paths

**Replaces:**

- Current "Process" button that only starts workflows
- No existing task form rendering capability

---

### 5. Vocabulary / Directory Management

**What Studio Designer Does:**
Studio lets administrators define and manage **vocabularies** (controlled lists): simple flat lists, hierarchical trees, and L10n (localized) vocabularies. These are used by directory-suggestion widgets in layouts.

**What We Build in Angular:**

#### Universal Directory Widget

A single Angular component that handles all vocabulary types:

```
<nx-directory-widget
  [directory]="'nature'"
  [multiple]="false"
  [value]="selectedNature"
  (valueChange)="onNatureChange($event)"
/>
```

Supports:

- **Flat vocabularies** (simple dropdowns)
- **Hierarchical vocabularies** (cascading selects or tree pickers, e.g., subjects → sub-subjects)
- **L10n vocabularies** (localized label display based on user's language)
- **Typeahead search** for large vocabularies (>50 entries)
- **Create-on-the-fly** option for authorized users

#### Administration Vocabulary Editor

An admin page for managing vocabulary entries (add, edit, reorder, deactivate) — mirroring Studio's vocabulary editor:

```
/administration/vocabularies/{directoryName}
```

**Replaces:**

- Current hardcoded nature/subjects/coverage dropdowns in `EditMetadataDialogComponent`
- Current limited `DirectoryService` (3 directories only)

---

### 6. Document Actions & Toolbar Configuration

**What Studio Designer Does:**
Studio allows configuring which actions appear on document action bars, including:

- **Header actions** (edit, delete, download, lock, etc.)
- **Contextual actions** (based on document type, state, user permissions)
- **Bulk actions** (on multi-select in browse/search views)
- **Slot contributions** (adding custom buttons to specific UI locations)

**What We Build in Angular:**

#### Action Registry Service

A centralized service that resolves available actions based on:

```typescript
interface ActionDescriptor {
  id: string; // e.g. "edit", "startWorkflow"
  label: string;
  icon: string;
  category: 'header' | 'context' | 'bulk';
  order: number;
  filter: ActionFilter; // visibility conditions
  handler: string; // action to execute
}

interface ActionFilter {
  docTypes?: string[]; // visible only for these types
  permissions?: string[]; // requires these permissions
  states?: string[]; // visible in these lifecycle states
  facets?: string[]; // requires these facets
  schemas?: string[]; // document must have these schemas
}
```

Actions are registered declaratively and resolved at runtime:

```
<nx-document-actions
  [document]="doc"
  [category]="'header'"
/>
```

**Replaces:**

- Current hardcoded header action buttons in `document-detail.html`
- Current hardcoded bulk actions in browse component
- Current hardcoded "more" menu items

---

### 7. Automation Chain / Scripting Integration

**What Studio Designer Does:**
Studio lets developers define **Automation Chains** and **Automation Scripting** (server-side JavaScript). These are invoked by UI buttons, workflow nodes, and event handlers.

**What We Build in Angular:**

#### Operation Service (already partially exists)

The existing `NuxeoApiBase` already supports calling automation operations:

```
POST /nuxeo/api/v1/automation/{operationId}
```

We extend this with:

- A typed operation invocation helper
- UI actions that trigger custom automation chains defined in Studio
- Feedback handling (success/error/redirect after operation)

```typescript
automationService
  .run('Contract.Approve', {
    input: documentId,
    params: { comment: 'Approved by reviewer' },
  })
  .subscribe((result) => {
    /* handle */
  });
```

No layout changes needed — automation chains run server-side. The Angular side only needs to invoke them and handle responses.

---

### 8. Document Templates

**What Studio Designer Does:**
Studio lets administrators define **document templates** — pre-configured document types with default property values, attached files, and specific layouts. When a user creates a document, they can select from available templates.

**What We Build in Angular:**

#### Template Registry

Fetches available document types and their subtypes from the Nuxeo API:

```
GET /nuxeo/api/v1/config/types
→ Returns all registered document types with parent type, facets, schemas
```

The create dialog dynamically shows available types (not hardcoded business templates):

```
<nx-create-dialog
  [parentPath]="'/default-domain/workspaces'"
  [allowedTypes]="subtypes"
/>
```

When a type is selected, the Layout Engine renders the appropriate **create layout** for that type.

**Replaces:**

- Current hardcoded `BUSINESS_TEMPLATES` array in `CreateImportDialogComponent`
- Current fixed list of 10 templates

---

### 9. Tabs & Customizable Views

**What Studio Designer Does:**
Studio allows adding custom tabs to document views and configuring which tabs appear for which document types. Default tabs include: View, Edit, Permissions, History, Publishing, Relations, Comments.

**What We Build in Angular:**

#### Dynamic Tab Registry

A configuration-driven tab system that resolves visible tabs based on the document type and facets:

```typescript
interface TabDescriptor {
  id: string;
  label: string;
  icon?: string;
  component: Type<any>; // lazy-loaded Angular component
  order: number;
  filter: {
    docTypes?: string[];
    facets?: string[];
    permissions?: string[];
  };
}
```

```
<nx-document-tabs
  [document]="doc"
  [tabs]="resolvedTabs"
/>
```

Custom tabs defined in Studio (e.g., a "Contracts" tab showing related contracts) are mapped to Angular components and injected into the tab bar.

**Replaces:**

- Current hardcoded 5-tab `mat-tab-group` in `document-detail.html`

---

### 10. Themes & Branding

**What Studio Designer Does:**
Studio allows customizing the application theme: logo, colors, fonts, and CSS variables.

**What We Build in Angular:**

Our application already has a robust theming system:

- `AppThemeService` applies CSS custom properties at startup
- Settings page with theme selection
- Satori design tokens for consistent styling

We extend this to:

- Read Studio's theme configuration (logo URL, primary/secondary colors)
- Map Studio CSS variables to Satori design tokens
- Apply customer branding from Studio config at runtime

---

### 11. Translations / Internationalization

**What Studio Designer Does:**
Studio lets administrators add and override translation labels for any language. These are JSON bundles loaded by Nuxeo Web UI at runtime.

**What We Build in Angular:**

Our application already uses `ngx-translate`. We extend it to:

- Fetch Studio-defined translation bundles from the Nuxeo API
- Merge them with built-in Angular translations
- Support dynamic label resolution in layouts and widgets

```
GET /nuxeo/api/v1/directory/i18n?language=en
```

---

### 12. Content Enrichers

**What Studio Designer Does:**
Studio can register custom **content enrichers** — server-side logic that adds extra data to REST API responses (e.g., computed fields, related document counts, workflow status).

**What We Build in Angular:**

The existing `NuxeoApiBase` already supports enricher headers:

```typescript
this.api.get<NuxeoDocument>(`/nuxeo/api/v1/path/${path}`, {
  headers: { 'enrichers-document': 'thumbnail,permissions,subtypes,breadcrumb' },
});
```

We extend this with:

- An enricher registry that knows which enrichers to request per context
- Studio-defined enrichers automatically added to API calls
- Enricher data accessible in layout templates

---

## Widget Mapping: Complete Studio Designer to Angular Reference

This section provides the definitive mapping from every widget available in Studio Designer's toolbox to its Angular implementation, organized by the schema field categories found in the Studio DOM analysis.

### Dublin Core (`dc:`) Fields

| Field                | Type     | Studio Widget Options               | Angular Widget              |
| -------------------- | -------- | ----------------------------------- | --------------------------- |
| `dc:title`           | string   | Text, Textarea                      | `NxTextWidget`              |
| `dc:description`     | string   | Text, Textarea                      | `NxTextareaWidget`          |
| `dc:created`         | date     | Date Picker, Date (View)            | `NxDateWidget`              |
| `dc:modified`        | date     | Date Picker, Date (View)            | `NxDateWidget`              |
| `dc:creator`         | string   | Text (View), User Suggestion        | `NxUserGroupWidget`         |
| `dc:lastContributor` | string   | Text (View), User Suggestion        | `NxUserGroupWidget`         |
| `dc:contributors`    | string[] | User/Group Suggestion (multi)       | `NxUserGroupWidget` (multi) |
| `dc:nature`          | string   | Radio Button, Vocabulary Suggestion | `NxDirectoryWidget`         |
| `dc:subjects`        | string[] | Vocabulary Suggestion (multi)       | `NxDirectoryWidget` (multi) |
| `dc:coverage`        | string   | Radio Button, Vocabulary Suggestion | `NxDirectoryWidget`         |
| `dc:expired`         | date     | Date Picker                         | `NxDateWidget`              |
| `dc:rights`          | string   | Text, Textarea                      | `NxTextWidget`              |
| `dc:source`          | string   | Text                                | `NxTextWidget`              |
| `dc:format`          | string   | Text                                | `NxTextWidget`              |

### File Fields

| Field          | Type   | Studio Widget Options | Angular Widget         |
| -------------- | ------ | --------------------- | ---------------------- |
| `file:content` | blob   | File Upload, Dropzone | `NxBlobWidget`         |
| `files:files`  | blob[] | Multi-file Upload     | `NxBlobWidget` (multi) |

### Common Fields

| Field         | Type   | Studio Widget Options | Angular Widget   |
| ------------- | ------ | --------------------- | ---------------- |
| `common:icon` | string | Text                  | `NxTextWidget`   |
| `common:size` | long   | Number (View)         | `NxNumberWidget` |

### Custom Schema Fields (Generic Mapping)

| Data Type                 | Default Widget              | Alternative Widgets                      |
| ------------------------- | --------------------------- | ---------------------------------------- |
| `string`                  | `NxTextWidget`              | `NxTextareaWidget`, `NxHtmlEditorWidget` |
| `string` (with directory) | `NxDirectoryWidget`         | `NxRadioWidget`, `NxSelectWidget`        |
| `string` (user ref)       | `NxUserGroupWidget`         | `NxTextWidget`                           |
| `date`                    | `NxDateWidget`              | `NxTextWidget` (formatted)               |
| `integer` / `long`        | `NxNumberWidget`            | `NxTextWidget`                           |
| `float` / `double`        | `NxNumberWidget`            | `NxTextWidget`                           |
| `boolean`                 | `NxCheckboxWidget`          | `NxToggleWidget`, `NxRadioWidget`        |
| `blob`                    | `NxBlobWidget`              | —                                        |
| `string[]`                | `NxDirectoryWidget` (multi) | `NxTagWidget`, `NxListWidget`            |
| `complex`                 | `NxComplexWidget` (nested)  | `NxDataTableWidget`                      |
| `complex[]`               | `NxDataTableWidget`         | `NxComplexWidget` (repeated)             |

---

## Implementation Phases

### Phase 0 — Foundation (Weeks 1–2)

**Goal:** Establish the data layer that all subsequent phases depend on.

| Deliverable                     | Description                                                                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Schema Registry Service**     | Fetch, parse, and cache `/config/types` and `/config/schemas` responses. Expose a `getFieldsForType(docType)` API that returns typed field metadata. |
| **Layout Configuration Format** | Define the JSON schema for layout configurations. Build a `LayoutRegistryService` that resolves `(docType, mode) → LayoutConfig`.                    |
| **Field-to-Widget Mapping**     | Implement `WidgetRegistryService` that maps `(fieldType, constraints) → WidgetComponent`.                                                            |
| **Nx Library Scaffolding**      | Create `libs/shared/nuxeo-studio` and `libs/shared/nuxeo-widgets` with proper Nx project configurations and path aliases.                            |

**Dependencies:** None
**Risk:** Low — uses existing REST API endpoints

---

### Phase 1 — Widget Library (Weeks 2–4)

**Goal:** Build the complete set of Angular widget components.

| Sprint | Widgets                                                                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Week 2 | `NxTextWidget`, `NxTextareaWidget`, `NxNumberWidget`, `NxCheckboxWidget`, `NxToggleWidget`                                                |
| Week 3 | `NxDateWidget`, `NxDirectoryWidget` (flat + hierarchical + L10n), `NxSelectWidget`, `NxRadioWidget`                                       |
| Week 4 | `NxUserGroupWidget`, `NxDocSuggestionWidget`, `NxBlobWidget`, `NxHtmlEditorWidget`, `NxTagWidget`, `NxDataTableWidget`, `NxComplexWidget` |

Each widget:

- Implements the `NxWidget` interface
- Supports `create`, `edit`, `view` modes
- Uses Angular Material / Satori UI components
- Has standalone unit tests (Vitest)
- Supports reactive forms or template-driven binding

**Dependencies:** Phase 0 (Schema Registry for validation rules)
**Risk:** Medium — HTML editor and complex/table widgets require significant effort

---

### Phase 2 — Layout Engine (Weeks 4–6)

**Goal:** Build the dynamic form renderer that assembles widgets into layouts.

| Deliverable                   | Description                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`LayoutRendererComponent`** | Takes `docType`, `mode`, `document` inputs. Resolves the layout configuration (or auto-generates from schema). Dynamically creates widget components using Angular's `ViewContainerRef`. |
| **Form State Management**     | Collects values from all widgets into a unified `Record<string, unknown>` for saving. Validates required fields and constraints.                                                         |
| **Section/Accordion Support** | Renders layout sections as collapsible accordions or tabs, matching Studio's `nuxeo-accordion` behavior.                                                                                 |
| **Auto-Generation Engine**    | When no explicit layout exists, introspects the schema and generates a default layout grouping fields by schema.                                                                         |

**Dependencies:** Phase 0 + Phase 1
**Risk:** Medium — dynamic component creation and form validation coordination

---

### Phase 3 — Integration (Weeks 6–8)

**Goal:** Replace existing hardcoded forms with the Layout Engine.

| Integration Point                    | Change                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Create Dialog**                    | Replace `BUSINESS_TEMPLATES` with dynamic document type picker → Layout Engine renders create layout |
| **Edit Metadata Dialog**             | Replace hardcoded 6-field form with `<nx-layout-renderer mode="edit">`                               |
| **Document Detail Properties Panel** | Replace hardcoded property rows with `<nx-layout-renderer mode="view">`                              |
| **Search Page**                      | Replace hardcoded filters with `<nx-search-form>` driven by page provider config                     |

**Dependencies:** Phase 2
**Risk:** Medium — must ensure backward compatibility for existing workflows

---

### Phase 4 — Advanced Features (Weeks 8–12)

**Goal:** Implement remaining Studio Designer capabilities.

| Week  | Feature                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------- |
| 8–9   | **Workflow Task Forms** — Dynamic task layout rendering using the Widget Library and Layout Engine |
| 9–10  | **Action Registry** — Configurable document actions based on type/state/permissions                |
| 10–11 | **Dynamic Tabs** — Tab registry for document detail, extensible per document type                  |
| 11–12 | **Page Provider Result Columns** — Schema-driven column definitions with aggregation sidebar       |

**Dependencies:** Phases 0–3
**Risk:** High — workflow task forms require deep integration with task API

---

### Phase 5 — Polish & Extensions (Weeks 12–16)

**Goal:** Complete coverage and optimize.

| Feature                      | Description                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| **Studio Theme Import**      | Map Studio's CSS variables to Satori design tokens                |
| **Translation Bundle Merge** | Load Studio i18n overrides into ngx-translate                     |
| **Vocabulary Admin UI**      | Full CRUD admin page for directory entries                        |
| **Layout Editor (Stretch)**  | Optional web-based layout editor for configuration without Studio |
| **AI-Enhanced Layouts**      | Auto-suggest widget types, validate data quality, smart defaults  |

---

## Current Capabilities vs. Future State

### What Already Works Today

| Capability                                 | Implementation                                           |
| ------------------------------------------ | -------------------------------------------------------- |
| Repository browsing with breadcrumbs       | `feature-browse` — folder navigation, configurable table |
| Full-text + NXQL search                    | `feature-search` — 3 view modes (grid/table/list)        |
| Document preview (PDF, Video, Image, Note) | `shared/ui/document-viewer` — multi-format viewer        |
| Annotations (ARender)                      | ARender integration in document-detail                   |
| Permissions management                     | Local, inherited, external ACLs with add/remove          |
| Version history                            | Version dropdown, create version, restore                |
| Publishing to sections                     | Section tree picker, publish/unpublish/republish         |
| Audit / History                            | Filterable audit log with pagination                     |
| Comments & replies                         | Threaded comments with edit/delete                       |
| Workflows                                  | Start process, abandon workflow, process task (basic)    |
| Collections                                | Create, add to, remove from collections                  |
| Trash management                           | Trash, restore, permanent delete                         |
| File upload & import                       | Single, multi-file, CSV import                           |
| Nuxeo Drive integration                    | Direct Transfer, token management                        |
| AI: NL Search                              | Natural language to NXQL conversion                      |
| AI: Summarization                          | GPT-4o document summaries                                |
| AI: Classification                         | Auto-classify type, nature, subjects                     |
| AI: Tag Suggestions                        | Content-based tag recommendations                        |
| AI: Similar Documents                      | Embedding-based document discovery                       |
| AI: Chat Assistant                         | RAG-powered conversational assistant                     |
| AI: Anomaly Detection                      | Audit-based security anomaly scanning                    |
| AI: Sentiment Analysis                     | Comment thread sentiment analysis                        |
| 23 Nuxeo API services                      | Full typed coverage of Nuxeo REST API                    |
| 13 data model files                        | Fully typed TypeScript models                            |
| Marketplace packaging                      | OSGi bundle with SSO support                             |

### What This Plan Adds

| Capability                     | Value                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **Dynamic document forms**     | Any document type gets proper create/edit/view forms — no code changes needed |
| **17 reusable widgets**        | Complete coverage of all Studio Designer widget types                         |
| **Schema-driven layouts**      | Forms adapt to schema changes in Studio without redeployment                  |
| **Page provider search forms** | Search forms configure themselves from page provider definitions              |
| **Task forms**                 | Workflow tasks render proper forms with variables and transition buttons      |
| **Configurable actions**       | Document actions adapt to type, state, and permissions                        |
| **Dynamic tabs**               | Document detail tabs configurable per document type                           |
| **Vocabulary management**      | Full admin UI for all vocabulary types                                        |
| **Studio theme support**       | Customer branding flows through from Studio                                   |
| **Studio translation merging** | Custom labels from Studio work in Angular                                     |

---

## Technical Approach & Key Decisions

### Why Not Embed Polymer Components Directly?

We evaluated three approaches for reusing Studio's Polymer elements:

| Approach                                                          | Verdict  | Reason                                                                                                                                                                                |
| ----------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Embed Polymer elements via `CUSTOM_ELEMENTS_SCHEMA`**           | Rejected | Polymer elements depend on `nuxeo-app`, Polymer's data-binding system, and the Nuxeo Web UI runtime. They cannot function in isolation.                                               |
| **Use a third-party bridge (e.g., `@pjbee/ng-polymer-elements`)** | Rejected | These libraries handle basic attribute binding but cannot replicate Polymer's two-way binding, `iron-meta` registry, or `Nuxeo.I18n` system.                                          |
| **Re-implement as native Angular**                                | Selected | Full control, native performance, Satori design system compliance, type safety, and testability. The Widget Library is a one-time investment that pays dividends across all features. |

### How Layout Configurations Are Sourced

There are three strategies, used in priority order:

1. **Explicit JSON configuration** — Hand-authored or auto-generated layout configs stored as application assets. Gives full control over form layout.
2. **Schema introspection (auto-generation)** — The Layout Engine inspects the Nuxeo schema and generates a default form. Every field gets a widget based on its data type. This is the zero-config fallback.
3. **Studio export parsing (future)** — A build-time tool that parses Studio Designer's exported HTML templates and converts them to our JSON layout format. This preserves field order and section grouping from Studio.

### Performance Considerations

- **Lazy loading**: Widget components are loaded only when needed (dynamic import)
- **Schema caching**: Type and schema definitions are cached after first fetch (session-scoped)
- **Signal-based reactivity**: Widget state managed with Angular signals (no subscription overhead)
- **Virtual scrolling**: Data table widget uses virtual scrolling for large lists

---

## Team Structure & Effort Estimate

| Role                                    | Allocation | Weeks                       |
| --------------------------------------- | ---------- | --------------------------- |
| **Angular Architect**                   | 1 FTE      | 16 (Phases 0–5)             |
| **Frontend Developer — Widget Library** | 2 FTE      | 8 (Phases 1–2)              |
| **Frontend Developer — Integration**    | 1 FTE      | 8 (Phases 3–4)              |
| **Nuxeo Platform SME**                  | 0.5 FTE    | 16 (advisory, API guidance) |
| **QA Engineer**                         | 1 FTE      | 12 (Phases 2–5)             |

**Total estimated effort:** ~70 person-weeks (approximately 4 months with a 5-person team)

---

## Recent Additions (April 2026 Update)

The following capabilities have been added to close gaps identified during the initial implementation review.

### 1. Extended Layout Modes

`LayoutMode` now supports five modes: `create`, `edit`, `view`, **`metadata`**, and **`import`**.

| Mode       | Behaviour                                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadata` | Read-only display of all fields (including system fields like `dc:creator`, `dc:created`, `dc:modified`) grouped into a collapsible "System" section.            |
| `import`   | Simplified create form showing only essential fields (`dc:title`, `dc:description`, `dc:nature`, `dc:subjects`, `dc:coverage`) plus blob fields for file upload. |

### 2. Custom Validation System

A new `ValidationService` provides field-level and cross-field validation:

| Validator Type            | Description                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `required`                | Field must have a non-empty value                                                                    |
| `pattern`                 | Value must match a regex pattern (auto-extracted from Nuxeo `PatternConstraint`)                     |
| `minLength` / `maxLength` | String or array length bounds                                                                        |
| `min` / `max`             | Numeric bounds                                                                                       |
| `crossField`              | Compare against another field's value (e.g. `startDate < endDate`)                                   |
| `custom`                  | Pluggable validator function registered at runtime via `ValidationService.registerCustomValidator()` |

Validators are declared on each `FieldWidgetConfig.validators[]` array. The Layout Engine runs validation on every field change and passes error messages to widgets via the `validationErrors` input.

### 3. Extension Points (Slots)

A `SlotRegistryService` enables injection of arbitrary Angular components into named extension points in layouts:

- Layout authors declare `ExtensionPointConfig` slots (name + position: `before` | `after`) at both the **section** and **global** layout level.
- At app startup, developers register Angular components to fill those slots, optionally filtered by document type.
- The `LayoutRendererComponent` dynamically renders registered slot components at the configured positions using `NgComponentOutlet`.

### 4. Layout Blocks (Reusable Field Groups)

A `LayoutBlockRegistryService` stores named, reusable groups of `FieldWidgetConfig[]`. Layout sections reference blocks via `LayoutBlockRef.blockName`; at resolve-time, the `LayoutRegistryService` inlines the block fields into the section. This avoids duplicating common field sets (e.g. Dublin Core metadata) across multiple layout configs.

### 5. Bulk Edit Support

A new `BulkEditRendererComponent` renders a checklist-style form where the user:

1. Selects which fields to update (via checkboxes)
2. Fills in values for the selected fields
3. Submits — only checked fields are emitted in the `BulkEditResult`

This supports bulk-editing multiple documents at once, a key capability in Nuxeo Web UI.

### 6. Facet Schema Resolution

`SchemaRegistryService` now includes:

- A well-known **facet → schema mapping** (`Versionable` → `uid`, `Picture` → `picture` + `image_metadata`, etc.)
- `getFieldsForFacets()` — fetches additional schemas attached via facets
- `getFieldsForTypeWithFacets()` — full field resolution including facet-attached schemas

### 7. Widget Validation Error Display

- `NxWidgetBase` exposes `validationErrors` input and `hasErrors` / `isViewLike` computed signals.
- `NxWidgetHostDirective` passes validation errors through to each widget.
- The Layout Engine marks fields with errors using a visual indicator (red left border).

---

## Risk Register

| Risk                                                                                   | Likelihood | Impact | Mitigation                                                                              |
| -------------------------------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------- |
| Nuxeo REST API does not expose sufficient type/schema metadata                         | Low        | High   | Validate all required endpoints early in Phase 0; fallback to direct platform API calls |
| Complex widget (data table, nested complex) implementation takes longer than estimated | Medium     | Medium | Prioritize simpler widgets first; complex widgets can ship in Phase 4                   |
| Studio layout format changes across Nuxeo versions                                     | Low        | Medium | Version-aware layout configuration parser                                               |
| Performance degradation with very large schemas (50+ fields)                           | Low        | Medium | Virtual rendering for form sections; lazy widget instantiation                          |
| Team unfamiliar with Nuxeo platform internals                                          | Medium     | Medium | Nuxeo Platform SME embedded in team; documentation sprints                              |

---

## Success Criteria

| Metric                      | Target                                                                          |
| --------------------------- | ------------------------------------------------------------------------------- |
| **Widget coverage**         | 100% of Studio Designer widget types have Angular equivalents                   |
| **Document type support**   | Any document type defined in Studio renders proper create/edit/view forms       |
| **Zero-config usability**   | Document types without explicit layouts still get auto-generated forms          |
| **Page provider rendering** | At least 3 standard page providers render search forms dynamically              |
| **Task form rendering**     | Serial Document Review and Parallel Document Review workflows render task forms |
| **Performance**             | Layout rendering under 200ms for documents with up to 30 fields                 |
| **Test coverage**           | >80% unit test coverage on Widget Library and Layout Engine                     |

---

## Appendix A: Nuxeo REST API Endpoints Used

| Endpoint                             | Purpose                                       |
| ------------------------------------ | --------------------------------------------- |
| `GET /config/types`                  | List all registered document types            |
| `GET /config/types/{type}`           | Get type definition (schemas, facets, parent) |
| `GET /config/schemas/{schema}`       | Get schema fields and types                   |
| `GET /config/facets`                 | List all registered facets                    |
| `GET /directory/{directoryName}`     | List vocabulary entries                       |
| `POST /search/pp/{provider}/execute` | Execute page provider query                   |
| `GET /search/pp/{provider}`          | Get page provider definition                  |
| `GET /task`                          | List pending tasks                            |
| `GET /task/{taskId}`                 | Get task details (variables, transitions)     |
| `PUT /task/{taskId}/{action}`        | Complete task with action                     |
| `POST /automation/{operationId}`     | Run automation chain                          |
| `GET /workflow`                      | List workflow models                          |
| `POST /workflow`                     | Start workflow instance                       |

## Appendix B: Existing Codebase Statistics

| Metric              | Value                                    |
| ------------------- | ---------------------------------------- |
| Angular components  | 157 standalone components                |
| Nuxeo API services  | 23 typed services                        |
| Data models         | 13 TypeScript model files                |
| Feature modules     | 8 lazy-loaded feature modules            |
| Shared libraries    | 4 (nuxeo-client, ui, ai-client, drawers) |
| Lines of TypeScript | ~25,000                                  |
| AI features         | 10 integrated AI capabilities            |
| Test framework      | Vitest + Analog (libraries), Karma (app) |

---

_Prepared for leadership review — April 2026_
