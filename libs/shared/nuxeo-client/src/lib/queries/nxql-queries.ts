export const RECENTLY_EDITED_QUERY = [
  "SELECT * FROM Document",
  "WHERE ecm:mixinType != 'HiddenInNavigation'",
  "AND ecm:isProxy = 0",
  "AND ecm:isVersion = 0",
  "AND ecm:isTrashed = 0",
  "ORDER BY dc:modified DESC",
].join(' ');

export const RECENTLY_VIEWED_QUERY = [
  "SELECT * FROM Document",
  "WHERE ecm:mixinType != 'HiddenInNavigation'",
  "AND ecm:isProxy = 0",
  "AND ecm:isVersion = 0",
  "AND ecm:isTrashed = 0",
  "AND ecm:primaryType NOT IN ('Root', 'Favorites', 'Collections')",
  "AND (dc:creator = '{user}' OR dc:lastContributor = '{user}')",
  "ORDER BY dc:modified DESC",
].join(' ');

export const FAVORITES_COLLECTION_QUERY = [
  "SELECT * FROM Document",
  "WHERE ecm:primaryType = 'Favorites'",
  "AND ecm:path STARTSWITH '/default-domain/UserWorkspaces/{user}'",
].join(' ');
