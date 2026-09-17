import { describe, expect, it } from 'vitest';

import { isPowerUserFromGroups, readGroupsFromMe } from './user-groups.util';

describe('readGroupsFromMe', () => {
  it('returns groups from properties', () => {
    expect(
      readGroupsFromMe({
        properties: { groups: ['members', 'powerusers'] },
      }),
    ).toEqual(['members', 'powerusers']);
  });

  it('returns empty array when groups are missing', () => {
    expect(readGroupsFromMe({ properties: {} })).toEqual([]);
    expect(readGroupsFromMe(null)).toEqual([]);
  });
});

describe('isPowerUserFromGroups', () => {
  it('detects powerusers membership case-insensitively', () => {
    expect(isPowerUserFromGroups(['members', 'powerusers'])).toBe(true);
    expect(isPowerUserFromGroups(['PowerUsers'])).toBe(true);
    expect(isPowerUserFromGroups(['members'])).toBe(false);
  });
});
