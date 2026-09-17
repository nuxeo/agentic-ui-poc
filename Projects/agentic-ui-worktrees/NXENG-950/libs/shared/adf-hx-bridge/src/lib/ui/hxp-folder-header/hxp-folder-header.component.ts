import { Component, input, output, signal } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { ROOT_DOCUMENT } from '../../tokens/adf-hx-bridge.tokens';
import { hxpDocIconName } from '../../utils/hxp-doc-icon.utils';
import { hxpDocTitle, hxpDocTypeLabel } from '../../utils/hxp-browse-cell.utils';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';

@Component({
  selector: 'hxp-folder-header',
  standalone: true,
  templateUrl: './hxp-folder-header.component.html',
  styleUrl: './hxp-folder-header.component.scss',
  imports: [HxpIconComponent],
})
export class HxpFolderHeaderComponent {
  readonly document = input<Document>(ROOT_DOCUMENT);
  readonly canCreate = input(false);
  readonly canWrite = input(false);
  readonly canRemove = input(false);
  readonly isSubscribed = input(false);
  readonly moreMenuOpen = signal(false);

  readonly createImport = output<void>();
  readonly drive = output<void>();
  readonly edit = output<void>();
  readonly deleteDoc = output<void>();
  readonly downloadAll = output<void>();
  readonly share = output<void>();
  readonly notifyToggle = output<void>();
  readonly exportDoc = output<void>();

  protected docTypeLabel(doc: Document): string {
    return hxpDocTypeLabel(doc);
  }

  protected docTitle(doc: Document): string {
    return hxpDocTitle(doc);
  }

  protected docIcon(doc: Document) {
    return hxpDocIconName(doc);
  }

  protected toggleMoreMenu(event: Event): void {
    event.stopPropagation();
    this.moreMenuOpen.update((open) => !open);
  }

  protected closeMoreMenu(): void {
    this.moreMenuOpen.set(false);
  }
}
