import type { AppNavItem } from '../platform-nav-items';
import { drawerItemForPath } from './drawer-route-match';

function item(path: string, hasDrawer: boolean): AppNavItem {
  return { id: `app.navbar.${path.slice(1)}`, label: path, icon: 'folder', path, hasDrawer };
}

const NAV_ITEMS: readonly AppNavItem[] = [
  item('/browse', true),
  item('/browse-adf-hx', true),
  item('/search', false),
];

describe('drawerItemForPath', () => {
  it('matches the item that owns the path exactly', () => {
    expect(drawerItemForPath(NAV_ITEMS, '/browse')?.path).toBe('/browse');
  });

  it('matches a child route to its owning item, so a deep link opens the tree', () => {
    expect(drawerItemForPath(NAV_ITEMS, '/browse/default-domain/workspaces')?.path).toBe('/browse');
  });

  it('does not match a sibling route that merely shares a prefix', () => {
    // The regression this guards: a bare `startsWith` gave `/browse-adf-hx` the `/browse`
    // drawer, because the two routes differ only by suffix.
    expect(drawerItemForPath(NAV_ITEMS, '/browse-adf-hx')?.path).toBe('/browse-adf-hx');
    expect(drawerItemForPath(NAV_ITEMS, '/browse-adf-hx/some-folder')?.path).toBe('/browse-adf-hx');
  });

  it('returns null for a route whose nav item has no drawer', () => {
    expect(drawerItemForPath(NAV_ITEMS, '/search')).toBeNull();
  });

  it('returns null for a route with no nav item at all', () => {
    expect(drawerItemForPath(NAV_ITEMS, '/tasks')).toBeNull();
  });
});
