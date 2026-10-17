import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal, untracked, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchService } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/autocomplete";
import * as i2 from "@angular/material/select";
import * as i3 from "@angular/material/icon";
const _forTrack0 = ($index, $item) => $item.id;
function NxsSavedSearchSelectComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.saved-search-select.loading"));
} }
function NxsSavedSearchSelectComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.saved-search-select.none"));
} }
function NxsSavedSearchSelectComponent_Conditional_12_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 8)(1, "mat-icon", 9);
    i0.ɵɵtext(2, "bookmark");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const search_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("nxs-saved-search-select__current", search_r2.id === ctx_r2.selectedId());
    i0.ɵɵproperty("value", search_r2.id);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", search_r2.title, " ");
} }
function NxsSavedSearchSelectComponent_Conditional_12_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.saved-search-select.no-match"));
} }
function NxsSavedSearchSelectComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsSavedSearchSelectComponent_Conditional_12_For_1_Template, 4, 4, "mat-option", 7, _forTrack0, false, NxsSavedSearchSelectComponent_Conditional_12_ForEmpty_2_Template, 3, 3, "mat-option", 6);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.options());
} }
let nextId = 0;
/**
 * The saved searches the user can open — the list at the top of Web UI's search form.
 *
 * Lists the saved searches the server returns for `pageProvider`: the user's own and those shared
 * with them. It reads the list when it is first opened and again when `refresh` changes, narrows it
 * as the user types, and emits the one chosen. Loading that search's filters is the host's job.
 */
