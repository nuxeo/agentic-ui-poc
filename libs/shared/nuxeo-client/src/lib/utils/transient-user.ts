/** True when the principal is a transient external-share user (`transient/<email>`). */
export function isTransientUser(username: string | null | undefined): boolean {
  return typeof username === 'string' && username.startsWith('transient/');
}

/**
 * Heading when a transient external user opens something outside their share.
 * Stays resource-neutral because folders, documents and collections all use it.
 */
export const EXTERNAL_SHARE_ACCESS_DENIED_TITLE = 'You do not have access to this item';

/** User-facing message when a transient user browses outside their shared document. */
export function externalShareAccessDeniedDetail(documentTitle: string): string {
  const title = documentTitle.trim() || 'the shared document';
  return `The link you received gives you access only to ${title}.`;
}

/** Full single-paragraph message (snackbars, tests, screen readers). */
export function externalShareAccessDeniedMessage(documentTitle: string): string {
  return `${EXTERNAL_SHARE_ACCESS_DENIED_TITLE}. ${externalShareAccessDeniedDetail(documentTitle)}`;
}

/** Platform nav paths that transient (external-share) users cannot reach. */
export const TRANSIENT_USER_BLOCKED_NAV_PATHS = new Set([
  '/knowledge-discovery',
  '/dashboard',
  '/browse',
  '/recently-viewed',
  '/search',
  '/expired-queue',
  '/documents',
  '/tasks',
  '/favorites',
  '/collections',
  '/personal-space',
  '/clipboard',
  '/trash',
  '/administration',
]);

export function isNavPathAllowedForTransientUser(path: string): boolean {
  return !TRANSIENT_USER_BLOCKED_NAV_PATHS.has(path);
}
