import * as i0 from "@angular/core";
/**
 * The indeterminate loader for a region waiting on data — a list, a tab, a panel, a dialog body.
 *
 * It is either named or decorative, never neither. With a `label` it is a progressbar carrying that
 * accessible name. Without one it is hidden from assistive technology, so use it bare only where
 * visible text beside it already says what is loading ("Checking Nuxeo Drive…"). A progressbar with
 * no name fails axe's `aria-progressbar-name`.
 *
 * Not for inside a button: a spinner there reflows the label. Rotate the button's icon instead —
 * `AGENTS/08-bug-patterns.md`, pattern 15.
 */
export declare class NxsSpinnerComponent {
    /** Diameter in pixels. Accepts a static attribute, `diameter="36"`. */
    readonly diameter: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** What is loading, already translated. Blank makes the spinner decorative. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    protected readonly name: import("@angular/core").Signal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSpinnerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSpinnerComponent, "nxs-spinner", never, { "diameter": { "alias": "diameter"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=spinner.component.d.ts.map