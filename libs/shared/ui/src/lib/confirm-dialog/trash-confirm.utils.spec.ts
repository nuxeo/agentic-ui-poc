import { describe, expect, it } from 'vitest';
import { trashDocumentConfirmData, trashSelectedDocumentsConfirmData } from './trash-confirm.utils';

/**
 * Records what was asked of the catalogue instead of resolving it.
 *
 * These functions no longer own their wording, so asserting English here would only re-test
 * `en.json`. What they still decide — and what a regression would silently change — is WHICH key
 * each branch picks and which parameters it passes.
 */
const recordingTranslate = () => {
  const calls: { key: string; params?: Record<string, unknown> }[] = [];
  const translate = (key: string, params?: Record<string, unknown>) => {
    calls.push({ key, params });
    return key;
  };
  return { calls, translate };
};

describe('trash confirm utils', () => {
  it('trashDocumentConfirmData names a single document through a parameter', () => {
    const { translate } = recordingTranslate();
    const data = trashDocumentConfirmData('Akshitha', translate);
    expect(data.message).toBe('confirm.move-named-to-trash');
  });

  it('trashDocumentConfirmData passes the name as a parameter, never concatenated', () => {
    // The point of the parameter: a translator receives the whole sentence and can move the name
    // within it. A concatenated `'Move "' + title + '" to trash?'` would read identically here and
    // be untranslatable, so this asserts the parameter and not just the output.
    const { calls, translate } = recordingTranslate();
    trashDocumentConfirmData('Akshitha', translate);
    expect(calls).toContainEqual({
      key: 'confirm.move-named-to-trash',
      params: { name: 'Akshitha' },
    });
  });

  it('trashDocumentConfirmData trims the title before naming it', () => {
    const { calls, translate } = recordingTranslate();
    trashDocumentConfirmData('  Akshitha  ', translate);
    expect(calls).toContainEqual({
      key: 'confirm.move-named-to-trash',
      params: { name: 'Akshitha' },
    });
  });

  it('trashDocumentConfirmData falls back to the generic key for an unusable title', () => {
    // The only branch of `trimmed ? … : …` the file did not reach. A whitespace-only title is
    // what an untitled Nuxeo document yields, and without the fallback the dialog would name an
    // empty string.
    const { translate } = recordingTranslate();
    expect(trashDocumentConfirmData('   ', translate).message).toBe('confirm.delete-the-document');
    expect(trashDocumentConfirmData('', translate).message).toBe('confirm.delete-the-document');
  });

  it('trashSelectedDocumentsConfirmData uses the singular key for one selection', () => {
    const { translate } = recordingTranslate();
    expect(trashSelectedDocumentsConfirmData(1, translate).message).toBe(
      'confirm.delete-the-document',
    );
  });

  it('trashSelectedDocumentsConfirmData passes the count for a bulk selection', () => {
    // The singular case is a separate key rather than an `(s)` suffix, so this asserts the bulk
    // branch is reached and hands the count over for interpolation.
    const { calls, translate } = recordingTranslate();
    expect(trashSelectedDocumentsConfirmData(3, translate).message).toBe(
      'confirm.delete-selected-documents',
    );
    expect(calls).toContainEqual({
      key: 'confirm.delete-selected-documents',
      params: { count: 3 },
    });
  });

  it('every string it returns comes from the catalogue', () => {
    // A field left as a literal would still satisfy the assertions above, because they only look
    // at `message`. This covers the whole returned object.
    const { translate } = recordingTranslate();
    for (const data of [
      trashDocumentConfirmData('Akshitha', translate),
      trashSelectedDocumentsConfirmData(1, translate),
      trashSelectedDocumentsConfirmData(3, translate),
    ]) {
      for (const value of [data.title, data.message, data.confirmLabel]) {
        expect(value).toMatch(/^confirm\./);
      }
    }
  });
});
