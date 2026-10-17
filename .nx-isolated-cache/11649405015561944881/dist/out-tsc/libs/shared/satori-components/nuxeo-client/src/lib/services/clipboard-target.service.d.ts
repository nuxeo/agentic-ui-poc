import type { NuxeoDocument } from '../models/document.model';
import * as i0 from "@angular/core";
/**
 * Current browse folder used as the paste target for clipboard Copy/Move (Web UI: `target-document`).
 * Updated by {@link BrowseComponent} while the user is browsing.
 */
export declare class ClipboardTargetService {
    readonly target: import("@angular/core").WritableSignal<NuxeoDocument | null>;
    setTarget(doc: NuxeoDocument | null): void;
    clear(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ClipboardTargetService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ClipboardTargetService>;
}
//# sourceMappingURL=clipboard-target.service.d.ts.map