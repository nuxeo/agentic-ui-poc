import { nxsVisibleText, nxsInitials, NXS_PRIMITIVE_IDS } from '@nuxeo/satori-platform/components';
import { provideSatoriExtensions } from '@nuxeo/satori-platform/extensions';
import * as i0 from '@angular/core';
import { input, computed, ChangeDetectionStrategy, Component, inject, ElementRef, afterEveryRender } from '@angular/core';
import { SatAvatar } from '@hylandsoftware/satori-ui/avatar';
import { SatBreadcrumbs } from '@hylandsoftware/satori-ui/breadcrumbs';
import * as i1 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i2 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import { SatRichTooltip, SatRichTooltipContent, SatRichTooltipTitle, SatRichTooltipTrigger } from '@hylandsoftware/satori-ui/rich-tooltip';
import { SatCategoryTag } from '@hylandsoftware/satori-ui/tag';

/**
 * `nxs.primitives.avatar` on Satori's `sat-avatar`, with the same accessible name as Material's.
 *
 * `sat-avatar` is itself `role="img"` and takes no name, so this host is the one image and
 * `sat-avatar` is presentational inside it.
 */
class NxsSatoriAvatarComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriAvatarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsSatoriAvatarComponent, isStandalone: true, selector: "nxs-satori-avatar", inputs: { initials: { classPropertyName: "initials", publicName: "initials", isSignal: true, isRequired: true, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "attr.role": "name() ? 'img' : null", "attr.aria-label": "name() || null", "attr.aria-hidden": "name() ? null : 'true'" }, styleAttribute: "display: inline-flex", classAttribute: "nxs-satori-avatar" }, ngImport: i0, template: "<sat-avatar role=\"presentation\" [category]=\"color()\" [size]=\"size()\" [initials]=\"shownInitials()\" />\n", dependencies: [{ kind: "component", type: SatAvatar, selector: "sat-avatar", inputs: ["category", "size", "indicator", "initials", "borderless"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriAvatarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-satori-avatar', standalone: true, imports: [SatAvatar], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        class: 'nxs-satori-avatar',
                        style: 'display: inline-flex',
                        '[attr.role]': "name() ? 'img' : null",
                        '[attr.aria-label]': 'name() || null',
                        '[attr.aria-hidden]': "name() ? null : 'true'",
                    }, template: "<sat-avatar role=\"presentation\" [category]=\"color()\" [size]=\"size()\" [initials]=\"shownInitials()\" />\n" }]
        }], propDecorators: { initials: [{ type: i0.Input, args: [{ isSignal: true, alias: "initials", required: true }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/**
 * `nxs.primitives.breadcrumbs` on Satori's `sat-breadcrumbs`, which collapses a long trail.
 *
 * Needs `provideSatori()` for the chevron icon, and Satori's `sat.*` catalogue loaded into
 * ngx-translate for the "Show more breadcrumbs" button, and for the landmark's name when `label`
 * is blank.
 */
class NxsSatoriBreadcrumbsComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriBreadcrumbsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsSatoriBreadcrumbsComponent, isStandalone: true, selector: "nxs-satori-breadcrumbs", inputs: { items: { classPropertyName: "items", publicName: "items", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { styleAttribute: "display: block", classAttribute: "nxs-satori-breadcrumbs" }, ngImport: i0, template: "<!-- Satori fits a trail to its box only when it starts or the box resizes, so each new trail gets a\n     new sat-breadcrumbs, which measures it. -->\n@for (trail of [satoriItems()]; track trail) {\n  <sat-breadcrumbs [items]=\"trail\" />\n}\n", dependencies: [{ kind: "component", type: SatBreadcrumbs, selector: "sat-breadcrumbs", inputs: ["items"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriBreadcrumbsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-satori-breadcrumbs', standalone: true, imports: [SatBreadcrumbs], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-satori-breadcrumbs', style: 'display: block' }, template: "<!-- Satori fits a trail to its box only when it starts or the box resizes, so each new trail gets a\n     new sat-breadcrumbs, which measures it. -->\n@for (trail of [satoriItems()]; track trail) {\n  <sat-breadcrumbs [items]=\"trail\" />\n}\n" }]
        }], ctorParameters: () => [], propDecorators: { items: [{ type: i0.Input, args: [{ isSignal: true, alias: "items", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });
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

/** `nxs.primitives.richTooltip` on Satori's rich tooltip, which opens on hover and focus. */
class NxsSatoriRichTooltipComponent {
    heading = input.required(...(ngDevMode ? [{ debugName: "heading" }] : []));
    content = input.required(...(ngDevMode ? [{ debugName: "content" }] : []));
    triggerLabel = input.required(...(ngDevMode ? [{ debugName: "triggerLabel" }] : []));
    icon = input('info', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriRichTooltipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsSatoriRichTooltipComponent, isStandalone: true, selector: "nxs-satori-rich-tooltip", inputs: { heading: { classPropertyName: "heading", publicName: "heading", isSignal: true, isRequired: true, transformFunction: null }, content: { classPropertyName: "content", publicName: "content", isSignal: true, isRequired: true, transformFunction: null }, triggerLabel: { classPropertyName: "triggerLabel", publicName: "triggerLabel", isSignal: true, isRequired: true, transformFunction: null }, icon: { classPropertyName: "icon", publicName: "icon", isSignal: true, isRequired: false, transformFunction: null } }, host: { styleAttribute: "display: inline-block", classAttribute: "nxs-satori-rich-tooltip" }, ngImport: i0, template: "<button\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-satori-rich-tooltip__trigger\"\n  [attr.aria-label]=\"triggerLabel()\"\n  [satRichTooltipTriggerFor]=\"tooltip\"\n>\n  <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n</button>\n<sat-rich-tooltip #tooltip=\"satRichTooltip\">\n  <sat-rich-tooltip-title>{{ heading() }}</sat-rich-tooltip-title>\n  <sat-rich-tooltip-content>{{ content() }}</sat-rich-tooltip-content>\n</sat-rich-tooltip>\n", dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: SatRichTooltip, selector: "sat-rich-tooltip", inputs: ["id", "aria-label", "aria-labelledby", "aria-describedby", "role", "positionX", "positionY", "behavior", "scrollStrategy", "showDelay", "hideDelay", "overlapTrigger", "targetOffsetX", "targetOffsetY", "closeOnClick", "disableAnimation", "focusTrapEnabled", "focusTrapAutoCaptureEnabled"], outputs: ["closed", "close"], exportAs: ["satRichTooltip"] }, { kind: "component", type: SatRichTooltipContent, selector: "sat-rich-tooltip-content", inputs: ["aria-label"] }, { kind: "component", type: SatRichTooltipTitle, selector: "sat-rich-tooltip-title", inputs: ["aria-label"] }, { kind: "directive", type: SatRichTooltipTrigger, selector: "[satRichTooltipTriggerFor]", inputs: ["satRichTooltipTriggerFor", "satRichTooltipDisabled", "satRichTooltipBackdropCloseOnClick"], outputs: ["tooltipOpened", "tooltipClosed"], exportAs: ["satRichTooltipTrigger"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriRichTooltipComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-satori-rich-tooltip', standalone: true, imports: [
                        MatButtonModule,
                        MatIconModule,
                        SatRichTooltip,
                        SatRichTooltipContent,
                        SatRichTooltipTitle,
                        SatRichTooltipTrigger,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-satori-rich-tooltip', style: 'display: inline-block' }, template: "<button\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-satori-rich-tooltip__trigger\"\n  [attr.aria-label]=\"triggerLabel()\"\n  [satRichTooltipTriggerFor]=\"tooltip\"\n>\n  <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n</button>\n<sat-rich-tooltip #tooltip=\"satRichTooltip\">\n  <sat-rich-tooltip-title>{{ heading() }}</sat-rich-tooltip-title>\n  <sat-rich-tooltip-content>{{ content() }}</sat-rich-tooltip-content>\n</sat-rich-tooltip>\n" }]
        }], propDecorators: { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: true }] }], content: [{ type: i0.Input, args: [{ isSignal: true, alias: "content", required: true }] }], triggerLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "triggerLabel", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }] } });

