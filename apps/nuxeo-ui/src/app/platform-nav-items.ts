import type {
  SatNavigationItem,
  SatNavigationItemWithIcon,
} from '@hylandsoftware/satori-ui/platform-nav';

/**
 * Platform nav entries aligned to Figma order.
 * Icon names must exist in @hylandsoftware/satori-icons (see icon-list.json).
 */
export const PLATFORM_NAV_ITEMS: SatNavigationItemWithIcon[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Browse', path: '/browse', icon: 'folder' },
  { label: 'Recently viewed', path: '/recently-viewed', icon: 'clock' },
  { label: 'Search filters', path: '/search', icon: 'search' },
  { label: 'Expired Queue', path: '/expired-queue', icon: 'timer' },
  { label: 'Assets', path: '/documents', icon: 'document' },
  { label: 'Tasks', path: '/tasks', icon: 'tasks' },
  { label: 'Favorites', path: '/favorites', icon: 'star' },
  { label: 'Collections', path: '/collections', icon: 'bookmark' },
  { label: 'Personal Space', path: '/personal-space', icon: 'grid_view' },
  { label: 'Clipboard', path: '/clipboard', icon: 'notepad' },
  { label: 'Trash', path: '/trash', icon: 'trash' },
];
