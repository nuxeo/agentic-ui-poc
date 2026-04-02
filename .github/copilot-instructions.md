# Copilot Code Review Instructions

When reviewing pull requests in this Angular 19 + Nx monorepo, enforce the following conventions.

## Architecture

- **Shared code lives in `libs/shared/`**. Feature libs must NOT define their own copies of constants, models, or utilities that already exist in `@agentic-ui/shared/nuxeo-client` or `@agentic-ui/shared/ui`.
- **`NuxeoApiBase`** is a thin HTTP wrapper. Domain-specific API methods (e.g. `fetchThumbnail`, `removeFromFavorites`) belong in their respective services (`DocumentDetailService`, `CollectionService`, etc.) — never in `NuxeoApiBase`.
- If a constant or utility (like `DOC_TYPE_ICONS` or `docTypeIcon`) is duplicated across feature libraries, flag it and recommend importing from the shared library.

## Angular / TypeScript

- **No unused imports or injections.** Every `inject()` call must be referenced in the class.
- **Route param handling:** Components that read route params must subscribe to `ActivatedRoute.paramMap` — never use `.snapshot.paramMap` if the component can be reused across navigations.
- **State reset on route change:** When route params change, all component signals and boolean flags (loaded, error, etc.) must be reset before loading new data.
- **Error recovery:** Boolean "loaded" flags must be reset to `false` on error so the user can retry.

## Templates / Accessibility

- **Never use `<div (click)="...">` for interactive elements.** Use `<button type="button">` or `<a>` instead. This is critical for keyboard navigation and screen readers.
- When styling a `<button>` as a custom card or row, include reset styles: `border: none; background: none; font: inherit; text-align: left; width: 100%`.

## CSS / Layout

- Flex containers with text truncation (`text-overflow: ellipsis`) must have `flex: 1` and `min-width: 0` on the text element. Without `min-width: 0`, flex items won't shrink below their content size and ellipsis won't work.

## General

- No `console.log` in production code (only `console.warn` and `console.error` are allowed).
- Use strict equality (`===`) everywhere.
- No duplicate imports from the same module.
