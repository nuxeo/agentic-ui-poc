import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The control that the other three rest on: a production artifact does not contain
 * the demo code, so no environment variable, header or misconfiguration can reach
 * it. `tsconfig.app.json` excludes `src/demo/**` and `src/main.demo.ts`, and the
 * production build is a separate Nx target from the demo one.
 *
 * A build-time exclusion is only as good as the import graph, though: one
 * convenient `import { DEMO_SCRIPTS }` in a shared module would pull the whole thing
 * back into the production bundle, and `tsc` would fail — but only after somebody
 * had already written the import and possibly worked around the failure by relaxing
 * the exclude. So this walks the graph from `main.ts` and states the rule directly,
 * with the reason attached, which is what makes it survive review.
 */

const projectRoot = resolve(__dirname, '..', '..');
const srcRoot = join(projectRoot, 'src');

/** Relative import specifiers in a TypeScript source file. */
function localImports(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const specifiers: string[] = [];
  const pattern = /(?:from|import)\s*['"](\.[^'"]+)['"]/g;
  let match = pattern.exec(source);
  while (match) {
    if (match[1]) specifiers.push(match[1]);
    match = pattern.exec(source);
  }
  return specifiers;
}

function resolveModule(fromFile: string, specifier: string): string | undefined {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [`${base}.ts`, join(base, 'index.ts')]) {
    try {
      readFileSync(candidate, 'utf8');
      return candidate;
    } catch {
      // Not this candidate; try the next.
    }
  }
  return undefined;
}

/** Every source file reachable from an entry point by relative import. */
function reachableFrom(entry: string): string[] {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    for (const specifier of localImports(file)) {
      const resolved = resolveModule(file, specifier);
      if (resolved) queue.push(resolved);
    }
  }
  return [...seen].map((file) => relative(srcRoot, file).split('\\').join('/'));
}

const tsconfigApp = JSON.parse(readFileSync(join(projectRoot, 'tsconfig.app.json'), 'utf8')) as {
  exclude?: string[];
};

const projectConfig = JSON.parse(readFileSync(join(projectRoot, 'project.json'), 'utf8')) as {
  targets: Record<string, { options?: Record<string, unknown> }>;
};

describe('demo mode cannot reach a production build', () => {
  it('is unreachable from the production entry point', () => {
    const reachable = reachableFrom(join(srcRoot, 'main.ts'));
    const leaked = reachable.filter((file) => file.startsWith('demo/') || file === 'main.demo.ts');
    expect(
      leaked,
      'A production import of demo code would ship the scripts in the production ' +
        'artifact, where an environment variable could then reach them. Compose the demo ' +
        'wiring in main.demo.ts instead.',
    ).toEqual([]);
  });

  it('is unreachable from the public barrel, which consumers import', () => {
    const reachable = reachableFrom(join(srcRoot, 'index.ts'));
    expect(reachable.filter((file) => file.startsWith('demo/'))).toEqual([]);
  });

  it('does reach the production code from the demo entry point, which is the point', () => {
    const reachable = reachableFrom(join(srcRoot, 'main.demo.ts'));
    // Demo mode substitutes the model and two tools; everything else is the shipped
    // composition, so a bug in the real HTTP surface still shows up in the demo.
    expect(reachable).toContain('http/server.ts');
    expect(reachable).toContain('agent/run-agent.ts');
    expect(reachable).toContain('tools/default-registry.ts');
    expect(reachable).toContain('demo/demo-scripts.ts');
  });

  it('is excluded from the production TypeScript program', () => {
    expect(tsconfigApp.exclude).toContain('src/demo/**/*.ts');
    expect(tsconfigApp.exclude).toContain('src/main.demo.ts');
  });

  it('is built by its own target, into its own output directory', () => {
    expect(projectConfig.targets['build']?.options?.['main']).toBe(
      'apps/agent-gateway/src/main.ts',
    );
    expect(projectConfig.targets['build-demo']?.options?.['main']).toBe(
      'apps/agent-gateway/src/main.demo.ts',
    );
    expect(projectConfig.targets['build']?.options?.['outputPath']).not.toBe(
      projectConfig.targets['build-demo']?.options?.['outputPath'],
    );
  });
});
