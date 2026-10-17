import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked, viewChild, } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsMetadataEditorComponent, NxsSpinnerComponent, } from '@nuxeo/satori-platform/components';
import { AppExtensionsService, ExtensionComponentRegistry, ExtensionOutletComponent, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import { distinctUntilChanged, map, merge, of, switchMap } from 'rxjs';
import { DocumentLayoutService } from '../document-layout.service';
import { layoutLabelText, toEditorSections } from '../layout-label';
import { documentToCreate, layoutSlotEntry } from '../layout-slot';
import { readDocumentSchemas } from '../resolve-layout';
import * as i0 from "@angular/core";
function DocumentLayoutFormComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 0);
} if (rf & 2) {
    const contributed_r1 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("componentId", contributed_r1.componentId ?? contributed_r1.id)("componentInputs", ctx_r1.entryInputs());
    i0.ɵɵattribute("data-layout-entry", contributed_r1.id);
} }
function DocumentLayoutFormComponent_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-metadata-editor", 3);
    i0.ɵɵlistener("validChange", function DocumentLayoutFormComponent_Conditional_1_Conditional_0_Template_nxs_metadata_editor_validChange_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editorValidChange($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("sections", ctx_r1.sections())("display", ctx_r1.display())("values", ctx_r1.values())("disabled", ctx_r1.disabled())("headingLevel", ctx_r1.headingLevel());
    i0.ɵɵattribute("data-layout-type", ctx_r1.formType())("data-layout-source", ctx_r1.layoutSource());
} }
function DocumentLayoutFormComponent_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵelement(1, "nxs-spinner", 4);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("diameter", 28)("label", i0.ɵɵpipeBind1(2, 2, "document-layouts.loading-form"));
} }
function DocumentLayoutFormComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentLayoutFormComponent_Conditional_1_Conditional_0_Template, 1, 7, "nxs-metadata-editor", 1)(1, DocumentLayoutFormComponent_Conditional_1_Conditional_1_Template, 3, 4, "div", 2);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.ready() ? 0 : 1);
} }
const sameTarget = (a, b) => a === b ||
    (!!a &&
        !!b &&
        a.type === b.type &&
        a.mode === b.mode &&
        a.schemas.length === b.schemas.length &&
        a.schemas.every((schema, i) => schema.name === b.schemas[i]?.name));
const NO_VALUES = {};
const NOTHING_REPORTED = { properties: {}, valid: false };
/**
 * The edit or create form for a document type: the type's layout in that mode, in the metadata
 * editor, or the component a `documentEdit` / `documentCreate` entry puts in its place.
 *
 * The layout is the contributed `<Type>/<mode>.layout.json`, else one generated from the type's
 * schemas — and, for an edit, from the schemas the document's dynamic facets add. A layout that
 * cannot be resolved leaves the Dublin Core fields, so the form degrades rather than breaks.
 *
 * The host owns Save: it calls `validate()`, then sends `changedProperties()` — what the user
 * changed, for an edit; everything, for a create — and hands Nuxeo's validation messages back to
 * `showServerErrors()`.
 */
