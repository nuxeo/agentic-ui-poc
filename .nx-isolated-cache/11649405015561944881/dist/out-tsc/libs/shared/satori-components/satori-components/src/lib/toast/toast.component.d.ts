import type { NxsToastAction } from './toast.service';
import * as i0 from "@angular/core";
/** What `NxsToastService` hands the toast it opens. */
export interface NxsToastData {
    readonly message: string;
    readonly kind: 'info' | 'error';
    readonly action: NxsToastAction | null;
}
/**
 * The content of one toast: the message, an optional action and a Dismiss button.
 *
 * Opened by `NxsToastService`, never placed in a template. `MatSnackBar` moves this content into
 * its live region after it opens, so the message is announced with the politeness the service chose.
 */
export declare class NxsToastComponent {
    protected readonly data: NxsToastData;
    private readonly ref;
    protected act(): void;
    /**
     * Escape stops here: a snack-bar overlay subscribes to no keydown, so the CDK would hand the event
     * on to a dialog underneath and close it too — losing a form the toast was reporting on.
     */
    protected dismiss(event?: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsToastComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsToastComponent, "nxs-toast", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=toast.component.d.ts.map