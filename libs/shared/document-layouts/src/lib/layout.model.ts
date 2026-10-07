/**
 * Per-type layouts: what a configuration package contributes, and what the panel renders.
 *
 * A layout is chosen per document type and mode, as in Nuxeo Web UI. A package contributes one
 * through `org.nuxeo.agentic.ui.config` (`<layout type="Claim" mode="metadata" src="…"/>`); with
 * none, the layout is generated from the type's own schemas. A contributed layout replaces the
 * generated one whole — nothing is merged.
 */

/** The modes this build renders. `view` is not one: the View tab body is the `documentView` slot. */
export type LayoutMode = 'metadata';

export type LayoutDisplay = 'sections' | 'tabs';

/** A field's type as `/config/types/<type>` describes it when asked for `fetch-schema: fields`. */
export interface LayoutFieldType {
  /** `string`, `date`, `long`, `double`, `boolean`, `blob` or `complex`, each possibly ending in `[]`. */
  readonly type: string;
  /** The vocabulary a `directoryResolver` binds the value — or each item of a list — to. */
  readonly directory?: string;
  /** A complex field's sub-fields, by their bare names. */
  readonly fields?: Readonly<Record<string, LayoutFieldType>>;
}

export interface DocumentTypeSchema {
  readonly name: string;
  /** The property prefix; the schema name when Nuxeo reports none, as it does for `file`. */
  readonly prefix: string;
  readonly fields: Readonly<Record<string, LayoutFieldType>>;
}

export interface DocumentTypeDefinition {
  readonly name: string;
  readonly schemas: readonly DocumentTypeSchema[];
}

/** A label a reader sees: a literal, else the first translation key that resolves, else `fallback`. */
export interface LayoutLabel {
  readonly literal?: string;
  readonly keys: readonly string[];
  readonly fallback: string | null;
}

export interface LayoutField {
  /** `<prefix>:<name>`, the property key on the document. */
  readonly xpath: string;
  readonly label: LayoutLabel;
  readonly definition: LayoutFieldType;
}

export interface LayoutSection {
  readonly id: string;
  readonly label: LayoutLabel;
  readonly fields: readonly LayoutField[];
}

export interface ResolvedLayout {
  readonly type: string;
  readonly mode: LayoutMode;
  readonly source: 'generated' | 'contributed';
  readonly display: LayoutDisplay;
  readonly sections: readonly LayoutSection[];
}