export class DocumentLayoutFormComponent {
    mode = input.required(...(ngDevMode ? [{ debugName: "mode" }] : []));
    /** The document edited. Its type and facets choose the layout, its properties fill the form. */
    document = input(null, ...(ngDevMode ? [{ debugName: "document" }] : []));
    /** The type created. Ignored for an edit, which reads the document's. */
    type = input(null, ...(ngDevMode ? [{ debugName: "type" }] : []));
    /** The folder a new document is created in. */
    parentPath = input(null, ...(ngDevMode ? [{ debugName: "parentPath" }] : []));
    /** While saving: the form is read-only. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : []));
    /** The level of the section headings, one below the dialog or page title. */
    headingLevel = input(3, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** The values may be saved, or not. Emitted when that changes. */
    validChange = output();
    layouts = inject(DocumentLayoutService);
    extensions = inject(AppExtensionsService);
    components = inject(ExtensionComponentRegistry);
    ruleContext = inject(ExtensionRuleContextService);
    translate = inject(TranslateService);
    editor = viewChild(NxsMetadataEditorComponent, ...(ngDevMode ? [{ debugName: "editor" }] : []));
    outlet = viewChild(ExtensionOutletComponent, ...(ngDevMode ? [{ debugName: "outlet" }] : []));
    /** The type the form is for: the document's for an edit, the one asked for for a create. */
    formType = computed(() => this.mode() === 'edit' ? (this.document()?.type ?? null) : this.type(), ...(ngDevMode ? [{ debugName: "formType" }] : []));
    /**
     * The contributed form, if any. A create's rules read the type being created, in the folder it
     * is created in, so `app.rules.isType` answers for the new document rather than the folder.
     */
    entry = computed(() => {
        const mode = this.mode();
        const type = this.formType();
        if (!type)
            return null;
        const document = mode === 'edit' ? this.document() : documentToCreate(type, this.parentPath());
        return layoutSlotEntry(this.extensions, this.components, mode, {
            ...this.ruleContext.context(),
            document,
        });
    }, ...(ngDevMode ? [{ debugName: "entry" }] : []));
    /**
     * The contributed form is on screen. Not when its component failed to load: the layout takes
     * its place, as the packaged view does for `documentView`, rather than leaving a form nobody
     * can save. The outlet stays, so a later render can still retry the load.
     */
    usesEntry = computed(() => this.entry() !== null && !(this.outlet()?.unresolved() ?? false), ...(ngDevMode ? [{ debugName: "usesEntry" }] : []));
    /** The edited document by identity, so a reload of the same document is not a new target. */
    documentUid = computed(() => this.document()?.uid ?? null, ...(ngDevMode ? [{ debugName: "documentUid" }] : []));
    /** What the contributed form last reported. Not saveable until it has said so. */
    reported = signal(NOTHING_REPORTED, ...(ngDevMode ? [{ debugName: "reported" }] : []));
    showErrors = signal(false, ...(ngDevMode ? [{ debugName: "showErrors" }] : []));
    /** The host's values last, so `inputs` cannot change which document or type the form is for. */
    entryInputs = computed(() => {
        const own = this.mode() === 'edit'
            ? { document: this.document() }
            : { type: this.formType(), parentPath: this.parentPath() };
        return {
            ...this.entry()?.inputs,
            ...own,
            showErrors: this.showErrors(),
            onChange: this.onChange,
        };
    }, ...(ngDevMode ? [{ debugName: "entryInputs" }] : []));
    target = computed(() => {
        const type = this.formType();
        if (!type || this.usesEntry())
            return null;
        const mode = this.mode();
        const document = this.document();
        const schemas = mode === 'edit' && document && 'schemas' in document
            ? readDocumentSchemas(document.schemas)
            : [];
        return { type, mode, schemas };
    }, ...(ngDevMode ? [{ debugName: "target", equal: sameTarget }] : [{ equal: sameTarget }]));
    resolved = toSignal(toObservable(this.target).pipe(distinctUntilChanged(), switchMap((target) => target
        ? this.layouts.layoutFor(target.type, target.mode, target.schemas).pipe(map((layout) => ({
            target,
            layout,
        })))
        : of(null))), { initialValue: null });
    /** `undefined` while resolving; `null` when the type could not be read. */
    layout = computed(() => {
        const resolved = this.resolved();
        return resolved && resolved.target === this.target() ? resolved.layout : undefined;
    }, ...(ngDevMode ? [{ debugName: "layout" }] : []));
    /** Bumped when the language or a catalogue changes, so labels resolved with `instant` follow. */
    translations = signal(0, ...(ngDevMode ? [{ debugName: "translations" }] : []));
    sections = computed(() => {
        this.translations();
        const layout = this.layout();
        return layout
            ? toEditorSections(layout, (label) => layoutLabelText(this.translate, label))
            : [];
    }, ...(ngDevMode ? [{ debugName: "sections" }] : []));
    display = computed(() => this.layout()?.display ?? 'sections', ...(ngDevMode ? [{ debugName: "display" }] : []));
    /** `contributed` or `generated`; `none` when the type could not be read and only Dublin Core shows. */
    layoutSource = computed(() => this.layout()?.source ?? 'none', ...(ngDevMode ? [{ debugName: "layoutSource" }] : []));
    values = computed(() => this.mode() === 'edit' ? (this.document()?.properties ?? NO_VALUES) : NO_VALUES, ...(ngDevMode ? [{ debugName: "values" }] : []));
    /** The form is on screen: a contributed one, or the layout resolved — even to nothing. */
    ready = computed(() => this.usesEntry() || this.layout() !== undefined, ...(ngDevMode ? [{ debugName: "ready" }] : []));
    constructor() {
        merge(this.translate.onLangChange, this.translate.onTranslationChange)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.translations.update((n) => n + 1));
        // Another document or type can resolve to the same entry object, so what the last one
        // reported is forgotten whenever the form's target changes, not only its entry.
        effect(() => {
            this.entry();
            this.mode();
            this.formType();
            this.parentPath();
            this.documentUid();
            untracked(() => {
                const wasValid = this.reported().valid;
                this.reported.set(NOTHING_REPORTED);
                this.showErrors.set(false);
                if (wasValid)
                    this.validChange.emit(false);
            });
        });
    }
    /** Shows every error and answers whether the values may be saved. */
    validate() {
        this.showErrors.set(true);
        if (this.usesEntry())
            return this.reported().valid;
        return this.editor()?.validate() ?? false;
    }
    /** What to send: the changed properties for an edit, every property for a create. */
    changedProperties() {
        if (this.usesEntry())
            return { ...this.reported().properties };
        const editor = this.editor();
        if (!editor)
            return {};
        return this.mode() === 'edit' ? editor.dirtyProperties() : editor.properties();
    }
    /**
     * Puts Nuxeo's messages on the fields they name. Answers those it could not place — all of
     * them for a contributed form, which shows its own — for the host to report another way.
     */
    showServerErrors(errors) {
        const editor = this.usesEntry() ? undefined : this.editor();
        return editor ? editor.showServerErrors(errors) : Object.values(errors);
    }
    editorValidChange(valid) {
        this.validChange.emit(valid);
    }
    onChange = (change) => {
        const previous = this.reported().valid;
        this.reported.set({ properties: { ...change.properties }, valid: change.valid === true });
        if (previous !== this.reported().valid)
            this.validChange.emit(this.reported().valid);
    };
    static ɵfac = function DocumentLayoutFormComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentLayoutFormComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DocumentLayoutFormComponent, selectors: [["lib-document-layout-form"]], viewQuery: function DocumentLayoutFormComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.editor, NxsMetadataEditorComponent, 5);
            i0.ɵɵviewQuerySignal(ctx.outlet, ExtensionOutletComponent, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, inputs: { mode: [1, "mode"], document: [1, "document"], type: [1, "type"], parentPath: [1, "parentPath"], disabled: [1, "disabled"], headingLevel: [1, "headingLevel"] }, outputs: { validChange: "validChange" }, decls: 2, vars: 2, consts: [[1, "document-layout-form__contributed", 3, "componentId", "componentInputs"], [1, "document-layout-form__editor", 3, "sections", "display", "values", "disabled", "headingLevel"], [1, "document-layout-form__loading"], [1, "document-layout-form__editor", 3, "validChange", "sections", "display", "values", "disabled", "headingLevel"], [3, "diameter", "label"]], template: function DocumentLayoutFormComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, DocumentLayoutFormComponent_Conditional_0_Template, 1, 3, "lib-extension-outlet", 0);
            i0.ɵɵconditionalCreate(1, DocumentLayoutFormComponent_Conditional_1_Template, 2, 1);
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵconditional((tmp_0_0 = ctx.entry()) ? 0 : -1, tmp_0_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.usesEntry() ? 1 : -1);
        } }, dependencies: [ExtensionOutletComponent,
            NxsMetadataEditorComponent,
            NxsSpinnerComponent,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.document-layout-form__loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 32px 0;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentLayoutFormComponent, [{
        type: Component,
        args: [{ selector: 'lib-document-layout-form', standalone: true, imports: [
                    ExtensionOutletComponent,
                    NxsMetadataEditorComponent,
                    NxsSpinnerComponent,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (entry(); as contributed) {\n  <lib-extension-outlet\n    class=\"document-layout-form__contributed\"\n    [attr.data-layout-entry]=\"contributed.id\"\n    [componentId]=\"contributed.componentId ?? contributed.id\"\n    [componentInputs]=\"entryInputs()\"\n  />\n}\n@if (!usesEntry()) {\n  @if (ready()) {\n    <nxs-metadata-editor\n      class=\"document-layout-form__editor\"\n      [attr.data-layout-type]=\"formType()\"\n      [attr.data-layout-source]=\"layoutSource()\"\n      [sections]=\"sections()\"\n      [display]=\"display()\"\n      [values]=\"values()\"\n      [disabled]=\"disabled()\"\n      [headingLevel]=\"headingLevel()\"\n      (validChange)=\"editorValidChange($event)\"\n    />\n  } @else {\n    <div class=\"document-layout-form__loading\">\n      <nxs-spinner [diameter]=\"28\" [label]=\"'document-layouts.loading-form' | translate\" />\n    </div>\n  }\n}\n", styles: [":host {\n  display: block;\n}\n\n.document-layout-form__loading {\n  display: flex;\n  justify-content: center;\n  padding: 32px 0;\n}\n"] }]
    }], () => [], { mode: [{ type: i0.Input, args: [{ isSignal: true, alias: "mode", required: true }] }], document: [{ type: i0.Input, args: [{ isSignal: true, alias: "document", required: false }] }], type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: false }] }], parentPath: [{ type: i0.Input, args: [{ isSignal: true, alias: "parentPath", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], validChange: [{ type: i0.Output, args: ["validChange"] }], editor: [{ type: i0.ViewChild, args: [i0.forwardRef(() => NxsMetadataEditorComponent), { isSignal: true }] }], outlet: [{ type: i0.ViewChild, args: [i0.forwardRef(() => ExtensionOutletComponent), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DocumentLayoutFormComponent, { className: "DocumentLayoutFormComponent", filePath: "libs/shared/document-layouts/src/lib/document-layout-form/document-layout-form.ts", lineNumber: 84 }); })();
