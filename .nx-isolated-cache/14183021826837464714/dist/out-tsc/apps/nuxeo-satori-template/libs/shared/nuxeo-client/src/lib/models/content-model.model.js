/**
 * Nuxeo's content model as its `/config/*` endpoints describe it.
 *
 * Three endpoints, because no single one is complete:
 *
 * - `/config/types` → `{ doctypes, schemas }`. Doctypes carry `parent`, `facets` and the
 *   schema names they use. Its `schemas` map is a **flat** shape and covers only the 48
 *   schemas reachable from a doctype.
 * - `/config/facets` → every facet, with the schemas each contributes. A doctype's `facets`
 *   are names only, so this is the only way to know what a facet adds.
 * - `/config/schemas` → all 98 schemas in a **nested** shape (`{ name, @prefix, fields }`),
 *   including the ones only a facet reaches. This is the superset and the one to use.
 *
 * Measured against the local instance: 60 doctypes, 65 facets, 98 schemas, versus 48 schemas
 * in `/config/types`. Reading schemas from `/config/types` would silently omit fifty of them.
 */
