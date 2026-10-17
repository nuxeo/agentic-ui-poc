import { ChangeDetectionStrategy, Component, booleanAttribute, input, output, viewChild, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { NxsFileDropTracker } from '../file-drop';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
const _c0 = ["picker"];
let nextId = 0;
/**
 * Where files are dropped from the computer, or chosen with a button — the same files either way.
 *
 * The button is the keyboard's way in, since dragging files has none. Only a drag of files is
 * taken: a drag of text or a link is left to the browser, and nothing lights up for it.
 */
export class NxsDropzoneComponent {
    /** What the zone says, already translated, such as "Drag and drop files here". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The button's text, already translated. Blank says "Choose files" or "Choose a file". */
    buttonLabel = input('', ...(ngDevMode ? [{ debugName: "buttonLabel" }] : []));
    /** Takes several files at once. Accepts a bare attribute. */
    multiple = input(false, ...(ngDevMode ? [{ debugName: "multiple", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The file types the chooser offers, as the `accept` attribute takes them: `.csv`. */
    accept = input('', ...(ngDevMode ? [{ debugName: "accept" }] : []));
    /** Takes nothing, from the button or a drop. Accepts a bare attribute. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Files chosen or dropped: one when `multiple` is off, however many were dropped. */
    files = output();
    drop = new NxsFileDropTracker(() => !this.disabled());
    /**
     * The button's id, which also names the file input behind it. That input is hidden from
     * assistive technology and out of the Tab sequence, so the name is never announced; it states
     * which control the input stands behind, and gives it a label a template check can see.
     */
    buttonId = `nxs-dropzone-${nextId++}-button`;
    input = viewChild.required('picker');
    choose() {
        if (!this.disabled())
            this.input().nativeElement.click();
    }
    onPicked(event) {
        const picker = event.target;
        const files = Array.from(picker.files ?? []);
        picker.value = '';
        this.emit(files);
    }
    onDrop(event) {
        this.emit(this.drop.drop(event));
    }
    emit(files) {
        if (files.length === 0 || this.disabled())
            return;
        this.files.emit(this.multiple() ? files : files.slice(0, 1));
    }
    static ɵfac = function NxsDropzoneComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDropzoneComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDropzoneComponent, selectors: [["nxs-dropzone"]], viewQuery: function NxsDropzoneComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.input, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-dropzone"], hostVars: 4, hostBindings: function NxsDropzoneComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("dragenter", function NxsDropzoneComponent_dragenter_HostBindingHandler($event) { return ctx.drop.enter($event); })("dragover", function NxsDropzoneComponent_dragover_HostBindingHandler($event) { return ctx.drop.overTarget($event); })("dragleave", function NxsDropzoneComponent_dragleave_HostBindingHandler($event) { return ctx.drop.leave($event); })("drop", function NxsDropzoneComponent_drop_HostBindingHandler($event) { return ctx.onDrop($event); });
        } if (rf & 2) {
            i0.ɵɵclassProp("nxs-dropzone--over", ctx.drop.over())("nxs-dropzone--disabled", ctx.disabled());
        } }, inputs: { label: [1, "label"], buttonLabel: [1, "buttonLabel"], multiple: [1, "multiple"], accept: [1, "accept"], disabled: [1, "disabled"] }, outputs: { files: "files" }, decls: 9, vars: 10, consts: [["picker", ""], ["aria-hidden", "true", 1, "nxs-dropzone__icon"], [1, "nxs-dropzone__label"], ["mat-stroked-button", "", "type", "button", 1, "nxs-dropzone__button", 3, "click", "id", "disabled"], ["type", "file", "tabindex", "-1", "aria-hidden", "true", 1, "nxs-dropzone__input", 3, "change", "multiple", "disabled"]], template: function NxsDropzoneComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "mat-icon", 1);
            i0.ɵɵtext(1, "upload_file");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "span", 2);
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "button", 3);
            i0.ɵɵlistener("click", function NxsDropzoneComponent_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.choose()); });
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "input", 4, 0);
            i0.ɵɵlistener("change", function NxsDropzoneComponent_Template_input_change_7_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onPicked($event)); });
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.label());
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.buttonId)("disabled", ctx.disabled());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.buttonLabel().trim() || i0.ɵɵpipeBind1(6, 8, ctx.multiple() ? "satori-components.dropzone.choose-files" : "satori-components.dropzone.choose-file"), "\n");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("multiple", ctx.multiple())("disabled", ctx.disabled());
            i0.ɵɵattribute("aria-labelledby", ctx.buttonId)("accept", ctx.accept() || null);
        } }, dependencies: [MatButtonModule, i1.MatButton, MatIconModule, i2.MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 24px 16px;\n  border: 2px dashed var(--mat-sys-outline-variant);\n  border-radius: 12px;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n  text-align: center;\n  transition:\n    border-color 0.15s,\n    background-color 0.15s;\n}\n\n.nxs-dropzone--over[_nghost-%COMP%] {\n  border-color: var(--mat-sys-primary);\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n}\n\n.nxs-dropzone--disabled[_nghost-%COMP%] {\n  opacity: 0.6;\n}\n\n.nxs-dropzone__icon[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  font-size: 32px;\n}\n\n.nxs-dropzone__input[_ngcontent-%COMP%] {\n  display: none;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDropzoneComponent, [{
        type: Component,
        args: [{ selector: 'nxs-dropzone', standalone: true, imports: [MatButtonModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                    class: 'nxs-dropzone',
                    '[class.nxs-dropzone--over]': 'drop.over()',
                    '[class.nxs-dropzone--disabled]': 'disabled()',
                    '(dragenter)': 'drop.enter($event)',
                    '(dragover)': 'drop.overTarget($event)',
                    '(dragleave)': 'drop.leave($event)',
                    '(drop)': 'onDrop($event)',
                }, template: "<mat-icon class=\"nxs-dropzone__icon\" aria-hidden=\"true\">upload_file</mat-icon>\n<span class=\"nxs-dropzone__label\">{{ label() }}</span>\n<button\n  mat-stroked-button\n  type=\"button\"\n  class=\"nxs-dropzone__button\"\n  [id]=\"buttonId\"\n  [disabled]=\"disabled()\"\n  (click)=\"choose()\"\n>\n  {{\n    buttonLabel().trim() ||\n      ((multiple()\n        ? 'satori-components.dropzone.choose-files'\n        : 'satori-components.dropzone.choose-file'\n      ) | translate)\n  }}\n</button>\n<input\n  #picker\n  type=\"file\"\n  class=\"nxs-dropzone__input\"\n  tabindex=\"-1\"\n  aria-hidden=\"true\"\n  [attr.aria-labelledby]=\"buttonId\"\n  [multiple]=\"multiple()\"\n  [attr.accept]=\"accept() || null\"\n  [disabled]=\"disabled()\"\n  (change)=\"onPicked($event)\"\n/>\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 24px 16px;\n  border: 2px dashed var(--mat-sys-outline-variant);\n  border-radius: 12px;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface-variant);\n  text-align: center;\n  transition:\n    border-color 0.15s,\n    background-color 0.15s;\n}\n\n:host(.nxs-dropzone--over) {\n  border-color: var(--mat-sys-primary);\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n}\n\n:host(.nxs-dropzone--disabled) {\n  opacity: 0.6;\n}\n\n.nxs-dropzone__icon {\n  width: 32px;\n  height: 32px;\n  font-size: 32px;\n}\n\n.nxs-dropzone__input {\n  display: none;\n}\n"] }]
    }], null, { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], buttonLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "buttonLabel", required: false }] }], multiple: [{ type: i0.Input, args: [{ isSignal: true, alias: "multiple", required: false }] }], accept: [{ type: i0.Input, args: [{ isSignal: true, alias: "accept", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], files: [{ type: i0.Output, args: ["files"] }], input: [{ type: i0.ViewChild, args: ['picker', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDropzoneComponent, { className: "NxsDropzoneComponent", filePath: "libs/shared/satori-components/src/lib/dropzone/dropzone.component.ts", lineNumber: 41 }); })();
