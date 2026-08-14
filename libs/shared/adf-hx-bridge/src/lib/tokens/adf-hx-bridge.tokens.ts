import { InjectionToken } from '@angular/core';
import type { DocumentApi, QueryApi } from '@hylandsoftware/hxcs-js-client';

export const DOCUMENT_API_TOKEN = new InjectionToken<DocumentApi>('DocumentApi');
export const QUERY_API_TOKEN = new InjectionToken<QueryApi>('QueryApi');

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
