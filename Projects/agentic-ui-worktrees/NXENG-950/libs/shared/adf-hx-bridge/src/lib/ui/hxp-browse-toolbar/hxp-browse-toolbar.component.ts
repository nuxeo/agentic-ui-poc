import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

export type HxpBrowseViewMode = 'list' | 'card';

/**
 * MISSING(adf-hx): M5 — upstream has no list-level filter toolbar. Its search-filters feature is a
 * different surface.
 */
@Component({
  selector: 'hxp-browse-toolbar',
  standalone: true,
  templateUrl: './hxp-browse-toolbar.component.html',
  styleUrl: './hxp-browse-toolbar.component.scss',
  imports: [FormsModule, HxpIconComponent, HxpSpinnerComponent],
})
export class HxpBrowseToolbarComponent {
  readonly resultCount = input(0);
  readonly distinctTypes = input<string[]>([]);
  readonly csvExporting = input(false);

  readonly filterText = model('');
  readonly filterType = model('');
  readonly filterModifiedFrom = model('');
  readonly filterModifiedTo = model('');
  readonly filterContributor = model('');
  readonly viewMode = model<HxpBrowseViewMode>('list');

  readonly exportCsv = output<void>();
}
