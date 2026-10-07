import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { inflateRawSync } from 'node:zlib';

import { readProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import configPackageGenerator from './generator';

const ROOT = 'config-packages/acme-config';

/** The entries of a zip, read from its central directory. Enough for archives `build.mjs` writes. */
function unzip(archive: Buffer): Map<string, Buffer> {
  const end = archive.length - 22;
  if (archive.readUInt32LE(end) !== 0x06054b50)
    throw new Error('no end-of-central-directory record');
  const count = archive.readUInt16LE(end + 10);
  let at = archive.readUInt32LE(end + 16);
  const files = new Map<string, Buffer>();
  for (let n = 0; n < count; n++) {
    const compressed = archive.readUInt32LE(at + 20);
    const nameLength = archive.readUInt16LE(at + 28);
    const localOffset = archive.readUInt32LE(at + 42);
    const name = archive.toString('utf8', at + 46, at + 46 + nameLength);
    const localName = archive.readUInt16LE(localOffset + 26);
    const localExtra = archive.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localName + localExtra;
    files.set(name, inflateRawSync(archive.subarray(start, start + compressed)));
    at += 46 + nameLength;
  }
  return files;
}

describe('config-package generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('writes a package ordered after Satori: the package dependency and the component require', async () => {
    await configPackageGenerator(tree, { name: 'acme-config', owner: 'acme' });

    const packageXml = tree.read(`${ROOT}/package/package.xml`, 'utf8') ?? '';
    expect(packageXml).toContain('<package type="addon" name="acme-config" version="1.0.0">');
    expect(packageXml).toContain('<package>nuxeo-agentic-ui</package>');

    const component = tree.read(`${ROOT}/bundle/OSGI-INF/acme-config-config.xml`, 'utf8') ?? '';
    expect(component).toContain('<component name="acme.config.acme-config"');
    expect(component).toContain('<require>org.nuxeo.agentic.ui.config.defaults</require>');
    expect(component).toContain('layer="bootstrap" src="agentic-ui-config/bootstrap.json"');
    expect(component).toContain('layer="manifest" src="agentic-ui-config/manifest.json"');

    expect(tree.read(`${ROOT}/bundle/META-INF/MANIFEST.MF`, 'utf8')).toContain(
      'Nuxeo-Component: OSGI-INF/acme-config-config.xml',
    );
    expect(
      JSON.parse(tree.read(`${ROOT}/bundle/agentic-ui-config/bootstrap.json`, 'utf8') ?? ''),
    ).toEqual({
      $schema: '../../schema/bootstrap.schema.json',
      branding: { applicationTitle: 'Acme Config', documentTitle: 'Acme Config' },
    });

    const project = readProjectConfiguration(tree, 'acme-config');
    expect(project.tags).toEqual(['scope:customer', 'type:config']);
    expect(project.targets?.['build']?.options?.command).toBe(
      `node ${ROOT}/build.mjs --out dist/${ROOT}`,
    );
  });

  it('adds a presales block, preset switching on, only when asked', async () => {
    await configPackageGenerator(tree, { name: 'acme-config', owner: 'acme', presales: true });
    const bootstrap = JSON.parse(
      tree.read(`${ROOT}/bundle/agentic-ui-config/bootstrap.json`, 'utf8') ?? '',
    );
    expect(bootstrap.presales.presetSwitching).toBe(true);
    expect(Object.keys(bootstrap.presales.presets)).toEqual(['example']);

    const plain = createTreeWithEmptyWorkspace();
    await configPackageGenerator(plain, { name: 'acme-config', owner: 'acme' });
    expect(plain.read(`${ROOT}/bundle/agentic-ui-config/bootstrap.json`, 'utf8')).not.toContain(
      'presales',
    );
  });

  it('escapes the title and vendor into package.xml', async () => {
    await configPackageGenerator(tree, {
      name: 'acme-config',
      owner: 'acme',
      title: 'Acme <Claims> & Co',
      vendor: 'Acme "Insurance"',
    });
    const packageXml = tree.read(`${ROOT}/package/package.xml`, 'utf8') ?? '';
    expect(packageXml).toContain('<title>Acme &lt;Claims&gt; &amp; Co</title>');
    expect(packageXml).toContain('<vendor>Acme &#34;Insurance&#34;</vendor>');
  });

  it('refuses to overwrite an existing package unless forced', async () => {
    await configPackageGenerator(tree, { name: 'acme-config', owner: 'acme' });
    await expect(
      configPackageGenerator(tree, { name: 'acme-config', owner: 'acme' }),
    ).rejects.toThrow(/already exists/);
    await expect(
      configPackageGenerator(tree, { name: 'acme-config', owner: 'acme', force: true }),
    ).resolves.toBeDefined();
  });
});

