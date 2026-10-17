import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, model, signal, untracked, viewChild, } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipGrid, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TagService } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsPickerControl, nxsPickerProviders } from '../pickers/picker-control';
import { nxsSearchAsYouType } from '../pickers/search-as-you-type';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/autocomplete";
import * as i2 from "@angular/material/select";
import * as i3 from "@angular/material/chips";
import * as i4 from "@angular/material/icon";
import * as i5 from "@angular/material/form-field";
const _c0 = a0 => ({ name: a0 });
const _c1 = a0 => ({ tag: a0 });
function NxsTagInputComponent_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-row", 8);
    i0.ɵɵlistener("removed", function NxsTagInputComponent_For_6_Template_mat_chip_row_removed_0_listener() { const tag_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.remove(tag_r3)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 9);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "mat-icon", 10);
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const tag_r3 = ctx.$implicit;
    i0.ɵɵattribute("data-tag", tag_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", tag_r3, " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 3, "satori-components.pickers.remove", i0.ɵɵpureFunction1(6, _c0, tag_r3)));
} }
function NxsTagInputComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.required"));
} }
function NxsTagInputComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-hint");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.hint());
} }
function NxsTagInputComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const typed_r5 = ctx;
    i0.ɵɵproperty("value", typed_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 2, "satori-components.tag-input.add", i0.ɵɵpureFunction1(5, _c1, typed_r5)));
} }
function NxsTagInputComponent_Case_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.searching"));
} }
function NxsTagInputComponent_Case_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.failed"));
} }
function NxsTagInputComponent_Case_15_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.no-results"));
} }
function NxsTagInputComponent_Case_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsTagInputComponent_Case_15_Conditional_0_Template, 3, 3, "mat-option", 7);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵconditional(!ctx_r3.addable() ? 0 : -1);
} }
function NxsTagInputComponent_Case_16_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tag_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", tag_r6);
    i0.ɵɵattribute("data-tag", tag_r6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(tag_r6);
} }
function NxsTagInputComponent_Case_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsTagInputComponent_Case_16_For_1_Template, 2, 3, "mat-option", 11, i0.ɵɵrepeaterTrackByIdentity);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r3.suggestions());
} }
/** Web UI's tag suggestion searches from the first character. */
const WEB_UI_MIN_CHARS = 1;
let nextId = 0;
/**
 * A field of tags: existing ones suggested as the user types, as Web UI's `nuxeo-tag-suggestion`
 * does, and a new one added with Enter, a comma or its "Add" entry. Each tag is a chip, removed
 * with its button or Backspace.
 *
 * A form control, not an editor of a document's tags: the value is the list of labels, and the host
 * saves it — through `TagService.addTag` and `removeTag`, for a document's tags. A label is trimmed,
 * and one the field already holds, whatever its case, is not added twice.
 */
