import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BrowseService, isFolderishDocument, normalizeNuxeoPath, } from '@nuxeo/satori-platform/nuxeo-client';
import { forkJoin } from 'rxjs';
import { nxsErrorStatus } from '../error-state/error-status';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/icon";
const _forTrack0 = ($index, $item) => $item.uid;
function NxsFolderPickerDialogComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵelement(1, "nxs-spinner", 14);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "satori-components.folder-picker.loading"));
} }
function NxsFolderPickerDialogComponent_Conditional_12_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.folder-picker.forbidden"), " ");
} }
function NxsFolderPickerDialogComponent_Conditional_12_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.folder-picker.not-found"), " ");
} }
function NxsFolderPickerDialogComponent_Conditional_12_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.folder-picker.not-a-folder"), " ");
} }
function NxsFolderPickerDialogComponent_Conditional_12_Case_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "button", 15);
    i0.ɵɵlistener("click", function NxsFolderPickerDialogComponent_Conditional_12_Case_4_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 2, "satori-components.folder-picker.failed"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "satori-components.folder-picker.retry"), " ");
} }
function NxsFolderPickerDialogComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵconditionalCreate(1, NxsFolderPickerDialogComponent_Conditional_12_Case_1_Template, 2, 3)(2, NxsFolderPickerDialogComponent_Conditional_12_Case_2_Template, 2, 3)(3, NxsFolderPickerDialogComponent_Conditional_12_Case_3_Template, 2, 3)(4, NxsFolderPickerDialogComponent_Conditional_12_Case_4_Template, 5, 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_2_0;
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx) === 403 ? 1 : tmp_2_0 === 404 ? 2 : tmp_2_0 === "not-a-folder" ? 3 : 4);
} }
function NxsFolderPickerDialogComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 8);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.folder-picker.empty"), " ");
} }
function NxsFolderPickerDialogComponent_Conditional_14_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "button", 16);
    i0.ɵɵlistener("click", function NxsFolderPickerDialogComponent_Conditional_14_For_3_Template_button_click_1_listener() { const doc_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.open(doc_r4)); });
    i0.ɵɵelementStart(2, "mat-icon", 17);
    i0.ɵɵtext(3, "folder");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 18);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "mat-icon", 19);
    i0.ɵɵtext(7, "chevron_right");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const doc_r4 = ctx.$implicit;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(doc_r4.title);
} }
function NxsFolderPickerDialogComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 9);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, NxsFolderPickerDialogComponent_Conditional_14_For_3_Template, 8, 1, "li", null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "satori-components.folder-picker.folders"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.folders());
} }
function NxsFolderPickerDialogComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, ctx === "inside" ? "satori-components.folder-picker.inside-itself" : "satori-components.folder-picker.already-here"), " ");
} }
/**
 * Chooses a destination folder, as a `MatDialog`: `dialog.open(NxsFolderPickerDialogComponent,
 * { data })`, then `afterClosed()` gives the folder, or nothing when cancelled.
 *
 * It opens on a folder and lists the folders in it; the user goes into one, or up a level, and
 * chooses the folder on screen. It reads the repository through `BrowseService` with the
 * application's credentials, and says why when it cannot: no access to a folder, a folder gone,
 * or a failure with Retry. It only chooses; the page copies or moves.
 */
