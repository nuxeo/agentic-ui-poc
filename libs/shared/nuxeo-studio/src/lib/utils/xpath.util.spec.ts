import {
  getPropertyValue,
  setPropertyValue,
  getSchemaPrefix,
  getFieldName,
  xpathToLabel,
} from './xpath.util';

describe('xpath.util', () => {
  describe('getPropertyValue', () => {
    const props: Record<string, unknown> = {
      'dc:title': 'My Document',
      'dc:description': 'A description',
      'contract:details': {
        amount: 42000,
        currency: 'USD',
      },
      'files:files': [
        { file: { name: 'report.pdf', data: 'blob1' } },
        { file: { name: 'photo.jpg', data: 'blob2' } },
      ],
    };

    it('should read simple top-level properties', () => {
      expect(getPropertyValue(props, 'dc:title')).toBe('My Document');
      expect(getPropertyValue(props, 'dc:description')).toBe('A description');
    });

    it('should read nested complex properties', () => {
      expect(getPropertyValue(props, 'contract:details/amount')).toBe(42000);
      expect(getPropertyValue(props, 'contract:details/currency')).toBe('USD');
    });

    it('should read array-indexed properties', () => {
      expect(getPropertyValue(props, 'files:files/0/file/name')).toBe('report.pdf');
      expect(getPropertyValue(props, 'files:files/1/file/name')).toBe('photo.jpg');
    });

    it('should return undefined for missing properties', () => {
      expect(getPropertyValue(props, 'dc:nonexistent')).toBeUndefined();
      expect(getPropertyValue(props, 'contract:details/missing')).toBeUndefined();
    });

    it('should return undefined for null/empty inputs', () => {
      expect(
        getPropertyValue(null as unknown as Record<string, unknown>, 'dc:title'),
      ).toBeUndefined();
      expect(getPropertyValue(props, '')).toBeUndefined();
    });
  });

  describe('setPropertyValue', () => {
    it('should set a simple top-level property', () => {
      const result = setPropertyValue({}, 'dc:title', 'New Title');
      expect(result['dc:title']).toBe('New Title');
    });

    it('should set a nested property, creating intermediates', () => {
      const result = setPropertyValue({}, 'contract:details/amount', 5000);
      const details = result['contract:details'] as Record<string, unknown>;
      expect(details['amount']).toBe(5000);
    });

    it('should not mutate the original properties', () => {
      const original = { 'dc:title': 'Original' };
      const result = setPropertyValue(original, 'dc:title', 'Changed');
      expect(original['dc:title']).toBe('Original');
      expect(result['dc:title']).toBe('Changed');
    });
  });

  describe('getSchemaPrefix', () => {
    it('should extract prefix from xpath', () => {
      expect(getSchemaPrefix('dc:title')).toBe('dc');
      expect(getSchemaPrefix('contract:details/amount')).toBe('contract');
    });

    it('should return empty string for xpaths without prefix', () => {
      expect(getSchemaPrefix('title')).toBe('');
    });
  });

  describe('getFieldName', () => {
    it('should extract field name after prefix', () => {
      expect(getFieldName('dc:title')).toBe('title');
      expect(getFieldName('contract:details/amount')).toBe('details/amount');
    });

    it('should return the full string if no prefix', () => {
      expect(getFieldName('title')).toBe('title');
    });
  });

  describe('xpathToLabel', () => {
    it('should convert simple field names to labels', () => {
      expect(xpathToLabel('dc:title')).toBe('Title');
      expect(xpathToLabel('dc:subjects')).toBe('Subjects');
    });

    it('should split camelCase into words', () => {
      expect(xpathToLabel('contract:effectiveDate')).toBe('Effective Date');
      expect(xpathToLabel('dc:lastContributor')).toBe('Last Contributor');
    });

    it('should use the leaf segment for nested xpaths', () => {
      expect(xpathToLabel('contract:details/amount')).toBe('Amount');
    });

    it('should handle underscores and hyphens', () => {
      expect(xpathToLabel('dc:some_field')).toBe('Some Field');
      expect(xpathToLabel('dc:some-field')).toBe('Some Field');
    });
  });
});
