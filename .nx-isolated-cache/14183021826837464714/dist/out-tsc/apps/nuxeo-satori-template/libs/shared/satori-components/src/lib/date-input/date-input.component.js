import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, model, signal, untracked, viewChild, } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerInput, MatDatepickerIntl, MatDatepickerModule, } from '@angular/material/datepicker';
import { MatInput, MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { NxsPickerControl, nxsPickerProviders } from '../pickers/picker-control';
import { NxsDatepickerIntl, provideNxsDateAdapter } from './locale-date';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/datepicker";
import * as i2 from "@angular/material/input";
import * as i3 from "@angular/material/form-field";
const _c0 = a0 => ({ example: a0 });
const _c1 = a0 => ({ date: a0 });
function NxsDateInputComponent_Case_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "satori-components.date-input.invalid", i0.ɵɵpureFunction1(4, _c0, ctx_r1.example())));
} }
function NxsDateInputComponent_Case_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "satori-components.date-input.too-early", i0.ɵɵpureFunction1(4, _c1, ctx_r1.formatted(ctx_r1.min()))));
} }
function NxsDateInputComponent_Case_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "satori-components.date-input.too-late", i0.ɵɵpureFunction1(4, _c1, ctx_r1.formatted(ctx_r1.max()))));
} }
function NxsDateInputComponent_Case_10_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.required"));
} }
function NxsDateInputComponent_Case_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsDateInputComponent_Case_10_Conditional_0_Template, 3, 3, "mat-error");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.missing() ? 0 : -1);
} }
function NxsDateInputComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-hint");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.hint());
} }
/**
 * A date field: typed, or chosen from Material's calendar — the thin wrapper over the Material
 * datepicker the application's date fields share.
 *
 * A typed date is read in the order the user's locale writes dates — `03/04/2026` is 3 April in
 * French and 4 March in American English — where Material's native adapter reads every one as
 * American. A host that provides its own date adapter, other than Material's native one, keeps it.
 * The calendar's labels are translated. Text that is not a date, or a date outside `min` and `max`,
 * shows an error with an example in the locale's format and is an error on the form
 * (`nxsDateParse`, `nxsDateMin`, `nxsDateMax`); the value is then `null`.
 */
