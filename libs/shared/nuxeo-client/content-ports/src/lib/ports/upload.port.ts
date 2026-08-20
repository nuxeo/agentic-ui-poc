import type { Observable } from 'rxjs';
import type { ContentNode, ContentNodeDraft } from '../domain/content-node';
import type { UploadHandle, UploadOptions, UploadProgress } from '../domain/upload';
import type { UploadCapabilities } from './capabilities';

/**
 * Two-stage stage-then-attach upload. `begin` stages the bytes and returns a handle;
 * `attach` materialises the node under a parent. Splitting the stages lets the UI
 * show progress and cancel before commit.
 */
export interface UploadPort {
  begin(file: File, options?: UploadOptions): UploadHandle;
  progress(handle: UploadHandle): Observable<UploadProgress>;
  attach(handle: UploadHandle, parentId: string, draft: ContentNodeDraft): Observable<ContentNode>;
  cancel(handle: UploadHandle): void;
  capabilities(): UploadCapabilities;
}