export class NxsSavedSearchSelectComponent {
    /** The saved search open now, or an empty string for none. */
    selectedId = input('', ...(ngDevMode ? [{ debugName: "selectedId" }] : []));
    /** Its title, shown in the box. */
    selectedTitle = input('', ...(ngDevMode ? [{ debugName: "selectedTitle" }] : []));
    /** The page provider whose saved searches are listed. */
    pageProvider = input('default_search', ...(ngDevMode ? [{ debugName: "pageProvider" }] : []));
    /** Change it to read the list again — after a search is saved, renamed or deleted. */
    refresh = input(0, ...(ngDevMode ? [{ debugName: "refresh" }] : []));
    /** The user chose a saved search. */
    selectedChange = output();
    searchService = inject(SearchService);
    destroyRef = inject(DestroyRef);
    inputId = `nxs-saved-search-select-${nextId++}`;
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    searches = signal([], ...(ngDevMode ? [{ debugName: "searches" }] : []));
    state = signal('idle', ...(ngDevMode ? [{ debugName: "state" }] : []));
    /** The saved searches whose title contains what is typed, unless it is the open one's title. */
    options = computed(() => {
        const term = this.text().trim().toLowerCase();
        const all = this.searches();
        if (!term || term === this.selectedTitle().trim().toLowerCase())
            return all;
        return all.filter((search) => search.title.toLowerCase().includes(term));
    }, ...(ngDevMode ? [{ debugName: "options" }] : []));
    constructor() {
        effect(() => {
            const title = this.selectedTitle();
            untracked(() => this.text.set(title));
        });
        // A new `refresh` drops the list, so the next opening reads it again; an open panel reads now.
        let first = true;
        effect(() => {
            this.refresh();
            this.pageProvider();
            if (first) {
                first = false;
                return;
            }
            untracked(() => {
                const wasLoaded = this.state() !== 'idle';
                this.state.set('idle');
                if (wasLoaded)
                    this.load();
            });
        });
    }
    /** Reads the list, unless it is loading or already read. */
    load() {
        if (this.state() !== 'idle')
            return;
        this.state.set('loading');
        this.searchService
            .getSavedSearches(this.pageProvider())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((searches) => {
            this.searches.set(searches);
            this.state.set('loaded');
        });
    }
    onInput(value) {
        this.text.set(value);
    }
    choose(id) {
        const search = this.searches().find((entry) => entry.id === id);
        if (!search)
            return;
        this.text.set(search.title);
        this.selectedChange.emit({ id: search.id, title: search.title });
    }
    /** Puts the open search's title back when the box is left without a choice. */
    restore() {
        this.text.set(this.selectedTitle());
    }
    display = (id) => this.searches().find((entry) => entry.id === id)?.title ?? this.selectedTitle();
    static ɵfac = function NxsSavedSearchSelectComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSavedSearchSelectComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSavedSearchSelectComponent, selectors: [["nxs-saved-search-select"]], hostAttrs: [1, "nxs-saved-search-select"], inputs: { selectedId: [1, "selectedId"], selectedTitle: [1, "selectedTitle"], pageProvider: [1, "pageProvider"], refresh: [1, "refresh"] }, outputs: { selectedChange: "selectedChange" }, decls: 13, vars: 12, consts: [["panel", "matAutocomplete"], [1, "nxs-saved-search-select__label", 3, "for"], [1, "nxs-saved-search-select__wrap"], ["type", "text", 1, "nxs-saved-search-select__input", 3, "focus", "input", "id", "placeholder", "value", "matAutocomplete"], ["aria-hidden", "true", 1, "nxs-saved-search-select__arrow"], [1, "nxs-saved-search-select__panel", 3, "optionSelected", "closed", "displayWith"], ["disabled", ""], [3, "value", "nxs-saved-search-select__current"], [3, "value"], ["aria-hidden", "true"]], template: function NxsSavedSearchSelectComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "label", 1);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "div", 2)(4, "input", 3);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵlistener("focus", function NxsSavedSearchSelectComponent_Template_input_focus_4_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.load()); })("input", function NxsSavedSearchSelectComponent_Template_input_input_4_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onInput($event.target.value)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-icon", 4);
            i0.ɵɵtext(7, "arrow_drop_down");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "mat-autocomplete", 5, 0);
            i0.ɵɵlistener("optionSelected", function NxsSavedSearchSelectComponent_Template_mat_autocomplete_optionSelected_8_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.choose($event.option.value)); })("closed", function NxsSavedSearchSelectComponent_Template_mat_autocomplete_closed_8_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.restore()); });
            i0.ɵɵconditionalCreate(10, NxsSavedSearchSelectComponent_Conditional_10_Template, 3, 3, "mat-option", 6)(11, NxsSavedSearchSelectComponent_Conditional_11_Template, 3, 3, "mat-option", 6)(12, NxsSavedSearchSelectComponent_Conditional_12_Template, 3, 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            const panel_r4 = i0.ɵɵreference(9);
            i0.ɵɵproperty("for", ctx.inputId);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 8, "satori-components.saved-search-select.label"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("id", ctx.inputId)("placeholder", i0.ɵɵpipeBind1(5, 10, "satori-components.saved-search-select.placeholder"))("value", ctx.text())("matAutocomplete", panel_r4);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("displayWith", ctx.display);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.state() !== "loaded" ? 10 : ctx.searches().length === 0 ? 11 : 12);
        } }, dependencies: [MatAutocompleteModule, i1.MatAutocomplete, i2.MatOption, i1.MatAutocompleteTrigger, MatIconModule, i3.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  min-width: 0;\n}\n\n.nxs-saved-search-select__label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 4px;\n  font: var(--mat-sys-label-medium, inherit);\n  color: var(--mat-sys-on-surface-variant, inherit);\n}\n\n.nxs-saved-search-select__wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.nxs-saved-search-select__input[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 6px 28px 6px 8px;\n  border: 1px solid var(--mat-sys-outline, currentColor);\n  border-radius: 4px;\n  background: var(--mat-sys-surface, transparent);\n  color: var(--mat-sys-on-surface, inherit);\n  font: var(--mat-sys-body-medium, inherit);\n  text-overflow: ellipsis;\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so the ring is also drawn on a\n  // standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &::placeholder {\n    color: var(--mat-sys-on-surface-variant, inherit);\n  }\n}\n\n.nxs-saved-search-select__arrow[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 4px;\n  pointer-events: none;\n  color: var(--mat-sys-on-surface-variant, inherit);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSavedSearchSelectComponent, [{
        type: Component,
        args: [{ selector: 'nxs-saved-search-select', standalone: true, imports: [MatAutocompleteModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-saved-search-select' }, template: "<label class=\"nxs-saved-search-select__label\" [for]=\"inputId\">{{\n  'satori-components.saved-search-select.label' | translate\n}}</label>\n<div class=\"nxs-saved-search-select__wrap\">\n  <input\n    class=\"nxs-saved-search-select__input\"\n    type=\"text\"\n    [id]=\"inputId\"\n    [placeholder]=\"'satori-components.saved-search-select.placeholder' | translate\"\n    [value]=\"text()\"\n    [matAutocomplete]=\"panel\"\n    (focus)=\"load()\"\n    (input)=\"onInput($any($event.target).value)\"\n  />\n  <mat-icon class=\"nxs-saved-search-select__arrow\" aria-hidden=\"true\">arrow_drop_down</mat-icon>\n</div>\n<mat-autocomplete\n  #panel=\"matAutocomplete\"\n  class=\"nxs-saved-search-select__panel\"\n  [displayWith]=\"display\"\n  (optionSelected)=\"choose($event.option.value)\"\n  (closed)=\"restore()\"\n>\n  @if (state() !== 'loaded') {\n    <mat-option disabled>{{\n      'satori-components.saved-search-select.loading' | translate\n    }}</mat-option>\n  } @else if (searches().length === 0) {\n    <mat-option disabled>{{ 'satori-components.saved-search-select.none' | translate }}</mat-option>\n  } @else {\n    @for (search of options(); track search.id) {\n      <mat-option\n        [value]=\"search.id\"\n        [class.nxs-saved-search-select__current]=\"search.id === selectedId()\"\n      >\n        <mat-icon aria-hidden=\"true\">bookmark</mat-icon>{{ search.title }}\n      </mat-option>\n    } @empty {\n      <mat-option disabled>{{\n        'satori-components.saved-search-select.no-match' | translate\n      }}</mat-option>\n    }\n  }\n</mat-autocomplete>\n", styles: [":host {\n  display: block;\n  min-width: 0;\n}\n\n.nxs-saved-search-select__label {\n  display: block;\n  margin-bottom: 4px;\n  font: var(--mat-sys-label-medium, inherit);\n  color: var(--mat-sys-on-surface-variant, inherit);\n}\n\n.nxs-saved-search-select__wrap {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.nxs-saved-search-select__input {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 6px 28px 6px 8px;\n  border: 1px solid var(--mat-sys-outline, currentColor);\n  border-radius: 4px;\n  background: var(--mat-sys-surface, transparent);\n  color: var(--mat-sys-on-surface, inherit);\n  font: var(--mat-sys-body-medium, inherit);\n  text-overflow: ellipsis;\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so the ring is also drawn on a\n  // standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary, currentColor);\n    outline-offset: 1px;\n  }\n\n  &::placeholder {\n    color: var(--mat-sys-on-surface-variant, inherit);\n  }\n}\n\n.nxs-saved-search-select__arrow {\n  position: absolute;\n  right: 4px;\n  pointer-events: none;\n  color: var(--mat-sys-on-surface-variant, inherit);\n}\n"] }]
    }], () => [], { selectedId: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedId", required: false }] }], selectedTitle: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedTitle", required: false }] }], pageProvider: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageProvider", required: false }] }], refresh: [{ type: i0.Input, args: [{ isSignal: true, alias: "refresh", required: false }] }], selectedChange: [{ type: i0.Output, args: ["selectedChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSavedSearchSelectComponent, { className: "NxsSavedSearchSelectComponent", filePath: "libs/shared/satori-components/src/lib/saved-search-select/saved-search-select.component.ts", lineNumber: 44 }); })();
//# sourceMappingURL=saved-search-select.component.js.map