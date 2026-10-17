export const DOC_TYPE_ICONS = {
    File: 'description',
    Note: 'sticky_note_2',
    Picture: 'image',
    Video: 'videocam',
    Audio: 'audiotrack',
    Folder: 'folder',
    OrderedFolder: 'folder',
    Workspace: 'workspaces',
    WorkspaceRoot: 'source',
    Domain: 'public',
    Collection: 'collections_bookmark',
    SectionRoot: 'library_books',
    Section: 'library_books',
    TemplateRoot: 'dashboard_customize',
};
export function docTypeIcon(type) {
    return DOC_TYPE_ICONS[type] ?? 'insert_drive_file';
}
//# sourceMappingURL=doc-type-icons.js.map