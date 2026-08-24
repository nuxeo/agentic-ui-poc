import {
  THEMES_SETTINGS_PATH,
  visibleSettingsDrawerItems,
  type DrawerLinkItem,
} from './platform-nav-items';

describe('visibleSettingsDrawerItems', () => {
  it('includes Themes when theming is enabled', () => {
    const paths = visibleSettingsDrawerItems(true).map((item: DrawerLinkItem) => item.path);
    expect(paths).toContain(THEMES_SETTINGS_PATH);
  });

  it('omits Themes when theming is disabled', () => {
    const paths = visibleSettingsDrawerItems(false).map((item: DrawerLinkItem) => item.path);
    expect(paths).not.toContain(THEMES_SETTINGS_PATH);
  });
});
