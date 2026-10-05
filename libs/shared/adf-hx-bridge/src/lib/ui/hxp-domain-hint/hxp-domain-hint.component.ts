import { Component, computed, input } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { TranslatePipe } from '@ngx-translate/core';
import {
  DOMAIN_CONTAINER_GUIDANCE_KEY,
  isDomainParentType,
  isRepositoryRootPath,
} from '@nuxeo-satori/platform/nuxeo-client';
import { ROOT_DOCUMENT } from '../../tokens/adf-hx-bridge.tokens';

@Component({
  selector: 'hxp-domain-hint',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './hxp-domain-hint.component.html',
  styleUrl: './hxp-domain-hint.component.scss',
})
export class HxpDomainHintComponent {
  readonly document = input<Document>(ROOT_DOCUMENT);
  readonly browsePath = input('/');

  protected readonly guidanceKey = DOMAIN_CONTAINER_GUIDANCE_KEY;

  protected readonly visible = computed(
    () =>
      isDomainParentType(this.docTypeLabel(this.document())) ||
      isRepositoryRootPath(this.browsePath()),
  );

  private docTypeLabel(doc: Document): string {
    return doc['sys_typeLabel'] ?? doc.sys_primaryType ?? '';
  }
}
