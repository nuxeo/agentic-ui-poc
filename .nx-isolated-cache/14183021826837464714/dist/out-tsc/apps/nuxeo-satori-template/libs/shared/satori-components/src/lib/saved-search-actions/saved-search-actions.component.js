import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { DocumentDetailService } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/menu";
function NxsSavedSearchActionsComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 3);
    i0.ɵɵlistener("click", function NxsSavedSearchActionsComponent_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.saveAs.emit()); });
    i0.ɵɵelementStart(1, "mat-icon", 4);
    i0.ɵɵtext(2, "bookmark_add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "satori-components.saved-search-actions.save-as"), " ");
} }
function NxsSavedSearchActionsComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 5);
    i0.ɵɵlistener("click", function NxsSavedSearchActionsComponent_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.save.emit()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.saved-search-actions.save"), " ");
} }
function NxsSavedSearchActionsComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 6);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "mat-icon", 4);
    i0.ɵɵtext(3, "more_vert");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "mat-menu", null, 0)(6, "button", 7);
    i0.ɵɵlistener("click", function NxsSavedSearchActionsComponent_Conditional_2_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.rename.emit()); });
    i0.ɵɵelementStart(7, "mat-icon", 4);
    i0.ɵɵtext(8, "edit");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 7);
    i0.ɵɵlistener("click", function NxsSavedSearchActionsComponent_Conditional_2_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.share.emit()); });
    i0.ɵɵelementStart(13, "mat-icon", 4);
    i0.ɵɵtext(14, "share");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "span");
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "button", 7);
    i0.ɵɵlistener("click", function NxsSavedSearchActionsComponent_Conditional_2_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.remove.emit()); });
    i0.ɵɵelementStart(19, "mat-icon", 4);
    i0.ɵɵtext(20, "delete");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "span");
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const menu_r5 = i0.ɵɵreference(5);
    i0.ɵɵproperty("matMenuTriggerFor", menu_r5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 5, "satori-components.saved-search-actions.more"));
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 7, "satori-components.saved-search-actions.rename"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 9, "satori-components.saved-search-actions.share"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 11, "satori-components.saved-search-actions.delete"));
} }
/** The permission Web UI requires on a saved search before it offers to change it. */
const EDIT_PERMISSION = 'WriteProperties';
/**
 * The actions on the search being shown — Web UI's `nuxeo-saved-search-actions`.
 *
 * Offers Save as whenever there is something to save, and, on an open saved search the user may
 * change, Save (once its filters have changed), Rename, Share and Delete. Whether the user may change
 * it is the server's answer: the saved search's `WriteProperties` permission, read when it opens. A
 * search shared read-only can still be saved as a copy. It emits what was chosen; the host asks for
 * names and confirmations and sends the requests.
 */
