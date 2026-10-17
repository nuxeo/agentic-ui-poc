import { Pipe, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { docTypeLabel } from './doc-type-labels';
import * as i0 from "@angular/core";
/**
 * `{{ doc.type | docTypeLabel }}` — the translated name of a document type, or the type's own name
 * for a custom type the catalogue does not know.
 *
 * Impure for the same reason as `TranslatePipe`: `translate.instant` is not reactive, so a pure
 * pipe would keep the language that was active when it first ran.
 */
export class DocTypeLabelPipe {
    translate = inject(TranslateService);
    transform(type) {
        if (!type)
            return '';
        return docTypeLabel(type, (key) => this.translate.instant(key));
    }
    static ɵfac = function DocTypeLabelPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocTypeLabelPipe)(); };
    static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "docTypeLabel", type: DocTypeLabelPipe, pure: false });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocTypeLabelPipe, [{
        type: Pipe,
        args: [{
                name: 'docTypeLabel',
                standalone: true,
                pure: false,
            }]
    }], null, null); })();
