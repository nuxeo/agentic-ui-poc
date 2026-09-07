import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { hxpDocIconName } from '../../utils/hxp-doc-icon.utils';
import { hxpDocTitle, hxpDocTypeLabel } from '../../utils/hxp-browse-cell.utils';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

@Component({
  selector: 'hxp-browse-trash',
  standalone: true,
  templateUrl: './hxp-browse-trash.component.html',
  styleUrl: './hxp-browse-trash.component.scss',
  imports: [DatePipe, HxpIconComponent, HxpSpinnerComponent],
})
export class HxpBrowseTrashComponent {
  readonly loading = input(false);
  readonly documents = input<Document[]>([]);
  readonly thumbnails = input<Record<string, string>>({});

  readonly restore = output<Document>();

  protected docTitle(doc: Document): string {
    return hxpDocTitle(doc);
  }

  protected docType(doc: Document): string {
    return hxpDocTypeLabel(doc);
  }

  protected docIcon(doc: Document) {
    return hxpDocIconName(doc);
  }
}
