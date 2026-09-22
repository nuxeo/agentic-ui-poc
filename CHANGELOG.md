# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed — BREAKING (`@nuxeo-satori/platform/nuxeo-client`)

Four exported functions gained a **required** `locale: string` parameter. Each previously
formatted dates with a hardcoded `'en-US'` or with a bare `toLocaleDateString()`/`toLocaleString()`,
so the date a user saw came from the machine rather than from the language they chose.

- `buildDocumentCompareSections(left, right, viewAll, locale)`
- `formatCompareDate(value, locale)`
- `principalPermissionTimeFrameLabel(row, translate, locale)`
- `principalPermissionToLocalRow(row, translate, locale)`

The parameter is required rather than defaulted on purpose. A default that supplies the host
locale is what let the original bug survive: it makes every un-updated call site a silent no-op
instead of a compile error. Callers should pass Angular's `LOCALE_ID`:

```ts
private readonly locale = inject(LOCALE_ID);
```

### Removed — BREAKING (`@nuxeo-satori/platform/nuxeo-client`)

- `buildDocumentCompareRows` — deprecated, and superseded by `buildDocumentCompareSections`,
  which returns the same rows grouped by section. To migrate:
  `buildDocumentCompareSections(left, right, viewAll, locale).flatMap((s) => s.fields)`.

### Added (`@nuxeo-satori/platform/nuxeo-client`)

- `formatAceDateRange(begin, end, translate, locale)` — one implementation of the ACE date-range
  label previously duplicated across the document, collection and browse permission tables.
- `permissionRightLabel(permission, translate)` — maps a Nuxeo permission identifier to its
  display label, replacing three hardcoded English `Record<string, string>` copies. Unknown
  permissions (for example from a marketplace package) still render their raw Nuxeo name.

### Fixed

- Permission tables, browse columns, the expired-documents drawer, task due dates and the
  document-compare dialog now format dates in the user's selected language. Every remaining
  `toLocaleDateString('en-US')` and bare `toLocaleDateString()` in application code is gone;
  `LOCALE_ID` is the single source. Verify with:

  ```bash
  grep -rn --include='*.ts' -E "toLocale(Date|Time)?String\('en-US'|toLocale(Date|Time)?String\(\)" apps libs | grep -v '\.spec\.'
  ```

- ACE time frames no longer build their text by interpolation (`from ${begin} to ${end}`).
  A string assembled at runtime has no catalogue entry, so no translation could reach it; these
  now resolve the `permissions.time-frame.*` keys, which already existed in `en.json` and were
  unused.
- The Clipboard navigation item's accessible name and the `hxp-document-cards` selection
  checkbox label are translated rather than concatenated (INFO-144).
