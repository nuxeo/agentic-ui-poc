import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppExtensionsService, ExtensionComponentRegistry, ExtensionOutletComponent, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import { forkJoin, map, merge, of, startWith, switchMap } from 'rxjs';
import { DocumentLayoutService } from '../document-layout.service';
import { layoutLabelText } from '../layout-label';
import { layoutSlotEntry } from '../layout-slot';
import { humanize, readDocumentSchemas } from '../resolve-layout';
import { describeField, vocabularyValues } from './field-view';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/tabs";
const _c0 = a0 => ({ $implicit: a0, top: true });
const _c1 = a0 => ({ $implicit: a0 });
const _c2 = a0 => ({ $implicit: a0, top: false });
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.key;
function DocumentLayoutComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 2);
} if (rf & 2) {
    const contributed_r1 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("componentId", contributed_r1.componentId ?? contributed_r1.id)("componentInputs", ctx_r1.entryInputs());
    i0.ɵɵattribute("data-layout-entry", contributed_r1.id);
} }
function DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_1_For_3_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵelementContainer(1, 8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const section_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(4);
    const rows_r4 = i0.ɵɵreference(3);
    i0.ɵɵattribute("data-section-id", section_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", rows_r4)("ngTemplateOutletContext", i0.ɵɵpureFunction1(3, _c0, section_r3.fields));
} }
function DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_1_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-tab", 5);
    i0.ɵɵtemplate(1, DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_1_For_3_ng_template_1_Template, 2, 5, "ng-template", 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const section_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("label", ctx_r1.tabLabel(section_r3));
} }
function DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-tab-group", 4);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_1_For_3_Template, 2, 1, "mat-tab", 5, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const layout_r5 = i0.ɵɵnextContext(2);
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind1(1, 1, "document-layouts.sections"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(layout_r5.sections);
} }
function DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_2_For_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h4", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const section_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(section_r6.heading);
} }
function DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_2_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 7);
    i0.ɵɵconditionalCreate(1, DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_2_For_1_Conditional_1_Template, 2, 1, "h4", 9);
    i0.ɵɵelementContainer(2, 8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const section_r6 = ctx.$implicit;
    i0.ɵɵnextContext(4);
    const rows_r4 = i0.ɵɵreference(3);
    i0.ɵɵattribute("data-section-id", section_r6.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(section_r6.heading ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", rows_r4)("ngTemplateOutletContext", i0.ɵɵpureFunction1(4, _c0, section_r6.fields));
} }
function DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_2_For_1_Template, 3, 6, "section", 7, _forTrack0);
} if (rf & 2) {
    const layout_r5 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(layout_r5.sections);
} }
function DocumentLayoutComponent_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵconditionalCreate(1, DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_1_Template, 4, 3, "mat-tab-group", 4)(2, DocumentLayoutComponent_Conditional_1_Conditional_0_Conditional_2_Template, 2, 0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const layout_r5 = i0.ɵɵnextContext();
    i0.ɵɵattribute("data-layout-type", layout_r5.type)("data-layout-source", layout_r5.source);
    i0.ɵɵadvance();
    i0.ɵɵconditional(layout_r5.display === "tabs" ? 1 : 2);
} }
function DocumentLayoutComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentLayoutComponent_Conditional_1_Conditional_0_Template, 3, 3, "div", 3);
} if (rf & 2) {
    i0.ɵɵconditional(ctx.sections.length > 0 ? 0 : -1);
} }
function DocumentLayoutComponent_ng_template_2_For_2_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 8);
} if (rf & 2) {
    const field_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(2);
    const value_r8 = i0.ɵɵreference(5);
    i0.ɵɵproperty("ngTemplateOutlet", value_r8)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c1, field_r7.value));
} }
function DocumentLayoutComponent_ng_template_2_For_2_Case_5_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 15);
    i0.ɵɵelementContainer(1, 8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const chip_r9 = ctx.$implicit;
    i0.ɵɵnextContext(4);
    const value_r8 = i0.ɵɵreference(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", value_r8)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c1, chip_r9));
} }
function DocumentLayoutComponent_ng_template_2_For_2_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 13);
    i0.ɵɵrepeaterCreate(1, DocumentLayoutComponent_ng_template_2_For_2_Case_5_For_2_Template, 2, 4, "li", 15, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const field_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵrepeater(field_r7.chips);
} }
function DocumentLayoutComponent_ng_template_2_For_2_Case_6_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 8);
} if (rf & 2) {
    const group_r10 = ctx.$implicit;
    i0.ɵɵnextContext(4);
    const rows_r4 = i0.ɵɵreference(3);
    i0.ɵɵproperty("ngTemplateOutlet", rows_r4)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c2, group_r10));
} }
function DocumentLayoutComponent_ng_template_2_For_2_Case_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, DocumentLayoutComponent_ng_template_2_For_2_Case_6_For_1_Template, 1, 4, "ng-container", 8, i0.ɵɵrepeaterTrackByIndex);
} if (rf & 2) {
    const field_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵrepeater(field_r7.groups);
} }
function DocumentLayoutComponent_ng_template_2_For_2_Case_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 14);
    i0.ɵɵtext(1, "\u2014");
    i0.ɵɵelementEnd();
} }
function DocumentLayoutComponent_ng_template_2_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10)(1, "dt", 11);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd", 12);
    i0.ɵɵconditionalCreate(4, DocumentLayoutComponent_ng_template_2_For_2_Case_4_Template, 1, 4, "ng-container", 8)(5, DocumentLayoutComponent_ng_template_2_For_2_Case_5_Template, 3, 0, "ul", 13)(6, DocumentLayoutComponent_ng_template_2_For_2_Case_6_Template, 2, 0)(7, DocumentLayoutComponent_ng_template_2_For_2_Case_7_Template, 2, 0, "span", 14);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_18_0;
    const field_r7 = ctx.$implicit;
    const top_r11 = i0.ɵɵnextContext().top;
    i0.ɵɵattribute("data-field", top_r11 ? field_r7.key : null)("data-subfield", top_r11 ? null : field_r7.key);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(field_r7.label);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_18_0 = field_r7.kind) === "value" ? 4 : tmp_18_0 === "chips" ? 5 : tmp_18_0 === "groups" ? 6 : 7);
} }
function DocumentLayoutComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl");
    i0.ɵɵrepeaterCreate(1, DocumentLayoutComponent_ng_template_2_For_2_Template, 8, 4, "div", 10, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const fields_r12 = ctx.$implicit;
    const top_r11 = ctx.top;
    i0.ɵɵclassMap(top_r11 ? "document-layout__fields" : "document-layout__nested");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(fields_r12);
} }
function DocumentLayoutComponent_ng_template_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const value_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", value_r13.text, " ");
} }
function DocumentLayoutComponent_ng_template_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const value_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, value_r13.flag ? "document-layouts.yes" : "document-layouts.no"), " ");
} }
function DocumentLayoutComponent_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentLayoutComponent_ng_template_4_Conditional_0_Template, 1, 1)(1, DocumentLayoutComponent_ng_template_4_Conditional_1_Template, 2, 3);
} if (rf & 2) {
    const value_r13 = ctx.$implicit;
    i0.ɵɵconditional(value_r13.flag === undefined ? 0 : 1);
} }
function sameTarget(a, b) {
    if (!a || !b)
        return a === b;
    return (a.uid === b.uid &&
        a.type === b.type &&
        a.mode === b.mode &&
        a.schemas.length === b.schemas.length &&
        a.schemas.every((schema, i) => schema.name === b.schemas[i]?.name));
}
function sameValues(a, b) {
    return (a.length === b.length &&
        a.every((value, i) => value.directory === b[i]?.directory && value.id === b[i]?.id));
}
function byDirectory(labels) {
    const vocabularies = new Map();
    for (const { directory, id, label } of labels) {
        if (label === null)
            continue;
        let entries = vocabularies.get(directory);
        if (!entries) {
            entries = new Map();
            vocabularies.set(directory, entries);
        }
        entries.set(id, label);
    }
    return vocabularies;
}
const NO_VOCABULARIES = new Map();
/**
 * Renders a document's per-type layout: the file a configuration package contributed for its
 * type and mode, or the layout generated from the type's own schemas and those the document's
 * dynamic facets add. A `documentMetadata` entry whose rule admits the document renders its
 * component in place of either, and the layout comes back if that component cannot be loaded.
 *
 * Read-only. Each value is shown by its schema type, and a vocabulary-bound value by its entry's
 * label. Hiding a field here hides it from this panel only — the REST API still returns it.
 */
