# Satori UI — consumer report and API requests from the Nuxeo Agentic UI team

**From:** Nuxeo Agentic UI team (Nuxeo Satori)
**Against:** `@hylandsoftware/satori-ui` **0.1.5**, with Angular 19.2 and Angular Material 19.2
**Date:** 6 August 2026

## Why you are getting this

We build the Nuxeo Satori application — an Angular ECM and DAM UI — entirely on Satori. While hardening our Satori overrides we catalogued every place the app had to reach past the public API into Satori's internal DOM and CSS. Each one is a liability for us on your next release, and each one is a gap on your side that some other consumer will hit too.

This is that list: seven items, in priority order, each with what we needed, what we had to do instead, and what we are asking for. Every item is reproducible on 0.1.5 as shipped. Nothing here needs a follow-up conversation before you can act on it, but we are happy to raise PRs for any of them if that is welcome.

Item 6 is an accessibility defect rather than a missing API, and item 7 affects every consumer of `sat.theme` whether they have noticed or not. Those two we would flag as the ones to fix regardless of what you do with the rest.

---

## 1. `sat-app-header` needs a search or general content slot

**Priority: highest.** This one silently deleted a core feature from our small-viewport users.

### What we need

Global search lives in the application header. That is standard for a content application, and it is what our design specifies.

### What Satori provides

`sat-app-header` exposes four content slots: `satAppHeaderLogo`, `satAppHeaderTitle`, `satAppHeaderNavigation` and `satAppHeaderActions`. None of them is for content between the title and the trailing action buttons, which is where a search box belongs.

### What we did, and how it failed

We initially projected the search box through `satAppHeaderLogo`, because that slot sits in the trailing cluster and was the closest fit.

`satAppHeaderLogo` carries `display: none` below a 619px viewport width. That is entirely reasonable for a word mark. It is not reasonable for a search box — and because the rule lives inside Satori and applies to the slot rather than to our content, **the global search box vanished completely on any viewport under 619px, with no error, no warning, and nothing in our own code to point at.** It took a narrow-window test to find it.

