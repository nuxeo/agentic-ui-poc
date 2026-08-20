import { NuxeoAuthAdapter } from './ports/nuxeo-auth.adapter';
import { NuxeoDocumentAdapter } from './ports/nuxeo-document.adapter';
import { NuxeoPermissionsAdapter } from './ports/nuxeo-permissions.adapter';
import { NuxeoSearchAdapter } from './ports/nuxeo-search.adapter';
import { NuxeoUploadAdapter } from './ports/nuxeo-upload.adapter';

/**
 * The port surface as it exists at the pinned upstream commit
 * 61eb45bf0e94df3fd3a62e8efd21af8ec535451e. Interfaces vanish at runtime, so this
 * is the only thing that fails when an adapter quietly grows or loses a method
 * relative to the contract it claims to implement.
 */
const PINNED_SURFACE: Readonly<Record<string, readonly string[]>> = {
  AuthPort: ['getAccessToken'],
  DocumentPort: [
    'capabilities',
    'copy',
    'createUnderParent',
    'delete',
    'getById',
    'getByPath',
    'getRoot',
    'getWithBreadcrumb',
    'getWithPermissions',
    'getWithRendition',
    'listChildren',
    'move',
    'update',
  ],
  PermissionsPort: ['capabilities', 'grant', 'list', 'revoke'],
  SearchPort: ['capabilities', 'runFilter', 'runNamedQuery'],
  UploadPort: ['attach', 'begin', 'cancel', 'capabilities', 'progress'],
};

function publicMethods(ctor: abstract new (...args: never[]) => object): string[] {
  return Object.getOwnPropertyNames(ctor.prototype)
    .filter((name) => name !== 'constructor' && !name.startsWith('#'))
    .sort();
}

describe('Nuxeo adapters match the pinned port surface', () => {
  it.each([
    ['AuthPort', NuxeoAuthAdapter],
    ['DocumentPort', NuxeoDocumentAdapter],
    ['PermissionsPort', NuxeoPermissionsAdapter],
    ['SearchPort', NuxeoSearchAdapter],
    ['UploadPort', NuxeoUploadAdapter],
  ])('%s', (port, adapter) => {
    const declared = PINNED_SURFACE[port];
    const implemented = new Set(publicMethods(adapter));

    // `private` is erased at runtime, so an exact match would flag ordinary helpers.
    // What is checkable — and what actually breaks callers — is a port method going
    // missing or being renamed relative to the pinned contract.
    expect(declared.filter((name) => !implemented.has(name))).toEqual([]);
  });
});
