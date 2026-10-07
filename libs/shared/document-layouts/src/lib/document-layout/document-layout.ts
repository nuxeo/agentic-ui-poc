import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';
import { forkJoin, map, merge, of, startWith, switchMap } from 'rxjs';

import { DocumentLayoutService } from '../document-layout.service';
import { LayoutLabel, LayoutMode, ResolvedLayout } from '../layout.model';
import { humanize } from '../resolve-layout';
import { FieldView, VocabularyValue, describeField, vocabularyValues } from './field-view';

type Vocabularies = ReadonlyMap<string, ReadonlyMap<string, string>>;

function sameValues(a: readonly VocabularyValue[], b: readonly VocabularyValue[]): boolean {
  return (
    a.length === b.length &&
    a.every((value, i) => value.directory === b[i]?.directory && value.id === b[i]?.id)
  );
}

function byDirectory(
  labels: readonly (VocabularyValue & { readonly label: string | null })[],
): Vocabularies {
  const vocabularies = new Map<string, Map<string, string>>();
  for (const { directory, id, label } of labels) {
    if (label === null) continue;
    let entries = vocabularies.get(directory);
    if (!entries) {
      entries = new Map();
      vocabularies.set(directory, entries);
    }
    entries.set(id, label);
  }
  return vocabularies;
}

interface SectionView {
  readonly id: string;
  /** `null` for a contributed section with no label: it renders without a heading. */
  readonly heading: string | null;
  readonly fields: readonly FieldView[];
}

interface LayoutView {
  readonly type: string;
  readonly source: ResolvedLayout['source'];
  readonly display: ResolvedLayout['display'];
  readonly sections: readonly SectionView[];
}

const NO_VOCABULARIES: Vocabularies = new Map();

/**
 * Renders a document's per-type layout: the file a configuration package contributed for its
 * type and mode, or the layout generated from the type's own schemas.
 *
 * Read-only. Each value is shown by its schema type, and a vocabulary-bound value by its entry's
 * label. Hiding a field here hides it from this panel only — the REST API still returns it.
 */
@Component({
  selector: 'lib-document-layout',
  standalone: true,
  imports: [MatTabsModule, NgTemplateOutlet, TranslatePipe],
  templateUrl: './document-layout.html',
  styleUrl: './document-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentLayoutComponent {
  readonly document = input.required<NuxeoDocument | null>();
  readonly mode = input<LayoutMode>('metadata');

  private readonly layouts = inject(DocumentLayoutService);
  private readonly translate = inject(TranslateService);
  private readonly locale = inject(LOCALE_ID);

  /**
   * Re-resolved per document, not per type: the service caches what it read successfully, and
   * asking again is how a failed schema read recovers on the next document.
   */
  private readonly target = computed(
    () => {
      const document = this.document();
      return document?.type ? { uid: document.uid, type: document.type, mode: this.mode() } : null;
    },
    { equal: (a, b) => a?.uid === b?.uid && a?.type === b?.type && a?.mode === b?.mode },
  );

  private readonly layout = toSignal(
    toObservable(this.target).pipe(
      switchMap((target) => (target ? this.layouts.layoutFor(target.type, target.mode) : of(null))),
    ),
    { initialValue: null },
  );

  /** The vocabulary entries this document's values name: only those are read. */
  private readonly vocabularyValues = computed(
    () => {
      const layout = this.layout();
      const document = this.document();
      if (!layout || !document || layout.type !== document.type) return [];
      return vocabularyValues(
        layout.sections.flatMap((section) =>
          section.fields.map((field) => ({
            definition: field.definition,
            value: document.properties[field.xpath],
          })),
        ),
      );
    },
    { equal: sameValues },
  );

  /** Shown as the stored ids until the labels arrive, and as the id wherever one cannot be read. */
  private readonly vocabularies = toSignal(
    toObservable(this.vocabularyValues).pipe(
      switchMap((values) =>
        values.length === 0
          ? of(NO_VOCABULARIES)
          : forkJoin(
              values.map((value) =>
                this.layouts
                  .vocabularyLabel(value.directory, value.id)
                  .pipe(map((label) => ({ ...value, label }))),
              ),
            ).pipe(map(byDirectory), startWith(NO_VOCABULARIES)),
      ),
    ),
    { initialValue: NO_VOCABULARIES },
  );

  /** Bumped when the language or a catalogue changes, so labels resolved with `instant` follow. */
  private readonly translations = signal(0);

  constructor() {
    merge(this.translate.onLangChange, this.translate.onTranslationChange)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.translations.update((n) => n + 1));
  }

  readonly view = computed<LayoutView | null>(() => {
    this.translations();
    const document = this.document();
    const layout = this.layout();
    const vocabularies = this.vocabularies();
    // A layout still resolving for the previous document's type must not show this one's values.
    if (!document || !layout || layout.type !== document.type) return null;
    const context = {
      locale: this.locale,
      vocabulary: (directory: string, id: string) => vocabularies.get(directory)?.get(id) ?? id,
    };
    const sections = layout.sections.map((section) => ({
      id: section.id,
      heading: this.text(section.label),
      fields: section.fields.map((field) =>
        describeField(
          field.xpath,
          this.text(field.label) ?? field.xpath,
          field.definition,
          document.properties[field.xpath],
          context,
        ),
      ),
    }));
    return { type: layout.type, source: layout.source, display: layout.display, sections };
  });

  /** A tab needs a name even where a section heading may be left out. */
  tabLabel(section: SectionView): string {
    return section.heading ?? humanize(section.id);
  }

  private text(label: LayoutLabel): string | null {
    if (label.literal) return label.literal;
    for (const key of label.keys) {
      const translated: unknown = this.translate.instant(key);
      if (typeof translated === 'string' && translated !== key) return translated;
    }
    return label.fallback;
  }
}
