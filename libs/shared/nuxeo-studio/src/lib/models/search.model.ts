import type { WidgetType } from './layout.model';

export interface SearchFieldConfig {
  xpath: string;
  label: string;
  widget: WidgetType;
  placeholder?: string;
  directory?: string;
  multiple?: boolean;
  /** Operator: =, !=, <, >, <=, >=, LIKE, IN, BETWEEN, FULLTEXT */
  operator?: string;
}

export interface ResultColumnConfig {
  xpath: string;
  label: string;
  sortable: boolean;
  width?: string;
}

export interface SearchConfig {
  id: string;
  name: string;
  label: string;
  icon: string;
  available: boolean;
  /** Page provider query pattern — uses NXQL */
  queryPattern: string;
  /** Search form fields */
  searchFields: SearchFieldConfig[];
  /** Result columns */
  resultColumns: ResultColumnConfig[];
  /** Default sort */
  defaultSort: string;
  defaultSortOrder: 'ASC' | 'DESC';
  /** Page size */
  pageSize: number;
}

export function createDefaultSearch(): SearchConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    label: '',
    icon: 'search',
    available: true,
    queryPattern: 'SELECT * FROM Document WHERE ecm:isTrashed = 0 AND ecm:isVersion = 0',
    searchFields: [],
    resultColumns: [
      { xpath: 'dc:title', label: 'Title', sortable: true },
      { xpath: 'dc:modified', label: 'Modified', sortable: true },
      { xpath: 'dc:creator', label: 'Author', sortable: true },
    ],
    defaultSort: 'dc:modified',
    defaultSortOrder: 'DESC',
    pageSize: 20,
  };
}
