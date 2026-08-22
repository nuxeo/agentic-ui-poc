import type { Document, User } from '@hylandsoftware/hxcs-js-client';
import { isFolderishDocument, type NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import { DEFAULT_REPOSITORY_ID, SYS_ROOT } from '../tokens/adf-hx-bridge.tokens';

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

/**
 * `sys_primaryType` is the **key into the type registry**, so it carries the Nuxeo doctype name.
 *
 * This used to return a synthetic `SysFolder` / `SysFile`, and that was a mistake of ours alone:
 * the `MODEL` port keys `primaryTypes` by Nuxeo doctype — `File`, `Folder`, `Workspace`, sixty of
 * them — because that is the only registry Nuxeo has. A field must agree with the registry it
 * indexes. Every upstream use of `sys_primaryType` except `isRoot()` is a lookup or a query:
 *
 * - `createCardItemUtil` renders it as a select whose options come from the model, so a synthetic
 *   value matched no option and the properties panel's **Category field rendered empty**;
 * - `extractCustomSchemaFields(sys_primaryType)` reads `primaryTypes[type].schemas`, so the
 *   metadata sidebar would find **no custom schema fields**;
 * - `getSubtypes(primaryType)` silently falls back to all sixty types;
 * - the document-category search filter emits `sys_primaryType IN ('…')` as HXQL, which would
 *   have queried a type name Nuxeo has never heard of.
 *
 * Nothing anywhere — upstream or ours — compares this against `SysFolder` or `SysFile`.
 * Folderishness travels on `sys_isFolderish` and `sys_mixinTypes`, both set independently below,
 * which is why dropping the synthetic classification costs nothing.
 *
 * **`SysRoot` stays**, and is the one honest synthesis here: the repository root this bridge
 * presents is not a Nuxeo document at all. Both `isHxRootDocument()` and upstream's `isRoot()`
 * test for it. Nuxeo's real `Root` doctype maps to it too, so the two roots agree.
 */
function mapNuxeoTypeToHxPrimaryType(nuxeoType: string): string {
  return nuxeoType === 'Root' ? SYS_ROOT : nuxeoType;
}

/**
 * Nuxeo permission -> the HxPR `DocumentPermissions` value it satisfies.
 *
 * Six map by identity — `Read`, `Write`, `ReadWrite`, `Everything`, `ReadVersion`, `WriteVersion` —
 * because the two vocabularies happen to agree. The rest are Nuxeo's own names for the same idea.
 *
 * Two are approximations and are called out rather than smoothed over:
 *
 * - **`ManageLock`** ← Nuxeo `Unlock`. Nuxeo governs locking through `WriteProperties` *and*
 *   `Unlock`; `Unlock` is the narrower and more meaningful of the two, since anyone who can unlock
 *   another user's lock is who upstream means by "manage lock".
 * - **`ManageRetention`** needs **both** `SetRetention` and `UnsetRetention` — see
 *   `HX_PERMISSION_REQUIRES_ALL`. Nuxeo splits the two, and holding only one is not management.
 */
export const HX_PERMISSION_FROM_NUXEO: Readonly<Record<string, string>> = {
  Read: 'Read',
  Write: 'Write',
  ReadWrite: 'ReadWrite',
  Everything: 'Everything',
  ReadVersion: 'ReadVersion',
  WriteVersion: 'WriteVersion',
  AddChildren: 'CreateChild',
  RemoveChildren: 'DeleteChild',
  Remove: 'Delete',
  Version: 'CreateVersion',
  WriteSecurity: 'ManageSecurity',
  Unlock: 'ManageLock',
};

/** HxPR permissions that require every listed Nuxeo permission, not any one of them. */
const HX_PERMISSION_REQUIRES_ALL: Readonly<Record<string, readonly string[]>> = {
  ManageRetention: ['SetRetention', 'UnsetRetention'],
};

/**
 * A document's effective permissions **for the current user**, from Nuxeo's `permissions` enricher.
 *
 * This closes the last of the five recorded bridge defects. It used to return a fixed
 * `['Browse', 'Read', 'ReadWrite', 'Everything']` for every document, so upstream's
 * `hasPermission()` answered from a constant and every document looked fully writable.
 *
 * **Returns `undefined` when the enricher is absent**, and that distinction is deliberate. An empty
 * array asserts "this user has no permissions"; `undefined` says "we did not ask". A read that omits
 * `enrichers.document=permissions` cannot know, and inventing either answer is how the original
 * defect happened. `hasPermission` treats an absent list as not-granted — conservative, and correct
 * given that **hiding an action is not a security control**: Nuxeo's server-side ACLs gate every
 * operation regardless of what this returns.
 */
function effectivePermissions(doc: NuxeoDocument): string[] | undefined {
  const granted = doc.contextParameters?.['permissions'];
  if (!Array.isArray(granted)) {
    return undefined;
  }

  const nuxeo = new Set(granted.filter((p): p is string => typeof p === 'string'));
  const mapped = new Set<string>();
  for (const permission of nuxeo) {
    const hx = HX_PERMISSION_FROM_NUXEO[permission];
    if (hx) mapped.add(hx);
  }
  for (const [hx, required] of Object.entries(HX_PERMISSION_REQUIRES_ALL)) {
    if (required.every((permission) => nuxeo.has(permission))) mapped.add(hx);
  }
  return [...mapped];
}

/**
 * A Nuxeo username as an HxPR `User`.
 *
 * DEGRADED(adf-hx): D4 — the username is shown where a display name belongs.
 *
 * Nuxeo's `dc:lastContributor` and `dc:creator` are **usernames**, not user records, so the
 * username is all the information the document itself carries. `email` stays unset: no
 * plausible value exists for it and a fabricated one would be worse than none.
 *
 * `firstName` carries the username and `lastName` is empty, and that is not cosmetic.
 * Upstream renders every `User` object through `UserResolverService.getFullName`, which is
 * literally `` `${user.firstName} ${user.lastName}` `` with no guard — an earlier version of
 * this function left both unset, and the adopted versions panel rendered its creator line as
 * `undefined undefined`. Putting the username in `firstName` makes the composed name read
 * `jdoe`; putting it in both would read `jdoe jdoe`.
 *
 * This is *not* a display-name lookup. A real first and last name needs a `/user/{id}` call,
 * which a synchronous mapper cannot make. Where upstream is given a username **string** it
 * resolves one itself through `UserService.resolveUser` — cached per id — and that path goes
 * through `NuxeoUserApi`, which does return the real names when Nuxeo has them.
 */
function userFromNuxeoUsername(value: unknown): User | undefined {
  return typeof value === 'string' && value
    ? { id: value, username: value, firstName: value, lastName: '' }
    : undefined;
}

/** A Nuxeo blob, as its REST payload describes one. */
interface NuxeoBlob {
  name?: string;
  'mime-type'?: string;
  length?: number | string;
  [key: string]: unknown;
}

function isNuxeoBlob(value: unknown): value is NuxeoBlob {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    // `mime-type` is the discriminator: Nuxeo puts it on every blob and on nothing else.
    'mime-type' in value
  );
}

