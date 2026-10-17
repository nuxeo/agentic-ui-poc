import { Component, inject, signal } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentDetailService, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import { provideTranslatedDatepickerIntl } from '../datepicker-intl/translated-datepicker-intl';
import { provideSatoriDateAdapter } from '../date-adapter/satori-date-adapter';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/select";
import * as i6 from "@angular/material/button";
import * as i7 from "@angular/material/radio";
import * as i8 from "@angular/material/checkbox";
import * as i9 from "@angular/material/datepicker";
import * as i10 from "@angular/material/autocomplete";
import * as i11 from "@angular/material/icon";
const _forTrack0 = ($index, $item) => $item.value;
const _forTrack1 = ($index, $item) => $item.id;
function ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "shared-ui.share-saved-search-add-permission-dialog.please-enter-3-or-more-characters"));
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_9_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 6)(1, "mat-icon", 24);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 25);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const suggestion_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", suggestion_r4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(suggestion_r4.type === "USER_TYPE" ? "person" : "groups");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(suggestion_r4.displayLabel);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(suggestion_r4.id);
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_9_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "shared-ui.share-saved-search-add-permission-dialog.no-users-groups-found"));
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_9_For_1_Template, 7, 4, "mat-option", 6, _forTrack1, false, ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_9_ForEmpty_2_Template, 3, 3, "mat-option", 23);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(ctx_r2.suggestions());
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 20);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "mat-form-field", 4)(4, "input", 21);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("ngModelChange", function ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onSearchChange($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "mat-autocomplete", 22, 2);
    i0.ɵɵlistener("optionSelected", function ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Template_mat_autocomplete_optionSelected_6_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onSuggestionSelected($event.option.value)); });
    i0.ɵɵconditionalCreate(8, ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_8_Template, 3, 3, "mat-option", 23)(9, ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Conditional_9_Template, 3, 1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const principalAuto_r5 = i0.ɵɵreference(7);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 6, "shared-ui.share-saved-search-add-permission-dialog.user-group"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(5, 8, "shared-ui.share-saved-search-add-permission-dialog.search-for-users-and-groups"))("ngModel", ctx_r2.searchText)("matAutocomplete", principalAuto_r5);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("displayWith", ctx_r2.displaySuggestion);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.searchText.trim().length < 3 ? 8 : 9);
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 27);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "shared-ui.share-saved-search-add-permission-dialog.user-group-2"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.searchText);
} }
function ShareSavedSearchAddPermissionDialogComponent_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r6.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, opt_r6));
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "label", 28);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-form-field", 4)(5, "textarea", 29);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchAddPermissionDialogComponent_Conditional_44_Template_textarea_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.notifyComment, $event) || (ctx_r2.notifyComment = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "shared-ui.share-saved-search-add-permission-dialog.notification-email"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.notifyComment);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(6, 5, "shared-ui.share-saved-search-add-permission-dialog.hi-could-you-comment-on-this"));
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 30);
    i0.ɵɵlistener("click", function ShareSavedSearchAddPermissionDialogComponent_Conditional_50_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.create(false)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.isSubmitDisabled());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "shared-ui.share-saved-search-add-permission-dialog.update"), " ");
} }
function ShareSavedSearchAddPermissionDialogComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 30);
    i0.ɵɵlistener("click", function ShareSavedSearchAddPermissionDialogComponent_Conditional_51_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.create(true)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 30);
    i0.ɵɵlistener("click", function ShareSavedSearchAddPermissionDialogComponent_Conditional_51_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.create(false)); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.isSubmitDisabled());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 4, "shared-ui.share-saved-search-add-permission-dialog.create-and-add-another"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.isSubmitDisabled());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 6, "shared-ui.share-saved-search-add-permission-dialog.create"), " ");
} }
const RIGHT_OPTIONS = [
    { value: 'Read', labelKey: 'permission.read', label: 'Read' },
    { value: 'ReadWrite', labelKey: 'permission.read-write', label: 'Edit' },
    { value: 'Everything', labelKey: 'permission.everything', label: 'Manage everything' },
    { value: 'ReadCanCollect', labelKey: 'permission.read-can-collect', label: 'Can collect' },
];
export class ShareSavedSearchAddPermissionDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
    detailService = inject(DocumentDetailService);
    searchSubject = new Subject();
    suggestions = signal([], ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    rightOptions = RIGHT_OPTIONS;
    searchText = '';
    selectedPrincipal = null;
    right = 'Read';
    timeFrameMode = 'permanent';
    beginDate = null;
    endDate = null;
    sendNotify = true;
    notifyComment = '';
    createdEntries = [];
    isEditMode = !!this.data.initialData;
    constructor() {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged(), switchMap((term) => term.trim().length >= 3 ? this.detailService.searchUsersGroups(term.trim()) : of([])), takeUntilDestroyed())
            .subscribe((results) => this.suggestions.set(results));
        if (this.isEditMode && this.data.initialData) {
            this.initializeFormWithData(this.data.initialData);
        }
    }
    initializeFormWithData(data) {
        this.searchText = data.userGroup;
        // Create a mock UserGroupSuggestion from the stored data
        this.selectedPrincipal = {
            id: data.userGroup,
            displayLabel: data.userGroup,
            type: data.grantedBy === 'Group' ? 'GROUP_TYPE' : 'USER_TYPE',
            email: undefined,
            username: undefined,
            groupname: undefined,
        };
        // Normalize the right value to match options
        this.right = this.normalizeRightValue(data.right);
        if (data.timeFrame === 'Permanent') {
            this.timeFrameMode = 'permanent';
            this.beginDate = null;
            this.endDate = null;
        }
        else {
            this.timeFrameMode = 'date-based';
            if (data.timeFrame.startsWith('Until ')) {
                this.beginDate = null;
                this.endDate = this.parseDate(data.timeFrame.slice(6).trim());
            }
            else if (data.timeFrame.startsWith('From ')) {
                this.beginDate = this.parseDate(data.timeFrame.slice(5).trim());
                this.endDate = null;
            }
            else {
                const dateRange = data.timeFrame.split(' - ');
                if (dateRange.length === 2) {
                    this.beginDate = this.parseDate(dateRange[0].trim());
                    this.endDate = this.parseDate(dateRange[1].trim());
                }
            }
        }
        this.sendNotify = false;
    }
    normalizeRightValue(value) {
        // Map various right values to the standardized options
        const normalizedMap = {
            Read: 'Read',
            Write: 'ReadWrite',
            Edit: 'ReadWrite',
            ReadWrite: 'ReadWrite',
            Manage: 'Everything',
            'Manage everything': 'Everything',
            Everything: 'Everything',
            'Can collect': 'ReadCanCollect',
            ReadCanCollect: 'ReadCanCollect',
        };
        return normalizedMap[value] || 'Read'; // Default to 'Read' if no match
    }
    parseDate(dateStr) {
        if (!dateStr)
            return null;
        try {
            // YYYY-MM-DD (ISO date)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [yyyy, mm, dd] = dateStr.split('-');
                return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
            }
            // MM/DD/YYYY (legacy format)
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                const [mm, dd, yyyy] = dateStr.split('/');
                return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
            }
            // ISO or other date-like strings
            const parsed = new Date(dateStr);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        catch {
            return null;
        }
    }
    onSearchChange(value) {
        this.searchText = value;
        this.selectedPrincipal = null;
        this.searchSubject.next(value);
    }
    onSuggestionSelected(suggestion) {
        this.selectedPrincipal = suggestion;
        this.searchText = suggestion.displayLabel;
    }
    displaySuggestion(suggestion) {
        if (!suggestion)
            return '';
        return typeof suggestion === 'string' ? suggestion : suggestion.displayLabel;
    }
    create(andAddAnother) {
        if (!this.selectedPrincipal || this.saving())
            return;
        this.saving.set(true);
        const entry = this.buildResultEntry();
        if (this.isEditMode) {
            this.dialogRef.close([entry]);
        }
        else {
            this.createdEntries.push(entry);
            this.saving.set(false);
            if (andAddAnother) {
                this.resetForm();
                return;
            }
            this.dialogRef.close(this.createdEntries);
        }
    }
    cancel() {
        this.dialogRef.close(null);
    }
    isSubmitDisabled() {
        return !this.selectedPrincipal || this.saving();
    }
    buildResultEntry() {
        const principal = this.selectedPrincipal;
        const userGroup = principal?.displayLabel || this.searchText.trim();
        const grantedBy = this.isEditMode && this.data.initialData?.grantedBy
            ? this.data.initialData.grantedBy
            : principal?.type === 'GROUP_TYPE'
                ? 'Group'
                : 'User';
        if (this.timeFrameMode === 'permanent') {
            return {
                userGroup,
                right: this.right,
                timeFrame: 'Permanent',
                grantedBy,
            };
        }
        const from = this.beginDate ? this.formatDate(this.beginDate) : null;
        const to = this.endDate ? this.formatDate(this.endDate) : null;
        let timeFrame;
        if (from && to) {
            timeFrame = `${from} - ${to}`;
        }
        else if (from) {
            timeFrame = `From ${from}`;
        }
        else if (to) {
            timeFrame = `Until ${to}`;
        }
        else {
            timeFrame = 'Permanent';
        }
        return {
            userGroup,
            right: this.right,
            timeFrame,
            grantedBy,
        };
    }
    resetForm() {
        this.searchText = '';
        this.selectedPrincipal = null;
        this.right = 'Read';
        this.timeFrameMode = 'permanent';
        this.beginDate = null;
        this.endDate = null;
        this.sendNotify = true;
        this.notifyComment = '';
        this.suggestions.set([]);
    }
    formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    static ɵfac = function ShareSavedSearchAddPermissionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ShareSavedSearchAddPermissionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ShareSavedSearchAddPermissionDialogComponent, selectors: [["lib-share-saved-search-add-permission-dialog"]], features: [i0.ɵɵProvidersFeature([provideTranslatedDatepickerIntl(), provideSatoriDateAdapter()])], decls: 52, vars: 41, consts: [["fromPicker", ""], ["toPicker", ""], ["principalAuto", "matAutocomplete"], ["mat-dialog-title", ""], ["appearance", "outline", 1, "full-width"], [3, "ngModelChange", "ngModel"], [3, "value"], [1, "time-frame-row"], [1, "field-label", "no-margin"], [1, "time-frame-radios", 3, "ngModelChange", "ngModel"], ["value", "permanent"], ["value", "date-based"], [1, "date-fields"], ["appearance", "outline"], ["matInput", "", 3, "ngModelChange", "matDatepicker", "ngModel", "disabled"], ["matIconSuffix", "", 3, "for"], [1, "notify-section"], ["mat-stroked-button", "", "type", "button", 3, "click"], [1, "spacer"], ["mat-flat-button", "", "color", "primary", 3, "disabled"], ["for", "principal-input", 1, "field-label"], ["id", "principal-input", "matInput", "", "required", "", 3, "ngModelChange", "placeholder", "ngModel", "matAutocomplete"], [3, "optionSelected", "displayWith"], ["disabled", ""], [1, "suggestion-icon"], [1, "suggestion-id"], [1, "field-label"], [1, "user-group-display"], ["for", "notify", 1, "field-label"], ["id", "notify", "matInput", "", "rows", "2", 3, "ngModelChange", "ngModel", "placeholder"], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"]], template: function ShareSavedSearchAddPermissionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 3);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵconditionalCreate(4, ShareSavedSearchAddPermissionDialogComponent_Conditional_4_Template, 10, 10)(5, ShareSavedSearchAddPermissionDialogComponent_Conditional_5_Template, 5, 4);
            i0.ɵɵelementStart(6, "mat-form-field", 4)(7, "mat-label");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "mat-select", 5);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchAddPermissionDialogComponent_Template_mat_select_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.right, $event) || (ctx.right = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵrepeaterCreate(11, ShareSavedSearchAddPermissionDialogComponent_For_12_Template, 3, 4, "mat-option", 6, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "div", 7)(14, "span", 8);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "mat-radio-group", 9);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchAddPermissionDialogComponent_Template_mat_radio_group_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.timeFrameMode, $event) || (ctx.timeFrameMode = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementStart(18, "mat-radio-button", 10);
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "mat-radio-button", 11);
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(24, "div", 12)(25, "mat-form-field", 13)(26, "mat-label");
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "input", 14);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchAddPermissionDialogComponent_Template_input_ngModelChange_29_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.beginDate, $event) || (ctx.beginDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(30, "mat-datepicker-toggle", 15)(31, "mat-datepicker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "mat-form-field", 13)(34, "mat-label");
            i0.ɵɵtext(35);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "input", 14);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchAddPermissionDialogComponent_Template_input_ngModelChange_37_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.endDate, $event) || (ctx.endDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(38, "mat-datepicker-toggle", 15)(39, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(41, "mat-checkbox", 5);
            i0.ɵɵtwoWayListener("ngModelChange", function ShareSavedSearchAddPermissionDialogComponent_Template_mat_checkbox_ngModelChange_41_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.sendNotify, $event) || (ctx.sendNotify = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(44, ShareSavedSearchAddPermissionDialogComponent_Conditional_44_Template, 7, 7, "div", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "mat-dialog-actions")(46, "button", 17);
            i0.ɵɵlistener("click", function ShareSavedSearchAddPermissionDialogComponent_Template_button_click_46_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.cancel()); });
            i0.ɵɵtext(47);
            i0.ɵɵpipe(48, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(49, "span", 18);
            i0.ɵɵconditionalCreate(50, ShareSavedSearchAddPermissionDialogComponent_Conditional_50_Template, 3, 4, "button", 19)(51, ShareSavedSearchAddPermissionDialogComponent_Conditional_51_Template, 6, 8);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            const fromPicker_r10 = i0.ɵɵreference(32);
            const toPicker_r11 = i0.ɵɵreference(40);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.data.title || i0.ɵɵpipeBind1(2, 23, "ui.add-a-permission"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.isEditMode ? 4 : 5);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 25, "shared-ui.share-saved-search-add-permission-dialog.right"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.right);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.rightOptions);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 27, "shared-ui.share-saved-search-add-permission-dialog.time-frame"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.timeFrameMode);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 29, "shared-ui.share-saved-search-add-permission-dialog.permanent"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 31, "shared-ui.share-saved-search-add-permission-dialog.date-based"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 33, "shared-ui.share-saved-search-add-permission-dialog.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", fromPicker_r10);
            i0.ɵɵtwoWayProperty("ngModel", ctx.beginDate);
            i0.ɵɵproperty("disabled", ctx.timeFrameMode === "permanent");
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", fromPicker_r10);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 35, "shared-ui.share-saved-search-add-permission-dialog.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", toPicker_r11);
            i0.ɵɵtwoWayProperty("ngModel", ctx.endDate);
            i0.ɵɵproperty("disabled", ctx.timeFrameMode === "permanent");
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", toPicker_r11);
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.sendNotify);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 37, "shared-ui.share-saved-search-add-permission-dialog.send-an-email-to-notify-user"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.sendNotify ? 44 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(48, 39, "shared-ui.share-saved-search-add-permission-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.isEditMode ? 50 : 51);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatSuffix, MatInputModule, i4.MatInput, MatSelectModule, i5.MatSelect, i5.MatOption, MatButtonModule, i6.MatButton, MatRadioModule, i7.MatRadioGroup, i7.MatRadioButton, MatCheckboxModule, i8.MatCheckbox, MatDatepickerModule, i9.MatDatepicker, i9.MatDatepickerInput, i9.MatDatepickerToggle, MatAutocompleteModule, i10.MatAutocomplete, i10.MatAutocompleteTrigger, MatIconModule, i11.MatIcon, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  min-width: 500px;\n}\n\nmat-dialog-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding-top: 8px !important;\n  max-width: 500px;\n}\n\n.full-width[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 400px;\n}\n\n.field-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n  color: #475467;\n}\n\n.no-margin[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.user-group-display[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  background: #f9fafb;\n  border: 1px solid #e5e7eb;\n  border-radius: 6px;\n  font-size: 14px;\n  color: #101828;\n  margin-bottom: 8px;\n}\n\n.time-frame-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 20px;\n  margin-top: 4px;\n}\n\n.time-frame-radios[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 24px;\n}\n\n.date-fields[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  max-width: 400px;\n}\n\n.date-fields[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%] {\n  flex: 1;\n  max-width: 190px;\n}\n\n.notify-section[_ngcontent-%COMP%] {\n  margin-top: 2px;\n}\n\n.suggestion-icon[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  font-size: 18px;\n  margin-right: 8px;\n  vertical-align: middle;\n  color: #667085;\n}\n\n.suggestion-id[_ngcontent-%COMP%] {\n  margin-left: 8px;\n  font-size: 12px;\n  color: #98a2b3;\n}\n\nmat-dialog-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  padding: 8px 24px 16px;\n}\n\n.spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ShareSavedSearchAddPermissionDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-share-saved-search-add-permission-dialog', standalone: true, imports: [
                    DescriptorLabelPipe,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatButtonModule,
                    MatRadioModule,
                    MatCheckboxModule,
                    MatDatepickerModule,
                    MatAutocompleteModule,
                    MatIconModule,
                ], providers: [provideTranslatedDatepickerIntl(), provideSatoriDateAdapter()], template: "<h2 mat-dialog-title>{{ data.title || ('ui.add-a-permission' | translate) }}</h2>\n\n<mat-dialog-content>\n  @if (!isEditMode) {\n    <label class=\"field-label\" for=\"principal-input\">{{\n      'shared-ui.share-saved-search-add-permission-dialog.user-group' | translate\n    }}</label>\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <input\n        id=\"principal-input\"\n        matInput\n        [placeholder]=\"\n          'shared-ui.share-saved-search-add-permission-dialog.search-for-users-and-groups'\n            | translate\n        \"\n        [ngModel]=\"searchText\"\n        (ngModelChange)=\"onSearchChange($event)\"\n        [matAutocomplete]=\"principalAuto\"\n        required\n      />\n      <mat-autocomplete\n        #principalAuto=\"matAutocomplete\"\n        (optionSelected)=\"onSuggestionSelected($event.option.value)\"\n        [displayWith]=\"displaySuggestion\"\n      >\n        @if (searchText.trim().length < 3) {\n          <mat-option disabled>{{\n            'shared-ui.share-saved-search-add-permission-dialog.please-enter-3-or-more-characters'\n              | translate\n          }}</mat-option>\n        } @else {\n          @for (suggestion of suggestions(); track suggestion.id) {\n            <mat-option [value]=\"suggestion\">\n              <mat-icon class=\"suggestion-icon\">{{\n                suggestion.type === 'USER_TYPE' ? 'person' : 'groups'\n              }}</mat-icon>\n              <span>{{ suggestion.displayLabel }}</span>\n              <span class=\"suggestion-id\">{{ suggestion.id }}</span>\n            </mat-option>\n          } @empty {\n            <mat-option disabled>{{\n              'shared-ui.share-saved-search-add-permission-dialog.no-users-groups-found' | translate\n            }}</mat-option>\n          }\n        }\n      </mat-autocomplete>\n    </mat-form-field>\n  } @else {\n    <div class=\"field-label\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.user-group-2' | translate }}\n    </div>\n    <div class=\"user-group-display\">{{ searchText }}</div>\n  }\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{\n      'shared-ui.share-saved-search-add-permission-dialog.right' | translate\n    }}</mat-label>\n    <mat-select [(ngModel)]=\"right\">\n      @for (opt of rightOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"time-frame-row\">\n    <span class=\"field-label no-margin\">{{\n      'shared-ui.share-saved-search-add-permission-dialog.time-frame' | translate\n    }}</span>\n    <mat-radio-group [(ngModel)]=\"timeFrameMode\" class=\"time-frame-radios\">\n      <mat-radio-button value=\"permanent\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.permanent' | translate\n      }}</mat-radio-button>\n      <mat-radio-button value=\"date-based\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.date-based' | translate\n      }}</mat-radio-button>\n    </mat-radio-group>\n  </div>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-add-permission-dialog.from' | translate\n      }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"fromPicker\"\n        [(ngModel)]=\"beginDate\"\n        [disabled]=\"timeFrameMode === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-add-permission-dialog.to' | translate\n      }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"toPicker\"\n        [(ngModel)]=\"endDate\"\n        [disabled]=\"timeFrameMode === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <mat-checkbox [(ngModel)]=\"sendNotify\">{{\n    'shared-ui.share-saved-search-add-permission-dialog.send-an-email-to-notify-user' | translate\n  }}</mat-checkbox>\n\n  @if (sendNotify) {\n    <div class=\"notify-section\">\n      <label class=\"field-label\" for=\"notify\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.notification-email' | translate\n      }}</label>\n      <mat-form-field appearance=\"outline\" class=\"full-width\">\n        <textarea\n          id=\"notify\"\n          matInput\n          rows=\"2\"\n          [(ngModel)]=\"notifyComment\"\n          [placeholder]=\"\n            'shared-ui.share-saved-search-add-permission-dialog.hi-could-you-comment-on-this'\n              | translate\n          \"\n        ></textarea>\n      </mat-form-field>\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" (click)=\"cancel()\">\n    {{ 'shared-ui.share-saved-search-add-permission-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  @if (isEditMode) {\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(false)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.update' | translate }}\n    </button>\n  } @else {\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(true)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.create-and-add-another' | translate }}\n    </button>\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(false)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.create' | translate }}\n    </button>\n  }\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n  min-width: 500px;\n}\n\nmat-dialog-content {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding-top: 8px !important;\n  max-width: 500px;\n}\n\n.full-width {\n  width: 100%;\n  max-width: 400px;\n}\n\n.field-label {\n  font-size: 14px;\n  font-weight: 500;\n  color: #475467;\n}\n\n.no-margin {\n  margin: 0;\n}\n\n.user-group-display {\n  padding: 10px 12px;\n  background: #f9fafb;\n  border: 1px solid #e5e7eb;\n  border-radius: 6px;\n  font-size: 14px;\n  color: #101828;\n  margin-bottom: 8px;\n}\n\n.time-frame-row {\n  display: flex;\n  align-items: center;\n  gap: 20px;\n  margin-top: 4px;\n}\n\n.time-frame-radios {\n  display: flex;\n  gap: 24px;\n}\n\n.date-fields {\n  display: flex;\n  gap: 12px;\n  max-width: 400px;\n}\n\n.date-fields mat-form-field {\n  flex: 1;\n  max-width: 190px;\n}\n\n.notify-section {\n  margin-top: 2px;\n}\n\n.suggestion-icon {\n  width: 18px;\n  height: 18px;\n  font-size: 18px;\n  margin-right: 8px;\n  vertical-align: middle;\n  color: #667085;\n}\n\n.suggestion-id {\n  margin-left: 8px;\n  font-size: 12px;\n  color: #98a2b3;\n}\n\nmat-dialog-actions {\n  display: flex;\n  gap: 10px;\n  padding: 8px 24px 16px;\n}\n\n.spacer {\n  flex: 1;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ShareSavedSearchAddPermissionDialogComponent, { className: "ShareSavedSearchAddPermissionDialogComponent", filePath: "libs/shared/ui/src/lib/share-saved-search-add-permission-dialog/share-saved-search-add-permission-dialog.component.ts", lineNumber: 70 }); })();