/** `nxs.primitives.tag` on Satori's `sat-category-tag`. */
class NxsSatoriTagComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    color = input('gray', ...(ngDevMode ? [{ debugName: "color" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriTagComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsSatoriTagComponent, isStandalone: true, selector: "nxs-satori-tag", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null } }, host: { styleAttribute: "display: inline-flex", classAttribute: "nxs-satori-tag" }, ngImport: i0, template: "<sat-category-tag [category]=\"color()\">{{ label() }}</sat-category-tag>\n", dependencies: [{ kind: "component", type: SatCategoryTag, selector: "sat-category-tag", inputs: ["category"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSatoriTagComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-satori-tag', standalone: true, imports: [SatCategoryTag], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-satori-tag', style: 'display: inline-flex' }, template: "<sat-category-tag [category]=\"color()\">{{ label() }}</sat-category-tag>\n" }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }] } });

/**
 * Re-register the avatar, breadcrumbs, tag and rich tooltip `NXS_PRIMITIVE_IDS` on Satori, over the
 * Material implementations `provideNxsComponents()` registered.
 *
 * `NXS_PRIMITIVE_IDS.errorState` is left on Material: Satori's `sat-401-` to `sat-500-error-state`
 * ship only in Satori 1.0, which needs Angular 22, and the Satori this package can install has no
 * error state. Registering one here is the whole change once it can.
 *
 * Satori-if-available, Material otherwise, decided by which providers an application lists — not
 * at build time and not by a runtime probe. This entry point is the only one in the package that
 * imports `@hylandsoftware/satori-ui`, an optional peer, so an application without GitHub Packages
 * access never imports it and still gets every ID from `@nuxeo/satori-platform/components`.
 *
 * List it after `provideNxsComponents()`, because later registrations win. The Satori components
 * also need what any Satori host provides: `provideSatori()` from
 * `@hylandsoftware/satori-ui/providers` for the theme and icons, and Satori's `sat.*` catalogue in
 * ngx-translate — `provideAndConfigureSatoriUITranslations` from `@hylandsoftware/satori-ui/translations`,
 * or seeded into your own loader as `apps/nuxeo-ui` does. Without the catalogue, the breadcrumbs'
 * landmark and the tooltip's close hint render as raw keys.
 */
function provideNxsSatoriComponents() {
    return provideSatoriExtensions({
        components: {
            [NXS_PRIMITIVE_IDS.avatar]: NxsSatoriAvatarComponent,
            [NXS_PRIMITIVE_IDS.breadcrumbs]: NxsSatoriBreadcrumbsComponent,
            [NXS_PRIMITIVE_IDS.tag]: NxsSatoriTagComponent,
            [NXS_PRIMITIVE_IDS.richTooltip]: NxsSatoriRichTooltipComponent,
        },
    });
}

/**
 * Generated bundle index. Do not edit.
 */

export { provideNxsSatoriComponents };
//# sourceMappingURL=nuxeo-satori-platform-components-satori.mjs.map
