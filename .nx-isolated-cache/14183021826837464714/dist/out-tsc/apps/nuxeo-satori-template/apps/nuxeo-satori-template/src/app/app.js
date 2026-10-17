import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { AppExtensionsService, EXTENSION_SLOTS, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import { SignInComponent } from './pages/sign-in/sign-in';
import { TemplateSessionService } from './template-session.service';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
function App_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 8);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", item_r1.path);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", item_r1.label, " ");
} }
function App_ForEmpty_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 4);
    i0.ɵɵtext(1, "No navigation entries registered.");
    i0.ɵɵelementEnd();
} }
function App_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "p", 9);
    i0.ɵɵtext(2, " Signed in as ");
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "p", 10);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 11);
    i0.ɵɵlistener("click", function App_Conditional_8_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.signOut()); });
    i0.ɵɵtext(8, "Sign out");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.username());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Layer 1 manifest: ", ctx_r2.manifestSource());
} }
function App_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" Manifest references ", ctx_r2.missingLayers().length, " extension layer(s) that did not resolve: ", ctx_r2.missingLayers().join(", "), " ");
} }
function App_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const route_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" Manifest route ", route_r4.id, " was not registered: ", route_r4.reason, " ");
} }
function App_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "router-outlet");
} }
function App_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-sign-in");
} }
/**
 * The template shell.
 *
 * The navigation is **resolved from the extension registry**, not written here.
 * That is the single most important line in the template: it is what makes the
 * nav addressable, so a manifest can hide, reorder, relabel or add an entry with
 * no change to this component.
 *
 * It calls `AppExtensionsService.resolve()` directly rather than injecting
 * `APP_NAV_ITEMS`. That token's factory registers the *product's* own nav entries
 * as a side effect of being injected, which would point a fork at routes it does
 * not have.
 *
 * The brand comes from Layer 0. It used to be the literal string "Nuxeo Satori"
 * in the template, which quietly weakened the whole rebrand claim: `bootstrap.json`
 * carried `branding.applicationTitle`, the browser tab honoured it, and the one
 * place a viewer actually looks did not.
 */
