import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, input, output, signal, viewChild, } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/checkbox";
const _c0 = ["panel"];
const _forTrack0 = ($index, $item) => $item.key;
function NxsColumnPickerComponent_For_10_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 9);
    i0.ɵɵlistener("change", function NxsColumnPickerComponent_For_10_Template_mat_checkbox_change_0_listener() { const column_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.toggle(column_r3.key)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const column_r3 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("checked", ctx_r3.isChosen(column_r3.key) || ctx_r3.isRequired(column_r3.key))("disabled", ctx_r3.isRequired(column_r3.key));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(column_r3.label);
} }
/**
 * The panel a user opens from a table header to choose which columns show.
 *
 * Presentational: it is handed the columns and emits the keys chosen, in the columns' own order so
 * a reorder in the host's column set is respected. Where the columns come from — Layer 1
 * descriptors on browse, a fixed set on search — and where the choice is persisted stay the host's.
 *
 * Changes are buffered until Done, so Escape and the backdrop genuinely discard them. It is a
 * modal dialog while open: it takes focus when it appears, keeps Tab and Shift+Tab inside itself,
 * and hands focus back to whatever had it (the header's "Manage columns" button) when it goes. The panel hangs from the top-right corner
 * of the nearest positioned ancestor, so the host renders it inside the table's wrapper.
 */
