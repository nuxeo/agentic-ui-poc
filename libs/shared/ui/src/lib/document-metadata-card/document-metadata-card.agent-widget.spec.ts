import { describe, expect, it } from 'vitest';

import { DOCUMENT_CARD_FIELDS } from './document-card-fields';
import { documentCardWidget } from './document-metadata-card.agent-widget';

/**
 * The `documentCard` contract.
 *
 * This widget is the worked example of a contributed one — it ships from a
 * library rather than from `apps/nuxeo-ui` — so this file is also the worked
 * example of the tests a contribution is expected to bring. The application-wide
 * hostile-props battery in `apps/nuxeo-ui/src/app/agent-widgets.spec.ts` covers
 * what every widget must refuse; what is here is what only this one knows.
 */
describe('documentCardWidget', () => {
  const uid = 'aaaaaaaa-1111-2222-3333-444444444444';
  const parse = documentCardWidget.parseProps;

  it('accepts one uid', () => {
    expect(parse({ docId: uid })).toEqual({ docId: uid });
  });

  it('accepts a chosen subset of the fields the card can show', () => {
    expect(parse({ docId: uid, fields: ['creator', 'modified'] })).toEqual({
      docId: uid,
      fields: ['creator', 'modified'],
    });
  });

  describe('the id is an identifier and only an identifier', () => {
    it.each([
      ['a list where one uid goes', [uid]],
      ['a path traversal', '../../../etc/passwd'],
      ['a URL', 'https://attacker.example/x'],
      ['a query string', `${uid}?properties=*`],
      ['an empty string', ''],
      ['a number', 7],
    ])('refuses %s', (_name, docId) => {
      expect(parse({ docId })).toBeNull();
    });

    it('refuses a request with no id at all', () => {
      expect(parse({ fields: ['creator'] })).toBeNull();
    });
  });

  describe('the fields are an enum and only an enum', () => {
    it('refuses a field outside the set rather than dropping it', () => {
      // Dropping it is worse than refusing: the card would render, look correct,
      // and be missing the field the caller was told it would show.
      expect(parse({ docId: uid, fields: ['creator', 'dc:ssn'] })).toBeNull();
    });

    it('refuses a property path dressed as a field', () => {
      expect(parse({ docId: uid, fields: ['properties.dc:creator'] })).toBeNull();
    });

    it('refuses free text in place of the field list', () => {
      expect(parse({ docId: uid, fields: 'creator' })).toBeNull();
      expect(parse({ docId: uid, fields: 'everything about this document' })).toBeNull();
    });

    it('refuses an empty field list, which would render a card with no body', () => {
      expect(parse({ docId: uid, fields: [] })).toBeNull();
    });

    it('accepts every field the component declares, and no more', () => {
      // Pins the parser to the component. A field added to one and not the other
      // is either an unreachable case or an unvalidated one.
      expect(parse({ docId: uid, fields: [...DOCUMENT_CARD_FIELDS] })).toEqual({
        docId: uid,
        fields: DOCUMENT_CARD_FIELDS,
      });
    });

    it('falls back to the card default only when fields is absent, never when it is wrong', () => {
      expect(parse({ docId: uid })).toEqual({ docId: uid });
      expect(parse({ docId: uid, fields: undefined })).toBeNull();
    });
  });

  describe('the inputs handed to the component', () => {
    it('pass the id through and nothing else when no fields were chosen', () => {
      expect(documentCardWidget.inputs({ docId: uid })).toEqual({ docId: uid });
    });

    it('pass the validated fields, so the component never sees a raw prop', () => {
      expect(documentCardWidget.inputs({ docId: uid, fields: ['state'] })).toEqual({
        docId: uid,
        fields: ['state'],
      });
    });
  });

  it('loads its component lazily', async () => {
    const componentType = await documentCardWidget.load();

    expect(componentType.name).toContain('DocumentMetadataCardComponent');
  });
});
