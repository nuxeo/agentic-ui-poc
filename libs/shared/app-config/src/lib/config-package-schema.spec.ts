import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEFAULT_APP_BOOTSTRAP_CONFIG } from './bootstrap-config';
import { DEFAULT_APP_RUNTIME_MANIFEST } from './runtime-manifest';

/**
 * The JSON schemas the `config-package` generator writes into every customer package.
 *
 * They refuse unknown keys, because the application ignores one silently and a typo would
 * otherwise ship as a change that does nothing. That makes a key added here and not there worse
 * than a gap: a customer's editor would mark the new, valid key as an error. So the schemas are
 * held to the defaults, which name every key the merge functions read.
 */
const SCHEMAS = resolve(
  __dirname,
  '../../../../../tools/satori-generators/src/config-package/files/schema',
);

interface ObjectSchema {
  properties: Record<string, ObjectSchema>;
}

function schema(name: string): ObjectSchema {
  return JSON.parse(readFileSync(resolve(SCHEMAS, `${name}.schema.json__tmpl__`), 'utf8'));
}

const keys = (value: object | ObjectSchema['properties'], except: string[] = []) =>
  Object.keys(value)
    .filter((key) => !except.includes(key))
    .sort();

describe('the configuration package schemas', () => {
  it('list every bootstrap key the application reads, and no other', () => {
    const bootstrap = schema('bootstrap').properties;
    // `presales` is read by `readPresales`, not merged, so it has no default.
    expect(keys(bootstrap, ['$schema', 'presales'])).toEqual(keys(DEFAULT_APP_BOOTSTRAP_CONFIG));
    for (const section of ['branding', 'integrations', 'session', 'sso'] as const) {
      expect(keys(bootstrap[section].properties), section).toEqual(
        keys(DEFAULT_APP_BOOTSTRAP_CONFIG[section]),
      );
    }
  });

  it('list every manifest key the application reads, and no other', () => {
    // `extensions` is the source key that becomes `extensionLayers` once merged.
    expect(keys(schema('manifest').properties, ['$schema', 'extensions'])).toEqual(
      keys(DEFAULT_APP_RUNTIME_MANIFEST, ['extensionLayers']),
    );
  });
});
