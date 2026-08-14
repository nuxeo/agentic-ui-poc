import type { Document } from '@hylandsoftware/hxcs-js-client';

export function hxpDocTitle(doc: Document): string {
  return doc.sys_title ?? doc.sys_name ?? 'Untitled';
}

export function hxpDocTypeLabel(doc: Document): string {
  return (doc['sys_typeLabel'] as string | undefined) ?? doc.sys_primaryType ?? 'File';
}

export function hxpBrowseCellValue(doc: Document, key: string): string {
  switch (key) {
    case 'title':
      return hxpDocTitle(doc);
    case 'type':
      return hxpDocTypeLabel(doc);
    case 'modified':
      return doc.sys_modified ? new Date(doc.sys_modified).toLocaleDateString() : '';
    case 'lastContributor':
      return (doc['hx:lastContributor'] as string | undefined) ?? '';
    case 'state':
      return (doc['hx:nature'] as string | undefined) ?? '';
    case 'version': {
      const major = doc['hx:majorVersion'];
      if (major === undefined || major === null) {
        return '';
      }
      return `${major}.${doc['hx:minorVersion'] ?? 0}`;
    }
    case 'created':
      return doc.sys_created ? new Date(doc.sys_created).toLocaleDateString() : '';
    case 'author':
      return (doc['hx:creator'] as string | undefined) ?? '';
    case 'nature':
      return (doc['hx:nature'] as string | undefined) ?? '';
    case 'coverage':
      return (doc['hx:coverage'] as string | undefined) ?? '';
    case 'subjects':
      return (doc['hx:subjects'] as string | undefined) ?? '';
    case 'flags':
      return '';
    default:
      return '';
  }
}

export function hxpLastContributor(doc: Document): string {
  return (doc['hx:lastContributor'] as string | undefined) ?? '';
}
