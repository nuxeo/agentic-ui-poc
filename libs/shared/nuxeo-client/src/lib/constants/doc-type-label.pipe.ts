import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { docTypeLabel } from './doc-type-labels';

/**
 * `{{ doc.type | docTypeLabel }}` — the translated name of a document type, or the type's own name
 * for a custom type the catalogue does not know.
 *
 * Impure for the same reason as `TranslatePipe`: `translate.instant` is not reactive, so a pure
 * pipe would keep the language that was active when it first ran.
 */
@Pipe({
  name: 'docTypeLabel',
  standalone: true,
  pure: false,
})
export class DocTypeLabelPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(type: string | null | undefined): string {
    if (!type) return '';
    return docTypeLabel(type, (key) => this.translate.instant(key));
  }
}
