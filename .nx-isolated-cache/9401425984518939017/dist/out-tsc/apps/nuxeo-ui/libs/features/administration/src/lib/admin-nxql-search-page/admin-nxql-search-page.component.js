import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdministrationService, DocTypeLabelPipe, } from '@nuxeo/satori-platform/nuxeo-client';
import { AiGatewayService, AiFeatureFlagService, aiErrorMessage, } from '@agentic-ui/shared/ai-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/table";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/progress-spinner";
import * as i8 from "@angular/material/expansion";
const _c0 = a0 => ({ count: a0 });
function AdminNxqlSearchPageComponent_Conditional_16_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 17);
    i0.ɵɵelement(1, "mat-spinner", 19);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-nxql-search-page.loading"));
} }
function AdminNxqlSearchPageComponent_Conditional_16_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 20);
    i0.ɵɵlistener("click", function AdminNxqlSearchPageComponent_Conditional_16_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.generateFromNl()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", !ctx_r1.aiNlQuery.trim());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 2, "admin.admin-nxql-search-page.generate-nxql"), " ");
} }
function AdminNxqlSearchPageComponent_Conditional_16_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.aiGenError());
} }
function AdminNxqlSearchPageComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 13)(1, "mat-form-field", 14)(2, "mat-label");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 15);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function AdminNxqlSearchPageComponent_Conditional_16_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.aiNlQuery, $event) || (ctx_r1.aiNlQuery = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("keydown.enter", function AdminNxqlSearchPageComponent_Conditional_16_Template_input_keydown_enter_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.generateFromNl()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "mat-icon", 16);
    i0.ɵɵtext(8, "auto_awesome");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, AdminNxqlSearchPageComponent_Conditional_16_Conditional_9_Template, 3, 3, "button", 17)(10, AdminNxqlSearchPageComponent_Conditional_16_Conditional_10_Template, 5, 4, "button", 18);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, AdminNxqlSearchPageComponent_Conditional_16_Conditional_11_Template, 2, 1, "p", 11);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "admin.admin-nxql-search-page.describe-your-query-in-english"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.aiNlQuery);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(6, 7, "admin.admin-nxql-search-page.query-example"));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.aiGenerating() ? 9 : 10);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.aiGenError() ? 11 : -1);
} }
function AdminNxqlSearchPageComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function AdminNxqlSearchPageComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-nxql-search-page.loading"));
} }
function AdminNxqlSearchPageComponent_Conditional_31_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 34);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-nxql-search-page.path"), " ");
} }
function AdminNxqlSearchPageComponent_Conditional_31_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(doc_r4.path);
} }
function AdminNxqlSearchPageComponent_Conditional_31_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 34);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-nxql-search-page.type"), " ");
} }
function AdminNxqlSearchPageComponent_Conditional_31_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "docTypeLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, doc_r5.type));
} }
function AdminNxqlSearchPageComponent_Conditional_31_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 34);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-nxql-search-page.size"), " ");
} }
function AdminNxqlSearchPageComponent_Conditional_31_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.formatSize(doc_r6));
} }
function AdminNxqlSearchPageComponent_Conditional_31_th_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 34);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-nxql-search-page.modified"), " ");
} }
function AdminNxqlSearchPageComponent_Conditional_31_td_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r7 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, doc_r7.lastModified, "medium"));
} }
function AdminNxqlSearchPageComponent_Conditional_31_th_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 34);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-nxql-search-page.last-contributor"), " ");
} }
function AdminNxqlSearchPageComponent_Conditional_31_td_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.lastContributor(doc_r8));
} }
function AdminNxqlSearchPageComponent_Conditional_31_tr_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 36);
} }
function AdminNxqlSearchPageComponent_Conditional_31_tr_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 37);
} }
function AdminNxqlSearchPageComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 23)(4, "table", 24);
    i0.ɵɵelementContainerStart(5, 25);
    i0.ɵɵtemplate(6, AdminNxqlSearchPageComponent_Conditional_31_th_6_Template, 3, 3, "th", 26)(7, AdminNxqlSearchPageComponent_Conditional_31_td_7_Template, 2, 1, "td", 27);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 28);
    i0.ɵɵtemplate(9, AdminNxqlSearchPageComponent_Conditional_31_th_9_Template, 3, 3, "th", 26)(10, AdminNxqlSearchPageComponent_Conditional_31_td_10_Template, 3, 3, "td", 27);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 29);
    i0.ɵɵtemplate(12, AdminNxqlSearchPageComponent_Conditional_31_th_12_Template, 3, 3, "th", 26)(13, AdminNxqlSearchPageComponent_Conditional_31_td_13_Template, 2, 1, "td", 27);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(14, 30);
    i0.ɵɵtemplate(15, AdminNxqlSearchPageComponent_Conditional_31_th_15_Template, 3, 3, "th", 26)(16, AdminNxqlSearchPageComponent_Conditional_31_td_16_Template, 3, 4, "td", 27);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(17, 31);
    i0.ɵɵtemplate(18, AdminNxqlSearchPageComponent_Conditional_31_th_18_Template, 3, 3, "th", 26)(19, AdminNxqlSearchPageComponent_Conditional_31_td_19_Template, 2, 1, "td", 27);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(20, AdminNxqlSearchPageComponent_Conditional_31_tr_20_Template, 1, 0, "tr", 32)(21, AdminNxqlSearchPageComponent_Conditional_31_tr_21_Template, 1, 0, "tr", 33);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 4, ctx_r1.totalSize() === 1 ? "common.count.result-one" : "common.count.result-many", i0.ɵɵpureFunction1(7, _c0, ctx_r1.totalSize())), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("dataSource", ctx_r1.results());
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r1.columns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r1.columns);
} }
const DEFAULT_NXQL = "SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 " +
    'AND ecm:isVersion = 0 AND ecm:isTrashed = 0';
