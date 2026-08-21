import type { Document, User } from '@hylandsoftware/hxcs-js-client';
import { isFolderishDocument, type NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import { DEFAULT_REPOSITORY_ID } from '../tokens/adf-hx-bridge.tokens';

const FOLDERISH_NUXEO_TYPES = new Set([
  'Root',
  'Domain',
  'Workspace',
  'Folder',
  'OrderedFolder',
  'Section',
  'WorkspaceRoot',
  'DomainRoot',
  'Collection',
  'Favorites',
]);

function parentPathFrom(nuxeoPath: string): string {
  const normalized = nuxeoPath.replace(/\/+$/, '') || '/';
  if (normalized === '/') {
    return '/';
  }
  const segments = normalized.split('/').filter(Boolean);
  segments.pop();
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

function mapNuxeoTypeToHxPrimaryType(nuxeoType: string): string {
  if (nuxeoType === 'Root') {
    return 'SysRoot';
  }
  if (FOLDERISH_NUXEO_TYPES.has(nuxeoType)) {
    return 'SysFolder';
  }
  return 'SysFile';
}

function minimalEffectivePermissions(): string[] {
  return ['Browse', 'Read', 'ReadWrite', 'Everything'];
}

/**
 * A Nuxeo username as an HxPR `User`.
 *
 * Nuxeo's `dc:lastContributor` and `dc:creator` are **usernames**, not user records, so this
 * is all the information the document itself carries. `firstName`, `lastName` and `email`
 * are deliberately left unset rather than guessed: filling them would need a `/user/{id}`
 * call per distinct contributor on every page, and a fabricated display name is worse than
 * an honest username.
 *
 * If a full display name is ever wanted, the `USER` API port already resolves one — see
 * `NuxeoUserApi` — and the right place to add it is a cached batch lookup in the consumer,
 * not here in a synchronous mapper.
 */
function userFromNuxeoUsername(value: unknown): User | undefined {
  return typeof value === 'string' && value ? { id: value, username: value } : undefined;
}

/** Maps a Nuxeo document into the HxPR Document shape expected by adf-hx browse components. */
export function mapNuxeoDocumentToHx(
  doc: NuxeoDocument,
  repositoryId: string = DEFAULT_REPOSITORY_ID,
): Document {
  const folderish = isFolderishDocument(doc) || FOLDERISH_NUXEO_TYPES.has(doc.type);
  const content = doc.properties?.['file:content'] as { 'mime-type'?: string } | undefined;
  const props = doc.properties ?? {};
  const subjects = props['dc:subjects'] as string[] | undefined;

  return {
    sys_id: doc.uid,
    sys_title: doc.title,
    sys_name: doc.title,
    sys_path: doc.path,
    sys_parentPath: parentPathFrom(doc.path),
    sys_parentId: doc.parentRef,
    sys_primaryType: mapNuxeoTypeToHxPrimaryType(doc.type),
    sys_isFolderish: folderish,
    sys_modified: doc.lastModified,
    sys_created: (props['dc:created'] as string | undefined) ?? doc.lastModified,
    sys_repository: repositoryId,
    sys_mixinTypes: folderish ? ['SysFolderish'] : ['SysFileish'],
    sys_effectivePermissions: minimalEffectivePermissions(),
    sys_contentType: typeof content?.['mime-type'] === 'string' ? content['mime-type'] : undefined,
    sys_typeLabel: doc.type,
    // The **standard** HxPR fields, not just our `hx:` custom ones below.
    //
    // These three were being dropped, which is why upstream's DataTable rendered a blank
    // Last Contributor column: the value was mapped only to `hx:lastContributor`, a key
    // adf-hx components have never heard of. Anything upstream that reads
    // `sys_lastContributor`, `sys_creator` or `sys_lifecycleState` now works without a
    // per-component translation.
    sys_lastContributor: userFromNuxeoUsername(props['dc:lastContributor']),
    sys_creator: userFromNuxeoUsername(props['dc:creator']),
    sys_lifecycleState: doc.state,
    'hx:lastContributor': (props['dc:lastContributor'] as string | undefined) ?? '',
    'hx:creator': (props['dc:creator'] as string | undefined) ?? '',
    'hx:nature': (props['dc:nature'] as string | undefined) ?? '',
    'hx:coverage': (props['dc:coverage'] as string | undefined) ?? '',
    'hx:subjects': subjects?.join(', ') ?? '',
    'hx:majorVersion': props['uid:major_version'] as number | undefined,
    'hx:minorVersion': props['uid:minor_version'] as number | undefined,
  };
}

export function mapNuxeoDocumentsToHx(docs: NuxeoDocument[], repositoryId?: string): Document[] {
  return docs.map((doc) => mapNuxeoDocumentToHx(doc, repositoryId));
}

export function syntheticHxRepositoryRoot(repositoryId: string = DEFAULT_REPOSITORY_ID): Document {
  return {
    sys_id: '00000000-0000-0000-0000-000000000000',
    sys_title: 'Repository',
    sys_name: 'Repository',
    sys_path: '/',
    sys_parentPath: '/',
    sys_primaryType: 'SysRoot',
    sys_isFolderish: true,
    sys_repository: repositoryId,
    sys_mixinTypes: ['SysFolderish'],
    sys_effectivePermissions: minimalEffectivePermissions(),
  };
}
