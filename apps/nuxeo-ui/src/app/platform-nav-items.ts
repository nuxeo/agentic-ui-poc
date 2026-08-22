import type { NavItemDescriptor } from '@nuxeo-satori/platform/extensions';
import type { SatNavigationItemWithIcon } from '@hylandsoftware/satori-ui/platform-nav';

/**
 * A nav entry in the shape Satori's platform nav renders.
 *
 * `id` is the registered extension ID and is the thing the drawer and the shell
 * key on. Before Phase 2 they keyed on `path`, which meant a manifest that
 * changed a route silently detached the entry from its drawer content.
 */
export interface AppNavItem extends SatNavigationItemWithIcon {
  readonly id: string;
  /** When true, clicking opens the side drawer instead of navigating directly. */
  readonly hasDrawer?: boolean;
}

export interface DrawerLinkItem {
  label: string;
  path: string;
}

/**
 * Adapt an extension descriptor to the shell's nav component.
 *
 * The descriptor type deliberately knows nothing about Satori — see
 * `NavItemDescriptor`. This function is the one place the two meet, so replacing
 * the nav component does not invalidate any customer's manifest.
 */
export function toAppNavItem(descriptor: NavItemDescriptor): AppNavItem {
  return {
    id: descriptor.id,
    label: descriptor.label,
    path: descriptor.path,
    icon: descriptor.icon,
    hasDrawer: descriptor.hasDrawer,
  };
}

export const SETTINGS_DRAWER_ITEMS: DrawerLinkItem[] = [
  { label: 'Nuxeo Drive', path: '/settings/nuxeo-drive' },
  { label: 'Profile', path: '/settings/profile' },
  { label: 'Authorized Applications', path: '/settings/authorized-applications' },
  { label: 'Cloud Services', path: '/settings/cloud-services' },
  { label: 'Themes', path: '/settings/themes' },
];

export const ADMINISTRATION_DRAWER_ITEMS: DrawerLinkItem[] = [
  { label: 'Analytics', path: '/administration/analytics' },
  { label: 'Users & Groups', path: '/administration/users-groups' },
  { label: 'Vocabularies', path: '/administration/vocabularies' },
  { label: 'Audit', path: '/administration/audit' },
  { label: 'Cloud Services', path: '/administration/cloud-services' },
  { label: 'NXQL Search', path: '/administration/nxql-search' },
];

/** Limited administration menu for `powerusers` (matches classic Web UI). */
export const POWERUSER_ADMINISTRATION_DRAWER_ITEMS: DrawerLinkItem[] = [
  { label: 'Users & Groups', path: '/administration/users-groups' },
  { label: 'Vocabularies', path: '/administration/vocabularies' },
  { label: 'Audit', path: '/administration/audit' },
];
