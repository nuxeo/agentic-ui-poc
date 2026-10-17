import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule, } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInput, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap } from 'rxjs';
import { UserService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/input";
import * as i6 from "@angular/material/chips";
import * as i7 from "@angular/material/autocomplete";
import * as i8 from "@angular/material/select";
import * as i9 from "@angular/material/icon";
import * as i10 from "@angular/material/progress-spinner";
import * as i11 from "@angular/material/slide-toggle";
const _c0 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.groupname;
function UserFormDialogComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "mat-spinner", 22);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.user-form-dialog.loading"));
} }
function UserFormDialogComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵelement(1, "mat-spinner", 23);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.user-form-dialog.loading"));
} }
function UserFormDialogComponent_For_40_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-row", 24);
    i0.ɵɵlistener("removed", function UserFormDialogComponent_For_40_Template_mat_chip_row_removed_0_listener() { const group_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.removeGroup(group_r3)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 25);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const group_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", group_r3, " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 2, "shared.remove-group", i0.ɵɵpureFunction1(5, _c0, group_r3)));
} }
function UserFormDialogComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "administration.user-form-dialog.loading-groups"), " ");
} }
function UserFormDialogComponent_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "administration.user-form-dialog.pick-from-search-or-enter-a"), " ");
} }
function UserFormDialogComponent_For_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r5 = ctx.$implicit;
    i0.ɵɵproperty("value", g_r5.groupname);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(g_r5.grouplabel);
} }
function UserFormDialogComponent_Conditional_53_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "admin.user-form-dialog.passwords-do-not-match"));
} }
function UserFormDialogComponent_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 9)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 26);
    i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Conditional_53_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.password, $event) || (ctx_r3.password = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "mat-form-field", 9)(6, "mat-label");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "input", 27);
    i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Conditional_53_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.confirmPassword, $event) || (ctx_r3.confirmPassword = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, UserFormDialogComponent_Conditional_53_Conditional_10_Template, 3, 3, "mat-error");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 7, "admin.user-form-dialog.password"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.password);
    i0.ɵɵproperty("disabled", ctx_r3.saving());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 9, "admin.user-form-dialog.verify-password"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.confirmPassword);
    i0.ɵɵproperty("disabled", ctx_r3.saving());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.confirmPassword && ctx_r3.password !== ctx_r3.confirmPassword ? 10 : -1);
} }
function UserFormDialogComponent_Conditional_58_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 21);
    i0.ɵɵlistener("click", function UserFormDialogComponent_Conditional_58_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.submit(true)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", !ctx_r3.canSave);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "admin.user-form-dialog.create-another"), " ");
} }
export class UserFormDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    data = inject(MAT_DIALOG_DATA);
    userService = inject(UserService);
    snackBar = inject(MatSnackBar);
    username = '';
    firstName = '';
    lastName = '';
    company = '';
    email = '';
    setUserPassword = false;
    password = '';
    confirmPassword = '';
    separatorKeysCodes = [ENTER, COMMA];
    groups = [];
    groupOptions = [];
    groupSearchQuery = '';
    loadingGroupOptions = false;
    loadingGroups = true;
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    groupSearchTerms = new Subject();
    /** Suppresses matChipInputTokenEnd after autocomplete selection (NXSAT-151). */
    skipNextChipInput = false;
    groupChipInput;
    ngOnInit() {
        const u = this.data.user;
        if (this.data.mode === 'edit' && u) {
            this.username = u.id;
            this.firstName = u.properties.firstName ?? '';
            this.lastName = u.properties.lastName ?? '';
            this.company = u.properties.company ?? '';
            this.email = u.properties.email ?? '';
            this.groups = [...(u.properties.groups ?? [])];
        }
        this.userService
            .searchGroupsPaged('*', 200, 0)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                this.groupOptions = (res.entries ?? []).map((g) => ({
                    groupname: g.groupname,
                    grouplabel: g.grouplabel || g.groupname,
                }));
                this.loadingGroups = false;
            },
            error: () => {
                this.loadingGroups = false;
            },
        });
        this.groupSearchTerms
            .pipe(debounceTime(250), distinctUntilChanged(), switchMap((q) => {
            this.loadingGroupOptions = true;
            return this.userService.searchGroupsPaged(q || '*', 30, 0);
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                const selected = new Set(this.groups);
                this.groupOptions = (res.entries ?? [])
                    .filter((g) => g.groupname && !selected.has(g.groupname))
                    .map((g) => ({
                    groupname: g.groupname,
                    grouplabel: g.grouplabel || g.groupname,
                }));
                this.loadingGroupOptions = false;
            },
            error: () => {
                this.groupOptions = [];
                this.loadingGroupOptions = false;
            },
        });
    }
    ngOnDestroy() {
        this.groupSearchTerms.complete();
    }
    onGroupSearch(q) {
        this.groupSearchQuery = q;
        this.groupSearchTerms.next(q?.trim() ?? '');
    }
    onGroupInputFocus() {
        this.groupSearchTerms.next(this.groupSearchQuery?.trim() || '*');
    }
    onGroupInputKeydown(event) {
        if (event.key !== 'Enter') {
            return;
        }
        const typed = this.groupSearchQuery.trim();
        if (!typed) {
            return;
        }
        if (this.groupOptions.length > 0) {
            // Enter should select from autocomplete search results, not commit typed text as a chip.
            this.skipNextChipInput = true;
        }
    }
    onGroupSelected(event) {
        this.skipNextChipInput = true;
        const groupname = event.option.value?.trim();
        if (groupname) {
            // Autocomplete can emit matChipInputTokenEnd first with a partial prefix chip.
            this.groups = this.groups.filter((g) => g === groupname || !groupname.startsWith(g));
            if (!this.groups.includes(groupname)) {
                this.groups = [...this.groups, groupname];
            }
        }
        this.clearGroupSearch();
        event.option.deselect();
    }
    addGroupFromInput(event) {
        if (this.skipNextChipInput) {
            this.skipNextChipInput = false;
            event.chipInput.clear();
            this.clearGroupSearch();
            return;
        }
        const raw = (event.value ?? '').trim();
        if (!raw) {
            event.chipInput.clear();
            return;
        }
        const resolved = this.resolveGroupFromChipInput(raw);
        if (resolved === null) {
            event.chipInput.clear();
            this.clearGroupSearch();
            return;
        }
        if (resolved && !this.groups.includes(resolved)) {
            this.groups = [...this.groups, resolved];
        }
        event.chipInput.clear();
        this.clearGroupSearch();
    }
    resolveGroupFromChipInput(raw) {
        const typed = this.groupSearchQuery.trim();
        if (typed && raw === typed && this.isIncompleteGroupPrefix(raw)) {
            return null;
        }
        if (typed && raw.startsWith(typed) && raw.length > typed.length) {
            const suffix = raw.slice(typed.length);
            const optionMatch = this.groupOptions.find((g) => g.groupname === suffix);
            if (optionMatch) {
                return optionMatch.groupname;
            }
        }
        if (this.isIncompleteGroupPrefix(raw)) {
            return null;
        }
        const exactOption = this.groupOptions.find((g) => g.groupname === raw);
        if (exactOption) {
            return exactOption.groupname;
        }
        return raw;
    }
    /** True when `value` is only a typed prefix of a known group (not a full name). */
    isIncompleteGroupPrefix(value) {
        if (this.groupOptions.some((g) => g.groupname === value)) {
            return false;
        }
        return this.groupOptions.some((g) => g.groupname.startsWith(value) && g.groupname !== value);
    }
    removeGroup(groupname) {
        this.groups = this.groups.filter((g) => g !== groupname);
        this.groupSearchTerms.next(this.groupSearchQuery?.trim() || '*');
    }
    clearGroupSearch() {
        this.groupSearchQuery = '';
        this.groupOptions = [];
        this.groupSearchTerms.next('');
        this.groupChipInput?.clear();
    }
    get canSave() {
        if (this.loadingGroups || this.saving()) {
            return false;
        }
        if (this.data.mode === 'edit' && !this.data.user) {
            return false;
        }
        if (!this.username.trim() || !this.email.trim()) {
            return false;
        }
        if (this.setUserPassword) {
            const trimmedPassword = this.password.trim();
            return trimmedPassword.length > 0 && trimmedPassword === this.confirmPassword.trim();
        }
        return true;
    }
    onSetUserPasswordChange(enabled) {
        this.setUserPassword = enabled;
        if (!enabled) {
            this.password = '';
            this.confirmPassword = '';
        }
    }
    submit(createAnother = false) {
        if (!this.canSave) {
            return;
        }
        const result = {
            mode: this.data.mode,
            username: this.username.trim(),
            firstName: this.firstName.trim(),
            lastName: this.lastName.trim(),
            company: this.company.trim(),
            email: this.email.trim(),
            groups: this.groups,
            ...(this.data.mode === 'create' ? { createAnother } : {}),
        };
        const trimmedPassword = this.password.trim();
        if (this.setUserPassword && trimmedPassword.length > 0) {
            result.password = trimmedPassword;
        }
        if (this.data.mode === 'edit') {
            this.dialogRef.close(result);
            return;
        }
        const invited = !result.password?.trim();
        this.saving.set(true);
        this.dialogRef.disableClose = true;
        this.userService
            .createUser({
            username: result.username,
            firstName: result.firstName,
            lastName: result.lastName,
            company: result.company,
            email: result.email,
            password: result.password,
            groups: result.groups,
        })
            .pipe(finalize(() => {
            this.saving.set(false);
            this.dialogRef.disableClose = false;
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                const closeResult = {
                    mode: 'create',
                    username: result.username,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    company: result.company,
                    email: result.email,
                    groups: result.groups,
                    invited,
                    createAnother,
                };
                this.dialogRef.close(closeResult);
            },
            error: (err) => {
                this.snackBar.open(this.createUserErrorMessage(err, invited), this.translate.instant('common.dismiss'), {
                    duration: 7000,
                });
            },
        });
    }
    createUserErrorMessage(err, invited) {
        const raw = this.extractApiErrorMessage(err);
        const lower = raw.toLowerCase();
        if (lower.includes('user already exists')) {
            return this.translate.instant('admin.message.user-already-exists');
        }
        if (lower.includes('must have a password')) {
            return this.translate.instant('admin.message.password-required-for-server');
        }
        const simplified = this.simplifyNuxeoAutomationMessage(raw);
        if (simplified) {
            return simplified;
        }
        return this.translate.instant(invited ? 'admin.message.invitation-failed' : 'admin.message.create-failed');
    }
    extractApiErrorMessage(err) {
        return (err?.error?.message?.trim() ??
            err?.message?.trim() ??
            '');
    }
    /** Nuxeo automation errors repeat "Failed to invoke operation…"; keep the actionable tail. */
    simplifyNuxeoAutomationMessage(message) {
        if (!message) {
            return '';
        }
        const parts = message
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean);
        const meaningful = parts.filter((part) => !/^Failed to invoke operation/i.test(part));
        return meaningful.at(-1) ?? parts.at(-1) ?? message;
    }
    static ɵfac = function UserFormDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UserFormDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: UserFormDialogComponent, selectors: [["lib-user-form-dialog"]], viewQuery: function UserFormDialogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(MatChipInput, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.groupChipInput = _t.first);
        } }, decls: 63, vars: 61, consts: [["groupChipGrid", ""], ["groupAuto", "matAutocomplete"], [1, "dialog-shell"], ["aria-busy", "true", "aria-live", "polite", 1, "dialog-busy"], ["mat-dialog-title", "", "role", "heading", "aria-level", "2", 1, "dialog-title"], [1, "form"], [1, "spinner-wrap"], ["appearance", "outline", 1, "full", "first-field"], ["matInput", "", "name", "username", "autocomplete", "off", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["appearance", "outline", 1, "full"], ["matInput", "", "name", "firstName", 3, "ngModelChange", "ngModel", "disabled"], ["matInput", "", "name", "lastName", 3, "ngModelChange", "ngModel", "disabled"], ["matInput", "", "name", "company", 3, "ngModelChange", "ngModel", "disabled"], ["matInput", "", "name", "email", "type", "email", "autocomplete", "off", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["name", "groupSearch", 3, "ngModelChange", "focus", "keydown", "matChipInputTokenEnd", "placeholder", "matChipInputFor", "matChipInputSeparatorKeyCodes", "matAutocomplete", "ngModel", "disabled"], ["autoActiveFirstOption", "", 3, "optionSelected"], [3, "value"], ["color", "primary", 1, "password-toggle", 3, "change", "checked", "disabled"], ["align", "end", 1, "dialog-actions"], ["type", "button", "mat-button", "", "mat-dialog-close", "", 3, "disabled"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "disabled"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click", "disabled"], ["diameter", "40"], ["diameter", "36"], [3, "removed"], ["type", "button", "matChipRemove", ""], ["matInput", "", "name", "password", "type", "password", "autocomplete", "new-password", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["matInput", "", "name", "confirmPassword", "type", "password", "autocomplete", "new-password", "required", "", 3, "ngModelChange", "ngModel", "disabled"]], template: function UserFormDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 2);
            i0.ɵɵconditionalCreate(1, UserFormDialogComponent_Conditional_1_Template, 3, 3, "div", 3);
            i0.ɵɵelementStart(2, "div", 4);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-dialog-content", 5);
            i0.ɵɵconditionalCreate(7, UserFormDialogComponent_Conditional_7_Template, 3, 3, "div", 6);
            i0.ɵɵelementStart(8, "mat-form-field", 7)(9, "mat-label");
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "input", 8);
            i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Template_input_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.username, $event) || (ctx.username = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "mat-form-field", 9)(14, "mat-label");
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "input", 10);
            i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Template_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.firstName, $event) || (ctx.firstName = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(18, "mat-form-field", 9)(19, "mat-label");
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "input", 11);
            i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Template_input_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.lastName, $event) || (ctx.lastName = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "mat-form-field", 9)(24, "mat-label");
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "input", 12);
            i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Template_input_ngModelChange_27_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.company, $event) || (ctx.company = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(28, "mat-form-field", 9)(29, "mat-label");
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "input", 13);
            i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Template_input_ngModelChange_32_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.email, $event) || (ctx.email = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(33, "mat-form-field", 9)(34, "mat-label");
            i0.ɵɵtext(35);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "mat-chip-grid", null, 0);
            i0.ɵɵrepeaterCreate(39, UserFormDialogComponent_For_40_Template, 6, 7, "mat-chip-row", null, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementStart(41, "input", 14);
            i0.ɵɵpipe(42, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function UserFormDialogComponent_Template_input_ngModelChange_41_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.groupSearchQuery, $event) || (ctx.groupSearchQuery = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("focus", function UserFormDialogComponent_Template_input_focus_41_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onGroupInputFocus()); })("ngModelChange", function UserFormDialogComponent_Template_input_ngModelChange_41_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onGroupSearch($event)); })("keydown", function UserFormDialogComponent_Template_input_keydown_41_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onGroupInputKeydown($event)); })("matChipInputTokenEnd", function UserFormDialogComponent_Template_input_matChipInputTokenEnd_41_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.addGroupFromInput($event)); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(43, "mat-hint");
            i0.ɵɵconditionalCreate(44, UserFormDialogComponent_Conditional_44_Template, 2, 3)(45, UserFormDialogComponent_Conditional_45_Template, 2, 3);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(46, "mat-autocomplete", 15, 1);
            i0.ɵɵlistener("optionSelected", function UserFormDialogComponent_Template_mat_autocomplete_optionSelected_46_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onGroupSelected($event)); });
            i0.ɵɵrepeaterCreate(48, UserFormDialogComponent_For_49_Template, 2, 2, "mat-option", 16, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(50, "mat-slide-toggle", 17);
            i0.ɵɵlistener("change", function UserFormDialogComponent_Template_mat_slide_toggle_change_50_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onSetUserPasswordChange($event.checked)); });
            i0.ɵɵtext(51);
            i0.ɵɵpipe(52, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(53, UserFormDialogComponent_Conditional_53_Template, 11, 11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(54, "mat-dialog-actions", 18)(55, "button", 19);
            i0.ɵɵtext(56);
            i0.ɵɵpipe(57, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(58, UserFormDialogComponent_Conditional_58_Template, 3, 4, "button", 20);
            i0.ɵɵelementStart(59, "button", 21);
            i0.ɵɵlistener("click", function UserFormDialogComponent_Template_button_click_59_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.submit(false)); });
            i0.ɵɵtext(60);
            i0.ɵɵpipe(61, "translate");
            i0.ɵɵpipe(62, "translate");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            const groupChipGrid_r8 = i0.ɵɵreference(38);
            const groupAuto_r9 = i0.ɵɵreference(47);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.saving() ? 1 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", ctx.data.mode === "create" ? i0.ɵɵpipeBind1(4, 35, "administration.create-user") : i0.ɵɵpipeBind1(5, 37, "administration.edit-user"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.loadingGroups ? 7 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 39, "admin.user-form-dialog.username"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.username);
            i0.ɵɵproperty("disabled", ctx.data.mode === "edit" || ctx.saving());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 41, "admin.user-form-dialog.first-name"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.firstName);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 43, "admin.user-form-dialog.last-name"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.lastName);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 45, "admin.user-form-dialog.company"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.company);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 47, "admin.user-form-dialog.email"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.email);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 49, "admin.user-form-dialog.groups"));
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.groups);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", ctx.groups.length ? "" : i0.ɵɵpipeBind1(42, 51, "administration.user-form-dialog.search-groups-or-type-a-group-name"))("matChipInputFor", groupChipGrid_r8)("matChipInputSeparatorKeyCodes", ctx.separatorKeysCodes)("matAutocomplete", groupAuto_r9);
            i0.ɵɵtwoWayProperty("ngModel", ctx.groupSearchQuery);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.loadingGroupOptions ? 44 : 45);
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.groupOptions);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("checked", ctx.setUserPassword)("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(52, 53, "admin.user-form-dialog.set-user-password"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.setUserPassword ? 53 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(57, 55, "admin.user-form-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.data.mode === "create" ? 58 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", !ctx.canSave);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.data.mode === "create" ? i0.ɵɵpipeBind1(61, 57, "administration.create") : i0.ɵɵpipeBind1(62, 59, "administration.save"), " ");
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, MatFormFieldModule, i4.MatFormField, i4.MatLabel, i4.MatHint, i4.MatError, MatInputModule, i5.MatInput, MatChipsModule, i6.MatChipGrid, i6.MatChipInput, i6.MatChipRemove, i6.MatChipRow, MatAutocompleteModule, i7.MatAutocomplete, i8.MatOption, i7.MatAutocompleteTrigger, MatIconModule, i9.MatIcon, MatProgressSpinnerModule, i10.MatProgressSpinner, MatSlideToggleModule, i11.MatSlideToggle, MatSnackBarModule,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n      }\n      .dialog-title[_ngcontent-%COMP%] {\n        padding: 0 1.5rem 0.75rem;\n        margin: 0;\n        font-size: 1.25rem;\n        font-weight: 500;\n        line-height: 1.4;\n      }\n      .form[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 0.75rem;\n        min-width: 420px;\n        min-height: 420px;\n        max-height: 70vh;\n        padding-top: 2.75rem;\n        padding-bottom: 0.5rem;\n        overflow-x: hidden;\n      }\n      .first-field[_ngcontent-%COMP%] {\n        margin-top: 0.25rem;\n      }\n      .password-toggle[_ngcontent-%COMP%] {\n        margin: 0.5rem 0 0.15rem;\n      }\n      .full[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n      .dialog-actions[_ngcontent-%COMP%] {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n      .spinner-wrap[_ngcontent-%COMP%] {\n        display: flex;\n        justify-content: center;\n        padding: 0.75rem 0 1rem;\n      }\n      .dialog-shell[_ngcontent-%COMP%] {\n        position: relative;\n        min-height: 100%;\n      }\n      .dialog-busy[_ngcontent-%COMP%] {\n        position: absolute;\n        inset: 0;\n        z-index: 2;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: color-mix(in srgb, var(--mat-sys-surface, #fff) 75%, transparent);\n      }\n      @media (max-width: 640px) {\n        .form[_ngcontent-%COMP%] {\n          min-width: 0;\n        }\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UserFormDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-user-form-dialog', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatChipsModule,
                    MatAutocompleteModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatSlideToggleModule,
                    MatSnackBarModule,
                ], template: "<div class=\"dialog-shell\">\n  @if (saving()) {\n    <div class=\"dialog-busy\" aria-busy=\"true\" aria-live=\"polite\">\n      <mat-spinner diameter=\"40\" [attr.aria-label]=\"'admin.user-form-dialog.loading' | translate\" />\n    </div>\n  }\n  <div mat-dialog-title class=\"dialog-title\" role=\"heading\" aria-level=\"2\">\n    {{\n      data.mode === 'create'\n        ? ('administration.create-user' | translate)\n        : ('administration.edit-user' | translate)\n    }}\n  </div>\n  <mat-dialog-content class=\"form\">\n    @if (loadingGroups) {\n      <div class=\"spinner-wrap\">\n        <mat-spinner\n          diameter=\"36\"\n          [attr.aria-label]=\"'admin.user-form-dialog.loading' | translate\"\n        />\n      </div>\n    }\n    <mat-form-field appearance=\"outline\" class=\"full first-field\">\n      <mat-label>{{ 'admin.user-form-dialog.username' | translate }}</mat-label>\n      <input\n        matInput\n        name=\"username\"\n        [(ngModel)]=\"username\"\n        [disabled]=\"data.mode === 'edit' || saving()\"\n        autocomplete=\"off\"\n        required\n      />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" class=\"full\">\n      <mat-label>{{ 'admin.user-form-dialog.first-name' | translate }}</mat-label>\n      <input matInput name=\"firstName\" [(ngModel)]=\"firstName\" [disabled]=\"saving()\" />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" class=\"full\">\n      <mat-label>{{ 'admin.user-form-dialog.last-name' | translate }}</mat-label>\n      <input matInput name=\"lastName\" [(ngModel)]=\"lastName\" [disabled]=\"saving()\" />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" class=\"full\">\n      <mat-label>{{ 'admin.user-form-dialog.company' | translate }}</mat-label>\n      <input matInput name=\"company\" [(ngModel)]=\"company\" [disabled]=\"saving()\" />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" class=\"full\">\n      <mat-label>{{ 'admin.user-form-dialog.email' | translate }}</mat-label>\n      <input\n        matInput\n        name=\"email\"\n        type=\"email\"\n        [(ngModel)]=\"email\"\n        [disabled]=\"saving()\"\n        autocomplete=\"off\"\n        required\n      />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" class=\"full\">\n      <mat-label>{{ 'admin.user-form-dialog.groups' | translate }}</mat-label>\n      <mat-chip-grid #groupChipGrid>\n        @for (group of groups; track group) {\n          <mat-chip-row (removed)=\"removeGroup(group)\">\n            {{ group }}\n            <button\n              type=\"button\"\n              matChipRemove\n              [attr.aria-label]=\"'shared.remove-group' | translate: { name: group }\"\n            >\n              <mat-icon>cancel</mat-icon>\n            </button>\n          </mat-chip-row>\n        }\n        <input\n          name=\"groupSearch\"\n          [placeholder]=\"\n            groups.length\n              ? ''\n              : ('administration.user-form-dialog.search-groups-or-type-a-group-name' | translate)\n          \"\n          [matChipInputFor]=\"groupChipGrid\"\n          [matChipInputSeparatorKeyCodes]=\"separatorKeysCodes\"\n          [matAutocomplete]=\"groupAuto\"\n          [(ngModel)]=\"groupSearchQuery\"\n          [disabled]=\"saving()\"\n          (focus)=\"onGroupInputFocus()\"\n          (ngModelChange)=\"onGroupSearch($event)\"\n          (keydown)=\"onGroupInputKeydown($event)\"\n          (matChipInputTokenEnd)=\"addGroupFromInput($event)\"\n        />\n      </mat-chip-grid>\n      <mat-hint>\n        @if (loadingGroupOptions) {\n          {{ 'administration.user-form-dialog.loading-groups' | translate }}\n        } @else {\n          {{ 'administration.user-form-dialog.pick-from-search-or-enter-a' | translate }}\n        }\n      </mat-hint>\n    </mat-form-field>\n    <mat-autocomplete\n      #groupAuto=\"matAutocomplete\"\n      autoActiveFirstOption\n      (optionSelected)=\"onGroupSelected($event)\"\n    >\n      @for (g of groupOptions; track g.groupname) {\n        <mat-option [value]=\"g.groupname\">{{ g.grouplabel }}</mat-option>\n      }\n    </mat-autocomplete>\n    <mat-slide-toggle\n      class=\"password-toggle\"\n      [checked]=\"setUserPassword\"\n      [disabled]=\"saving()\"\n      (change)=\"onSetUserPasswordChange($event.checked)\"\n      color=\"primary\"\n    >\n      {{ 'admin.user-form-dialog.set-user-password' | translate }}\n    </mat-slide-toggle>\n    @if (setUserPassword) {\n      <mat-form-field appearance=\"outline\" class=\"full\">\n        <mat-label>{{ 'admin.user-form-dialog.password' | translate }}</mat-label>\n        <input\n          matInput\n          name=\"password\"\n          type=\"password\"\n          [(ngModel)]=\"password\"\n          [disabled]=\"saving()\"\n          autocomplete=\"new-password\"\n          required\n        />\n      </mat-form-field>\n      <mat-form-field appearance=\"outline\" class=\"full\">\n        <mat-label>{{ 'admin.user-form-dialog.verify-password' | translate }}</mat-label>\n        <input\n          matInput\n          name=\"confirmPassword\"\n          type=\"password\"\n          [(ngModel)]=\"confirmPassword\"\n          [disabled]=\"saving()\"\n          autocomplete=\"new-password\"\n          required\n        />\n        @if (confirmPassword && password !== confirmPassword) {\n          <mat-error>{{ 'admin.user-form-dialog.passwords-do-not-match' | translate }}</mat-error>\n        }\n      </mat-form-field>\n    }\n  </mat-dialog-content>\n  <mat-dialog-actions align=\"end\" class=\"dialog-actions\">\n    <button type=\"button\" mat-button mat-dialog-close [disabled]=\"saving()\">\n      {{ 'admin.user-form-dialog.cancel' | translate }}\n    </button>\n    @if (data.mode === 'create') {\n      <button\n        type=\"button\"\n        mat-flat-button\n        color=\"primary\"\n        (click)=\"submit(true)\"\n        [disabled]=\"!canSave\"\n      >\n        {{ 'admin.user-form-dialog.create-another' | translate }}\n      </button>\n    }\n    <button\n      type=\"button\"\n      mat-flat-button\n      color=\"primary\"\n      (click)=\"submit(false)\"\n      [disabled]=\"!canSave\"\n    >\n      {{\n        data.mode === 'create'\n          ? ('administration.create' | translate)\n          : ('administration.save' | translate)\n      }}\n    </button>\n  </mat-dialog-actions>\n</div>\n", styles: ["\n      :host {\n        display: block;\n      }\n      .dialog-title {\n        padding: 0 1.5rem 0.75rem;\n        margin: 0;\n        font-size: 1.25rem;\n        font-weight: 500;\n        line-height: 1.4;\n      }\n      .form {\n        display: flex;\n        flex-direction: column;\n        gap: 0.75rem;\n        min-width: 420px;\n        min-height: 420px;\n        max-height: 70vh;\n        padding-top: 2.75rem;\n        padding-bottom: 0.5rem;\n        overflow-x: hidden;\n      }\n      .first-field {\n        margin-top: 0.25rem;\n      }\n      .password-toggle {\n        margin: 0.5rem 0 0.15rem;\n      }\n      .full {\n        width: 100%;\n      }\n      .dialog-actions {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n      .spinner-wrap {\n        display: flex;\n        justify-content: center;\n        padding: 0.75rem 0 1rem;\n      }\n      .dialog-shell {\n        position: relative;\n        min-height: 100%;\n      }\n      .dialog-busy {\n        position: absolute;\n        inset: 0;\n        z-index: 2;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: color-mix(in srgb, var(--mat-sys-surface, #fff) 75%, transparent);\n      }\n      @media (max-width: 640px) {\n        .form {\n          min-width: 0;\n        }\n      }\n    "] }]
    }], null, { groupChipInput: [{
            type: ViewChild,
            args: [MatChipInput]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(UserFormDialogComponent, { className: "UserFormDialogComponent", filePath: "libs/features/administration/src/lib/user-form-dialog/user-form-dialog.component.ts", lineNumber: 123 }); })();