/**
 * A Nuxeo blob as the shape adf-core's property card reads.
 *
 * `PropertyUtilService.createBlobCardItems` builds three cards from
 * `<property>.filename`, `.mimeType` and `.length`. Nuxeo names the same three `name`,
 * `mime-type` and `length`, so an unmapped blob renders three empty cards. `data`, `digest`
 * and `encoding` are dropped: nothing reads them, and `data` is a download URL that has no
 * business in a metadata panel.
 */
function blobForHx(blob: NuxeoBlob): Record<string, unknown> {
  return {
    filename: blob.name,
    mimeType: blob['mime-type'],
    length: typeof blob.length === 'string' ? Number(blob.length) : blob.length,
  };
}

/**
 * Nuxeo's `properties` as the `prefix_field` keys adf-hx addresses properties by.
 *
 * Nuxeo writes `dc:title`; HxPR writes `dc_title`. That single substitution is what lets
 * upstream's metadata panel find a type for each property, because `getSchemaByPrefix` splits
 * the key on `_` and then looks the whole key up in the schema's `fields` — see
 * `nuxeo-to-hx-model.mapper.ts`, which keys the model the same way. Without both halves the
 * panel renders every value as an untyped string.
 *
 * Two deliberate omissions:
 *
 * - **Empty values are skipped** — `null`, `undefined`, `''` and `[]`. Upstream lists
 *   properties from `Object.keys(document)`, so a document answered with `properties: *`
 *   would otherwise contribute around a hundred blank cards, most of them from schemas the
 *   document has never used. A property Nuxeo holds no value for is not metadata to show.
 * - **Keys without a prefix are skipped.** `translateProperty` returns an empty label for any
 *   key with no `_` in it, so an unprefixed key renders as a card with no name at all.
 */
