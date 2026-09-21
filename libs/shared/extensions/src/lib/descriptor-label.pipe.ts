import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { descriptorLabel } from './extension-actions';

/** The two fields every Layer 1 descriptor carries for its text. */
export interface LabelledDescriptor {
  readonly label: string;
  readonly labelKey?: string;
}

/**
 * A descriptor's text, with the literal `label` as a real fallback.
 *
 * ## What this replaces, and why it is a pipe rather than a convention
 *
 * Thirty-eight templates wrote the fallback by hand:
 *
 * ```html
 * {{ item.labelKey ? (item.labelKey | translate) : item.label }}
 * ```
 *
 * That is not a fallback. ngx-translate returns an unresolved key **unchanged**, so when the app
 * catalogue has not loaded — the compiled fallback map holds accessible names only, not visible
 * nav labels — every one of those bindings rendered `nav.browse` at the user instead of `Browse`.
 * A raw key on screen is worse than the English it replaced, which is the whole reason the
 * two-field contract exists.
 *
 * `descriptorLabel` already implemented the correct rule and `AppShellComponent.navText` already
 * used it, for text built in TypeScript. The ternary was the template half of the same idea,
 * written thirty-eight times and wrong every time. One pipe means the rule has one definition.
 *
 * ## Why it is impure
 *
 * `translate.instant` is not reactive, so a pure pipe would resolve once and keep whatever
 * language was active then. `TranslatePipe` is impure for exactly this reason; this follows it
 * rather than inventing a different answer.
 */
@Pipe({
  name: 'descriptorLabel',
  standalone: true,
  pure: false,
})
export class DescriptorLabelPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(descriptor: LabelledDescriptor | null | undefined): string {
    if (!descriptor) return '';
    return descriptorLabel(descriptor, (key) => this.translate.instant(key));
  }
}
