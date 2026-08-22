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

/** The pseudo-schema name and prefix for the bridge's own `sys_*` fields. */
export const SYS_SCHEMA_NAME = 'sys';

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
 * The `sys` pseudo-schema, describing the fields **this bridge's own document mapper emits**.
 *
 * Nuxeo has no `sys` schema — its are `dublincore`, `common`, `uid`, `file` — so a faithfully
 * translated Nuxeo model types none of the `sys_*` fields. And `sys_*` is exactly what upstream's
 * `TOP_DEFAULT_PROPERTIES` puts in the properties panel's *main* section, so without this every
 * one of them falls back to `FieldType.String`. Observed before this existed:
 *
 * - `Created` and `Last Modified` rendered `2026-08-22T14:23:05.687Z` instead of a formatted date;
 * - `Creator` and `Last Contributor` rendered **`[object Object]`**, because a `User` stringified
 *   as a string.
 *
 * This is not invented content-model knowledge. Every entry below is a field
 * `nuxeo-to-hx-document.mapper.ts` demonstrably produces, with the type it demonstrably produces —
 * declaring our own output rather than guessing at Nuxeo's. If the two drift apart, the panel
 * mistypes a field, which is why `nuxeo-model-api.spec.ts` asserts the pair together.
 */
const SYS_SCHEMA_FIELDS: Readonly<Record<string, string>> = {
  sys_id: 'string',
  sys_title: 'string',
  sys_name: 'string',
  sys_path: 'string',
  sys_parentPath: 'string',
  sys_parentId: 'string',
  sys_primaryType: 'string',
  sys_typeLabel: 'string',
  sys_repository: 'string',
  sys_contentType: 'string',
  sys_lifecycleState: 'string',
  sys_isFolderish: 'boolean',
  sys_created: 'date',
  sys_modified: 'date',
  // `user`, not `string`. This is what routes the value through `UserResolverPipe` instead of
  // stringifying the `User` object.
  sys_creator: 'user',
  sys_lastContributor: 'user',
  sys_contributors: 'user[]',
  sys_mixinTypes: 'string[]',
  sys_effectivePermissions: 'string[]',
};

/** Nuxeo's content-bearing schema. Its presence is what makes a doctype hold a main blob. */
const NUXEO_CONTENT_SCHEMA = 'file';

/**
 * A doctype's Nuxeo facets, plus the HxPR mixin adf-hx classifies types by.
 *
 * `DocumentModel.getFolderishTypes()` and `getFilishTypes()` filter on `SysFolderish` and
 * `SysFilish`; Nuxeo says `Folderish` and, for a file, nothing at all. Without this translation
 * the properties panel's **Category** selector renders empty, because
 * `PropertyUtilService.availableDocumentCategories` builds its option list from those two calls.
 * The Nuxeo names are kept alongside rather than replaced.
 *
 * `SysFilish` is decided by the **`file` schema**, not by "is not `Folderish`". The first attempt
 * used that fallback and got `Folder` wrong: `hasMixin` walks `extends`, `Folder extends Document`,
 * and `Document` is not `Folderish` — so `Document` was marked filish and `Folder` **inherited**
 * it, putting every folder in `getFilishTypes()`. Keying on the content schema also matches what
 * `SysFilish` means in HxPR — has a main blob — and leaves an abstract type like `Document`
 * correctly in neither category.
 */
function hxMixinsForDoctype(facets: readonly string[], schemas: readonly string[]): string[] {
  const extra: string[] = [];
  if (facets.includes('Folderish')) extra.push('SysFolderish');
  if (schemas.includes(NUXEO_CONTENT_SCHEMA)) extra.push('SysFilish');
  return [...facets, ...extra];
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
      mixins: hxMixinsForDoctype(doctype.facets ?? [], doctype.schemas ?? []),
      // `sys` is appended so a type's schema list matches the properties its documents carry.
      schemas: [...(doctype.schemas ?? []), SYS_SCHEMA_NAME],
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
  // Added last so a Nuxeo schema genuinely called `sys` would be overridden rather than silently
  // merged. None exists today; the ordering makes that safe rather than lucky.
  schemas[SYS_SCHEMA_NAME] = {
    prefix: SYS_SCHEMA_NAME,
    // Already prefixed, unlike Nuxeo's, so these are used as-is.
    fields: Object.fromEntries(Object.entries(SYS_SCHEMA_FIELDS).map(([k, t]) => [k, { type: t }])),
  };

  // `types` intentionally empty — see the header. `resolveType` passes unknown types through,
  // and Nuxeo's type strings are already valid `FieldType` values.
  return { primaryTypes, mixinTypes, schemas, types: {} };
}
