import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { BrowseService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/progress-spinner";
import * as i2 from "@angular/material/button";
function PersonalSpacePageComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵelement(1, "mat-spinner", 3);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "app.personal-space-page.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "app.personal-space-page.loading-your-personal-workspace"));
} }
function PersonalSpacePageComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 4);
    i0.ɵɵlistener("click", function PersonalSpacePageComponent_Conditional_2_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.retry()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.error());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 2, "app.personal-space-page.retry"), " ");
} }
/**
 * Resolves the current user's personal workspace and opens it in browse view,
 * matching Nuxeo Web UI (`User.GetUserWorkspace` + `navigateTo('browse', path)`).
 */
export class PersonalSpacePageComponent {
    browseService = inject(BrowseService);
    translate = inject(TranslateService);
    router = inject(Router);
    destroyRef = inject(DestroyRef);
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    constructor() {
        this.loadPersonalWorkspace();
    }
    retry() {
        this.loadPersonalWorkspace();
    }
    loadPersonalWorkspace() {
        this.loading.set(true);
        this.error.set(null);
        this.browseService
            .getUserWorkspace()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (workspace) => {
                void this.router.navigateByUrl(`/browse${workspace.path}`, { replaceUrl: true });
            },
            error: () => {
                this.error.set(this.translate.instant('app.message.unable-to-load-your-personal-workspace'));
                this.loading.set(false);
            },
        });
    }
    static ɵfac = function PersonalSpacePageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PersonalSpacePageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PersonalSpacePageComponent, selectors: [["ng-component"]], decls: 3, vars: 1, consts: [[1, "personal-space-page"], [1, "personal-space-page__loading"], [1, "personal-space-page__error"], ["diameter", "40"], ["mat-stroked-button", "", "type", "button", 3, "click"]], template: function PersonalSpacePageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, PersonalSpacePageComponent_Conditional_1_Template, 6, 6, "div", 1)(2, PersonalSpacePageComponent_Conditional_2_Template, 6, 4, "div", 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 1 : ctx.error() ? 2 : -1);
        } }, dependencies: [MatProgressSpinnerModule, i1.MatProgressSpinner, MatButtonModule, i2.MatButton, TranslatePipe], styles: [".personal-space-page[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 12rem;\n  padding: 1.5rem;\n}\n\n.personal-space-page__loading[_ngcontent-%COMP%], \n.personal-space-page__error[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PersonalSpacePageComponent, [{
        type: Component,
        args: [{ standalone: true, imports: [TranslatePipe, MatProgressSpinnerModule, MatButtonModule], template: "<div class=\"personal-space-page\">\n  @if (loading()) {\n    <div class=\"personal-space-page__loading\">\n      <mat-spinner\n        diameter=\"40\"\n        [attr.aria-label]=\"'app.personal-space-page.loading' | translate\"\n      />\n      <p>{{ 'app.personal-space-page.loading-your-personal-workspace' | translate }}</p>\n    </div>\n  } @else if (error()) {\n    <div class=\"personal-space-page__error\">\n      <p>{{ error() }}</p>\n      <button mat-stroked-button type=\"button\" (click)=\"retry()\">\n        {{ 'app.personal-space-page.retry' | translate }}\n      </button>\n    </div>\n  }\n</div>\n", styles: [".personal-space-page {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 12rem;\n  padding: 1.5rem;\n}\n\n.personal-space-page__loading,\n.personal-space-page__error {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PersonalSpacePageComponent, { className: "PersonalSpacePageComponent", filePath: "apps/nuxeo-ui/src/app/personal-space/personal-space-page.component.ts", lineNumber: 20 }); })();
