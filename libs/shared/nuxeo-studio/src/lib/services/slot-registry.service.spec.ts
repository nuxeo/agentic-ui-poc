import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SlotRegistryService } from './slot-registry.service';

@Component({ standalone: true, template: '' })
class MockActionComponent {}

@Component({ standalone: true, template: '' })
class MockBannerComponent {}

describe('SlotRegistryService', () => {
  let service: SlotRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotRegistryService);
  });

  it('should start empty', () => {
    expect(service.getSlotNames()).toHaveLength(0);
    expect(service.has('any-slot')).toBe(false);
  });

  it('should register and retrieve slot components', () => {
    service.register({
      slotName: 'document-actions',
      component: MockActionComponent,
    });

    expect(service.has('document-actions')).toBe(true);
    const components = service.getSlotComponents('document-actions');
    expect(components).toHaveLength(1);
    expect(components[0]).toBe(MockActionComponent);
  });

  it('should return components sorted by order', () => {
    service.register({
      slotName: 'header',
      component: MockBannerComponent,
      order: 20,
    });
    service.register({
      slotName: 'header',
      component: MockActionComponent,
      order: 10,
    });

    const components = service.getSlotComponents('header');
    expect(components).toHaveLength(2);
    expect(components[0]).toBe(MockActionComponent);
    expect(components[1]).toBe(MockBannerComponent);
  });

  it('should filter by document type predicate', () => {
    service.register({
      slotName: 'doc-sidebar',
      component: MockActionComponent,
      docTypePredicate: (dt) => dt === 'File',
    });
    service.register({
      slotName: 'doc-sidebar',
      component: MockBannerComponent,
    });

    const fileComponents = service.getSlotComponents('doc-sidebar', 'File');
    expect(fileComponents).toHaveLength(2);

    const contractComponents = service.getSlotComponents('doc-sidebar', 'Contract');
    expect(contractComponents).toHaveLength(1);
    expect(contractComponents[0]).toBe(MockBannerComponent);
  });

  it('should return empty array for unknown slot', () => {
    expect(service.getSlotComponents('nonexistent')).toHaveLength(0);
  });

  it('should register multiple at once', () => {
    service.registerAll([
      { slotName: 'a', component: MockActionComponent },
      { slotName: 'b', component: MockBannerComponent },
    ]);

    expect(service.getSlotNames()).toContain('a');
    expect(service.getSlotNames()).toContain('b');
  });

  it('should remove a specific component from a slot', () => {
    service.register({ slotName: 'toolbar', component: MockActionComponent });
    service.register({ slotName: 'toolbar', component: MockBannerComponent });

    service.remove('toolbar', MockActionComponent);

    const remaining = service.getSlotComponents('toolbar');
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toBe(MockBannerComponent);
  });

  it('should delete slot entry when last component removed', () => {
    service.register({ slotName: 'single', component: MockActionComponent });
    service.remove('single', MockActionComponent);
    expect(service.has('single')).toBe(false);
  });
});