export class App {
    extensions = inject(AppExtensionsService);
    ruleContext = inject(ExtensionRuleContextService);
    config = inject(AppConfigService);
    session = inject(TemplateSessionService);
    brand = computed(() => this.config.bootstrap().branding.applicationTitle, ...(ngDevMode ? [{ debugName: "brand" }] : []));
    signedIn = this.session.isSignedIn;
    username = this.session.username;
    /**
     * A `computed`, not a field, because both halves change after construction:
     * the manifest lands asynchronously, and rule results depend on the rule
     * context, which tracks the signed-in user and the current route.
     */
    navItems = computed(() => this.extensions.resolve(EXTENSION_SLOTS.navbar, this.ruleContext.context()), ...(ngDevMode ? [{ debugName: "navItems" }] : []));
    /** Surfaced so a fork notices a manifest naming a `$layer` that does not resolve. */
    missingLayers = this.extensions.missingLayers;
    /** Same, for a `routes` entry whose path the router would never have matched. */
    invalidRoutes = this.extensions.invalidRoutes;
    /** Which half of the configuration came from where — worth seeing while demoing. */
    manifestSource = computed(() => this.config.diagnostics().manifestSource, ...(ngDevMode ? [{ debugName: "manifestSource" }] : []));
    signOut() {
        this.session.signOut();
    }
    static ɵfac = function App_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || App)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: App, selectors: [["app-root"]], decls: 15, vars: 5, consts: [[1, "shell"], ["aria-label", "Main", 1, "shell__nav"], [1, "shell__brand"], [1, "shell__nav-list"], [1, "shell__nav-empty"], [1, "shell__session"], [1, "shell__content"], ["role", "status", 1, "shell__warning"], ["routerLinkActive", "shell__nav-link--active", 1, "shell__nav-link", 3, "routerLink"], [1, "shell__session-user"], [1, "shell__session-source"], ["type", "button", 1, "shell__sign-out", 3, "click"]], template: function App_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "nav", 1)(2, "p", 2);
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "ul", 3);
            i0.ɵɵrepeaterCreate(5, App_For_6_Template, 3, 2, "li", null, _forTrack0, false, App_ForEmpty_7_Template, 2, 0, "li", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, App_Conditional_8_Template, 9, 2, "div", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "main", 6);
            i0.ɵɵconditionalCreate(10, App_Conditional_10_Template, 2, 2, "p", 7);
            i0.ɵɵrepeaterCreate(11, App_For_12_Template, 2, 2, "p", 7, _forTrack0);
            i0.ɵɵconditionalCreate(13, App_Conditional_13_Template, 1, 0, "router-outlet")(14, App_Conditional_14_Template, 1, 0, "app-sign-in");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.brand());
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.navItems());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.signedIn() ? 8 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.missingLayers().length ? 10 : -1);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.invalidRoutes());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.signedIn() ? 13 : 14);
        } }, dependencies: [RouterOutlet, RouterLink, RouterLinkActive, SignInComponent], styles: ["//[_ngcontent-%COMP%]   Plain[_ngcontent-%COMP%]   CSS[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   purpose.[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   template[_ngcontent-%COMP%]   brings[_ngcontent-%COMP%]   no[_ngcontent-%COMP%]   design[_ngcontent-%COMP%]   system[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   fork[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   free\n//[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   add[_ngcontent-%COMP%]   Angular[_ngcontent-%COMP%]   Material[_ngcontent-%COMP%], Satori[_ngcontent-%COMP%]   UI[_ngcontent-%COMP%], Tailwind[_ngcontent-%COMP%]   or[_ngcontent-%COMP%]   nothing[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   all[_ngcontent-%COMP%]   without[_ngcontent-%COMP%]   first\n//[_ngcontent-%COMP%]   removing[_ngcontent-%COMP%]   ours.[_ngcontent-%COMP%]   `@nuxeo/satori-platform/ui`[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   available[_ngcontent-%COMP%]   but[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   imported[_ngcontent-%COMP%]   here[_ngcontent-%COMP%], \n//[_ngcontent-%COMP%]   which[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   what[_ngcontent-%COMP%]   keeps[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   shell's[_ngcontent-%COMP%]   bundle[_ngcontent-%COMP%]   small.\n\n.shell[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 15rem 1fr;\n  min-height: 100vh;\n  font-family:\n    system-ui,\n    -apple-system,\n    'Segoe UI',\n    sans-serif;\n  color: var(--shell-fg, #1f2328);\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%]   carries[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   own[_ngcontent-%COMP%]   foreground[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   muted[_ngcontent-%COMP%]   tokens[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   inheriting\n//[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   `.shell`.[_ngcontent-%COMP%]   Without[_ngcontent-%COMP%]   that,[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   theme[_ngcontent-%COMP%]   darkening[_ngcontent-%COMP%]   `--shell-nav-bg`[_ngcontent-%COMP%]   leaves[_ngcontent-%COMP%]   the\n//[_ngcontent-%COMP%]   links[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   body[_ngcontent-%COMP%]   text[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   renders[_ngcontent-%COMP%]   dark-on-dark.[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   rebrand[_ngcontent-%COMP%]   should[_ngcontent-%COMP%]   not\n//[_ngcontent-%COMP%]   be[_ngcontent-%COMP%]   able[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   make[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   navigation[_ngcontent-%COMP%]   unreadable[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   JSON[_ngcontent-%COMP%]   alone.\n.shell__nav[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 1.5rem 1rem;\n  color: var(--shell-nav-fg, #1f2328);\n  background: var(--shell-nav-bg, #f6f8fa);\n  border-right: 1px solid var(--shell-border, #d0d7de);\n}\n\n//[_ngcontent-%COMP%]   Pushed[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   bottom[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%]   column[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   entry[_ngcontent-%COMP%]   list[_ngcontent-%COMP%]   stays[_ngcontent-%COMP%]   where[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   user\n//[_ngcontent-%COMP%]   expects[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   entries[_ngcontent-%COMP%]   are[_ngcontent-%COMP%]   added[_ngcontent-%COMP%]   or[_ngcontent-%COMP%]   hidden[_ngcontent-%COMP%]   by[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   manifest.\n.shell__session[_ngcontent-%COMP%] {\n  margin-top: auto;\n  padding-top: 1rem;\n  font-size: 0.8125rem;\n  border-top: 1px solid var(--shell-nav-hover, #eaeef2);\n}\n\n.shell__session-user[_ngcontent-%COMP%] {\n  margin: 0 0 0.25rem;\n}\n\n.shell__session-source[_ngcontent-%COMP%] {\n  margin: 0 0 0.625rem;\n  font-size: 0.75rem;\n  color: var(--shell-nav-muted, #656d76);\n}\n\n.shell__sign-out[_ngcontent-%COMP%] {\n  padding: 0.3125rem 0.625rem;\n  font: inherit;\n  font-size: 0.8125rem;\n  cursor: pointer;\n  color: inherit;\n  background: var(--shell-nav-hover, #eaeef2);\n  border: 1px solid var(--shell-nav-hover, #eaeef2);\n  border-radius: 6px;\n}\n\n.shell__brand[_ngcontent-%COMP%] {\n  margin: 0 0 1.5rem;\n  font-size: 1rem;\n  font-weight: 600;\n  letter-spacing: 0.01em;\n}\n\n.shell__nav-list[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n\n.shell__nav-link[_ngcontent-%COMP%] {\n  display: block;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  color: inherit;\n  text-decoration: none;\n\n  &:hover {\n    background: var(--shell-nav-hover, #eaeef2);\n  }\n\n  &--active {\n    background: var(--shell-nav-active, #ddf4ff);\n    font-weight: 600;\n  }\n}\n\n.shell__nav-empty[_ngcontent-%COMP%] {\n  padding: 0.5rem 0.75rem;\n  color: var(--shell-nav-muted, #656d76);\n  font-size: 0.875rem;\n}\n\n.shell__content[_ngcontent-%COMP%] {\n  padding: 2rem;\n  min-width: 0;\n}\n\n.shell__warning[_ngcontent-%COMP%] {\n  margin: 0 0 1.5rem;\n  padding: 0.75rem 1rem;\n  border-radius: 6px;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n  font-size: 0.875rem;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(App, [{
        type: Component,
        args: [{ selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, SignInComponent], template: "<div class=\"shell\">\n  <nav class=\"shell__nav\" aria-label=\"Main\">\n    <!-- Layer 0: `branding.applicationTitle`, applied on reload with no rebuild. -->\n    <p class=\"shell__brand\">{{ brand() }}</p>\n\n    <!--\n      Rendered from the extension registry. Adding an entry is a manifest edit or\n      a `provideSatoriExtensions({ slots: { navbar: [...] } })` call \u2014 never a\n      change to this template.\n    -->\n    <ul class=\"shell__nav-list\">\n      @for (item of navItems(); track item.id) {\n        <li>\n          <a\n            class=\"shell__nav-link\"\n            routerLinkActive=\"shell__nav-link--active\"\n            [routerLink]=\"item.path\"\n          >\n            {{ item.label }}\n          </a>\n        </li>\n      } @empty {\n        <li class=\"shell__nav-empty\">No navigation entries registered.</li>\n      }\n    </ul>\n\n    @if (signedIn()) {\n      <div class=\"shell__session\">\n        <p class=\"shell__session-user\">\n          Signed in as <strong>{{ username() }}</strong>\n        </p>\n        <p class=\"shell__session-source\">Layer 1 manifest: {{ manifestSource() }}</p>\n        <button class=\"shell__sign-out\" type=\"button\" (click)=\"signOut()\">Sign out</button>\n      </div>\n    }\n  </nav>\n\n  <main class=\"shell__content\">\n    @if (missingLayers().length) {\n      <p class=\"shell__warning\" role=\"status\">\n        Manifest references {{ missingLayers().length }} extension layer(s) that did not resolve:\n        {{ missingLayers().join(', ') }}\n      </p>\n    }\n\n    @for (route of invalidRoutes(); track route.id) {\n      <p class=\"shell__warning\" role=\"status\">\n        Manifest route {{ route.id }} was not registered: {{ route.reason }}\n      </p>\n    }\n\n    <!--\n      No route guard, deliberately. Guarding is a fork's decision, and gating the\n      whole outlet here means no page has to handle \"signed out\" itself.\n    -->\n    @if (signedIn()) {\n      <router-outlet />\n    } @else {\n      <app-sign-in />\n    }\n  </main>\n</div>\n", styles: ["// Plain CSS on purpose. The template brings no design system, so a fork is free\n// to add Angular Material, Satori UI, Tailwind or nothing at all without first\n// removing ours. `@nuxeo/satori-platform/ui` is available but not imported here,\n// which is what keeps this shell's bundle small.\n\n.shell {\n  display: grid;\n  grid-template-columns: 15rem 1fr;\n  min-height: 100vh;\n  font-family:\n    system-ui,\n    -apple-system,\n    'Segoe UI',\n    sans-serif;\n  color: var(--shell-fg, #1f2328);\n}\n\n// The nav carries its own foreground and muted tokens rather than inheriting\n// from `.shell`. Without that, a theme darkening `--shell-nav-bg` leaves the\n// links at the body text colour and renders dark-on-dark. A rebrand should not\n// be able to make the navigation unreadable from JSON alone.\n.shell__nav {\n  display: flex;\n  flex-direction: column;\n  padding: 1.5rem 1rem;\n  color: var(--shell-nav-fg, #1f2328);\n  background: var(--shell-nav-bg, #f6f8fa);\n  border-right: 1px solid var(--shell-border, #d0d7de);\n}\n\n// Pushed to the bottom of the nav column so the entry list stays where a user\n// expects it as entries are added or hidden by a manifest.\n.shell__session {\n  margin-top: auto;\n  padding-top: 1rem;\n  font-size: 0.8125rem;\n  border-top: 1px solid var(--shell-nav-hover, #eaeef2);\n}\n\n.shell__session-user {\n  margin: 0 0 0.25rem;\n}\n\n.shell__session-source {\n  margin: 0 0 0.625rem;\n  font-size: 0.75rem;\n  color: var(--shell-nav-muted, #656d76);\n}\n\n.shell__sign-out {\n  padding: 0.3125rem 0.625rem;\n  font: inherit;\n  font-size: 0.8125rem;\n  cursor: pointer;\n  color: inherit;\n  background: var(--shell-nav-hover, #eaeef2);\n  border: 1px solid var(--shell-nav-hover, #eaeef2);\n  border-radius: 6px;\n}\n\n.shell__brand {\n  margin: 0 0 1.5rem;\n  font-size: 1rem;\n  font-weight: 600;\n  letter-spacing: 0.01em;\n}\n\n.shell__nav-list {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n\n.shell__nav-link {\n  display: block;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  color: inherit;\n  text-decoration: none;\n\n  &:hover {\n    background: var(--shell-nav-hover, #eaeef2);\n  }\n\n  &--active {\n    background: var(--shell-nav-active, #ddf4ff);\n    font-weight: 600;\n  }\n}\n\n.shell__nav-empty {\n  padding: 0.5rem 0.75rem;\n  color: var(--shell-nav-muted, #656d76);\n  font-size: 0.875rem;\n}\n\n.shell__content {\n  padding: 2rem;\n  min-width: 0;\n}\n\n.shell__warning {\n  margin: 0 0 1.5rem;\n  padding: 0.75rem 1rem;\n  border-radius: 6px;\n  background: var(--shell-warn-bg, #fff8c5);\n  border: 1px solid var(--shell-warn-border, #d4a72c);\n  font-size: 0.875rem;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(App, { className: "App", filePath: "apps/nuxeo-satori-template/src/app/app.ts", lineNumber: 40 }); })();
