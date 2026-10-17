import { ChangeDetectionStrategy, Component, DestroyRef, booleanAttribute, computed, effect, inject, input, model, signal, untracked, viewChild, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipGrid, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { DirectoryService, directoryPickerLabel, directoryUsesL10nLabel, filterDirectoryPickerEntries, l10nEntryLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsPickerControl, nxsPickerProviders } from '../pickers/picker-control';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/autocomplete";
import * as i2 from "@angular/material/select";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/chips";
import * as i5 from "@angular/material/icon";
import * as i6 from "@angular/material/input";
import * as i7 from "@angular/material/form-field";
const _c0 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.label;
const _forTrack1 = ($index, $item) => $item.id;
function NxsVocabularySelectComponent_Conditional_3_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-row", 7);
    i0.ɵɵlistener("removed", function NxsVocabularySelectComponent_Conditional_3_For_3_Template_mat_chip_row_removed_0_listener() { const id_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r4 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r4.remove(id_r4)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 8);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "mat-icon", 9);
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const id_r4 = ctx.$implicit;
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("data-entry", id_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r4.labelOf(id_r4), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 3, "satori-components.pickers.remove", i0.ɵɵpureFunction1(6, _c0, ctx_r4.labelOf(id_r4))));
} }
function NxsVocabularySelectComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-grid", 3, 1);
    i0.ɵɵrepeaterCreate(2, NxsVocabularySelectComponent_Conditional_3_For_3_Template, 6, 8, "mat-chip-row", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(4, "input", 6);
    i0.ɵɵlistener("input", function NxsVocabularySelectComponent_Conditional_3_Template_input_input_4_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.onInput($event)); })("focus", function NxsVocabularySelectComponent_Conditional_3_Template_input_focus_4_listener() { i0.ɵɵrestoreView(_r2); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.opened()); })("blur", function NxsVocabularySelectComponent_Conditional_3_Template_input_blur_4_listener() { i0.ɵɵrestoreView(_r2); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.blurred()); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const grid_r6 = i0.ɵɵreference(1);
    const ctx_r4 = i0.ɵɵnextContext();
    const auto_r7 = i0.ɵɵreference(9);
    i0.ɵɵproperty("disabled", ctx_r4.isDisabled())("required", ctx_r4.required())("errorStateMatcher", ctx_r4.errorState);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r4.chosen());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r4.inputId)("matChipInputFor", grid_r6)("matAutocomplete", auto_r7)("value", ctx_r4.text());
} }
function NxsVocabularySelectComponent_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function NxsVocabularySelectComponent_Conditional_4_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r4 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r4.clear()); });
    i0.ɵɵelementStart(2, "mat-icon", 9);
    i0.ɵɵtext(3, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "satori-components.pickers.clear"));
} }
function NxsVocabularySelectComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 10);
    i0.ɵɵlistener("input", function NxsVocabularySelectComponent_Conditional_4_Template_input_input_0_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.onInput($event)); })("focus", function NxsVocabularySelectComponent_Conditional_4_Template_input_focus_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.opened()); })("blur", function NxsVocabularySelectComponent_Conditional_4_Template_input_blur_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.blurred()); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(1, NxsVocabularySelectComponent_Conditional_4_Conditional_1_Template, 4, 3, "button", 11);
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    const auto_r7 = i0.ɵɵreference(9);
    i0.ɵɵproperty("id", ctx_r4.inputId)("matAutocomplete", auto_r7)("value", ctx_r4.text())("required", ctx_r4.required())("disabled", ctx_r4.isDisabled())("errorStateMatcher", ctx_r4.errorState);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r4.chosen().length && !ctx_r4.isDisabled() ? 1 : -1);
} }
function NxsVocabularySelectComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.choose-from-list"));
} }
function NxsVocabularySelectComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.required"));
} }
function NxsVocabularySelectComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-hint");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r4.hint());
} }
function NxsVocabularySelectComponent_Case_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.loading"));
} }
function NxsVocabularySelectComponent_Case_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.vocabulary-select.failed"));
} }
function NxsVocabularySelectComponent_Case_12_For_1_Conditional_0_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r10 = ctx.$implicit;
    i0.ɵɵproperty("value", entry_r10.id);
    i0.ɵɵattribute("data-entry", entry_r10.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r10.label);
} }
function NxsVocabularySelectComponent_Case_12_For_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 13);
    i0.ɵɵrepeaterCreate(1, NxsVocabularySelectComponent_Case_12_For_1_Conditional_0_For_2_Template, 2, 3, "mat-option", 14, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("label", group_r11.label);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r11.entries);
} }
function NxsVocabularySelectComponent_Case_12_For_1_Conditional_1_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r12 = ctx.$implicit;
    i0.ɵɵproperty("value", entry_r12.id);
    i0.ɵɵattribute("data-entry", entry_r12.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r12.label);
} }
function NxsVocabularySelectComponent_Case_12_For_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsVocabularySelectComponent_Case_12_For_1_Conditional_1_For_1_Template, 2, 3, "mat-option", 14, _forTrack1);
} if (rf & 2) {
    const group_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵrepeater(group_r11.entries);
} }
function NxsVocabularySelectComponent_Case_12_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsVocabularySelectComponent_Case_12_For_1_Conditional_0_Template, 3, 1, "mat-optgroup", 13)(1, NxsVocabularySelectComponent_Case_12_For_1_Conditional_1_Template, 2, 0);
} if (rf & 2) {
    const group_r11 = ctx.$implicit;
    i0.ɵɵconditional(group_r11.label ? 0 : 1);
} }
function NxsVocabularySelectComponent_Case_12_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.no-results"));
} }
function NxsVocabularySelectComponent_Case_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsVocabularySelectComponent_Case_12_For_1_Template, 2, 1, null, null, _forTrack0, false, NxsVocabularySelectComponent_Case_12_ForEmpty_2_Template, 3, 3, "mat-option", 5);
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r4.groups());
} }
let nextId = 0;
/**
 * A field that chooses one entry, or several, from a Nuxeo vocabulary — Nature, Subjects, Coverage
 * or any directory — as Web UI's `nuxeo-directory-suggestion` does.
 *
 * It lists the whole vocabulary on focus and narrows it as the user types. A hierarchical one —
 * `l10nsubjects`, `l10ncoverage` — is listed under its parents, and a chosen child is stored and
 * shown as Web UI stores it: `europe/France`, labelled `Europe/France`. A parent with no children,
 * such as `antarctica`, is chosen as itself. With `multiple` each choice is a chip, removed with its button or
 * Backspace. The value is the entry's id, or a list of ids; an id the vocabulary no longer has is
 * kept and shown as it is, so opening a document never drops a value. Text typed and not chosen is
 * an `nxsChooseFromList` error on the form.
 */
