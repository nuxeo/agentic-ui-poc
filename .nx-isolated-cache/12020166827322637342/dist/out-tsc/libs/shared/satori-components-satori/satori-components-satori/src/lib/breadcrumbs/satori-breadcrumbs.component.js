import { ChangeDetectionStrategy, Component, ElementRef, afterEveryRender, computed, inject, input, } from '@angular/core';
import { SatBreadcrumbs } from '@hylandsoftware/satori-ui/breadcrumbs';
import { nxsVisibleText, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
const _c0 = a0 => [a0];
function NxsSatoriBreadcrumbsComponent_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "sat-breadcrumbs", 0);
} if (rf & 2) {
    const trail_r1 = ctx.$implicit;
    i0.ɵɵproperty("items", trail_r1);
} }
/**
 * `nxs.primitives.breadcrumbs` on Satori's `sat-breadcrumbs`, which collapses a long trail.
 *
 * Needs `provideSatori()` for the chevron icon, and Satori's `sat.*` catalogue loaded into
 * ngx-translate for the "Show more breadcrumbs" button, and for the landmark's name when `label`
 * is blank.
 */
export class NxsSatoriBreadcrumbsComponent {
    items = input.required(...(ngDevMode ? [{ debugName: "items" }] : []));
    /** The landmark's accessible name, already translated. Blank keeps Satori's own name. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    satoriItems = computed(() => this.items().map(toSatori), ...(ngDevMode ? [{ debugName: "satoriItems" }] : []));
    host = inject(ElementRef);
    /** The name Satori last wrote on its landmark, and the one this component left there. */
    satoriName = null;
    shownName = null;
    constructor() {
        // `sat-breadcrumbs` has no input for its landmark's name: its template binds the `<nav>` to its
        // own catalogue entry and writes it again whenever that translation changes. So it is set
        // after every render — to our label, or back to Satori's when the label is blank.
        afterEveryRender({
            write: () => {
                const nav = this.host.nativeElement.querySelector('nav');
                if (!nav)
                    return;
                const current = nav.getAttribute('aria-label');
                if (current !== this.shownName)
                    this.satoriName = current;
                this.shownName = nxsVisibleText(this.label()) || this.satoriName;
                if (this.shownName === null)
                    nav.removeAttribute('aria-label');
                else if (this.shownName !== current)
                    nav.setAttribute('aria-label', this.shownName);
            },
        });
    }
    static ɵfac = function NxsSatoriBreadcrumbsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSatoriBreadcrumbsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSatoriBreadcrumbsComponent, selectors: [["nxs-satori-breadcrumbs"]], hostAttrs: [1, "nxs-satori-breadcrumbs", 2, "display", "block"], inputs: { items: [1, "items"], label: [1, "label"] }, decls: 2, vars: 2, consts: [[3, "items"]], template: function NxsSatoriBreadcrumbsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵrepeaterCreate(0, NxsSatoriBreadcrumbsComponent_For_1_Template, 1, 1, "sat-breadcrumbs", 0, i0.ɵɵrepeaterTrackByIdentity);
        } if (rf & 2) {
            i0.ɵɵrepeater(i0.ɵɵpureFunction1(0, _c0, ctx.satoriItems()));
        } }, dependencies: [SatBreadcrumbs], encapsulation: 2, changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSatoriBreadcrumbsComponent, [{
        type: Component,
        args: [{ selector: 'nxs-satori-breadcrumbs', standalone: true, imports: [SatBreadcrumbs], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-satori-breadcrumbs', style: 'display: block' }, template: "<!-- Satori fits a trail to its box only when it starts or the box resizes, so each new trail gets a\n     new sat-breadcrumbs, which measures it. -->\n@for (trail of [satoriItems()]; track trail) {\n  <sat-breadcrumbs [items]=\"trail\" />\n}\n" }]
    }], () => [], { items: [{ type: i0.Input, args: [{ isSignal: true, alias: "items", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSatoriBreadcrumbsComponent, { className: "NxsSatoriBreadcrumbsComponent", filePath: "libs/shared/satori-components-satori/src/lib/breadcrumbs/satori-breadcrumbs.component.ts", lineNumber: 32 }); })();
function toSatori(item) {
    if (item.routerLink !== undefined) {
        return {
            label: item.label,
            routerLink: typeof item.routerLink === 'string' ? item.routerLink : [...item.routerLink],
            queryParams: item.queryParams ? { ...item.queryParams } : undefined,
        };
    }
    if (item.href !== undefined)
        return { label: item.label, href: item.href };
    return { label: item.label };
}
//# sourceMappingURL=satori-breadcrumbs.component.js.map