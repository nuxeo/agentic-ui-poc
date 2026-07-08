import type { DirectoryEntry, L10nDirectoryEntry } from '../models/directory.model';

/** Localized label for an l10n directory entry (defaults to id). */
export function l10nEntryLabel(entry: L10nDirectoryEntry): string {
  return entry.properties.label_en ?? entry.id;
}

/** Resolves a nature vocabulary id to its display label. */
export function resolveNatureLabel(
  id: string | null | undefined,
  entries: DirectoryEntry[],
): string {
  if (!id) return '';
  const match = entries.find((e) => e.id === id);
  return match?.displayLabel ?? match?.label ?? id;
}

/**
 * Formats an l10n directory value as `Parent/Child`, matching Nuxeo Web UI
 * (e.g. `Africa/Tanzania` for coverage).
 */
export function formatHierarchicalL10nLabel(
  id: string | null | undefined,
  entries: L10nDirectoryEntry[],
): string {
  if (!id) return '';
  const byId = new Map(entries.map((e) => [e.id, e]));
  const entry = byId.get(id);
  if (!entry) return id;

  const childLabel = l10nEntryLabel(entry);
  const parentId = entry.properties.parent;
  if (!parentId) return childLabel;

  const parent = byId.get(parentId);
  const parentLabel = parent ? l10nEntryLabel(parent) : parentId;
  return `${parentLabel}/${childLabel}`;
}

export interface L10nOptionGroup {
  parentLabel: string;
  entries: L10nDirectoryEntry[];
}

/**
 * Groups child l10n directory entries under their parent label for hierarchical
 * mat-optgroup pickers (coverage, subjects).
 */
export function groupL10nChildrenByParent(
  entries: L10nDirectoryEntry[],
  query = '',
): L10nOptionGroup[] {
  if (!entries.length) return [];

  const parentLabels = new Map(entries.map((e) => [e.id, l10nEntryLabel(e)]));
  const q = query.trim().toLowerCase();

  const filtered = entries.filter((e) => {
    if (e.properties.obsolete) return false;
    if (!e.properties.parent) return false;
    if (!q) return true;
    const label = l10nEntryLabel(e).toLowerCase();
    const parentLabel = (parentLabels.get(e.properties.parent) ?? '').toLowerCase();
    return label.includes(q) || e.id.toLowerCase().includes(q) || parentLabel.includes(q);
  });

  const groups = new Map<string, L10nDirectoryEntry[]>();
  for (const entry of filtered) {
    const parent = entry.properties.parent;
    const list = groups.get(parent) ?? [];
    list.push(entry);
    groups.set(parent, list);
  }

  return [...groups.entries()]
    .map(([parentId, groupEntries]) => ({
      parentLabel: parentLabels.get(parentId) ?? parentId,
      entries: groupEntries.sort(
        (a, b) => (a.properties.ordering ?? 0) - (b.properties.ordering ?? 0),
      ),
    }))
    .sort((a, b) => a.parentLabel.localeCompare(b.parentLabel));
}
