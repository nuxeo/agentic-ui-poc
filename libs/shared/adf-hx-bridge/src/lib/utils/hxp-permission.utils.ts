import { type NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';

export function hxpDocumentTags(doc: NuxeoDocument | null | undefined): string[] {
  const raw = doc?.properties?.['nxtag:tags'] as Array<{ label: string } | string> | undefined;
  if (!raw) {
    return [];
  }
  return raw.map((tag) => (typeof tag === 'string' ? tag : tag.label));
}

export function hxpIsSubscribed(doc: NuxeoDocument | null | undefined): boolean {
  const notifs = doc?.contextParameters?.['subscribedNotifications'] as string[] | undefined;
  return !!notifs?.length;
}
