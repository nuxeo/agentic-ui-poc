import {
  DOMAIN_CONTAINER_GUIDANCE,
  filterCreatableSubtypesForParent,
  isDomainParentType,
  resolveCreatableSubtypes,
} from './creatable-subtypes';
import type { NuxeoDocument } from '../models/document.model';

describe('creatable-subtypes', () => {
  it('isDomainParentType is true only for Domain', () => {
    expect(isDomainParentType('Domain')).toBe(true);
    expect(isDomainParentType('WorkspaceRoot')).toBe(false);
    expect(isDomainParentType(null)).toBe(false);
  });

  it('filterCreatableSubtypesForParent removes structural roots under Domain', () => {
    const input = ['Domain', 'WorkspaceRoot', 'SectionRoot', 'TemplateRoot', 'Folder'];
    expect(filterCreatableSubtypesForParent('Domain', input)).toEqual(['Domain', 'Folder']);
  });

  it('filterCreatableSubtypesForParent leaves subtypes unchanged for WorkspaceRoot', () => {
    const input = ['Workspace', 'Folder'];
    expect(filterCreatableSubtypesForParent('WorkspaceRoot', input)).toEqual(input);
  });

  it('resolveCreatableSubtypes filters structural roots under Domain documents', () => {
    const doc: NuxeoDocument = {
      uid: 'domain-1',
      title: 'Domain-1',
      type: 'Domain',
      path: '/domain-1',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
      contextParameters: {
        subtypes: ['Domain', 'WorkspaceRoot', 'SectionRoot', 'TemplateRoot', 'Folder'],
      },
    };
    expect(resolveCreatableSubtypes(doc)).toEqual(['Folder', 'Domain']);
  });
});
