import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, model, numberAttribute, signal, untracked, viewChild, } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { DocumentDetailService, UserService, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsPickerControl, nxsPickerProviders } from '../pickers/picker-control';
import { nxsSearchAsYouType } from '../pickers/search-as-you-type';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/autocomplete";
import * as i2 from "@angular/material/select";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/icon";
import * as i5 from "@angular/material/input";
import * as i6 from "@angular/material/form-field";
const _c0 = a0 => ({ count: a0 });
const _forTrack0 = ($index, $item) => $item.prefixedId;
function NxsUserGroupPickerComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 6);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function NxsUserGroupPickerComponent_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.clear()); });
    i0.ɵɵelementStart(2, "mat-icon", 7);
    i0.ɵɵtext(3, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "satori-components.pickers.clear"));
} }
function NxsUserGroupPickerComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.choose-from-list"));
} }
function NxsUserGroupPickerComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.required"));
} }
function NxsUserGroupPickerComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-hint");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, ctx_r2.minChars() === 1 ? "satori-components.pickers.min-chars-one" : "satori-components.pickers.min-chars-many", i0.ɵɵpureFunction1(4, _c0, ctx_r2.minChars())));
} }
function NxsUserGroupPickerComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-hint");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.hint());
} }
function NxsUserGroupPickerComponent_Case_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.searching"));
} }
function NxsUserGroupPickerComponent_Case_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.no-results"));
} }
function NxsUserGroupPickerComponent_Case_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.failed"));
} }
function NxsUserGroupPickerComponent_Case_14_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 8)(1, "mat-icon", 7);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 9)(4, "span", 10);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(6, " ");
    i0.ɵɵelementStart(7, "span", 11);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const principal_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", principal_r4);
    i0.ɵɵattribute("data-principal", principal_r4.prefixedId);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(principal_r4.kind === "group" ? "group" : "person");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(principal_r4.label);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(9, 6, principal_r4.kind === "group" ? "satori-components.user-group-picker.group" : "satori-components.user-group-picker.user"), "", principal_r4.email ? " \u00B7 " + principal_r4.email : "");
} }
function NxsUserGroupPickerComponent_Case_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsUserGroupPickerComponent_Case_14_For_1_Template, 10, 8, "mat-option", 8, _forTrack0);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.finder.state().results);
} }
/** Web UI's user suggestion starts searching at three characters. */
const WEB_UI_MIN_CHARS = 3;
/**
 * A field that finds a user or a group as the user types, and returns the one chosen — the picker
 * Add permission, sharing and workflow assignment use, as Web UI's `nuxeo-user-suggestion` is.
 *
 * It searches from three characters, Web UI's default, so a one-letter term does not list the
 * whole directory; set `minChars` for a smaller one. Typing after a choice clears it, so the value
 * is always a principal the server returned, never free text: text typed and not chosen is an
 * `nxsChooseFromList` error on the form. Use it with `ngModel` or a form control, or bind `value`
 * two-way.
 */
