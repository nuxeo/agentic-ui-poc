import type { SatNavigationItemWithIcon } from '@hylandsoftware/satori-ui/platform-nav';

export interface AppNavItem extends SatNavigationItemWithIcon {
  /** When true, clicking opens the side drawer instead of navigating directly. */
  hasDrawer?: boolean;
}

export interface DrawerLinkItem {
  label: string;
  path: string;
}

/**
 * Platform nav entries aligned to Figma order.
 * Items with `hasDrawer: true` open a secondary panel showing contextual content.
 */
export const PLATFORM_NAV_ITEMS: AppNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Browse', path: '/browse', icon: 'folder', hasDrawer: true },
  { label: 'Recently viewed', path: '/recently-viewed', icon: 'clock', hasDrawer: true },
  { label: 'Search filters', path: '/search', icon: 'search', hasDrawer: true },
  { label: 'Expired Queue', path: '/expired-queue', icon: 'timer', hasDrawer: true },
  { label: 'Assets', path: '/documents', icon: 'document', hasDrawer: true },
  { label: 'Tasks', path: '/tasks', icon: 'tasks', hasDrawer: true },
  { label: 'Favorites', path: '/favorites', icon: 'star', hasDrawer: true },
  { label: 'Collections', path: '/collections', icon: 'bookmark', hasDrawer: true },
  { label: 'Personal Space', path: '/personal-space', icon: 'grid_view', hasDrawer: true },
  { label: 'Clipboard', path: '/clipboard', icon: 'notepad', hasDrawer: true },
  { label: 'Trash', path: '/trash', icon: 'trash', hasDrawer: true },
  { label: 'Administration', path: '/administration', icon: 'settings', hasDrawer: false },
];

export const SETTINGS_DRAWER_ITEMS: DrawerLinkItem[] = [
  { label: 'Nuxeo Drive', path: '/settings/nuxeo-drive' },
  { label: 'Profile', path: '/settings/profile' },
  { label: 'Authorized Applications', path: '/settings/authorized-applications' },
  { label: 'Cloud Services', path: '/settings/cloud-services' },
  { label: 'Themes', path: '/settings/themes' },
];
