import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  updateProjectConfiguration,
  type ProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { join } from 'node:path';

export interface ConfigPackageSchema {
  name: string;
  owner: string;
  title?: string;
  vendor?: string;
  version?: string;
  presales?: boolean;
  directory?: string;
  force?: boolean;
}

/** `acme-insurance` → `Acme Insurance`. */
function titleCase(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Scaffold a configuration package: the Marketplace package a customer ships to configure Nuxeo
 * Satori, instead of editing a file on the server or a document in the repository.
 *
 * ## What it generates, and why each part is there
 *
 * - `package/package.xml` depends on `nuxeo-agentic-ui`, which orders **installation**: Nuxeo
 *   refuses the package on a server without ours, and reinstalls it around an upgrade of ours.
 * - `bundle/OSGI-INF/<name>-config.xml` `<require>`s `org.nuxeo.agentic.ui.config.defaults`,
 *   which orders **contributions**, so every fragment here is applied after our defaults. Both
 *   declarations are needed; either alone leaves the order to chance.
 * - `bundle/agentic-ui-config/{bootstrap,manifest}.json` are the fragments, with `$schema`
 *   pointing at `schema/`, so an editor validates them while they are written and reviewed.
 * - `build.mjs`, run by the `build` target, checks the fragments the way the server will and
 *   writes the installable zip. It has no dependencies, so the package builds on any machine with
 *   Node and reaches a server only as a reviewed artifact.
 *
 * ## What it deliberately does not do
 *
 * It declares no minimum version of `nuxeo-agentic-ui`: every published build is currently
 * `2026.0.1-<timestamp>`, so there is no version that separates a build with the configuration
 * service from one without it. The README says what that means for the customer.
 */
export default async function configPackageGenerator(tree: Tree, options: ConfigPackageSchema) {
  const parentDirectory = options.directory ?? 'config-packages';
  // Both paths go into the `build` target's command line unquoted, which is portable across
  // shells only while they hold nothing a shell would split or interpret.
  const segments = parentDirectory.split('/');
  if (!segments.every((segment) => /^[A-Za-z0-9._-]+$/.test(segment) && !/^\.\.?$/.test(segment))) {
    throw new Error(
      `--directory "${parentDirectory}" must be a relative path of letters, digits, ".", "_" and "-" separated by "/".`,
    );
  }
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(options.name)) {
    throw new Error(`"${options.name}" must be kebab-case, e.g. acme-config.`);
  }
  const name = names(options.name);
  const projectRoot = `${parentDirectory}/${name.fileName}`;

  if (tree.exists(projectRoot) && !options.force) {
    throw new Error(
      `${projectRoot} already exists. Choose another name, delete the directory, or pass --force to overwrite the generated files.`,
    );
  }

  const title = options.title?.trim() || titleCase(name.fileName);
  const component = `${options.owner}.config.${name.fileName}`;

  const substitutions = {
    name: name.fileName,
    owner: options.owner,
    component,
    title,
    vendor: options.vendor?.trim() || title,
    version: options.version ?? '1.0.0',
    presales: options.presales === true,
    projectRoot,
    tmpl: '',
  };

  const configure = tree.exists(`${projectRoot}/project.json`)
    ? updateProjectConfiguration
    : addProjectConfiguration;
  const config: ProjectConfiguration = {
    root: projectRoot,
    projectType: 'library',
    tags: ['scope:customer', 'type:config'],
    targets: {
      build: {
        executor: 'nx:run-commands',
        cache: true,
        inputs: ['{projectRoot}/**/*'],
        outputs: [`{workspaceRoot}/dist/${projectRoot}`],
        options: {
          cwd: '{workspaceRoot}',
          command: `node ${projectRoot}/build.mjs --out dist/${projectRoot}`,
        },
      },
    },
  };
  configure(tree, name.fileName, config);

  generateFiles(tree, join(__dirname, 'files'), projectRoot, substitutions);

  await formatFiles(tree);

  return () => {
    console.log(`
Generated ${projectRoot}

  Marketplace package:  ${name.fileName} ${substitutions.version}
  Nuxeo component:      ${component}

Edit the fragments in ${projectRoot}/bundle/agentic-ui-config/, then build and install:

  npx nx build ${name.fileName}
  nuxeoctl mp-install dist/${projectRoot}/${name.fileName}-${substitutions.version}.zip

Everything in a fragment is served WITHOUT authentication — put nothing secret in it.
Raise the version in package/package.xml for every change you install, or Nuxeo will
treat the zip as the package it already has.
`);
  };
}
