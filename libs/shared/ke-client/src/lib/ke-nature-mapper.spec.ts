import { describe, expect, it } from 'vitest';

import { mapKeClassificationToNatureId } from './ke-nature-mapper';

const NATURE_ENTRIES = [
  { id: 'contract', displayLabel: 'Contract' },
  { id: 'invoice', displayLabel: 'Invoice' },
  { id: 'report', displayLabel: 'Report' },
  { id: 'letter', displayLabel: 'Letter' },
  { id: 'credit', displayLabel: 'Credit' },
  { id: 'procedure', displayLabel: 'Procedure' },
  { id: 'application', displayLabel: 'Application' },
];

describe('mapKeClassificationToNatureId', () => {
  it('maps KE labels to nature directory ids case-insensitively', () => {
    expect(mapKeClassificationToNatureId('Invoice', NATURE_ENTRIES)).toBe('invoice');
    expect(mapKeClassificationToNatureId('contract', NATURE_ENTRIES)).toBe('contract');
  });

  it('maps KE classes without direct directory labels via aliases', () => {
    expect(mapKeClassificationToNatureId('Legal', NATURE_ENTRIES)).toBe('letter');
    expect(mapKeClassificationToNatureId('Financial', NATURE_ENTRIES)).toBe('credit');
    expect(mapKeClassificationToNatureId('Resume', NATURE_ENTRIES)).toBe('application');
  });

  it('returns null for unknown classifications', () => {
    expect(mapKeClassificationToNatureId('UnknownCategory', NATURE_ENTRIES)).toBeNull();
    expect(mapKeClassificationToNatureId('', NATURE_ENTRIES)).toBeNull();
  });
});
