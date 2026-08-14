import type { Document } from '@hylandsoftware/hxcs-js-client';

/** Folder tree node for adf-hx browse side navigation. */
export interface HxpBrowseFolderNode {
  doc: Document;
  children: HxpBrowseFolderNode[];
  expanded: boolean;
  loaded: boolean;
  loading: boolean;
  isRoot?: boolean;
}
