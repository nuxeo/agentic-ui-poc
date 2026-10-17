import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * `{{ doc.type | docTypeLabel }}` — the translated name of a document type, or the type's own name
 * for a custom type the catalogue does not know.
 *
 * Impure for the same reason as `TranslatePipe`: `translate.instant` is not reactive, so a pure
 * pipe would keep the language that was active when it first ran.
 */
export declare class DocTypeLabelPipe implements PipeTransform {
    private readonly translate;
    transform(type: string | null | undefined): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DocTypeLabelPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<DocTypeLabelPipe, "docTypeLabel", true>;
}
//# sourceMappingURL=doc-type-label.pipe.d.ts.map