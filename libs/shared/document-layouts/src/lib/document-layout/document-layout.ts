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
import { DirectoryService, NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';
import { catchError, forkJoin, map, merge, of, startWith, switchMap } from 'rxjs';

import { DocumentLayoutService } from '../document-layout.service';
import { LayoutLabel, LayoutMode, ResolvedLayout } from '../layout.model';
import { humanize } from '../resolve-layout';
import { FieldView, describeField, directoriesOf } from './field-view';

type Vocabularies = ReadonlyMap<string, ReadonlyMap<string, string>>;

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

  private readonly target = computed(
    () => {
      const type = this.document()?.type;
      return type ? { type, mode: this.mode() } : null;
    },
    { equal: (a, b) => a?.type === b?.type && a?.mode === b?.mode },
  );

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
        return forkJoin(
          names.map((name) =>
            this.directories.getEntries(name).pipe(
              map(
                (entries) =>
                  [
                    name,
                    new Map(
                      entries.map((entry) => [
                        entry.id,
                        entry.displayLabel || entry.label || entry.id,
                      ]),
                    ),
                  ] as const,
              ),
              catchError(() => of([name, new Map<string, string>()] as const)),
            ),
          ),
        ).pipe(
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

  private text(label: LayoutLabel): string | null {
    if (label.literal) return label.literal;
    for (const key of label.keys) {
      const translated: unknown = this.translate.instant(key);
      if (typeof translated === 'string' && translated !== key) return translated;
    }
    return label.fallback;
  }
}
