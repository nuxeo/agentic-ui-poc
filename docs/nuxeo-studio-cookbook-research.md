# Nuxeo Studio Community Cookbook Research

> Research summary from [nuxeo/nuxeo-studio-community-cookbook](https://github.com/nuxeo/nuxeo-studio-community-cookbook) — real-world Studio Designer customization patterns.

## Repository Overview

The cookbook contains **50+ modules** organized into categories:

- **Layouts** (view, edit, create, search results)
- **Custom Buttons / Actions** (operation buttons on document pages)
- **Custom Widgets** (barcode, progress bar, collapsible, currency)
- **Business Logic** (email, copy/move, relations, versioning)
- **DAM** (video thumbnails, color search, carousel)
- **Reporting / Dashboards** (analytics, KPIs, workflow status)
- **Security** (user management, SAML, sensitive data)

---

## 1. Most Common Types of Studio Customizations

### Category Breakdown (by frequency in cookbook)

| Type                                  | Count | Description                                                              |
| ------------------------------------- | ----- | ------------------------------------------------------------------------ |
| **Custom layouts (view/edit/create)** | ~15   | Modified document layouts with custom fields, widgets, styling           |
| **Custom action buttons**             | ~8    | Toolbar buttons that trigger automation operations                       |
| **Custom widgets**                    | ~10   | Reusable Polymer elements (barcode, progress bar, suggestion formatters) |
| **Search/result customizations**      | ~6    | Custom search forms, result columns, bulk actions                        |
| **Dialog-based actions**              | ~5    | Actions that open a dialog for user input (copy-to, send-email)          |
| **Dashboard/home page**               | ~4    | Custom home pages, analytics dashboards                                  |
| **Business logic automation**         | ~5    | Backend-only automation scripts (no UI)                                  |

### What Customers Actually Do Most

1. **Add custom buttons to document toolbars** that trigger automation chains/scripts
2. **Modify document view/edit/create layouts** with additional fields, custom widgets, and conditional logic
3. **Create dialog-based workflows** (e.g., copy document to folder, send email, add relation)
4. **Customize search results** with additional columns and bulk actions
5. **Build custom reusable widgets** for specialized display (barcodes, progress bars, QR codes)

---

## 2. Custom Button Configurations — Concrete Examples

### Pattern A: Simple Operation Button (Standard)

The core `nuxeo-operation-button` is configured in Studio Designer's UI tab:

- Choose slot: `DOCUMENT_ACTIONS`, `RESULTS_ACTIONS`, etc.
- Set: `operation`, `input`, `icon`, `label`, `params`

```html
<!-- Standard nuxeo-operation-button (OOTB element) -->
<nuxeo-operation-button
  icon="nuxeo:copy"
  label="My Action"
  operation="javascript.MyAutomationScript"
  input="[[document]]"
  params='{"key": "value"}'
  notification="Action completed!"
  event="document-updated"
>
</nuxeo-operation-button>
```

**Key attributes:**

- `operation` — ID of automation chain/script (e.g., `javascript.AS_Copy`)
- `input` — contextual input, usually `[[document]]` for document actions
- `params` — JSON parameters forwarded to the operation
- `notification` — toast message after success
- `event` — DOM event fired on completion (used to refresh UI)

### Pattern B: Operation Button with Navigation

When the automation returns a document and you need to navigate to it:

```html
<dom-module id="nuxeo-operation-button-with-navigation">
  <template>
    <nuxeo-operation-button
      icon="[[icon]]"
      tooltip="[[tooltip]]"
      operation="[[operation]]"
      input="[[input]]"
      params="[[params]]"
      notification="[[notification]]"
      on-operation-executed="_handleResponse"
    >
    </nuxeo-operation-button>
  </template>
  <script>
    Polymer({
      is: 'nuxeo-operation-button-with-navigation',
      behaviors: [Nuxeo.LayoutBehavior],
      properties: {
        icon: String,
        tooltip: String,
        operation: String,
        input: Object,
        params: {
          type: Object,
          value() {
            return {};
          },
        },
        notification: String,
      },
      _handleResponse: function (event, detail) {
        if (detail && detail.response && detail.response.uid) {
          this.fire('navigate', { doc: detail.response });
        }
      },
    });
  </script>
</dom-module>
```

### Pattern C: Dialog-Based Action Button (Copy/Move/Email)

Most complex actions open a dialog for user input before executing:

```html
<dom-module id="copy-element">
  <template>
    <!-- 1. Operation declaration -->
    <nuxeo-operation id="AS_Copy" op="javascript.AS_Copy" input="[[document]]" params="[[params]]">
    </nuxeo-operation>

    <!-- 2. Button trigger -->
    <div class="action" on-tap="_toggleDialog">
      <paper-icon-button id="bt" icon="[[icon]]"></paper-icon-button>
      <span class="label" hidden$="[[!showLabel]]">[[label]]</span>
    </div>
    <paper-tooltip for="bt">[[label]]</paper-tooltip>

    <!-- 3. Dialog with form fields -->
    <nuxeo-dialog id="dialog" with-backdrop>
      <div class="content">
        <h2>Copy Document</h2>
        <nuxeo-document-suggestion
          role="widget"
          enrichers="thumbnail"
          label="Target folders:"
          value="{{targetfolders}}"
          page-provider="PP_Target_Folder"
          min-chars="0"
          required="true"
          multiple="true"
        >
        </nuxeo-document-suggestion>
      </div>
      <div class="buttons">
        <paper-button dialog-dismiss>Cancel</paper-button>
        <paper-button dialog-confirm class="primary" on-tap="_doCopy">Copy</paper-button>
      </div>
    </nuxeo-dialog>
  </template>
  <script>
    Polymer({
      is: 'copy-element',
      behaviors: [Nuxeo.LayoutBehavior],
      properties: {
        document: Object,
        params: { type: Object, value: {} },
        icon: String,
        label: String,
      },
      _toggleDialog: function () {
        this.$.dialog.toggle();
      },
      _doCopy: function () {
        this.params.targetfolders = this.targetfolders;
        this.$.AS_Copy.execute().then(
          function (result) {
            this._toast('Document copied');
          }.bind(this),
        );
      },
    });
  </script>
</dom-module>
```

### Pattern D: Button with Spinner (Loading State)

```html
<dom-module id="nuxeo-operation-button-with-spinner">
  <template>
    <nuxeo-operation id="op" op="[[operation]]" input="[[input]]" params="[[params]]">
    </nuxeo-operation>
    <paper-icon-button id="runButton" on-tap="_run" icon="[[icon]]"> </paper-icon-button>
    <paper-tooltip>[[i18n(label)]]</paper-tooltip>
    <paper-spinner id="spinner" style="display:none;"></paper-spinner>
  </template>
  <script>
    Polymer({
      is: 'nuxeo-operation-button-with-spinner',
      _run: function () {
        this._showSpinner();
        this.$.op
          .execute()
          .then(
            function (response) {
              /* handle response */
            }.bind(this),
          )
          .finally(
            function () {
              this._hideSpinner();
            }.bind(this),
          );
      },
    });
  </script>
</dom-module>
```

### Button Slot Registration (in bundle.html)

```html
<!-- How buttons are registered in the bundle file -->
<nuxeo-slot-content name="copyButton" slot="DOCUMENT_ACTIONS" order="1">
  <template>
    <nuxeo-filter document="[[document]]" type="File,Video,Picture">
      <template>
        <copy-element document="[[document]]" icon="nuxeo:copy" label="Copy"> </copy-element>
      </template>
    </nuxeo-filter>
  </template>
</nuxeo-slot-content>
```

**Key slot names:**

- `DOCUMENT_ACTIONS` — buttons in document toolbar
- `RESULTS_ACTIONS` — buttons in search results
- `DOCUMENT_CREATE_ACTIONS` — buttons in create dialog
- `RESULTS_SELECTION_ACTIONS` — buttons for selected items
- `BLOB_ACTIONS` — buttons on file attachments

---

## 3. Custom Form/Layout Examples

### Create Layout with Template Selection

Replaces the standard file upload with a template picker:

```html
<dom-module id="nuxeo-file-template-select-element">
  <template>
    <nuxeo-document-suggestion
      role="widget"
      enrichers="thumbnail"
      label="[[i18n('label.filetemplate.select')]]"
      value="{{document.properties.ftemp:templateID}}"
      page-provider="pp_template_list"
      min-chars="0"
      result-formatter="[[thumbnailFormatter]]"
      required="true"
    >
    </nuxeo-document-suggestion>
  </template>
  <script>
    Polymer({
      is: 'nuxeo-file-template-select-element',
      behaviors: [Nuxeo.LayoutBehavior],
      properties: {
        document: { type: Object },
        thumbnailFormatter: {
          type: Function,
          value: function () {
            return this._thumbnailFormatter.bind(this);
          },
        },
      },
      _thumbnailFormatter: function (doc) {
        // Custom HTML markup for suggestion dropdown
        var markup = '<table><tr>';
        markup += "<td><img src='" + this._getThumbnailUrl(doc) + "'/></td>";
        markup += '<td>' + doc.title + '</td>';
        markup += '</tr></table>';
        return markup;
      },
    });
  </script>
</dom-module>
```

### Cascading Fields (Conditional Visibility)

```html
<!-- Country dropdown -->
<nuxeo-directory-suggestion
  id="country"
  role="widget"
  value="{{document.properties.customdoc:country}}"
  label="Country"
  directory-name="custom_countries"
  min-chars="0"
  on-value-changed="_calculateState"
>
</nuxeo-directory-suggestion>

<!-- State dropdown (hidden until country is selected) -->
<nuxeo-directory-suggestion
  id="state"
  value="{{document.properties.customdoc:state_province}}"
  label="State/Province"
  role="widget"
  min-chars="0"
  hidden
>
</nuxeo-directory-suggestion>
```

```javascript
_calculateState: function(e) {
  var selection = e.detail.value;
  this.$.state.setAttribute("directory-name", selection);
  this.$.state.removeAttribute("hidden");
}
```

### Toggleable Form (Inline Edit)

Switches between metadata-view and edit mode inline:

```html
<dom-module id="toggleable-form">
  <template>
    <!-- Metadata (view) Mode -->
    <paper-card heading="[[title]]" hidden$="[[_edit]]">
      <div class="card-content">
        <nuxeo-document-metadata document="[[document]]"> </nuxeo-document-metadata>
      </div>
      <div class="card-actions" hidden$="[[!_canEdit(document)]]">
        <paper-icon-button icon="editor:mode-edit" on-tap="_editMode"> </paper-icon-button>
      </div>
    </paper-card>

    <!-- Edit Mode -->
    <div hidden$="[[!_edit]]">
      <nuxeo-document-edit document="[[document]]"> </nuxeo-document-edit>
    </div>
  </template>
</dom-module>
```

### Send Email Dialog (Complex Form)

```html
<nuxeo-dialog id="popupInternal" modal no-auto-focus>
  <h2>Compose your email</h2>
  <nuxeo-input role="widget" label="Subject" value="{{subject}}"></nuxeo-input>
  <nuxeo-user-suggestion
    min-chars="0"
    role="widget"
    label="To"
    value="{{to}}"
    search-type="USER_TYPE"
    multiple
  >
  </nuxeo-user-suggestion>
  <nuxeo-textarea role="widget" label="Body" value="{{body}}" rows="3"> </nuxeo-textarea>
  <div class="buttons">
    <paper-button dialog-dismiss>Cancel</paper-button>
    <paper-button dialog-confirm class="primary" on-tap="doSendEmail"> Send </paper-button>
  </div>
</nuxeo-dialog>
```

---

## 4. Search Results Customization

### Custom Columns in Data Table

```html
<nuxeo-data-table class="results" selection-enabled>
  <nuxeo-data-table-column name="Title" field="dc:title" sort-by="dc:title" flex="100">
    <template>
      <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
      <a href$="[[urlFor('browse', item.path)]]">[[item.title]]</a>
    </template>
  </nuxeo-data-table-column>

  <nuxeo-data-table-column name="Modified" field="dc:modified" sort-by="dc:modified" flex="50">
    <template>[[formatDate(item.properties.dc:modified)]]</template>
  </nuxeo-data-table-column>

  <nuxeo-data-table-column name="Last Contributor" flex="50">
    <template>
      <nuxeo-user-tag user="[[item.properties.dc:lastContributor]]"> </nuxeo-user-tag>
    </template>
  </nuxeo-data-table-column>
</nuxeo-data-table>
```

### Bulk Action from Search Results

```html
<nuxeo-operation-button
  id="bulkRunAction"
  operation="Bulk.RunAction"
  input="[[nxProvider]]"
  notification="All results sent to export"
>
</nuxeo-operation-button>
```

```javascript
_doAction: function() {
  this.$.bulkRunAction.params = {
    action: 'csvExport',
    providerName: 'ACMESearch',
    namedParameters: JSON.stringify(ppParams)
  };
  this.$.bulkRunAction._execute();
}
```

---

## 5. Related Documents Widget (Complex Custom Element)

```html
<dom-module id="nuxeo-se-document-relations">
  <template>
    <nuxeo-operation
      id="opGetAllRelations"
      op="javascript.getAllRelations"
      input="[[document]]"
      on-response="_handleRelationsRecovered"
    >
    </nuxeo-operation>

    <paper-icon-button on-tap="_toggleDialog" icon="icons:add-circle-outline"> </paper-icon-button>

    <nuxeo-data-table items="[[_relations]]">
      <nuxeo-data-table-column name="Title" flex="100">
        <template>
          <iron-icon src="[[_thumbnail(item)]]"></iron-icon>
          <a href="[[_getDocURL(item.path)]]">[[item.title]]</a>
        </template>
      </nuxeo-data-table-column>
      <!-- More columns... -->
    </nuxeo-data-table>

    <nuxeo-se-add-relation-dialog id="dialog" document="[[document]]">
    </nuxeo-se-add-relation-dialog>
  </template>
</dom-module>
```

---

## 6. Key Architectural Patterns for Angular POC

### Pattern 1: Element ↔ Operation Binding

Every custom UI action follows this pattern:

```
[Polymer Element] --input--> [nuxeo-operation] --execute()--> [Automation Chain/Script]
                  <--response-- (document, blob, or status)
```

**Angular equivalent:** Component → NuxeoService.executeOperation() → REST API `/api/v1/automation/{operationId}`

### Pattern 2: Slot-Based Extension System

Elements are registered to named slots in the bundle file:

```html
<nuxeo-slot-content name="myButton" slot="DOCUMENT_ACTIONS" order="10">
  <template>
    <nuxeo-filter document="[[document]]" type="File,Picture">
      <template>
        <my-custom-button document="[[document]]"></my-custom-button>
      </template>
    </nuxeo-filter>
  </template>
</nuxeo-slot-content>
```

**Angular equivalent:**

- Named `<ng-content>` or `<ng-template>` outlets at well-known locations
- `ActionRegistry` service that maps slots to component configurations
- `nuxeo-filter` → Angular guard/directive with document type, permission, facet checks

### Pattern 3: nuxeo-filter for Conditional Rendering

```html
<nuxeo-filter document="[[document]]" type="File,Video,Picture">
  <template><!-- only rendered if type matches --></template>
</nuxeo-filter>

<nuxeo-filter document="[[document]]" permission="Write">
  <template><!-- only rendered if user has Write --></template>
</nuxeo-filter>

<nuxeo-filter document="[[document]]" facet="Versionable">
  <template><!-- only rendered if doc has facet --></template>
</nuxeo-filter>
```

**Angular equivalent:** Structural directive `*nxFilter="let ctx; type: 'File'; permission: 'Write'"` or a `DocumentFilterDirective`

### Pattern 4: Two-Way Data Binding for Forms

All form widgets use Polymer's `{{}}` two-way binding to `document.properties`:

```html
<nuxeo-input value="{{document.properties.dc:title}}"></nuxeo-input>
<nuxeo-directory-suggestion
  value="{{document.properties.custom:country}}"
  directory-name="countries"
>
</nuxeo-directory-suggestion>
<nuxeo-date-picker value="{{document.properties.dc:expired}}"></nuxeo-date-picker>
```

**Angular equivalent:** `[(ngModel)]` or reactive forms binding `formControl` to `document.properties['dc:title']`

### Pattern 5: Common Widget Types in Layouts

| Polymer Widget               | Purpose                             | Angular Equivalent                     |
| ---------------------------- | ----------------------------------- | -------------------------------------- |
| `nuxeo-input`                | Text input                          | `<input matInput>` or custom component |
| `nuxeo-textarea`             | Multi-line text                     | `<textarea matInput>`                  |
| `nuxeo-date-picker`          | Date selection                      | `<mat-datepicker>`                     |
| `nuxeo-directory-suggestion` | Vocabulary/directory dropdown       | Autocomplete with vocabulary API       |
| `nuxeo-document-suggestion`  | Document picker (via page provider) | Document search/select component       |
| `nuxeo-user-suggestion`      | User/group picker                   | User search component                  |
| `nuxeo-select`               | Simple dropdown                     | `<mat-select>`                         |
| `nuxeo-checkbox`             | Boolean toggle                      | `<mat-checkbox>`                       |
| `nuxeo-tag-suggestion`       | Multi-value tag input               | Chips input                            |
| `nuxeo-dropzone`             | File upload area                    | Custom file upload component           |
| `nuxeo-data-table`           | Sortable data table                 | `<mat-table>` or CDK table             |
| `nuxeo-document-thumbnail`   | Doc thumbnail image                 | Image component with rendition URL     |

### Pattern 6: Page Provider for Data Queries

```html
<nuxeo-page-provider
  id="nxProvider"
  provider="ACMESearch"
  page-size="40"
  params="[[params]]"
  schemas="dublincore,common,uid,file"
  headers='{"X-NXfetch.document": "properties"}'
  fetch-aggregates
>
</nuxeo-page-provider>
```

**Angular equivalent:**

```typescript
this.nuxeoService.pageProvider('ACMESearch', {
  pageSize: 40,
  queryParams: this.searchParams,
  schemas: ['dublincore', 'common', 'uid', 'file'],
  headers: { 'X-NXfetch.document': 'properties' },
});
```

### Pattern 7: Event-Driven Refresh

After mutations, elements fire events to trigger UI refresh:

```javascript
this.fire('document-updated'); // Refresh document view
this.fire('navigate', { doc: doc }); // Navigate to document
this.fire('notify', { message: 'Done!' }); // Show notification
```

**Angular equivalent:** EventEmitter, shared BehaviorSubject, or NgRx actions

---

## 7. Critical Observations for Angular POC

### Must-Support Capabilities

1. **Operation execution** with input document, params, and response handling (navigate, download, notify)
2. **Dialog-based actions** with form fields (document suggestion, user suggestion, text input)
3. **Conditional rendering** based on document type, permissions, facets, and lifecycle state
4. **Slot-based extensibility** — ability to register custom actions at well-known extension points
5. **Two-way form binding** for document properties across create/edit/view layouts
6. **Page provider queries** with pagination, sorting, aggregates
7. **Data table** with custom column templates, sorting, and selection
8. **i18n support** — all labels go through `i18n()` function with `messages.json` files
9. **Toast notifications** for operation feedback
10. **Document navigation** — `this.fire('navigate', { doc: result })` pattern

### Layout Types to Support

1. **View layout** — read-only metadata display
2. **Edit layout** — form with two-way bound widgets
3. **Create layout** — form for new document (may include file upload or template selection)
4. **Import layout** — bulk import configuration
5. **Search form layout** — search criteria form
6. **Search results layout** — data table/grid with custom columns
7. **Metadata layout** — sidebar/compact metadata display

### Bundle Registration Pattern

All custom elements and slot contributions are registered in a bundle file:

```html
<!-- Import custom elements -->
<link rel="import" href="custom-elements/copy-element.html" />
<link rel="import" href="custom-elements/move-element.html" />

<!-- Register to slots -->
<nuxeo-slot-content name="copyButton" slot="DOCUMENT_ACTIONS" order="1">
  <template>
    <nuxeo-filter document="[[document]]" type="File">
      <template>
        <copy-element document="[[document]]"></copy-element>
      </template>
    </nuxeo-filter>
  </template>
</nuxeo-slot-content>
```

**Angular POC equivalent:** A configuration-driven action registry:

```typescript
ActionRegistry.register({
  name: 'copyButton',
  slot: 'DOCUMENT_ACTIONS',
  order: 1,
  component: CopyElementComponent,
  filter: { types: ['File', 'Video', 'Picture'] },
});
```
