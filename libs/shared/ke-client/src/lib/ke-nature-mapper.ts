interface NatureDirectoryLookupEntry {
  id: string;
  displayLabel: string;
}

/** Fallback KE class labels that do not exist verbatim in the Nuxeo `nature` directory. */
const KE_CLASSIFICATION_NATURE_ALIASES: Readonly<Record<string, string>> = {
  legal: 'letter',
  technical: 'report',
  financial: 'credit',
  policy: 'procedure',
  resume: 'application',
};

export function mapKeClassificationToNatureId(
  classification: string,
  entries: NatureDirectoryLookupEntry[],
): string | null {
  const trimmed = classification.trim();
  if (!trimmed || entries.length === 0) {
    return null;
  }

  const validIds = new Set(entries.map((entry) => entry.id));
  if (validIds.has(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.toLowerCase();
  const byId = entries.find((entry) => entry.id.toLowerCase() === normalized);
  if (byId) {
    return byId.id;
  }

  const byLabel = entries.find((entry) => entry.displayLabel.toLowerCase() === normalized);
  if (byLabel) {
    return byLabel.id;
  }

  const aliasId = KE_CLASSIFICATION_NATURE_ALIASES[normalized];
  if (aliasId && validIds.has(aliasId)) {
    return aliasId;
  }

  return null;
}
