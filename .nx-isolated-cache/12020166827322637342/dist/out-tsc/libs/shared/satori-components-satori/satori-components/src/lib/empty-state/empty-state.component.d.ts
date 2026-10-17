import { type InputSignal } from '@angular/core';
import type { NxsHeadingLevel } from '../heading-level';
import * as i0 from "@angular/core";
/**
 * The "nothing here" state for a list, panel or result set.
 *
 * Text arrives already translated — the library ships no catalogue of its own — so a caller
 * binds `[heading]="'browse.empty' | translate"`. Actions are projected, so a "Create" or
 * "Clear filters" button stays the caller's, wired to the caller's action.
 */
export declare class NxsEmptyStateComponent {
    /** What is empty, in one line. */
    readonly heading: InputSignal<string>;
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`. Set it to fit
     * where the component sits — one below the heading of the section it empties — so heading
     * navigation stays in order.
     */
    readonly headingLevel: InputSignal<NxsHeadingLevel>;
    /** An optional second line — usually what to do next. Not rendered when blank. */
    readonly message: InputSignal<string>;
    /** An optional Material icon ligature. Decorative, so hidden from assistive technology. */
    readonly icon: InputSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsEmptyStateComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsEmptyStateComponent, "nxs-empty-state", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "message": { "alias": "message"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=empty-state.component.d.ts.map