export class DocumentLayoutComponent {
    document = input.required(...(ngDevMode ? [{ debugName: "document" }] : []));
    mode = input('metadata', ...(ngDevMode ? [{ debugName: "mode" }] : []));
    layouts = inject(DocumentLayoutService);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    extensions = inject(AppExtensionsService);
    components = inject(ExtensionComponentRegistry);
    ruleContext = inject(ExtensionRuleContextService);
    /** The `documentMetadata` entry that takes this document's section, or `null` for the layout. */
    entry = computed(() => {
        const document = this.document();
        if (!document?.type)
            return null;
        return layoutSlotEntry(this.extensions, this.components, 'metadata', {
            ...this.ruleContext.context(),
            document,
        });
    }, ...(ngDevMode ? [{ debugName: "entry" }] : []));
    /** `document` last, so a manifest `inputs.document` cannot stand in for the one on screen. */
    entryInputs = computed(() => ({
        ...this.entry()?.inputs,
        document: this.document(),
    }), ...(ngDevMode ? [{ debugName: "entryInputs" }] : []));
    outlet = viewChild(ExtensionOutletComponent, ...(ngDevMode ? [{ debugName: "outlet" }] : []));
    /** The entry's component is on screen. When it fails to load, the layout shows instead. */
    usesEntry = computed(() => this.entry() !== null && !(this.outlet()?.unresolved() ?? false), ...(ngDevMode ? [{ debugName: "usesEntry" }] : []));
    /**
     * Re-resolved per document, not per type: the service caches what it read successfully, and
     * asking again is how a failed schema read recovers on the next document. The schemas are part
     * of it because a dynamic facet gives one document schemas its type does not have.
     */
    target = computed(() => {
        const document = this.document();
        if (!document?.type || this.usesEntry())
            return null;
        return {
            uid: document.uid,
            type: document.type,
            mode: this.mode(),
            schemas: readDocumentSchemas('schemas' in document ? document.schemas : undefined),
        };
    }, ...(ngDevMode ? [{ debugName: "target", equal: sameTarget }] : [{ equal: sameTarget }]));
    resolved = toSignal(toObservable(this.target).pipe(switchMap((target) => target
        ? this.layouts
            .layoutFor(target.type, target.mode, target.schemas)
            .pipe(map((layout) => ({ target, layout })))
        : of(null))), { initialValue: null });
    /**
     * The layout resolved for the document in force. Two documents of one type can now have
     * different layouts, so the previous one's must not show while this one's resolves.
     */
    layout = computed(() => {
        const resolved = this.resolved();
        return resolved?.target === this.target() ? resolved.layout : null;
    }, ...(ngDevMode ? [{ debugName: "layout" }] : []));
    /** The vocabulary entries this document's values name: only those are read. */
    vocabularyValues = computed(() => {
        const layout = this.layout();
        const document = this.document();
        if (!layout || !document || layout.type !== document.type)
            return [];
        return vocabularyValues(layout.sections.flatMap((section) => section.fields.map((field) => ({
            definition: field.definition,
            value: document.properties[field.xpath],
        }))));
    }, ...(ngDevMode ? [{ debugName: "vocabularyValues", equal: sameValues }] : [{ equal: sameValues }]));
    /** Shown as the stored ids until the labels arrive, and as the id wherever one cannot be read. */
    vocabularies = toSignal(toObservable(this.vocabularyValues).pipe(switchMap((values) => values.length === 0
        ? of(NO_VOCABULARIES)
        : forkJoin(values.map((value) => this.layouts
            .vocabularyLabel(value.directory, value.id)
            .pipe(map((label) => ({ ...value, label }))))).pipe(map(byDirectory), startWith(NO_VOCABULARIES)))), { initialValue: NO_VOCABULARIES });
    /** Bumped when the language or a catalogue changes, so labels resolved with `instant` follow. */
    translations = signal(0, ...(ngDevMode ? [{ debugName: "translations" }] : []));
    constructor() {
        merge(this.translate.onLangChange, this.translate.onTranslationChange)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.translations.update((n) => n + 1));
    }
    view = computed(() => {
        this.translations();
        const document = this.document();
        const layout = this.layout();
        const vocabularies = this.vocabularies();
        // A layout still resolving for the previous document's type must not show this one's values.
        if (!document || !layout || layout.type !== document.type)
            return null;
        const context = {
            locale: this.locale,
            vocabulary: (directory, id) => vocabularies.get(directory)?.get(id) ?? id,
        };
        const sections = layout.sections.map((section) => ({
            id: section.id,
            heading: this.text(section.label),
            fields: section.fields.map((field) => describeField(field.xpath, this.text(field.label) ?? field.xpath, field.definition, document.properties[field.xpath], context)),
        }));
        return { type: layout.type, source: layout.source, display: layout.display, sections };
    }, ...(ngDevMode ? [{ debugName: "view" }] : []));
    /** A tab needs a name even where a section heading may be left out. */
    tabLabel(section) {
        return section.heading ?? humanize(section.id);
    }
    text(label) {
        return layoutLabelText(this.translate, label);
    }
    static ɵfac = function DocumentLayoutComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentLayoutComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DocumentLayoutComponent, selectors: [["lib-document-layout"]], viewQuery: function DocumentLayoutComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.outlet, ExtensionOutletComponent, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, inputs: { document: [1, "document"], mode: [1, "mode"] }, decls: 6, vars: 2, consts: [["rows", ""], ["value", ""], [1, "document-layout__contributed", 3, "componentId", "componentInputs"], [1, "document-layout"], ["mat-stretch-tabs", "false", "animationDuration", "0ms", 1, "document-layout__tabs", 3, "aria-label"], [3, "label"], ["matTabContent", ""], [1, "document-layout__section"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "document-layout__heading"], [1, "document-layout__field"], [1, "document-layout__label"], [1, "document-layout__value"], [1, "document-layout__chips"], [1, "document-layout__empty"], [1, "document-layout__chip"]], template: function DocumentLayoutComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, DocumentLayoutComponent_Conditional_0_Template, 1, 3, "lib-extension-outlet", 2);
            i0.ɵɵconditionalCreate(1, DocumentLayoutComponent_Conditional_1_Template, 1, 1);
            i0.ɵɵtemplate(2, DocumentLayoutComponent_ng_template_2_Template, 3, 2, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor)(4, DocumentLayoutComponent_ng_template_4_Template, 2, 1, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            let tmp_2_0;
            let tmp_3_0;
            i0.ɵɵconditional((tmp_2_0 = ctx.entry()) ? 0 : -1, tmp_2_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.view()) ? 1 : -1, tmp_3_0);
        } }, dependencies: [ExtensionOutletComponent, MatTabsModule, i1.MatTabContent, i1.MatTab, i1.MatTabGroup, NgTemplateOutlet, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.document-layout__section[_ngcontent-%COMP%]    + .document-layout__section[_ngcontent-%COMP%] {\n  margin-top: 16px;\n}\n\n.document-layout__heading[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  margin: 0 0 8px;\n}\n\n.document-layout__fields[_ngcontent-%COMP%], \n.document-layout__nested[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.document-layout__field[_ngcontent-%COMP%] {\n  margin-bottom: 14px;\n}\n\n.document-layout__label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 11px;\n  font-weight: 500;\n  color: var(--document-layout-label-color, var(--mat-sys-on-surface-variant));\n  margin-bottom: 2px;\n}\n\n.document-layout__value[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.4;\n  color: var(--mat-sys-on-surface);\n  white-space: pre-line;\n  overflow-wrap: anywhere;\n}\n\n.document-layout__nested[_ngcontent-%COMP%] {\n  padding-left: 10px;\n  border-left: 2px solid var(--mat-sys-outline-variant);\n\n  & + & {\n    margin-top: 8px;\n  }\n\n  .document-layout__field {\n    margin-bottom: 6px;\n  }\n}\n\n.document-layout__chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 4px 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.document-layout__chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 10px;\n  border-radius: 16px;\n  background: var(--mat-sys-surface-container-high);\n  color: var(--mat-sys-on-surface);\n  line-height: 20px;\n}\n\n.document-layout__empty[_ngcontent-%COMP%] {\n  color: var(--document-layout-label-color, var(--mat-sys-on-surface-variant));\n}\n\n.document-layout__tabs[_ngcontent-%COMP%]   .document-layout__section[_ngcontent-%COMP%] {\n  padding-top: 12px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentLayoutComponent, [{
        type: Component,
        args: [{ selector: 'lib-document-layout', standalone: true, imports: [ExtensionOutletComponent, MatTabsModule, NgTemplateOutlet, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (entry(); as contributed) {\n  <lib-extension-outlet\n    class=\"document-layout__contributed\"\n    [attr.data-layout-entry]=\"contributed.id\"\n    [componentId]=\"contributed.componentId ?? contributed.id\"\n    [componentInputs]=\"entryInputs()\"\n  />\n}\n@if (view(); as layout) {\n  @if (layout.sections.length > 0) {\n    <div\n      class=\"document-layout\"\n      [attr.data-layout-type]=\"layout.type\"\n      [attr.data-layout-source]=\"layout.source\"\n    >\n      @if (layout.display === 'tabs') {\n        <mat-tab-group\n          class=\"document-layout__tabs\"\n          mat-stretch-tabs=\"false\"\n          animationDuration=\"0ms\"\n          [aria-label]=\"'document-layouts.sections' | translate\"\n        >\n          @for (section of layout.sections; track section.id) {\n            <mat-tab [label]=\"tabLabel(section)\">\n              <ng-template matTabContent>\n                <div class=\"document-layout__section\" [attr.data-section-id]=\"section.id\">\n                  <ng-container\n                    [ngTemplateOutlet]=\"rows\"\n                    [ngTemplateOutletContext]=\"{ $implicit: section.fields, top: true }\"\n                  />\n                </div>\n              </ng-template>\n            </mat-tab>\n          }\n        </mat-tab-group>\n      } @else {\n        @for (section of layout.sections; track section.id) {\n          <section class=\"document-layout__section\" [attr.data-section-id]=\"section.id\">\n            @if (section.heading) {\n              <h4 class=\"document-layout__heading\">{{ section.heading }}</h4>\n            }\n            <ng-container\n              [ngTemplateOutlet]=\"rows\"\n              [ngTemplateOutletContext]=\"{ $implicit: section.fields, top: true }\"\n            />\n          </section>\n        }\n      }\n    </div>\n  }\n}\n\n<ng-template #rows let-fields let-top=\"top\">\n  <dl [class]=\"top ? 'document-layout__fields' : 'document-layout__nested'\">\n    @for (field of fields; track field.key) {\n      <div\n        class=\"document-layout__field\"\n        [attr.data-field]=\"top ? field.key : null\"\n        [attr.data-subfield]=\"top ? null : field.key\"\n      >\n        <dt class=\"document-layout__label\">{{ field.label }}</dt>\n        <dd class=\"document-layout__value\">\n          @switch (field.kind) {\n            @case ('value') {\n              <ng-container\n                [ngTemplateOutlet]=\"value\"\n                [ngTemplateOutletContext]=\"{ $implicit: field.value }\"\n              />\n            }\n            @case ('chips') {\n              <ul class=\"document-layout__chips\">\n                @for (chip of field.chips; track $index) {\n                  <li class=\"document-layout__chip\">\n                    <ng-container\n                      [ngTemplateOutlet]=\"value\"\n                      [ngTemplateOutletContext]=\"{ $implicit: chip }\"\n                    />\n                  </li>\n                }\n              </ul>\n            }\n            @case ('groups') {\n              @for (group of field.groups; track $index) {\n                <ng-container\n                  [ngTemplateOutlet]=\"rows\"\n                  [ngTemplateOutletContext]=\"{ $implicit: group, top: false }\"\n                />\n              }\n            }\n            @default {\n              <span class=\"document-layout__empty\">\u2014</span>\n            }\n          }\n        </dd>\n      </div>\n    }\n  </dl>\n</ng-template>\n\n<ng-template #value let-value>\n  @if (value.flag === undefined) {\n    {{ value.text }}\n  } @else {\n    {{ (value.flag ? 'document-layouts.yes' : 'document-layouts.no') | translate }}\n  }\n</ng-template>\n", styles: [":host {\n  display: block;\n}\n\n.document-layout__section + .document-layout__section {\n  margin-top: 16px;\n}\n\n.document-layout__heading {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  margin: 0 0 8px;\n}\n\n.document-layout__fields,\n.document-layout__nested {\n  margin: 0;\n}\n\n.document-layout__field {\n  margin-bottom: 14px;\n}\n\n.document-layout__label {\n  display: block;\n  font-size: 11px;\n  font-weight: 500;\n  color: var(--document-layout-label-color, var(--mat-sys-on-surface-variant));\n  margin-bottom: 2px;\n}\n\n.document-layout__value {\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.4;\n  color: var(--mat-sys-on-surface);\n  white-space: pre-line;\n  overflow-wrap: anywhere;\n}\n\n.document-layout__nested {\n  padding-left: 10px;\n  border-left: 2px solid var(--mat-sys-outline-variant);\n\n  & + & {\n    margin-top: 8px;\n  }\n\n  .document-layout__field {\n    margin-bottom: 6px;\n  }\n}\n\n.document-layout__chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 4px 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.document-layout__chip {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 10px;\n  border-radius: 16px;\n  background: var(--mat-sys-surface-container-high);\n  color: var(--mat-sys-on-surface);\n  line-height: 20px;\n}\n\n.document-layout__empty {\n  color: var(--document-layout-label-color, var(--mat-sys-on-surface-variant));\n}\n\n.document-layout__tabs .document-layout__section {\n  padding-top: 12px;\n}\n"] }]
    }], () => [], { document: [{ type: i0.Input, args: [{ isSignal: true, alias: "document", required: true }] }], mode: [{ type: i0.Input, args: [{ isSignal: true, alias: "mode", required: false }] }], outlet: [{ type: i0.ViewChild, args: [i0.forwardRef(() => ExtensionOutletComponent), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DocumentLayoutComponent, { className: "DocumentLayoutComponent", filePath: "libs/shared/document-layouts/src/lib/document-layout/document-layout.ts", lineNumber: 108 }); })();
