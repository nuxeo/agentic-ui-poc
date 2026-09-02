import { describe, expect, it } from 'vitest';

import {
  externalShareAccessDeniedMessage,
  EXTERNAL_SHARE_ACCESS_DENIED_TITLE,
  externalShareAccessDeniedDetail,
  isNavPathAllowedForTransientUser,
  isTransientUser,
} from './transient-user';

describe('transient-user utils', () => {
  it('isTransientUser detects transient principals', () => {
    expect(isTransientUser('transient/guest@example.com')).toBe(true);
    expect(isTransientUser('jdoe')).toBe(false);
    expect(isTransientUser(null)).toBe(false);
    expect(isTransientUser(undefined)).toBe(false);
  });

  it('externalShareAccessDeniedMessage includes the document title', () => {
    expect(externalShareAccessDeniedMessage('Quarterly Report')).toContain('Quarterly Report');
    expect(externalShareAccessDeniedMessage('')).toContain('the shared document');
    expect(EXTERNAL_SHARE_ACCESS_DENIED_TITLE).toBe('You do not have access to this folder');
    expect(externalShareAccessDeniedDetail('Quarterly Report')).toBe(
      'The link you received gives you access only to Quarterly Report.',
    );
  });

  it('isNavPathAllowedForTransientUser blocks repository navigation', () => {
    expect(isNavPathAllowedForTransientUser('/browse')).toBe(false);
    expect(isNavPathAllowedForTransientUser('/favorites')).toBe(false);
    expect(isNavPathAllowedForTransientUser('/settings')).toBe(true);
  });
});
