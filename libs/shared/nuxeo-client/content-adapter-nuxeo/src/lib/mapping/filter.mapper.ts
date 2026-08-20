import { ContentError, type FilterSpec, type ScalarValue } from '@agentic-ui/shared/content-ports';

/** Quotes a scalar for NXQL, escaping embedded single quotes. */
function literal(value: ScalarValue): string {
  if (value === null) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return `'${value.replaceAll("'", "''")}'`;
}

/**
 * Field references cross into NXQL unquoted, so they are the one injection-relevant
 * part of the DSL that cannot be parameterised. Restrict them to the shape Nuxeo
 * actually uses (`schema:field`, `ecm:field`, dotted sub-fields) and reject anything
 * else rather than passing it through.
 */
const SAFE_FIELD = /^[A-Za-z][A-Za-z0-9_]*(:[A-Za-z][A-Za-z0-9_]*)?(\.[A-Za-z][A-Za-z0-9_]*)*$/;

function field(name: string): string {
  if (!SAFE_FIELD.test(name)) {
    throw new ContentError(
      'UnsupportedField',
      `field reference '${name}' is not a valid NXQL field`,
    );
  }
  return name;
}

/**
 * Compiles the bounded filter DSL into an NXQL `WHERE` fragment.
 *
 * Every leaf is emitted with quoted literals and a validated field reference; the
 * DSL has no free-text escape hatch into NXQL, which is what makes it safe to accept
 * a `FilterSpec` from a caller.
 */
export function toNxqlWhere<TRow>(spec: FilterSpec<TRow>): string {
  switch (spec.kind) {
    case 'and':
    case 'or': {
      if (spec.clauses.length === 0) {
        // An empty conjunction is true and an empty disjunction is false.
        return spec.kind === 'and' ? '1 = 1' : '1 = 0';
      }
      const joiner = spec.kind === 'and' ? ' AND ' : ' OR ';
      return `(${spec.clauses.map(toNxqlWhere).join(joiner)})`;
    }
    case 'not':
      return `NOT (${toNxqlWhere(spec.clause)})`;
    case 'eq':
      return `${field(spec.field)} = ${literal(spec.value)}`;
    case 'in': {
      if (spec.values.length === 0) {
        return '1 = 0';
      }
      return `${field(spec.field)} IN (${spec.values.map(literal).join(', ')})`;
    }
    case 'between':
      return `${field(spec.field)} BETWEEN ${literal(spec.lo)} AND ${literal(spec.hi)}`;
    case 'startsWith':
      return `${field(spec.field)} LIKE ${literal(`${spec.value}%`)}`;
    case 'fullText': {
      const target = spec.field ? field(spec.field) : 'ecm:fulltext';
      return `${target} = ${literal(spec.query)}`;
    }
    default: {
      const exhaustive: never = spec;
      throw new ContentError(
        'UnsupportedFilter',
        `unsupported filter node: ${JSON.stringify(exhaustive)}`,
      );
    }
  }
}