We have since moved search into `satAppHeaderActions` and used `order` to push the word mark back to the far right (see item 2's neighbouring override). That works, but it means the actions slot now holds both a control and a layout responsibility it was not designed for, and we are relying on the trailing container being `display: flex` for the reordering to hold.

### What we are asking for

A first-class slot for header content — either a specific `satAppHeaderSearch` or a general-purpose content slot — positioned between the title and the trailing actions, with its own responsive behaviour rather than the logo's.

If a general slot is preferred, please make its small-viewport behaviour configurable rather than fixed, since "collapse to an icon" and "stay visible" are both legitimate for search.

---

## 2. `.sat-app-header-leading-container` and `.sat-app-header-trailing-container` need `min-width: 0`

### The problem

`.sat-app-header-content` is a `nowrap` flex row with those two containers as its flex children. Flex items default to `min-width: auto`, which means a child will not shrink below its content's intrinsic width.

So when the page title is long — and in an ECM product the title is a user-supplied document name, so it is routinely long — the leading container refuses to shrink and pushes the entire trailing cluster (search, word mark, settings and AI buttons) off the right edge of the screen. The title does not ellipsise. The buttons simply become unreachable.

### Reproduction

Render `sat-app-header` with a `satAppHeaderTitle` containing roughly 80 characters and any content in `satAppHeaderActions`, at a 1280px viewport. The trailing content is pushed out of view.

### Our workaround

```scss
html sat-app-header .sat-app-header-leading-container {
  flex: 0 1 auto;
  min-width: 0;
}

html sat-app-header .sat-app-header-trailing-container {
  flex: 1 1 auto;
  justify-content: flex-end;
  min-width: 0;
}
```

Both selectors target internal class names, so a rename in your next release reintroduces the bug silently. (The `html` prefix is there because Satori components use `ViewEncapsulation.None` and Angular appends their `<style>` tags after our global stylesheet, so a specificity tie loses. That is a general note, not a complaint.)

### What we are asking for

Ship `min-width: 0` on both containers as a Satori default. There is currently neither an input nor a token that lets a consumer do this through public API, and we cannot think of a case where the current behaviour is preferable to ellipsising the title.

This affects every consumer that shows a user-generated title in the header, which we would expect to be most of them.

---

## 3. `sat-breadcrumbs` needs a separator API

### The problem

The separator is a hard-coded `chevron_right` `<mat-icon>` inside the component template. There is no input to change it and no token to restyle it.

Our design calls for a lightweight `›` text separator rather than a Material icon.

### Our workaround

Hide Satori's icon and paint our own with a pseudo-element:

```scss
html sat-breadcrumbs .sat-breadcrumbs-chevron {
  display: none;
}

html sat-breadcrumbs .sat-breadcrumbs-list li:not(:last-child)::after {
  content: '›';
  margin-left: 4px;
  color: currentcolor;
  opacity: 0.75;
  line-height: 1;
}
```

This depends on two internal class names. If `.sat-breadcrumbs-chevron` is renamed we get both separators and breadcrumbs read `Home ›› Documents`, which is at least loud enough to catch in review. If `.sat-breadcrumbs-list` is renamed our separator disappears and the crumbs run together, which is much quieter.

### What we are asking for

Either a `separator` input on `sat-breadcrumbs` accepting a string or a template, or a `--sat-breadcrumbs-separator` content token. Either would let us delete both rules.

---

## 4. `sat-category-tag` and `sat-status-tag` colours are unreachable except through `!important`

### The problem

Both components bind colour inline on the host:

```html
[style.backgroundColor]="..." [style.color]="..."
```

An inline style beats every stylesheet rule that is not `!important`. So a consumer who wants different tag colours has exactly two options: match your palette exactly, or write `!important`. There is no third option, including no token-based one.

The frustrating part is that **the tokens already exist.** `--sat-tag-*-container` is defined in your theme files and is simply bypassed by the inline bindings. We are able to style tag shape and label typography cleanly through `--sat-tag-corner`, `--sat-tag-label-size`, `--sat-tag-label-weight` and `--sat-tag-label-line-height` — colour is the one axis that does not work the same way.

### Our workaround

```scss
html .sat-tag {
  background: var(--mat-sys-surface-container-high, #eef0f4) !important;
  color: var(--mat-sys-on-surface-variant, #5c5f6b) !important;
  /* … */
}
```

This has a real cost for us beyond the `!important`: because our override is a single flat rule and the semantic distinction lived only in the inline colours, `status="important-loud"`, `status="success"` and every `category="…"` value now render as an identical grey pill in our application. We know that, we have flagged it internally as a product question, and we would rather not have to solve it with a per-variant `!important` cascade.

### What we are asking for

Drive tag colours from the existing `--sat-tag-*-container` tokens instead of inline style bindings. Consumers who want your defaults get them unchanged; consumers who want their own palette get it by setting tokens, and semantic variants survive a consumer restyle.

---

## 5. `sat-platform-nav-list-item` has no badge or indicator API

### What we need

An unread or pending count on a navigation item — in our case, the number of documents in the user's clipboard. This is a common enough pattern that we would expect it in a platform navigation component.

### What we did

Painted it as an `::after` pseudo-element on the icon wrapper, fed by a CSS custom property the shell sets per item:

```scss
html sat-platform-nav-list-item.nav-item--clipboard-badge .sat-platform-nav-icon::after {
  content: var(--nav-clipboard-count);
  position: absolute;
  /* bubble styling … */
}
```

Two fragilities. It depends on `.sat-platform-nav-icon`, an internal class. And it depends on that element **not** having an `::after` of its own — if a future Satori release adds one, ours wins and yours vanishes, which is a genuinely nasty way for an upgrade to break.

We do keep the count in the item's `aria-label`, so screen-reader users are unaffected if the badge disappears. That is our mitigation, not a fix.

### What we are asking for

A `badge` input on `sat-platform-nav-list-item` — a number or short string, with the component owning placement, colour and overflow ("99+") behaviour.

---

## 6. `.sat-platform-nav-list` only scrolls on `:hover` — accessibility defect

**This one is a bug rather than a missing API, and we would ask you to treat it as such.**

### The problem

Vertical scrolling on the platform navigation list is enabled only under a `:hover` selector. On any viewport where the navigation items exceed the available height, that means:

- **Touch devices cannot reach items below the fold at all.** There is no hover state to trigger.
- **Keyboard-only users cannot either.** Tabbing to an item below the fold does not bring it into view, because the container is not scrollable until a pointer enters it.

On a desktop browser with a mouse it looks fine, which is presumably why it has survived. It is a WCAG 2.1 problem — content is present in the DOM and operable only through a pointer.

### Reproduction

Render `sat-platform-nav` with enough items to overflow the viewport height, then open it on a touch device or navigate it with the keyboard only. Items below the fold are unreachable.

### Our workaround

```scss
html sat-platform-nav .sat-platform-nav-list,
html sat-platform-nav .sat-platform-nav-list:hover {
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
```

We hide the scrollbar to preserve your visual design; the scrollability itself is unconditional.

### What we are asking for

Make `overflow-y: auto` unconditional on `.sat-platform-nav-list` and use `:hover` only to reveal the scrollbar affordance, if the hidden-until-hover scrollbar is the intended design. We will delete our override the day this lands.

---

## 7. `mat.typography-hierarchy` bundled inside `sat.theme` outranks Satori's own component typography

**This affects every consumer who follows your documented usage, and most of them will not have noticed.**

### The problem

`sat.theme` emits `mat.typography-hierarchy`, which produces element-level rules such as `.mat-typography h2` and `.mat-typography p`.

Those rules land under whatever selector wraps the `@include`. The documented usage is to include the theme under a selector — which is exactly what a consumer must do to support more than one theme. So a perfectly ordinary setup like:

```scss
html[data-app-theme='nuxeo'] {
  @include sat.theme;
}
```

produces `html[data-app-theme='nuxeo'] .mat-typography h2` at specificity **0-2-2**.

Satori's own component typography, meanwhile, is written as things like `sat-platform-nav h2.sat-platform-nav-title` — specificity **0-1-2**.

Your rule loses to Material's. **Satori components silently lose their own type scale in every consuming application that themes under a selector**, and the more themes a consumer supports the more certain this is to happen. We found it by noticing our platform nav title was the wrong size, then discovering the same thing had happened to several other components; each casualty had been patched back by hand before anyone understood the common cause.

### Our workaround

Wrap every theme selector in `:where()`, which contributes zero specificity:

```scss
:where(html[data-app-theme='nuxeo']),
:where(html:not([data-app-theme])) {
  color-scheme: light dark;
  @include sat.theme;
}
```

The Material rules now score 0-1-1, Satori's component typography wins, and every Satori component — including ones we have not looked at yet — keeps its own type scale with no downstream patching. Our themes are mutually exclusive on `html`, so dropping to zero specificity costs us nothing.

We are content with this workaround, but it is a non-obvious trick that every consumer would have to independently discover, and it only works because our theme selectors happen to be mutually exclusive. A consumer who needs their theme selector to actually carry specificity cannot use it.

### What we are asking for

Either:

- emit the Material typography hierarchy at zero specificity from inside `sat.theme` — for example by wrapping it in `:where()` at the source, so it cannot outrank component-level rules regardless of how a consumer nests the include; or
- expose an opt-out flag (`$include-typography-hierarchy: false` or similar) so consumers can include the hierarchy themselves, at a specificity they control.

The first is better, because it fixes the problem for consumers who have not yet realised they have it.

---

## Summary

| #   | Component / API                       | Ask                                                                   | Type              |
| --- | ------------------------------------- | --------------------------------------------------------------------- | ----------------- |
| 1   | `sat-app-header`                      | A search or general content slot between title and trailing actions   | New API           |
| 2   | `.sat-app-header-*-container`         | `min-width: 0` as a default                                           | Default fix       |
| 3   | `sat-breadcrumbs`                     | `separator` input or content token                                    | New API           |
| 4   | `sat-category-tag` / `sat-status-tag` | Drive colour from `--sat-tag-*-container` instead of inline styles    | Token plumbing    |
| 5   | `sat-platform-nav-list-item`          | `badge` input                                                         | New API           |
| 6   | `.sat-platform-nav-list`              | Unconditional `overflow-y: auto`                                      | **Accessibility** |
| 7   | `sat.theme`                           | Emit `mat.typography-hierarchy` at zero specificity, or allow opt-out | **Defect**        |

Every override described above lives in one annotated file on our side — `apps/nuxeo-ui/src/styles/_satori-overrides.scss` — with each block recording what Satori internal it depends on, what breaks when that internal moves, and what to check on a Satori upgrade. We are happy to share that file, walk through any item, or raise PRs.
