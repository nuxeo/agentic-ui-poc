import type { Field, MixinType, Model, PrimaryType, Schema } from '@hylandsoftware/hxcs-js-client';
import type {
  NuxeoContentModel,
  NuxeoFieldType,
  NuxeoSchemaDefinition,
} from '@agentic-ui/shared/nuxeo-client';

/**
 * Nuxeo's content model as the single `Model` document HxPR expects.
 *
 * ## Why this is mostly a renaming exercise
 *
 * The two models are closer than they look. adf-hx's `FieldType` values are
 * `boolean | blob | complex | date | double | long | object | string | user`, each with a `[]`
 * variant — **exactly** Nuxeo's own field type strings. And upstream's
 * `DocumentModel.resolveType` passes a type it does not recognise straight through:
 *
 * ```js
 * if (!this.model?.types || !this.model.types[type]) return type;
 * ```
 *
 * So `model.types` is deliberately left **empty**. Nuxeo has no separate named-type registry
 * to populate it from, and populating it with synthesised entries would only risk *changing*
 * types that are already correct.
 *
 * ## The one real transformation: field keys
 *
 * HxPR keys a schema's fields by their **prefixed** name and carries the prefix separately:
 *
 * ```
 * { prefix: 'dc', fields: { dc_title: { type: 'string' } } }
 * ```
 *
 * That is not cosmetic. `DocumentModel.getSchemaByPrefix(fieldName)` splits `dc_title` on `_`,
 * takes `dc` as the prefix, and then requires `Object.keys(schema.fields)` to contain the
 * **whole** `dc_title`. A schema keyed by the bare `title` matches nothing, and every field
 * silently falls back to `FieldType.String` — dates rendering as raw ISO strings.
 *
 * **Sub-fields of a complex field stay unprefixed.** `getComplexFieldDetails` and the
 * dotted-path branch of `getFieldDefinition` both look up `fields[secondPart]` with the bare
 * name, so prefixing them would break the lookup that prefixing the top level fixes.
 */

/**
 * A schema's effective prefix.
 *
 * Nuxeo reports `@prefix: ''` for several schemas — `file`, `uid`, `files` — and then
 * addresses their properties by schema **name**: `file:content`, `uid:major_version`. So an
 * empty prefix means "use the name", not "no prefix". Reading it literally would key those
 * fields as `_content` and lose them.
 */
export function nuxeoSchemaPrefix(schema: NuxeoSchemaDefinition): string {
  const declared = schema['@prefix'];
  return declared && declared.length > 0 ? declared : schema.name;
}

/**
 * One Nuxeo field definition as an HxPR `Field`.
 *
 * Primitives map by identity because the vocabularies coincide. A complex field keeps its
 * Nuxeo `type` — `complex` or `complex[]` — because `getFieldType` reads `.type` before it
 * looks at `.fields`, so dropping it would turn a `complex[]` into a plain `complex` and lose
 * the multiplicity.
 */
function mapField(definition: NuxeoFieldType): Field {
  if (typeof definition === 'string') {
    return { type: definition };
  }

  const fields = definition.fields;
  return {
    type: definition.type,
    ...(fields
      ? {
          fields: Object.fromEntries(
            // Bare names, not prefixed — see the note above.
            Object.entries(fields).map(([name, sub]) => [name, mapField(sub)]),
          ),
        }
      : {}),
  };
}

function mapSchema(schema: NuxeoSchemaDefinition): Schema {
  const prefix = nuxeoSchemaPrefix(schema);
  return {
    prefix,
    fields: Object.fromEntries(
      Object.entries(schema.fields ?? {}).map(([name, definition]) => [
        `${prefix}_${name}`,
        mapField(definition),
      ]),
    ),
  };
}

/**
 * Nuxeo's `/config/*` reads as an HxPR `Model`.
 *
 * Three things Nuxeo cannot answer, left **unset** rather than invented:
 *
 * - **`PrimaryType.subtypes`** — the types creatable *inside* a container. Nuxeo scopes that
 *   per document and exposes it through a document enricher, not through `/config/types`.
 *   Upstream already handles the gap: `getSubtypes` falls back to `getAllTypes()`. Synthesising
 *   it from `parent` would be wrong in a different way — that is the inheritance graph, not the
 *   containment rule.
 * - **`PrimaryType.special` / `projectId`** — HxPR concepts with no Nuxeo counterpart.
 * - **`Schema.versionWritable`** — Nuxeo decides version writability per operation, not per
 *   schema.
 *
 * `MixinType.schemas` is the one place `/config/facets` is required: a doctype lists its facets
 * by name only, so without that read every facet would look like it contributes nothing.
 */
export function mapNuxeoContentModelToHx(nuxeo: NuxeoContentModel): Model {
  const primaryTypes: Record<string, PrimaryType> = {};
  for (const [name, doctype] of Object.entries(nuxeo.doctypes)) {
    primaryTypes[name] = {
      ...(doctype.parent ? { extends: doctype.parent } : {}),
      mixins: [...(doctype.facets ?? [])],
      schemas: [...(doctype.schemas ?? [])],
    };
  }

  const mixinTypes: Record<string, MixinType> = {};
  for (const facet of nuxeo.facets) {
    if (!facet?.name) continue;
    mixinTypes[facet.name] = { schemas: (facet.schemas ?? []).map((s) => s.name) };
  }

  const schemas: Record<string, Schema> = {};
  for (const schema of nuxeo.schemas) {
    if (!schema?.name) continue;
    schemas[schema.name] = mapSchema(schema);
  }

  // `types` intentionally empty — see the header. `resolveType` passes unknown types through,
  // and Nuxeo's type strings are already valid `FieldType` values.
  return { primaryTypes, mixinTypes, schemas, types: {} };
}
