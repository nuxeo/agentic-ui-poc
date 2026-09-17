import { describe, expect, it } from 'vitest';
import { trashDocumentConfirmData, trashSelectedDocumentsConfirmData } from './trash-confirm.utils';

describe('trash confirm utils', () => {
  it('trashDocumentConfirmData names a single document', () => {
    expect(trashDocumentConfirmData('Akshitha').message).toBe('Move "Akshitha" to trash?');
  });

  it('trashDocumentConfirmData trims the title before naming it', () => {
    expect(trashDocumentConfirmData('  Akshitha  ').message).toBe('Move "Akshitha" to trash?');
  });

  it('trashDocumentConfirmData falls back to the generic message for an unusable title', () => {
    // The only branch of `trimmed ? … : …` the file did not reach. A whitespace-only title is
    // what an untitled Nuxeo document yields, and without the fallback the dialog would read
    // `Move "" to trash?`.
    expect(trashDocumentConfirmData('   ').message).toBe('Delete the document?');
    expect(trashDocumentConfirmData('').message).toBe('Delete the document?');
  });

  it('trashSelectedDocumentsConfirmData uses generic message for one selection', () => {
    expect(trashSelectedDocumentsConfirmData(1).message).toBe('Delete the document?');
  });

  it('trashSelectedDocumentsConfirmData counts bulk selection without a single title', () => {
    expect(trashSelectedDocumentsConfirmData(3).message).toBe('Delete 3 selected document(s)?');
  });
});