export class NxsVocabularySelectComponent {
    /** The directory to choose from, such as `nature` or `l10ncoverage`. */
    directory = input.required(...(ngDevMode ? [{ debugName: "directory" }] : []));
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Choose several entries; the value is then a list of ids. */
    multiple = input(false, ...(ngDevMode ? [{ debugName: "multiple", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The id chosen, or `null`; with `multiple`, the ids chosen, in order. Two-way. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The input's id, in either mode: the form field's label names the input through it. */
    inputId = `nxs-vocabulary-select-${nextId++}`;
    directories = inject(DirectoryService);
    destroyRef = inject(DestroyRef);
    input = viewChild(MatInput, ...(ngDevMode ? [{ debugName: "input" }] : []));
    grid = viewChild(MatChipGrid, ...(ngDevMode ? [{ debugName: "grid" }] : []));
    control = new NxsPickerControl();
    loads = new Subject();
    /** The value the picker last set itself, so its own changes are not mistaken for a host's. */
    committed = null;
    loaded = signal({ status: 'loading' }, ...(ngDevMode ? [{ debugName: "loaded" }] : []));
    /** What the input shows: the chosen entry's label (single), or what the user is typing. */
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    /** The chosen ids, whichever mode. */
    chosen = computed(() => {
        const value = this.value();
        if (Array.isArray(value))
            return value;
        return typeof value === 'string' && value !== '' ? [value] : [];
    }, ...(ngDevMode ? [{ debugName: "chosen" }] : []));
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    groups = computed(() => {
        const loaded = this.loaded();
        if (loaded.status !== 'loaded')
            return [];
        // In single mode the input shows the chosen label, which is not a filter.
        const typed = this.text();
        const query = !this.multiple() && typed === this.labelOf(this.chosen()[0] ?? '') ? '' : typed;
        const taken = new Set(this.multiple() ? this.chosen() : []);
        return loaded
            .filter(query)
            .map((group) => ({
            ...group,
            entries: group.entries.filter((entry) => !taken.has(entry.id)),
        }))
            .filter((group) => group.entries.length > 0);
    }, ...(ngDevMode ? [{ debugName: "groups" }] : []));
    /** Text typed and no entry chosen for it. */
    unmatched = computed(() => {
        const typed = this.text().trim();
        if (!typed)
            return false;
        return this.multiple() || typed !== this.labelOf(this.chosen()[0] ?? '');
    }, ...(ngDevMode ? [{ debugName: "unmatched" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.unmatched() || this.missing() || this.control.formInvalid()),
    };
    constructor() {
        this.loads
            .pipe(switchMap((directory) => this.load(directory)), takeUntilDestroyed(this.destroyRef))
            .subscribe((loaded) => this.loaded.set(loaded));
        effect(() => {
            const directory = this.directory();
            untracked(() => this.reload(directory));
        });
        // The input shows the chosen entry's label: once the labels arrive, and when the value changes
        // from outside — never while the user is typing, which is what clears the value.
        effect(() => {
            const loaded = this.loaded();
            untracked(() => {
                const first = this.chosen()[0];
                if (!this.multiple() && loaded.status === 'loaded' && first)
                    this.text.set(this.labelOf(first));
            });
        });
        effect(() => {
            const value = this.value();
            untracked(() => {
                if (value === this.committed)
                    return;
                this.committed = value;
                if (!this.multiple())
                    this.text.set(typeof value === 'string' ? this.labelOf(value) : '');
            });
        });
        effect(() => {
            this.unmatched();
            untracked(() => this.control.revalidate());
        });
    }
    /** `MatInput` and `MatChipGrid` recompute their error state only with a form control of their own. */
    ngDoCheck() {
        this.input()?.updateErrorState();
        this.grid()?.updateErrorState();
    }
    writeValue(value) {
        this.value.set(this.multiple() ? (Array.isArray(value) ? value : value ? [value] : []) : (value ?? null));
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
        return this.control.validate(control, this.unmatched() ? { nxsChooseFromList: true } : null);
    }
    registerOnValidatorChange(fn) {
        this.control.registerOnValidatorChange(fn);
    }
    /** The label the field and its chips show for an id: the entry's, or the id itself. */
    labelOf(id) {
        const loaded = this.loaded();
        return (loaded.status === 'loaded' ? loaded.labels.get(id) : undefined) ?? id;
    }
    missing() {
        return this.control.missing(this.required(), this.chosen().length === 0);
    }
    onInput(event) {
        const typed = event.target.value;
        this.text.set(typed);
        if (!this.multiple() && this.chosen().length && typed !== this.labelOf(this.chosen()[0])) {
            this.commit(null);
        }
    }
    opened() {
        if (this.loaded().status === 'failed')
            this.reload(this.directory());
    }
    choose(id) {
        if (this.multiple()) {
            this.commit([...this.chosen(), id]);
            this.text.set('');
        }
        else {
            this.text.set(this.labelOf(id));
            this.commit(id);
        }
    }
    remove(id) {
        this.commit(this.chosen().filter((chosen) => chosen !== id));
    }
    clear() {
        this.text.set('');
        this.commit(null);
    }
    blurred() {
        this.control.blurred();
    }
    commit(value) {
        const next = this.multiple() ? (Array.isArray(value) ? value : []) : value;
        this.committed = next;
        this.value.set(next);
        this.control.changed(next);
    }
    reload(directory) {
        this.loaded.set({ status: 'loading' });
        this.loads.next(directory);
    }
    load(directory) {
        const loaded = directoryUsesL10nLabel(directory)
            ? this.directories.getAllL10nEntries(directory).pipe(map(hierarchical))
            : this.directories.getEntries(directory).pipe(map((entries) => {
                const labels = new Map(entries.map((entry) => [entry.id, directoryPickerLabel(entry)]));
                return {
                    status: 'loaded',
                    labels,
                    filter: (text) => [
                        {
                            label: '',
                            entries: filterDirectoryPickerEntries(entries, text).map((entry) => ({
                                id: entry.id,
                                label: labels.get(entry.id) ?? entry.id,
                            })),
                        },
                    ],
                };
            }));
        return loaded.pipe(catchError(() => of({ status: 'failed' })));
    }
    static ɵfac = function NxsVocabularySelectComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsVocabularySelectComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsVocabularySelectComponent, selectors: [["nxs-vocabulary-select"]], viewQuery: function NxsVocabularySelectComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.input, MatInput, 5);
            i0.ɵɵviewQuerySignal(ctx.grid, MatChipGrid, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, hostAttrs: [1, "nxs-vocabulary-select"], inputs: { directory: [1, "directory"], label: [1, "label"], multiple: [1, "multiple"], hint: [1, "hint"], required: [1, "required"], disabled: [1, "disabled"], value: [1, "value"] }, outputs: { value: "valueChange" }, features: [i0.ɵɵProvidersFeature(nxsPickerProviders(() => NxsVocabularySelectComponent))], decls: 13, vars: 5, consts: [["auto", "matAutocomplete"], ["grid", ""], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-picker__field"], [3, "disabled", "required", "errorStateMatcher"], [3, "optionSelected"], ["disabled", "", 1, "nxs-picker__status"], ["autocomplete", "off", 3, "input", "focus", "blur", "id", "matChipInputFor", "matAutocomplete", "value"], [3, "removed"], ["matChipRemove", "", "type", "button"], ["aria-hidden", "true"], ["matInput", "", "type", "text", "autocomplete", "off", 3, "input", "focus", "blur", "id", "matAutocomplete", "value", "required", "disabled", "errorStateMatcher"], ["matIconSuffix", "", "mat-icon-button", "", "type", "button", 1, "nxs-picker__clear"], ["matIconSuffix", "", "mat-icon-button", "", "type", "button", 1, "nxs-picker__clear", 3, "click"], [3, "label"], [3, "value"]], template: function NxsVocabularySelectComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "mat-form-field", 2)(1, "mat-label");
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(3, NxsVocabularySelectComponent_Conditional_3_Template, 5, 7, "mat-chip-grid", 3)(4, NxsVocabularySelectComponent_Conditional_4_Template, 2, 7);
            i0.ɵɵconditionalCreate(5, NxsVocabularySelectComponent_Conditional_5_Template, 3, 3, "mat-error")(6, NxsVocabularySelectComponent_Conditional_6_Template, 3, 3, "mat-error");
            i0.ɵɵconditionalCreate(7, NxsVocabularySelectComponent_Conditional_7_Template, 2, 1, "mat-hint");
            i0.ɵɵelementStart(8, "mat-autocomplete", 4, 0);
            i0.ɵɵlistener("optionSelected", function NxsVocabularySelectComponent_Template_mat_autocomplete_optionSelected_8_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.choose($event.option.value)); });
            i0.ɵɵconditionalCreate(10, NxsVocabularySelectComponent_Case_10_Template, 3, 3, "mat-option", 5)(11, NxsVocabularySelectComponent_Case_11_Template, 3, 3, "mat-option", 5)(12, NxsVocabularySelectComponent_Case_12_Template, 3, 1);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_5_0;
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.label());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.multiple() ? 3 : 4);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.unmatched() ? 5 : ctx.missing() ? 6 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.hint() ? 7 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_5_0 = ctx.loaded().status) === "loading" ? 10 : tmp_5_0 === "failed" ? 11 : 12);
        } }, dependencies: [MatAutocompleteModule, i1.MatAutocomplete, i2.MatOption, i2.MatOptgroup, i1.MatAutocompleteTrigger, MatButtonModule, i3.MatIconButton, MatChipsModule, i4.MatChipGrid, i4.MatChipInput, i4.MatChipRemove, i4.MatChipRow, MatIconModule, i5.MatIcon, MatInputModule, i6.MatInput, i7.MatFormField, i7.MatLabel, i7.MatHint, i7.MatError, i7.MatSuffix, TranslatePipe], styles: ["@use '../pickers/picker';\n\n[_nghost-%COMP%] {\n  @include picker.field;\n}\n\n@include picker.options;"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsVocabularySelectComponent, [{
        type: Component,
        args: [{ selector: 'nxs-vocabulary-select', standalone: true, imports: [
                    MatAutocompleteModule,
                    MatButtonModule,
                    MatChipsModule,
                    MatIconModule,
                    MatInputModule,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsVocabularySelectComponent), host: { class: 'nxs-vocabulary-select' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  @if (multiple()) {\n    <mat-chip-grid\n      #grid\n      [disabled]=\"isDisabled()\"\n      [required]=\"required()\"\n      [errorStateMatcher]=\"errorState\"\n    >\n      @for (id of chosen(); track id) {\n        <mat-chip-row [attr.data-entry]=\"id\" (removed)=\"remove(id)\">\n          {{ labelOf(id) }}\n          <button\n            matChipRemove\n            type=\"button\"\n            [attr.aria-label]=\"\n              'satori-components.pickers.remove' | translate: { name: labelOf(id) }\n            \"\n          >\n            <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n          </button>\n        </mat-chip-row>\n      }\n      <input\n        autocomplete=\"off\"\n        [id]=\"inputId\"\n        [matChipInputFor]=\"grid\"\n        [matAutocomplete]=\"auto\"\n        [value]=\"text()\"\n        (input)=\"onInput($event)\"\n        (focus)=\"opened()\"\n        (blur)=\"blurred()\"\n      />\n    </mat-chip-grid>\n  } @else {\n    <input\n      matInput\n      type=\"text\"\n      autocomplete=\"off\"\n      [id]=\"inputId\"\n      [matAutocomplete]=\"auto\"\n      [value]=\"text()\"\n      [required]=\"required()\"\n      [disabled]=\"isDisabled()\"\n      [errorStateMatcher]=\"errorState\"\n      (input)=\"onInput($event)\"\n      (focus)=\"opened()\"\n      (blur)=\"blurred()\"\n    />\n    @if (chosen().length && !isDisabled()) {\n      <button\n        matIconSuffix\n        mat-icon-button\n        type=\"button\"\n        class=\"nxs-picker__clear\"\n        [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n        (click)=\"clear()\"\n      >\n        <mat-icon aria-hidden=\"true\">close</mat-icon>\n      </button>\n    }\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete #auto=\"matAutocomplete\" (optionSelected)=\"choose($event.option.value)\">\n    @switch (loaded().status) {\n      @case ('loading') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.loading' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.vocabulary-select.failed' | translate\n        }}</mat-option>\n      }\n      @default {\n        @for (group of groups(); track group.label) {\n          @if (group.label) {\n            <mat-optgroup [label]=\"group.label\">\n              @for (entry of group.entries; track entry.id) {\n                <mat-option [value]=\"entry.id\" [attr.data-entry]=\"entry.id\">{{\n                  entry.label\n                }}</mat-option>\n              }\n            </mat-optgroup>\n          } @else {\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\" [attr.data-entry]=\"entry.id\">{{\n                entry.label\n              }}</mat-option>\n            }\n          }\n        } @empty {\n          <mat-option disabled class=\"nxs-picker__status\">{{\n            'satori-components.pickers.no-results' | translate\n          }}</mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: ["@use '../pickers/picker';\n\n:host {\n  @include picker.field;\n}\n\n@include picker.options;\n"] }]
    }], () => [], { directory: [{ type: i0.Input, args: [{ isSignal: true, alias: "directory", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], multiple: [{ type: i0.Input, args: [{ isSignal: true, alias: "multiple", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }], grid: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatChipGrid), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsVocabularySelectComponent, { className: "NxsVocabularySelectComponent", filePath: "libs/shared/satori-components/src/lib/vocabulary-select/vocabulary-select.component.ts", lineNumber: 95 }); })();
/**
 * An l10n vocabulary, as Web UI's directory suggestion offers it: each child under its parent, with
 * the value `<parent>/<id>` (`_idFunction` in `nuxeo-directory-suggestion`), and a parent that has no
 * children as an entry of its own. The entries' ids are bare (`France`, parent `europe`), so the
 * parent is what keeps two children of one name apart.
 */
function hierarchical(entries) {
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    const parentIds = new Set(entries.map((entry) => entry.properties.parent).filter(Boolean));
    const parentLabel = (id) => {
        const parent = byId.get(id);
        return parent ? l10nEntryLabel(parent) : id;
    };
    const valueOf = (entry) => entry.properties.parent ? `${entry.properties.parent}/${entry.id}` : entry.id;
    const selectable = entries.filter((entry) => entry.properties.parent || !parentIds.has(entry.id));
    const labels = new Map(selectable.map((entry) => [
        valueOf(entry),
        entry.properties.parent
            ? `${parentLabel(entry.properties.parent)}/${l10nEntryLabel(entry)}`
            : l10nEntryLabel(entry),
    ]));
    return {
        status: 'loaded',
        labels,
        filter: (text) => {
            const query = text.trim().toLowerCase();
            const matches = (entry) => !query ||
                [
                    l10nEntryLabel(entry),
                    entry.id,
                    entry.properties.parent ? parentLabel(entry.properties.parent) : '',
                ].some((candidate) => candidate.toLowerCase().includes(query));
            const groups = new Map();
            const leaves = [];
            for (const entry of selectable.filter(matches)) {
                const option = { id: valueOf(entry), label: l10nEntryLabel(entry) };
                const parent = entry.properties.parent;
                if (!parent)
                    leaves.push(option);
                else
                    groups.set(parent, [...(groups.get(parent) ?? []), option]);
            }
            return [
                ...(leaves.length ? [{ label: '', entries: leaves }] : []),
                ...[...groups]
                    .map(([parent, children]) => ({ label: parentLabel(parent), entries: children }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
            ];
        },
    };
}
//# sourceMappingURL=vocabulary-select.component.js.map