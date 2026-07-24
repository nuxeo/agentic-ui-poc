import { describe, expect, it } from 'vitest';

import { matchesPrincipal } from './principal-match.utils';

describe('matchesPrincipal', () => {
  it('matches an exact principal id', () => {
    expect(matchesPrincipal('poweruser01', 'poweruser01')).toBe(true);
  });

  it('matches user: and group: prefixed principals', () => {
    expect(matchesPrincipal('user:member01', 'member01')).toBe(true);
    expect(matchesPrincipal('group:members', 'members')).toBe(true);
  });

  it('matches when the ACE principal strips to the logical id', () => {
    expect(matchesPrincipal('user:admin01', 'admin01')).toBe(true);
    expect(matchesPrincipal('group:administrators', 'administrators')).toBe(true);
  });

  it('does not match unrelated principals', () => {
    expect(matchesPrincipal('user:member01', 'poweruser01')).toBe(false);
    expect(matchesPrincipal('group:members', 'administrators')).toBe(false);
    expect(matchesPrincipal('member01', 'poweruser01')).toBe(false);
  });
});
