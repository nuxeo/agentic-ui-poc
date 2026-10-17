import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of } from 'rxjs';
import { SearchService, SelectionService, } from '@nuxeo/satori-platform/nuxeo-client';
import { extractMainBlobFileName } from './note-image-url';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsSpinnerComponent, NxsThumbnailComponent, provideNxsThumbnailCache, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/expansion";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/input";
import * as i8 from "@angular/material/checkbox";
import * as i9 from "@angular/material/tooltip";
const _forTrack0 = ($index, $item) => $item.uid;
function NoteImagePickerDialogComponent_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵelement(1, "nxs-spinner", 18);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "document-detail.note-image-picker-dialog.loading"));
} }
function NoteImagePickerDialogComponent_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.searchError());
} }
function NoteImagePickerDialogComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "document-detail.note-image-picker-dialog.no-pictures-found"), " ");
} }
function NoteImagePickerDialogComponent_Conditional_35_For_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 22)(1, "mat-icon");
    i0.ɵɵtext(2, "check_circle");
    i0.ɵɵelementEnd()();
} }
function NoteImagePickerDialogComponent_Conditional_35_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 20);
    i0.ɵɵlistener("click", function NoteImagePickerDialogComponent_Conditional_35_For_3_Template_button_click_0_listener() { const doc_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.toggleSelection(doc_r3)); });
    i0.ɵɵelementStart(1, "div", 21);
    i0.ɵɵconditionalCreate(2, NoteImagePickerDialogComponent_Conditional_35_For_3_Conditional_2_Template, 3, 0, "span", 22);
    i0.ɵɵelementStart(3, "nxs-thumbnail", 23)(4, "mat-icon", 24);
    i0.ɵɵtext(5, "image");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(6, "span", 25);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const doc_r3 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("note-image-picker__item--selected", ctx_r0.isSelected(doc_r3.uid));
    i0.ɵɵattribute("aria-selected", ctx_r0.isSelected(doc_r3.uid));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.isSelected(doc_r3.uid) ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("documentId", doc_r3.uid);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.displayFileName(doc_r3));
} }
function NoteImagePickerDialogComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, NoteImagePickerDialogComponent_Conditional_35_For_3_Template, 8, 6, "button", 19, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.note-image-picker-dialog.picture-documents"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.results());
} }
export class NoteImagePickerDialogComponent {
    destroyRef = inject(DestroyRef);
    translate = inject(TranslateService);
    dialogRef = inject((MatDialogRef));
    searchService = inject(SearchService);
    selectionService = inject(SelectionService);
    selectionSnapshot = null;
    searchTerm = signal('', ...(ngDevMode ? [{ debugName: "searchTerm" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    searchError = signal(null, ...(ngDevMode ? [{ debugName: "searchError" }] : []));
    results = signal([], ...(ngDevMode ? [{ debugName: "results" }] : []));
    totalSize = signal(0, ...(ngDevMode ? [{ debugName: "totalSize" }] : []));
    selectedDocByUid = signal(new Map(), ...(ngDevMode ? [{ debugName: "selectedDocByUid" }] : []));
    resultsLabel = computed(() => {
        const count = this.totalSize();
        // A key per grammatical number rather than an `(s)` suffix, matching the templates.
        return this.translate.instant(count === 1 ? 'common.count.result-one' : 'common.count.result-many', { count });
    }, ...(ngDevMode ? [{ debugName: "resultsLabel" }] : []));
    isAllSelected = computed(() => {
        const uids = this.results().map((doc) => doc.uid);
        return this.selectionService.isAllSelected(uids);
    }, ...(ngDevMode ? [{ debugName: "isAllSelected" }] : []));
    isIndeterminate = computed(() => {
        const uids = this.results().map((doc) => doc.uid);
        return this.selectionService.isIndeterminate(uids);
    }, ...(ngDevMode ? [{ debugName: "isIndeterminate" }] : []));
    constructor() {
        this.captureSelectionSnapshot();
        this.selectionService.clear();
        this.selectionService.setClearOnlyMode(true);
        this.destroyRef.onDestroy(() => {
            this.selectionService.setClearOnlyMode(false);
            this.restoreSelectionSnapshot();
        });
    }
    ngOnInit() {
        this.runSearch('');
    }
    search() {
        this.runSearch(this.searchTerm().trim());
    }
    clearSearch() {
        this.searchTerm.set('');
        this.runSearch('');
    }
    displayFileName(doc) {
        return extractMainBlobFileName(doc) ?? doc.title ?? doc.uid;
    }
    isSelected(uid) {
        return this.selectionService.isSelected(uid);
    }
    toggleSelection(doc) {
        this.selectionService.toggle(doc.uid, this.displayFileName(doc), null, doc.type);
        if (this.selectionService.isSelected(doc.uid)) {
            this.rememberSelectedDoc(doc);
        }
        else {
            this.forgetSelectedDoc(doc.uid);
        }
    }
    toggleSelectAll() {
        const visible = this.results();
        if (visible.length === 0)
            return;
        if (this.isAllSelected()) {
            for (const doc of visible) {
                if (this.selectionService.isSelected(doc.uid)) {
                    this.selectionService.toggle(doc.uid);
                    this.forgetSelectedDoc(doc.uid);
                }
            }
            return;
        }
        for (const doc of visible) {
            if (!this.selectionService.isSelected(doc.uid)) {
                this.selectionService.toggle(doc.uid, this.displayFileName(doc), null, doc.type);
                this.rememberSelectedDoc(doc);
            }
        }
    }
    confirm() {
        const ids = [...this.selectionService.selectedIds()];
        const cached = this.selectedDocByUid();
        const resultsMap = new Map(this.results().map((doc) => [doc.uid, doc]));
        const selected = ids
            .map((uid) => cached.get(uid) ?? resultsMap.get(uid))
            .filter((doc) => !!doc);
        this.dialogRef.close(selected);
    }
    runSearch(fulltext) {
        this.loading.set(true);
        this.searchError.set(null);
        this.searchService
            .searchDocumentPicker({ fulltext, pageSize: 40 })
            .pipe(catchError(() => {
            this.searchError.set(this.translate.instant('document-detail.message.search-failed-try-again'));
            return of({ entries: [], totalSize: 0, resultsCount: 0 });
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
            this.loading.set(false);
            const entries = res.entries ?? [];
            this.results.set(entries);
            this.totalSize.set(res.totalSize ?? res.resultsCount ?? entries.length);
        });
    }
    rememberSelectedDoc(doc) {
        this.selectedDocByUid.update((map) => new Map(map).set(doc.uid, doc));
    }
    forgetSelectedDoc(uid) {
        this.selectedDocByUid.update((map) => {
            const next = new Map(map);
            next.delete(uid);
            return next;
        });
    }
    captureSelectionSnapshot() {
        this.selectionSnapshot = {
            ids: new Set(this.selectionService.selectedIds()),
            labels: new Map(this.selectionService.selectedLabels()),
            previews: new Map(this.selectionService.selectedPreviews()),
            types: new Map(this.selectionService.selectedTypes()),
        };
    }
    restoreSelectionSnapshot() {
        const snapshot = this.selectionSnapshot;
        this.selectionSnapshot = null;
        if (!snapshot)
            return;
        const ids = [...snapshot.ids];
        if (ids.length === 0) {
            this.selectionService.clear();
            return;
        }
        this.selectionService.selectAll(ids, Object.fromEntries(snapshot.labels), Object.fromEntries(snapshot.previews), Object.fromEntries(snapshot.types));
    }
    static ɵfac = function NoteImagePickerDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NoteImagePickerDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NoteImagePickerDialogComponent, selectors: [["lib-note-image-picker-dialog"]], features: [i0.ɵɵProvidersFeature([provideNxsThumbnailCache()])], decls: 43, vars: 37, consts: [[1, "note-image-picker"], ["type", "button", "mat-icon-button", "", "mat-dialog-close", "", 1, "note-image-picker__close"], [1, "note-image-picker__filters", 3, "expanded"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "note-image-picker__search"], ["matInput", "", "autocomplete", "off", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "note-image-picker__actions"], ["mat-stroked-button", "", "type", "button", 3, "click", "disabled"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click", "disabled"], [1, "note-image-picker__results-header"], [1, "note-image-picker__results-left"], [1, "note-image-picker__select-all", 3, "click", "change", "checked", "indeterminate", "disabled", "matTooltip"], [1, "note-image-picker__results-count"], ["aria-hidden", "true", 1, "note-image-picker__view-icon"], [1, "note-image-picker__loading"], [1, "note-image-picker__empty"], ["role", "listbox", "aria-multiselectable", "true", 1, "note-image-picker__grid"], ["align", "end"], ["mat-stroked-button", "", "type", "button", "mat-dialog-close", ""], ["diameter", "32", 3, "label"], ["type", "button", "role", "option", 1, "note-image-picker__item", 3, "note-image-picker__item--selected"], ["type", "button", "role", "option", 1, "note-image-picker__item", 3, "click"], [1, "note-image-picker__thumb"], ["aria-hidden", "true", 1, "note-image-picker__check"], [1, "note-image-picker__image", 3, "documentId"], [1, "note-image-picker__placeholder"], [1, "note-image-picker__title"]], template: function NoteImagePickerDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "button", 1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementStart(3, "mat-icon");
            i0.ɵɵtext(4, "close");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "mat-dialog-content")(6, "mat-expansion-panel", 2)(7, "mat-expansion-panel-header")(8, "mat-panel-title");
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "mat-form-field", 3)(12, "mat-label");
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "input", 4);
            i0.ɵɵlistener("ngModelChange", function NoteImagePickerDialogComponent_Template_input_ngModelChange_15_listener($event) { return ctx.searchTerm.set($event); })("keydown.enter", function NoteImagePickerDialogComponent_Template_input_keydown_enter_15_listener() { return ctx.search(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(16, "div", 5)(17, "button", 6);
            i0.ɵɵlistener("click", function NoteImagePickerDialogComponent_Template_button_click_17_listener() { return ctx.clearSearch(); });
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "button", 7);
            i0.ɵɵlistener("click", function NoteImagePickerDialogComponent_Template_button_click_20_listener() { return ctx.search(); });
            i0.ɵɵtext(21);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(23, "div", 8)(24, "div", 9)(25, "mat-checkbox", 10);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵlistener("click", function NoteImagePickerDialogComponent_Template_mat_checkbox_click_25_listener($event) { return $event.stopPropagation(); })("change", function NoteImagePickerDialogComponent_Template_mat_checkbox_change_25_listener() { return ctx.toggleSelectAll(); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "span", 11);
            i0.ɵɵtext(29);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(30, "mat-icon", 12);
            i0.ɵɵtext(31, "grid_view");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(32, NoteImagePickerDialogComponent_Conditional_32_Template, 3, 3, "div", 13)(33, NoteImagePickerDialogComponent_Conditional_33_Template, 2, 1, "p", 14)(34, NoteImagePickerDialogComponent_Conditional_34_Template, 3, 3, "p", 14)(35, NoteImagePickerDialogComponent_Conditional_35_Template, 4, 3, "div", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "mat-dialog-actions", 16)(37, "button", 17);
            i0.ɵɵtext(38);
            i0.ɵɵpipe(39, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(40, "button", 7);
            i0.ɵɵlistener("click", function NoteImagePickerDialogComponent_Template_button_click_40_listener() { return ctx.confirm(); });
            i0.ɵɵtext(41);
            i0.ɵɵpipe(42, "translate");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 19, "document-detail.note-image-picker-dialog.close"));
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("expanded", true);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 21, "document-detail.note-image-picker-dialog.filters"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 23, "document-detail.note-image-picker-dialog.quick-search"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.searchTerm());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.loading());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 25, "document-detail.note-image-picker-dialog.clear"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.loading());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 27, "document-detail.note-image-picker-dialog.search"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("checked", ctx.isAllSelected())("indeterminate", ctx.isIndeterminate())("disabled", ctx.loading() || ctx.results().length === 0)("matTooltip", i0.ɵɵpipeBind1(26, 29, "document-detail.note-image-picker-dialog.select-all"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(27, 31, "document-detail.note-image-picker-dialog.select-all"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.resultsLabel());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.loading() ? 32 : ctx.searchError() ? 33 : ctx.results().length === 0 ? 34 : 35);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(39, 33, "document-detail.note-image-picker-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.selectionService.selectedCount() === 0);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(42, 35, "document-detail.note-image-picker-dialog.select"), " ");
        } }, dependencies: [NxsSpinnerComponent,
            NxsThumbnailComponent,
            FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, i3.MatIconButton, MatExpansionModule, i4.MatExpansionPanel, i4.MatExpansionPanelHeader, i4.MatExpansionPanelTitle, MatFormFieldModule, i5.MatFormField, i5.MatLabel, MatIconModule, i6.MatIcon, MatInputModule, i7.MatInput, MatCheckboxModule, i8.MatCheckbox, MatTooltipModule, i9.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.note-image-picker[_ngcontent-%COMP%] {\n  display: block;\n  position: relative;\n  min-width: min(860px, 94vw);\n}\n\n.note-image-picker__close[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 4px;\n  right: 4px;\n  z-index: 1;\n  color: var(--mat-sys-on-surface-variant, #616161);\n}\n\n.note-image-picker__filters[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n  box-shadow: none !important;\n  border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  border-radius: 4px;\n}\n\n[_nghost-%COMP%]     .note-image-picker__filters .mat-expansion-panel-body {\n  padding: 0 16px 16px;\n}\n\n.note-image-picker__search[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-bottom: 12px;\n}\n\n.note-image-picker__actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n\n.note-image-picker__results-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n}\n\n.note-image-picker__results-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n}\n\n.note-image-picker__select-all[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n\n.note-image-picker__results-count[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--mat-sys-on-surface-variant, #616161);\n}\n\n.note-image-picker__view-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-on-surface-variant, #757575);\n}\n\n.note-image-picker__loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 48px 0;\n}\n\n.note-image-picker__empty[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 48px 0;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #616161);\n  font-size: 14px;\n}\n\n.note-image-picker__grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 16px;\n  max-height: 420px;\n  overflow: auto;\n  padding: 4px 2px 8px;\n}\n\n.note-image-picker__item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 8px;\n  padding: 0;\n  border: 2px solid transparent;\n  border-radius: 2px;\n  background: transparent;\n  cursor: pointer;\n  text-align: center;\n\n  &:hover .note-image-picker__thumb {\n    box-shadow: 0 1px 4px color-mix(in srgb, var(--mat-sys-shadow, #000) 12%, transparent);\n  }\n\n  &--selected {\n    border-color: var(--mat-sys-primary, #0066ff);\n\n    .note-image-picker__thumb {\n      box-shadow: inset 0 0 0 1px var(--mat-sys-primary, #0066ff);\n    }\n  }\n}\n\n.note-image-picker__thumb[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  aspect-ratio: 4 / 3;\n  overflow: hidden;\n  background: var(--mat-sys-surface-container-high, #eceff1);\n\n  .note-image-picker__image {\n    width: 100%;\n    height: 100%;\n    object-fit: contain;\n    background: var(--mat-sys-surface, #fff);\n  }\n}\n\n.note-image-picker__check[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 6px;\n  left: 6px;\n  z-index: 1;\n  display: flex;\n  line-height: 0;\n\n  .mat-icon {\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n    color: var(--mat-sys-primary, #0066ff);\n    background: var(--mat-sys-surface, #fff);\n    border-radius: 50%;\n  }\n}\n\n.note-image-picker__placeholder[_ngcontent-%COMP%] {\n  font-size: 48px;\n  width: 48px;\n  height: 48px;\n  color: var(--mat-sys-on-surface-variant, #9e9e9e);\n}\n\n.note-image-picker__title[_ngcontent-%COMP%] {\n  font-size: 12px;\n  line-height: 1.3;\n  color: var(--mat-sys-on-surface, #212121);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  padding: 0 4px;\n}\n\nmat-dialog-content[_ngcontent-%COMP%] {\n  padding: 16px 24px 8px !important;\n  max-height: calc(90vh - 120px);\n}\n\nmat-dialog-actions[_ngcontent-%COMP%] {\n  justify-content: space-between !important;\n  padding: 12px 24px 20px !important;\n}\n\n  .note-image-picker-panel .mat-mdc-dialog-container .mdc-dialog__surface {\n  overflow: hidden;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NoteImagePickerDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-note-image-picker-dialog', standalone: true, imports: [
                    NxsSpinnerComponent,
                    NxsThumbnailComponent,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatExpansionModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatInputModule,
                    MatCheckboxModule,
                    MatTooltipModule,
                ], changeDetection: ChangeDetectionStrategy.OnPush, providers: [provideNxsThumbnailCache()], template: "<div class=\"note-image-picker\">\n  <button\n    type=\"button\"\n    class=\"note-image-picker__close\"\n    mat-icon-button\n    mat-dialog-close\n    [attr.aria-label]=\"'document-detail.note-image-picker-dialog.close' | translate\"\n  >\n    <mat-icon>close</mat-icon>\n  </button>\n\n  <mat-dialog-content>\n    <mat-expansion-panel class=\"note-image-picker__filters\" [expanded]=\"true\">\n      <mat-expansion-panel-header>\n        <mat-panel-title>{{\n          'document-detail.note-image-picker-dialog.filters' | translate\n        }}</mat-panel-title>\n      </mat-expansion-panel-header>\n\n      <mat-form-field\n        appearance=\"outline\"\n        class=\"note-image-picker__search\"\n        subscriptSizing=\"dynamic\"\n      >\n        <mat-label>{{\n          'document-detail.note-image-picker-dialog.quick-search' | translate\n        }}</mat-label>\n\n        <input\n          matInput\n          [ngModel]=\"searchTerm()\"\n          (ngModelChange)=\"searchTerm.set($event)\"\n          (keydown.enter)=\"search()\"\n          autocomplete=\"off\"\n        />\n      </mat-form-field>\n\n      <div class=\"note-image-picker__actions\">\n        <button mat-stroked-button type=\"button\" [disabled]=\"loading()\" (click)=\"clearSearch()\">\n          {{ 'document-detail.note-image-picker-dialog.clear' | translate }}\n        </button>\n\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"loading()\"\n          (click)=\"search()\"\n        >\n          {{ 'document-detail.note-image-picker-dialog.search' | translate }}\n        </button>\n      </div>\n    </mat-expansion-panel>\n\n    <div class=\"note-image-picker__results-header\">\n      <div class=\"note-image-picker__results-left\">\n        <mat-checkbox\n          class=\"note-image-picker__select-all\"\n          [checked]=\"isAllSelected()\"\n          [indeterminate]=\"isIndeterminate()\"\n          [disabled]=\"loading() || results().length === 0\"\n          [matTooltip]=\"'document-detail.note-image-picker-dialog.select-all' | translate\"\n          [attr.aria-label]=\"'document-detail.note-image-picker-dialog.select-all' | translate\"\n          (click)=\"$event.stopPropagation()\"\n          (change)=\"toggleSelectAll()\"\n        ></mat-checkbox>\n\n        <span class=\"note-image-picker__results-count\">{{ resultsLabel() }}</span>\n      </div>\n\n      <mat-icon class=\"note-image-picker__view-icon\" aria-hidden=\"true\">grid_view</mat-icon>\n    </div>\n\n    @if (loading()) {\n      <div class=\"note-image-picker__loading\">\n        <nxs-spinner\n          diameter=\"32\"\n          [label]=\"'document-detail.note-image-picker-dialog.loading' | translate\"\n        />\n      </div>\n    } @else if (searchError()) {\n      <p class=\"note-image-picker__empty\">{{ searchError() }}</p>\n    } @else if (results().length === 0) {\n      <p class=\"note-image-picker__empty\">\n        {{ 'document-detail.note-image-picker-dialog.no-pictures-found' | translate }}\n      </p>\n    } @else {\n      <div\n        class=\"note-image-picker__grid\"\n        role=\"listbox\"\n        aria-multiselectable=\"true\"\n        [attr.aria-label]=\"'document-detail.note-image-picker-dialog.picture-documents' | translate\"\n      >\n        @for (doc of results(); track doc.uid) {\n          <button\n            type=\"button\"\n            class=\"note-image-picker__item\"\n            [class.note-image-picker__item--selected]=\"isSelected(doc.uid)\"\n            role=\"option\"\n            [attr.aria-selected]=\"isSelected(doc.uid)\"\n            (click)=\"toggleSelection(doc)\"\n          >\n            <div class=\"note-image-picker__thumb\">\n              @if (isSelected(doc.uid)) {\n                <span class=\"note-image-picker__check\" aria-hidden=\"true\">\n                  <mat-icon>check_circle</mat-icon>\n                </span>\n              }\n\n              <nxs-thumbnail class=\"note-image-picker__image\" [documentId]=\"doc.uid\">\n                <mat-icon class=\"note-image-picker__placeholder\">image</mat-icon>\n              </nxs-thumbnail>\n            </div>\n\n            <span class=\"note-image-picker__title\">{{ displayFileName(doc) }}</span>\n          </button>\n        }\n      </div>\n    }\n  </mat-dialog-content>\n\n  <mat-dialog-actions align=\"end\">\n    <button mat-stroked-button type=\"button\" mat-dialog-close>\n      {{ 'document-detail.note-image-picker-dialog.cancel' | translate }}\n    </button>\n\n    <button\n      mat-flat-button\n      color=\"primary\"\n      type=\"button\"\n      [disabled]=\"selectionService.selectedCount() === 0\"\n      (click)=\"confirm()\"\n    >\n      {{ 'document-detail.note-image-picker-dialog.select' | translate }}\n    </button>\n  </mat-dialog-actions>\n</div>\n", styles: [":host {\n  display: block;\n}\n\n.note-image-picker {\n  display: block;\n  position: relative;\n  min-width: min(860px, 94vw);\n}\n\n.note-image-picker__close {\n  position: absolute;\n  top: 4px;\n  right: 4px;\n  z-index: 1;\n  color: var(--mat-sys-on-surface-variant, #616161);\n}\n\n.note-image-picker__filters {\n  margin-bottom: 16px;\n  box-shadow: none !important;\n  border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  border-radius: 4px;\n}\n\n:host ::ng-deep .note-image-picker__filters .mat-expansion-panel-body {\n  padding: 0 16px 16px;\n}\n\n.note-image-picker__search {\n  width: 100%;\n  margin-bottom: 12px;\n}\n\n.note-image-picker__actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n\n.note-image-picker__results-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n}\n\n.note-image-picker__results-left {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n}\n\n.note-image-picker__select-all {\n  flex-shrink: 0;\n}\n\n.note-image-picker__results-count {\n  font-size: 13px;\n  color: var(--mat-sys-on-surface-variant, #616161);\n}\n\n.note-image-picker__view-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-on-surface-variant, #757575);\n}\n\n.note-image-picker__loading {\n  display: flex;\n  justify-content: center;\n  padding: 48px 0;\n}\n\n.note-image-picker__empty {\n  margin: 0;\n  padding: 48px 0;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #616161);\n  font-size: 14px;\n}\n\n.note-image-picker__grid {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 16px;\n  max-height: 420px;\n  overflow: auto;\n  padding: 4px 2px 8px;\n}\n\n.note-image-picker__item {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 8px;\n  padding: 0;\n  border: 2px solid transparent;\n  border-radius: 2px;\n  background: transparent;\n  cursor: pointer;\n  text-align: center;\n\n  &:hover .note-image-picker__thumb {\n    box-shadow: 0 1px 4px color-mix(in srgb, var(--mat-sys-shadow, #000) 12%, transparent);\n  }\n\n  &--selected {\n    border-color: var(--mat-sys-primary, #0066ff);\n\n    .note-image-picker__thumb {\n      box-shadow: inset 0 0 0 1px var(--mat-sys-primary, #0066ff);\n    }\n  }\n}\n\n.note-image-picker__thumb {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  aspect-ratio: 4 / 3;\n  overflow: hidden;\n  background: var(--mat-sys-surface-container-high, #eceff1);\n\n  .note-image-picker__image {\n    width: 100%;\n    height: 100%;\n    object-fit: contain;\n    background: var(--mat-sys-surface, #fff);\n  }\n}\n\n.note-image-picker__check {\n  position: absolute;\n  top: 6px;\n  left: 6px;\n  z-index: 1;\n  display: flex;\n  line-height: 0;\n\n  .mat-icon {\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n    color: var(--mat-sys-primary, #0066ff);\n    background: var(--mat-sys-surface, #fff);\n    border-radius: 50%;\n  }\n}\n\n.note-image-picker__placeholder {\n  font-size: 48px;\n  width: 48px;\n  height: 48px;\n  color: var(--mat-sys-on-surface-variant, #9e9e9e);\n}\n\n.note-image-picker__title {\n  font-size: 12px;\n  line-height: 1.3;\n  color: var(--mat-sys-on-surface, #212121);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  padding: 0 4px;\n}\n\nmat-dialog-content {\n  padding: 16px 24px 8px !important;\n  max-height: calc(90vh - 120px);\n}\n\nmat-dialog-actions {\n  justify-content: space-between !important;\n  padding: 12px 24px 20px !important;\n}\n\n::ng-deep .note-image-picker-panel .mat-mdc-dialog-container .mdc-dialog__surface {\n  overflow: hidden;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NoteImagePickerDialogComponent, { className: "NoteImagePickerDialogComponent", filePath: "libs/features/document-detail/src/lib/note-editor/note-image-picker-dialog.ts", lineNumber: 57 }); })();