export class NxsDateInputComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The earliest date allowed, or `null`. */
    min = input(null, ...(ngDevMode ? [{ debugName: "min" }] : []));
    /** The latest date allowed, or `null`. */
    max = input(null, ...(ngDevMode ? [{ debugName: "max" }] : []));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The date, at local midnight, or `null`. Two-way; a form control carries the same value. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    adapter = inject(DateAdapter);
    formats = inject(MAT_DATE_FORMATS);
    input = viewChild.required(MatInput);
    dateInput = viewChild.required(MatDatepickerInput);
    /** The date the field last set itself, so its own changes are not mistaken for a host's. */
    committed = null;
    control = new NxsPickerControl();
    /** What the user typed, while it is not a date the field holds. */
    typed = signal('', ...(ngDevMode ? [{ debugName: "typed" }] : []));
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    /** Why the typed text or the date is refused, if it is. */
    problem = computed(() => {
        if (this.typed().trim() && !this.value())
            return 'parse';
        const value = this.value();
        if (!value)
            return null;
        const min = this.min();
        const max = this.max();
        if (min && this.adapter.compareDate(value, min) < 0)
            return 'min';
        if (max && this.adapter.compareDate(value, max) > 0)
            return 'max';
        return null;
    }, ...(ngDevMode ? [{ debugName: "problem" }] : []));
    /** A date written the way the locale writes dates, with a day above 12 so the order shows. */
    example = computed(() => this.formatted(this.adapter.createDate(new Date().getFullYear(), 11, 31)), ...(ngDevMode ? [{ debugName: "example" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.problem() !== null || this.missing() || this.control.formInvalid()),
    };
    constructor() {
        effect(() => {
            this.problem();
            untracked(() => this.control.revalidate());
        });
        // A date set from outside is written into the input. The field's own changes are not: writing
        // `null` while the user types text that is not a date yet would erase what they typed.
        effect(() => {
            const value = this.value();
            untracked(() => {
                if (value === this.committed)
                    return;
                this.committed = value;
                this.typed.set('');
                this.dateInput().value = value;
            });
        });
    }
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck() {
        this.input().updateErrorState();
    }
    writeValue(value) {
        this.value.set(value && this.adapter.isValid(value) ? value : null);
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
    validate(control) {
        const problem = this.problem();
        const errors = problem === 'parse'
            ? { nxsDateParse: { text: this.typed() } }
            : problem === 'min'
                ? { nxsDateMin: { min: this.min() } }
                : problem === 'max'
                    ? { nxsDateMax: { max: this.max() } }
                    : null;
        return this.control.validate(control, errors);
    }
    registerOnValidatorChange(fn) {
        this.control.registerOnValidatorChange(fn);
    }
    missing() {
        return this.control.missing(this.required(), this.value() === null && !this.typed().trim());
    }
    formatted(date) {
        return date && this.adapter.isValid(date)
            ? this.adapter.format(date, this.formats.display.dateInput)
            : '';
    }
    /**
     * The raw text, on each key. The datepicker emits `dateInput` only when its date changes, so text
     * that is not a date, typed into an empty field, reaches the picker only here.
     */
    typing(event) {
        this.typed.set(event.target.value);
    }
    /** Each key typed, and a date chosen from the calendar: the datepicker has parsed the text. */
    changed(event) {
        const text = event.targetElement instanceof HTMLInputElement ? event.targetElement.value : '';
        const date = event.value && this.adapter.isValid(event.value) ? event.value : null;
        this.typed.set(date ? '' : text);
        this.committed = date;
        this.value.set(date);
        this.control.changed(date);
    }
    blurred() {
        this.control.blurred();
    }
    static ɵfac = function NxsDateInputComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDateInputComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDateInputComponent, selectors: [["nxs-date-input"]], viewQuery: function NxsDateInputComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.input, MatInput, 5);
            i0.ɵɵviewQuerySignal(ctx.dateInput, MatDatepickerInput, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, hostAttrs: [1, "nxs-date-input"], inputs: { label: [1, "label"], min: [1, "min"], max: [1, "max"], hint: [1, "hint"], required: [1, "required"], disabled: [1, "disabled"], value: [1, "value"] }, outputs: { value: "valueChange" }, features: [i0.ɵɵProvidersFeature([
                nxsPickerProviders(() => NxsDateInputComponent),
                provideNxsDateAdapter(),
                { provide: MatDatepickerIntl, useClass: NxsDatepickerIntl },
            ])], decls: 12, vars: 10, consts: [["picker", ""], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-picker__field"], ["matInput", "", "autocomplete", "off", 3, "input", "dateInput", "blur", "matDatepicker", "min", "max", "required", "disabled", "errorStateMatcher"], ["matIconSuffix", "", 3, "for"]], template: function NxsDateInputComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "mat-form-field", 1)(1, "mat-label");
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "input", 2);
            i0.ɵɵlistener("input", function NxsDateInputComponent_Template_input_input_3_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.typing($event)); })("dateInput", function NxsDateInputComponent_Template_input_dateInput_3_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.changed($event)); })("blur", function NxsDateInputComponent_Template_input_blur_3_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.blurred()); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(4, "mat-datepicker-toggle", 3)(5, "mat-datepicker", null, 0);
            i0.ɵɵconditionalCreate(7, NxsDateInputComponent_Case_7_Template, 3, 6, "mat-error")(8, NxsDateInputComponent_Case_8_Template, 3, 6, "mat-error")(9, NxsDateInputComponent_Case_9_Template, 3, 6, "mat-error")(10, NxsDateInputComponent_Case_10_Template, 1, 1);
            i0.ɵɵconditionalCreate(11, NxsDateInputComponent_Conditional_11_Template, 2, 1, "mat-hint");
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_9_0;
            const picker_r3 = i0.ɵɵreference(6);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.label());
            i0.ɵɵadvance();
            i0.ɵɵproperty("matDatepicker", picker_r3)("min", ctx.min())("max", ctx.max())("required", ctx.required())("disabled", ctx.isDisabled())("errorStateMatcher", ctx.errorState);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", picker_r3);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_9_0 = ctx.problem()) === "parse" ? 7 : tmp_9_0 === "min" ? 8 : tmp_9_0 === "max" ? 9 : 10);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.hint() ? 11 : -1);
        } }, dependencies: [MatDatepickerModule, i1.MatDatepicker, i1.MatDatepickerInput, i1.MatDatepickerToggle, MatInputModule, i2.MatInput, i3.MatFormField, i3.MatLabel, i3.MatHint, i3.MatError, i3.MatSuffix, TranslatePipe], styles: ["@use '../pickers/picker';\n\n[_nghost-%COMP%] {\n  @include picker.field;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDateInputComponent, [{
        type: Component,
        args: [{ selector: 'nxs-date-input', standalone: true, imports: [MatDatepickerModule, MatInputModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, providers: [
                    nxsPickerProviders(() => NxsDateInputComponent),
                    provideNxsDateAdapter(),
                    { provide: MatDatepickerIntl, useClass: NxsDatepickerIntl },
                ], host: { class: 'nxs-date-input' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    autocomplete=\"off\"\n    [matDatepicker]=\"picker\"\n    [min]=\"min()\"\n    [max]=\"max()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"typing($event)\"\n    (dateInput)=\"changed($event)\"\n    (blur)=\"blurred()\"\n  />\n  <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n  <mat-datepicker #picker />\n  @switch (problem()) {\n    @case ('parse') {\n      <mat-error>{{\n        'satori-components.date-input.invalid' | translate: { example: example() }\n      }}</mat-error>\n    }\n    @case ('min') {\n      <mat-error>{{\n        'satori-components.date-input.too-early' | translate: { date: formatted(min()) }\n      }}</mat-error>\n    }\n    @case ('max') {\n      <mat-error>{{\n        'satori-components.date-input.too-late' | translate: { date: formatted(max()) }\n      }}</mat-error>\n    }\n    @default {\n      @if (missing()) {\n        <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n      }\n    }\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n</mat-form-field>\n", styles: ["@use '../pickers/picker';\n\n:host {\n  @include picker.field;\n}\n"] }]
    }], () => [], { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], min: [{ type: i0.Input, args: [{ isSignal: true, alias: "min", required: false }] }], max: [{ type: i0.Input, args: [{ isSignal: true, alias: "max", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }], dateInput: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatDatepickerInput), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDateInputComponent, { className: "NxsDateInputComponent", filePath: "libs/shared/satori-components/src/lib/date-input/date-input.component.ts", lineNumber: 59 }); })();
