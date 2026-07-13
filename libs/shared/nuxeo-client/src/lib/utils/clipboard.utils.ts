import type { NuxeoDocument } from '../models/document.model';
import { isFolderishDocument } from '../services/document-import.service';
import { parseDocumentSubtypes } from './parse-document-subtypes';

export const CLIPBOARD_STORAGE_KEY = 'nuxeo_clipboard';

/** Client-side clipboard entry (Web UI stores full documents; we persist uid/title/type). */
export interface ClipboardDoc {
  uid: string;
  title: string;
  type?: string;
}

export function readClipboardDocs(): ClipboardDoc[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CLIPBOARD_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is ClipboardDoc =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as ClipboardDoc).uid === 'string' &&
            typeof (item as ClipboardDoc).title === 'string',
        )
      : [];
  } catch {
    return [];
  }
}

export function writeClipboardDocs(docs: ClipboardDoc[]): void {
  try {
    localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // Storage can be unavailable in restricted browser contexts and test runners.
  }
}

/**
 * Web UI `nuxeo-clipboard.canPaste`: target must be folderish and allow each item type.
 * Items without `type` skip subtype validation (backward compatible with older clipboard data).
 */
export function canPasteClipboard(
  items: ClipboardDoc[],
  target: NuxeoDocument | null | undefined,
): boolean {
  if (!items.length || !target || !isFolderishDocument(target)) {
    return false;
  }

  const allowedTypes = parseDocumentSubtypes(target);
  if (allowedTypes.length === 0) {
    return true;
  }

  return items.every((item) => !item.type || allowedTypes.includes(item.type));
}
