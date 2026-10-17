import type { NxsHeadingLevel } from '../heading-level';
import type { NxsErrorStateInputs } from '../primitives';
import type { NxsErrorStatus } from './error-status';
import * as i0 from "@angular/core";
interface Variant {
    readonly icon: string;
    readonly heading: string;
    readonly message: string;
}
/**
 * What a region shows in place of content that failed to load — a listing, a page, a result set.
 *
 * One of four variants chosen by `status`, each with its own icon, heading and explanation; map a
 * failed request onto one with `nxsErrorStatus(error)`. A host that knows what failed ("Failed to
 * load folder contents.") passes it as `heading`, already translated, and the variant's explanation
 * stays underneath it.
 *
 * It is an alert because it replaces a loader the user was waiting on. Retry is offered only for a
 * server error, and only when the host asks for it: retrying a 401, 403 or 404 gets the same answer.
 * Anything else the host offers — "Go back" — is projected.
 *
 * Registered as `nxs.primitives.errorState`, so a customer can replace it by ID; a host rendering it
 * that way passes `retryHandler`, because the outlet binds no outputs.
 */
export declare class NxsErrorStateComponent implements NxsErrorStateInputs {
    /** Which variant: the HTTP status the failure stands for. */
    readonly status: import("@angular/core").InputSignal<NxsErrorStatus>;
    /** What failed, already translated. Blank, or only whitespace, shows the variant's own heading. */
    readonly heading: import("@angular/core").InputSignal<string>;
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`: one below the
     * heading of the section it replaces, or 1 when it replaces the whole page.
     */
    readonly headingLevel: import("@angular/core").InputSignal<NxsHeadingLevel>;
    /** Offer Retry for a server error. Accepts a bare attribute, `retryable`. */
    readonly retryable: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /**
     * Called when Retry is pressed, before `retry` is emitted — for a host that renders the component
     * by ID, where no output can be bound.
     */
    readonly retryHandler: import("@angular/core").InputSignal<(() => void) | null>;
    /** Retry was pressed. */
    readonly retry: import("@angular/core").OutputEmitterRef<void>;
    protected readonly variant: import("@angular/core").Signal<Variant>;
    /** The host's heading as a reader gets it: whitespace or zero-width characters alone are none. */
    protected readonly ownHeading: import("@angular/core").Signal<string>;
    protected readonly canRetry: import("@angular/core").Signal<boolean>;
    protected pressRetry(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsErrorStateComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsErrorStateComponent, "nxs-error-state", never, { "status": { "alias": "status"; "required": false; "isSignal": true; }; "heading": { "alias": "heading"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "retryable": { "alias": "retryable"; "required": false; "isSignal": true; }; "retryHandler": { "alias": "retryHandler"; "required": false; "isSignal": true; }; }, { "retry": "retry"; }, never, ["*"], true, never>;
}
export {};
//# sourceMappingURL=error-state.component.d.ts.map