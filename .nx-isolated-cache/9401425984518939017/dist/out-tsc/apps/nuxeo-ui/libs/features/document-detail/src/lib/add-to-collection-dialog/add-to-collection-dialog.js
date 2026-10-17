import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentDetailService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import { NxsSpinnerComponent } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/select";
import * as i5 from "@angular/material/input";
import * as i6 from "@angular/material/button";
import * as i7 from "@angular/material/icon";
import * as i8 from "@angular/material/progress-spinner";
const _c0 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.uid;
function AddToCollectionDialogComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵelement(1, "nxs-spinner", 6);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "document-detail.add-to-collection-dialog.loading-collections"));
} }
function AddToCollectionDialogComponent_Conditional_5_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", col_r3.uid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(col_r3.title);
} }
function AddToCollectionDialogComponent_Conditional_5_Conditional_12_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 14);
} }
function AddToCollectionDialogComponent_Conditional_5_Conditional_12_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "add_circle");
    i0.ɵɵelementEnd();
} }
function AddToCollectionDialogComponent_Conditional_5_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 13);
    i0.ɵɵlistener("click", function AddToCollectionDialogComponent_Conditional_5_Conditional_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.createNewCollection()); });
    i0.ɵɵconditionalCreate(1, AddToCollectionDialogComponent_Conditional_5_Conditional_12_Conditional_1_Template, 1, 0, "mat-spinner", 14)(2, AddToCollectionDialogComponent_Conditional_5_Conditional_12_Conditional_2_Template, 2, 0, "mat-icon");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.creating());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.creating() ? 1 : 2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(5, 3, "document-detail.add-to-collection-dialog.create-named", i0.ɵɵpureFunction1(6, _c0, ctx_r1.searchTerm())), " ");
} }
function AddToCollectionDialogComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 7)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-select", 8);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function AddToCollectionDialogComponent_Conditional_5_Template_mat_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.selectedCollectionId, $event) || (ctx_r1.selectedCollectionId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵrepeaterCreate(6, AddToCollectionDialogComponent_Conditional_5_For_7_Template, 2, 2, "mat-option", 9, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "mat-form-field", 10)(9, "input", 11);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵlistener("ngModelChange", function AddToCollectionDialogComponent_Conditional_5_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.searchTerm.set($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(12, AddToCollectionDialogComponent_Conditional_5_Conditional_12_Template, 6, 8, "button", 12);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 7, "document-detail.add-to-collection-dialog.collections"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.selectedCollectionId);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(5, 9, "document-detail.add-to-collection-dialog.select-a-collection"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.filteredCollections());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 11, "document-detail.add-to-collection-dialog.search-or-create-collection"))("ngModel", ctx_r1.searchTerm());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(11, 13, "document-detail.add-to-collection-dialog.search-or-create-collection"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.showCreateOption() ? 12 : -1);
} }
function AddToCollectionDialogComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 5);
} }
function AddToCollectionDialogComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "document-detail.add-to-collection-dialog.add"), " ");
} }
export class AddToCollectionDialogComponent {
    dialogRef = inject((MatDialogRef));
    detailService = inject(DocumentDetailService);
    collections = signal([], ...(ngDevMode ? [{ debugName: "collections" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    adding = signal(false, ...(ngDevMode ? [{ debugName: "adding" }] : []));
    creating = signal(false, ...(ngDevMode ? [{ debugName: "creating" }] : []));
    searchTerm = signal('', ...(ngDevMode ? [{ debugName: "searchTerm" }] : []));
    selectedCollectionId = null;
    filteredCollections = computed(() => {
        const term = this.searchTerm().toLowerCase();
        const all = this.collections();
        if (!term)
            return all;
        return all.filter((c) => c.title.toLowerCase().includes(term));
    }, ...(ngDevMode ? [{ debugName: "filteredCollections" }] : []));
    showCreateOption = computed(() => {
        const term = this.searchTerm().trim();
        if (!term)
            return false;
        const exact = this.collections().some((c) => c.title.toLowerCase() === term.toLowerCase());
        return !exact;
    }, ...(ngDevMode ? [{ debugName: "showCreateOption" }] : []));
    ngOnInit() {
        this.detailService.getCollections().subscribe({
            next: (res) => {
                this.collections.set(res.entries);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }
    createNewCollection() {
        const title = this.searchTerm().trim();
        if (!title || this.creating())
            return;
        this.creating.set(true);
        this.detailService.createCollection(title).subscribe({
            next: (newDoc) => {
                this.collections.update((cols) => [...cols, newDoc]);
                this.selectedCollectionId = newDoc.uid;
                this.searchTerm.set('');
                this.creating.set(false);
            },
            error: () => this.creating.set(false),
        });
    }
    add() {
        if (!this.selectedCollectionId)
            return;
        this.adding.set(true);
        this.dialogRef.close(this.selectedCollectionId);
    }
    static ɵfac = function AddToCollectionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AddToCollectionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AddToCollectionDialogComponent, selectors: [["lib-add-to-collection-dialog"]], decls: 13, vars: 9, consts: [["mat-dialog-title", ""], [1, "dialog-loading"], ["align", "end"], ["mat-button", "", "mat-dialog-close", ""], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"], ["diameter", "18"], ["diameter", "24"], ["appearance", "outline", 1, "collection-field"], ["required", "", 3, "ngModelChange", "ngModel", "placeholder"], [3, "value"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "search-field"], ["matInput", "", "autocomplete", "off", 3, "ngModelChange", "placeholder", "ngModel"], [1, "create-collection-btn", 3, "disabled"], [1, "create-collection-btn", 3, "click", "disabled"], ["diameter", "16"]], template: function AddToCollectionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵconditionalCreate(4, AddToCollectionDialogComponent_Conditional_4_Template, 5, 3, "div", 1)(5, AddToCollectionDialogComponent_Conditional_5_Template, 13, 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-dialog-actions", 2)(7, "button", 3);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "button", 4);
            i0.ɵɵlistener("click", function AddToCollectionDialogComponent_Template_button_click_10_listener() { return ctx.add(); });
            i0.ɵɵconditionalCreate(11, AddToCollectionDialogComponent_Conditional_11_Template, 1, 0, "mat-spinner", 5)(12, AddToCollectionDialogComponent_Conditional_12_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 5, "document-detail.add-to-collection-dialog.add-to-collection"), "\n");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.loading() ? 4 : 5);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 7, "document-detail.add-to-collection-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.selectedCollectionId || ctx.adding());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.adding() ? 11 : 12);
        } }, dependencies: [NxsSpinnerComponent,
            FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, MatSelectModule, i4.MatSelect, i4.MatOption, MatInputModule, i5.MatInput, MatButtonModule, i6.MatButton, MatIconModule, i7.MatIcon, MatProgressSpinnerModule, i8.MatProgressSpinner, TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 400px;\n      }\n\n      mat-dialog-content[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n        padding-top: 8px !important;\n      }\n\n      .collection-field[_ngcontent-%COMP%], \n   .search-field[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n\n      .dialog-loading[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        padding: 16px 0;\n        color: var(--mat-sys-on-surface-variant);\n        font-size: 13px;\n      }\n\n      .create-collection-btn[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px 12px;\n        border: 1px dashed var(--mat-sys-primary);\n        border-radius: 6px;\n        background: var(--mat-sys-primary-container);\n        cursor: pointer;\n        font-size: 13px;\n        color: var(--mat-sys-on-primary-container);\n        font-weight: 500;\n        transition: background 0.15s;\n\n        &:hover:not(:disabled) {\n          background: color-mix(in srgb, var(--mat-sys-primary) 12%, var(--mat-sys-surface));\n        }\n\n        &:disabled {\n          opacity: 0.6;\n          cursor: default;\n        }\n\n        .mat-icon {\n          font-size: 20px;\n          width: 20px;\n          height: 20px;\n          color: var(--mat-sys-on-primary-container);\n        }\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        padding: 8px 24px 16px;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AddToCollectionDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-add-to-collection-dialog', standalone: true, imports: [
                    NxsSpinnerComponent,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatSelectModule,
                    MatInputModule,
                    MatButtonModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                ], template: "<h2 mat-dialog-title>\n  {{ 'document-detail.add-to-collection-dialog.add-to-collection' | translate }}\n</h2>\n\n<mat-dialog-content>\n  @if (loading()) {\n    <div class=\"dialog-loading\">\n      <nxs-spinner diameter=\"24\" />\n      <span>{{ 'document-detail.add-to-collection-dialog.loading-collections' | translate }}</span>\n    </div>\n  } @else {\n    <mat-form-field appearance=\"outline\" class=\"collection-field\">\n      <mat-label>{{\n        'document-detail.add-to-collection-dialog.collections' | translate\n      }}</mat-label>\n      <mat-select\n        [(ngModel)]=\"selectedCollectionId\"\n        [placeholder]=\"'document-detail.add-to-collection-dialog.select-a-collection' | translate\"\n        required\n      >\n        @for (col of filteredCollections(); track col.uid) {\n          <mat-option [value]=\"col.uid\">{{ col.title }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\" class=\"search-field\" subscriptSizing=\"dynamic\">\n      <!-- A placeholder is not an accessible name: it is announced inconsistently and\n           disappears the moment the user types, leaving the field unnamed. -->\n      <input\n        matInput\n        [placeholder]=\"\n          'document-detail.add-to-collection-dialog.search-or-create-collection' | translate\n        \"\n        [attr.aria-label]=\"\n          'document-detail.add-to-collection-dialog.search-or-create-collection' | translate\n        \"\n        [ngModel]=\"searchTerm()\"\n        (ngModelChange)=\"searchTerm.set($event)\"\n        autocomplete=\"off\"\n      />\n    </mat-form-field>\n\n    @if (showCreateOption()) {\n      <button class=\"create-collection-btn\" (click)=\"createNewCollection()\" [disabled]=\"creating()\">\n        @if (creating()) {\n          <mat-spinner diameter=\"16\" />\n        } @else {\n          <mat-icon>add_circle</mat-icon>\n        }\n        <span>\n          {{\n            'document-detail.add-to-collection-dialog.create-named'\n              | translate: { name: searchTerm() }\n          }}\n        </span>\n      </button>\n    }\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button mat-dialog-close>\n    {{ 'document-detail.add-to-collection-dialog.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"!selectedCollectionId || adding()\"\n    (click)=\"add()\"\n  >\n    @if (adding()) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'document-detail.add-to-collection-dialog.add' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 400px;\n      }\n\n      mat-dialog-content {\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n        padding-top: 8px !important;\n      }\n\n      .collection-field,\n      .search-field {\n        width: 100%;\n      }\n\n      .dialog-loading {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        padding: 16px 0;\n        color: var(--mat-sys-on-surface-variant);\n        font-size: 13px;\n      }\n\n      .create-collection-btn {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px 12px;\n        border: 1px dashed var(--mat-sys-primary);\n        border-radius: 6px;\n        background: var(--mat-sys-primary-container);\n        cursor: pointer;\n        font-size: 13px;\n        color: var(--mat-sys-on-primary-container);\n        font-weight: 500;\n        transition: background 0.15s;\n\n        &:hover:not(:disabled) {\n          background: color-mix(in srgb, var(--mat-sys-primary) 12%, var(--mat-sys-surface));\n        }\n\n        &:disabled {\n          opacity: 0.6;\n          cursor: default;\n        }\n\n        .mat-icon {\n          font-size: 20px;\n          width: 20px;\n          height: 20px;\n          color: var(--mat-sys-on-primary-container);\n        }\n      }\n\n      mat-dialog-actions {\n        padding: 8px 24px 16px;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AddToCollectionDialogComponent, { className: "AddToCollectionDialogComponent", filePath: "libs/features/document-detail/src/lib/add-to-collection-dialog/add-to-collection-dialog.ts", lineNumber: 96 }); })();
