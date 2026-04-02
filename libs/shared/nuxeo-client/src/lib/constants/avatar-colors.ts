import { SatAvatarCategory } from '@hylandsoftware/satori-ui/avatar';

const AVATAR_PALETTE: SatAvatarCategory[] = [
  'purple',
  'blue',
  'pink',
  'teal',
  'yellow',
  'green',
  'red',
  'orange',
];

/**
 * Deterministic color for a username so the same user always gets
 * the same avatar color across the application.
 */
export function avatarColor(name: string): SatAvatarCategory {
  if (!name) return 'blue';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
