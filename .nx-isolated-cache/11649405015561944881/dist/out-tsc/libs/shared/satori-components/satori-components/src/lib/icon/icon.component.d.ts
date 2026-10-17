import * as i0 from "@angular/core";
/**
 * One icon, by its Material Icons ligature (`folder`, `description`, `collections_bookmark`).
 *
 * Decorative unless given a `label`: an icon beside text that already says the same thing is
 * hidden from assistive technology, and an icon that stands alone is an image with that name.
 *
 * Sized by `--nxs-icon-size` (24px by default) and coloured by `color`, both inherited, so a host
 * sets them on the element or on any ancestor — including through `nxs-doc-type-icon`.
 */
export declare class NxsIconComponent {
    /** The Material Icons ligature. */
    readonly name: import("@angular/core").InputSignal<string>;
    /** What the icon means, already translated. Blank makes it decorative. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    protected readonly accessibleName: import("@angular/core").Signal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsIconComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsIconComponent, "nxs-icon", never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=icon.component.d.ts.map