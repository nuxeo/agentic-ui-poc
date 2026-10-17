import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SatAvatar } from '@hylandsoftware/satori-ui/avatar';
import { nxsInitials, nxsVisibleText, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
/**
 * `nxs.primitives.avatar` on Satori's `sat-avatar`, with the same accessible name as Material's.
 *
 * `sat-avatar` is itself `role="img"` and takes no name, so this host is the one image and
 * `sat-avatar` is presentational inside it.
 */
export class NxsSatoriAvatarComponent {
    initials = input.required(...(ngDevMode ? [{ debugName: "initials" }] : []));
    color = input('blue', ...(ngDevMode ? [{ debugName: "color" }] : []));
    size = input('36', ...(ngDevMode ? [{ debugName: "size" }] : []));
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Material's rule: the label as a reader gets it, and blank means decorative. */
    name = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "name" }] : []));
    /**
     * Material's display value, never empty: at size 24 `sat-avatar` reads `initials()[0]`, which
     * throws on an empty string inside change detection, and would split an emoji there. So size 24
     * gets one whole initial, as Material's does, and a space renders the blank circle Material
     * renders for blank initials.
     */
    shownInitials = computed(() => nxsInitials(this.initials(), this.size() === '24' ? 1 : 2) || ' ', ...(ngDevMode ? [{ debugName: "shownInitials" }] : []));
    static ɵfac = function NxsSatoriAvatarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSatoriAvatarComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSatoriAvatarComponent, selectors: [["nxs-satori-avatar"]], hostAttrs: [1, "nxs-satori-avatar", 2, "display", "inline-flex"], hostVars: 3, hostBindings: function NxsSatoriAvatarComponent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("role", ctx.name() ? "img" : null)("aria-label", ctx.name() || null)("aria-hidden", ctx.name() ? null : "true");
        } }, inputs: { initials: [1, "initials"], color: [1, "color"], size: [1, "size"], label: [1, "label"] }, decls: 1, vars: 3, consts: [["role", "presentation", 3, "category", "size", "initials"]], template: function NxsSatoriAvatarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "sat-avatar", 0);
        } if (rf & 2) {
            i0.ɵɵproperty("category", ctx.color())("size", ctx.size())("initials", ctx.shownInitials());
        } }, dependencies: [SatAvatar], encapsulation: 2, changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSatoriAvatarComponent, [{
        type: Component,
        args: [{ selector: 'nxs-satori-avatar', standalone: true, imports: [SatAvatar], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                    class: 'nxs-satori-avatar',
                    style: 'display: inline-flex',
                    '[attr.role]': "name() ? 'img' : null",
                    '[attr.aria-label]': 'name() || null',
                    '[attr.aria-hidden]': "name() ? null : 'true'",
                }, template: "<sat-avatar role=\"presentation\" [category]=\"color()\" [size]=\"size()\" [initials]=\"shownInitials()\" />\n" }]
    }], null, { initials: [{ type: i0.Input, args: [{ isSignal: true, alias: "initials", required: true }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSatoriAvatarComponent, { className: "NxsSatoriAvatarComponent", filePath: "libs/shared/satori-components-satori/src/lib/avatar/satori-avatar.component.ts", lineNumber: 31 }); })();