export class NxsUserGroupPickerComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Whom to search: users and groups (the default), users only, or groups only. */
    search = input('users-and-groups', ...(ngDevMode ? [{ debugName: "search" }] : []));
    /** Characters typed before the server is asked. Web UI's three by default. */
    minChars = input(WEB_UI_MIN_CHARS, ...(ngDevMode ? [{ debugName: "minChars", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The principal chosen, or `null`. Two-way; a form control carries the same value. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    input = viewChild.required(MatInput);
    documents = inject(DocumentDetailService);
    users = inject(UserService);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    control = new NxsPickerControl();
    /** What the input shows: the chosen principal's label, or what the user is typing. */
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    finder = nxsSearchAsYouType((term) => this.find(term), () => this.minChars());
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    /** Text typed and no principal chosen for it. */
    unmatched = computed(() => !this.value() && this.text().trim() !== '', ...(ngDevMode ? [{ debugName: "unmatched" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.unmatched() || this.missing() || this.control.formInvalid()),
    };
    displayWith = (principal) => typeof principal === 'string' ? principal : (principal?.label ?? '');
    constructor() {
        effect(() => {
            const chosen = this.value();
            untracked(() => {
                if (chosen)
                    this.text.set(chosen.label);
            });
        });
        effect(() => {
            const { status, results } = this.finder.state();
            untracked(() => this.announce(status, results.length));
        });
        effect(() => {
            this.unmatched();
            untracked(() => this.control.revalidate());
        });
    }
    /**
     * `MatInput` recomputes its error state only when its own input has a form control, and this
     * one has none — the form is on the picker — so the picker asks it to on every check.
     */
    ngDoCheck() {
        this.input().updateErrorState();
    }
    validate(control) {
        return this.control.validate(control, this.unmatched() ? { nxsChooseFromList: true } : null);
    }
    registerOnValidatorChange(fn) {
        this.control.registerOnValidatorChange(fn);
    }
    missing() {
        return this.control.missing(this.required(), this.value() === null);
    }
    writeValue(value) {
        this.value.set(value ?? null);
        this.text.set(value?.label ?? '');
    }
    registerOnChange(fn) {
        this.control.registerOnChange(fn);
    }
    registerOnTouched(fn) {
        this.control.registerOnTouched(fn);
    }
    setDisabledState(disabled) {
        this.control.setDisabledState(disabled);
    }
    onInput(event) {
        const typed = event.target.value;
        this.text.set(typed);
        if (this.value() && typed !== this.value()?.label)
            this.choose(null);
        this.finder.query(typed);
    }
    choose(principal) {
        this.value.set(principal);
        if (principal) {
            this.text.set(principal.label);
            this.finder.reset();
        }
        this.control.changed(principal);
    }
    clear() {
        this.text.set('');
        this.finder.reset();
        this.choose(null);
    }
    blurred() {
        this.control.blurred();
    }
    find(term) {
        switch (this.search()) {
            case 'users':
                return this.users.searchUsers(term).pipe(map((found) => found.map(fromUser)));
            case 'groups':
                return this.users.searchGroups(term).pipe(map((found) => found.map(fromGroup)));
            default:
                return this.documents
                    .searchUsersGroups(term)
                    .pipe(map((found) => found.map(fromSuggestion)));
        }
    }
    announce(status, count) {
        const key = status === 'found'
            ? count === 1
                ? 'satori-components.pickers.results-one'
                : 'satori-components.pickers.results-many'
            : status === 'none'
                ? 'satori-components.pickers.no-results'
                : status === 'failed'
                    ? 'satori-components.pickers.failed'
                    : null;
        if (key)
            void this.announcer.announce(this.translate.instant(key, { count }), 'polite');
    }
    static ɵfac = function NxsUserGroupPickerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsUserGroupPickerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsUserGroupPickerComponent, selectors: [["nxs-user-group-picker"]], viewQuery: function NxsUserGroupPickerComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.input, MatInput, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-user-group-picker"], inputs: { label: [1, "label"], search: [1, "search"], minChars: [1, "minChars"], hint: [1, "hint"], required: [1, "required"], disabled: [1, "disabled"], value: [1, "value"] }, outputs: { value: "valueChange" }, features: [i0.ɵɵProvidersFeature(nxsPickerProviders(() => NxsUserGroupPickerComponent))], decls: 15, vars: 11, consts: [["auto", "matAutocomplete"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-picker__field"], ["matInput", "", "type", "text", "autocomplete", "off", 3, "input", "blur", "matAutocomplete", "value", "required", "disabled", "errorStateMatcher"], ["matIconSuffix", "", "mat-icon-button", "", "type", "button", 1, "nxs-picker__clear"], [1, "nxs-picker__panel", 3, "optionSelected", "displayWith"], ["disabled", "", 1, "nxs-picker__status"], ["matIconSuffix", "", "mat-icon-button", "", "type", "button", 1, "nxs-picker__clear", 3, "click"], ["aria-hidden", "true"], [3, "value"], [1, "nxs-picker__option"], [1, "nxs-picker__option-label"], [1, "nxs-picker__option-detail"]], template: function NxsUserGroupPickerComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "mat-form-field", 1)(1, "mat-label");
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "input", 2);
            i0.ɵɵlistener("input", function NxsUserGroupPickerComponent_Template_input_input_3_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onInput($event)); })("blur", function NxsUserGroupPickerComponent_Template_input_blur_3_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.blurred()); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, NxsUserGroupPickerComponent_Conditional_4_Template, 4, 3, "button", 3);
            i0.ɵɵconditionalCreate(5, NxsUserGroupPickerComponent_Conditional_5_Template, 3, 3, "mat-error")(6, NxsUserGroupPickerComponent_Conditional_6_Template, 3, 3, "mat-error");
            i0.ɵɵconditionalCreate(7, NxsUserGroupPickerComponent_Conditional_7_Template, 3, 6, "mat-hint")(8, NxsUserGroupPickerComponent_Conditional_8_Template, 2, 1, "mat-hint");
            i0.ɵɵelementStart(9, "mat-autocomplete", 4, 0);
            i0.ɵɵlistener("optionSelected", function NxsUserGroupPickerComponent_Template_mat_autocomplete_optionSelected_9_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.choose($event.option.value)); });
            i0.ɵɵconditionalCreate(11, NxsUserGroupPickerComponent_Case_11_Template, 3, 3, "mat-option", 5)(12, NxsUserGroupPickerComponent_Case_12_Template, 3, 3, "mat-option", 5)(13, NxsUserGroupPickerComponent_Case_13_Template, 3, 3, "mat-option", 5)(14, NxsUserGroupPickerComponent_Case_14_Template, 2, 0);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_11_0;
            const auto_r5 = i0.ɵɵreference(10);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.label());
            i0.ɵɵadvance();
            i0.ɵɵproperty("matAutocomplete", auto_r5)("value", ctx.text())("required", ctx.required())("disabled", ctx.isDisabled())("errorStateMatcher", ctx.errorState);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.value() && !ctx.isDisabled() ? 4 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.unmatched() ? 5 : ctx.missing() ? 6 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.finder.state().status === "short" ? 7 : ctx.hint() ? 8 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("displayWith", ctx.displayWith);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_11_0 = ctx.finder.state().status) === "searching" ? 11 : tmp_11_0 === "none" ? 12 : tmp_11_0 === "failed" ? 13 : tmp_11_0 === "found" ? 14 : -1);
        } }, dependencies: [MatAutocompleteModule, i1.MatAutocomplete, i2.MatOption, i1.MatAutocompleteTrigger, MatButtonModule, i3.MatIconButton, MatIconModule, i4.MatIcon, MatInputModule, i5.MatInput, i6.MatFormField, i6.MatLabel, i6.MatHint, i6.MatError, i6.MatSuffix, TranslatePipe], styles: ["@use '../pickers/picker';\n\n[_nghost-%COMP%] {\n  @include picker.field;\n}\n\n@include picker.options;"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsUserGroupPickerComponent, [{
        type: Component,
        args: [{ selector: 'nxs-user-group-picker', standalone: true, imports: [MatAutocompleteModule, MatButtonModule, MatIconModule, MatInputModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsUserGroupPickerComponent), host: { class: 'nxs-user-group-picker' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    type=\"text\"\n    autocomplete=\"off\"\n    [matAutocomplete]=\"auto\"\n    [value]=\"text()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"onInput($event)\"\n    (blur)=\"blurred()\"\n  />\n  @if (value() && !isDisabled()) {\n    <button\n      matIconSuffix\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-picker__clear\"\n      [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n      (click)=\"clear()\"\n    >\n      <mat-icon aria-hidden=\"true\">close</mat-icon>\n    </button>\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (finder.state().status === 'short') {\n    <mat-hint>{{\n      (minChars() === 1\n        ? 'satori-components.pickers.min-chars-one'\n        : 'satori-components.pickers.min-chars-many'\n      ) | translate: { count: minChars() }\n    }}</mat-hint>\n  } @else if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete\n    #auto=\"matAutocomplete\"\n    class=\"nxs-picker__panel\"\n    [displayWith]=\"displayWith\"\n    (optionSelected)=\"choose($event.option.value)\"\n  >\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.no-results' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('found') {\n        @for (principal of finder.state().results; track principal.prefixedId) {\n          <mat-option [value]=\"principal\" [attr.data-principal]=\"principal.prefixedId\">\n            <mat-icon aria-hidden=\"true\">{{\n              principal.kind === 'group' ? 'group' : 'person'\n            }}</mat-icon>\n            <span class=\"nxs-picker__option\">\n              <span class=\"nxs-picker__option-label\">{{ principal.label }}</span\n              >&ngsp;\n              <span class=\"nxs-picker__option-detail\"\n                >{{\n                  (principal.kind === 'group'\n                    ? 'satori-components.user-group-picker.group'\n                    : 'satori-components.user-group-picker.user'\n                  ) | translate\n                }}{{ principal.email ? ' \u00B7 ' + principal.email : '' }}</span\n              >\n            </span>\n          </mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: ["@use '../pickers/picker';\n\n:host {\n  @include picker.field;\n}\n\n@include picker.options;\n"] }]
    }], () => [], { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], search: [{ type: i0.Input, args: [{ isSignal: true, alias: "search", required: false }] }], minChars: [{ type: i0.Input, args: [{ isSignal: true, alias: "minChars", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsUserGroupPickerComponent, { className: "NxsUserGroupPickerComponent", filePath: "libs/shared/satori-components/src/lib/user-group-picker/user-group-picker.component.ts", lineNumber: 79 }); })();
function fromSuggestion(entry) {
    const kind = entry.type === 'GROUP_TYPE' ? 'group' : 'user';
    return {
        id: entry.id,
        label: entry.displayLabel?.trim() || entry.id,
        kind,
        prefixedId: entry.prefixed_id || `${kind}:${entry.id}`,
        ...(entry.email ? { email: entry.email } : {}),
    };
}
function fromUser(user) {
    const id = user.id;
    const first = user.properties?.firstName?.trim() ?? '';
    const last = user.properties?.lastName?.trim() ?? '';
    const email = user.properties?.email?.trim();
    return {
        id,
        label: `${first} ${last}`.trim() || id,
        kind: 'user',
        prefixedId: `user:${id}`,
        ...(email ? { email } : {}),
    };
}
function fromGroup(group) {
    const id = group.groupname;
    return {
        id,
        label: group.grouplabel?.trim() || id,
        kind: 'group',
        prefixedId: `group:${id}`,
    };
}
//# sourceMappingURL=user-group-picker.component.js.map