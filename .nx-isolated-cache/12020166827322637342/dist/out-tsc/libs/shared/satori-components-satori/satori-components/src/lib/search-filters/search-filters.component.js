import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, model, output, signal, untracked, } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { SearchService, } from '@nuxeo/satori-platform/nuxeo-client';
import { NXS_EMPTY_SEARCH_FILTERS, NXS_MODIFIED_RANGES, NXS_SIZE_RANGES, nxsHasSearchFilters, nxsRangeOptions, nxsTermOptions, } from './search-filters.model';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/autocomplete";
import * as i2 from "@angular/material/select";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/checkbox";
import * as i5 from "@angular/material/chips";
import * as i6 from "@angular/material/icon";
const _c0 = a0 => ({ field: "authors", values: a0, titleKey: "satori-components.search-filters.chosen-authors" });
const _c1 = a0 => ({ field: "collections", values: a0, titleKey: "satori-components.search-filters.chosen-collections" });
const _c2 = a0 => ({ field: "tags", values: a0, titleKey: "satori-components.search-filters.chosen-tags" });
const _c3 = a0 => ({ $implicit: a0 });
const _c4 = a0 => ({ term: a0 });
const _c5 = a0 => ({ value: a0 });
const _forTrack0 = ($index, $item) => $item.field;
const _forTrack1 = ($index, $item) => $item.value;
const _forTrack2 = ($index, $item) => $item.id;
function NxsSearchFiltersComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 20);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function NxsSearchFiltersComponent_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.clearFulltext()); });
    i0.ɵɵelementStart(2, "mat-icon", 21);
    i0.ɵɵtext(3, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "satori-components.search-filters.clear-fulltext"));
} }
function NxsSearchFiltersComponent_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 11);
} if (rf & 2) {
    const group_r4 = ctx.$implicit;
    i0.ɵɵnextContext();
    const checkboxGroup_r5 = i0.ɵɵreference(58);
    i0.ɵɵproperty("ngTemplateOutlet", checkboxGroup_r5)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c3, group_r4));
} }
function NxsSearchFiltersComponent_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", option_r6.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", option_r6.value, " (", option_r6.count, ")");
} }
function NxsSearchFiltersComponent_ForEmpty_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.search-filters.no-results"));
} }
function NxsSearchFiltersComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.search-filters.loading-collections"));
} }
function NxsSearchFiltersComponent_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.search-filters.collections-failed"));
} }
function NxsSearchFiltersComponent_Conditional_33_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r7 = ctx.$implicit;
    i0.ɵɵproperty("value", option_r7.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", option_r7.title, " (", option_r7.itemCount, ")");
} }
function NxsSearchFiltersComponent_Conditional_33_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.search-filters.no-results"));
} }
function NxsSearchFiltersComponent_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsSearchFiltersComponent_Conditional_33_For_1_Template, 2, 3, "mat-option", 14, _forTrack2, false, NxsSearchFiltersComponent_Conditional_33_ForEmpty_2_Template, 3, 3, "mat-option", 15);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.collectionOptions());
} }
function NxsSearchFiltersComponent_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.search-filters.tags-hint"));
} }
function NxsSearchFiltersComponent_Conditional_44_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const label_r8 = ctx.$implicit;
    i0.ɵɵproperty("value", label_r8);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(label_r8);
} }
function NxsSearchFiltersComponent_Conditional_44_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "satori-components.search-filters.no-results-for", i0.ɵɵpureFunction1(4, _c4, ctx_r2.tagText().trim())));
} }
function NxsSearchFiltersComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsSearchFiltersComponent_Conditional_44_For_1_Template, 2, 2, "mat-option", 14, i0.ɵɵrepeaterTrackByIdentity, false, NxsSearchFiltersComponent_Conditional_44_ForEmpty_2_Template, 3, 6, "mat-option", 15);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.tagOptions());
} }
function NxsSearchFiltersComponent_For_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 11);
} if (rf & 2) {
    const group_r9 = ctx.$implicit;
    i0.ɵɵnextContext();
    const checkboxGroup_r5 = i0.ɵɵreference(58);
    i0.ɵɵproperty("ngTemplateOutlet", checkboxGroup_r5)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c3, group_r9));
} }
function NxsSearchFiltersComponent_ng_template_55_Conditional_0_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip", 23);
    i0.ɵɵlistener("removed", function NxsSearchFiltersComponent_ng_template_55_Conditional_0_For_3_Template_mat_chip_removed_0_listener() { const value_r11 = i0.ɵɵrestoreView(_r10).$implicit; const field_r12 = i0.ɵɵnextContext(2).field; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.removeChoice(field_r12, value_r11)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 24);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "mat-icon", 21);
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const value_r11 = ctx.$implicit;
    const field_r12 = i0.ɵɵnextContext(2).field;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", field_r12 === "collections" ? ctx_r2.collectionTitle(value_r11) : value_r11, " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 2, "satori-components.search-filters.remove", i0.ɵɵpureFunction1(5, _c5, field_r12 === "collections" ? ctx_r2.collectionTitle(value_r11) : value_r11)));
} }
function NxsSearchFiltersComponent_ng_template_55_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-chip-set", 22);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, NxsSearchFiltersComponent_ng_template_55_Conditional_0_For_3_Template, 6, 7, "mat-chip", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r12 = i0.ɵɵnextContext();
    const values_r14 = ctx_r12.values;
    const titleKey_r15 = ctx_r12.titleKey;
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, titleKey_r15));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(values_r14);
} }
function NxsSearchFiltersComponent_ng_template_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsSearchFiltersComponent_ng_template_55_Conditional_0_Template, 4, 3, "mat-chip-set", 22);
} if (rf & 2) {
    const values_r14 = ctx.values;
    i0.ɵɵconditional(values_r14.length > 0 ? 0 : -1);
} }
function NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, ctx), " ");
} }
function NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const option_r19 = i0.ɵɵnextContext().$implicit;
    const group_r17 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.optionText(group_r17, option_r19.value), " ");
} }
function NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r19 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("(", option_r19.count, ")");
} }
function NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 29);
    i0.ɵɵlistener("change", function NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Template_mat_checkbox_change_0_listener() { const option_r19 = i0.ɵɵrestoreView(_r18).$implicit; const group_r17 = i0.ɵɵnextContext(2).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleOption(group_r17.field, option_r19.value)); });
    i0.ɵɵconditionalCreate(1, NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Conditional_1_Template, 2, 3)(2, NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Conditional_2_Template, 1, 1);
    i0.ɵɵconditionalCreate(3, NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Conditional_3_Template, 2, 1, "span", 30);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_19_0;
    const option_r19 = ctx.$implicit;
    const group_r17 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("checked", ctx_r2.isChecked(group_r17.field, option_r19.value));
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_19_0 = ctx_r2.optionLabelKey(group_r17, option_r19.value)) ? 1 : 2, tmp_19_0);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(option_r19.count !== null ? 3 : -1);
} }
function NxsSearchFiltersComponent_ng_template_57_Conditional_7_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.search-filters.no-available-results"), " ");
} }
function NxsSearchFiltersComponent_ng_template_57_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26);
    i0.ɵɵrepeaterCreate(1, NxsSearchFiltersComponent_ng_template_57_Conditional_7_For_2_Template, 4, 3, "mat-checkbox", 27, _forTrack1, false, NxsSearchFiltersComponent_ng_template_57_Conditional_7_ForEmpty_3_Template, 3, 3, "p", 28);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r17 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", ctx_r2.ids.group(group_r17.field));
    i0.ɵɵattribute("aria-labelledby", ctx_r2.ids.group(group_r17.field) + "-toggle");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r17.options);
} }
function NxsSearchFiltersComponent_ng_template_57_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "button", 25);
    i0.ɵɵlistener("click", function NxsSearchFiltersComponent_ng_template_57_Template_button_click_1_listener() { const group_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleGroup(group_r17.field)); });
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "mat-icon", 21);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, NxsSearchFiltersComponent_ng_template_57_Conditional_7_Template, 4, 3, "div", 26);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r17 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r2.ids.group(group_r17.field) + "-toggle");
    i0.ɵɵattribute("aria-expanded", ctx_r2.isExpanded(group_r17.field))("aria-controls", ctx_r2.ids.group(group_r17.field));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 6, group_r17.titleKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.isExpanded(group_r17.field) ? "expand_less" : "expand_more");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isExpanded(group_r17.field) ? 7 : -1);
} }
const MODIFIED_LABEL_KEYS = {
    last24h: 'satori-components.search-filters.modified.last24h',
    lastWeek: 'satori-components.search-filters.modified.last-week',
    lastMonth: 'satori-components.search-filters.modified.last-month',
    lastYear: 'satori-components.search-filters.modified.last-year',
    priorToLastYear: 'satori-components.search-filters.modified.prior-to-last-year',
};
const SIZE_LABEL_KEYS = {
    tiny: 'satori-components.search-filters.size.tiny',
    small: 'satori-components.search-filters.size.small',
    medium: 'satori-components.search-filters.size.medium',
    big: 'satori-components.search-filters.size.big',
    huge: 'satori-components.search-filters.size.huge',
};
let nextId = 0;
/**
 * The search filters — Web UI's default search form: full text, modification date, authors,
 * collections, tags, nature, subjects, coverage and size, with Reset and Save as.
 *
 * It edits `filters` and nothing else: the host turns them into a query and passes the server's
 * `aggregations` for that query back, which give each choice its count, as Web UI's checkbox
 * aggregations do. Full text applies on Enter; a checkbox, or an author, collection or tag added or
 * removed, applies at once. Authors, collections and tags take several values, as in Web UI. It
 * looks up the user's collections and the tag suggestions itself.
 */
