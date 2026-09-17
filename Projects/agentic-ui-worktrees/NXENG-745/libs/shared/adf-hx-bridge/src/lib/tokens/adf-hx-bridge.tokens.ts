// The `DOCUMENT_API_TOKEN` and `QUERY_API_TOKEN` clones that used to live here are gone.
// They carried the same description strings as upstream's but different identities, and
// Angular resolves by identity — so they satisfied our own services while being invisible
// to every adf-hx component. Import the real ones from
// `@alfresco/adf-hx-content-services/api`; `provide-adf-hx-nuxeo-bridge.ts` binds them.

export const DEFAULT_REPOSITORY_ID = 'default';

/** HxPR SysRoot primary type — used by adf-hx tree/breadcrumb helpers. */
export const SYS_ROOT = 'SysRoot';

export const ROOT_DOCUMENT = {
  sys_id: '00000000-0000-0000-0000-000000000000',
  sys_isFolderish: true,
  sys_primaryType: SYS_ROOT,
  sys_path: '/',
  sys_title: 'Repository',
  sys_name: 'Repository',
  sys_repository: DEFAULT_REPOSITORY_ID,
} as const;

export function isHxRootDocument(document: { sys_id?: string; sys_primaryType?: string }): boolean {
  return document.sys_id === ROOT_DOCUMENT.sys_id || document.sys_primaryType === SYS_ROOT;
}

export function isHxFolderDocument(document: { sys_isFolderish?: boolean }): boolean {
  return document.sys_isFolderish === true;
}
