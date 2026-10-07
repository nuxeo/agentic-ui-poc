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
import {
  DirectoryService,
  NuxeoDocument,
  directoryUsesL10nLabel,
  formatHierarchicalL10nLabel,
} from '@nuxeo-satori/platform/nuxeo-client';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';

import { DocumentLayoutService } from '../document-layout.service';
import { LayoutLabel, LayoutMode, ResolvedLayout } from '../layout.model';
import { humanize } from '../resolve-layout';
import { FieldView, describeField, directoriesOf } from './field-view';

type Vocabularies = ReadonlyMap<string, ReadonlyMap<string, string>>;
type VocabularyLabels = readonly [name: string, labels: ReadonlyMap<string, string>];

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
  private readonly directories = inject(DirectoryService);
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

  /** Entry labels per vocabulary, kept while this panel lives; a failed read is asked again. */
  private readonly vocabularyCache = new Map<string, Observable<VocabularyLabels>>();

  private readonly resolved = toSignal(
    toObservable(this.target).pipe(
      switchMap((target) => (target ? this.layouts.layoutFor(target.type, target.mode) : of(null))),
      switchMap((layout) => {
        const names = layout
          ? directoriesOf(
              layout.sections.flatMap((section) => section.fields.map((field) => field.definition)),
            )
          : [];
        if (!layout || names.length === 0) return of({ layout, vocabularies: NO_VOCABULARIES });
        return forkJoin(names.map((name) => this.vocabulary(name))).pipe(
          map((pairs): { layout: ResolvedLayout; vocabularies: Vocabularies } => ({
            layout,
            vocabularies: new Map(pairs),
          })),
          startWith({ layout, vocabularies: NO_VOCABULARIES }),
        );
      }),
    ),
    { initialValue: { layout: null, vocabularies: NO_VOCABULARIES } },
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
    const { layout, vocabularies } = this.resolved();
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

  private vocabulary(name: string): Observable<VocabularyLabels> {
    let cached = this.vocabularyCache.get(name);
    if (!cached) {
      // An l10n vocabulary is not readable through Directory.SuggestEntries (HTTP 500), so it is
      // read and labelled the way the panel's own Subjects and Coverage rows are.
      const labels: Observable<ReadonlyMap<string, string>> = directoryUsesL10nLabel(name)
        ? this.directories
            .getAllL10nEntries(name)
            .pipe(
              map(
                (entries) =>
                  new Map(
                    entries.map((entry) => [
                      entry.id,
                      formatHierarchicalL10nLabel(entry.id, entries),
                    ]),
                  ),
              ),
            )
        : this.directories
            .getEntries(name)
            .pipe(
              map(
                (entries) =>
                  new Map(
                    entries.map((entry) => [
                      entry.id,
                      entry.displayLabel || entry.label || entry.id,
                    ]),
                  ),
              ),
            );
      cached = labels.pipe(
        map((entries): VocabularyLabels => [name, entries]),
        catchError(() => {
          this.vocabularyCache.delete(name);
          return of<VocabularyLabels>([name, new Map()]);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.vocabularyCache.set(name, cached);
    }
    return cached;
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
