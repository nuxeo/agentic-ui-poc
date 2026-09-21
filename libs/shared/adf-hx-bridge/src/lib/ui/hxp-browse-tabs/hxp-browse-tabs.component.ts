import { Component, input, output } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo-satori/platform/extensions';
import { HXP_BROWSE_TABS, type HxpBrowseTabId } from '../../utils/hxp-browse-tabs.utils';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hxp-browse-tabs',
  imports: [DescriptorLabelPipe, TranslatePipe],
  standalone: true,
  templateUrl: './hxp-browse-tabs.component.html',
  styleUrl: './hxp-browse-tabs.component.scss',
})
export class HxpBrowseTabsComponent {
  readonly activeTab = input<HxpBrowseTabId>('view');
  readonly activeTabChange = output<HxpBrowseTabId>();

  protected readonly tabs = HXP_BROWSE_TABS;

  protected selectTab(tab: HxpBrowseTabId): void {
    this.activeTabChange.emit(tab);
  }
}
