import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { describe, expect, it } from 'vitest';

import { DocTypeLabelPipe } from './doc-type-label.pipe';
import { DOC_TYPE_LABEL_KEYS, docTypeLabel } from './doc-type-labels';

describe('docTypeLabel', () => {
  const catalogue: Record<string, string> = {
    'doc-type.folder': 'Dossier',
    'doc-type.ordered-folder': 'Dossier ordonné',
  };
  const translate = (key: string): string => catalogue[key] ?? key;

  it('resolves a packaged type through its catalogue key', () => {
    expect(docTypeLabel('Folder', translate)).toBe('Dossier');
    expect(docTypeLabel('OrderedFolder', translate)).toBe('Dossier ordonné');
  });

  it('shows a custom type by its own name, never as a raw key', () => {
    const label = docTypeLabel('InvoiceRecord', translate);
    expect(label).toBe('Invoice Record');
    expect(label).not.toContain('doc-type.');
  });

  it('leaves a custom type with no camel case exactly as the server named it', () => {
    expect(docTypeLabel('invoice_v2', translate)).toBe('invoice_v2');
  });

  it('falls back to the type name when the catalogue has not loaded', () => {
    // ngx-translate hands an unresolved key back unchanged.
    const unloaded = (key: string): string => key;
    expect(docTypeLabel('Picture', unloaded)).toBe('Picture');
    expect(docTypeLabel('SectionRoot', unloaded)).toBe('Section Root');
  });

  it('has an English catalogue value for every key it can return', () => {
    const en = (key: string): string => TestBed.inject(TranslateService).instant(key) as string;
    for (const [type, key] of Object.entries(DOC_TYPE_LABEL_KEYS)) {
      expect(en(key), type).not.toBe(key);
    }
  });
});

describe('DocTypeLabelPipe', () => {
  it('renders English from the real catalogue and a custom type by name', () => {
    const pipe = TestBed.runInInjectionContext(() => new DocTypeLabelPipe());
    expect(pipe.transform('OrderedFolder')).toBe('Ordered Folder');
    expect(pipe.transform('WorkspaceRoot')).toBe('Workspace Root');
    expect(pipe.transform('MyType')).toBe('My Type');
    expect(pipe.transform(null)).toBe('');
  });
});
