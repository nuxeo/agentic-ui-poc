import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, } from '@angular/material/autocomplete';
import { MatChipInput, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { UserService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
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
const _c0 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.id;
function GroupFormDialogComponent_For_22_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-row", 15);
    i0.ɵɵlistener("removed", function GroupFormDialogComponent_For_22_Template_mat_chip_row_removed_0_listener() { const id_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.removeMember(id_r3)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 16);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const id_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", id_r3, " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c0, id_r3)));
} }
function GroupFormDialogComponent_For_31_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const u_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.userDisplayLine(u_r5));
} }
function GroupFormDialogComponent_For_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 10)(1, "span", 17)(2, "span", 18);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, GroupFormDialogComponent_For_31_Conditional_4_Template, 2, 1, "span", 19);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const u_r5 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("value", u_r5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(u_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.userDisplayLine(u_r5) ? 4 : -1);
} }
function GroupFormDialogComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 14);
    i0.ɵɵlistener("click", function GroupFormDialogComponent_Conditional_36_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.submit(true)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", !ctx_r3.groupname.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "admin.group-form-dialog.create-another"), " ");
} }
export class GroupFormDialogComponent {
    dialogRef = inject((MatDialogRef));
    userService = inject(UserService);
    destroyRef = inject(DestroyRef);
    data = inject(MAT_DIALOG_DATA);
    separatorKeysCodes = [ENTER, COMMA];
    groupname = '';
    grouplabel = '';
    /** Selected member usernames (ids). */
    memberUsernames = [];
    userSearchQuery = '';
    filteredUsers = [];
    searchTerms = new Subject();
    /** Suppresses matChipInputTokenEnd after autocomplete selection (NXSAT-151). */
    skipNextChipInput = false;
    memberChipInput;
    ngOnInit() {
        const g = this.data.group;
        if (this.data.mode === 'edit' && g) {
            this.groupname = g.groupname;
            this.grouplabel = g.grouplabel ?? '';
            this.memberUsernames = [...(g.memberUsers ?? [])];
        }
        this.searchTerms
            .pipe(debounceTime(250), distinctUntilChanged(), switchMap((q) => {
            const query = (q ?? '').trim() || '*';
            return this.userService.searchUsersPaged(query, 30, 0);
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                const ids = new Set(this.memberUsernames);
                this.filteredUsers = (res.entries ?? []).filter((u) => u.id && !ids.has(u.id));
            },
            error: () => {
                this.filteredUsers = [];
            },
        });
    }
    ngOnDestroy() {
        this.searchTerms.complete();
    }
    onUserSearch(q) {
        this.userSearchQuery = q;
        this.searchTerms.next(q);
    }
    onMemberInputFocus() {
        // Ensure autocomplete calls API even when user reopens with the same query.
        this.searchTerms.next(this.userSearchQuery);
    }
    userDisplayLine(u) {
        const fn = u.properties?.firstName?.trim() ?? '';
        const ln = u.properties?.lastName?.trim() ?? '';
        const name = `${fn} ${ln}`.trim();
        const email = u.properties?.email ?? '';
        if (name && email)
            return `${name} · ${email}`;
        return name || email || '';
    }
    onMemberInputKeydown(event) {
        if (event.key !== 'Enter') {
            return;
        }
        const typed = this.userSearchQuery.trim();
        if (!typed) {
            return;
        }
        if (this.filteredUsers.length > 0) {
            // Enter should select from autocomplete search results, not commit typed text as a chip.
            this.skipNextChipInput = true;
        }
    }
    onUserSelected(event) {
        this.skipNextChipInput = true;
        const u = event.option.value;
        const userId = u?.id?.trim();
        if (userId) {
            // Autocomplete can emit matChipInputTokenEnd first with a partial prefix chip.
            this.memberUsernames = this.memberUsernames.filter((id) => id === userId || !userId.startsWith(id));
            if (!this.memberUsernames.includes(userId)) {
                this.memberUsernames = [...this.memberUsernames, userId];
            }
        }
        this.clearMemberSearch();
        event.option.deselect();
    }
    addMemberFromInput(event) {
        if (this.skipNextChipInput) {
            this.skipNextChipInput = false;
            event.chipInput.clear();
            this.clearMemberSearch();
            return;
        }
        const raw = (event.value ?? '').trim();
        if (!raw) {
            event.chipInput.clear();
            return;
        }
        const resolved = this.resolveMemberFromChipInput(raw);
        if (resolved === null) {
            event.chipInput.clear();
            this.clearMemberSearch();
            return;
        }
        if (resolved && !this.memberUsernames.includes(resolved)) {
            this.memberUsernames = [...this.memberUsernames, resolved];
        }
        event.chipInput.clear();
        this.clearMemberSearch();
    }
    resolveMemberFromChipInput(raw) {
        const typed = this.userSearchQuery.trim();
        if (typed && raw === typed && this.isIncompleteUserPrefix(raw)) {
            return null;
        }
        if (typed && raw.startsWith(typed) && raw.length > typed.length) {
            const suffix = raw.slice(typed.length);
            const optionMatch = this.filteredUsers.find((u) => u.id === suffix);
            if (optionMatch?.id) {
                return optionMatch.id;
            }
        }
        if (this.isIncompleteUserPrefix(raw)) {
            return null;
        }
        const exactOption = this.filteredUsers.find((u) => u.id === raw);
        if (exactOption?.id) {
            return exactOption.id;
        }
        return raw;
    }
    /** True when `value` is only a typed prefix of a known user id (not a full id). */
    isIncompleteUserPrefix(value) {
        if (this.filteredUsers.some((u) => u.id === value)) {
            return false;
        }
        return this.filteredUsers.some((u) => u.id.startsWith(value) && u.id !== value);
    }
    removeMember(id) {
        this.memberUsernames = this.memberUsernames.filter((x) => x !== id);
        this.searchTerms.next(this.userSearchQuery);
    }
    clearMemberSearch() {
        this.userSearchQuery = '';
        this.filteredUsers = [];
        this.searchTerms.next('');
        this.memberChipInput?.clear();
    }
    submit(createAnother = false) {
        if (this.data.mode === 'create' && !this.groupname.trim()) {
            return;
        }
        this.dialogRef.close({
            mode: this.data.mode,
            groupname: this.groupname.trim(),
            grouplabel: this.grouplabel.trim(),
            memberUsers: [...this.memberUsernames],
            ...(this.data.mode === 'create' ? { createAnother } : {}),
        });
    }
    static ɵfac = function GroupFormDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || GroupFormDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: GroupFormDialogComponent, selectors: [["lib-group-form-dialog"]], viewQuery: function GroupFormDialogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(MatChipInput, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.memberChipInput = _t.first);
        } }, decls: 40, vars: 35, consts: [["chipGrid", ""], ["userAuto", "matAutocomplete"], ["mat-dialog-title", "", "role", "heading", "aria-level", "2", 1, "dialog-title"], [1, "form"], ["appearance", "outline", 1, "full", "first-field"], ["matInput", "", "name", "groupname", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["appearance", "outline", 1, "full"], ["matInput", "", "name", "grouplabel", 3, "ngModelChange", "ngModel"], ["name", "memberUserSearch", 3, "ngModelChange", "focus", "keydown", "matChipInputTokenEnd", "placeholder", "matChipInputFor", "matChipInputSeparatorKeyCodes", "matAutocomplete", "ngModel"], ["autoActiveFirstOption", "", 3, "optionSelected"], [3, "value"], ["align", "end", 1, "dialog-actions"], ["type", "button", "mat-button", "", "mat-dialog-close", ""], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "disabled"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click", "disabled"], [3, "removed"], ["type", "button", "matChipRemove", ""], [1, "member-opt"], [1, "member-opt__id"], [1, "member-opt__meta"]], template: function GroupFormDialogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 2);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "mat-dialog-content", 3)(5, "mat-form-field", 4)(6, "mat-label");
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "input", 5);
            i0.ɵɵtwoWayListener("ngModelChange", function GroupFormDialogComponent_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.groupname, $event) || (ctx.groupname = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "mat-form-field", 6)(11, "mat-label");
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "input", 7);
            i0.ɵɵtwoWayListener("ngModelChange", function GroupFormDialogComponent_Template_input_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.grouplabel, $event) || (ctx.grouplabel = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(15, "mat-form-field", 6)(16, "mat-label");
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "mat-chip-grid", null, 0);
            i0.ɵɵrepeaterCreate(21, GroupFormDialogComponent_For_22_Template, 6, 7, "mat-chip-row", null, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementStart(23, "input", 8);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵtwoWayListener("ngModelChange", function GroupFormDialogComponent_Template_input_ngModelChange_23_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.userSearchQuery, $event) || (ctx.userSearchQuery = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("focus", function GroupFormDialogComponent_Template_input_focus_23_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onMemberInputFocus()); })("ngModelChange", function GroupFormDialogComponent_Template_input_ngModelChange_23_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onUserSearch($event)); })("keydown", function GroupFormDialogComponent_Template_input_keydown_23_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onMemberInputKeydown($event)); })("matChipInputTokenEnd", function GroupFormDialogComponent_Template_input_matChipInputTokenEnd_23_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.addMemberFromInput($event)); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "mat-hint");
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(28, "mat-autocomplete", 9, 1);
            i0.ɵɵlistener("optionSelected", function GroupFormDialogComponent_Template_mat_autocomplete_optionSelected_28_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onUserSelected($event)); });
            i0.ɵɵrepeaterCreate(30, GroupFormDialogComponent_For_31_Template, 5, 3, "mat-option", 10, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(32, "mat-dialog-actions", 11)(33, "button", 12);
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(36, GroupFormDialogComponent_Conditional_36_Template, 3, 4, "button", 13);
            i0.ɵɵelementStart(37, "button", 14);
            i0.ɵɵlistener("click", function GroupFormDialogComponent_Template_button_click_37_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.submit(false)); });
            i0.ɵɵtext(38);
            i0.ɵɵpipe(39, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const chipGrid_r7 = i0.ɵɵreference(20);
            const userAuto_r8 = i0.ɵɵreference(29);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.data.mode === "create" ? i0.ɵɵpipeBind1(2, 17, "administration.create-group") : i0.ɵɵpipeBind1(3, 19, "administration.edit-group"), "\n");
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 21, "admin.group-form-dialog.group-name"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.groupname);
            i0.ɵɵproperty("disabled", ctx.data.mode === "edit");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 23, "admin.group-form-dialog.label"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.grouplabel);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 25, "admin.group-form-dialog.member-usernames"));
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.memberUsernames);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", ctx.memberUsernames.length ? "" : i0.ɵɵpipeBind1(24, 27, "administration.group-form-dialog.search-users-or-type-a-username"))("matChipInputFor", chipGrid_r7)("matChipInputSeparatorKeyCodes", ctx.separatorKeysCodes)("matAutocomplete", userAuto_r8);
            i0.ɵɵtwoWayProperty("ngModel", ctx.userSearchQuery);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 29, "admin.group-form-dialog.pick-from-search-or-enter-a"));
            i0.ɵɵadvance(4);
            i0.ɵɵrepeater(ctx.filteredUsers);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(35, 31, "admin.group-form-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.data.mode === "create" ? 36 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.data.mode === "create" ? !ctx.groupname.trim() : !ctx.data.group);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(39, 33, "admin.group-form-dialog.save"), " ");
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel, MatDialogModule, i2.MatDialogClose, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, MatFormFieldModule, i4.MatFormField, i4.MatLabel, i4.MatHint, MatInputModule, i5.MatInput, MatChipsModule, i6.MatChipGrid, i6.MatChipInput, i6.MatChipRemove, i6.MatChipRow, MatAutocompleteModule, i7.MatAutocomplete, i8.MatOption, i7.MatAutocompleteTrigger, MatIconModule, i9.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n      }\n      .dialog-title[_ngcontent-%COMP%] {\n        padding: 0 1.5rem 0.75rem;\n        margin: 0;\n        font-size: 1.25rem;\n        font-weight: 500;\n        line-height: 1.4;\n      }\n      .form[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 0.75rem;\n        min-width: 420px;\n        padding-top: 2.75rem;\n        padding-bottom: 0.5rem;\n        overflow-x: hidden;\n      }\n      .first-field[_ngcontent-%COMP%] {\n        margin-top: 0.25rem;\n      }\n      .full[_ngcontent-%COMP%] {\n        width: 100%;\n      }\n      .dialog-actions[_ngcontent-%COMP%] {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n      .member-opt[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 0.125rem;\n        line-height: 1.25;\n      }\n      .member-opt__id[_ngcontent-%COMP%] {\n        font-weight: 500;\n      }\n      .member-opt__meta[_ngcontent-%COMP%] {\n        font-size: 0.8125rem;\n        opacity: 0.75;\n      }\n      @media (max-width: 640px) {\n        .form[_ngcontent-%COMP%] {\n          min-width: 0;\n        }\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(GroupFormDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-group-form-dialog', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatChipsModule,
                    MatAutocompleteModule,
                    MatIconModule,
                ], template: "<div mat-dialog-title class=\"dialog-title\" role=\"heading\" aria-level=\"2\">\n  {{\n    data.mode === 'create'\n      ? ('administration.create-group' | translate)\n      : ('administration.edit-group' | translate)\n  }}\n</div>\n<mat-dialog-content class=\"form\">\n  <mat-form-field appearance=\"outline\" class=\"full first-field\">\n    <mat-label>{{ 'admin.group-form-dialog.group-name' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"groupname\"\n      [(ngModel)]=\"groupname\"\n      [disabled]=\"data.mode === 'edit'\"\n      required\n    />\n  </mat-form-field>\n  <mat-form-field appearance=\"outline\" class=\"full\">\n    <mat-label>{{ 'admin.group-form-dialog.label' | translate }}</mat-label>\n    <input matInput name=\"grouplabel\" [(ngModel)]=\"grouplabel\" />\n  </mat-form-field>\n  <mat-form-field appearance=\"outline\" class=\"full\">\n    <mat-label>{{ 'admin.group-form-dialog.member-usernames' | translate }}</mat-label>\n    <mat-chip-grid #chipGrid>\n      @for (id of memberUsernames; track id) {\n        <mat-chip-row (removed)=\"removeMember(id)\">\n          {{ id }}\n          <button\n            type=\"button\"\n            matChipRemove\n            [attr.aria-label]=\"'shared.remove-item' | translate: { name: id }\"\n          >\n            <mat-icon>cancel</mat-icon>\n          </button>\n        </mat-chip-row>\n      }\n      <input\n        name=\"memberUserSearch\"\n        [placeholder]=\"\n          memberUsernames.length\n            ? ''\n            : ('administration.group-form-dialog.search-users-or-type-a-username' | translate)\n        \"\n        [matChipInputFor]=\"chipGrid\"\n        [matChipInputSeparatorKeyCodes]=\"separatorKeysCodes\"\n        [matAutocomplete]=\"userAuto\"\n        [(ngModel)]=\"userSearchQuery\"\n        (focus)=\"onMemberInputFocus()\"\n        (ngModelChange)=\"onUserSearch($event)\"\n        (keydown)=\"onMemberInputKeydown($event)\"\n        (matChipInputTokenEnd)=\"addMemberFromInput($event)\"\n      />\n    </mat-chip-grid>\n    <mat-hint>{{ 'admin.group-form-dialog.pick-from-search-or-enter-a' | translate }}</mat-hint>\n  </mat-form-field>\n  <mat-autocomplete\n    #userAuto=\"matAutocomplete\"\n    autoActiveFirstOption\n    (optionSelected)=\"onUserSelected($event)\"\n  >\n    @for (u of filteredUsers; track u.id) {\n      <mat-option [value]=\"u\">\n        <span class=\"member-opt\">\n          <span class=\"member-opt__id\">{{ u.id }}</span>\n          @if (userDisplayLine(u)) {\n            <span class=\"member-opt__meta\">{{ userDisplayLine(u) }}</span>\n          }\n        </span>\n      </mat-option>\n    }\n  </mat-autocomplete>\n</mat-dialog-content>\n<mat-dialog-actions align=\"end\" class=\"dialog-actions\">\n  <button type=\"button\" mat-button mat-dialog-close>\n    {{ 'admin.group-form-dialog.cancel' | translate }}\n  </button>\n  @if (data.mode === 'create') {\n    <button\n      type=\"button\"\n      mat-flat-button\n      color=\"primary\"\n      (click)=\"submit(true)\"\n      [disabled]=\"!groupname.trim()\"\n    >\n      {{ 'admin.group-form-dialog.create-another' | translate }}\n    </button>\n  }\n  <button\n    type=\"button\"\n    mat-flat-button\n    color=\"primary\"\n    (click)=\"submit(false)\"\n    [disabled]=\"data.mode === 'create' ? !groupname.trim() : !data.group\"\n  >\n    {{ 'admin.group-form-dialog.save' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n      }\n      .dialog-title {\n        padding: 0 1.5rem 0.75rem;\n        margin: 0;\n        font-size: 1.25rem;\n        font-weight: 500;\n        line-height: 1.4;\n      }\n      .form {\n        display: flex;\n        flex-direction: column;\n        gap: 0.75rem;\n        min-width: 420px;\n        padding-top: 2.75rem;\n        padding-bottom: 0.5rem;\n        overflow-x: hidden;\n      }\n      .first-field {\n        margin-top: 0.25rem;\n      }\n      .full {\n        width: 100%;\n      }\n      .dialog-actions {\n        gap: 0.5rem;\n        padding: 0.75rem 1.5rem 1.25rem;\n      }\n      .member-opt {\n        display: flex;\n        flex-direction: column;\n        gap: 0.125rem;\n        line-height: 1.25;\n      }\n      .member-opt__id {\n        font-weight: 500;\n      }\n      .member-opt__meta {\n        font-size: 0.8125rem;\n        opacity: 0.75;\n      }\n      @media (max-width: 640px) {\n        .form {\n          min-width: 0;\n        }\n      }\n    "] }]
    }], null, { memberChipInput: [{
            type: ViewChild,
            args: [MatChipInput]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(GroupFormDialogComponent, { className: "GroupFormDialogComponent", filePath: "libs/features/administration/src/lib/group-form-dialog/group-form-dialog.component.ts", lineNumber: 101 }); })();