export class NxsSavedSearchActionsComponent {
    /** The saved search open now, or an empty string for none. */
    savedSearchId = input('', ...(ngDevMode ? [{ debugName: "savedSearchId" }] : []));
    /** Whether the filters differ from the open saved search's. */
    dirty = input(false, ...(ngDevMode ? [{ debugName: "dirty" }] : []));
    /** Whether any filter is set: with no saved search open, the only thing Save as can save. */
    hasFilters = input(false, ...(ngDevMode ? [{ debugName: "hasFilters" }] : []));
    /** Save the filters as a new saved search. */
    saveAs = output();
    /** Save the filters into the open saved search. */
    save = output();
    /** Rename the open saved search. */
    rename = output();
    /** Share the open saved search. */
    share = output();
    /** Delete the open saved search. */
    remove = output();
    documents = inject(DocumentDetailService);
    /**
     * Whether the user may change the open saved search: `true` only once the server has said so, so
     * Save, Rename, Share and Delete stay hidden while it is asked and when it cannot answer.
     */
    canEdit = toSignal(toObservable(this.savedSearchId).pipe(switchMap((id) => id.trim()
        ? this.documents.getDocumentPermissions(id).pipe(map((doc) => {
            const permissions = doc.contextParameters?.['permissions'];
            return Array.isArray(permissions) && permissions.includes(EDIT_PERMISSION);
        }), catchError(() => of(false)), startWith(false))
        : of(false))), { initialValue: false });
    isSaved = computed(() => this.savedSearchId().trim().length > 0, ...(ngDevMode ? [{ debugName: "isSaved" }] : []));
    showSaveAs = computed(() => this.isSaved() || this.hasFilters(), ...(ngDevMode ? [{ debugName: "showSaveAs" }] : []));
    showSave = computed(() => this.isSaved() && this.dirty() && this.canEdit(), ...(ngDevMode ? [{ debugName: "showSave" }] : []));
    showMenu = computed(() => this.isSaved() && this.canEdit(), ...(ngDevMode ? [{ debugName: "showMenu" }] : []));
    static ɵfac = function NxsSavedSearchActionsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSavedSearchActionsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSavedSearchActionsComponent, selectors: [["nxs-saved-search-actions"]], hostAttrs: [1, "nxs-saved-search-actions"], inputs: { savedSearchId: [1, "savedSearchId"], dirty: [1, "dirty"], hasFilters: [1, "hasFilters"] }, outputs: { saveAs: "saveAs", save: "save", rename: "rename", share: "share", remove: "remove" }, decls: 3, vars: 3, consts: [["menu", "matMenu"], ["mat-flat-button", "", "color", "primary", "type", "button"], ["mat-stroked-button", "", "type", "button"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click"], ["aria-hidden", "true"], ["mat-stroked-button", "", "type", "button", 3, "click"], ["mat-icon-button", "", "type", "button", 3, "matMenuTriggerFor"], ["mat-menu-item", "", "type", "button", 3, "click"]], template: function NxsSavedSearchActionsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsSavedSearchActionsComponent_Conditional_0_Template, 5, 3, "button", 1);
            i0.ɵɵconditionalCreate(1, NxsSavedSearchActionsComponent_Conditional_1_Template, 3, 3, "button", 2);
            i0.ɵɵconditionalCreate(2, NxsSavedSearchActionsComponent_Conditional_2_Template, 24, 13);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.showSaveAs() ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showSave() ? 1 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showMenu() ? 2 : -1);
        } }, dependencies: [MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, MatMenuModule, i3.MatMenu, i3.MatMenuItem, i3.MatMenuTrigger, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSavedSearchActionsComponent, [{
        type: Component,
        args: [{ selector: 'nxs-saved-search-actions', standalone: true, imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-saved-search-actions' }, template: "@if (showSaveAs()) {\n  <button mat-flat-button color=\"primary\" type=\"button\" (click)=\"saveAs.emit()\">\n    <mat-icon aria-hidden=\"true\">bookmark_add</mat-icon>\n    {{ 'satori-components.saved-search-actions.save-as' | translate }}\n  </button>\n}\n@if (showSave()) {\n  <button mat-stroked-button type=\"button\" (click)=\"save.emit()\">\n    {{ 'satori-components.saved-search-actions.save' | translate }}\n  </button>\n}\n@if (showMenu()) {\n  <button\n    mat-icon-button\n    type=\"button\"\n    [matMenuTriggerFor]=\"menu\"\n    [attr.aria-label]=\"'satori-components.saved-search-actions.more' | translate\"\n  >\n    <mat-icon aria-hidden=\"true\">more_vert</mat-icon>\n  </button>\n  <mat-menu #menu=\"matMenu\">\n    <button mat-menu-item type=\"button\" (click)=\"rename.emit()\">\n      <mat-icon aria-hidden=\"true\">edit</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.rename' | translate }}</span>\n    </button>\n    <button mat-menu-item type=\"button\" (click)=\"share.emit()\">\n      <mat-icon aria-hidden=\"true\">share</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.share' | translate }}</span>\n    </button>\n    <button mat-menu-item type=\"button\" (click)=\"remove.emit()\">\n      <mat-icon aria-hidden=\"true\">delete</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.delete' | translate }}</span>\n    </button>\n  </mat-menu>\n}\n", styles: [":host {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n"] }]
    }], null, { savedSearchId: [{ type: i0.Input, args: [{ isSignal: true, alias: "savedSearchId", required: false }] }], dirty: [{ type: i0.Input, args: [{ isSignal: true, alias: "dirty", required: false }] }], hasFilters: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasFilters", required: false }] }], saveAs: [{ type: i0.Output, args: ["saveAs"] }], save: [{ type: i0.Output, args: ["save"] }], rename: [{ type: i0.Output, args: ["rename"] }], share: [{ type: i0.Output, args: ["share"] }], remove: [{ type: i0.Output, args: ["remove"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSavedSearchActionsComponent, { className: "NxsSavedSearchActionsComponent", filePath: "libs/shared/satori-components/src/lib/saved-search-actions/saved-search-actions.component.ts", lineNumber: 32 }); })();
