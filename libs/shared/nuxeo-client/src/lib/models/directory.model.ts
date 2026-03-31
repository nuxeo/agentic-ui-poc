export interface DirectoryEntry {
  id: string;
  label: string;
  displayLabel: string;
  ordering: number;
  obsolete: number;
  directoryName: string;
}

export interface L10nDirectoryEntry {
  id: string;
  directoryName: string;
  properties: {
    id: string;
    parent: string;
    ordering: number;
    obsolete: number;
    label_en?: string;
    label_fr?: string;
  };
}

export interface L10nDirectoryResponse {
  entries: L10nDirectoryEntry[];
  currentPageIndex: number;
  isNextPageAvailable: boolean;
}