export class NxsTagInputComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Let the user add a tag no document has yet. On by default, as in Web UI. */
    allowNew = input(true, ...(ngDevMode ? [{ debugName: "allowNew", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The tags, in the order they were added. Two-way; a form control carries the same value. */
    value = model([], ...(ngDevMode ? [{ debugName: "value" }] : []));
    separators = [ENTER, COMMA];
    /** The input's id: the form field's label names the input through it. One per field. */
    inputId = `nxs-tag-input-${nextId++}`;
    tags = inject(TagService);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    grid = viewChild.required(MatChipGrid);
    trigger = viewChild.required(MatAutocompleteTrigger);
    control = new NxsPickerControl();
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    finder = nxsSearchAsYouType((term) => this.tags.suggestTags(term), () => WEB_UI_MIN_CHARS);
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    /** Suggestions the field does not hold yet. */
    suggestions = computed(() => this.finder.state().results.filter((tag) => !this.holds(tag)), ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    /** The typed text as a new tag, when it may be added and is not already there. */
    addable = computed(() => {
        const typed = this.text().trim();
        if (!this.allowNew() || !typed || this.holds(typed))
            return null;
        const known = this.finder.state().results.some((tag) => same(tag, typed));
        return known ? null : typed;
    }, ...(ngDevMode ? [{ debugName: "addable" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() && (this.missing() || this.control.formInvalid()),
    };
    constructor() {
        effect(() => {
            const { status, results } = this.finder.state();
            untracked(() => {
                const key = status === 'found'
                    ? results.length === 1
                        ? 'satori-components.pickers.results-one'
                        : 'satori-components.pickers.results-many'
                    : status === 'none'
                        ? 'satori-components.pickers.no-results'
                        : status === 'failed'
                            ? 'satori-components.pickers.failed'
                            : null;
                if (key) {
                    void this.announcer.announce(this.translate.instant(key, { count: results.length }), 'polite');
                }
            });
        });
    }
    /** `MatChipGrid` recomputes its error state only with a form control of its own. */
    ngDoCheck() {
        this.grid().updateErrorState();
    }
    writeValue(value) {
        this.value.set(value ?? []);
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
    /** No errors of its own: a typed tag is added or discarded, never left half-chosen. */
    validate(control) {
        return this.control.validate(control, null);
    }
    missing() {
        return this.control.missing(this.required(), this.value().length === 0);
    }
    onInput(event) {
        const typed = event.target.value;
        this.text.set(typed);
        this.finder.query(typed);
    }
    /** Enter or a comma: add what was typed, unless the user is on a suggestion, which wins. */
    tokenEnd(event) {
        if (this.trigger().activeOption)
            return;
        const typed = event.value.trim();
        if (typed && this.allowNew())
            this.add(typed);
        event.chipInput.clear();
    }
    add(tag) {
        const label = tag.trim();
        if (label && !this.holds(label))
            this.commit([...this.value(), label]);
        this.text.set('');
        this.finder.reset();
    }
    remove(tag) {
        this.commit(this.value().filter((held) => held !== tag));
    }
    blurred() {
        this.control.blurred();
    }
    holds(tag) {
        return this.value().some((held) => same(held, tag));
    }
    commit(value) {
        this.value.set(value);
        this.control.changed(value);
    }
    static ɵfac = function NxsTagInputComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsTagInputComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsTagInputComponent, selectors: [["nxs-tag-input"]], viewQuery: function NxsTagInputComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.grid, MatChipGrid, 5);
            i0.ɵɵviewQuerySignal(ctx.trigger, MatAutocompleteTrigger, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, hostAttrs: [1, "nxs-tag-input"], inputs: { label: [1, "label"], allowNew: [1, "allowNew"], hint: [1, "hint"], required: [1, "required"], disabled: [1, "disabled"], value: [1, "value"] }, outputs: { value: "valueChange" }, features: [i0.ɵɵProvidersFeature(nxsPickerProviders(() => NxsTagInputComponent))], decls: 17, vars: 13, consts: [["grid", ""], ["auto", "matAutocomplete"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-picker__field"], [3, "disabled", "required", "errorStateMatcher"], ["autocomplete", "off", 3, "matChipInputTokenEnd", "input", "blur", "id", "matChipInputFor", "matChipInputSeparatorKeyCodes", "matAutocomplete", "value"], [3, "optionSelected"], [1, "nxs-tag-input__new", 3, "value"], ["disabled", "", 1, "nxs-picker__status"], [3, "removed"], ["matChipRemove", "", "type", "button"], ["aria-hidden", "true"], [3, "value"]], template: function NxsTagInputComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "mat-form-field", 2)(1, "mat-label");
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-chip-grid", 3, 0);
            i0.ɵɵrepeaterCreate(5, NxsTagInputComponent_For_6_Template, 6, 8, "mat-chip-row", null, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementStart(7, "input", 4);
            i0.ɵɵlistener("matChipInputTokenEnd", function NxsTagInputComponent_Template_input_matChipInputTokenEnd_7_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.tokenEnd($event)); })("input", function NxsTagInputComponent_Template_input_input_7_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onInput($event)); })("blur", function NxsTagInputComponent_Template_input_blur_7_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.blurred()); });
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(8, NxsTagInputComponent_Conditional_8_Template, 3, 3, "mat-error");
            i0.ɵɵconditionalCreate(9, NxsTagInputComponent_Conditional_9_Template, 2, 1, "mat-hint");
            i0.ɵɵelementStart(10, "mat-autocomplete", 5, 1);
            i0.ɵɵlistener("optionSelected", function NxsTagInputComponent_Template_mat_autocomplete_optionSelected_10_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.add($event.option.value)); });
            i0.ɵɵconditionalCreate(12, NxsTagInputComponent_Conditional_12_Template, 3, 7, "mat-option", 6);
            i0.ɵɵconditionalCreate(13, NxsTagInputComponent_Case_13_Template, 3, 3, "mat-option", 7)(14, NxsTagInputComponent_Case_14_Template, 3, 3, "mat-option", 7)(15, NxsTagInputComponent_Case_15_Template, 1, 1)(16, NxsTagInputComponent_Case_16_Template, 2, 0);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_14_0;
            let tmp_15_0;
            const grid_r7 = i0.ɵɵreference(4);
            const auto_r8 = i0.ɵɵreference(11);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.label());
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.isDisabled())("required", ctx.required())("errorStateMatcher", ctx.errorState);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.value());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("id", ctx.inputId)("matChipInputFor", grid_r7)("matChipInputSeparatorKeyCodes", ctx.separators)("matAutocomplete", auto_r8)("value", ctx.text());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.missing() ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.hint() ? 9 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_14_0 = ctx.addable()) ? 12 : -1, tmp_14_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_15_0 = ctx.finder.state().status) === "searching" ? 13 : tmp_15_0 === "failed" ? 14 : tmp_15_0 === "none" ? 15 : tmp_15_0 === "found" ? 16 : -1);
        } }, dependencies: [MatAutocompleteModule, i1.MatAutocomplete, i2.MatOption, i1.MatAutocompleteTrigger, MatChipsModule, i3.MatChipGrid, i3.MatChipInput, i3.MatChipRemove, i3.MatChipRow, MatIconModule, i4.MatIcon, MatInputModule, i5.MatFormField, i5.MatLabel, i5.MatHint, i5.MatError, TranslatePipe], styles: ["@use '../pickers/picker';\n\n[_nghost-%COMP%] {\n  @include picker.field;\n}\n\n@include picker.options;"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsTagInputComponent, [{
        type: Component,
        args: [{ selector: 'nxs-tag-input', standalone: true, imports: [MatAutocompleteModule, MatChipsModule, MatIconModule, MatInputModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsTagInputComponent), host: { class: 'nxs-tag-input' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <mat-chip-grid\n    #grid\n    [disabled]=\"isDisabled()\"\n    [required]=\"required()\"\n    [errorStateMatcher]=\"errorState\"\n  >\n    @for (tag of value(); track tag) {\n      <mat-chip-row [attr.data-tag]=\"tag\" (removed)=\"remove(tag)\">\n        {{ tag }}\n        <button\n          matChipRemove\n          type=\"button\"\n          [attr.aria-label]=\"'satori-components.pickers.remove' | translate: { name: tag }\"\n        >\n          <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n        </button>\n      </mat-chip-row>\n    }\n    <input\n      autocomplete=\"off\"\n      [id]=\"inputId\"\n      [matChipInputFor]=\"grid\"\n      [matChipInputSeparatorKeyCodes]=\"separators\"\n      [matAutocomplete]=\"auto\"\n      [value]=\"text()\"\n      (matChipInputTokenEnd)=\"tokenEnd($event)\"\n      (input)=\"onInput($event)\"\n      (blur)=\"blurred()\"\n    />\n  </mat-chip-grid>\n  @if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete #auto=\"matAutocomplete\" (optionSelected)=\"add($event.option.value)\">\n    @if (addable(); as typed) {\n      <mat-option [value]=\"typed\" class=\"nxs-tag-input__new\">{{\n        'satori-components.tag-input.add' | translate: { tag: typed }\n      }}</mat-option>\n    }\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        @if (!addable()) {\n          <mat-option disabled class=\"nxs-picker__status\">{{\n            'satori-components.pickers.no-results' | translate\n          }}</mat-option>\n        }\n      }\n      @case ('found') {\n        @for (tag of suggestions(); track tag) {\n          <mat-option [value]=\"tag\" [attr.data-tag]=\"tag\">{{ tag }}</mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: ["@use '../pickers/picker';\n\n:host {\n  @include picker.field;\n}\n\n@include picker.options;\n"] }]
    }], () => [], { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], allowNew: [{ type: i0.Input, args: [{ isSignal: true, alias: "allowNew", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], grid: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatChipGrid), { isSignal: true }] }], trigger: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatAutocompleteTrigger), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsTagInputComponent, { className: "NxsTagInputComponent", filePath: "libs/shared/satori-components/src/lib/tag-input/tag-input.component.ts", lineNumber: 58 }); })();
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
//# sourceMappingURL=tag-input.component.js.map