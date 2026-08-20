/** The scalar leaf values a filter comparison may test against. */
export type ScalarValue = string | number | boolean | null;

/**
 * A typed reference to a queryable field on a result row. Phantom-typed on `TRow`
 * so a `FilterSpec<ContentNode>` cannot reference a field name from an unrelated
 * row type, while staying a plain string at runtime.
 */
export type FieldRef<TRow> = string & { readonly __row?: TRow };

/** The closed set of filter node kinds. Adapters report the subset they support. */
export type FilterKind = 'and' | 'or' | 'not' | 'eq' | 'in' | 'between' | 'startsWith' | 'fullText';

/**
 * The bounded, structural filter DSL — the escape hatch for ad-hoc cases that
 * resist named-query treatment.
 */
export type FilterSpec<TRow> =
  | { readonly kind: 'and'; readonly clauses: readonly FilterSpec<TRow>[] }
  | { readonly kind: 'or'; readonly clauses: readonly FilterSpec<TRow>[] }
  | { readonly kind: 'not'; readonly clause: FilterSpec<TRow> }
  | { readonly kind: 'eq'; readonly field: FieldRef<TRow>; readonly value: ScalarValue }
  | { readonly kind: 'in'; readonly field: FieldRef<TRow>; readonly values: readonly ScalarValue[] }
  | {
      readonly kind: 'between';
      readonly field: FieldRef<TRow>;
      readonly lo: ScalarValue;
      readonly hi: ScalarValue;
    }
  | { readonly kind: 'startsWith'; readonly field: FieldRef<TRow>; readonly value: string }
  | { readonly kind: 'fullText'; readonly field?: FieldRef<TRow>; readonly query: string };
