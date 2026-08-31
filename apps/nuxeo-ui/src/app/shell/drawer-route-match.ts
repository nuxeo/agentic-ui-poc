import type { AppNavItem } from '../platform-nav-items';

/**
 * The nav item whose drawer belongs to `path`, or `null`.
 *
 * Extracted from `AppShellComponent` because the decision is pure — a path and a list in,
 * one item out — while the component it lived in needs the router, the extension registry
 * and a dozen services to instantiate. Keeping it here means the matching rules below can
 * be asserted directly instead of through a shell fixture.
 *
 * A nav item owns its own path and everything beneath it, so `/browse/some/folder` still
 * resolves to the browse drawer. The separator is required: without it `/browse-adf-hx`
 * would match the `/browse` item by prefix and open the wrong tree — the two routes are
 * siblings that differ only by suffix, so this is a live case, not a hypothetical.
 */
export function drawerItemForPath(
  navItems: readonly AppNavItem[],
  path: string,
): AppNavItem | null {
  return (
    navItems.find(
      (item) => item.hasDrawer && (path === item.path || path.startsWith(`${item.path}/`)),
    ) ?? null
  );
}
