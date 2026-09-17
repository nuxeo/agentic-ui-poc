import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { AuditEntry } from '@nuxeo-satori/platform/nuxeo-client';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { hxpDocTitle, hxpDocTypeLabel } from '../../utils/hxp-browse-cell.utils';
import { hxpRelativeTime } from '../../utils/hxp-relative-time.utils';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

export type HxpDetailsSubTab = 'info' | 'tags' | 'activity';

@Component({
  selector: 'hxp-browse-details-panel',
  standalone: true,
  templateUrl: './hxp-browse-details-panel.component.html',
  styleUrl: './hxp-browse-details-panel.component.scss',
  imports: [DatePipe, HxpIconComponent, HxpSpinnerComponent],
})
export class HxpBrowseDetailsPanelComponent {
  readonly document = input.required<Document>();
  readonly subTab = input<HxpDetailsSubTab>('info');
  readonly docState = input('');
  readonly tags = input<string[]>([]);
  readonly tagInput = input('');
  readonly tagSuggestions = input<string[]>([]);
  readonly showCreateTagOption = input(false);
  readonly activityEntries = input<AuditEntry[]>([]);
  readonly activityLoading = input(false);
  readonly activityLabelFn = input<(entry: AuditEntry) => string>(() => 'performed an action');

  readonly close = output<void>();
  readonly subTabChange = output<HxpDetailsSubTab>();
  readonly tagInputChange = output<string>();
  readonly tagSelect = output<string>();
  readonly tagRemove = output<string>();

  protected docTitle(doc: Document): string {
    return hxpDocTitle(doc);
  }

  protected docType(doc: Document): string {
    return hxpDocTypeLabel(doc);
  }

  protected creator(doc: Document): string {
    return (doc['dc_creator'] as string | undefined) ?? '—';
  }

  protected lastContributor(doc: Document): string {
    return (doc['dc_lastContributor'] as string | undefined) ?? '—';
  }

  protected relativeTime(dateStr: string): string {
    return hxpRelativeTime(dateStr);
  }

  protected activityLabel(entry: AuditEntry): string {
    return this.activityLabelFn()(entry);
  }
}
