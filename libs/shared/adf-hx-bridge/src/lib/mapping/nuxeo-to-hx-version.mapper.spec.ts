import { describe, expect, it } from 'vitest';
import type { NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';

import { mapNuxeoVersionToHx, nuxeoVersionLabel } from './nuxeo-to-hx-version.mapper';

function nuxeoVersion(overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'ver-1',
    title: 'Invoice',
    type: 'File',
    path: '/default-domain/workspaces/ws/Invoice',
    lastModified: '2026-02-02T10:00:00.000Z',
    isVersion: true,
    isCheckedOut: false,
    versionableId: 'live-1',
    parentRef: 'folder-1',
    properties: {
      'uid:major_version': 1,
      'uid:minor_version': 3,
      'dc:lastContributor': 'jdoe',
      'dc:creator': 'Administrator',
    },
    ...overrides,
  };
}

describe('nuxeoVersionLabel', () => {
  it('composes the label Nuxeo does not send', () => {
    expect(nuxeoVersionLabel(nuxeoVersion())).toBe('1.3');
  });

  it('treats a missing half as zero', () => {
    expect(nuxeoVersionLabel(nuxeoVersion({ properties: { 'uid:major_version': 2 } }))).toBe('2.0');
    expect(nuxeoVersionLabel(nuxeoVersion({ properties: { 'uid:minor_version': 5 } }))).toBe('0.5');
  });

  it('returns undefined when neither is present, so the panel falls back to the date', () => {
    // Returning '0.0' here would put a plausible-looking but invented label on every version
    // of a document whose uid schema was never filled in.
    expect(nuxeoVersionLabel(nuxeoVersion({ properties: {} }))).toBeUndefined();
  });

  it('ignores a non-numeric version property', () => {
    expect(
      nuxeoVersionLabel(nuxeoVersion({ properties: { 'uid:major_version': '1' } })),
    ).toBeUndefined();
  });
});

describe('mapNuxeoVersionToHx', () => {
  it('points sys_parentId at the live document rather than the folder', () => {
    const mapped = mapNuxeoVersionToHx(nuxeoVersion());
    // Nuxeo's `parentRef` on a version is the live document's *folder*. Upstream follows
    // `sys_parentId` to reload the live document when the panel opens on a version, so
    // leaving `folder-1` there sends that lookup to a folder.
    expect(mapped.sys_parentId).toBe('live-1');
  });

  it('falls back to parentRef when Nuxeo sends no versionableId', () => {
    const mapped = mapNuxeoVersionToHx(nuxeoVersion({ versionableId: undefined }));
    expect(mapped.sys_parentId).toBe('folder-1');
  });

  it('credits the version to whoever cut it, not the document creator', () => {
    // Nuxeo copies the live document's `dc:creator` onto every snapshot, so it answers
    // "who created the document", which is not what `sysver_creator` means.
    expect(mapNuxeoVersionToHx(nuxeoVersion()).sysver_creator).toBe('jdoe');
  });

  it('falls back to dc:creator when the snapshot has no last contributor', () => {
    const mapped = mapNuxeoVersionToHx(
      nuxeoVersion({ properties: { 'dc:creator': 'Administrator' } }),
    );
    expect(mapped.sysver_creator).toBe('Administrator');
  });

  it('leaves sysver_creator unset rather than empty when Nuxeo knows neither', () => {
    expect(mapNuxeoVersionToHx(nuxeoVersion({ properties: {} })).sysver_creator).toBeUndefined();
  });

  it('marks the snapshot as a checked-in version', () => {
    const mapped = mapNuxeoVersionToHx(nuxeoVersion());
    expect(mapped.sysver_isVersion).toBe(true);
    expect(mapped.sysver_isCheckedIn).toBe(true);
    expect(mapped.sysver_created).toBe('2026-02-02T10:00:00.000Z');
  });

  it('does not claim a version is checked in when Nuxeo says it is checked out', () => {
    expect(mapNuxeoVersionToHx(nuxeoVersion({ isCheckedOut: true })).sysver_isCheckedIn).toBe(
      false,
    );
  });

  it('keeps the base document mapping', () => {
    const mapped = mapNuxeoVersionToHx(nuxeoVersion());
    expect(mapped.sys_id).toBe('ver-1');
    expect(mapped.sys_title).toBe('Invoice');
    expect(mapped.sys_repository).toBe('default');
  });
});
