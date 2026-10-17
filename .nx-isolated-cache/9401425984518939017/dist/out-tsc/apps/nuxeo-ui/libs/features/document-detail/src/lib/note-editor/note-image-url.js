/** Relative nxfile path fallback when `file:content.data` is unavailable (tests/utilities only). */
export function buildNotePictureNxfileUrl(uid, fileName) {
    const encodedName = encodeURIComponent(fileName).replace(/%2F/g, '/');
    return `/nuxeo/nxfile/default/${uid}/file:content/${encodedName}`;
}
export function extractMainBlobFileName(doc) {
    const fileContent = doc.properties?.['file:content'];
    if (!fileContent || typeof fileContent !== 'object')
        return null;
    const name = fileContent['name'];
    return typeof name === 'string' && name.length > 0 ? name : null;
}
/**
 * Server-supplied blob URL from `file:content.data` (Nuxeo Web UI parity).
 * Same-origin `/nuxeo/nxfile/...` paths rely on the Nuxeo browser session cookie;
 * password login establishes that cookie after credential validation.
 */
export function notePictureInsertUrl(doc) {
    const fileContent = doc.properties?.['file:content'];
    if (!fileContent || typeof fileContent !== 'object')
        return null;
    const data = fileContent['data'];
    return typeof data === 'string' && data.length > 0 ? data : null;
}
