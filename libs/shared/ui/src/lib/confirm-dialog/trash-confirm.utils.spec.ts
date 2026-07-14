import { describe, expect, it } from 'vitest';
import { trashDocumentConfirmData, trashSelectedDocumentsConfirmData } from './trash-confirm.utils';

describe('trash confirm utils', () => {
  it('trashDocumentConfirmData names a single document', () => {
    expect(trashDocumentConfirmData('Akshitha').message).toBe('Move "Akshitha" to trash?');
  });

  it('trashSelectedDocumentsConfirmData uses generic message for one selection', () => {
    expect(trashSelectedDocumentsConfirmData(1).message).toBe('Delete the document?');
  });

  it('trashSelectedDocumentsConfirmData counts bulk selection without a single title', () => {
    expect(trashSelectedDocumentsConfirmData(3).message).toBe('Delete 3 selected document(s)?');
  });
});
