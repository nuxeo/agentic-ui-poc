import { describe, expect, it } from 'vitest';
import type { NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';
import { hxpDocumentTags, hxpIsSubscribed } from './hxp-permission.utils';

describe('hxpDocumentTags', () => {
  it('reads labels out of the tag objects Nuxeo sends', () => {
    const doc = {
      uid: 'd',
      title: 't',
      type: 'File',
      path: '/t',
      properties: { 'nxtag:tags': [{ label: 'urgent' }, { label: 'finance' }] },
    } as unknown as NuxeoDocument;
    expect(hxpDocumentTags(doc)).toEqual(['urgent', 'finance']);
  });

  it('accepts a plain string array as well as tag objects', () => {
    const doc = {
      uid: 'd',
      title: 't',
      type: 'File',
      path: '/t',
      properties: { 'nxtag:tags': ['urgent', { label: 'finance' }] },
    } as unknown as NuxeoDocument;
    expect(hxpDocumentTags(doc)).toEqual(['urgent', 'finance']);
  });

  it('returns an empty list when the tags property is absent', () => {
    const doc = { uid: 'd', title: 't', type: 'File', path: '/t', properties: {} } as NuxeoDocument;
    expect(hxpDocumentTags(doc)).toEqual([]);
    expect(hxpDocumentTags(null)).toEqual([]);
  });
});

describe('hxpIsSubscribed', () => {
  it('reports subscribed when the enricher lists at least one notification', () => {
    const doc = {
      uid: 'd',
      title: 't',
      type: 'File',
      path: '/t',
      contextParameters: { subscribedNotifications: ['Modification'] },
    } as unknown as NuxeoDocument;
    expect(hxpIsSubscribed(doc)).toBe(true);
  });

  it('reports not subscribed for an empty notification list', () => {
    const doc = {
      uid: 'd',
      title: 't',
      type: 'File',
      path: '/t',
      contextParameters: { subscribedNotifications: [] },
    } as unknown as NuxeoDocument;
    expect(hxpIsSubscribed(doc)).toBe(false);
  });

  it('reports not subscribed when the enricher did not run', () => {
    const doc = { uid: 'd', title: 't', type: 'File', path: '/t' } as NuxeoDocument;
    expect(hxpIsSubscribed(doc)).toBe(false);
    expect(hxpIsSubscribed(null)).toBe(false);
  });
});
