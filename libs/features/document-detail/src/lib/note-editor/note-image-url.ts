import type { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

/** Nuxeo Web UI note RTE image URL pattern (`/nuxeo/nxfile/default/{uid}/file:content/{name}`). */
export function buildNotePictureNxfileUrl(uid: string, fileName: string): string {
  const encodedName = encodeURIComponent(fileName).replace(/%2F/g, '/');
  return `/nuxeo/nxfile/default/${uid}/file:content/${encodedName}`;
}

export function extractMainBlobFileName(doc: NuxeoDocument): string | null {
  const fileContent = doc.properties?.['file:content'];
  if (!fileContent || typeof fileContent !== 'object') return null;
  const name = (fileContent as Record<string, unknown>)['name'];
  return typeof name === 'string' && name.length > 0 ? name : null;
}

export function notePictureInsertUrl(doc: NuxeoDocument): string | null {
  const fileName = extractMainBlobFileName(doc);
  if (!fileName) return null;
  return buildNotePictureNxfileUrl(doc.uid, fileName);
}
