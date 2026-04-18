/**
 * Utility functions for working with Nuxeo property xpaths.
 *
 * Nuxeo uses xpath notation for document properties:
 *   - Simple:  "dc:title"
 *   - Nested:  "contract:details/amount"
 *   - Array:   "files:files/0/file"
 *   - Wildcard:"files:files/&#42;/file" (for schema defs, not runtime access)
 */

/**
 * Reads a value from a Nuxeo document's properties map using an xpath.
 *
 * @example
 *   getPropertyValue(props, 'dc:title')                → "My Doc"
 *   getPropertyValue(props, 'contract:details/amount')  → 42000
 *   getPropertyValue(props, 'files:files/0/file/name')  → "report.pdf"
 */
export function getPropertyValue(properties: Record<string, unknown>, xpath: string): unknown {
  if (!properties || !xpath) return undefined;

  // First try direct key lookup (handles "dc:title", "schema:field")
  if (xpath in properties) return properties[xpath];

  // Split on "/" for nested access: "contract:details/amount" → ["contract:details", "amount"]
  const segments = xpath.split('/');
  let current: unknown = properties;

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;

    if (typeof current === 'object' && !Array.isArray(current)) {
      const obj = current as Record<string, unknown>;
      // Try the segment directly first
      if (segment in obj) {
        current = obj[segment];
        continue;
      }
      // For the first segment, also try prefix-based lookup (properties keyed by full xpath)
      current = undefined;
    } else if (Array.isArray(current)) {
      const index = parseInt(segment, 10);
      if (isNaN(index)) return undefined;
      current = current[index];
    } else {
      return undefined;
    }
  }

  // If direct path failed, try the full xpath as a single key
  // (Nuxeo sometimes returns flattened keys like "contract:details/amount")
  if (current === undefined && xpath in properties) {
    return properties[xpath];
  }

  return current;
}

/**
 * Sets a value in a properties map at the given xpath, creating
 * intermediate objects as needed.
 *
 * Returns a shallow clone of the properties with the updated path.
 */
export function setPropertyValue(
  properties: Record<string, unknown>,
  xpath: string,
  value: unknown,
): Record<string, unknown> {
  const result = { ...properties };

  // Simple case: top-level key
  if (!xpath.includes('/')) {
    result[xpath] = value;
    return result;
  }

  const segments = xpath.split('/');
  const lastSegment = segments.pop() as string;

  // Walk to the parent, creating intermediate objects/arrays
  let current: Record<string, unknown> = result;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const nextSeg = segments[i + 1] ?? lastSegment;
    const nextIsIndex = /^\d+$/.test(nextSeg);

    if (!(seg in current) || current[seg] === null || current[seg] === undefined) {
      current[seg] = nextIsIndex ? [] : {};
    }

    const child = current[seg];
    if (Array.isArray(child)) {
      const idx = parseInt(segments[++i], 10);
      if (idx >= child.length) {
        // Extend array
        while (child.length <= idx) child.push({});
      }
      current = child[idx] as Record<string, unknown>;
    } else if (typeof child === 'object') {
      // Clone to avoid mutation
      current[seg] = { ...(child as Record<string, unknown>) };
      current = current[seg] as Record<string, unknown>;
    } else {
      current[seg] = {};
      current = current[seg] as Record<string, unknown>;
    }
  }

  current[lastSegment] = value;
  return result;
}

/**
 * Extracts the schema prefix from an xpath.
 * "dc:title" → "dc"
 * "contract:details/amount" → "contract"
 */
export function getSchemaPrefix(xpath: string): string {
  const colonIdx = xpath.indexOf(':');
  return colonIdx > 0 ? xpath.substring(0, colonIdx) : '';
}

/**
 * Extracts the field name (without prefix) from an xpath.
 * "dc:title" → "title"
 * "contract:details/amount" → "details/amount"
 */
export function getFieldName(xpath: string): string {
  const colonIdx = xpath.indexOf(':');
  return colonIdx > 0 ? xpath.substring(colonIdx + 1) : xpath;
}

/**
 * Generates a human-readable label from an xpath.
 * "dc:title" → "Title"
 * "contract:effectiveDate" → "Effective Date"
 * "dc:subjects" → "Subjects"
 */
export function xpathToLabel(xpath: string): string {
  const fieldName = getFieldName(xpath);
  // Take the last segment after "/"
  const parts = fieldName.split('/');
  const leaf = fieldName.includes('/') ? (parts.pop() as string) : fieldName;
  // Split camelCase and capitalize
  return leaf
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
