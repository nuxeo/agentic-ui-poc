import type { SatAvatarCategory } from '@hylandsoftware/satori-ui/avatar';

/**
 * The avatar colours, as **our own** type.
 *
 * ## Why not just return `SatAvatarCategory`
 *
 * `avatarColor` used to be typed `(name: string) => SatAvatarCategory`, and that shipped
 * two problems in one signature.
 *
 * The first is the rule: a third-party design-system type has no business in our public
 * API, for the same reason `AGENTS/11-beta-program.md` §7 forbids adf-hx types there. A
 * customer writing against `@nuxeo-satori/platform/nuxeo-client` should not have to know
 * that our avatars come from `@hylandsoftware/satori-ui`, and we should be free to change
 * that without it being a breaking change for them.
 *
 * The second is worse and was concrete: **the published declarations did not compile.**
 * ng-packagr's rollup dropped the `import` and emitted
 *
 *     declare function avatarColor(name: string): SatAvatarCategory;
 *
 * with `SatAvatarCategory` declared nowhere in the file. Every customer annotating that
 * result got `TS2304: Cannot find name 'SatAvatarCategory'`. `beta:fork` did not catch it
 * because the app template never calls `avatarColor`, and the API snapshot recorded the
 * broken signature as the baseline. `beta:publishable` now typechecks the shipped
 * declarations themselves, which is the check that sees this class of defect.
 *
 * ## Staying compatible
 *
 * The union must remain exactly upstream's, because the values are handed straight to
 * `<sat-avatar [category]>`. The two assertions below check that in **both** directions at
 * compile time, so adding a colour upstream, or removing one, is a build error here rather
 * than a runtime surprise in a customer's template. They are `type`-level only and cost
 * nothing at runtime.
 */
export type AvatarColor =
  'purple' | 'blue' | 'pink' | 'teal' | 'yellow' | 'green' | 'red' | 'orange';

/**
 * `Assert<T>` constrains `T extends true`, so a failed condition — which resolves to
 * `never` — is a **compile error** (TS2344) rather than a quietly unused `never` alias.
 * The first draft of these checks omitted the constraint and therefore asserted nothing:
 * `type X = A extends B ? true : never` is legal whichever way it resolves. Verified by
 * removing a colour from `AvatarColor` and watching the build fail.
 */
type Assert<T extends true> = T;

/**
 * Two details below are load-bearing, and the check asserted **nothing** without either.
 * Both were found by dropping `'orange'` from `AvatarColor` and watching the build stay
 * green — twice.
 *
 * 1. **The else branch is `false`, not `never`.** `never` is assignable to every type,
 *    including `true`, so `Assert<never>` always satisfies `extends true`. A mismatch has
 *    to produce a type that genuinely fails the constraint.
 * 2. **The conditions are tuple-wrapped.** `A extends B ? …` is *distributive* over a
 *    union: it evaluates per member and unions the results. With `never` that collapsed to
 *    `true`; `[A] extends [B]` compares tuples and is not distributive, so the whole union
 *    must match and the failure is attributable.
 *
 * Now verified failing with TS2344 on a missing colour, and on an extra one.
 */
/** Every `AvatarColor` is accepted by `<sat-avatar [category]>`. */
type _AssertAssignableToUpstream = Assert<[AvatarColor] extends [SatAvatarCategory] ? true : false>;
/** And we are not missing one upstream has added. */
type _AssertCoversUpstream = Assert<[SatAvatarCategory] extends [AvatarColor] ? true : false>;

const AVATAR_PALETTE: readonly AvatarColor[] = [
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
export function avatarColor(name: string): AvatarColor {
  if (!name) return 'blue';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
