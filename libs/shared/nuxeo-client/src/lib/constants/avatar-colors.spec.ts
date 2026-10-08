import type { SatAvatarCategory } from '@hylandsoftware/satori-ui/avatar';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { avatarColor, type AvatarColor } from './avatar-colors';

describe('avatarColor', () => {
  /**
   * Type-level, so Vitest itself proves nothing here: esbuild strips it. The failure is a
   * `tsc` error from `beta:gate`'s `spec-typecheck`, and was seen as one by dropping
   * `'orange'` from `AvatarColor` and, separately, adding `'grey'` to it.
   */
  it('is exactly the union <sat-avatar [category]> accepts', () => {
    expectTypeOf<AvatarColor>().toEqualTypeOf<SatAvatarCategory>();
  });

  it('gives the same colour for the same name', () => {
    expect(avatarColor('jdoe')).toBe(avatarColor('jdoe'));
  });

  it('falls back to blue for an empty name', () => {
    expect(avatarColor('')).toBe('blue');
  });

  it('spreads names across more than one colour', () => {
    const names = ['Administrator', 'jdoe', 'alice', 'bob', 'carol', 'dave', 'erin', 'frank'];
    expect(new Set(names.map(avatarColor)).size).toBeGreaterThan(1);
  });
});
