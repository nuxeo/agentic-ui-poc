export type HxpIconName =
  | 'chevron-right'
  | 'chevron-left'
  | 'close'
  | 'refresh'
  | 'error-outline'
  | 'folder-open'
  | 'arrow-up'
  | 'arrow-down'
  | 'folder'
  | 'file'
  | 'description'
  | 'sticky-note'
  | 'image'
  | 'videocam'
  | 'audiotrack'
  | 'workspaces'
  | 'source'
  | 'public'
  | 'collections-bookmark'
  | 'library-books'
  | 'dashboard-customize'
  | 'insert-drive-file'
  | 'view-list'
  | 'grid-view'
  | 'tune'
  | 'download'
  | 'add'
  | 'cloud-upload'
  | 'edit'
  | 'delete'
  | 'more-vert'
  | 'share'
  | 'notifications'
  | 'notifications-off'
  | 'export'
  | 'restore'
  | 'info'
  | 'info-outline'
  | 'delete-outline'
  | 'email'
  | 'lock';

/** SVG path data (stroke icons, 24×24 viewBox). */
export const HXP_ICON_PATHS: Record<HxpIconName, string | readonly string[]> = {
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  refresh: 'M4 12a8 8 0 0 1 13.7-5.7M20 7v4h-4M20 12a8 8 0 0 1-13.7 5.7M4 17v-4h4',
  'error-outline':
    'M12 8v5M12 16h.01M10.3 4.7 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0z',
  'folder-open':
    'M4 8V6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M4 8h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z',
  'arrow-up': 'M12 6l-6 6h4v6h4v-6h4l-6-6z',
  'arrow-down': 'M12 18l6-6h-4V6h-4v6H6l6 6z',
  folder: 'M4 6h6l2 2h8v10a2 2 0 0 1-2 2H4V6z',
  file: 'M8 3h6l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
  description: 'M8 3h6l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 3v5h5',
  'sticky-note': 'M6 4h10v14H6V4zM10 4v14M6 8h10',
  image: 'M4 16l4-4 4 4 4-6 4 6M4 6h16v12H4V6z',
  videocam: 'M4 7h10v10H4V7zM14 10l6-3v10l-6-3',
  audiotrack:
    'M9 18V6l10-2v14M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  workspaces: 'M4 8h6v12H4V8zM14 8h6v12h-6V8zM4 4h16',
  source: 'M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5',
  public:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM2 12h20M12 3c2.5 3 4 6 4 9s-1.5 6-4 9M12 3c-2.5 3-4 6-4 9s1.5 6 4 9',
  'collections-bookmark': 'M6 4h12v16l-6-4-6 4V4z',
  'library-books': 'M4 6h5v14H4V6zM10 6h5v14h-5V6zM16 6h4v14h-4V6z',
  'dashboard-customize': 'M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z',
  'insert-drive-file': 'M8 3h6l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
  'view-list': 'M4 6h16M4 12h16M4 18h16',
  'grid-view': 'M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z',
  tune: 'M4 6h16M8 12h8M10 18h4',
  download: 'M12 4v10M8 10l4 4 4-4M4 20h16',
  add: 'M12 5v14M5 12h14',
  'cloud-upload': 'M7 14l5-5 5 5M12 9v10M4 20h16',
  edit: 'M4 18h2l10-10-2-2L4 16v2zM14 6l2 2',
  delete: 'M4 7h16M9 7V5h6v2M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7',
  'more-vert': 'M12 6v.01M12 12v.01M12 18v.01',
  share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14',
  notifications: 'M12 4a4 4 0 0 1 4 4v4l2 2H6l2-2V8a4 4 0 0 1 4-4zM10 18a2 2 0 0 0 4 0',
  'notifications-off': 'M5 5l14 14M12 4a4 4 0 0 0-4 4v4l-2 2h14',
  export: 'M12 4v10M16 8l-4-4-4 4M4 20h16',
  restore: 'M4 12h12M8 8l-4 4 4 4M20 8v8',
  info: 'M12 8v.01M12 12v4M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z',
  'info-outline': 'M12 8v.01M12 12v4M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z',
  'delete-outline': 'M4 7h16M9 7V5h6v2M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7',
  email: 'M4 6h16v12H4V6zM4 6l8 6 8-6',
  lock: 'M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10z',
};
