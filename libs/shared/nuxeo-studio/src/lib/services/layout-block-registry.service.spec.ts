import { TestBed } from '@angular/core/testing';
import { LayoutBlockRegistryService } from './layout-block-registry.service';
import { LayoutBlock } from '../models/layout.model';

describe('LayoutBlockRegistryService', () => {
  let service: LayoutBlockRegistryService;

  const dcCommonBlock: LayoutBlock = {
    name: 'dc-common',
    label: 'Common Metadata',
    fields: [
      { xpath: 'dc:title', widget: 'text', label: 'Title', required: true },
      { xpath: 'dc:description', widget: 'textarea', label: 'Description' },
    ],
  };

  const contractBlock: LayoutBlock = {
    name: 'contract-details',
    label: 'Contract Details',
    fields: [
      { xpath: 'contract:amount', widget: 'number', label: 'Amount' },
      { xpath: 'contract:startDate', widget: 'date', label: 'Start Date' },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutBlockRegistryService);
  });

  it('should start empty', () => {
    expect(service.getAll()).toHaveLength(0);
    expect(service.has('dc-common')).toBe(false);
  });

  it('should register and retrieve a block', () => {
    service.register(dcCommonBlock);

    expect(service.has('dc-common')).toBe(true);
    expect(service.get('dc-common')).toBe(dcCommonBlock);
  });

  it('should register multiple blocks', () => {
    service.registerAll([dcCommonBlock, contractBlock]);

    expect(service.getAll()).toHaveLength(2);
    expect(service.has('dc-common')).toBe(true);
    expect(service.has('contract-details')).toBe(true);
  });

  it('should resolve fields from a registered block', () => {
    service.register(dcCommonBlock);

    const fields = service.resolveFields('dc-common');
    expect(fields).toHaveLength(2);
    expect(fields[0].xpath).toBe('dc:title');
    expect(fields[1].xpath).toBe('dc:description');
  });

  it('should return empty array for unregistered block', () => {
    const fields = service.resolveFields('nonexistent');
    expect(fields).toHaveLength(0);
  });

  it('should return undefined for unregistered block get', () => {
    expect(service.get('nonexistent')).toBeUndefined();
  });

  it('should remove a block', () => {
    service.register(dcCommonBlock);
    service.remove('dc-common');

    expect(service.has('dc-common')).toBe(false);
    expect(service.getAll()).toHaveLength(0);
  });

  it('should overwrite block with same name on re-register', () => {
    service.register(dcCommonBlock);

    const updatedBlock: LayoutBlock = {
      ...dcCommonBlock,
      fields: [{ xpath: 'dc:title', widget: 'text', label: 'Updated Title' }],
    };
    service.register(updatedBlock);

    expect(service.resolveFields('dc-common')).toHaveLength(1);
    expect(service.resolveFields('dc-common')[0].label).toBe('Updated Title');
  });
});
