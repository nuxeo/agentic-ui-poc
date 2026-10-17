import type { NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import type { ExtensionRuleContext } from './extension-rules';
import * as i0 from "@angular/core";
/**
 * The live rule context, as signals.
 *
 * Rules need the focused document, the selection, the signed-in user and the
 * current URL. Those are owned by four different places in the shell, and a
 * slot consumer should not have to know any of them — it asks for
 * `context()` and re-resolves when it changes.
 *
 * The shell writes into this service; slot consumers only read. Keeping the
 * writes in one place is what stops the toolbar and the bulk bar disagreeing
 * about what is selected.
 */
export declare class ExtensionRuleContextService {
    readonly document: import("@angular/core").WritableSignal<NuxeoDocument | null>;
    readonly selection: import("@angular/core").WritableSignal<readonly NuxeoDocument[]>;
    readonly selectionCount: import("@angular/core").WritableSignal<number>;
    readonly username: import("@angular/core").WritableSignal<string | null>;
    readonly isAdministrator: import("@angular/core").WritableSignal<boolean>;
    readonly url: import("@angular/core").WritableSignal<string>;
    /**
     * Interface state published by whichever surface is in focus. See
     * {@link ExtensionRuleContext.flags}.
     *
     * The publishing surface owns the whole bag and must clear it on destroy, the
     * same contract `document` already has: a stale `favorite: true` left behind
     * by a closed document would gate the next surface's actions on it.
     */
    readonly flags: import("@angular/core").WritableSignal<Readonly<Record<string, boolean>>>;
    readonly context: import("@angular/core").Signal<ExtensionRuleContext>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ExtensionRuleContextService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ExtensionRuleContextService>;
}
//# sourceMappingURL=extension-rule-context.service.d.ts.map