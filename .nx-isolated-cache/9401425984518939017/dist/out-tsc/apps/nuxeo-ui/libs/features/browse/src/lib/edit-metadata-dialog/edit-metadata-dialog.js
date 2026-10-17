import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { BrowseService, DirectoryService, directoryPickerLabel, filterDirectoryPickerEntries, formatHierarchicalL10nLabel, groupL10nChildrenByParent, createExpiresErrorStateMatcher, isExpiresFieldValid, l10nEntryLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DateMaskPipe, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import { NxsToastService, provideNxsToast } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/input";
import * as i6 from "@angular/material/select";
import * as i7 from "@angular/material/datepicker";
import * as i8 from "@angular/material/progress-spinner";
import * as i9 from "@angular/material/chips";
import * as i10 from "@angular/material/icon";
const _c0 = ["expiresInput"];
const _c1 = () => ({ standalone: true });
const _c2 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.parentLabel;
function EditMetadataDialogComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-set", 10)(1, "mat-chip", 25);
    i0.ɵɵlistener("removed", function EditMetadataDialogComponent_Conditional_21_Template_mat_chip_removed_1_listener() { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.clearNature()); });
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "button", 26);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function EditMetadataDialogComponent_Conditional_21_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(); $event.stopPropagation(); return i0.ɵɵresetView(ctx_r3.clearNature()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "cancel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const natureId_r5 = ctx;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.naturePillLabel(natureId_r5), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(4, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c2, ctx_r3.naturePillLabel(natureId_r5))));
} }
function EditMetadataDialogComponent_For_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r6 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("value", entry_r6.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.directoryPickerLabel(entry_r6));
} }
function EditMetadataDialogComponent_For_37_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip", 25);
    i0.ɵɵlistener("removed", function EditMetadataDialogComponent_For_37_Template_mat_chip_removed_0_listener() { const id_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.removeSubject(id_r8)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 26);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function EditMetadataDialogComponent_For_37_Template_button_click_2_listener($event) { i0.ɵɵrestoreView(_r7); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const id_r8 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.subjectPillLabel(id_r8), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c2, ctx_r3.subjectPillLabel(id_r8))));
} }
function EditMetadataDialogComponent_For_44_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r9 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", entry_r9.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.l10nEntryLabel(entry_r9));
} }
function EditMetadataDialogComponent_For_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 16);
    i0.ɵɵrepeaterCreate(1, EditMetadataDialogComponent_For_44_For_2_Template, 2, 2, "mat-option", 14, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r10 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r10.parentLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r10.entries);
} }
function EditMetadataDialogComponent_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-set", 10)(1, "mat-chip", 25);
    i0.ɵɵlistener("removed", function EditMetadataDialogComponent_Conditional_52_Template_mat_chip_removed_1_listener() { i0.ɵɵrestoreView(_r12); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.clearCoverage()); });
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "button", 26);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function EditMetadataDialogComponent_Conditional_52_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r3 = i0.ɵɵnextContext(); $event.stopPropagation(); return i0.ɵɵresetView(ctx_r3.clearCoverage()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "cancel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const coverageId_r13 = ctx;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.coveragePillLabel(coverageId_r13), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(4, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c2, ctx_r3.coveragePillLabel(coverageId_r13))));
} }
function EditMetadataDialogComponent_For_59_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r14 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", entry_r14.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.l10nEntryLabel(entry_r14));
} }
function EditMetadataDialogComponent_For_59_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 16);
    i0.ɵɵrepeaterCreate(1, EditMetadataDialogComponent_For_59_For_2_Template, 2, 2, "mat-option", 14, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r15 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r15.parentLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r15.entries);
} }
function EditMetadataDialogComponent_Conditional_71_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "browse.edit-metadata-dialog.enter-a-valid-date"));
} }
function EditMetadataDialogComponent_Conditional_77_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 24);
} }
function EditMetadataDialogComponent_Conditional_78_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "browse.edit-metadata-dialog.save"), " ");
} }
export class EditMetadataDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    data = inject(MAT_DIALOG_DATA);
    browseService = inject(BrowseService);
    directoryService = inject(DirectoryService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    dateAdapter = inject(DateAdapter);
    dateFormats = inject(MAT_DATE_FORMATS);
    title = this.data.title;
    description = this.data.description;
    nature = this.data.nature;
    subjects = [...this.data.subjects];
    coverage = this.data.coverage;
    expires = this.data.expires ? new Date(this.data.expires) : null;
    expiresRawText = '';
    expiresErrorMatcher = createExpiresErrorStateMatcher(() => this.showExpiresError());
    expiresNgModel;
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    natureOptions = signal([], ...(ngDevMode ? [{ debugName: "natureOptions" }] : []));
    subjectOptions = signal([], ...(ngDevMode ? [{ debugName: "subjectOptions" }] : []));
    coverageOptions = signal([], ...(ngDevMode ? [{ debugName: "coverageOptions" }] : []));
    l10nEntryLabel = l10nEntryLabel;
    directoryPickerLabel = directoryPickerLabel;
    naturePanelSearch = '';
    subjectsPanelSearch = '';
    coveragePanelSearch = '';
    filteredNatureOptions() {
        return filterDirectoryPickerEntries(this.natureOptions(), this.naturePanelSearch);
    }
    groupedSubjectOptions() {
        return groupL10nChildrenByParent(this.subjectOptions(), this.subjectsPanelSearch);
    }
    groupedCoverageOptions() {
        return groupL10nChildrenByParent(this.coverageOptions(), this.coveragePanelSearch);
    }
    constructor() {
        this.directoryService
            .getEntries('nature')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => this.natureOptions.set(entries),
        });
        this.directoryService
            .getAllL10nEntries('l10nsubjects')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => this.subjectOptions.set(entries),
        });
        this.directoryService
            .getAllL10nEntries('l10ncoverage')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => this.coverageOptions.set(entries),
        });
    }
    onNaturePanelOpen(open) {
        if (!open) {
            this.naturePanelSearch = '';
            return;
        }
        this.directoryService
            .getEntries('nature')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => this.natureOptions.set(entries),
        });
    }
    naturePillLabel(id) {
        const entry = this.natureOptions().find((item) => item.id === id);
        return entry ? directoryPickerLabel(entry) : id;
    }
    subjectPillLabel(id) {
        return formatHierarchicalL10nLabel(id, this.subjectOptions());
    }
    coveragePillLabel(id) {
        return formatHierarchicalL10nLabel(id, this.coverageOptions());
    }
    clearNature() {
        this.nature = '';
    }
    clearCoverage() {
        this.coverage = '';
    }
    removeSubject(id) {
        this.subjects = this.subjects.filter((value) => value !== id);
    }
    onSubjectsPanelOpen(open) {
        if (!open) {
            this.subjectsPanelSearch = '';
            return;
        }
        this.loadL10nEntries('l10nsubjects', this.subjectOptions);
    }
    onCoveragePanelOpen(open) {
        if (!open) {
            this.coveragePanelSearch = '';
            return;
        }
        this.loadL10nEntries('l10ncoverage', this.coverageOptions);
    }
    loadL10nEntries(directoryName, target) {
        this.directoryService
            .getAllL10nEntries(directoryName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => target.set(entries),
        });
    }
    isExpiresValid() {
        const parsed = this.expiresRawText.trim()
            ? this.dateAdapter.parse(this.expiresRawText, this.dateFormats.parse.dateInput)
            : this.expires;
        return isExpiresFieldValid(this.expiresRawText, parsed);
    }
    showExpiresError() {
        return !this.isExpiresValid();
    }
    onExpiresInput(event) {
        this.expiresRawText = event.target.value;
        // Parse synchronously so validation and the saved payload agree even before ngModel updates.
        this.expires = this.dateAdapter.parse(this.expiresRawText.trim(), this.dateFormats.parse.dateInput);
        const ctrl = this.expiresNgModel?.control;
        if (ctrl) {
            ctrl.markAsDirty();
            ctrl.markAsTouched();
            ctrl.updateValueAndValidity({ emitEvent: false });
        }
    }
    onExpiresChange(value) {
        this.expires = value;
        if (value && !Number.isNaN(value.getTime())) {
            this.expiresRawText = '';
        }
    }
    save() {
        if (this.saving() || !this.isExpiresValid())
            return;
        this.saving.set(true);
        const properties = {
            'dc:title': this.title.trim(),
            'dc:description': this.description,
            'dc:nature': this.nature || null,
            'dc:subjects': this.subjects,
            'dc:coverage': this.coverage || null,
            'dc:expired': this.expires && !Number.isNaN(this.expires.getTime()) ? this.expires.toISOString() : null,
        };
        this.browseService
            .updateDocument(this.data.uid, properties)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => {
                this.saving.set(false);
                this.toast.show(this.translate.instant('browse.message.document-updated'));
                this.dialogRef.close(doc);
            },
            error: () => {
                this.saving.set(false);
                this.toast.error(this.translate.instant('browse.message.failed-to-update-document'));
            },
        });
    }
    static ɵfac = function EditMetadataDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || EditMetadataDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: EditMetadataDialogComponent, selectors: [["lib-edit-metadata-dialog"]], viewQuery: function EditMetadataDialogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.expiresNgModel = _t.first);
        } }, features: [i0.ɵɵProvidersFeature([provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()])], decls: 79, vars: 73, consts: [["natureSelect", ""], ["coverageSelect", ""], ["expiresInput", "ngModel"], ["picker", ""], ["mat-dialog-title", ""], ["appearance", "outline", 1, "full-width"], ["matInput", "", "required", "", 3, "ngModelChange", "ngModel"], ["matInput", "", "rows", "2", 3, "ngModelChange", "ngModel"], ["appearance", "outline", 1, "full-width", "vocab-field"], ["panelClass", "vocab-select-panel", 3, "ngModelChange", "openedChange", "selectionChange", "ngModel"], [1, "vocab-trigger-chips"], [1, "vocab-panel__search"], ["type", "text", 3, "ngModelChange", "click", "keydown", "placeholder", "ngModel", "ngModelOptions"], [1, "vocab-panel__list"], [3, "value"], ["multiple", "", "panelClass", "vocab-select-panel vocab-grouped-select-panel", 3, "ngModelChange", "openedChange", "ngModel"], [3, "label"], ["panelClass", "vocab-select-panel vocab-grouped-select-panel", 3, "ngModelChange", "openedChange", "selectionChange", "ngModel"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "full-width"], ["matInput", "", "name", "expires", 3, "ngModelChange", "input", "matDatepicker", "ngModel", "errorStateMatcher", "placeholder"], ["matIconSuffix", "", 3, "for"], ["align", "end"], ["mat-stroked-button", "", "mat-dialog-close", "", 3, "disabled"], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"], ["diameter", "18"], [3, "removed"], ["type", "button", "matChipRemove", "", 3, "click"]], template: function EditMetadataDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 4);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "mat-form-field", 5)(5, "mat-label");
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "input", 6);
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_input_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.title, $event) || (ctx.title = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "mat-form-field", 5)(10, "mat-label");
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "textarea", 7);
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_textarea_ngModelChange_13_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.description, $event) || (ctx.description = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "mat-form-field", 8)(15, "mat-label");
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "mat-select", 9, 0);
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_mat_select_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.nature, $event) || (ctx.nature = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("openedChange", function EditMetadataDialogComponent_Template_mat_select_openedChange_18_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onNaturePanelOpen($event)); })("selectionChange", function EditMetadataDialogComponent_Template_mat_select_selectionChange_18_listener() { i0.ɵɵrestoreView(_r1); const natureSelect_r2 = i0.ɵɵreference(19); return i0.ɵɵresetView(natureSelect_r2.close()); });
            i0.ɵɵelementStart(20, "mat-select-trigger");
            i0.ɵɵconditionalCreate(21, EditMetadataDialogComponent_Conditional_21_Template, 7, 7, "mat-chip-set", 10);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "div", 11)(23, "input", 12);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_input_ngModelChange_23_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.naturePanelSearch, $event) || (ctx.naturePanelSearch = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("click", function EditMetadataDialogComponent_Template_input_click_23_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function EditMetadataDialogComponent_Template_input_keydown_23_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.stopPropagation()); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(26, "div", 13);
            i0.ɵɵrepeaterCreate(27, EditMetadataDialogComponent_For_28_Template, 2, 2, "mat-option", 14, _forTrack0);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(29, "mat-form-field", 8)(30, "mat-label");
            i0.ɵɵtext(31);
            i0.ɵɵpipe(32, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "mat-select", 15);
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_mat_select_ngModelChange_33_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.subjects, $event) || (ctx.subjects = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("openedChange", function EditMetadataDialogComponent_Template_mat_select_openedChange_33_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onSubjectsPanelOpen($event)); });
            i0.ɵɵelementStart(34, "mat-select-trigger")(35, "mat-chip-set", 10);
            i0.ɵɵrepeaterCreate(36, EditMetadataDialogComponent_For_37_Template, 6, 7, "mat-chip", null, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(38, "div", 11)(39, "input", 12);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵpipe(41, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_input_ngModelChange_39_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.subjectsPanelSearch, $event) || (ctx.subjectsPanelSearch = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("click", function EditMetadataDialogComponent_Template_input_click_39_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function EditMetadataDialogComponent_Template_input_keydown_39_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.stopPropagation()); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(42, "div", 13);
            i0.ɵɵrepeaterCreate(43, EditMetadataDialogComponent_For_44_Template, 3, 1, "mat-optgroup", 16, _forTrack1);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(45, "mat-form-field", 8)(46, "mat-label");
            i0.ɵɵtext(47);
            i0.ɵɵpipe(48, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(49, "mat-select", 17, 1);
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_mat_select_ngModelChange_49_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.coverage, $event) || (ctx.coverage = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("openedChange", function EditMetadataDialogComponent_Template_mat_select_openedChange_49_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onCoveragePanelOpen($event)); })("selectionChange", function EditMetadataDialogComponent_Template_mat_select_selectionChange_49_listener() { i0.ɵɵrestoreView(_r1); const coverageSelect_r11 = i0.ɵɵreference(50); return i0.ɵɵresetView(coverageSelect_r11.close()); });
            i0.ɵɵelementStart(51, "mat-select-trigger");
            i0.ɵɵconditionalCreate(52, EditMetadataDialogComponent_Conditional_52_Template, 7, 7, "mat-chip-set", 10);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(53, "div", 11)(54, "input", 12);
            i0.ɵɵpipe(55, "translate");
            i0.ɵɵpipe(56, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function EditMetadataDialogComponent_Template_input_ngModelChange_54_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.coveragePanelSearch, $event) || (ctx.coveragePanelSearch = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("click", function EditMetadataDialogComponent_Template_input_click_54_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function EditMetadataDialogComponent_Template_input_keydown_54_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.stopPropagation()); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(57, "div", 13);
            i0.ɵɵrepeaterCreate(58, EditMetadataDialogComponent_For_59_Template, 3, 1, "mat-optgroup", 16, _forTrack1);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(60, "mat-form-field", 18)(61, "mat-label");
            i0.ɵɵtext(62);
            i0.ɵɵpipe(63, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(64, "input", 19, 2);
            i0.ɵɵpipe(66, "translate");
            i0.ɵɵpipe(67, "dateMask");
            i0.ɵɵlistener("ngModelChange", function EditMetadataDialogComponent_Template_input_ngModelChange_64_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onExpiresChange($event)); })("input", function EditMetadataDialogComponent_Template_input_input_64_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onExpiresInput($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(68, "mat-datepicker-toggle", 20)(69, "mat-datepicker", null, 3);
            i0.ɵɵconditionalCreate(71, EditMetadataDialogComponent_Conditional_71_Template, 3, 3, "mat-error");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(72, "mat-dialog-actions", 21)(73, "button", 22);
            i0.ɵɵtext(74);
            i0.ɵɵpipe(75, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(76, "button", 23);
            i0.ɵɵlistener("click", function EditMetadataDialogComponent_Template_button_click_76_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.save()); });
            i0.ɵɵconditionalCreate(77, EditMetadataDialogComponent_Conditional_77_Template, 1, 0, "mat-spinner", 24)(78, EditMetadataDialogComponent_Conditional_78_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_11_0;
            let tmp_27_0;
            const picker_r16 = i0.ɵɵreference(70);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 38, "browse.edit-metadata-dialog.edit"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 40, "browse.edit-metadata-dialog.title"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.title);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 42, "browse.edit-metadata-dialog.description"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.description);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 44, "browse.edit-metadata-dialog.nature"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.nature);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_11_0 = ctx.nature) ? 21 : -1, tmp_11_0);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(24, 46, "browse.edit-metadata-dialog.search"));
            i0.ɵɵtwoWayProperty("ngModel", ctx.naturePanelSearch);
            i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(70, _c1));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(25, 48, "browse.edit-metadata-dialog.search-nature"));
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.filteredNatureOptions());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 50, "browse.edit-metadata-dialog.subjects"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.subjects);
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.subjects);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(40, 52, "browse.edit-metadata-dialog.search"));
            i0.ɵɵtwoWayProperty("ngModel", ctx.subjectsPanelSearch);
            i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(71, _c1));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(41, 54, "browse.edit-metadata-dialog.search-subjects"));
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.groupedSubjectOptions());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 56, "browse.edit-metadata-dialog.coverage"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.coverage);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_27_0 = ctx.coverage) ? 52 : -1, tmp_27_0);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(55, 58, "browse.edit-metadata-dialog.search"));
            i0.ɵɵtwoWayProperty("ngModel", ctx.coveragePanelSearch);
            i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(72, _c1));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(56, 60, "browse.edit-metadata-dialog.search-coverage"));
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.groupedCoverageOptions());
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("expires-field-invalid", ctx.showExpiresError());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(63, 62, "browse.edit-metadata-dialog.expires"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", picker_r16)("ngModel", ctx.expires)("errorStateMatcher", ctx.expiresErrorMatcher)("placeholder", i0.ɵɵpipeBind1(67, 66, i0.ɵɵpipeBind1(66, 64, "common.date-mask")));
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("for", picker_r16);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.showExpiresError() ? 71 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(75, 68, "browse.edit-metadata-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.saving() || !ctx.title.trim() || !ctx.isExpiresValid());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() ? 77 : 78);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, MatFormFieldModule, i4.MatFormField, i4.MatLabel, i4.MatError, i4.MatSuffix, MatInputModule, i5.MatInput, MatSelectModule, i6.MatSelect, i6.MatSelectTrigger, i6.MatOption, i6.MatOptgroup, MatDatepickerModule, i7.MatDatepicker, i7.MatDatepickerInput, i7.MatDatepickerToggle, MatProgressSpinnerModule, i8.MatProgressSpinner, MatChipsModule, i9.MatChip, i9.MatChipRemove, i9.MatChipSet, MatIconModule, i10.MatIcon, DateMaskPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 480px;\n      }\n      mat-dialog-content[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding: 8px 24px !important;\n      }\n      .full-width[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        padding: 8px 24px 16px;\n      }\n\n      .expires-field-invalid[_ngcontent-%COMP%] {\n        ::ng-deep .mdc-notched-outline__leading,\n        ::ng-deep .mdc-notched-outline__notch,\n        ::ng-deep .mdc-notched-outline__trailing {\n          border-color: var(--mat-sys-error, #b3261e);\n        }\n      }\n\n        .mat-mdc-select-panel.vocab-select-panel {\n        display: flex;\n        flex-direction: column;\n        overflow: hidden;\n        max-height: 320px;\n        padding-top: 0;\n      }\n\n        .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search {\n        flex: 0 0 auto;\n        padding: 8px 12px;\n        border-bottom: 1px solid #e5e7eb;\n      }\n\n        .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search input {\n        width: 100%;\n        box-sizing: border-box;\n        padding: 8px 12px;\n        border: 1px solid #d1d5db;\n        border-radius: 4px;\n        font: inherit;\n        font-size: 0.875rem;\n      }\n\n        .mat-mdc-select-panel.vocab-select-panel .vocab-panel__list {\n        flex: 1 1 auto;\n        min-height: 0;\n        overflow-y: auto;\n      }\n\n        .vocab-grouped-select-panel .mat-mdc-optgroup-label, \n     .vocab-grouped-select-panel .mat-mdc-optgroup .mdc-list-group__subheader {\n        font-weight: 700;\n        font-size: 0.8125rem;\n        background: #fafafa;\n        padding: 10px 16px 6px;\n        border-bottom: 1px solid #f0f0f0;\n      }\n\n        .vocab-field .mat-mdc-select-trigger {\n        height: auto;\n        min-height: 24px;\n        overflow: visible;\n      }\n\n      .vocab-trigger-chips[_ngcontent-%COMP%] {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 4px;\n        width: 100%;\n        padding: 6px 8px 6px 12px;\n        box-sizing: border-box;\n      }\n\n        .vocab-trigger-chips .mdc-evolution-chip {\n        margin: 2px 4px 2px 0;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EditMetadataDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-edit-metadata-dialog', standalone: true, providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()], imports: [
                    DateMaskPipe,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatDatepickerModule,
                    MatProgressSpinnerModule,
                    MatChipsModule,
                    MatIconModule,
                ], template: "<h2 mat-dialog-title>{{ 'browse.edit-metadata-dialog.edit' | translate }}</h2>\n\n<mat-dialog-content>\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'browse.edit-metadata-dialog.title' | translate }}</mat-label>\n    <input matInput [(ngModel)]=\"title\" required />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'browse.edit-metadata-dialog.description' | translate }}</mat-label>\n    <textarea matInput [(ngModel)]=\"description\" rows=\"2\"></textarea>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'browse.edit-metadata-dialog.nature' | translate }}</mat-label>\n    <mat-select\n      #natureSelect\n      [(ngModel)]=\"nature\"\n      panelClass=\"vocab-select-panel\"\n      (openedChange)=\"onNaturePanelOpen($event)\"\n      (selectionChange)=\"natureSelect.close()\"\n    >\n      <mat-select-trigger>\n        @if (nature; as natureId) {\n          <mat-chip-set class=\"vocab-trigger-chips\">\n            <mat-chip (removed)=\"clearNature()\">\n              {{ naturePillLabel(natureId) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'shared.remove-item' | translate: { name: naturePillLabel(natureId) }\n                \"\n                (click)=\"$event.stopPropagation(); clearNature()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          </mat-chip-set>\n        }\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'browse.edit-metadata-dialog.search' | translate\"\n          [attr.aria-label]=\"'browse.edit-metadata-dialog.search-nature' | translate\"\n          [(ngModel)]=\"naturePanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (entry of filteredNatureOptions(); track entry.id) {\n          <mat-option [value]=\"entry.id\">{{ directoryPickerLabel(entry) }}</mat-option>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'browse.edit-metadata-dialog.subjects' | translate }}</mat-label>\n    <mat-select\n      [(ngModel)]=\"subjects\"\n      multiple\n      panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n      (openedChange)=\"onSubjectsPanelOpen($event)\"\n    >\n      <mat-select-trigger>\n        <mat-chip-set class=\"vocab-trigger-chips\">\n          @for (id of subjects; track id) {\n            <mat-chip (removed)=\"removeSubject(id)\">\n              {{ subjectPillLabel(id) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"'shared.remove-item' | translate: { name: subjectPillLabel(id) }\"\n                (click)=\"$event.stopPropagation()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          }\n        </mat-chip-set>\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'browse.edit-metadata-dialog.search' | translate\"\n          [attr.aria-label]=\"'browse.edit-metadata-dialog.search-subjects' | translate\"\n          [(ngModel)]=\"subjectsPanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (group of groupedSubjectOptions(); track group.parentLabel) {\n          <mat-optgroup [label]=\"group.parentLabel\">\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n            }\n          </mat-optgroup>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'browse.edit-metadata-dialog.coverage' | translate }}</mat-label>\n    <mat-select\n      #coverageSelect\n      [(ngModel)]=\"coverage\"\n      panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n      (openedChange)=\"onCoveragePanelOpen($event)\"\n      (selectionChange)=\"coverageSelect.close()\"\n    >\n      <mat-select-trigger>\n        @if (coverage; as coverageId) {\n          <mat-chip-set class=\"vocab-trigger-chips\">\n            <mat-chip (removed)=\"clearCoverage()\">\n              {{ coveragePillLabel(coverageId) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'shared.remove-item' | translate: { name: coveragePillLabel(coverageId) }\n                \"\n                (click)=\"$event.stopPropagation(); clearCoverage()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          </mat-chip-set>\n        }\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'browse.edit-metadata-dialog.search' | translate\"\n          [attr.aria-label]=\"'browse.edit-metadata-dialog.search-coverage' | translate\"\n          [(ngModel)]=\"coveragePanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (group of groupedCoverageOptions(); track group.parentLabel) {\n          <mat-optgroup [label]=\"group.parentLabel\">\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n            }\n          </mat-optgroup>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field\n    appearance=\"outline\"\n    subscriptSizing=\"dynamic\"\n    class=\"full-width\"\n    [class.expires-field-invalid]=\"showExpiresError()\"\n  >\n    <mat-label>{{ 'browse.edit-metadata-dialog.expires' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"expires\"\n      [matDatepicker]=\"picker\"\n      [ngModel]=\"expires\"\n      [errorStateMatcher]=\"expiresErrorMatcher\"\n      (ngModelChange)=\"onExpiresChange($event)\"\n      (input)=\"onExpiresInput($event)\"\n      #expiresInput=\"ngModel\"\n      [placeholder]=\"'common.date-mask' | translate | dateMask\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n    <mat-datepicker #picker />\n    @if (showExpiresError()) {\n      <mat-error>{{ 'browse.edit-metadata-dialog.enter-a-valid-date' | translate }}</mat-error>\n    }\n  </mat-form-field>\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-stroked-button mat-dialog-close [disabled]=\"saving()\">\n    {{ 'browse.edit-metadata-dialog.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"saving() || !title.trim() || !isExpiresValid()\"\n    (click)=\"save()\"\n  >\n    @if (saving()) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'browse.edit-metadata-dialog.save' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 480px;\n      }\n      mat-dialog-content {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        padding: 8px 24px !important;\n      }\n      .full-width {\n        width: 100%;\n      }\n      mat-dialog-actions {\n        padding: 8px 24px 16px;\n      }\n\n      .expires-field-invalid {\n        ::ng-deep .mdc-notched-outline__leading,\n        ::ng-deep .mdc-notched-outline__notch,\n        ::ng-deep .mdc-notched-outline__trailing {\n          border-color: var(--mat-sys-error, #b3261e);\n        }\n      }\n\n      ::ng-deep .mat-mdc-select-panel.vocab-select-panel {\n        display: flex;\n        flex-direction: column;\n        overflow: hidden;\n        max-height: 320px;\n        padding-top: 0;\n      }\n\n      ::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search {\n        flex: 0 0 auto;\n        padding: 8px 12px;\n        border-bottom: 1px solid #e5e7eb;\n      }\n\n      ::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search input {\n        width: 100%;\n        box-sizing: border-box;\n        padding: 8px 12px;\n        border: 1px solid #d1d5db;\n        border-radius: 4px;\n        font: inherit;\n        font-size: 0.875rem;\n      }\n\n      ::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__list {\n        flex: 1 1 auto;\n        min-height: 0;\n        overflow-y: auto;\n      }\n\n      ::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup-label,\n      ::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup .mdc-list-group__subheader {\n        font-weight: 700;\n        font-size: 0.8125rem;\n        background: #fafafa;\n        padding: 10px 16px 6px;\n        border-bottom: 1px solid #f0f0f0;\n      }\n\n      ::ng-deep .vocab-field .mat-mdc-select-trigger {\n        height: auto;\n        min-height: 24px;\n        overflow: visible;\n      }\n\n      .vocab-trigger-chips {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 4px;\n        width: 100%;\n        padding: 6px 8px 6px 12px;\n        box-sizing: border-box;\n      }\n\n      ::ng-deep .vocab-trigger-chips .mdc-evolution-chip {\n        margin: 2px 4px 2px 0;\n      }\n    "] }]
    }], () => [], { expiresNgModel: [{
            type: ViewChild,
            args: ['expiresInput']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(EditMetadataDialogComponent, { className: "EditMetadataDialogComponent", filePath: "libs/features/browse/src/lib/edit-metadata-dialog/edit-metadata-dialog.ts", lineNumber: 152 }); })();
