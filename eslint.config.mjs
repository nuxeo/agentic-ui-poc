import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vitest.config.*.timestamp*',
      '**/vite.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // ── The 4-layer model of AGENTS/00-architecture.md ──
            //
            // Removing the `'*' → ['*']` rule that used to sit here is what makes any of
            // this bite: with no matching constraint Nx reports "a project without tags
            // matching at least one constraint cannot depend on any libraries", so an
            // untagged or mistagged project now fails lint instead of quietly escaping
            // every rule below. Give new projects a `scope:` tag.

            // The app shell composes features and shared libraries, and is the only
            // project that may name a concrete backend adapter — that is what keeps the
            // backend swappable.
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                'scope:app',
                'scope:features',
                'scope:shared',
                'scope:core',
              ],
            },
            // A feature reaches down into shared, never sideways into another feature.
            // Shared behaviour between two features belongs in libs/shared.
            {
              sourceTag: 'scope:features',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:core'],
            },
            // Shared code knows nothing about the features or the shell that consume it.
            // The inverse dependency is the one that makes a shared library unshippable.
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:core'],
            },
            // libs/core is the leaf: framework primitives with no workspace dependency.
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: [],
            },
            // The agent gateway is a standalone Node service. It shares no code with the
            // browser bundle, and importing an Angular library into it would not build.
            {
              sourceTag: 'scope:agent-gateway',
              onlyDependOnLibsWithTags: [],
            },

            // ── The content-port / adapter boundary ──
            // The content-port contract is a pure contract. If it ever imports a
            // workspace library it has stopped being backend-neutral.
            {
              sourceTag: 'type:port-contract',
              onlyDependOnLibsWithTags: [],
            },
            // A backend adapter may see the contract it implements and the
            // data-access layer it wraps, and nothing else.
            {
              sourceTag: 'type:content-adapter',
              onlyDependOnLibsWithTags: ['type:port-contract', 'type:data-access'],
            },
            // Only the application composition root may bind a backend adapter.
            // Everything else injects the neutral port tokens, which is what makes
            // swapping backends a dependency change rather than a refactor.
            {
              sourceTag: 'scope:features',
              notDependOnLibsWithTags: ['type:content-adapter'],
            },
            {
              sourceTag: 'type:ui',
              notDependOnLibsWithTags: ['type:content-adapter'],
            },
            {
              sourceTag: 'type:data-access',
              notDependOnLibsWithTags: ['type:content-adapter'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'no-duplicate-imports': 'error',
    },
  },
];
