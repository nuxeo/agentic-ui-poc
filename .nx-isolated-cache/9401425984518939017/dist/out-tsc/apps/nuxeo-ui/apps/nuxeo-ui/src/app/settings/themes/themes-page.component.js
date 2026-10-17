import { NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { AppThemeService } from '../../theme/app-theme.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
const _forTrack0 = ($index, $item) => $item.id;
function ThemesPageComponent_For_11_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 16);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "settings.themes.current"), " ");
} }
function ThemesPageComponent_For_11_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 18);
    i0.ɵɵlistener("click", function ThemesPageComponent_For_11_Conditional_17_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const t_r2 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.theme.setTheme(t_r2.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "settings.themes.apply"), " ");
} }
function ThemesPageComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 6)(1, "div", 7)(2, "div", 8);
    i0.ɵɵelement(3, "div", 9);
    i0.ɵɵelementStart(4, "div", 10);
    i0.ɵɵelement(5, "div", 11);
    i0.ɵɵelementStart(6, "div", 12);
    i0.ɵɵelement(7, "span")(8, "span")(9, "span")(10, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(11, "div", 13);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "div", 14)(13, "span", 15);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "descriptorLabel");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(16, ThemesPageComponent_For_11_Conditional_16_Template, 3, 3, "button", 16)(17, ThemesPageComponent_For_11_Conditional_17_Template, 3, 3, "button", 17);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const t_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("theme-card--current", ctx_r2.theme.themeId() === t_r2.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngStyle", ctx_r2.previewVars(t_r2));
    i0.ɵɵadvance(13);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 5, t_r2));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.theme.themeId() === t_r2.id ? 16 : 17);
} }
export class ThemesPageComponent {
    theme = inject(AppThemeService);
    /** Configured, not compiled in: a theme added to `bootstrap.json` appears here without a rebuild. */
    themes = this.theme.themes;
    previewVars(t) {
        const p = t.preview;
        return {
            '--tp-sidebar': p.sidebar,
            '--tp-surface': p.surface,
            '--tp-header': p.header,
            '--tp-accent': p.accent,
            '--tp-tile': p.tile,
        };
    }
    static ɵfac = function ThemesPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ThemesPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ThemesPageComponent, selectors: [["app-themes-page"]], decls: 12, vars: 6, consts: [[1, "settings-page"], [1, "themes-toolbar"], ["role", "heading", "aria-level", "2", 1, "settings-page__title"], ["type", "button", "mat-icon-button", ""], ["role", "list", 1, "themes-grid"], ["role", "listitem", 1, "theme-card", 3, "theme-card--current"], ["role", "listitem", 1, "theme-card"], [1, "theme-card__preview-wrap", 3, "ngStyle"], ["aria-hidden", "true", 1, "theme-preview"], [1, "theme-preview__sidebar"], [1, "theme-preview__body"], [1, "theme-preview__topbar"], [1, "theme-preview__tiles"], [1, "theme-preview__fab"], [1, "theme-card__footer"], [1, "theme-card__name"], ["type", "button", "mat-stroked-button", "", "disabled", "", 1, "theme-card__btn"], ["type", "button", "mat-flat-button", "", "color", "primary", 1, "theme-card__btn"], ["type", "button", "mat-flat-button", "", "color", "primary", 1, "theme-card__btn", 3, "click"]], template: function ThemesPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "button", 3);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementStart(7, "mat-icon");
            i0.ɵɵtext(8, "search");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(9, "div", 4);
            i0.ɵɵrepeaterCreate(10, ThemesPageComponent_For_11_Template, 18, 7, "article", 5, _forTrack0);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 2, "settings.themes.title"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 4, "settings.themes.search"));
            i0.ɵɵadvance(5);
            i0.ɵɵrepeater(ctx.themes());
        } }, dependencies: [NgStyle, MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, TranslatePipe, DescriptorLabelPipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  min-height: 100%;\n  box-sizing: border-box;\n  background: var(--mat-sys-surface-container-lowest);\n}\n\n.settings-page[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n}\n\n\n\n.settings-page__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.themes-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  max-width: 920px;\n  margin: 0 auto 1.25rem;\n}\n\n.themes-toolbar[_ngcontent-%COMP%]   .mat-mdc-icon-button[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.themes-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1.25rem;\n  max-width: 920px;\n  margin: 0 auto;\n}\n\n@media (max-width: 700px) {\n  .themes-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n\n.theme-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  border-radius: 12px;\n  overflow: hidden;\n  background: var(--mat-sys-surface);\n  border: 1px solid var(--mat-sys-outline-variant);\n  box-shadow: var(--mat-sys-level1);\n  transition:\n    box-shadow 0.2s ease,\n    border-color 0.2s ease;\n}\n\n.theme-card--current[_ngcontent-%COMP%] {\n  border-color: var(--mat-sys-primary);\n  box-shadow:\n    0 0 0 1px color-mix(in srgb, var(--mat-sys-primary) 50%, transparent),\n    var(--mat-sys-level2);\n}\n\n.theme-card__preview-wrap[_ngcontent-%COMP%] {\n  padding: 0.75rem 0.75rem 0;\n}\n\n.theme-preview[_ngcontent-%COMP%] {\n  display: flex;\n  height: 140px;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid var(--mat-sys-outline-variant);\n  background: var(--tp-surface, #eee);\n}\n\n.theme-preview__sidebar[_ngcontent-%COMP%] {\n  width: 22%;\n  flex-shrink: 0;\n  background: var(--tp-sidebar, #333);\n}\n\n.theme-preview__body[_ngcontent-%COMP%] {\n  flex: 1;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n\n.theme-preview__topbar[_ngcontent-%COMP%] {\n  height: 18%;\n  background: var(--tp-header, #ddd);\n  border-bottom: 1px solid color-mix(in srgb, var(--mat-sys-outline) 35%, transparent);\n}\n\n.theme-preview__tiles[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.5rem;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-template-rows: 1fr 1fr;\n  gap: 0.35rem;\n  background: var(--tp-surface, #f5f5f5);\n\n  span {\n    border-radius: 4px;\n    background: var(--tp-tile, #e0e0e0);\n    opacity: 0.95;\n  }\n}\n\n.theme-preview__fab[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0.5rem;\n  bottom: 0.5rem;\n  width: 1.75rem;\n  height: 1.75rem;\n  border-radius: 50%;\n  background: var(--tp-accent, #2196f3);\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);\n}\n\n.theme-card__footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  padding: 0.85rem 1rem 1rem;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n}\n\n.theme-card__name[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface);\n}\n\n.theme-card__btn[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  min-width: 5.5rem;\n}\n\n.theme-card__btn.mat-mdc-outlined-button[disabled][_ngcontent-%COMP%] {\n  opacity: 1;\n  color: var(--mat-sys-on-surface-variant);\n  border-color: var(--mat-sys-outline) !important;\n  background-color: var(--mat-sys-surface-container-highest);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ThemesPageComponent, [{
        type: Component,
        args: [{ standalone: true, selector: 'app-themes-page', imports: [NgStyle, MatButtonModule, MatIconModule, TranslatePipe, DescriptorLabelPipe], template: "<section class=\"settings-page\">\n  <div class=\"themes-toolbar\">\n    <div class=\"settings-page__title\" role=\"heading\" aria-level=\"2\">\n      {{ 'settings.themes.title' | translate }}\n    </div>\n    <button type=\"button\" mat-icon-button [attr.aria-label]=\"'settings.themes.search' | translate\">\n      <mat-icon>search</mat-icon>\n    </button>\n  </div>\n\n  <div class=\"themes-grid\" role=\"list\">\n    @for (t of themes(); track t.id) {\n      <article\n        class=\"theme-card\"\n        [class.theme-card--current]=\"theme.themeId() === t.id\"\n        role=\"listitem\"\n      >\n        <div class=\"theme-card__preview-wrap\" [ngStyle]=\"previewVars(t)\">\n          <div class=\"theme-preview\" aria-hidden=\"true\">\n            <div class=\"theme-preview__sidebar\"></div>\n            <div class=\"theme-preview__body\">\n              <div class=\"theme-preview__topbar\"></div>\n              <div class=\"theme-preview__tiles\">\n                <span></span>\n                <span></span>\n                <span></span>\n                <span></span>\n              </div>\n              <div class=\"theme-preview__fab\"></div>\n            </div>\n          </div>\n        </div>\n        <div class=\"theme-card__footer\">\n          <span class=\"theme-card__name\">{{ t | descriptorLabel }}</span>\n          @if (theme.themeId() === t.id) {\n            <button type=\"button\" mat-stroked-button disabled class=\"theme-card__btn\">\n              {{ 'settings.themes.current' | translate }}\n            </button>\n          } @else {\n            <button\n              type=\"button\"\n              mat-flat-button\n              color=\"primary\"\n              class=\"theme-card__btn\"\n              (click)=\"theme.setTheme(t.id)\"\n            >\n              {{ 'settings.themes.apply' | translate }}\n            </button>\n          }\n        </div>\n      </article>\n    }\n  </div>\n</section>\n", styles: [":host {\n  display: block;\n  min-height: 100%;\n  box-sizing: border-box;\n  background: var(--mat-sys-surface-container-lowest);\n}\n\n.settings-page {\n  padding: 1.5rem;\n}\n\n/* Unchanged from original placeholder \u2014 only `color` uses tokens for theme contrast. */\n.settings-page__title {\n  margin: 0;\n  font-size: 1.25rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.themes-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  max-width: 920px;\n  margin: 0 auto 1.25rem;\n}\n\n.themes-toolbar .mat-mdc-icon-button {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.themes-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1.25rem;\n  max-width: 920px;\n  margin: 0 auto;\n}\n\n@media (max-width: 700px) {\n  .themes-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n.theme-card {\n  display: flex;\n  flex-direction: column;\n  border-radius: 12px;\n  overflow: hidden;\n  background: var(--mat-sys-surface);\n  border: 1px solid var(--mat-sys-outline-variant);\n  box-shadow: var(--mat-sys-level1);\n  transition:\n    box-shadow 0.2s ease,\n    border-color 0.2s ease;\n}\n\n.theme-card--current {\n  border-color: var(--mat-sys-primary);\n  box-shadow:\n    0 0 0 1px color-mix(in srgb, var(--mat-sys-primary) 50%, transparent),\n    var(--mat-sys-level2);\n}\n\n.theme-card__preview-wrap {\n  padding: 0.75rem 0.75rem 0;\n}\n\n.theme-preview {\n  display: flex;\n  height: 140px;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid var(--mat-sys-outline-variant);\n  background: var(--tp-surface, #eee);\n}\n\n.theme-preview__sidebar {\n  width: 22%;\n  flex-shrink: 0;\n  background: var(--tp-sidebar, #333);\n}\n\n.theme-preview__body {\n  flex: 1;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n\n.theme-preview__topbar {\n  height: 18%;\n  background: var(--tp-header, #ddd);\n  border-bottom: 1px solid color-mix(in srgb, var(--mat-sys-outline) 35%, transparent);\n}\n\n.theme-preview__tiles {\n  flex: 1;\n  padding: 0.5rem;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-template-rows: 1fr 1fr;\n  gap: 0.35rem;\n  background: var(--tp-surface, #f5f5f5);\n\n  span {\n    border-radius: 4px;\n    background: var(--tp-tile, #e0e0e0);\n    opacity: 0.95;\n  }\n}\n\n.theme-preview__fab {\n  position: absolute;\n  right: 0.5rem;\n  bottom: 0.5rem;\n  width: 1.75rem;\n  height: 1.75rem;\n  border-radius: 50%;\n  background: var(--tp-accent, #2196f3);\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);\n}\n\n.theme-card__footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  padding: 0.85rem 1rem 1rem;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n}\n\n.theme-card__name {\n  color: var(--mat-sys-on-surface);\n}\n\n.theme-card__btn {\n  flex-shrink: 0;\n  min-width: 5.5rem;\n}\n\n.theme-card__btn.mat-mdc-outlined-button[disabled] {\n  opacity: 1;\n  color: var(--mat-sys-on-surface-variant);\n  border-color: var(--mat-sys-outline) !important;\n  background-color: var(--mat-sys-surface-container-highest);\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ThemesPageComponent, { className: "ThemesPageComponent", filePath: "apps/nuxeo-ui/src/app/settings/themes/themes-page.component.ts", lineNumber: 18 }); })();
