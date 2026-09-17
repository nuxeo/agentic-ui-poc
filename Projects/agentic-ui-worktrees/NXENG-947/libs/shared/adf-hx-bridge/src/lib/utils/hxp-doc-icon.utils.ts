import type { Document } from '@hylandsoftware/hxcs-js-client';
import type { HxpIconName } from '../ui/hxp-icon/hxp-icon-paths';

const DOC_TYPE_ICON_MAP: Record<string, HxpIconName> = {
  File: 'description',
  Note: 'sticky-note',
  Picture: 'image',
  Video: 'videocam',
  Audio: 'audiotrack',
  Folder: 'folder',
  OrderedFolder: 'folder',
  Workspace: 'workspaces',
  WorkspaceRoot: 'source',
  Domain: 'public',
  Collection: 'collections-bookmark',
  SectionRoot: 'library-books',
  Section: 'library-books',
  TemplateRoot: 'dashboard-customize',
};

export function hxpDocIconName(doc: Document): HxpIconName {
  const typeLabel = (doc['sys_typeLabel'] as string | undefined) ?? doc.sys_primaryType ?? '';
  return DOC_TYPE_ICON_MAP[typeLabel] ?? 'insert-drive-file';
}