export class NxsFolderPickerDialogComponent {
    dialogRef = inject(MatDialogRef);
    browse = inject(BrowseService);
    destroyRef = inject(DestroyRef);
    data = inject(MAT_DIALOG_DATA);
    path = signal(normalizeNuxeoPath(this.data.initialPath || '/default-domain'), ...(ngDevMode ? [{ debugName: "path" }] : []));
    folder = signal(null, ...(ngDevMode ? [{ debugName: "folder" }] : []));
    folders = signal([], ...(ngDevMode ? [{ debugName: "folders" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    failure = signal(null, ...(ngDevMode ? [{ debugName: "failure" }] : []));
    trail = computed(() => segmentsOf(this.path()), ...(ngDevMode ? [{ debugName: "trail" }] : []));
    canGoUp = computed(() => segmentsOf(this.path()).length > 1, ...(ngDevMode ? [{ debugName: "canGoUp" }] : []));
    /** Why the folder on screen cannot be chosen, if it cannot. */
    refusal = computed(() => {
        const path = this.path();
        const exclude = this.data.excludePath;
        if (exclude && isSameOrInside(path, exclude))
            return 'inside';
        const parent = this.data.currentParentPath;
        if (parent && normalizeNuxeoPath(parent) === path)
            return 'already';
        return null;
    }, ...(ngDevMode ? [{ debugName: "refusal" }] : []));
    canChoose = computed(() => !this.loading() && this.failure() === null && this.folder() !== null && !this.refusal(), ...(ngDevMode ? [{ debugName: "canChoose" }] : []));
    constructor() {
        this.load();
    }
    load() {
        const path = this.path();
        this.loading.set(true);
        this.failure.set(null);
        forkJoin({
            folder: this.browse.getByPath(path),
            children: this.browse.getChildren(path, 200, 0),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ folder, children }) => {
                if (path !== this.path())
                    return;
                this.loading.set(false);
                if (!isFolderishDocument(folder)) {
                    this.folder.set(null);
                    this.folders.set([]);
                    this.failure.set('not-a-folder');
                    return;
                }
                this.folder.set(folder);
                this.folders.set((children.entries ?? [])
                    .filter((doc) => isFolderishDocument(doc))
                    .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })));
            },
            error: (error) => {
                if (path !== this.path())
                    return;
                this.loading.set(false);
                this.folder.set(null);
                this.folders.set([]);
                this.failure.set(nxsErrorStatus(error));
            },
        });
    }
    open(doc) {
        if (!doc.path)
            return;
        this.path.set(normalizeNuxeoPath(doc.path));
        this.load();
    }
    up() {
        if (!this.canGoUp())
            return;
        this.path.set(`/${segmentsOf(this.path()).slice(0, -1).join('/')}`);
        this.load();
    }
    choose() {
        const folder = this.folder();
        if (!this.canChoose() || !folder)
            return;
        this.dialogRef.close({ uid: folder.uid, path: this.path(), title: folder.title ?? '' });
    }
    cancel() {
        this.dialogRef.close();
    }
    static ɵfac = function NxsFolderPickerDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsFolderPickerDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsFolderPickerDialogComponent, selectors: [["nxs-folder-picker-dialog"]], hostAttrs: [1, "nxs-folder-picker-dialog"], decls: 22, vars: 16, consts: [["mat-dialog-title", ""], [1, "nxs-folder-picker-dialog__body"], [1, "nxs-folder-picker-dialog__location"], ["mat-icon-button", "", "type", "button", 3, "click", "disabled"], ["aria-hidden", "true"], ["aria-live", "polite", 1, "nxs-folder-picker-dialog__trail"], [1, "nxs-folder-picker-dialog__state"], ["role", "alert", 1, "nxs-folder-picker-dialog__failure"], [1, "nxs-folder-picker-dialog__empty"], [1, "nxs-folder-picker-dialog__list"], [1, "nxs-folder-picker-dialog__refusal"], ["align", "end"], ["mat-button", "", "type", "button", 3, "click"], ["mat-flat-button", "", "type", "button", 3, "click", "disabled"], ["diameter", "28", 3, "label"], ["mat-stroked-button", "", "type", "button", 3, "click"], ["type", "button", 1, "nxs-folder-picker-dialog__folder", 3, "click"], ["aria-hidden", "true", 1, "nxs-folder-picker-dialog__folder-icon"], [1, "nxs-folder-picker-dialog__folder-title"], ["aria-hidden", "true", 1, "nxs-folder-picker-dialog__chevron"]], template: function NxsFolderPickerDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "mat-dialog-content", 1)(3, "nav", 2);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementStart(5, "button", 3);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵlistener("click", function NxsFolderPickerDialogComponent_Template_button_click_5_listener() { return ctx.up(); });
            i0.ɵɵelementStart(7, "mat-icon", 4);
            i0.ɵɵtext(8, "arrow_upward");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "span", 5);
            i0.ɵɵtext(10);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(11, NxsFolderPickerDialogComponent_Conditional_11_Template, 3, 3, "div", 6)(12, NxsFolderPickerDialogComponent_Conditional_12_Template, 5, 1, "div", 7)(13, NxsFolderPickerDialogComponent_Conditional_13_Template, 3, 3, "p", 8)(14, NxsFolderPickerDialogComponent_Conditional_14_Template, 4, 3, "ul", 9);
            i0.ɵɵconditionalCreate(15, NxsFolderPickerDialogComponent_Conditional_15_Template, 3, 3, "p", 10);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "mat-dialog-actions", 11)(17, "button", 12);
            i0.ɵɵlistener("click", function NxsFolderPickerDialogComponent_Template_button_click_17_listener() { return ctx.cancel(); });
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "button", 13);
            i0.ɵɵlistener("click", function NxsFolderPickerDialogComponent_Template_button_click_20_listener() { return ctx.choose(); });
            i0.ɵɵtext(21);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_5_0;
            let tmp_6_0;
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.data.heading);
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 10, "satori-components.folder-picker.location"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canGoUp() || ctx.loading());
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 12, "satori-components.folder-picker.up"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.trail().join(" \u203A "));
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 11 : (tmp_5_0 = ctx.failure()) ? 12 : ctx.folders().length === 0 ? 13 : 14, tmp_5_0);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional((tmp_6_0 = ctx.refusal()) ? 15 : -1, tmp_6_0);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 14, "satori-components.folder-picker.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canChoose());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.data.confirmLabel, " ");
        } }, dependencies: [MatButtonModule, i1.MatButton, i1.MatIconButton, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatIconModule, i3.MatIcon, NxsSpinnerComponent, TranslatePipe], styles: ["//[_ngcontent-%COMP%]   Never[_ngcontent-%COMP%]   wider[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   pane[_ngcontent-%COMP%]   MatDialog[_ngcontent-%COMP%]   gives[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   dialog[_ngcontent-%COMP%]:   below[_ngcontent-%COMP%]   600[_ngcontent-%COMP%]   px[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   `100vw[_ngcontent-%COMP%]   -[_ngcontent-%COMP%]   32px`[_ngcontent-%COMP%], \n//[_ngcontent-%COMP%]   narrower[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   `95vw`[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   once[_ngcontent-%COMP%]   was[_ngcontent-%COMP%], which   scrolled   sideways   at   320   px.\n[_nghost-%COMP%] {\n  display: block;\n  width: 520px;\n  max-width: 100%;\n}\n\n.nxs-folder-picker-dialog__location[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n\n.nxs-folder-picker-dialog__trail[_ngcontent-%COMP%] {\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface);\n  overflow-wrap: anywhere;\n}\n\n.nxs-folder-picker-dialog__state[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 24px 0;\n}\n\n.nxs-folder-picker-dialog__failure[_ngcontent-%COMP%], \n.nxs-folder-picker-dialog__refusal[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n  margin: 8px 0;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-error);\n}\n\n.nxs-folder-picker-dialog__refusal[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-folder-picker-dialog__empty[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-folder-picker-dialog__list[_ngcontent-%COMP%] {\n  max-height: 280px;\n  margin: 0;\n  padding: 0;\n  overflow-y: auto;\n  list-style: none;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n}\n\n.nxs-folder-picker-dialog__folder[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 10px 12px;\n  border: 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  background: none;\n  font: inherit;\n  color: var(--mat-sys-on-surface);\n  text-align: start;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container);\n  }\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so the ring is also drawn on a\n  // standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\nli:last-child[_ngcontent-%COMP%]   .nxs-folder-picker-dialog__folder[_ngcontent-%COMP%] {\n  border-bottom: 0;\n}\n\n.nxs-folder-picker-dialog__folder-icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  color: var(--mat-sys-primary);\n}\n\n.nxs-folder-picker-dialog__folder-title[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.nxs-folder-picker-dialog__chevron[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n[dir='rtl'][_nghost-%COMP%]   .nxs-folder-picker-dialog__chevron[_ngcontent-%COMP%]   ,[_ngcontent-%COMP%]   [dir='rtl'][_ngcontent-%COMP%]   [_nghost-%COMP%]   .nxs-folder-picker-dialog__chevron[_ngcontent-%COMP%] {\n  transform: scaleX(-1);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsFolderPickerDialogComponent, [{
        type: Component,
        args: [{ selector: 'nxs-folder-picker-dialog', standalone: true, imports: [MatButtonModule, MatDialogModule, MatIconModule, NxsSpinnerComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-folder-picker-dialog' }, template: "<h2 mat-dialog-title>{{ data.heading }}</h2>\n<mat-dialog-content class=\"nxs-folder-picker-dialog__body\">\n  <nav\n    class=\"nxs-folder-picker-dialog__location\"\n    [attr.aria-label]=\"'satori-components.folder-picker.location' | translate\"\n  >\n    <button\n      mat-icon-button\n      type=\"button\"\n      [disabled]=\"!canGoUp() || loading()\"\n      [attr.aria-label]=\"'satori-components.folder-picker.up' | translate\"\n      (click)=\"up()\"\n    >\n      <mat-icon aria-hidden=\"true\">arrow_upward</mat-icon>\n    </button>\n    <span class=\"nxs-folder-picker-dialog__trail\" aria-live=\"polite\">{{\n      trail().join(' \u203A ')\n    }}</span>\n  </nav>\n\n  @if (loading()) {\n    <div class=\"nxs-folder-picker-dialog__state\">\n      <nxs-spinner diameter=\"28\" [label]=\"'satori-components.folder-picker.loading' | translate\" />\n    </div>\n  } @else if (failure(); as reason) {\n    <div class=\"nxs-folder-picker-dialog__failure\" role=\"alert\">\n      @switch (reason) {\n        @case (403) {\n          {{ 'satori-components.folder-picker.forbidden' | translate }}\n        }\n        @case (404) {\n          {{ 'satori-components.folder-picker.not-found' | translate }}\n        }\n        @case ('not-a-folder') {\n          {{ 'satori-components.folder-picker.not-a-folder' | translate }}\n        }\n        @default {\n          {{ 'satori-components.folder-picker.failed' | translate }}\n          <button mat-stroked-button type=\"button\" (click)=\"load()\">\n            {{ 'satori-components.folder-picker.retry' | translate }}\n          </button>\n        }\n      }\n    </div>\n  } @else if (folders().length === 0) {\n    <p class=\"nxs-folder-picker-dialog__empty\">\n      {{ 'satori-components.folder-picker.empty' | translate }}\n    </p>\n  } @else {\n    <ul\n      class=\"nxs-folder-picker-dialog__list\"\n      [attr.aria-label]=\"'satori-components.folder-picker.folders' | translate\"\n    >\n      @for (doc of folders(); track doc.uid) {\n        <li>\n          <button type=\"button\" class=\"nxs-folder-picker-dialog__folder\" (click)=\"open(doc)\">\n            <mat-icon class=\"nxs-folder-picker-dialog__folder-icon\" aria-hidden=\"true\"\n              >folder</mat-icon\n            >\n            <span class=\"nxs-folder-picker-dialog__folder-title\">{{ doc.title }}</span>\n            <mat-icon class=\"nxs-folder-picker-dialog__chevron\" aria-hidden=\"true\"\n              >chevron_right</mat-icon\n            >\n          </button>\n        </li>\n      }\n    </ul>\n  }\n  @if (refusal(); as why) {\n    <p class=\"nxs-folder-picker-dialog__refusal\">\n      {{\n        (why === 'inside'\n          ? 'satori-components.folder-picker.inside-itself'\n          : 'satori-components.folder-picker.already-here'\n        ) | translate\n      }}\n    </p>\n  }\n</mat-dialog-content>\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" (click)=\"cancel()\">\n    {{ 'satori-components.folder-picker.cancel' | translate }}\n  </button>\n  <button mat-flat-button type=\"button\" [disabled]=\"!canChoose()\" (click)=\"choose()\">\n    {{ data.confirmLabel }}\n  </button>\n</mat-dialog-actions>\n", styles: ["// Never wider than the pane MatDialog gives the dialog: below 600 px that is `100vw - 32px`,\n// narrower than the `95vw` this once was, which scrolled sideways at 320 px.\n:host {\n  display: block;\n  width: 520px;\n  max-width: 100%;\n}\n\n.nxs-folder-picker-dialog__location {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n\n.nxs-folder-picker-dialog__trail {\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface);\n  overflow-wrap: anywhere;\n}\n\n.nxs-folder-picker-dialog__state {\n  display: flex;\n  justify-content: center;\n  padding: 24px 0;\n}\n\n.nxs-folder-picker-dialog__failure,\n.nxs-folder-picker-dialog__refusal {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n  margin: 8px 0;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-error);\n}\n\n.nxs-folder-picker-dialog__refusal {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-folder-picker-dialog__empty {\n  margin: 8px 0;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-folder-picker-dialog__list {\n  max-height: 280px;\n  margin: 0;\n  padding: 0;\n  overflow-y: auto;\n  list-style: none;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n}\n\n.nxs-folder-picker-dialog__folder {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 10px 12px;\n  border: 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  background: none;\n  font: inherit;\n  color: var(--mat-sys-on-surface);\n  text-align: start;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container);\n  }\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so the ring is also drawn on a\n  // standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\nli:last-child .nxs-folder-picker-dialog__folder {\n  border-bottom: 0;\n}\n\n.nxs-folder-picker-dialog__folder-icon {\n  flex-shrink: 0;\n  color: var(--mat-sys-primary);\n}\n\n.nxs-folder-picker-dialog__folder-title {\n  flex: 1;\n}\n\n.nxs-folder-picker-dialog__chevron {\n  flex-shrink: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n:host-context([dir='rtl']) .nxs-folder-picker-dialog__chevron {\n  transform: scaleX(-1);\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsFolderPickerDialogComponent, { className: "NxsFolderPickerDialogComponent", filePath: "libs/shared/satori-components/src/lib/folder-picker/folder-picker-dialog.component.ts", lineNumber: 67 }); })();
/**
 * A path's names, exactly as Nuxeo gave them. Every path here comes from the server, and Nuxeo's
 * names are case-sensitive: `/ws/Folder` and `/ws/folder` are two folders.
 */
function segmentsOf(path) {
    return normalizeNuxeoPath(path).split('/').filter(Boolean);
}
function isSameOrInside(path, container) {
    const inner = segmentsOf(path);
    const outer = segmentsOf(container);
    return (outer.length > 0 &&
        outer.length <= inner.length &&
        outer.every((segment, i) => segment === inner[i]));
}