function nuxeoPropertiesForHx(props: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [nuxeoKey, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    const separator = nuxeoKey.indexOf(':');
    if (separator <= 0) continue;
    const hxKey = `${nuxeoKey.slice(0, separator)}_${nuxeoKey.slice(separator + 1)}`;
    mapped[hxKey] = isNuxeoBlob(value) ? blobForHx(value) : value;
  }
  return mapped;
}

/**
 * Maps a Nuxeo document into the HxPR Document shape expected by adf-hx browse components.
 *
 * The document carries **two** property surfaces on purpose, and upstream's own design is what
 * makes that work rather than duplicate:
 *
 * - the `sys_*` fields, which upstream's `TOP_DEFAULT_PROPERTIES` orders into its default panel;
 * - Nuxeo's real properties as `prefix_field`, which land in the panel's *other* section because
 *   upstream excludes `sys_`, `sysfile_blob`, `sysver_` and `sysgov_` from it.
 *
 * So a document shows its Nuxeo metadata — `dc:nature`, `dc:subjects`, `file:content` — with the
 * right types, and nothing appears twice.
 *
 * The previous `hx:*` keys are **gone**. They held the same Dublin Core values under names no
 * adf-hx component has heard of, and they would have rendered in the adopted panel as cards with
 * **no label at all**: `translateProperty` splits on `_`, and `hx:nature` has none. Their
 * consumers read the Nuxeo keys directly now.
 */
export function mapNuxeoDocumentToHx(
  doc: NuxeoDocument,
  repositoryId: string = DEFAULT_REPOSITORY_ID,
): Document {
  const folderish = isFolderishDocument(doc) || FOLDERISH_NUXEO_TYPES.has(doc.type);
  const content = doc.properties?.['file:content'] as { 'mime-type'?: string } | undefined;
  const props = doc.properties ?? {};

  return {
    // First, so a `sys_*` field always wins over a Nuxeo property of the same name. None
    // collide today — Nuxeo has no `sys` schema — but the ordering makes that safe by
    // construction rather than by coincidence.
    ...nuxeoPropertiesForHx(props),
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
    // `SysFilish`, with no `e`. adf-hx spells it that way in all four places it appears —
    // `isFile()`, `getFilishTypes()` and two mixin checks — and Angular compares strings, so
    // the plausible-looking `SysFileish` this used to emit meant upstream's `isFile()` was
    // **always false** for every non-folder document we produced. Its visible consequence is
    // in `PropertyUtilService.availableDocumentCategories`, which feeds the metadata sidebar's
    // document-type selector: with no filish types contributed it falls back to offering only
    // the document's current type.
    sys_mixinTypes: folderish ? ['SysFolderish'] : ['SysFilish'],
    sys_effectivePermissions: effectivePermissions(doc),
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
    sys_primaryType: SYS_ROOT,
    // The folder header renders `sys_typeLabel ?? sys_primaryType` as its subtitle, and with this
    // unset the POC's landing screen read **"Repository / SysRoot"** — an internal identifier shown
    // to a user. `SysRoot` is the right *primary type*, because `isRoot()` tests for it; it is not
    // a label. "Repository" is what this node is, and unlike a doctype name it is not a guess.
    sys_typeLabel: 'Repository',
    sys_isFolderish: true,
    sys_repository: repositoryId,
    sys_mixinTypes: ['SysFolderish'],
    // The synthetic root is not a Nuxeo document, so no enricher can describe it. `Read` and
    // `CreateChild` are what this node actually supports — it can be listed and it contains
    // domains — and nothing more is claimed.
    sys_effectivePermissions: ['Read', 'CreateChild'],
  };
}
