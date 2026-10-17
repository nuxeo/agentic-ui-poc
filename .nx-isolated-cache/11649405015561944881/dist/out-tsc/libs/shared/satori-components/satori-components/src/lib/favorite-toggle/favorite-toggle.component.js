import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, model, output, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentDetailService } from '@nuxeo/satori-platform/nuxeo-client';
import { nxsToggleFavorite } from './toggle-favorite';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/tooltip";
/**
 * The star that adds a document to the user's favorites or removes it — Web UI's
 * `nuxeo-favorites-toggle-button`.
 *
 * A toggle button: its accessible name stays "Favorite" and `aria-pressed` carries the state, while
 * the tooltip says what a press will do. It runs the operation itself and reports the outcome, so
 * the host decides what to tell the user — Web UI's application, not its button, shows the toast.
 * A click does not reach the row or card it sits in.
 */
export class NxsFavoriteToggleComponent {
    /** The document to add or remove. */
    documentId = input.required(...(ngDevMode ? [{ debugName: "documentId" }] : []));
    /** Whether it is a favorite now. Two-way: the toggle updates it once the server confirms. */
    favorite = model(false, ...(ngDevMode ? [{ debugName: "favorite" }] : []));
    /** Shown but not pressable — an enabled rule said no. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : []));
    /** The server confirmed the change; carries the new state. */
    changed = output();
    /** The server refused; `favorite` is unchanged. Carries the error. */
    failed = output();
    /**
     * A request is in flight for the document shown. The button stays focusable and ignores presses
     * until it answers; bound to another document, it is free again.
     */
    busy = computed(() => this.pending() === this.documentId(), ...(ngDevMode ? [{ debugName: "busy" }] : []));
    /** The document a request is in flight for. */
    pending = signal(null, ...(ngDevMode ? [{ debugName: "pending" }] : []));
    documents = inject(DocumentDetailService);
    destroyRef = inject(DestroyRef);
    /** Adds or removes the document. Ignored while disabled or while a request is in flight. */
    toggle() {
        const documentId = this.documentId();
        if (!documentId || this.disabled() || this.busy())
            return;
        this.pending.set(documentId);
        nxsToggleFavorite(this.documents, documentId, this.favorite())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (favorite) => this.settle(documentId, () => {
                this.favorite.set(favorite);
                this.changed.emit(favorite);
            }),
            error: (error) => this.settle(documentId, () => this.failed.emit(error)),
        });
    }
    /** Ends the request for `documentId`, and reports it only if that is still the document bound. */
    settle(documentId, report) {
        if (this.pending() === documentId)
            this.pending.set(null);
        if (documentId === this.documentId())
            report();
    }
    press(event) {
        event.stopPropagation();
        this.toggle();
    }
    static ɵfac = function NxsFavoriteToggleComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsFavoriteToggleComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsFavoriteToggleComponent, selectors: [["nxs-favorite-toggle"]], hostAttrs: [1, "nxs-favorite-toggle"], inputs: { documentId: [1, "documentId"], favorite: [1, "favorite"], disabled: [1, "disabled"] }, outputs: { favorite: "favoriteChange", changed: "changed", failed: "failed" }, decls: 5, vars: 12, consts: [["mat-icon-button", "", "type", "button", 1, "nxs-favorite-toggle__button", 3, "click", "matTooltip", "disabled"], ["aria-hidden", "true"]], template: function NxsFavoriteToggleComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "button", 0);
            i0.ɵɵpipe(1, "translate");
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵlistener("click", function NxsFavoriteToggleComponent_Template_button_click_0_listener($event) { return ctx.press($event); });
            i0.ɵɵelementStart(3, "mat-icon", 1);
            i0.ɵɵtext(4);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵclassProp("nxs-favorite-toggle__button--on", ctx.favorite());
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 8, ctx.favorite() ? "satori-components.favorite-toggle.remove" : "satori-components.favorite-toggle.add"))("disabled", ctx.disabled());
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 10, "satori-components.favorite-toggle.label"))("aria-pressed", ctx.favorite())("aria-busy", ctx.busy() || null);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.favorite() ? "star" : "star_border");
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, MatTooltipModule, i3.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: inline-flex;\n}\n\n//[_ngcontent-%COMP%]   Compact[_ngcontent-%COMP%], to[_ngcontent-%COMP%]   sit[_ngcontent-%COMP%]   among[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   card's[_ngcontent-%COMP%]   or[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   row's[_ngcontent-%COMP%]   other[_ngcontent-%COMP%]   icon[_ngcontent-%COMP%]   actions.\n.nxs-favorite-toggle__button[_ngcontent-%COMP%] {\n  --mat-icon-button-state-layer-size: 32px;\n  width: 32px;\n  height: 32px;\n  padding: 0;\n  color: var(--mat-sys-on-surface-variant);\n\n  .mat-icon {\n    width: 18px;\n    height: 18px;\n    font-size: 18px;\n  }\n}\n\n//[_ngcontent-%COMP%]   Web[_ngcontent-%COMP%]   UI[_ngcontent-%COMP%]   colours[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   pressed[_ngcontent-%COMP%]   toggle[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   activated-action[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]; here[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   theme's[_ngcontent-%COMP%]   primary,\n//[_ngcontent-%COMP%]   overridable[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   `--nxs-favorite-toggle-active-color`.\n.nxs-favorite-toggle__button--on[_ngcontent-%COMP%] {\n  color: var(--nxs-favorite-toggle-active-color, var(--mat-sys-primary));\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsFavoriteToggleComponent, [{
        type: Component,
        args: [{ selector: 'nxs-favorite-toggle', standalone: true, imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-favorite-toggle' }, template: "<button\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-favorite-toggle__button\"\n  [class.nxs-favorite-toggle__button--on]=\"favorite()\"\n  [attr.aria-label]=\"'satori-components.favorite-toggle.label' | translate\"\n  [attr.aria-pressed]=\"favorite()\"\n  [attr.aria-busy]=\"busy() || null\"\n  [matTooltip]=\"\n    (favorite()\n      ? 'satori-components.favorite-toggle.remove'\n      : 'satori-components.favorite-toggle.add'\n    ) | translate\n  \"\n  [disabled]=\"disabled()\"\n  (click)=\"press($event)\"\n>\n  <mat-icon aria-hidden=\"true\">{{ favorite() ? 'star' : 'star_border' }}</mat-icon>\n</button>\n", styles: [":host {\n  display: inline-flex;\n}\n\n// Compact, to sit among a card's or a row's other icon actions.\n.nxs-favorite-toggle__button {\n  --mat-icon-button-state-layer-size: 32px;\n  width: 32px;\n  height: 32px;\n  padding: 0;\n  color: var(--mat-sys-on-surface-variant);\n\n  .mat-icon {\n    width: 18px;\n    height: 18px;\n    font-size: 18px;\n  }\n}\n\n// Web UI colours a pressed toggle with its activated-action colour; here that is the theme's primary,\n// overridable with `--nxs-favorite-toggle-active-color`.\n.nxs-favorite-toggle__button--on {\n  color: var(--nxs-favorite-toggle-active-color, var(--mat-sys-primary));\n}\n"] }]
    }], null, { documentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentId", required: true }] }], favorite: [{ type: i0.Input, args: [{ isSignal: true, alias: "favorite", required: false }] }, { type: i0.Output, args: ["favoriteChange"] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], changed: [{ type: i0.Output, args: ["changed"] }], failed: [{ type: i0.Output, args: ["failed"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsFavoriteToggleComponent, { className: "NxsFavoriteToggleComponent", filePath: "libs/shared/satori-components/src/lib/favorite-toggle/favorite-toggle.component.ts", lineNumber: 40 }); })();
//# sourceMappingURL=favorite-toggle.component.js.map