import { type Provider } from '@angular/core';
import * as i0 from "@angular/core";
/** How long a toast stays, in milliseconds, unless the caller asks for longer. Web UI's default. */
export declare const NXS_TOAST_DURATION = 4000;
/** A button on a toast besides Dismiss — "Undo", "View". */
export interface NxsToastAction {
    /** What the button says, already translated. */
    readonly label: string;
    /** Runs when the button is pressed, just before the toast closes. */
    readonly run: () => void;
}
export interface NxsToastOptions {
    /**
     * How long the toast stays, in milliseconds. Anything shorter than `NXS_TOAST_DURATION` is raised
     * to it, and `0` keeps the toast until it is dismissed. Defaults to `NXS_TOAST_DURATION`, or to `0`
     * when the toast carries an action, so a keyboard user has time to reach the button.
     */
    readonly duration?: number;
    /** One button besides Dismiss. */
    readonly action?: NxsToastAction;
}
export interface NxsToastErrorOptions extends NxsToastOptions {
    /** Offers a translated "Retry" button that runs this. Takes the place of `action`. */
    readonly retry?: () => void;
}
/**
 * The one way the core slice tells a user that something happened.
 *
 * Every toast has a Dismiss button and closes on Escape. `show` is announced politely; `error` is
 * announced assertively, because the user is waiting on the action that failed. Messages arrive
 * already translated; only the toast's own buttons are translated here.
 *
 * Not a singleton: it holds no state, so each component lists `provideNxsToast()` in its own
 * `providers`, and Material's `MatSnackBar` underneath keeps one toast on screen at a time.
 */
export declare class NxsToastService {
    private readonly snackBar;
    private readonly translate;
    private readonly destroyRef;
    /** Something happened: saved, copied, moved to trash. */
    show(message: string, options?: NxsToastOptions): void;
    /** Something the user asked for did not happen. */
    error(message: string, options?: NxsToastErrorOptions): void;
    private open;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsToastService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NxsToastService>;
}
/** Lists `NxsToastService` in a component's `providers`. */
export declare function provideNxsToast(): Provider;
//# sourceMappingURL=toast.service.d.ts.map