export class AdminNxqlSearchPageComponent {
    adminService = inject(AdministrationService);
    translate = inject(TranslateService);
    aiGateway = inject(AiGatewayService);
    featureFlags = inject(AiFeatureFlagService);
    queryText = DEFAULT_NXQL;
    aiNlQuery = '';
    aiGenerating = signal(false, ...(ngDevMode ? [{ debugName: "aiGenerating" }] : []));
    aiGenError = signal(null, ...(ngDevMode ? [{ debugName: "aiGenError" }] : []));
    results = signal([], ...(ngDevMode ? [{ debugName: "results" }] : []));
    totalSize = signal(0, ...(ngDevMode ? [{ debugName: "totalSize" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    columns = ['path', 'type', 'size', 'modified', 'contributor'];
    runSearch() {
        this.loading.set(true);
        this.error.set(null);
        this.adminService.nxqlSearch(this.queryText.trim(), 100, 0).subscribe({
            next: (list) => {
                this.results.set(list.entries ?? []);
                this.totalSize.set(list.totalSize ?? list.entries?.length ?? 0);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.message ?? this.translate.instant('admin.message.query-failed'));
                this.results.set([]);
                this.totalSize.set(0);
                this.loading.set(false);
            },
        });
    }
    clear() {
        this.queryText = DEFAULT_NXQL;
    }
    formatSize(doc) {
        const fc = doc.properties?.['file:content'];
        if (!fc?.length)
            return '—';
        const n = Number(fc.length);
        if (Number.isNaN(n))
            return String(fc.length);
        if (n < 1024)
            return `${n} B`;
        if (n < 1024 * 1024)
            return `${(n / 1024).toFixed(2)} KB`;
        return `${(n / (1024 * 1024)).toFixed(2)} MB`;
    }
    lastContributor(doc) {
        const p = doc.properties ?? {};
        return String(p['dc:lastContributor'] ?? p['dc:creator'] ?? '—');
    }
    onKeydown(ev) {
        if (ev.ctrlKey && ev.key === 'Enter') {
            ev.preventDefault();
            this.runSearch();
        }
    }
    generateFromNl() {
        const q = this.aiNlQuery.trim();
        if (!q)
            return;
        this.aiGenerating.set(true);
        this.aiGenError.set(null);
        this.aiGateway.nlToNxql(q).subscribe({
            next: (res) => {
                this.queryText = res.nxql;
                this.aiGenerating.set(false);
            },
            error: (err) => {
                this.aiGenError.set(aiErrorMessage(err, this.translate.instant('admin.message.ai-generation-failed')));
                this.aiGenerating.set(false);
            },
        });
    }
    static ɵfac = function AdminNxqlSearchPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminNxqlSearchPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminNxqlSearchPageComponent, selectors: [["lib-admin-nxql-search-page"]], decls: 32, vars: 25, consts: [[1, "nxql-page"], [1, "nxql-page__header"], ["role", "heading", "aria-level", "1", 1, "nxql-page__title"], [1, "nxql-panel"], ["displayMode", "flat", 1, "nxql-filters"], [1, "muted"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxql-field", "nxql-field--query"], ["matInput", "", "name", "nxql", "rows", "8", "spellcheck", "false", "autocapitalize", "off", "autocomplete", "off", 3, "ngModelChange", "keydown", "ngModel"], [1, "nxql-actions"], ["type", "button", "mat-stroked-button", "", 3, "click"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click"], [1, "nxql-error"], [1, "nxql-center"], [1, "ai-generate-row"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxql-field", "ai-nl-field"], ["matInput", "", 3, "ngModelChange", "keydown.enter", "ngModel", "placeholder"], ["matPrefix", "", 1, "ai-prefix-icon"], ["type", "button", "mat-flat-button", "", "disabled", "", 1, "ai-gen-btn"], ["type", "button", "mat-flat-button", "", 1, "ai-gen-btn", 3, "disabled"], ["diameter", "18"], ["type", "button", "mat-flat-button", "", 1, "ai-gen-btn", 3, "click", "disabled"], ["diameter", "40"], [1, "nxql-count"], [1, "nxql-table-wrap", "mat-elevation-z1"], ["mat-table", "", 1, "nxql-table", 3, "dataSource"], ["matColumnDef", "path"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "type"], ["matColumnDef", "size"], ["matColumnDef", "modified"], ["matColumnDef", "contributor"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["mat-header-cell", ""], ["mat-cell", ""], ["mat-header-row", ""], ["mat-row", ""]], template: function AdminNxqlSearchPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "section", 3);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementStart(7, "mat-accordion", 4)(8, "mat-expansion-panel")(9, "mat-expansion-panel-header")(10, "mat-panel-title");
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "p", 5);
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(16, AdminNxqlSearchPageComponent_Conditional_16_Template, 12, 9);
            i0.ɵɵelementStart(17, "mat-form-field", 6)(18, "mat-label");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "textarea", 7);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminNxqlSearchPageComponent_Template_textarea_ngModelChange_21_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.queryText, $event) || (ctx.queryText = $event); return $event; });
            i0.ɵɵlistener("keydown", function AdminNxqlSearchPageComponent_Template_textarea_keydown_21_listener($event) { return ctx.onKeydown($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "div", 8)(23, "button", 9);
            i0.ɵɵlistener("click", function AdminNxqlSearchPageComponent_Template_button_click_23_listener() { return ctx.clear(); });
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "button", 10);
            i0.ɵɵlistener("click", function AdminNxqlSearchPageComponent_Template_button_click_26_listener() { return ctx.runSearch(); });
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(29, AdminNxqlSearchPageComponent_Conditional_29_Template, 2, 1, "p", 11);
            i0.ɵɵconditionalCreate(30, AdminNxqlSearchPageComponent_Conditional_30_Template, 3, 3, "div", 12)(31, AdminNxqlSearchPageComponent_Conditional_31_Template, 22, 9);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 11, "admin.admin-nxql-search-page.nxql-search"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 13, "admin.admin-nxql-search-page.nxql-query"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 15, "admin.admin-nxql-search-page.filters"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 17, "admin.admin-nxql-search-page.additional-filter-ui-can-be-wired"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() ? 16 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 19, "admin.admin-nxql-search-page.nxql-query-ctrl-enter-to-run"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.queryText);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(25, 21, "admin.admin-nxql-search-page.clear"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(28, 23, "admin.admin-nxql-search-page.search"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.error() ? 29 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 30 : 31);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatButtonModule, i2.MatButton, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatPrefix, MatInputModule, i4.MatInput, MatTableModule, i5.MatTable, i5.MatHeaderCellDef, i5.MatHeaderRowDef, i5.MatColumnDef, i5.MatCellDef, i5.MatRowDef, i5.MatHeaderCell, i5.MatCell, i5.MatHeaderRow, i5.MatRow, MatIconModule, i6.MatIcon, MatProgressSpinnerModule, i7.MatProgressSpinner, MatExpansionModule, i8.MatAccordion, i8.MatExpansionPanel, i8.MatExpansionPanelHeader, i8.MatExpansionPanelTitle, DocTypeLabelPipe,
            TranslatePipe,
            DatePipe], styles: [".nxql-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.nxql-page__header[_ngcontent-%COMP%] {\n  margin-bottom: var(--admin-space-2, 0.75rem);\n}\n\n.nxql-page__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.nxql-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: var(--admin-space-3, 1rem);\n  padding: var(--admin-space-3, 1rem);\n  margin-bottom: var(--admin-space-4, 1.25rem);\n  border-radius: var(--admin-radius-1, 8px);\n  background: var(--mat-sys-surface, #fff);\n  box-shadow: var(--mat-sys-level1, 0 1px 3px rgba(0, 0, 0, 0.12));\n}\n\n.nxql-filters[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.nxql-field[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n\n\n.nxql-field--query.mat-mdc-form-field[_ngcontent-%COMP%] {\n  --mat-form-field-container-height: auto;\n}\n\n.nxql-field--query[_ngcontent-%COMP%]   textarea.mat-mdc-input-element[_ngcontent-%COMP%] {\n  min-height: 10rem;\n  line-height: 1.5;\n  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;\n  font-size: 0.8125rem;\n}\n\n.ai-generate-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n}\n\n.ai-nl-field[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.ai-prefix-icon[_ngcontent-%COMP%] {\n  color: #7c4dff;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.ai-gen-btn[_ngcontent-%COMP%] {\n  min-height: 56px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n  color: #fff;\n  font-weight: 500;\n  white-space: nowrap;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n\n  mat-icon {\n    margin-right: 4px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 18px !important;\n    height: 18px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 18px !important;\n      height: 18px !important;\n    }\n\n    circle {\n      stroke: #fff;\n    }\n  }\n}\n\n.nxql-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: var(--admin-space-2, 0.75rem);\n  margin: 0;\n  flex-wrap: wrap;\n}\n\n.nxql-count[_ngcontent-%COMP%] {\n  font-size: 0.95rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n}\n\n.nxql-table-wrap[_ngcontent-%COMP%] {\n  overflow: auto;\n  max-height: 520px;\n  border-radius: var(--admin-radius-1, 8px);\n}\n\n.nxql-table[_ngcontent-%COMP%] {\n  width: 100%;\n  font-size: 0.875rem;\n}\n\n.nxql-center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 2rem;\n}\n\n.nxql-error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.muted[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  font-size: 0.9rem;\n}\n\n.nxql-page[_ngcontent-%COMP%]   .mat-mdc-unelevated-button[_ngcontent-%COMP%], \n.nxql-page[_ngcontent-%COMP%]   .mat-mdc-outlined-button[_ngcontent-%COMP%], \n.nxql-page[_ngcontent-%COMP%]   .mat-mdc-button[_ngcontent-%COMP%] {\n  min-height: var(--admin-control-height, 40px);\n}\n\n.nxql-table[_ngcontent-%COMP%]   th.mat-mdc-header-cell[_ngcontent-%COMP%], \n.nxql-table[_ngcontent-%COMP%]   td.mat-mdc-cell[_ngcontent-%COMP%] {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n@media (max-width: 900px) {\n  .nxql-page[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminNxqlSearchPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-nxql-search-page', standalone: true, imports: [
                    DocTypeLabelPipe,
                    TranslatePipe,
                    DatePipe,
                    FormsModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatTableModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatExpansionModule,
                ], template: "<div class=\"nxql-page\">\n  <header class=\"nxql-page__header\">\n    <div class=\"nxql-page__title\" role=\"heading\" aria-level=\"1\">\n      {{ 'admin.admin-nxql-search-page.nxql-search' | translate }}\n    </div>\n  </header>\n\n  <section\n    class=\"nxql-panel\"\n    [attr.aria-label]=\"'admin.admin-nxql-search-page.nxql-query' | translate\"\n  >\n    <mat-accordion class=\"nxql-filters\" displayMode=\"flat\">\n      <mat-expansion-panel>\n        <mat-expansion-panel-header>\n          <mat-panel-title>{{\n            'admin.admin-nxql-search-page.filters' | translate\n          }}</mat-panel-title>\n        </mat-expansion-panel-header>\n        <p class=\"muted\">\n          {{ 'admin.admin-nxql-search-page.additional-filter-ui-can-be-wired' | translate }}\n        </p>\n      </mat-expansion-panel>\n    </mat-accordion>\n\n    @if (featureFlags.aiEnabled()) {\n      <div class=\"ai-generate-row\">\n        <mat-form-field\n          appearance=\"outline\"\n          class=\"nxql-field ai-nl-field\"\n          subscriptSizing=\"dynamic\"\n        >\n          <mat-label>{{\n            'admin.admin-nxql-search-page.describe-your-query-in-english' | translate\n          }}</mat-label>\n          <input\n            matInput\n            [(ngModel)]=\"aiNlQuery\"\n            [placeholder]=\"'admin.admin-nxql-search-page.query-example' | translate\"\n            (keydown.enter)=\"generateFromNl()\"\n          />\n          <mat-icon matPrefix class=\"ai-prefix-icon\">auto_awesome</mat-icon>\n        </mat-form-field>\n        @if (aiGenerating()) {\n          <button type=\"button\" mat-flat-button class=\"ai-gen-btn\" disabled>\n            <mat-spinner\n              diameter=\"18\"\n              [attr.aria-label]=\"'admin.admin-nxql-search-page.loading' | translate\"\n            ></mat-spinner>\n          </button>\n        } @else {\n          <button\n            type=\"button\"\n            mat-flat-button\n            class=\"ai-gen-btn\"\n            [disabled]=\"!aiNlQuery.trim()\"\n            (click)=\"generateFromNl()\"\n          >\n            <mat-icon>auto_awesome</mat-icon>\n            {{ 'admin.admin-nxql-search-page.generate-nxql' | translate }}\n          </button>\n        }\n      </div>\n      @if (aiGenError()) {\n        <p class=\"nxql-error\">{{ aiGenError() }}</p>\n      }\n    }\n\n    <mat-form-field\n      appearance=\"outline\"\n      class=\"nxql-field nxql-field--query\"\n      subscriptSizing=\"dynamic\"\n    >\n      <mat-label>{{\n        'admin.admin-nxql-search-page.nxql-query-ctrl-enter-to-run' | translate\n      }}</mat-label>\n      <textarea\n        matInput\n        name=\"nxql\"\n        rows=\"8\"\n        spellcheck=\"false\"\n        autocapitalize=\"off\"\n        autocomplete=\"off\"\n        [(ngModel)]=\"queryText\"\n        (keydown)=\"onKeydown($event)\"\n      ></textarea>\n    </mat-form-field>\n\n    <div class=\"nxql-actions\">\n      <button type=\"button\" mat-stroked-button (click)=\"clear()\">\n        {{ 'admin.admin-nxql-search-page.clear' | translate }}\n      </button>\n      <button type=\"button\" mat-flat-button color=\"primary\" (click)=\"runSearch()\">\n        {{ 'admin.admin-nxql-search-page.search' | translate }}\n      </button>\n    </div>\n  </section>\n\n  @if (error()) {\n    <p class=\"nxql-error\">{{ error() }}</p>\n  }\n\n  @if (loading()) {\n    <div class=\"nxql-center\">\n      <mat-spinner\n        diameter=\"40\"\n        [attr.aria-label]=\"'admin.admin-nxql-search-page.loading' | translate\"\n      />\n    </div>\n  } @else {\n    <p class=\"nxql-count\">\n      {{\n        (totalSize() === 1 ? 'common.count.result-one' : 'common.count.result-many')\n          | translate: { count: totalSize() }\n      }}\n    </p>\n    <div class=\"nxql-table-wrap mat-elevation-z1\">\n      <table mat-table [dataSource]=\"results()\" class=\"nxql-table\">\n        <ng-container matColumnDef=\"path\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-nxql-search-page.path' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc\">{{ doc.path }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"type\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-nxql-search-page.type' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc\">{{ doc.type | docTypeLabel }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"size\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-nxql-search-page.size' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc\">{{ formatSize(doc) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"modified\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-nxql-search-page.modified' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc\">{{ doc.lastModified | date: 'medium' }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"contributor\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-nxql-search-page.last-contributor' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc\">{{ lastContributor(doc) }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"columns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: columns\"></tr>\n      </table>\n    </div>\n  }\n</div>\n", styles: [".nxql-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.nxql-page__header {\n  margin-bottom: var(--admin-space-2, 0.75rem);\n}\n\n.nxql-page__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.nxql-panel {\n  display: flex;\n  flex-direction: column;\n  gap: var(--admin-space-3, 1rem);\n  padding: var(--admin-space-3, 1rem);\n  margin-bottom: var(--admin-space-4, 1.25rem);\n  border-radius: var(--admin-radius-1, 8px);\n  background: var(--mat-sys-surface, #fff);\n  box-shadow: var(--mat-sys-level1, 0 1px 3px rgba(0, 0, 0, 0.12));\n}\n\n.nxql-filters {\n  margin: 0;\n}\n\n.nxql-field {\n  width: 100%;\n}\n\n/* Outline + floating label need auto height on multi-line fields \u2014 fixed 40px breaks label alignment. */\n.nxql-field--query.mat-mdc-form-field {\n  --mat-form-field-container-height: auto;\n}\n\n.nxql-field--query textarea.mat-mdc-input-element {\n  min-height: 10rem;\n  line-height: 1.5;\n  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;\n  font-size: 0.8125rem;\n}\n\n.ai-generate-row {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n}\n\n.ai-nl-field {\n  flex: 1;\n}\n\n.ai-prefix-icon {\n  color: #7c4dff;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.ai-gen-btn {\n  min-height: 56px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n  color: #fff;\n  font-weight: 500;\n  white-space: nowrap;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n\n  mat-icon {\n    margin-right: 4px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 18px !important;\n    height: 18px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 18px !important;\n      height: 18px !important;\n    }\n\n    circle {\n      stroke: #fff;\n    }\n  }\n}\n\n.nxql-actions {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: var(--admin-space-2, 0.75rem);\n  margin: 0;\n  flex-wrap: wrap;\n}\n\n.nxql-count {\n  font-size: 0.95rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n}\n\n.nxql-table-wrap {\n  overflow: auto;\n  max-height: 520px;\n  border-radius: var(--admin-radius-1, 8px);\n}\n\n.nxql-table {\n  width: 100%;\n  font-size: 0.875rem;\n}\n\n.nxql-center {\n  display: flex;\n  justify-content: center;\n  padding: 2rem;\n}\n\n.nxql-error {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.muted {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  font-size: 0.9rem;\n}\n\n.nxql-page .mat-mdc-unelevated-button,\n.nxql-page .mat-mdc-outlined-button,\n.nxql-page .mat-mdc-button {\n  min-height: var(--admin-control-height, 40px);\n}\n\n.nxql-table th.mat-mdc-header-cell,\n.nxql-table td.mat-mdc-cell {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n@media (max-width: 900px) {\n  .nxql-page {\n    padding: 1rem;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminNxqlSearchPageComponent, { className: "AdminNxqlSearchPageComponent", filePath: "libs/features/administration/src/lib/admin-nxql-search-page/admin-nxql-search-page.component.ts", lineNumber: 47 }); })();
