import type { DataColumn } from '@alfresco/adf-core';

import type { ExtensionColumnDescriptor } from '@nuxeo-satori/platform/extensions';

/**
 * Translating Layer 1 column descriptors into adf-core's `DataColumn`.
 *
 * ## Why this exists as its own file
 *
 * `ExtensionColumnDescriptor` and `DataColumn` are different shapes, and the difference
 * is not cosmetic. `DataColumn` **requires** `key` and `type`; our descriptor carries
 * `field` and `label` instead. Handing the descriptors to upstream's `[schema]` through
 * a cast therefore produces a table with the right headers and **entirely empty rows** —
 * `key` is `undefined`, so `ObjectUtils.getValue(row.obj, undefined)` resolves nothing.
 *
 * The adf-hx browse route already knew this and did the translation inline. The search
 * page did not: it passed `PACKAGED_BROWSE_COLUMNS as unknown as DataColumn[]`, and
 * rendered eight empty rows for a query that matched eight documents. The double cast
 * is what let it compile.
 *
 * Two consumers, one translation, so the next surface to adopt upstream's list cannot
 * repeat it.
 *
 * ## Why `field` is not already the property path
 *
 * `ExtensionColumnDescriptor.field` holds the *browse view-model* key — `title`,
 * `modified` — because that is what the pre-Phase-3 hand-written list held and what a
 * customer's manifest already references. Changing it would be a breaking change to a
 * published ID's meaning. So the translation lives here instead.
 */
const HXP_FIELD_BY_COLUMN: Readonly<Record<string, string>> = {
  title: 'sys_title',
  type: 'sys_typeLabel',
  modified: 'sys_modified',
  created: 'sys_created',
  // adf-core's `ObjectUtils.getValue` resolves a dotted path, so a nested `User` is
  // addressable. Nuxeo carries only the username, so that is what shows.
  lastContributor: 'sys_lastContributor.username',
  author: 'sys_creator.username',
  state: 'sys_lifecycleState',
  // These three shipped hidden and rendered empty when switched on, because no HxPR
  // field held their value. The mapper now emits Nuxeo's own properties as
  // `prefix_field`, so they resolve. `version` stays unmapped deliberately: Nuxeo holds
  // it as two integers (`uid_major_version`, `uid_minor_version`) and the DataTable
  // reads a single key.
  nature: 'dc_nature',
  coverage: 'dc_coverage',
  subjects: 'dc_subjects',
};

/**
 * Columns adf-core should render as dates rather than raw strings.
 *
 * Without this the DataTable prints `2026-07-03T08:33:42.275Z` where the hand-written
 * list showed `Jul 3, 2026`.
 */
const DATE_COLUMNS = new Set(['modified', 'created']);

/**
 * Turn Layer 1 descriptors into a schema upstream's document list can actually read.
 *
 * `sortable` is **not** forced on: it is taken from the descriptor, because a column
 * whose header offers sorting and then does nothing is worse than one that does not
 * offer it. `version` has no single-key mapping, so it resolves to its own field name
 * and renders blank — that is a recorded gap, not something this function hides.
 */
export function toDataColumns(descriptors: readonly ExtensionColumnDescriptor[]): DataColumn[] {
  return descriptors.map((descriptor) => ({
    ...(DATE_COLUMNS.has(descriptor.field)
      ? { type: 'date' as const, format: 'mediumDate' }
      : { type: 'text' as const }),
    key: HXP_FIELD_BY_COLUMN[descriptor.field] ?? descriptor.field,
    title: descriptor.label,
    sortable: descriptor.sortable ?? false,
  }));
}

/** The property path a descriptor's `field` resolves to, for callers that need it alone. */
export const hxpFieldFor = (field: string): string => HXP_FIELD_BY_COLUMN[field] ?? field;

/** Whether a descriptor's `field` should render as a date. */
export const isDateColumn = (field: string): boolean => DATE_COLUMNS.has(field);
