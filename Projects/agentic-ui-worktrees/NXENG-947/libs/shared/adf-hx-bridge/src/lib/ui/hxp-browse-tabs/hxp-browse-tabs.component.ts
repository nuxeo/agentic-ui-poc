import { Component, input, output } from '@angular/core';
import { HXP_BROWSE_TABS, type HxpBrowseTabId } from '../../utils/hxp-browse-tabs.utils';

@Component({
  selector: 'hxp-browse-tabs',
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