describe('the generated build.mjs', () => {
  let dir: string;

  /** Generate into a real directory, so the generated script runs as a customer would run it. */
  async function generate(presales = false): Promise<void> {
    const tree = createTreeWithEmptyWorkspace();
    await configPackageGenerator(tree, { name: 'acme-config', owner: 'acme', presales });
    for (const change of tree.listChanges()) {
      if (!change.path.startsWith(`${ROOT}/`) || !change.content) continue;
      const target = join(dir, change.path.slice(ROOT.length + 1));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, change.content);
    }
  }

  function build(): { status: number; output: string; zip?: Buffer } {
    try {
      const output = execFileSync(
        process.execPath,
        [join(dir, 'build.mjs'), '--out', join(dir, 'out')],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      return { status: 0, output, zip: readFileSync(join(dir, 'out', 'acme-config-1.0.0.zip')) };
    } catch (error) {
      const failure = error as { status: number; stdout: string; stderr: string };
      return { status: failure.status, output: `${failure.stdout}${failure.stderr}` };
    }
  }

  const write = (path: string, content: string) => writeFileSync(join(dir, path), content);
  const fragment = 'bundle/agentic-ui-config/bootstrap.json';
  const componentXml = 'bundle/OSGI-INF/acme-config-config.xml';

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'config-package-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('writes a Marketplace zip holding the bundle, manifest first, without $schema or Markdown', async () => {
    await generate(true);
    const { status, zip } = build();
    expect(status).toBe(0);

    const archive = unzip(zip as Buffer);
    expect([...archive.keys()]).toEqual([
      'install.xml',
      'install/bundles/acme-config.jar',
      'package.xml',
    ]);
    const jar = unzip(archive.get('install/bundles/acme-config.jar') as Buffer);
    expect([...jar.keys()]).toEqual([
      'META-INF/MANIFEST.MF',
      'agentic-ui-config/bootstrap.json',
      'agentic-ui-config/manifest.json',
      'OSGI-INF/acme-config-config.xml',
    ]);
    const packaged = JSON.parse(
      jar.get('agentic-ui-config/bootstrap.json')?.toString('utf8') ?? '',
    );
    expect(packaged.$schema).toBeUndefined();
    expect(packaged.presales.presetSwitching).toBe(true);
  });

  it('is reproducible: the same source builds the same bytes, whenever it is built', async () => {
    await generate();
    const digest = () =>
      createHash('sha256')
        .update(build().zip as Buffer)
        .digest('hex');
    const first = digest();
    // Past the 2-second resolution of a zip timestamp, so a build stamping the clock would differ.
    await new Promise((resolve) => setTimeout(resolve, 2100));
    expect(digest()).toBe(first);
  });

  it.each([
    [
      'a repeated key',
      '{ "branding": {}, "branding": {} }',
      /duplicate key "branding" in the top level/,
    ],
    [
      'a nested repeated key',
      '{ "sso": { "postLoginPath": "/a", "postLoginPath": "/b" } }',
      /duplicate key "postLoginPath" in sso/,
    ],
    ['JSON that does not parse', '{ "branding": ', /bootstrap\.json: /],
    ['a fragment that is not an object', '[{ "branding": {} }]', /must be a JSON object/],
  ])('refuses %s, naming the file', async (_case, content, message) => {
    await generate();
    write(fragment, content);
    const { status, output } = build();
    expect(status).toBe(1);
    expect(output).toContain('bundle/agentic-ui-config/bootstrap.json');
    expect(output).toMatch(message);
  });

  it('refuses a fragment over the server’s 1 MiB limit', async () => {
    await generate();
    write(fragment, JSON.stringify({ padding: 'x'.repeat(1024 * 1024) }));
    const { status, output } = build();
    expect(status).toBe(1);
    expect(output).toMatch(/the server refuses a fragment over 1048576/);
  });

  it('refuses a component that does not require Satori’s defaults', async () => {
    await generate();
    write(
      componentXml,
      readFileSync(join(dir, componentXml), 'utf8').replace(/<require>[^<]*<\/require>/, ''),
    );
    const { status, output } = build();
    expect(status).toBe(1);
    expect(output).toMatch(/must <require>org\.nuxeo\.agentic\.ui\.config\.defaults<\/require>/);
  });

  it('does not count a commented-out require', async () => {
    await generate();
    const xml = readFileSync(join(dir, componentXml), 'utf8');
    write(
      componentXml,
      xml.replace(/<require>([^<]*)<\/require>/, '<!-- <require>$1</require> -->'),
    );
    const { status, output } = build();
    expect(status).toBe(1);
    expect(output).toMatch(/must <require>org\.nuxeo\.agentic\.ui\.config\.defaults<\/require>/);
  });

  it('refuses a src that names no file, and ignores the commented-out example', async () => {
    await generate();
    const xml = readFileSync(join(dir, componentXml), 'utf8');
    expect(build().status).toBe(0);

    write(
      componentXml,
      xml.replace(
        '</extension>',
        '<asset name="logo.svg" src="agentic-ui-config/assets/logo.svg" />\n  </extension>',
      ),
    );
    const { status, output } = build();
    expect(status).toBe(1);
    expect(output).toContain('src="agentic-ui-config/assets/logo.svg" names no file in bundle/');
  });
});
