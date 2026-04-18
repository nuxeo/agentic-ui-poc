# Nuxeo Elements Widget Catalog & Architecture Reference

> **Source**: [`nuxeo/nuxeo-elements`](https://github.com/nuxeo/nuxeo-elements) on `master` branch
> **Framework**: Polymer 3 (LitElement migration in progress)

---

## Table of Contents

1. [Widget Element Catalog](#1-widget-element-catalog)
   - [Form Input Widgets](#11-form-input-widgets)
   - [Directory Widgets](#12-directory-widgets)
   - [Suggestion / Picker Widgets](#13-suggestion--picker-widgets)
   - [Display Widgets](#14-display-widgets)
   - [Aggregation Widgets](#15-aggregation-widgets)
   - [Layout / Container Widgets](#16-layout--container-widgets)
   - [Utility Widgets](#17-utility-widgets)
2. [nuxeo-layout & nuxeo-document-layout](#2-nuxeo-layout--nuxeo-document-layout)
3. [nuxeo-layout-behavior](#3-nuxeo-layout-behavior)
4. [nuxeo-slot & nuxeo-slot-content](#4-nuxeo-slot--nuxeo-slot-content)
5. [Data Binding Patterns Summary](#5-data-binding-patterns-summary)
6. [Widget-to-Schema Field Mapping Conventions](#6-widget-to-schema-field-mapping-conventions)

---

## 1. Widget Element Catalog

### 1.1 Form Input Widgets

#### `<nuxeo-input>`

**Tag**: `nuxeo-input`
**Source**: `ui/widgets/nuxeo-input.js`
**Mixins**: `IronFormElementBehavior`, `IronValidatableBehavior`

| Property       | Type    | Default | Notify  | Description                                 |
| -------------- | ------- | ------- | ------- | ------------------------------------------- |
| `label`        | String  | —       | —       | Field label                                 |
| `type`         | String  | —       | —       | HTML input type (text, number, email, etc.) |
| `name`         | String  | —       | —       | Form field name                             |
| `value`        | String  | —       | **yes** | Two-way bound value                         |
| `placeholder`  | String  | —       | —       | Placeholder text                            |
| `errorMessage` | String  | —       | —       | Validation error message                    |
| `autofocus`    | Boolean | false   | —       | Auto focus on mount                         |
| `readonly`     | Boolean | false   | —       | Read-only mode                              |
| `disabled`     | Boolean | false   | —       | Disabled state                              |
| `required`     | Boolean | false   | —       | Required validation                         |
| `min`          | String  | —       | —       | Minimum value (numeric/date)                |
| `max`          | String  | —       | —       | Maximum value (numeric/date)                |
| `step`         | Number  | —       | —       | Increment step                              |
| `minlength`    | Number  | —       | —       | Minimum input length                        |
| `maxlength`    | Number  | —       | —       | Maximum input length                        |
| `pattern`      | String  | —       | —       | Regex validation pattern                    |
| `validator`    | String  | —       | —       | Custom validator name                       |
| `autoValidate` | Boolean | false   | —       | Auto-validate on change                     |

**Data binding**: `value="{{value}}"` (two-way)
**Events**: Inherits `iron-form-element` events (`value-changed`)

---

#### `<nuxeo-textarea>`

**Tag**: `nuxeo-textarea`
**Source**: `ui/widgets/nuxeo-textarea.js`

| Property       | Type    | Default | Notify  | Description              |
| -------------- | ------- | ------- | ------- | ------------------------ |
| `label`        | String  | —       | —       | Field label              |
| `name`         | String  | —       | —       | Form field name          |
| `value`        | String  | —       | **yes** | Two-way bound value      |
| `rows`         | Number  | —       | —       | Initial number of rows   |
| `placeholder`  | String  | —       | —       | Placeholder text         |
| `errorMessage` | String  | —       | —       | Validation error message |
| `readonly`     | Boolean | false   | —       | Read-only mode           |
| `disabled`     | Boolean | false   | —       | Disabled state           |
| `required`     | Boolean | false   | —       | Required validation      |
| `invalid`      | Boolean | false   | —       | Invalid state            |

**Data binding**: `value="{{value}}"` (two-way)

---

#### `<nuxeo-select>`

**Tag**: `nuxeo-select`
**Source**: `ui/widgets/nuxeo-select.js`
**Mixins**: `IronResizableBehavior`, `IronValidatableBehavior`

| Property          | Type    | Default | Notify  | Description                              |
| ----------------- | ------- | ------- | ------- | ---------------------------------------- |
| `label`           | String  | null    | —       | Field label                              |
| `placeholder`     | String  | ' '     | —       | Placeholder text                         |
| `errorMessage`    | String  | —       | —       | Validation error message                 |
| `options`         | Array   | null    | —       | Options array `[{id, label}]` or strings |
| `selected`        | String  | —       | **yes** | Selected value (two-way)                 |
| `attrForSelected` | String  | null    | —       | Attribute for selection identity         |
| `horizontalAlign` | String  | 'left'  | —       | Dropdown horizontal alignment            |
| `verticalAlign`   | String  | 'top'   | —       | Dropdown vertical alignment              |
| `dynamicAlign`    | Boolean | —       | —       | Dynamic alignment                        |
| `readonly`        | Boolean | false   | —       | Read-only mode                           |
| `disabled`        | Boolean | false   | —       | Disabled state                           |
| `required`        | Boolean | false   | —       | Required validation                      |

**Data binding**: `selected="{{selected}}"` (two-way)
**Slot**: Supports `<paper-item>` children via `<slot>`

---

#### `<nuxeo-date-picker>`

**Tag**: `nuxeo-date-picker`
**Source**: `ui/widgets/nuxeo-date-picker.js`
**Mixins**: `I18nBehavior`, `IronFormElementBehavior`, `IronValidatableBehavior`

| Property         | Type    | Default | Notify  | Description                                 |
| ---------------- | ------- | ------- | ------- | ------------------------------------------- |
| `label`          | String  | —       | —       | Field label                                 |
| `value`          | String  | —       | **yes** | W3C datetime string (ISO 8601)              |
| `defaultTime`    | String  | —       | —       | Default time `HH:mm:ss` (default midnight)  |
| `errorMessage`   | String  | —       | —       | Validation error message                    |
| `min`            | String  | —       | —       | Minimum date `YYYY-MM-DD`                   |
| `max`            | String  | —       | —       | Maximum date `YYYY-MM-DD`                   |
| `required`       | Boolean | false   | —       | Required validation                         |
| `disabled`       | Boolean | false   | —       | Disabled state                              |
| `firstDayOfWeek` | Number  | —       | —       | First day of week (0=Sunday..6=Saturday)    |
| `timezone`       | String  | config  | —       | IANA timezone (`''` for local, `'Etc/UTC'`) |

**Data binding**: `value="{{value}}"` (two-way, ISO datetime string)
**Internal**: Uses `vaadin-date-picker` with `moment.js` locale formatting

---

#### `<nuxeo-html-editor>`

**Tag**: `nuxeo-html-editor`
**Source**: `ui/widgets/nuxeo-html-editor.js`
**Mixins**: `I18nBehavior`

| Property      | Type    | Default        | Notify  | Description        |
| ------------- | ------- | -------------- | ------- | ------------------ |
| `value`       | String  | —              | **yes** | HTML content value |
| `placeholder` | String  | 'Type here...' | —       | Placeholder text   |
| `readOnly`    | Boolean | false          | —       | Read-only mode     |

**Data binding**: `value="{{value}}"` (two-way, HTML string)
**Internal**: Uses Quill.js rich text editor with toolbar (bold, italic, headers, lists, links, images, video)

---

#### `<nuxeo-file>`

**Tag**: `nuxeo-file`
**Source**: `ui/widgets/nuxeo-file.js`
**Mixins**: `UploaderBehavior`, `I18nBehavior`, `IronFormElementBehavior`, `IronValidatableBehavior`

| Property       | Type    | Default | Notify  | Description                                    |
| -------------- | ------- | ------- | ------- | ---------------------------------------------- |
| `value`        | Object  | —       | **yes** | Blob reference `{upload-batch, upload-fileId}` |
| `multiple`     | Boolean | false   | —       | Allow multiple file upload                     |
| `readonly`     | Boolean | false   | —       | Read-only mode                                 |
| `required`     | Boolean | false   | —       | Required validation                            |
| `emptyLabel`   | String  | —       | —       | Empty label in readonly mode                   |
| `errorMessage` | String  | —       | —       | Validation error message                       |

**Data binding**: `value="{{document.properties.file:content}}"` (two-way, Blob object)
**Events**: `batchFinished` (internal upload complete)

---

#### `<nuxeo-checkmark>`

**Tag**: `nuxeo-checkmark`
**Source**: `ui/widgets/nuxeo-checkmark.js`

| Property   | Type    | Default | Notify | Description    |
| ---------- | ------- | ------- | ------ | -------------- |
| `checked`  | Boolean | false   | —      | Checked state  |
| `disabled` | Boolean | false   | —      | Disabled state |

**Data binding**: `checked` attribute (reflects to attribute)

---

#### `<nuxeo-path-suggestion>`

**Tag**: `nuxeo-path-suggestion`
**Source**: `ui/nuxeo-path-suggestion/nuxeo-path-suggestion.js`
**Mixins**: `FormatBehavior`, `IronFormElementBehavior`, `IronValidatableBehavior`

| Property         | Type    | Default     | Notify  | Description            |
| ---------------- | ------- | ----------- | ------- | ---------------------- |
| `value`          | String  | —           | **yes** | Path string value      |
| `parent`         | Object  | —           | **yes** | Parent document entity |
| `label`          | String  | —           | —       | Field label            |
| `enrichers`      | String  | ''          | —       | Content enrichers      |
| `autoValidate`   | Boolean | true        | —       | Auto-validate          |
| `allowedPattern` | String  | `[^()\+*%]` | —       | Allowed input chars    |
| `disabled`       | Boolean | —           | —       | Disabled state         |

**Data binding**: `value="{{value}}"` (two-way, path string)

---

### 1.2 Directory Widgets

All directory widgets share `DirectoryWidgetBehavior` which provides:

- `directoryName` (String) — The Nuxeo vocabulary/directory name
- `dbl10n` (Boolean, false) — Use directory-based label localization
- `label` (String)
- `canSelectParent` (Boolean) — Allow parent selection in hierarchical vocabularies
- `readonly` (Boolean, false)
- `idFunction` (Function)
- `errorMessage` (String)
- `format` (Function) — Entry formatter
- `_entries` (Array) — Fetched directory entries

Uses operation: `Directory.SuggestEntries`

#### `<nuxeo-directory-suggestion>`

**Tag**: `nuxeo-directory-suggestion`
**Source**: `ui/widgets/nuxeo-directory-suggestion.js`
**Mixins**: `I18nBehavior`, `FormatBehavior`, `IronFormElementBehavior`, `IronValidatableBehavior`

| Property             | Type     | Default                    | Notify  | Description                      |
| -------------------- | -------- | -------------------------- | ------- | -------------------------------- |
| `directoryName`      | String   | —                          | —       | Nuxeo directory name             |
| `dbl10n`             | Boolean  | false                      | —       | Directory-based l10n             |
| `label`              | String   | —                          | —       | Field label                      |
| `canSelectParent`    | Boolean  | —                          | —       | Allow parent selection           |
| `operation`          | String   | 'Directory.SuggestEntries' | —       | Suggestion operation             |
| `params`             | Object   | —                          | —       | Operation parameters             |
| `value`              | String   | —                          | **yes** | Selected value(s)                |
| `multiple`           | Boolean  | false                      | —       | Multi-select mode                |
| `stayOpenOnSelect`   | Boolean  | false                      | —       | Keep dropdown open               |
| `readonly`           | Boolean  | false                      | —       | Read-only mode                   |
| `idFunction`         | Function | —                          | —       | ID extraction function           |
| `minChars`           | Number   | 3                          | —       | Min chars to trigger suggestions |
| `frequency`          | Number   | —                          | —       | Debounce time in ms              |
| `placeholder`        | String   | —                          | —       | Placeholder text                 |
| `errorMessage`       | String   | —                          | —       | Validation error message         |
| `selectedItems`      | Array    | —                          | **yes** | Selected item objects            |
| `selectedItem`       | Object   | —                          | **yes** | Single selected item             |
| `selectionFormatter` | Function | —                          | —       | Selection display formatter      |
| `separator`          | String   | '/'                        | —       | Hierarchical label separator     |
| `resolveEntry`       | Function | —                          | —       | Entry resolver function          |
| `queryResultsFilter` | Function | —                          | —       | Results filter function          |

**Data binding**: `value="{{value}}"` (two-way)
**Wraps**: `<nuxeo-selectivity>` internally

---

#### `<nuxeo-directory-checkbox>`

**Tag**: `nuxeo-directory-checkbox`
**Source**: `ui/widgets/nuxeo-directory-checkbox.js`
**Mixins**: `DirectoryWidgetBehavior`

| Property                                   | Type  | Default | Notify  | Description            |
| ------------------------------------------ | ----- | ------- | ------- | ---------------------- |
| `selectedItems`                            | Array | —       | **yes** | Selected entry objects |
| `value`                                    | Array | —       | **yes** | Selected entry IDs     |
| _(plus all DirectoryWidgetBehavior props)_ |       |         |         |                        |

**Data binding**: `value="{{value}}"` (two-way, Array of IDs)
**Events**: `directory-entries-loaded` (from behavior), `selected-items-changed`

---

#### `<nuxeo-directory-radio-group>`

**Tag**: `nuxeo-directory-radio-group`
**Source**: `ui/widgets/nuxeo-directory-radio-group.js`
**Mixins**: `DirectoryWidgetBehavior`

| Property                                   | Type   | Default | Notify  | Description           |
| ------------------------------------------ | ------ | ------- | ------- | --------------------- |
| `selectedItem`                             | Object | —       | **yes** | Selected entry object |
| `value`                                    | String | —       | **yes** | Selected entry ID     |
| _(plus all DirectoryWidgetBehavior props)_ |        |         |         |                       |

**Data binding**: `value="{{value}}"` (two-way, single String ID)

---

### 1.3 Suggestion / Picker Widgets

#### `<nuxeo-selectivity>`

**Tag**: `nuxeo-selectivity`
**Source**: `ui/widgets/nuxeo-selectivity.js` (~7400 lines)
**Mixins**: `IronFormElementBehavior`, `IronValidatableBehavior`

The **core suggestion/autocomplete engine** used by most other suggestion widgets. Built on Selectivity.js.

| Key Property          | Type         | Default | Notify  | Description                       |
| --------------------- | ------------ | ------- | ------- | --------------------------------- |
| `label`               | String       | —       | —       | Field label                       |
| `operation`           | String       | —       | —       | Backend operation for suggestions |
| `params`              | Object       | —       | —       | Operation parameters              |
| `value`               | String/Array | —       | **yes** | Selected value(s)                 |
| `multiple`            | Boolean      | false   | —       | Multi-select mode                 |
| `minChars`            | Number       | —       | —       | Min chars to trigger              |
| `frequency`           | Number       | 300     | —       | Debounce in ms                    |
| `placeholder`         | String       | —       | —       | Placeholder                       |
| `errorMessage`        | String       | —       | —       | Error message                     |
| `readonly`            | Boolean      | false   | —       | Read-only mode                    |
| `required`            | Boolean      | false   | —       | Required                          |
| `invalid`             | Boolean      | false   | —       | Invalid state                     |
| `selectedItems`       | Array        | —       | **yes** | Selected item objects             |
| `selectedItem`        | Object       | —       | **yes** | Single selected item              |
| `selectionFormatter`  | Function     | —       | —       | Format selected entries           |
| `resultFormatter`     | Function     | —       | —       | Format dropdown results           |
| `newEntryFormatter`   | Function     | —       | —       | Format new (tagging) entries      |
| `resolveEntry`        | Function     | —       | —       | Resolve entry from value          |
| `initSelection`       | Function     | —       | —       | Initialize selection              |
| `idFunction`          | Function     | —       | —       | ID extraction from item           |
| `queryResultsFilter`  | Function     | —       | —       | Filter results                    |
| `tagging`             | Boolean      | false   | —       | Allow new entries                 |
| `stayOpenOnSelect`    | Boolean      | false   | —       | Keep open after select            |
| `data`                | Array        | —       | —       | Static data items                 |
| `addedEntryHandler`   | Function     | —       | —       | Handler when entry added          |
| `removedEntryHandler` | Function     | —       | —       | Handler when entry removed        |

**Data binding**: `value="{{value}}"` (two-way)
**Events**: `value-changed`, `selected-items-changed`, `selected-item-changed`
**Exported utility**: `escapeHTML()` function

---

#### `<nuxeo-document-suggestion>`

**Tag**: `nuxeo-document-suggestion`
**Source**: `ui/widgets/nuxeo-document-suggestion.js`
**Mixins**: `IronFormElementBehavior`, `IronValidatableBehavior`, `RoutingBehavior`

| Property             | Type     | Default                       | Notify  | Description                                         |
| -------------------- | -------- | ----------------------------- | ------- | --------------------------------------------------- |
| `pageProvider`       | String   | 'default_document_suggestion' | —       | Page provider name                                  |
| `schemas`            | Array    | ['*']                         | —       | Document schemas                                    |
| `repository`         | String   | 'default'                     | —       | Repository name                                     |
| `label`              | String   | —                             | —       | Field label                                         |
| `operation`          | String   | 'Repository.PageProvider'     | —       | Backend operation                                   |
| `params`             | Object   | —                             | —       | Operation parameters                                |
| `value`              | String   | —                             | **yes** | Selected doc UID(s)                                 |
| `multiple`           | Boolean  | false                         | —       | Multi-select mode                                   |
| `stayOpenOnSelect`   | Boolean  | false                         | —       | Keep dropdown open                                  |
| `readonly`           | Boolean  | false                         | —       | Read-only mode                                      |
| `minChars`           | Number   | 3                             | —       | Min chars to trigger                                |
| `frequency`          | Number   | —                             | —       | Debounce time                                       |
| `placeholder`        | String   | —                             | —       | Placeholder text                                    |
| `errorMessage`       | String   | —                             | —       | Error message                                       |
| `selectedItems`      | Array    | —                             | **yes** | Selected doc objects                                |
| `selectedItem`       | Object   | —                             | **yes** | Single selected doc                                 |
| `selectionFormatter` | Function | —                             | —       | Selection display                                   |
| `resultFormatter`    | Function | —                             | —       | Result display                                      |
| `idProperty`         | String   | 'ecm:uuid'                    | —       | Property for ID (`ecm:uuid`, `ecm:path`, or custom) |
| `query`              | String   | null                          | —       | Fixed NXQL query part                               |
| `initSelection`      | Function | —                             | —       | Init selection resolver                             |
| `enrichers`          | String   | ''                            | —       | Content enrichers                                   |
| `headers`            | Object   | null                          | —       | Request headers                                     |
| `queryResultsFilter` | Function | —                             | —       | Filter results                                      |

**Data binding**: `value="{{value}}"` (two-way)
**Wraps**: `<nuxeo-selectivity>` + `<nuxeo-operation op="Document.FetchByProperty">`

---

#### `<nuxeo-user-suggestion>`

**Tag**: `nuxeo-user-suggestion`
**Source**: `ui/widgets/nuxeo-user-suggestion.js`
**Mixins**: `IronFormElementBehavior`, `IronValidatableBehavior`

| Property             | Type     | Default                | Notify  | Description                                     |
| -------------------- | -------- | ---------------------- | ------- | ----------------------------------------------- |
| `searchType`         | String   | 'USER_GROUP_TYPE'      | —       | `USER_TYPE`, `GROUP_TYPE`, or `USER_GROUP_TYPE` |
| `groupRestriction`   | String   | —                      | —       | Restrict to group                               |
| `label`              | String   | —                      | —       | Field label                                     |
| `operation`          | String   | 'UserGroup.Suggestion' | —       | Backend operation                               |
| `params`             | Object   | —                      | —       | Operation parameters                            |
| `value`              | String   | —                      | **yes** | Selected user/group ID(s)                       |
| `multiple`           | Boolean  | false                  | —       | Multi-select mode                               |
| `stayOpenOnSelect`   | Boolean  | false                  | —       | Keep dropdown open                              |
| `readonly`           | Boolean  | false                  | —       | Read-only mode                                  |
| `minChars`           | Number   | 3                      | —       | Min chars to trigger                            |
| `frequency`          | Number   | —                      | —       | Debounce time                                   |
| `placeholder`        | String   | —                      | —       | Placeholder text                                |
| `errorMessage`       | String   | —                      | —       | Error message                                   |
| `selectedItems`      | Array    | —                      | **yes** | Selected user objects                           |
| `selectedItem`       | Object   | —                      | **yes** | Single selected user                            |
| `selectionFormatter` | Function | —                      | —       | Selection display                               |
| `resultFormatter`    | Function | —                      | —       | Result display                                  |
| `resolveEntry`       | Function | —                      | —       | Entry resolver                                  |
| `prefixed`           | Boolean  | —                      | —       | Prefix IDs with `user:` / `group:`              |
| `idFunction`         | Function | —                      | —       | ID extraction                                   |
| `queryResultsFilter` | Function | —                      | —       | Filter results                                  |

**Data binding**: `value="{{value}}"` (two-way)
**Wraps**: `<nuxeo-selectivity>` with `UserGroup.Suggestion`

---

#### `<nuxeo-tag-suggestion>`

**Tag**: `nuxeo-tag-suggestion`
**Source**: `ui/widgets/nuxeo-tag-suggestion.js`
**Mixins**: `I18nBehavior`, `IronFormElementBehavior`, `IronValidatableBehavior`

| Property            | Type     | Default          | Notify  | Description             |
| ------------------- | -------- | ---------------- | ------- | ----------------------- |
| `label`             | String   | —                | —       | Field label             |
| `operation`         | String   | 'Tag.Suggestion' | —       | Backend operation       |
| `params`            | Object   | —                | —       | Operation parameters    |
| `document`          | Object   | —                | —       | Document to tag         |
| `allowNewTags`      | Boolean  | —                | —       | Allow creating new tags |
| `value`             | String   | —                | **yes** | Selected tag(s)         |
| `readonly`          | Boolean  | false            | —       | Read-only mode          |
| `minChars`          | Number   | 1                | —       | Min chars to trigger    |
| `placeholder`       | String   | —                | —       | Placeholder text        |
| `stayOpenOnSelect`  | Boolean  | false            | —       | Keep dropdown open      |
| `errorMessage`      | String   | —                | —       | Error message           |
| `selectedItems`     | Object   | —                | **yes** | Selected tag objects    |
| `resultFormatter`   | Function | —                | —       | Result display          |
| `initSelection`     | Function | —                | —       | Init selection          |
| `newEntryFormatter` | Function | —                | —       | New tag formatter       |
| `addedTagHandler`   | Function | —                | —       | On tag add handler      |
| `removedTagHandler` | Function | —                | —       | On tag remove handler   |

**Data binding**: `value="{{value}}"` (two-way, always `multiple`)
**Operations used**: `Tag.Suggestion`, `Services.TagDocument`, `Services.UntagDocument`

---

### 1.4 Display Widgets

#### `<nuxeo-date>`

**Tag**: `nuxeo-date`
**Source**: `ui/widgets/nuxeo-date.js`
**Mixins**: `I18nBehavior`, `FormatBehavior`

| Property        | Type   | Default | Notify | Description                                    |
| --------------- | ------ | ------- | ------ | ---------------------------------------------- |
| `datetime`      | String | —       | —      | ISO datetime string to display                 |
| `format`        | String | —       | —      | Display format (`'relative'` or moment format) |
| `tooltipFormat` | String | —       | —      | Tooltip format                                 |
| `timezone`      | String | config  | —      | IANA timezone                                  |

**Data binding**: `datetime="[[document.properties.dc:created]]"` (one-way, display only)
**No value output** — read-only display element

---

#### `<nuxeo-tag>`

**Tag**: `nuxeo-tag`
**Source**: `ui/widgets/nuxeo-tag.js`

| Property    | Type    | Default | Notify | Description              |
| ----------- | ------- | ------- | ------ | ------------------------ |
| `icon`      | String  | —       | —      | Icon name `iconset:icon` |
| `uppercase` | Boolean | false   | —      | Uppercase text           |

**Slot**: Default slot for tag text content

---

#### `<nuxeo-tags>`

**Tag**: `nuxeo-tags`
**Source**: `ui/widgets/nuxeo-tags.js`

| Property | Type   | Default | Notify | Description                        |
| -------- | ------ | ------- | ------ | ---------------------------------- |
| `type`   | String | 'tag'   | —      | Type: `'tag'`, `'user'`, `'group'` |
| `items`  | Array  | —       | —      | Array of items to display          |

---

#### `<nuxeo-user-tag>`

**Tag**: `nuxeo-user-tag`
**Source**: `ui/widgets/nuxeo-user-tag.js`
**Mixins**: `RoutingBehavior`

| Property      | Type    | Default | Notify | Description               |
| ------------- | ------- | ------- | ------ | ------------------------- |
| `user`        | Object  | —       | —      | User entity or string     |
| `disabled`    | Boolean | false   | —      | Disable link              |
| `fetchAvatar` | Boolean | false   | —      | Fetch avatar from profile |

---

#### `<nuxeo-user-avatar>`

**Tag**: `nuxeo-user-avatar`
**Source**: `ui/widgets/nuxeo-user-avatar.js`

| Property       | Type    | Default   | Notify | Description               |
| -------------- | ------- | --------- | ------ | ------------------------- |
| `user`         | Object  | —         | —      | User entity or string     |
| `fetchAvatar`  | Boolean | false     | —      | Fetch avatar from profile |
| `height`       | Number  | 48        | —      | Height in px              |
| `width`        | Number  | 48        | —      | Width in px               |
| `textColor`    | String  | '#FFFFFF' | —      | Initials text color       |
| `fontSize`     | Number  | 20        | —      | Font size in px           |
| `fontWeight`   | Number  | 400       | —      | Font weight               |
| `borderRadius` | Number  | 0         | —      | Border radius %           |
| `boxShadow`    | String  | —         | —      | Box shadow                |
| `textShadow`   | String  | —         | —      | Text shadow               |

---

### 1.5 Aggregation Widgets

#### `<nuxeo-checkbox-aggregation>`

**Tag**: `nuxeo-checkbox-aggregation`
**Source**: `ui/nuxeo-aggregation/nuxeo-checkbox-aggregation.js`
**Mixins**: `I18nBehavior`, `AggregationBehavior`

| Property         | Type     | Default | Notify  | Description                         |
| ---------------- | -------- | ------- | ------- | ----------------------------------- |
| `data`           | Object   | —       | —       | Aggregation data from page provider |
| `value`          | Array    | []      | **yes** | Selected bucket keys                |
| `label`          | String   | ''      | —       | Label                               |
| `collapsible`    | Boolean  | false   | —       | Make collapsible                    |
| `opened`         | Boolean  | false   | —       | Expanded state                      |
| `visibleItems`   | Number   | 8       | —       | Visible items when collapsed        |
| `sortByLabel`    | Boolean  | —       | —       | Sort by label vs doc count          |
| `labelFormatter` | Function | —       | —       | Custom label formatter              |

**Data binding**: `data="[[aggregations.dc_created_agg]]"` + `value="{{params.dc_created_agg}}"`

---

#### `<nuxeo-dropdown-aggregation>`

**Tag**: `nuxeo-dropdown-aggregation`
**Source**: `ui/nuxeo-aggregation/nuxeo-dropdown-aggregation.js`
**Mixins**: `I18nBehavior`, `AggregationBehavior`

| Property      | Type   | Default | Notify  | Description         |
| ------------- | ------ | ------- | ------- | ------------------- |
| `data`        | Object | —       | —       | Aggregation data    |
| `value`       | Array  | —       | **yes** | Selected values     |
| `minChars`    | Number | 0       | —       | Min chars to search |
| `placeholder` | String | —       | —       | Placeholder text    |

**Data binding**: Same as checkbox-aggregation, uses `<nuxeo-selectivity>` internally

---

### 1.6 Layout / Container Widgets

#### `<nuxeo-card>`

**Tag**: `nuxeo-card`
**Source**: `ui/widgets/nuxeo-card.js`
**Mixins**: `IronResizableBehavior`

| Property      | Type    | Default | Notify | Description      |
| ------------- | ------- | ------- | ------ | ---------------- |
| `icon`        | String  | null    | —      | Heading icon     |
| `heading`     | String  | null    | —      | Heading text     |
| `collapsible` | Boolean | false   | —      | Make collapsible |
| `opened`      | Boolean | false   | —      | Expanded state   |

**Slot**: Default slot for card content

---

#### `<nuxeo-dialog>`

**Tag**: `nuxeo-dialog`
**Source**: `ui/widgets/nuxeo-dialog.js`
**Mixins**: `PaperDialogBehavior`, `NeonAnimationRunnerBehavior`, `Templatizer`

| Property   | Type    | Default | Notify | Description                          |
| ---------- | ------- | ------- | ------ | ------------------------------------ |
| `reparent` | Boolean | false   | —      | Reparent for stacking context issues |

**Slot**: Default slot; supports `<template>` for lazy stamping
**Events**: `iron-overlay-opened`, `iron-overlay-closed`

---

#### `<nuxeo-sort-select>`

**Tag**: `nuxeo-sort-select`
**Source**: `ui/widgets/nuxeo-sort-select.js`
**Mixins**: `I18nBehavior`

| Property   | Type   | Default | Notify  | Description                                      |
| ---------- | ------ | ------- | ------- | ------------------------------------------------ |
| `options`  | Array  | []      | —       | Sort options `[{label, field, order, selected}]` |
| `selected` | String | —       | **yes** | Selected option                                  |

**Events**: `sort-order-changed` with `detail.sort`

---

#### `<nuxeo-data-table-form>`

**Tag**: `nuxeo-data-table-form`
**Source**: `ui/nuxeo-data-table/nuxeo-data-table-form.js`
**Mixins**: `Templatizer`, `I18nBehavior`

| Property | Type   | Default | Notify  | Description          |
| -------- | ------ | ------- | ------- | -------------------- |
| `item`   | Object | —       | **yes** | Row item data        |
| `slot`   | String | 'form'  | —       | Slot name (readonly) |
| `index`  | Number | —       | —       | Row index            |

---

### 1.7 Utility Widgets

#### `<nuxeo-user-group-formatter>`

**Tag**: `nuxeo-user-group-formatter`
**Source**: `ui/widgets/nuxeo-user-group-formatter.js`
Used internally by `nuxeo-user-suggestion` to render user/group results.

---

#### `<nuxeo-tooltip>`

**Tag**: `nuxeo-tooltip`
**Source**: `ui/widgets/nuxeo-tooltip.js`
Tooltip component used across many widgets.

---

#### `<nuxeo-operation-button>`

**Tag**: `nuxeo-operation-button`
**Source**: `ui/widgets/nuxeo-operation-button.js`
Button that executes a Nuxeo operation on click.

---

#### `<nuxeo-actions-menu>`

**Tag**: `nuxeo-actions-menu`
**Source**: `ui/widgets/nuxeo-actions-menu.js`
Responsive actions menu with overflow handling.

---

## 2. nuxeo-layout & nuxeo-document-layout

### 2.1 `<nuxeo-layout>` — Low-Level Layout Stamper

**Tag**: `nuxeo-layout`
**Source**: `ui/nuxeo-layout.js`
**Mixins**: `IronResizableBehavior`

This is the **core layout-stamping element**. It dynamically imports an HTML file and stamps the element defined within.

| Property  | Type   | Default                 | Notify             | Description                              |
| --------- | ------ | ----------------------- | ------------------ | ---------------------------------------- |
| `href`    | String | —                       | —                  | URL of the layout HTML to import         |
| `model`   | Object | `{}`                    | —                  | Properties to set on the stamped element |
| `error`   | String | 'Failed to find layout' | —                  | Error message if import fails            |
| `element` | Object | —                       | **yes** (readOnly) | The stamped DOM element                  |

#### How It Works

1. **`href` is set** — triggers `_stamp(href)`
2. **Imports the HTML file** using `importHref(href, successCallback, errorCallback)`
3. **Infers element name** from filename: `nuxeo-file-edit-layout.html` → creates `<nuxeo-file-edit-layout>`
4. **Creates the element** with `document.createElement(name)`
5. **Appends to `#container`** div (replaces existing child if present)
6. **Sets `element` property** (read-only, notifying)
7. **Applies `model`** — iterates `Object.keys(model)` and sets each property on the element

#### Key Methods

- **`validate()`** — Walks the layout's shadow DOM to find all elements with `validate()` or `checkValidity()` methods and validates them. Also calls `element.validate()` if available.
- **`_getBoundElements(property)`** — Introspects Polymer template bindings to find widgets bound to a specific property path (used for validation error reporting).

---

### 2.2 `<nuxeo-document-layout>` — Convention-Based Document Layout Resolver

**Tag**: `nuxeo-document-layout`
**Source**: `ui/nuxeo-document-layout.js`
**Mixins**: `I18nBehavior`

This is the **high-level element** that resolves and stamps document layouts **by convention**.

| Property       | Type     | Default                                                           | Notify  | Description                                               |
| -------------- | -------- | ----------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| `document`     | Object   | —                                                                 | **yes** | The Nuxeo document entity                                 |
| `layout`       | String   | 'view'                                                            | —       | Layout mode: `'view'`, `'edit'`, `'create'`, `'metadata'` |
| `hrefTemplate` | String   | `'${document.type}/nuxeo-${document.type}-${layout}-layout.html'` | —       | Template for building the href                            |
| `hrefBase`     | String   | ''                                                                | —       | Base URL for resolving the layout                         |
| `hrefFunction` | Function | computed                                                          | —       | Function built from `hrefTemplate`                        |

#### Layout Resolution Convention

The **default `hrefTemplate`** is:

```
${document.type}/nuxeo-${document.type}-${layout}-layout.html
```

For a document of type `File` in `edit` mode, this resolves to:

```
file/nuxeo-file-edit-layout.html
```

The full path is built by concatenating `hrefBase` (or the parent element's `importPath`) with the resolved template:

```
<hrefBase>/file/nuxeo-file-edit-layout.html
```

#### Resolution Process

1. **Observer `_loadLayout(document, layout, hrefFunction, hrefBase)`** triggers when document/layout change
2. If document UID changed → resets `_href` to null (forces re-stamp)
3. Sets `_model = { document }` — this is what gets passed to the layout element
4. Builds base from `hrefBase` or `importPath`
5. Builds full path: `base + '/' + hrefFunction(document, layout)`
6. Sets `_href` which triggers `<nuxeo-layout>` to import and stamp

#### Model Passed to Layouts

```javascript
{ document: <the-document-entity> }
```

The layout element receives `this.document` as a property. Layouts bind to document fields using:

```html
<nuxeo-input value="{{document.properties.dc:title}}"></nuxeo-input>
```

#### Events

- **`document-layout-changed`** — Fired after layout is stamped. Detail: `{ element, layout }`
- **`document-changed`** — Forwarded from the layout element (path change events)

#### Validation

- **`validate()`** — Delegates to `<nuxeo-layout>.validate()`
- **`reportValidation(validationReport)`** — Maps server-side validation violations to layout widgets. Finds bound elements using `_getBoundElements('document.properties.<field>')` and marks them invalid.

#### Layout Naming Examples

| Doc Type | Mode     | Resolved Element Name        | File Path                                |
| -------- | -------- | ---------------------------- | ---------------------------------------- |
| File     | view     | `nuxeo-file-view-layout`     | `file/nuxeo-file-view-layout.html`       |
| File     | edit     | `nuxeo-file-edit-layout`     | `file/nuxeo-file-edit-layout.html`       |
| File     | metadata | `nuxeo-file-metadata-layout` | `file/nuxeo-file-metadata-layout.html`   |
| Note     | create   | `nuxeo-note-create-layout`   | `note/nuxeo-note-create-layout.html`     |
| Picture  | view     | `nuxeo-picture-view-layout`  | `picture/nuxeo-picture-view-layout.html` |

---

## 3. nuxeo-layout-behavior

**Source**: `ui/nuxeo-layout-behavior.js`

The `LayoutBehavior` is a **Polymer behavior bundle** that all layout elements should apply. It composes:

```javascript
export const LayoutBehavior = [RoutingBehavior, FiltersBehavior, FormatBehavior];
```

This provides layout elements with:

- **`RoutingBehavior`** — `urlFor()` method for generating Nuxeo URLs
- **`FiltersBehavior`** — Document filtering utilities (`hasPermission`, `hasType`, `hasFacet`, etc.)
- **`FormatBehavior`** — Formatting utilities (`formatDate`, `formatDirectory`, `formatSize`, etc.) + `I18nBehavior` (i18n translation via `this.i18n()`)

---

## 4. nuxeo-slot & nuxeo-slot-content

**Source**: `ui/nuxeo-slots.js`

The slot system provides a **pluggable extension point mechanism** for Nuxeo Web UI.

### 4.1 `<nuxeo-slot>` — The Slot Target

**Tag**: `nuxeo-slot`

| Property | Type    | Default | Notify  | Description                                     |
| -------- | ------- | ------- | ------- | ----------------------------------------------- |
| `name`   | String  | —       | —       | Unique slot name (the extension point ID)       |
| `slot`   | String  | —       | —       | **Deprecated**, use `name`                      |
| `model`  | Object  | `{}`    | —       | Key/value properties to pass to stamped content |
| `empty`  | Boolean | false   | **yes** | Whether the slot has no content                 |

### 4.2 `<nuxeo-slot-content>` — Content Registration

**Tag**: `nuxeo-slot-content`

| Property   | Type    | Default | Notify | Description                                    |
| ---------- | ------- | ------- | ------ | ---------------------------------------------- |
| `slot`     | String  | ''      | —      | Target slot name(s), comma-separated           |
| `disabled` | Boolean | false   | —      | Dynamically enable/disable content             |
| `order`    | Number  | 0       | —      | Controls display ordering (lower = first)      |
| `priority` | Number  | 0       | —      | Controls merge/override priority (higher wins) |

Content must contain a `<template>` child (except when `disabled=true`).

### 4.3 How the Slot System Works

#### Global Registry

There is a **global `REGISTRY` object** that maps slot names to their registered content nodes and slot instances:

```javascript
const REGISTRY = {};
// Structure: { 'SLOT_NAME': { nodes: [SlotContent, ...], slots: [Slot, ...] } }
```

#### Registration Flow

1. A `<nuxeo-slot-content slot="MY_SLOT">` element connects to the DOM
2. `_register()` is called → `_registerContent(this, slot)` adds it to the global registry
3. If content with the **same `name` attribute** exists:
   - If new content has **equal or higher `priority`** → overrides (or merges if no template)
   - If lower priority → ignored
4. Registry nodes are **sorted by `order`** property
5. All `<nuxeo-slot name="MY_SLOT">` instances are notified to re-render

#### Rendering Flow

When a `<nuxeo-slot>` renders:

1. Clears previous instances
2. Iterates registered content nodes for its name
3. For each **non-disabled** node with a template:
   - **Templatizes** the template using Polymer's `templatize()`
   - Creates an instance and sets properties from:
     - `sharedModel` (global model via `window.nuxeo.slots.setSharedModel()`)
     - `this.model` (slot-specific model)
   - Inserts the stamped content **before the `<nuxeo-slot>` element** in the parent DOM (or in the assigned slot's parent for native slot scenarios)

#### Shared Model API

```javascript
window.nuxeo.slots.setSharedModel({ user: currentUser, document: currentDoc });
```

This propagates to ALL slot instances globally, re-rendering their content with the new model values.

#### Override / Disable Pattern

To **override** existing slot content:

```html
<!-- Original contribution (from nuxeo-web-ui or plugin) -->
<nuxeo-slot-content name="myAction" slot="DOCUMENT_ACTIONS" order="10">
  <template><my-original-action></my-original-action></template>
</nuxeo-slot-content>

<!-- Override with higher priority -->
<nuxeo-slot-content name="myAction" slot="DOCUMENT_ACTIONS" priority="100">
  <template><my-custom-action></my-custom-action></template>
</nuxeo-slot-content>

<!-- Disable entirely -->
<nuxeo-slot-content name="myAction" slot="DOCUMENT_ACTIONS" disabled priority="100">
</nuxeo-slot-content>
```

#### Multi-Slot Registration

A single content can register in multiple slots:

```html
<nuxeo-slot-content slot="SLOT_A,SLOT_B" name="sharedContent">
  <template>...</template>
</nuxeo-slot-content>
```

---

## 5. Data Binding Patterns Summary

### Two-Way Binding (Form Widgets)

All form input widgets use `notify: true` on their value property, enabling Polymer two-way binding:

```html
<!-- In a layout template -->
<nuxeo-input label="Title" value="{{document.properties.dc:title}}"></nuxeo-input>
<nuxeo-textarea label="Description" value="{{document.properties.dc:description}}"></nuxeo-textarea>
<nuxeo-date-picker label="Issued" value="{{document.properties.dc:issued}}"></nuxeo-date-picker>
<nuxeo-select
  label="Nature"
  options="[[natures]]"
  selected="{{document.properties.dc:nature}}"
></nuxeo-select>
<nuxeo-directory-suggestion
  directory-name="l10nsubjects"
  value="{{document.properties.dc:subjects}}"
  multiple
></nuxeo-directory-suggestion>
<nuxeo-user-suggestion
  value="{{document.properties.dc:contributors}}"
  multiple
></nuxeo-user-suggestion>
<nuxeo-file value="{{document.properties.file:content}}"></nuxeo-file>
```

### One-Way Binding (Display Widgets)

```html
<nuxeo-date datetime="[[document.properties.dc:created]]"></nuxeo-date>
<nuxeo-user-tag user="[[document.properties.dc:creator]]"></nuxeo-user-tag>
<nuxeo-tags items="[[document.contextParameters.tags]]"></nuxeo-tags>
```

### Key Binding Properties by Widget

| Widget                        | Primary Binding Property | Type          | Direction      |
| ----------------------------- | ------------------------ | ------------- | -------------- |
| `nuxeo-input`                 | `value`                  | String        | two-way `{{}}` |
| `nuxeo-textarea`              | `value`                  | String        | two-way `{{}}` |
| `nuxeo-select`                | `selected`               | String        | two-way `{{}}` |
| `nuxeo-date-picker`           | `value`                  | String (ISO)  | two-way `{{}}` |
| `nuxeo-html-editor`           | `value`                  | String (HTML) | two-way `{{}}` |
| `nuxeo-file`                  | `value`                  | Object (Blob) | two-way `{{}}` |
| `nuxeo-directory-suggestion`  | `value`                  | String/Array  | two-way `{{}}` |
| `nuxeo-directory-checkbox`    | `value`                  | Array         | two-way `{{}}` |
| `nuxeo-directory-radio-group` | `value`                  | String        | two-way `{{}}` |
| `nuxeo-document-suggestion`   | `value`                  | String/Array  | two-way `{{}}` |
| `nuxeo-user-suggestion`       | `value`                  | String/Array  | two-way `{{}}` |
| `nuxeo-tag-suggestion`        | `value`                  | Array         | two-way `{{}}` |
| `nuxeo-path-suggestion`       | `value`                  | String        | two-way `{{}}` |
| `nuxeo-selectivity`           | `value`                  | String/Array  | two-way `{{}}` |
| `nuxeo-checkbox-aggregation`  | `value`                  | Array         | two-way `{{}}` |
| `nuxeo-dropdown-aggregation`  | `value`                  | Array         | two-way `{{}}` |
| `nuxeo-checkmark`             | `checked`                | Boolean       | attribute      |
| `nuxeo-date`                  | `datetime`               | String        | one-way `[[]]` |
| `nuxeo-tag`                   | _(slot content)_         | —             | one-way        |
| `nuxeo-user-tag`              | `user`                   | Object        | one-way `[[]]` |

---

## 6. Widget-to-Schema Field Mapping Conventions

In Studio Designer and Nuxeo layouts, widgets map to document schema fields via a `field` attribute and Polymer two-way binding:

```html
<!-- The field attribute + value binding is the canonical pattern -->
<nuxeo-input
  field="dc:title"
  value="{{document.properties.dc:title}}"
  label="[[i18n('label.dublincore.title')]]"
>
</nuxeo-input>
```

The `field` attribute is used by `nuxeo-layout._getBoundElements(property)` to locate widgets bound to specific document properties for validation error reporting.

### Common Schema-to-Widget Mappings

| Nuxeo Field Type               | Recommended Widget                                            | Notes                   |
| ------------------------------ | ------------------------------------------------------------- | ----------------------- |
| `string`                       | `nuxeo-input`                                                 | type="text"             |
| `string` (long)                | `nuxeo-textarea`                                              | Multi-line text         |
| `integer` / `long`             | `nuxeo-input`                                                 | type="number"           |
| `double` / `float`             | `nuxeo-input`                                                 | type="number" with step |
| `date`                         | `nuxeo-date-picker`                                           | ISO datetime value      |
| `boolean`                      | `nuxeo-checkmark` or `paper-checkbox`                         |                         |
| `string[]` (vocabulary)        | `nuxeo-directory-suggestion`                                  | multiple=true           |
| `string` (vocabulary)          | `nuxeo-directory-suggestion` or `nuxeo-directory-radio-group` | Single select           |
| `string[]` (vocabulary, small) | `nuxeo-directory-checkbox`                                    | Checkbox group          |
| `string` (user/group)          | `nuxeo-user-suggestion`                                       |                         |
| `string[]` (users/groups)      | `nuxeo-user-suggestion`                                       | multiple=true           |
| `string` (document ref)        | `nuxeo-document-suggestion`                                   |                         |
| `blob`                         | `nuxeo-file`                                                  | File upload             |
| `blob[]`                       | `nuxeo-file`                                                  | multiple=true           |
| `string` (rich text / HTML)    | `nuxeo-html-editor`                                           | Quill-based editor      |
| `string[]` (tags)              | `nuxeo-tag-suggestion`                                        | With allowNewTags       |
| `string` (path)                | `nuxeo-path-suggestion`                                       | Path autocomplete       |
| `string` (select from list)    | `nuxeo-select`                                                | Static options          |