export class NxsSearchFiltersComponent {
    /** The filters shown. Two-way: every change the user makes is written back. */
    filters = model(NXS_EMPTY_SEARCH_FILTERS, ...(ngDevMode ? [{ debugName: "filters" }] : []));
    /** The server's aggregates for the query the filters produce: each choice's count. */
    aggregations = input({}, ...(ngDevMode ? [{ debugName: "aggregations" }] : []));
    /**
     * The text shown for a choice, by field and bucket key: the vocabulary label of a nature, subject
     * or coverage id. A choice with no label shows its key. `filters` always keeps the key, so a
     * label never reaches a query or a saved search.
     */
    optionLabels = input({}, ...(ngDevMode ? [{ debugName: "optionLabels" }] : []));
    /** Reset was pressed: the filters are now empty. A host clears what it keeps beside them. */
    filtersReset = output();
    /** Save as was pressed: the host asks for a name and saves the current filters. */
    saveAs = output();
    searchService = inject(SearchService);
    destroyRef = inject(DestroyRef);
    ids = (() => {
        const base = `nxs-search-filters-${nextId++}`;
        return {
            fulltext: `${base}-fulltext`,
            authors: `${base}-authors`,
            collections: `${base}-collections`,
            tags: `${base}-tags`,
            group: (field) => `${base}-${field}`,
        };
    })();
    hasFilters = computed(() => nxsHasSearchFilters(this.filters()), ...(ngDevMode ? [{ debugName: "hasFilters" }] : []));
    /** What the full-text box holds; it reaches `filters` on Enter. */
    fulltextDraft = signal('', ...(ngDevMode ? [{ debugName: "fulltextDraft" }] : []));
    authorText = signal('', ...(ngDevMode ? [{ debugName: "authorText" }] : []));
    collectionText = signal('', ...(ngDevMode ? [{ debugName: "collectionText" }] : []));
    tagText = signal('', ...(ngDevMode ? [{ debugName: "tagText" }] : []));
    /** Which collapsible groups are open. Modification date starts open, as in Web UI. */
    expanded = signal(new Set(['modified']), ...(ngDevMode ? [{ debugName: "expanded" }] : []));
    groups = computed(() => {
        const filters = this.filters();
        const aggregations = this.aggregations();
        return {
            before: [
                {
                    field: 'modified',
                    titleKey: 'satori-components.search-filters.modified.title',
                    options: nxsRangeOptions(NXS_MODIFIED_RANGES, aggregations.dc_modified_agg),
                    labelKeys: MODIFIED_LABEL_KEYS,
                },
            ],
            after: [
                {
                    field: 'nature',
                    titleKey: 'satori-components.search-filters.nature',
                    options: nxsTermOptions(aggregations.dc_nature_agg, filters.nature),
                },
                {
                    field: 'subjects',
                    titleKey: 'satori-components.search-filters.subjects',
                    options: nxsTermOptions(aggregations.dc_subjects_agg, filters.subjects),
                },
                {
                    field: 'coverage',
                    titleKey: 'satori-components.search-filters.coverage',
                    options: nxsTermOptions(aggregations.dc_coverage_agg, filters.coverage),
                },
                {
                    field: 'size',
                    titleKey: 'satori-components.search-filters.size.title',
                    options: nxsRangeOptions(NXS_SIZE_RANGES, aggregations.common_size_agg),
                    labelKeys: SIZE_LABEL_KEYS,
                },
            ],
        };
    }, ...(ngDevMode ? [{ debugName: "groups" }] : []));
    /** The authors the server counted for this query, not yet chosen, narrowed by what is typed. */
    authorOptions = computed(() => {
        const term = this.authorText().trim().toLowerCase();
        const chosen = this.filters().authors;
        return nxsTermOptions(this.aggregations().dc_creator_agg, []).filter((option) => !chosen.includes(option.value) && (!term || option.value.toLowerCase().includes(term)));
    }, ...(ngDevMode ? [{ debugName: "authorOptions" }] : []));
    collections = signal([], ...(ngDevMode ? [{ debugName: "collections" }] : []));
    collectionsState = signal('idle', ...(ngDevMode ? [{ debugName: "collectionsState" }] : []));
    collectionOptions = computed(() => {
        const term = this.collectionText().trim().toLowerCase();
        const chosen = this.filters().collections;
        return this.collections().filter((option) => !chosen.includes(option.id) && (!term || option.title.toLowerCase().includes(term)));
    }, ...(ngDevMode ? [{ debugName: "collectionOptions" }] : []));
    /** A choice leaves its box empty: it is shown as a chip below it. */
    emptyDisplay = () => '';
    tagSuggestions = signal([], ...(ngDevMode ? [{ debugName: "tagSuggestions" }] : []));
    tagOptions = computed(() => this.tagSuggestions().filter((label) => !this.filters().tags.includes(label)), ...(ngDevMode ? [{ debugName: "tagOptions" }] : []));
    tagTerms = new Subject();
    constructor() {
        // What the boxes show follows the filters whenever they change, from here or from the host.
        effect(() => {
            const filters = this.filters();
            untracked(() => {
                this.fulltextDraft.set(filters.fulltext);
                this.expandSelected(filters);
                // Chosen collections are shown by title, which needs the user's collections.
                if (filters.collections.length > 0 && this.collectionsState() === 'idle') {
                    this.loadCollections();
                }
            });
        });
        this.tagTerms
            .pipe(debounceTime(200), distinctUntilChanged(), switchMap((term) => this.searchService.getTagSuggestions(term)), takeUntilDestroyed())
            .subscribe((labels) => this.tagSuggestions.set(labels));
    }
    isExpanded(field) {
        return this.expanded().has(field);
    }
    toggleGroup(field) {
        this.expanded.update((current) => {
            const next = new Set(current);
            if (next.has(field))
                next.delete(field);
            else
                next.add(field);
            return next;
        });
    }
    isChecked(field, value) {
        return this.filters()[field].includes(value);
    }
    toggleOption(field, value) {
        const current = this.filters()[field];
        const next = current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [...current, value];
        this.update({ [field]: next });
    }
    optionLabelKey(group, value) {
        return group.labelKeys?.[value] ?? null;
    }
    optionText(group, value) {
        // An own key only: `constructor` or `__proto__` is a bucket key too, not an inherited property.
        const labels = this.optionLabels()[group.field];
        return labels && Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value;
    }
    applyFulltext() {
        this.update({ fulltext: this.fulltextDraft().trim() });
    }
    clearFulltext() {
        this.fulltextDraft.set('');
        this.update({ fulltext: '' });
    }
    addChoice(field, value) {
        const text = { authors: this.authorText, collections: this.collectionText, tags: this.tagText };
        text[field].set('');
        if (field === 'tags')
            this.tagSuggestions.set([]);
        if (!value || this.filters()[field].includes(value))
            return;
        this.update({ [field]: [...this.filters()[field], value] });
    }
    removeChoice(field, value) {
        this.update({ [field]: this.filters()[field].filter((entry) => entry !== value) });
    }
    onCollectionsFocus() {
        if (this.collectionsState() === 'loading' || this.collectionsState() === 'loaded')
            return;
        this.loadCollections();
    }
    loadCollections() {
        this.collectionsState.set('loading');
        this.searchService
            .getUserCollections()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (collections) => {
                this.collections.set(collections);
                this.collectionsState.set('loaded');
            },
            error: () => this.collectionsState.set('failed'),
        });
    }
    onTagInput(value) {
        this.tagText.set(value);
        this.tagTerms.next(value.trim());
        if (!value.trim())
            this.tagSuggestions.set([]);
    }
    resetFilters() {
        this.filters.set(NXS_EMPTY_SEARCH_FILTERS);
        this.filtersReset.emit();
    }
    /** The title a collection id is shown with, once the user's collections are known. */
    collectionTitle(id) {
        return this.collections().find((option) => option.id === id)?.title ?? id;
    }
    update(change) {
        this.filters.set({ ...this.filters(), ...change });
    }
    /** Opens every group that has a selection, so a loaded saved search shows what it filters on. */
    expandSelected(filters) {
        const selected = ['modified', 'nature', 'subjects', 'coverage', 'size'].filter((field) => filters[field].length > 0);
        if (selected.every((field) => this.expanded().has(field)))
            return;
        this.expanded.update((current) => new Set([...current, ...selected]));
    }
    static ɵfac = function NxsSearchFiltersComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSearchFiltersComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSearchFiltersComponent, selectors: [["nxs-search-filters"]], hostAttrs: [1, "nxs-search-filters"], inputs: { filters: [1, "filters"], aggregations: [1, "aggregations"], optionLabels: [1, "optionLabels"] }, outputs: { filters: "filtersChange", filtersReset: "filtersReset", saveAs: "saveAs" }, decls: 59, vars: 66, consts: [["authorsPanel", "matAutocomplete"], ["collectionsPanel", "matAutocomplete"], ["tagsPanel", "matAutocomplete"], ["chips", ""], ["checkboxGroup", ""], [1, "nxs-search-filters__fields"], [1, "nxs-search-filters__field"], [1, "nxs-search-filters__title", 3, "for"], [1, "nxs-search-filters__input-wrap"], ["type", "search", 1, "nxs-search-filters__input", 3, "input", "keydown.enter", "id", "placeholder", "value"], ["mat-icon-button", "", "type", "button", 1, "nxs-search-filters__clear"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], ["type", "text", 1, "nxs-search-filters__input", 3, "input", "id", "placeholder", "value", "matAutocomplete"], [1, "nxs-search-filters__panel", 3, "optionSelected", "displayWith"], [3, "value"], ["disabled", "", 1, "nxs-search-filters__hint"], ["type", "text", 1, "nxs-search-filters__input", 3, "focus", "input", "id", "placeholder", "value", "matAutocomplete"], [1, "nxs-search-filters__footer"], ["mat-stroked-button", "", "type", "button", 3, "click", "disabled"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click", "disabled"], ["mat-icon-button", "", "type", "button", 1, "nxs-search-filters__clear", 3, "click"], ["aria-hidden", "true"], [1, "nxs-search-filters__chips"], [3, "removed"], ["matChipRemove", "", "type", "button"], ["type", "button", 1, "nxs-search-filters__toggle", 3, "click", "id"], ["role", "group", 1, "nxs-search-filters__options", 3, "id"], [1, "nxs-search-filters__checkbox", 3, "checked"], [1, "nxs-search-filters__empty"], [1, "nxs-search-filters__checkbox", 3, "change", "checked"], [1, "nxs-search-filters__count"]], template: function NxsSearchFiltersComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 5)(1, "div", 6)(2, "label", 7);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "div", 8)(6, "input", 9);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵlistener("input", function NxsSearchFiltersComponent_Template_input_input_6_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.fulltextDraft.set($event.target.value)); })("keydown.enter", function NxsSearchFiltersComponent_Template_input_keydown_enter_6_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.applyFulltext()); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, NxsSearchFiltersComponent_Conditional_8_Template, 4, 3, "button", 10);
            i0.ɵɵelementEnd()();
            i0.ɵɵrepeaterCreate(9, NxsSearchFiltersComponent_For_10_Template, 1, 4, "ng-container", 11, _forTrack0);
            i0.ɵɵelementStart(11, "div", 6)(12, "label", 7);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "input", 12);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵlistener("input", function NxsSearchFiltersComponent_Template_input_input_15_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.authorText.set($event.target.value)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "mat-autocomplete", 13, 0);
            i0.ɵɵlistener("optionSelected", function NxsSearchFiltersComponent_Template_mat_autocomplete_optionSelected_17_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.addChoice("authors", $event.option.value)); });
            i0.ɵɵrepeaterCreate(19, NxsSearchFiltersComponent_For_20_Template, 2, 3, "mat-option", 14, _forTrack1, false, NxsSearchFiltersComponent_ForEmpty_21_Template, 3, 3, "mat-option", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementContainer(22, 11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "div", 6)(24, "label", 7);
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "input", 16);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵlistener("focus", function NxsSearchFiltersComponent_Template_input_focus_27_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onCollectionsFocus()); })("input", function NxsSearchFiltersComponent_Template_input_input_27_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.collectionText.set($event.target.value)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "mat-autocomplete", 13, 1);
            i0.ɵɵlistener("optionSelected", function NxsSearchFiltersComponent_Template_mat_autocomplete_optionSelected_29_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.addChoice("collections", $event.option.value)); });
            i0.ɵɵconditionalCreate(31, NxsSearchFiltersComponent_Conditional_31_Template, 3, 3, "mat-option", 15)(32, NxsSearchFiltersComponent_Conditional_32_Template, 3, 3, "mat-option", 15)(33, NxsSearchFiltersComponent_Conditional_33_Template, 3, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementContainer(34, 11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(35, "div", 6)(36, "label", 7);
            i0.ɵɵtext(37);
            i0.ɵɵpipe(38, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(39, "input", 12);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵlistener("input", function NxsSearchFiltersComponent_Template_input_input_39_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onTagInput($event.target.value)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "mat-autocomplete", 13, 2);
            i0.ɵɵlistener("optionSelected", function NxsSearchFiltersComponent_Template_mat_autocomplete_optionSelected_41_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.addChoice("tags", $event.option.value)); });
            i0.ɵɵconditionalCreate(43, NxsSearchFiltersComponent_Conditional_43_Template, 3, 3, "mat-option", 15)(44, NxsSearchFiltersComponent_Conditional_44_Template, 3, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementContainer(45, 11);
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(46, NxsSearchFiltersComponent_For_47_Template, 1, 4, "ng-container", 11, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(48, "div", 17)(49, "button", 18);
            i0.ɵɵlistener("click", function NxsSearchFiltersComponent_Template_button_click_49_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.resetFilters()); });
            i0.ɵɵtext(50);
            i0.ɵɵpipe(51, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "button", 19);
            i0.ɵɵlistener("click", function NxsSearchFiltersComponent_Template_button_click_52_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.saveAs.emit()); });
            i0.ɵɵtext(53);
            i0.ɵɵpipe(54, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(55, NxsSearchFiltersComponent_ng_template_55_Template, 1, 1, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor)(57, NxsSearchFiltersComponent_ng_template_57_Template, 8, 8, "ng-template", null, 4, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            const authorsPanel_r20 = i0.ɵɵreference(18);
            const collectionsPanel_r21 = i0.ɵɵreference(30);
            const tagsPanel_r22 = i0.ɵɵreference(42);
            const chips_r23 = i0.ɵɵreference(56);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("for", ctx.ids.fulltext);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 40, "satori-components.search-filters.fulltext"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("id", ctx.ids.fulltext)("placeholder", i0.ɵɵpipeBind1(7, 42, "satori-components.search-filters.fulltext-placeholder"))("value", ctx.fulltextDraft());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.fulltextDraft().trim() ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.groups().before);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("for", ctx.ids.authors);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 44, "satori-components.search-filters.authors"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("id", ctx.ids.authors)("placeholder", i0.ɵɵpipeBind1(16, 46, "satori-components.search-filters.authors-placeholder"))("value", ctx.authorText())("matAutocomplete", authorsPanel_r20);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("displayWith", ctx.emptyDisplay);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.authorOptions());
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngTemplateOutlet", chips_r23)("ngTemplateOutletContext", i0.ɵɵpureFunction1(60, _c0, ctx.filters().authors));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("for", ctx.ids.collections);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 48, "satori-components.search-filters.collections"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("id", ctx.ids.collections)("placeholder", i0.ɵɵpipeBind1(28, 50, "satori-components.search-filters.collections-placeholder"))("value", ctx.collectionText())("matAutocomplete", collectionsPanel_r21);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("displayWith", ctx.emptyDisplay);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.collectionsState() === "loading" ? 31 : ctx.collectionsState() === "failed" ? 32 : 33);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngTemplateOutlet", chips_r23)("ngTemplateOutletContext", i0.ɵɵpureFunction1(62, _c1, ctx.filters().collections));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("for", ctx.ids.tags);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 52, "satori-components.search-filters.tags"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("id", ctx.ids.tags)("placeholder", i0.ɵɵpipeBind1(40, 54, "satori-components.search-filters.tags-placeholder"))("value", ctx.tagText())("matAutocomplete", tagsPanel_r22);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("displayWith", ctx.emptyDisplay);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.tagText().trim() ? 43 : 44);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngTemplateOutlet", chips_r23)("ngTemplateOutletContext", i0.ɵɵpureFunction1(64, _c2, ctx.filters().tags));
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.groups().after);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", !ctx.hasFilters());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(51, 56, "satori-components.search-filters.reset"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.hasFilters());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(54, 58, "satori-components.search-filters.save-as"), " ");
        } }, dependencies: [MatAutocompleteModule, i1.MatAutocomplete, i2.MatOption, i1.MatAutocompleteTrigger, MatButtonModule, i3.MatButton, i3.MatIconButton, MatCheckboxModule, i4.MatCheckbox, MatChipsModule, i5.MatChip, i5.MatChipRemove, i5.MatChipSet, MatIconModule, i6.MatIcon, NgTemplateOutlet,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n}\n\n.nxs-search-filters__fields[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n\n.nxs-search-filters__field[_ngcontent-%COMP%] {\n  padding: 10px 16px 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, currentColor);\n}\n\n.nxs-search-filters__title[_ngcontent-%COMP%] {\n  display: block;\n  margin: 0 0 6px;\n  font: var(--mat-sys-label-large, inherit);\n  color: var(--mat-sys-on-surface, inherit);\n}\n\n.nxs-search-filters__input-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.nxs-search-filters__input[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 6px 8px;\n  border: 1px solid var(--mat-sys-outline, currentColor);\n  border-radius: 4px;\n  background: var(--mat-sys-surface, transparent);\n  color: var(--mat-sys-on-surface, inherit);\n  font: var(--mat-sys-body-medium, inherit);\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so each ring here is also drawn\n  // on a standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &::placeholder {\n    color: var(--mat-sys-on-surface-variant, inherit);\n  }\n\n  // The clear button replaces the browser's own.\n  &::-webkit-search-cancel-button {\n    appearance: none;\n  }\n}\n\n.nxs-search-filters__clear[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0;\n}\n\n.nxs-search-filters__toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 0;\n  border: none;\n  background: none;\n  color: var(--mat-sys-on-surface, inherit);\n  font: var(--mat-sys-label-large, inherit);\n  text-align: left;\n  cursor: pointer;\n\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 2px;\n  }\n}\n\n.nxs-search-filters__options[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding-top: 4px;\n}\n\n.nxs-search-filters__count[_ngcontent-%COMP%] {\n  margin-left: 4px;\n  color: var(--mat-sys-on-surface-variant, inherit);\n}\n\n.nxs-search-filters__empty[_ngcontent-%COMP%] {\n  margin: 4px 0 0;\n  font: var(--mat-sys-body-small, inherit);\n  color: var(--mat-sys-on-surface-variant, inherit);\n}\n\n.nxs-search-filters__footer[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n  padding: 12px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant, currentColor);\n}\n\n.nxs-search-filters__chips[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 6px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSearchFiltersComponent, [{
        type: Component,
        args: [{ selector: 'nxs-search-filters', standalone: true, imports: [
                    MatAutocompleteModule,
                    MatButtonModule,
                    MatCheckboxModule,
                    MatChipsModule,
                    MatIconModule,
                    NgTemplateOutlet,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-search-filters' }, template: "<div class=\"nxs-search-filters__fields\">\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.fulltext\">{{\n      'satori-components.search-filters.fulltext' | translate\n    }}</label>\n    <div class=\"nxs-search-filters__input-wrap\">\n      <input\n        class=\"nxs-search-filters__input\"\n        type=\"search\"\n        [id]=\"ids.fulltext\"\n        [placeholder]=\"'satori-components.search-filters.fulltext-placeholder' | translate\"\n        [value]=\"fulltextDraft()\"\n        (input)=\"fulltextDraft.set($any($event.target).value)\"\n        (keydown.enter)=\"applyFulltext()\"\n      />\n      @if (fulltextDraft().trim()) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          class=\"nxs-search-filters__clear\"\n          [attr.aria-label]=\"'satori-components.search-filters.clear-fulltext' | translate\"\n          (click)=\"clearFulltext()\"\n        >\n          <mat-icon aria-hidden=\"true\">close</mat-icon>\n        </button>\n      }\n    </div>\n  </div>\n\n  @for (group of groups().before; track group.field) {\n    <ng-container\n      [ngTemplateOutlet]=\"checkboxGroup\"\n      [ngTemplateOutletContext]=\"{ $implicit: group }\"\n    />\n  }\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.authors\">{{\n      'satori-components.search-filters.authors' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.authors\"\n      [placeholder]=\"'satori-components.search-filters.authors-placeholder' | translate\"\n      [value]=\"authorText()\"\n      [matAutocomplete]=\"authorsPanel\"\n      (input)=\"authorText.set($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #authorsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('authors', $event.option.value)\"\n    >\n      @for (option of authorOptions(); track option.value) {\n        <mat-option [value]=\"option.value\">{{ option.value }} ({{ option.count }})</mat-option>\n      } @empty {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.no-results' | translate\n        }}</mat-option>\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'authors',\n        values: filters().authors,\n        titleKey: 'satori-components.search-filters.chosen-authors',\n      }\"\n    />\n  </div>\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.collections\">{{\n      'satori-components.search-filters.collections' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.collections\"\n      [placeholder]=\"'satori-components.search-filters.collections-placeholder' | translate\"\n      [value]=\"collectionText()\"\n      [matAutocomplete]=\"collectionsPanel\"\n      (focus)=\"onCollectionsFocus()\"\n      (input)=\"collectionText.set($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #collectionsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('collections', $event.option.value)\"\n    >\n      @if (collectionsState() === 'loading') {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.loading-collections' | translate\n        }}</mat-option>\n      } @else if (collectionsState() === 'failed') {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.collections-failed' | translate\n        }}</mat-option>\n      } @else {\n        @for (option of collectionOptions(); track option.id) {\n          <mat-option [value]=\"option.id\">{{ option.title }} ({{ option.itemCount }})</mat-option>\n        } @empty {\n          <mat-option disabled class=\"nxs-search-filters__hint\">{{\n            'satori-components.search-filters.no-results' | translate\n          }}</mat-option>\n        }\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'collections',\n        values: filters().collections,\n        titleKey: 'satori-components.search-filters.chosen-collections',\n      }\"\n    />\n  </div>\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.tags\">{{\n      'satori-components.search-filters.tags' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.tags\"\n      [placeholder]=\"'satori-components.search-filters.tags-placeholder' | translate\"\n      [value]=\"tagText()\"\n      [matAutocomplete]=\"tagsPanel\"\n      (input)=\"onTagInput($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #tagsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('tags', $event.option.value)\"\n    >\n      @if (!tagText().trim()) {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.tags-hint' | translate\n        }}</mat-option>\n      } @else {\n        @for (label of tagOptions(); track label) {\n          <mat-option [value]=\"label\">{{ label }}</mat-option>\n        } @empty {\n          <mat-option disabled class=\"nxs-search-filters__hint\">{{\n            'satori-components.search-filters.no-results-for'\n              | translate: { term: tagText().trim() }\n          }}</mat-option>\n        }\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'tags',\n        values: filters().tags,\n        titleKey: 'satori-components.search-filters.chosen-tags',\n      }\"\n    />\n  </div>\n\n  @for (group of groups().after; track group.field) {\n    <ng-container\n      [ngTemplateOutlet]=\"checkboxGroup\"\n      [ngTemplateOutletContext]=\"{ $implicit: group }\"\n    />\n  }\n</div>\n\n<div class=\"nxs-search-filters__footer\">\n  <button mat-stroked-button type=\"button\" [disabled]=\"!hasFilters()\" (click)=\"resetFilters()\">\n    {{ 'satori-components.search-filters.reset' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    type=\"button\"\n    [disabled]=\"!hasFilters()\"\n    (click)=\"saveAs.emit()\"\n  >\n    {{ 'satori-components.search-filters.save-as' | translate }}\n  </button>\n</div>\n\n<ng-template #chips let-field=\"field\" let-values=\"values\" let-titleKey=\"titleKey\">\n  @if (values.length > 0) {\n    <mat-chip-set class=\"nxs-search-filters__chips\" [attr.aria-label]=\"titleKey | translate\">\n      @for (value of values; track value) {\n        <mat-chip (removed)=\"removeChoice(field, value)\">\n          {{ field === 'collections' ? collectionTitle(value) : value }}\n          <button\n            matChipRemove\n            type=\"button\"\n            [attr.aria-label]=\"\n              'satori-components.search-filters.remove'\n                | translate: { value: field === 'collections' ? collectionTitle(value) : value }\n            \"\n          >\n            <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n          </button>\n        </mat-chip>\n      }\n    </mat-chip-set>\n  }\n</ng-template>\n\n<ng-template #checkboxGroup let-group>\n  <div class=\"nxs-search-filters__field\">\n    <button\n      type=\"button\"\n      class=\"nxs-search-filters__toggle\"\n      [id]=\"ids.group(group.field) + '-toggle'\"\n      [attr.aria-expanded]=\"isExpanded(group.field)\"\n      [attr.aria-controls]=\"ids.group(group.field)\"\n      (click)=\"toggleGroup(group.field)\"\n    >\n      <span>{{ group.titleKey | translate }}</span>\n      <mat-icon aria-hidden=\"true\">{{\n        isExpanded(group.field) ? 'expand_less' : 'expand_more'\n      }}</mat-icon>\n    </button>\n    @if (isExpanded(group.field)) {\n      <div\n        class=\"nxs-search-filters__options\"\n        role=\"group\"\n        [id]=\"ids.group(group.field)\"\n        [attr.aria-labelledby]=\"ids.group(group.field) + '-toggle'\"\n      >\n        @for (option of group.options; track option.value) {\n          <mat-checkbox\n            class=\"nxs-search-filters__checkbox\"\n            [checked]=\"isChecked(group.field, option.value)\"\n            (change)=\"toggleOption(group.field, option.value)\"\n          >\n            @if (optionLabelKey(group, option.value); as key) {\n              {{ key | translate }}\n            } @else {\n              {{ optionText(group, option.value) }}\n            }\n            @if (option.count !== null) {\n              <span class=\"nxs-search-filters__count\">({{ option.count }})</span>\n            }\n          </mat-checkbox>\n        } @empty {\n          <p class=\"nxs-search-filters__empty\">\n            {{ 'satori-components.search-filters.no-available-results' | translate }}\n          </p>\n        }\n      </div>\n    }\n  </div>\n</ng-template>\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n}\n\n.nxs-search-filters__fields {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n\n.nxs-search-filters__field {\n  padding: 10px 16px 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, currentColor);\n}\n\n.nxs-search-filters__title {\n  display: block;\n  margin: 0 0 6px;\n  font: var(--mat-sys-label-large, inherit);\n  color: var(--mat-sys-on-surface, inherit);\n}\n\n.nxs-search-filters__input-wrap {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.nxs-search-filters__input {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 6px 8px;\n  border: 1px solid var(--mat-sys-outline, currentColor);\n  border-radius: 4px;\n  background: var(--mat-sys-surface, transparent);\n  color: var(--mat-sys-on-surface, inherit);\n  font: var(--mat-sys-body-medium, inherit);\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so each ring here is also drawn\n  // on a standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &::placeholder {\n    color: var(--mat-sys-on-surface-variant, inherit);\n  }\n\n  // The clear button replaces the browser's own.\n  &::-webkit-search-cancel-button {\n    appearance: none;\n  }\n}\n\n.nxs-search-filters__clear {\n  position: absolute;\n  right: 0;\n}\n\n.nxs-search-filters__toggle {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 0;\n  border: none;\n  background: none;\n  color: var(--mat-sys-on-surface, inherit);\n  font: var(--mat-sys-label-large, inherit);\n  text-align: left;\n  cursor: pointer;\n\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 2px;\n  }\n}\n\n.nxs-search-filters__options {\n  display: flex;\n  flex-direction: column;\n  padding-top: 4px;\n}\n\n.nxs-search-filters__count {\n  margin-left: 4px;\n  color: var(--mat-sys-on-surface-variant, inherit);\n}\n\n.nxs-search-filters__empty {\n  margin: 4px 0 0;\n  font: var(--mat-sys-body-small, inherit);\n  color: var(--mat-sys-on-surface-variant, inherit);\n}\n\n.nxs-search-filters__footer {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n  padding: 12px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant, currentColor);\n}\n\n.nxs-search-filters__chips {\n  display: block;\n  margin-top: 6px;\n}\n"] }]
    }], () => [], { filters: [{ type: i0.Input, args: [{ isSignal: true, alias: "filters", required: false }] }, { type: i0.Output, args: ["filtersChange"] }], aggregations: [{ type: i0.Input, args: [{ isSignal: true, alias: "aggregations", required: false }] }], optionLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "optionLabels", required: false }] }], filtersReset: [{ type: i0.Output, args: ["filtersReset"] }], saveAs: [{ type: i0.Output, args: ["saveAs"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSearchFiltersComponent, { className: "NxsSearchFiltersComponent", filePath: "libs/shared/satori-components/src/lib/search-filters/search-filters.component.ts", lineNumber: 100 }); })();
//# sourceMappingURL=search-filters.component.js.map