export class NxsColumnPickerComponent {
    /** Every column the user may choose from, in display order. */
    columns = input.required(...(ngDevMode ? [{ debugName: "columns" }] : []));
    /** Keys that cannot be switched off — the identity column, so no row is left unlabelled. */
    required = input([], ...(ngDevMode ? [{ debugName: "required" }] : []));
    /** The keys Reset returns to: the host's defaults, not a copy of a packaged list. */
    defaults = input([], ...(ngDevMode ? [{ debugName: "defaults" }] : []));
    /** Done: the chosen keys, in column order. */
    apply = output();
    /** Escape or the backdrop: close without applying. */
    dismiss = output();
    panel = viewChild.required('panel');
    opener = inject(DOCUMENT).activeElement;
    pending = signal(null, ...(ngDevMode ? [{ debugName: "pending" }] : []));
    chosen = computed(() => this.pending() ??
        this.columns()
            .filter((column) => column.visible)
            .map((column) => column.key), ...(ngDevMode ? [{ debugName: "chosen" }] : []));
    ngAfterViewInit() {
        this.panel().nativeElement.focus();
    }
    ngOnDestroy() {
        if (this.opener?.isConnected)
            this.opener.focus();
    }
    isChosen(key) {
        return this.chosen().includes(key);
    }
    isRequired(key) {
        return this.required().includes(key);
    }
    toggle(key) {
        if (this.isRequired(key))
            return;
        const current = this.chosen();
        this.pending.set(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
    }
    reset() {
        this.pending.set([...this.defaults()]);
    }
    commit() {
        const chosen = this.chosen();
        this.apply.emit(this.columns()
            .filter((column) => chosen.includes(column.key) || this.isRequired(column.key))
            .map((column) => column.key));
        this.pending.set(null);
    }
    cancel() {
        this.pending.set(null);
        this.dismiss.emit();
    }
    static ɵfac = function NxsColumnPickerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsColumnPickerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsColumnPickerComponent, selectors: [["nxs-column-picker"]], viewQuery: function NxsColumnPickerComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.panel, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-column-picker"], hostBindings: function NxsColumnPickerComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.escape", function NxsColumnPickerComponent_keydown_escape_HostBindingHandler() { return ctx.cancel(); }, i0.ɵɵresolveDocument);
        } }, inputs: { columns: [1, "columns"], required: [1, "required"], defaults: [1, "defaults"] }, outputs: { apply: "apply", dismiss: "dismiss" }, decls: 18, vars: 15, consts: [["panel", ""], ["type", "button", 1, "nxs-column-picker__backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", "tabindex", "-1", "cdkTrapFocus", "", 1, "nxs-column-picker__panel"], [1, "nxs-column-picker__title"], [1, "nxs-column-picker__list"], [1, "nxs-column-picker__option", 3, "checked", "disabled"], [1, "nxs-column-picker__actions"], ["mat-button", "", "type", "button", 3, "click"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click"], [1, "nxs-column-picker__option", 3, "change", "checked", "disabled"]], template: function NxsColumnPickerComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "button", 1);
            i0.ɵɵpipe(1, "translate");
            i0.ɵɵlistener("click", function NxsColumnPickerComponent_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.cancel()); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "div", 2, 0);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementStart(5, "p", 3);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "div", 4);
            i0.ɵɵrepeaterCreate(9, NxsColumnPickerComponent_For_10_Template, 2, 3, "mat-checkbox", 5, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "div", 6)(12, "button", 7);
            i0.ɵɵlistener("click", function NxsColumnPickerComponent_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.reset()); });
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "button", 8);
            i0.ɵɵlistener("click", function NxsColumnPickerComponent_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.commit()); });
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 5, "satori-components.column-picker.close"));
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 7, "satori-components.column-picker.title"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 9, "satori-components.column-picker.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.columns());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 11, "satori-components.column-picker.reset"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 13, "satori-components.column-picker.done"), " ");
        } }, dependencies: [CdkTrapFocus, MatButtonModule, i1.MatButton, MatCheckboxModule, i2.MatCheckbox, TranslatePipe], styles: ["//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   panel's[_ngcontent-%COMP%]   background,[_ngcontent-%COMP%]   which[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   list's[_ngcontent-%COMP%]   covers[_ngcontent-%COMP%]   must[_ngcontent-%COMP%]   match.\n$panel-background[_ngcontent-%COMP%]:   var(--mat-sys-surface-container-lowest)[_ngcontent-%COMP%];\n$scroll-cue[_ngcontent-%COMP%]:   color-mix(in srgb, var(--mat-sys-on-surface) 22%, transparent)[_ngcontent-%COMP%];\n\n//[_ngcontent-%COMP%]   Both[_ngcontent-%COMP%]   children[_ngcontent-%COMP%]   are[_ngcontent-%COMP%]   positioned[_ngcontent-%COMP%], so   a   box   of   its   own   would   only   be   an   empty   row   in   the   host's\n//   layout   \u2014   and   a   flex   gap   around   nothing.\n[_nghost-%COMP%] {\n  display: contents;\n}\n\n.nxs-column-picker__backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n  padding: 0;\n  border: none;\n  background: transparent;\n  font: inherit;\n  cursor: pointer;\n}\n\n.nxs-column-picker__panel[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 43px;\n  right: 0;\n  z-index: 100;\n  display: flex;\n  flex-direction: column;\n  min-width: 200px;\n  max-height: 420px;\n  padding: 14px 16px;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n  background: $panel-background;\n  box-shadow: var(--mat-sys-level3);\n}\n\n.nxs-column-picker__title[_ngcontent-%COMP%] {\n  margin: 0 0 10px;\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n//[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   shadow[_ngcontent-%COMP%]   along[_ngcontent-%COMP%]   an[_ngcontent-%COMP%]   edge[_ngcontent-%COMP%]   says[_ngcontent-%COMP%]   more[_ngcontent-%COMP%]   columns[_ngcontent-%COMP%]   lie[_ngcontent-%COMP%]   past[_ngcontent-%COMP%]   it,[_ngcontent-%COMP%]   where[_ngcontent-%COMP%]   an[_ngcontent-%COMP%]   overlay[_ngcontent-%COMP%]   scrollbar[_ngcontent-%COMP%]   shows[_ngcontent-%COMP%]   nothing\n//[_ngcontent-%COMP%]   until[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   list[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   scrolled.[_ngcontent-%COMP%]   Two[_ngcontent-%COMP%]   covers[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   panel's[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   scroll[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   columns[_ngcontent-%COMP%]   (`local`)\n//[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   hide[_ngcontent-%COMP%]   each[_ngcontent-%COMP%]   shadow[_ngcontent-%COMP%], which[_ngcontent-%COMP%]   stays[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   edge[_ngcontent-%COMP%]   (`scroll`)[_ngcontent-%COMP%], once[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   end[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   reached.\n.nxs-column-picker__list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  margin-bottom: 2px;\n  background:\n    linear-gradient($panel-background 30%, transparent) top / 100% 32px no-repeat local,\n    linear-gradient(transparent, $panel-background 70%) bottom / 100% 32px no-repeat local,\n    radial-gradient(farthest-side at 50% 0, $scroll-cue, transparent) top / 100% 12px no-repeat\n      scroll,\n    radial-gradient(farthest-side at 50% 100%, $scroll-cue, transparent) bottom / 100% 12px\n      no-repeat scroll,\n    $panel-background;\n}\n\n.nxs-column-picker__option[_ngcontent-%COMP%] {\n  display: flex;\n  margin-bottom: 6px;\n}\n\n.nxs-column-picker__actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsColumnPickerComponent, [{
        type: Component,
        args: [{ selector: 'nxs-column-picker', standalone: true, imports: [CdkTrapFocus, MatButtonModule, MatCheckboxModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                    class: 'nxs-column-picker',
                    '(document:keydown.escape)': 'cancel()',
                }, template: "<button\n  type=\"button\"\n  class=\"nxs-column-picker__backdrop\"\n  [attr.aria-label]=\"'satori-components.column-picker.close' | translate\"\n  (click)=\"cancel()\"\n></button>\n<div\n  #panel\n  class=\"nxs-column-picker__panel\"\n  role=\"dialog\"\n  aria-modal=\"true\"\n  [attr.aria-label]=\"'satori-components.column-picker.title' | translate\"\n  tabindex=\"-1\"\n  cdkTrapFocus\n>\n  <p class=\"nxs-column-picker__title\">{{ 'satori-components.column-picker.title' | translate }}</p>\n  <div class=\"nxs-column-picker__list\">\n    @for (column of columns(); track column.key) {\n      <mat-checkbox\n        class=\"nxs-column-picker__option\"\n        [checked]=\"isChosen(column.key) || isRequired(column.key)\"\n        [disabled]=\"isRequired(column.key)\"\n        (change)=\"toggle(column.key)\"\n        >{{ column.label }}</mat-checkbox\n      >\n    }\n  </div>\n  <div class=\"nxs-column-picker__actions\">\n    <button mat-button type=\"button\" (click)=\"reset()\">\n      {{ 'satori-components.column-picker.reset' | translate }}\n    </button>\n    <button mat-flat-button color=\"primary\" type=\"button\" (click)=\"commit()\">\n      {{ 'satori-components.column-picker.done' | translate }}\n    </button>\n  </div>\n</div>\n", styles: ["// The panel's background, which the list's covers must match.\n$panel-background: var(--mat-sys-surface-container-lowest);\n$scroll-cue: color-mix(in srgb, var(--mat-sys-on-surface) 22%, transparent);\n\n// Both children are positioned, so a box of its own would only be an empty row in the host's\n// layout \u2014 and a flex gap around nothing.\n:host {\n  display: contents;\n}\n\n.nxs-column-picker__backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n  padding: 0;\n  border: none;\n  background: transparent;\n  font: inherit;\n  cursor: pointer;\n}\n\n.nxs-column-picker__panel {\n  position: absolute;\n  top: 43px;\n  right: 0;\n  z-index: 100;\n  display: flex;\n  flex-direction: column;\n  min-width: 200px;\n  max-height: 420px;\n  padding: 14px 16px;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n  background: $panel-background;\n  box-shadow: var(--mat-sys-level3);\n}\n\n.nxs-column-picker__title {\n  margin: 0 0 10px;\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n// A shadow along an edge says more columns lie past it, where an overlay scrollbar shows nothing\n// until the list is scrolled. Two covers in the panel's colour scroll with the columns (`local`)\n// and hide each shadow, which stays on the edge (`scroll`), once that end is reached.\n.nxs-column-picker__list {\n  flex: 1;\n  overflow-y: auto;\n  margin-bottom: 2px;\n  background:\n    linear-gradient($panel-background 30%, transparent) top / 100% 32px no-repeat local,\n    linear-gradient(transparent, $panel-background 70%) bottom / 100% 32px no-repeat local,\n    radial-gradient(farthest-side at 50% 0, $scroll-cue, transparent) top / 100% 12px no-repeat\n      scroll,\n    radial-gradient(farthest-side at 50% 100%, $scroll-cue, transparent) bottom / 100% 12px\n      no-repeat scroll,\n    $panel-background;\n}\n\n.nxs-column-picker__option {\n  display: flex;\n  margin-bottom: 6px;\n}\n\n.nxs-column-picker__actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n}\n"] }]
    }], null, { columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], defaults: [{ type: i0.Input, args: [{ isSignal: true, alias: "defaults", required: false }] }], apply: [{ type: i0.Output, args: ["apply"] }], dismiss: [{ type: i0.Output, args: ["dismiss"] }], panel: [{ type: i0.ViewChild, args: ['panel', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsColumnPickerComponent, { className: "NxsColumnPickerComponent", filePath: "libs/shared/satori-components/src/lib/column-picker/column-picker.component.ts", lineNumber: 54 }); })();
//# sourceMappingURL=column-picker.component.js.map