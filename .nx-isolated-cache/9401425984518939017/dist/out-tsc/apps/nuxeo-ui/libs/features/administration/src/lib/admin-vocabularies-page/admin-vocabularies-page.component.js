import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, forkJoin, switchMap } from 'rxjs';
import { DirectoryService, directoryAdminTableLabel, getDirectoryMetadata, vocabularyTableColumns, } from '@nuxeo/satori-platform/nuxeo-client';
import { ConfirmDialogComponent } from '@nuxeo/satori-platform/ui';
import { VocabularyEntryFormDialogComponent, } from '../vocabulary-entry-form-dialog/vocabulary-entry-form-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/form-field";
import * as i3 from "@angular/material/select";
import * as i4 from "@angular/material/table";
import * as i5 from "@angular/material/progress-spinner";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/button";
import * as i8 from "@angular/material/tooltip";
function AdminVocabulariesPageComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "mat-spinner", 5);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.loading"));
} }
function AdminVocabulariesPageComponent_Conditional_7_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const name_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", name_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(name_r3);
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "button", 11);
    i0.ɵɵlistener("click", function AdminVocabulariesPageComponent_Conditional_7_Conditional_8_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openCreateEntry()); });
    i0.ɵɵtext(2, " + Add Entry ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.loading() || ctx_r1.mutating());
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "mat-spinner", 5);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.loading"));
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.parent"), " ");
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.parentCellValue(row_r5));
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.id"), " ");
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r6 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r6.id);
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.label"), " ");
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.entryTableLabel(row_r7));
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.obsolete"), " ");
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r8 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", row_r8.obsolete ? i0.ɵɵpipeBind1(2, 1, "administration.yes") : "No", " ");
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.ordering"), " ");
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r9 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r9.ordering);
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 24);
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_19_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 25)(1, "div", 26)(2, "button", 27);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_19_Template_button_click_2_listener() { const row_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openEditEntry(row_r11)); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "button", 27);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵlistener("click", function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_19_Template_button_click_7_listener() { const row_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.confirmDeleteEntry(row_r11)); });
    i0.ɵɵelementStart(10, "mat-icon");
    i0.ɵɵtext(11, "delete_outline");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(3, 4, "admin.admin-vocabularies-page.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 6, "admin.admin-vocabularies-page.edit-entry"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(8, 8, "admin.admin-vocabularies-page.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 10, "admin.admin-vocabularies-page.delete-entry"));
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_tr_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 28);
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_tr_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 29);
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-vocabularies-page.no-entries-in-this-vocabulary"), " ");
} }
function AdminVocabulariesPageComponent_Conditional_7_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10)(1, "table", 12);
    i0.ɵɵelementContainerStart(2, 13);
    i0.ɵɵtemplate(3, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_3_Template, 3, 3, "th", 14)(4, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_4_Template, 2, 1, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 16);
    i0.ɵɵtemplate(6, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_6_Template, 3, 3, "th", 14)(7, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_7_Template, 2, 1, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 17);
    i0.ɵɵtemplate(9, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_9_Template, 3, 3, "th", 14)(10, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_10_Template, 2, 1, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 18);
    i0.ɵɵtemplate(12, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_12_Template, 3, 3, "th", 14)(13, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_13_Template, 3, 3, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(14, 19);
    i0.ɵɵtemplate(15, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_15_Template, 3, 3, "th", 14)(16, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_16_Template, 2, 1, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(17, 20);
    i0.ɵɵtemplate(18, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_th_18_Template, 1, 0, "th", 14)(19, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_td_19_Template, 12, 12, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(20, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_tr_20_Template, 1, 0, "tr", 21)(21, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_tr_21_Template, 1, 0, "tr", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(22, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_Conditional_22_Template, 3, 3, "p", 23);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r1.entries());
    i0.ɵɵadvance(19);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r1.columns());
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r1.columns());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.entries().length === 0 && ctx_r1.selectedDirectory() ? 22 : -1);
} }
function AdminVocabulariesPageComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 6)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-select", 7);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("ngModelChange", function AdminVocabulariesPageComponent_Conditional_7_Template_mat_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onDirectoryChange($event)); });
    i0.ɵɵrepeaterCreate(6, AdminVocabulariesPageComponent_Conditional_7_For_7_Template, 2, 2, "mat-option", 8, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(8, AdminVocabulariesPageComponent_Conditional_7_Conditional_8_Template, 3, 1, "div", 9);
    i0.ɵɵconditionalCreate(9, AdminVocabulariesPageComponent_Conditional_7_Conditional_9_Template, 3, 3, "div", 4)(10, AdminVocabulariesPageComponent_Conditional_7_Conditional_10_Template, 23, 4, "div", 10);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "admin.admin-vocabularies-page.vocabulary"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.selectedDirectory())("placeholder", i0.ɵɵpipeBind1(5, 7, "admin.admin-vocabularies-page.select-a-vocabulary"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.directoryNames());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.selectedDirectory() ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.loading() || ctx_r1.mutating() ? 9 : 10);
} }
export class AdminVocabulariesPageComponent {
    directoryService = inject(DirectoryService);
    translate = inject(TranslateService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    destroyRef = inject(DestroyRef);
    directoryNames = signal([], ...(ngDevMode ? [{ debugName: "directoryNames" }] : []));
    directoryCatalog = signal(new Map(), ...(ngDevMode ? [{ debugName: "directoryCatalog" }] : []));
    selectedDirectory = signal('', ...(ngDevMode ? [{ debugName: "selectedDirectory" }] : []));
    entries = signal([], ...(ngDevMode ? [{ debugName: "entries" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    loadingList = signal(false, ...(ngDevMode ? [{ debugName: "loadingList" }] : []));
    mutating = signal(false, ...(ngDevMode ? [{ debugName: "mutating" }] : []));
    loadRequestId = 0;
    selectedDirectoryMeta = computed(() => getDirectoryMetadata(this.directoryCatalog(), this.selectedDirectory()), ...(ngDevMode ? [{ debugName: "selectedDirectoryMeta" }] : []));
    columns = computed(() => vocabularyTableColumns(this.selectedDirectory(), this.selectedDirectoryMeta(), this.entries()), ...(ngDevMode ? [{ debugName: "columns" }] : []));
    ngOnInit() {
        this.loadingList.set(true);
        forkJoin({
            catalog: this.directoryService.getDirectoryCatalog(),
            names: this.directoryService.listDirectoryNames(),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ catalog, names }) => {
                this.directoryNames.set(names);
                this.directoryCatalog.set(catalog);
                this.loadingList.set(false);
                if (names.length && !this.selectedDirectory()) {
                    const preferred = names.find((name) => name.toLowerCase() === 'country') ?? names[0];
                    this.selectedDirectory.set(preferred);
                    this.loadEntries(preferred);
                }
            },
            error: () => this.loadingList.set(false),
        });
    }
    onDirectoryChange(name) {
        this.selectedDirectory.set(name);
        this.loadEntries(name);
    }
    parentCellValue(row) {
        return row.parent ?? '—';
    }
    entryTableLabel(row) {
        return directoryAdminTableLabel(row);
    }
    loadEntries(directoryName) {
        if (!directoryName) {
            this.entries.set([]);
            return;
        }
        const requestId = ++this.loadRequestId;
        this.loading.set(true);
        this.directoryService
            .getAdminEntries(directoryName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (rows) => {
                if (requestId !== this.loadRequestId)
                    return;
                this.entries.set(rows);
                this.loading.set(false);
            },
            error: () => {
                if (requestId !== this.loadRequestId)
                    return;
                this.entries.set([]);
                this.loading.set(false);
                this.snackBar.open(this.translate.instant('admin.message.failed-to-load-vocabulary-entries'), this.translate.instant('common.dismiss'), { duration: 4000 });
            },
        });
    }
    openCreateEntry() {
        const directoryName = this.selectedDirectory();
        if (!directoryName)
            return;
        this.openEntryDialog({
            mode: 'create',
            directoryName,
            directoryMeta: this.selectedDirectoryMeta(),
            siblingEntries: this.entries(),
        });
    }
    openEditEntry(entry) {
        const directoryName = this.selectedDirectory();
        if (!directoryName)
            return;
        this.openEntryDialog({
            mode: 'edit',
            directoryName,
            directoryMeta: this.selectedDirectoryMeta(),
            entry,
            siblingEntries: this.entries(),
        });
    }
    confirmDeleteEntry(entry) {
        const directoryName = this.selectedDirectory();
        if (!directoryName)
            return;
        this.dialog
            .open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.delete-vocabulary-entry'),
                message: this.translate.instant('confirm.delete-vocabulary-entry-named', {
                    name: entry.id,
                    directory: directoryName,
                }),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        })
            .afterClosed()
            .pipe(filter((confirmed) => confirmed === true), switchMap(() => {
            this.mutating.set(true);
            return this.directoryService.deleteEntry(directoryName, entry.id);
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.mutating.set(false);
                this.snackBar.open(this.translate.instant('admin.message.entry-deleted'), this.translate.instant('common.dismiss'), { duration: 3000 });
                this.loadEntries(directoryName);
            },
            error: () => {
                this.mutating.set(false);
                this.snackBar.open(this.translate.instant('admin.message.failed-to-delete-entry'), this.translate.instant('common.dismiss'), { duration: 4000 });
            },
        });
    }
    openEntryDialog(data) {
        this.dialog
            .open(VocabularyEntryFormDialogComponent, { data, width: '480px' })
            .afterClosed()
            .pipe(filter((result) => !!result), takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => this.saveEntry(data, result));
    }
    saveEntry(dialogData, result) {
        const directoryName = dialogData.directoryName;
        const directoryMeta = getDirectoryMetadata(this.directoryCatalog(), directoryName);
        const values = {
            id: result.id,
            label: result.label,
            ordering: result.ordering,
            obsolete: result.obsolete,
            parent: result.parent,
        };
        this.mutating.set(true);
        const request$ = result.mode === 'create'
            ? this.directoryService.createEntry(directoryName, values, directoryMeta)
            : this.directoryService.updateEntry(directoryName, dialogData.entry?.id ?? result.id, values, directoryMeta);
        request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.mutating.set(false);
                const action = result.mode === 'create' ? 'created' : 'updated';
                this.snackBar.open(this.translate.instant(action === 'created'
                    ? 'admin.vocabularies.entry-created'
                    : 'admin.vocabularies.entry-updated'), this.translate.instant('common.dismiss'), { duration: 3000 });
                this.loadEntries(directoryName);
            },
            error: () => {
                this.mutating.set(false);
                this.snackBar.open(this.translate.instant('admin.message.failed-to-save-entry'), this.translate.instant('common.dismiss'), { duration: 4000 });
            },
        });
    }
    static ɵfac = function AdminVocabulariesPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminVocabulariesPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminVocabulariesPageComponent, selectors: [["lib-admin-vocabularies-page"]], decls: 8, vars: 4, consts: [[1, "voc-page"], [1, "voc-page__header"], ["role", "heading", "aria-level", "1", 1, "voc-page__title"], [1, "voc-card", "mat-elevation-z1"], [1, "voc-center"], ["diameter", "36"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "voc-select"], [3, "ngModelChange", "ngModel", "placeholder"], [3, "value"], [1, "voc-toolbar"], [1, "voc-table-wrap"], ["type", "button", 1, "voc-add-entry", 3, "click", "disabled"], ["mat-table", "", 1, "voc-table", 3, "dataSource"], ["matColumnDef", "parent"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "id"], ["matColumnDef", "label"], ["matColumnDef", "obsolete"], ["matColumnDef", "ordering"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [1, "voc-empty"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "voc-row-actions"], ["type", "button", "mat-icon-button", "", 3, "click", "matTooltip"], ["mat-header-row", ""], ["mat-row", ""]], template: function AdminVocabulariesPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "div", 3);
            i0.ɵɵconditionalCreate(6, AdminVocabulariesPageComponent_Conditional_6_Template, 3, 3, "div", 4)(7, AdminVocabulariesPageComponent_Conditional_7_Template, 11, 9);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 2, "admin.admin-vocabularies-page.vocabularies"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.loadingList() ? 6 : 7);
        } }, dependencies: [FormsModule, i1.NgControlStatus, i1.NgModel, MatFormFieldModule, i2.MatFormField, i2.MatLabel, MatSelectModule, i3.MatSelect, i3.MatOption, MatTableModule, i4.MatTable, i4.MatHeaderCellDef, i4.MatHeaderRowDef, i4.MatColumnDef, i4.MatCellDef, i4.MatRowDef, i4.MatHeaderCell, i4.MatCell, i4.MatHeaderRow, i4.MatRow, MatProgressSpinnerModule, i5.MatProgressSpinner, MatIconModule, i6.MatIcon, MatButtonModule, i7.MatIconButton, MatDialogModule,
            MatSnackBarModule,
            MatTooltipModule, i8.MatTooltip, TranslatePipe], styles: [".voc-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.voc-page__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n}\n\n.voc-page__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.voc-card[_ngcontent-%COMP%] {\n  padding: 1.25rem;\n  border-radius: var(--admin-radius-1, 8px);\n  background: var(--mat-sys-surface, #fff);\n}\n\n.voc-select[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 420px;\n  margin-bottom: 1rem;\n}\n\n.voc-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  margin: -0.25rem 0 0.75rem;\n}\n\n.voc-add-entry[_ngcontent-%COMP%] {\n  border: none;\n  background: none;\n  padding: 0;\n  font: inherit;\n  font-size: 0.9rem;\n  font-weight: 500;\n  color: var(--mat-sys-primary, #1565c0);\n  cursor: pointer;\n}\n\n.voc-add-entry[_ngcontent-%COMP%]:hover:not(:disabled) {\n  text-decoration: underline;\n}\n\n.voc-add-entry[_ngcontent-%COMP%]:disabled {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.38));\n  cursor: default;\n}\n\n.voc-table-wrap[_ngcontent-%COMP%] {\n  overflow: auto;\n}\n\n.voc-table[_ngcontent-%COMP%] {\n  width: 100%;\n  min-width: 720px;\n}\n\n.voc-empty[_ngcontent-%COMP%] {\n  margin: 0.5rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  font-size: 0.9rem;\n}\n\n.voc-center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 1.5rem;\n}\n\n.voc-page[_ngcontent-%COMP%]   .mat-mdc-form-field[_ngcontent-%COMP%] {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.voc-table[_ngcontent-%COMP%]   th.mat-mdc-header-cell[_ngcontent-%COMP%], \n.voc-table[_ngcontent-%COMP%]   td.mat-mdc-cell[_ngcontent-%COMP%] {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n  vertical-align: middle;\n}\n\n.voc-table[_ngcontent-%COMP%]   .mat-column-actions[_ngcontent-%COMP%] {\n  width: 1%;\n  white-space: nowrap;\n  padding-right: 0.25rem;\n}\n\n.voc-row-actions[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  flex-wrap: nowrap;\n  gap: 0;\n}\n\n@media (max-width: 900px) {\n  .voc-page[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminVocabulariesPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-vocabularies-page', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatFormFieldModule,
                    MatSelectModule,
                    MatTableModule,
                    MatProgressSpinnerModule,
                    MatIconModule,
                    MatButtonModule,
                    MatDialogModule,
                    MatSnackBarModule,
                    MatTooltipModule,
                ], template: "<div class=\"voc-page\">\n  <header class=\"voc-page__header\">\n    <div class=\"voc-page__title\" role=\"heading\" aria-level=\"1\">\n      {{ 'admin.admin-vocabularies-page.vocabularies' | translate }}\n    </div>\n  </header>\n\n  <div class=\"voc-card mat-elevation-z1\">\n    @if (loadingList()) {\n      <div class=\"voc-center\">\n        <mat-spinner\n          diameter=\"36\"\n          [attr.aria-label]=\"'admin.admin-vocabularies-page.loading' | translate\"\n        />\n      </div>\n    } @else {\n      <mat-form-field appearance=\"outline\" class=\"voc-select\" subscriptSizing=\"dynamic\">\n        <mat-label>{{ 'admin.admin-vocabularies-page.vocabulary' | translate }}</mat-label>\n        <mat-select\n          [ngModel]=\"selectedDirectory()\"\n          (ngModelChange)=\"onDirectoryChange($event)\"\n          [placeholder]=\"'admin.admin-vocabularies-page.select-a-vocabulary' | translate\"\n        >\n          @for (name of directoryNames(); track name) {\n            <mat-option [value]=\"name\">{{ name }}</mat-option>\n          }\n        </mat-select>\n      </mat-form-field>\n\n      @if (selectedDirectory()) {\n        <div class=\"voc-toolbar\">\n          <button\n            type=\"button\"\n            class=\"voc-add-entry\"\n            (click)=\"openCreateEntry()\"\n            [disabled]=\"loading() || mutating()\"\n          >\n            + Add Entry\n          </button>\n        </div>\n      }\n\n      @if (loading() || mutating()) {\n        <div class=\"voc-center\">\n          <mat-spinner\n            diameter=\"36\"\n            [attr.aria-label]=\"'admin.admin-vocabularies-page.loading' | translate\"\n          />\n        </div>\n      } @else {\n        <div class=\"voc-table-wrap\">\n          <table mat-table [dataSource]=\"entries()\" class=\"voc-table\">\n            <ng-container matColumnDef=\"parent\">\n              <th mat-header-cell *matHeaderCellDef>\n                {{ 'admin.admin-vocabularies-page.parent' | translate }}\n              </th>\n              <td mat-cell *matCellDef=\"let row\">{{ parentCellValue(row) }}</td>\n            </ng-container>\n            <ng-container matColumnDef=\"id\">\n              <th mat-header-cell *matHeaderCellDef>\n                {{ 'admin.admin-vocabularies-page.id' | translate }}\n              </th>\n              <td mat-cell *matCellDef=\"let row\">{{ row.id }}</td>\n            </ng-container>\n            <ng-container matColumnDef=\"label\">\n              <th mat-header-cell *matHeaderCellDef>\n                {{ 'admin.admin-vocabularies-page.label' | translate }}\n              </th>\n              <td mat-cell *matCellDef=\"let row\">{{ entryTableLabel(row) }}</td>\n            </ng-container>\n            <ng-container matColumnDef=\"obsolete\">\n              <th mat-header-cell *matHeaderCellDef>\n                {{ 'admin.admin-vocabularies-page.obsolete' | translate }}\n              </th>\n              <td mat-cell *matCellDef=\"let row\">\n                {{ row.obsolete ? ('administration.yes' | translate) : 'No' }}\n              </td>\n            </ng-container>\n            <ng-container matColumnDef=\"ordering\">\n              <th mat-header-cell *matHeaderCellDef>\n                {{ 'admin.admin-vocabularies-page.ordering' | translate }}\n              </th>\n              <td mat-cell *matCellDef=\"let row\">{{ row.ordering }}</td>\n            </ng-container>\n            <ng-container matColumnDef=\"actions\">\n              <th mat-header-cell *matHeaderCellDef></th>\n              <td mat-cell *matCellDef=\"let row\">\n                <div class=\"voc-row-actions\">\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"openEditEntry(row)\"\n                    [attr.aria-label]=\"'admin.admin-vocabularies-page.edit-entry' | translate\"\n                    [matTooltip]=\"'admin.admin-vocabularies-page.edit' | translate\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"confirmDeleteEntry(row)\"\n                    [attr.aria-label]=\"'admin.admin-vocabularies-page.delete-entry' | translate\"\n                    [matTooltip]=\"'admin.admin-vocabularies-page.delete' | translate\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </div>\n              </td>\n            </ng-container>\n            <tr mat-header-row *matHeaderRowDef=\"columns()\"></tr>\n            <tr mat-row *matRowDef=\"let row; columns: columns()\"></tr>\n          </table>\n          @if (entries().length === 0 && selectedDirectory()) {\n            <p class=\"voc-empty\">\n              {{ 'admin.admin-vocabularies-page.no-entries-in-this-vocabulary' | translate }}\n            </p>\n          }\n        </div>\n      }\n    }\n  </div>\n</div>\n", styles: [".voc-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.voc-page__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n}\n\n.voc-page__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.voc-card {\n  padding: 1.25rem;\n  border-radius: var(--admin-radius-1, 8px);\n  background: var(--mat-sys-surface, #fff);\n}\n\n.voc-select {\n  width: 100%;\n  max-width: 420px;\n  margin-bottom: 1rem;\n}\n\n.voc-toolbar {\n  display: flex;\n  justify-content: flex-end;\n  margin: -0.25rem 0 0.75rem;\n}\n\n.voc-add-entry {\n  border: none;\n  background: none;\n  padding: 0;\n  font: inherit;\n  font-size: 0.9rem;\n  font-weight: 500;\n  color: var(--mat-sys-primary, #1565c0);\n  cursor: pointer;\n}\n\n.voc-add-entry:hover:not(:disabled) {\n  text-decoration: underline;\n}\n\n.voc-add-entry:disabled {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.38));\n  cursor: default;\n}\n\n.voc-table-wrap {\n  overflow: auto;\n}\n\n.voc-table {\n  width: 100%;\n  min-width: 720px;\n}\n\n.voc-empty {\n  margin: 0.5rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  font-size: 0.9rem;\n}\n\n.voc-center {\n  display: flex;\n  justify-content: center;\n  padding: 1.5rem;\n}\n\n.voc-page .mat-mdc-form-field {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.voc-table th.mat-mdc-header-cell,\n.voc-table td.mat-mdc-cell {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n  vertical-align: middle;\n}\n\n.voc-table .mat-column-actions {\n  width: 1%;\n  white-space: nowrap;\n  padding-right: 0.25rem;\n}\n\n.voc-row-actions {\n  display: inline-flex;\n  align-items: center;\n  flex-wrap: nowrap;\n  gap: 0;\n}\n\n@media (max-width: 900px) {\n  .voc-page {\n    padding: 1rem;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminVocabulariesPageComponent, { className: "AdminVocabulariesPageComponent", filePath: "libs/features/administration/src/lib/admin-vocabularies-page/admin-vocabularies-page.component.ts", lineNumber: 52 }); })();
