import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import {
  DirectoryEntry,
  DirectoryService,
  L10nDirectoryEntry,
  NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';
import { Observable, of, throwError } from 'rxjs';

import { DocumentLayoutService } from '../document-layout.service';
import { LayoutSection, ResolvedLayout } from '../layout.model';
import { DocumentLayoutComponent } from './document-layout';

const claimDocument = (overrides: Record<string, unknown> = {}): NuxeoDocument =>
  ({
    uid: 'c1',
    title: 'Claim CLM-1',
    type: 'Claim',
    path: '/c1',
    lastModified: '',
    properties: {
      'claim:number': 'CLM-1',
      'claim:status': 'pending',
      'claim:urgent': true,
      'claim:serviceDate': '2026-09-14T12:00:00.000Z',
      'claim:codes': ['R51.9', 'G44.209'],
      ...overrides,
    },
  }) as NuxeoDocument;

const field = (
  xpath: string,
  type: string,
  extra: Record<string, unknown> = {},
  label: Record<string, unknown> = {},
) => ({
  xpath,
  definition: { type, ...extra },
  label: { keys: [`layout.field.${xpath}`], fallback: xpath.split(':')[1] ?? xpath, ...label },
});

const claimSection: LayoutSection = {
  id: 'claim',
  label: { keys: ['layout.schema.claim'], fallback: 'Claim' },
  fields: [
    field('claim:number', 'string'),
    field('claim:status', 'string', { directory: 'claim_status' }),
    field('claim:urgent', 'boolean'),
    field('claim:serviceDate', 'date'),
    field('claim:codes', 'string[]'),
  ],
};

const layout = (overrides: Partial<ResolvedLayout> = {}): ResolvedLayout => ({
  type: 'Claim',
  mode: 'metadata',
  source: 'generated',
  display: 'sections',
  sections: [claimSection],
  ...overrides,
});

describe('DocumentLayoutComponent', () => {
  let fixture: ComponentFixture<DocumentLayoutComponent>;
  let layoutFor: ReturnType<
    typeof vi.fn<(type: string, mode: string) => Observable<ResolvedLayout | null>>
  >;
  let getEntries: ReturnType<typeof vi.fn<(name: string) => Observable<DirectoryEntry[]>>>;
  let getAllL10nEntries: ReturnType<
    typeof vi.fn<(name: string) => Observable<L10nDirectoryEntry[]>>
  >;

  const entry = (id: string, label: string) =>
    ({ id, label, displayLabel: label }) as DirectoryEntry;

  async function render(document: NuxeoDocument | null, answer: ResolvedLayout | null = layout()) {
    layoutFor.mockReturnValue(of(answer));
    fixture = TestBed.createComponent(DocumentLayoutComponent);
    fixture.componentRef.setInput('document', document);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const text = (selector: string) =>
    host().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? null;
  const value = (xpath: string) => text(`[data-field="${xpath}"] .document-layout__value`);
  const labelOf = (xpath: string) => text(`[data-field="${xpath}"] .document-layout__label`);

  beforeEach(() => {
    layoutFor = vi.fn();
    getEntries = vi.fn().mockReturnValue(of([entry('pending', 'Pending review')]));
    const l10n = (id: string, parent: string, label: string) =>
      ({
        id,
        directoryName: 'l10nsubjects',
        properties: { id, parent, ordering: 0, obsolete: 0, label_en: label },
      }) as L10nDirectoryEntry;
    getAllL10nEntries = vi
      .fn()
      .mockReturnValue(of([l10n('art', '', 'Art'), l10n('architecture', 'art', 'Architecture')]));
    TestBed.configureTestingModule({
      imports: [DocumentLayoutComponent],
      providers: [
        { provide: DocumentLayoutService, useValue: { layoutFor } },
        { provide: DirectoryService, useValue: { getEntries, getAllL10nEntries } },
      ],
    });
  });

  it('asks for the layout of the document type in the given mode', async () => {
    await render(claimDocument());
    expect(layoutFor).toHaveBeenCalledWith('Claim', 'metadata');
  });

  it('renders each section with its heading and each field by its type', async () => {
    await render(claimDocument());
    expect(host().querySelector('[data-layout-source="generated"]')).not.toBeNull();
    expect(text('[data-section-id="claim"] .document-layout__heading')).toBe('Claim');
    expect(
      host().querySelector('[data-section-id="claim"] .document-layout__heading')?.tagName,
    ).toBe('H4');
    expect(value('claim:number')).toBe('CLM-1');
    expect(value('claim:status')).toBe('Pending review');
    expect(value('claim:urgent')).toBe('Yes');
    expect(value('claim:serviceDate')).toBe('September 14, 2026');
    expect(
      [...host().querySelectorAll('[data-field="claim:codes"] .document-layout__chip')].map(
        (chip) => chip.textContent?.trim(),
      ),
    ).toEqual(['R51.9', 'G44.209']);
    expect(getEntries).toHaveBeenCalledWith('claim_status');
  });

  it('translates a boolean false as No and an unset value as a dash', async () => {
    await render(claimDocument({ 'claim:urgent': false, 'claim:number': null }));
    expect(value('claim:urgent')).toBe('No');
    expect(value('claim:number')).toBe('—');
  });

  it('labels an l10n vocabulary from its own entries, as Parent/Child', async () => {
    const subjects = {
      ...claimSection,
      fields: [field('dc:subjects', 'string[]', { directory: 'l10nsubjects' })],
    };
    await render(
      claimDocument({ 'dc:subjects': ['architecture', 'unknown'] }),
      layout({ sections: [subjects] }),
    );
    expect(
      [...host().querySelectorAll('[data-field="dc:subjects"] .document-layout__chip')].map(
        (chip) => chip.textContent?.trim(),
      ),
    ).toEqual(['Art/Architecture', 'unknown']);
    expect(getAllL10nEntries).toHaveBeenCalledWith('l10nsubjects');
    expect(getEntries).not.toHaveBeenCalledWith('l10nsubjects');
  });

  it('shows the stored id when the vocabulary cannot be read', async () => {
    getEntries.mockReturnValue(throwError(() => new Error('403')));
    await render(claimDocument());
    expect(value('claim:status')).toBe('pending');
  });

  it('labels from a translation key when one resolves, and a literal ahead of it', async () => {
    TestBed.inject(TranslateService).setTranslation(
      'en',
      { 'layout.field.claim:number': 'Claim no.' },
      true,
    );
    const literal = {
      ...claimSection,
      fields: [field('claim:status', 'string', {}, { literal: 'State' }), claimSection.fields[0]!],
    };
    await render(claimDocument(), layout({ sections: [literal] }));
    expect(labelOf('claim:number')).toBe('Claim no.');
    expect(labelOf('claim:status')).toBe('State');
  });

  it('falls back to the readable name when no key resolves', async () => {
    await render(claimDocument());
    expect(labelOf('claim:serviceDate')).toBe('serviceDate');
  });

  it('leaves out the heading of a contributed section with no label', async () => {
    const unlabelled = { ...claimSection, id: 'summary', label: { keys: [], fallback: null } };
    await render(claimDocument(), layout({ source: 'contributed', sections: [unlabelled] }));
    expect(host().querySelector('[data-section-id="summary"]')).not.toBeNull();
    expect(host().querySelector('.document-layout__heading')).toBeNull();
    expect(host().querySelector('[data-layout-source="contributed"]')).not.toBeNull();
  });

  it('renders sections as named tabs, naming an unlabelled one from its id', async () => {
    const amounts = {
      id: 'claim_amounts',
      label: { keys: [], fallback: null },
      fields: [field('claim:number', 'string')],
    };
    await render(claimDocument(), layout({ display: 'tabs', sections: [claimSection, amounts] }));
    const tablist = host().querySelector('[role="tablist"]');
    expect(tablist?.getAttribute('aria-label')).toBe('Property sections');
    expect(
      [...host().querySelectorAll('[role="tab"]')].map((tab) => tab.textContent?.trim()),
    ).toEqual(['Claim', 'Claim amounts']);
    expect(host().querySelector('.document-layout__heading')).toBeNull();
  });

  it('renders nothing for a layout with no sections, as a stock File has', async () => {
    await render(claimDocument(), layout({ sections: [] }));
    expect(host().querySelector('.document-layout')).toBeNull();
  });

  it('renders nothing when the type cannot be read', async () => {
    await render(claimDocument(), null);
    expect(host().querySelector('.document-layout')).toBeNull();
  });

  it('never shows a layout resolved for another type against this document', async () => {
    await render({ ...claimDocument(), type: 'Member' }, layout());
    expect(host().querySelector('.document-layout')).toBeNull();
  });

  it('renders nothing and asks for nothing without a document', async () => {
    await render(null);
    expect(layoutFor).not.toHaveBeenCalled();
    expect(host().querySelector('.document-layout')).toBeNull();
  });

  async function show(document: NuxeoDocument) {
    fixture.componentRef.setInput('document', document);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('asks again for the next document, so a failed schema read recovers', async () => {
    await render(claimDocument(), null);
    expect(host().querySelector('.document-layout')).toBeNull();
    layoutFor.mockReturnValue(of(layout()));
    await show({ ...claimDocument({ 'claim:number': 'CLM-2' }), uid: 'c2' });
    expect(layoutFor).toHaveBeenCalledTimes(2);
    expect(value('claim:number')).toBe('CLM-2');
  });

  it('does not ask again when the same document is refetched', async () => {
    await render(claimDocument());
    await show(claimDocument({ 'claim:number': 'CLM-1b' }));
    expect(layoutFor).toHaveBeenCalledTimes(1);
    expect(value('claim:number')).toBe('CLM-1b');
  });

  it('reads each vocabulary once while documents of the type are browsed, retrying one that failed', async () => {
    getEntries.mockReturnValueOnce(throwError(() => new Error('503')));
    await render(claimDocument());
    expect(value('claim:status')).toBe('pending');
    await show({ ...claimDocument(), uid: 'c2' });
    expect(value('claim:status')).toBe('Pending review');
    await show({ ...claimDocument(), uid: 'c3' });
    expect(getEntries).toHaveBeenCalledTimes(2);
  });
});
