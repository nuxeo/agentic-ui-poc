import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, model, output, signal, untracked, viewChild, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { NuxeoApiBase, escapeNxqlLiteral, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsDocTypeIconComponent } from '../doc-type-icon/doc-type-icon.component';
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
const _forTrack0 = ($index, $item) => $item.uid;
function NxsDocumentReferenceInputComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 6);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function NxsDocumentReferenceInputComponent_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.clear()); });
    i0.ɵɵelementStart(2, "mat-icon", 7);
    i0.ɵɵtext(3, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "satori-components.pickers.clear"));
} }
function NxsDocumentReferenceInputComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.choose-from-list"));
} }
function NxsDocumentReferenceInputComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.required"));
} }
function NxsDocumentReferenceInputComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-hint");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "satori-components.pickers.min-chars-many", i0.ɵɵpureFunction1(4, _c0, ctx_r2.minChars)));
} }
function NxsDocumentReferenceInputComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-hint");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.hint());
} }
function NxsDocumentReferenceInputComponent_Case_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.searching"));
} }
function NxsDocumentReferenceInputComponent_Case_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.no-results"));
} }
function NxsDocumentReferenceInputComponent_Case_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.pickers.failed"));
} }
function NxsDocumentReferenceInputComponent_Case_14_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 8);
    i0.ɵɵelement(1, "nxs-doc-type-icon", 9);
    i0.ɵɵelementStart(2, "span", 10)(3, "span", 11);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5, " ");
    i0.ɵɵelementStart(6, "span", 12);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const document_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", document_r4);
    i0.ɵɵattribute("data-uid", document_r4.uid);
    i0.ɵɵadvance();
    i0.ɵɵproperty("type", document_r4.type);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(document_r4.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(document_r4.path);
} }
function NxsDocumentReferenceInputComponent_Case_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsDocumentReferenceInputComponent_Case_14_For_1_Template, 8, 5, "mat-option", 8, _forTrack0);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.finder.state().results);
} }
/** Web UI's document suggestion: three characters, twenty results. */
const WEB_UI_MIN_CHARS = 3;
const WEB_UI_PAGE_SIZE = 20;
/**
 * The query Web UI's `default_document_suggestion` page provider runs, for `term`: a full-text
 * prefix match on documents that are not hidden, not versions and not in the trash — optionally of
 * the given types. Every value is escaped, so a term or a type is text in the query, never NXQL.
 */
export function nxsDocumentSuggestionQuery(term, types = []) {
    let query = `SELECT * FROM Document WHERE ecm:fulltext LIKE '${escapeNxqlLiteral(term)}*'` +
        " AND ecm:mixinType != 'HiddenInNavigation' AND ecm:isVersion = 0 AND ecm:isTrashed = 0";
    const named = types.map((type) => type.trim()).filter(Boolean);
    if (named.length) {
        query += ` AND ecm:primaryType IN (${named.map((type) => `'${escapeNxqlLiteral(type)}'`).join(', ')})`;
    }
    return query;
}
/** The query that finds the one document a stored uid or path names. Escaped, as above. */
function lookupQuery(id, idProperty) {
    const field = idProperty === 'path' ? 'ecm:path' : 'ecm:uuid';
    return `SELECT * FROM Document WHERE ${field} = '${escapeNxqlLiteral(id)}'`;
}
/**
 * A field that finds a document as the user types and returns the uid of the one chosen — for a
 * property that points at another document, as Web UI's `nuxeo-document-suggestion` is: its value
 * is what the property stores, the uid, or the path with `idProperty="path"`.
 *
 * It searches the repository's full text from three characters, twenty results at a time, leaving
 * out hidden documents, versions and the trash, as Web UI does; `documentTypes` narrows it further.
 * Each result shows its type icon, title and path. A uid or path the form already holds is looked
 * up to show its title; one the user may not read, or that no longer exists, is kept and shown as it
 * is. Typing after a choice clears it, and text typed and not chosen is an `nxsChooseFromList` error
 * on the form. `documentChange` reports the whole document chosen, for a host that shows more.
 */
export class NxsDocumentReferenceInputComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Offer only documents of these types, such as `['File', 'Note']`. Every type when empty. */
    documentTypes = input([], ...(ngDevMode ? [{ debugName: "documentTypes" }] : []));
    /** What the value holds, as Web UI's `idProperty`: the document's uid (the default) or its path. */
    idProperty = input('uid', ...(ngDevMode ? [{ debugName: "idProperty" }] : []));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The uid (or path) of the document chosen, or `null`. Two-way; a form control carries it too. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The document the user chose, or `null` when the choice was cleared. */
    documentChange = output();
    minChars = WEB_UI_MIN_CHARS;
    api = inject(NuxeoApiBase);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    input = viewChild.required(MatInput);
    control = new NxsPickerControl();
    lookups = new Subject();
    /** The value the field last set itself, so its own changes are not mistaken for a host's. */
    committed = null;
    /** The document the value names, once known: chosen here, or looked up from a stored uid. */
    document = signal(null, ...(ngDevMode ? [{ debugName: "document" }] : []));
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    finder = nxsSearchAsYouType((term) => this.find(term), () => WEB_UI_MIN_CHARS);
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    unmatched = computed(() => !this.value() && this.text().trim() !== '', ...(ngDevMode ? [{ debugName: "unmatched" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.unmatched() || this.missing() || this.control.formInvalid()),
    };
    displayWith = (document) => typeof document === 'string' ? document : (document?.title ?? '');
    constructor() {
        this.lookups
            .pipe(switchMap((id) => this.api.nxqlSearch(lookupQuery(id, this.idProperty()), 1).pipe(map((list) => ({ id, found: list.entries?.[0] ? toReference(list.entries[0]) : null })), catchError(() => of({ id, found: null })))), takeUntilDestroyed())
            .subscribe(({ id, found }) => {
            if (this.value() !== id || !found)
                return;
            this.document.set(found);
            this.text.set(found.title);
        });
        // A value set from outside is shown by its id at once, then by its title once looked up.
        effect(() => {
            const value = this.value();
            untracked(() => {
                if (value === this.committed)
                    return;
                this.committed = value;
                this.document.set(null);
                this.text.set(value ?? '');
                if (value)
                    this.lookups.next(value);
            });
        });
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
        effect(() => {
            this.unmatched();
            untracked(() => this.control.revalidate());
        });
    }
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck() {
        this.input().updateErrorState();
    }
    writeValue(value) {
        this.value.set(value || null);
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
    missing() {
        return this.control.missing(this.required(), this.value() === null);
    }
    onInput(event) {
        const typed = event.target.value;
        const shown = this.document()?.title ?? this.value();
        this.text.set(typed);
        if (this.value() && typed !== shown)
            this.choose(null);
        this.finder.query(typed);
    }
    choose(document) {
        const id = document ? (this.idProperty() === 'path' ? document.path : document.uid) : null;
        this.committed = id;
        this.value.set(id);
        this.document.set(document);
        if (document) {
            this.text.set(document.title);
            this.finder.reset();
        }
        this.control.changed(id);
        this.documentChange.emit(document);
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
        return this.api
            .nxqlSearch(nxsDocumentSuggestionQuery(term, this.documentTypes()), WEB_UI_PAGE_SIZE)
            .pipe(map((list) => (list.entries ?? []).map(toReference)));
    }
    static ɵfac = function NxsDocumentReferenceInputComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDocumentReferenceInputComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDocumentReferenceInputComponent, selectors: [["nxs-document-reference-input"]], viewQuery: function NxsDocumentReferenceInputComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.input, MatInput, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-document-reference-input"], inputs: { label: [1, "label"], documentTypes: [1, "documentTypes"], idProperty: [1, "idProperty"], hint: [1, "hint"], required: [1, "required"], disabled: [1, "disabled"], value: [1, "value"] }, outputs: { value: "valueChange", documentChange: "documentChange" }, features: [i0.ɵɵProvidersFeature(nxsPickerProviders(() => NxsDocumentReferenceInputComponent))], decls: 15, vars: 11, consts: [["auto", "matAutocomplete"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-picker__field"], ["matInput", "", "type", "text", "autocomplete", "off", 3, "input", "blur", "matAutocomplete", "value", "required", "disabled", "errorStateMatcher"], ["matIconSuffix", "", "mat-icon-button", "", "type", "button", 1, "nxs-picker__clear"], [3, "optionSelected", "displayWith"], ["disabled", "", 1, "nxs-picker__status"], ["matIconSuffix", "", "mat-icon-button", "", "type", "button", 1, "nxs-picker__clear", 3, "click"], ["aria-hidden", "true"], [3, "value"], [1, "nxs-document-reference-input__icon", 3, "type"], [1, "nxs-picker__option"], [1, "nxs-picker__option-label"], [1, "nxs-picker__option-detail"]], template: function NxsDocumentReferenceInputComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "mat-form-field", 1)(1, "mat-label");
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "input", 2);
            i0.ɵɵlistener("input", function NxsDocumentReferenceInputComponent_Template_input_input_3_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onInput($event)); })("blur", function NxsDocumentReferenceInputComponent_Template_input_blur_3_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.blurred()); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, NxsDocumentReferenceInputComponent_Conditional_4_Template, 4, 3, "button", 3);
            i0.ɵɵconditionalCreate(5, NxsDocumentReferenceInputComponent_Conditional_5_Template, 3, 3, "mat-error")(6, NxsDocumentReferenceInputComponent_Conditional_6_Template, 3, 3, "mat-error");
            i0.ɵɵconditionalCreate(7, NxsDocumentReferenceInputComponent_Conditional_7_Template, 3, 6, "mat-hint")(8, NxsDocumentReferenceInputComponent_Conditional_8_Template, 2, 1, "mat-hint");
            i0.ɵɵelementStart(9, "mat-autocomplete", 4, 0);
            i0.ɵɵlistener("optionSelected", function NxsDocumentReferenceInputComponent_Template_mat_autocomplete_optionSelected_9_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.choose($event.option.value)); });
            i0.ɵɵconditionalCreate(11, NxsDocumentReferenceInputComponent_Case_11_Template, 3, 3, "mat-option", 5)(12, NxsDocumentReferenceInputComponent_Case_12_Template, 3, 3, "mat-option", 5)(13, NxsDocumentReferenceInputComponent_Case_13_Template, 3, 3, "mat-option", 5)(14, NxsDocumentReferenceInputComponent_Case_14_Template, 2, 0);
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
        } }, dependencies: [MatAutocompleteModule, i1.MatAutocomplete, i2.MatOption, i1.MatAutocompleteTrigger, MatButtonModule, i3.MatIconButton, MatIconModule, i4.MatIcon, MatInputModule, i5.MatInput, i6.MatFormField, i6.MatLabel, i6.MatHint, i6.MatError, i6.MatSuffix, NxsDocTypeIconComponent,
            TranslatePipe], styles: ["@use '../pickers/picker';\n\n[_nghost-%COMP%] {\n  @include picker.field;\n}\n\n@include picker.options;\n\n.nxs-document-reference-input__icon[_ngcontent-%COMP%] {\n  margin-inline-end: 12px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDocumentReferenceInputComponent, [{
        type: Component,
        args: [{ selector: 'nxs-document-reference-input', standalone: true, imports: [
                    MatAutocompleteModule,
                    MatButtonModule,
                    MatIconModule,
                    MatInputModule,
                    NxsDocTypeIconComponent,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsDocumentReferenceInputComponent), host: { class: 'nxs-document-reference-input' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    type=\"text\"\n    autocomplete=\"off\"\n    [matAutocomplete]=\"auto\"\n    [value]=\"text()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"onInput($event)\"\n    (blur)=\"blurred()\"\n  />\n  @if (value() && !isDisabled()) {\n    <button\n      matIconSuffix\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-picker__clear\"\n      [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n      (click)=\"clear()\"\n    >\n      <mat-icon aria-hidden=\"true\">close</mat-icon>\n    </button>\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (finder.state().status === 'short') {\n    <mat-hint>{{\n      'satori-components.pickers.min-chars-many' | translate: { count: minChars }\n    }}</mat-hint>\n  } @else if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete\n    #auto=\"matAutocomplete\"\n    [displayWith]=\"displayWith\"\n    (optionSelected)=\"choose($event.option.value)\"\n  >\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.no-results' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('found') {\n        @for (document of finder.state().results; track document.uid) {\n          <mat-option [value]=\"document\" [attr.data-uid]=\"document.uid\">\n            <nxs-doc-type-icon class=\"nxs-document-reference-input__icon\" [type]=\"document.type\" />\n            <span class=\"nxs-picker__option\">\n              <span class=\"nxs-picker__option-label\">{{ document.title }}</span\n              >&ngsp;\n              <span class=\"nxs-picker__option-detail\">{{ document.path }}</span>\n            </span>\n          </mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: ["@use '../pickers/picker';\n\n:host {\n  @include picker.field;\n}\n\n@include picker.options;\n\n.nxs-document-reference-input__icon {\n  margin-inline-end: 12px;\n}\n"] }]
    }], () => [], { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], documentTypes: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentTypes", required: false }] }], idProperty: [{ type: i0.Input, args: [{ isSignal: true, alias: "idProperty", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], documentChange: [{ type: i0.Output, args: ["documentChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDocumentReferenceInputComponent, { className: "NxsDocumentReferenceInputComponent", filePath: "libs/shared/satori-components/src/lib/document-reference-input/document-reference-input.component.ts", lineNumber: 104 }); })();
function toReference(document) {
    return {
        uid: document.uid,
        title: document.title?.trim() || document.uid,
        type: document.type,
        path: document.path,
    };
}
//# sourceMappingURL=document-reference-input.component.js.map