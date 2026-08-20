/**
 * The Nuxeo implementation of the neutral content ports.
 *
 * Nothing outside this entry point may import it except the application composition
 * root, which calls `provideNuxeoContentAdapter()`. Feature code injects the port
 * tokens from `@agentic-ui/shared/content-ports` instead, so replacing this library
 * is a dependency change rather than a refactor. The rule is enforced by the
 * `type:content-adapter` Nx tag — see `AGENTS/00-architecture.md`.
 */

export { provideNuxeoContentAdapter } from './lib/provide-nuxeo-content-adapter';

export { NuxeoAuthAdapter } from './lib/ports/nuxeo-auth.adapter';
export { NuxeoDocumentAdapter } from './lib/ports/nuxeo-document.adapter';
export { NuxeoPermissionsAdapter } from './lib/ports/nuxeo-permissions.adapter';
export { NuxeoSearchAdapter } from './lib/ports/nuxeo-search.adapter';
export { NuxeoUploadAdapter } from './lib/ports/nuxeo-upload.adapter';

export {
  nuxeoDocumentCapabilities,
  nuxeoPermissionsCapabilities,
  nuxeoSearchCapabilities,
  nuxeoUploadCapabilities,
} from './lib/capabilities';

export { toContentNode, toResultPage } from './lib/mapping/content-node.mapper';
export { mapNuxeoError, toContentError } from './lib/mapping/error.mapper';
export { toNxqlWhere } from './lib/mapping/filter.mapper';
export { toPermission, toPermissions } from './lib/mapping/permission.mapper';
