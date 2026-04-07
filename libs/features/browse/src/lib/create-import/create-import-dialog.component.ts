import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import {
  DocumentImportService,
  sanitizeDocumentName,
  type CsvImportResult,
  type ImportFilesOptions,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

import {
  FolderPickerDialogComponent,
  type FolderPickerDialogResult,
} from '../folder-picker/folder-picker-dialog.component';

export interface CreateImportDialogData {
  /** Import target folder; if omitted, falls back to `DocumentImportService.getDefaultImportParentPath()`. */
  parentPath?: string | null;
  parentTitle?: string;
}

export type CreateMode = 'template' | 'upload' | 'csv';

interface TemplateDef {
  id: string;
  label: string;
  type: string;
  description: string;
  icon: string;
}

/** Business-facing labels mapped to Nuxeo document types */
const BUSINESS_TEMPLATES: TemplateDef[] = [
  {
    id: 'claim-case',
    label: 'Claim Case Manager',
    type: 'Folder',
    description: 'Connects to claims systems to review correspondence and attachments.',
    icon: 'assignment_turned_in',
  },
  {
    id: 'underwriting',
    label: 'Underwriting',
    type: 'Folder',
    description: 'Analyzes risk factors using historical data and predictive models.',
    icon: 'analytics',
  },
  {
    id: 'fraud',
    label: 'Fraud Detection',
    type: 'Note',
    description: 'Monitors behavior patterns to flag potentially fraudulent activities.',
    icon: 'shield',
  },
  {
    id: 'risk-pricing',
    label: 'Risk Assessment & Pricing',
    type: 'Folder',
    description: 'Assesses risk based on data sources and sets dynamic pricing.',
    icon: 'account_balance',
  },
  {
    id: 'policy-renewals',
    label: 'Policy Renewals & Adjustments',
    type: 'OrderedFolder',
    description: 'Suggests policy adjustments or renewals.',
    icon: 'autorenew',
  },
  {
    id: 'claims-auto',
    label: 'Claims Processing & Automation',
    type: 'Folder',
    description: 'Reviews and adjudicates insurance claims.',
    icon: 'fact_check',
  },
  {
    id: 'rules-rate',
    label: 'Rules & Rate Analyst',
    type: 'Note',
    description: 'Connects to claims systems to accelerate decision-making.',
    icon: 'rule',
  },
  {
    id: 'marketing',
    label: 'Marketing & Lead Generation',
    type: 'Folder',
    description: 'Analyzes customer data to predict needs and tailor campaigns.',
    icon: 'campaign',
  },
  {
    id: 'retention',
    label: 'Retention & Personalization',
    type: 'Folder',
    description: 'Identifies at-risk customers to improve retention.',
    icon: 'person_pin',
  },
  {
    id: 'support',
    label: 'Customer Support & Chatbots',
    type: 'Note',
    description: 'AI-powered chatbots for handling inquiries and status updates.',
    icon: 'support_agent',
  },
];

@Component({
  selector: 'lib-create-import-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './create-import-dialog.component.html',
  styleUrl: './create-import-dialog.component.scss',
})
export class CreateImportDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CreateImportDialogComponent>);
  private readonly matDialog = inject(MatDialog);
  readonly data = inject<CreateImportDialogData>(MAT_DIALOG_DATA);
  private readonly importService = inject(DocumentImportService);

  readonly businessTemplates = BUSINESS_TEMPLATES;

  constructor() {
    effect(() => {
      const v = this.view();
      const width =
        v === 'templateBrowse'
          ? '960px'
          : v === 'landing'
            ? '900px'
            : v === 'uploadScreen'
              ? '760px'
              : v === 'csv'
                ? '560px'
                : v === 'templateForm'
                  ? '520px'
                  : v === 'success'
                    ? '460px'
                    : '900px';
      this.dialogRef.updateSize(width);
    });
  }

  readonly resolvingPath = signal(false);
  readonly parentPath = signal<string | null>(null);
  readonly pathError = signal<string | null>(null);

  /**
   * landing → templateBrowse → templateForm
   * landing → uploadScreen
   * landing → csv → …
   */
  readonly view = signal<
    'landing' | 'templateBrowse' | 'templateForm' | 'uploadScreen' | 'csv' | 'success'
  >('landing');

  readonly selectedMode = signal<CreateMode | null>(null);
  readonly selectedTemplate = signal<TemplateDef | null>(null);

  private readonly LANDING_MODES: CreateMode[] = ['template', 'upload', 'csv'];

  /** Template gallery */
  templateSearch = '';
  filterA = '';
  filterB = '';
  filterC = '';
  readonly templatePageIndex = signal(0);
  readonly templatePageSize = 10;

  readonly filteredBusinessTemplates = computed(() => {
    const q = this.templateSearch.trim().toLowerCase();
    let list = this.businessTemplates;
    if (q) {
      list = list.filter(
        (t) => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }
    return list;
  });

  readonly pagedTemplates = computed(() => {
    const all = this.filteredBusinessTemplates();
    const start = this.templatePageIndex() * this.templatePageSize;
    return all.slice(start, start + this.templatePageSize);
  });

  readonly templatePageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredBusinessTemplates().length / this.templatePageSize)),
  );

  docTitle = '';
  docName = '';

  readonly uploadFiles = signal<File[]>([]);
  autoClassifyOnUpload = false;
  readonly csvFile = signal<File | null>(null);

  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly csvResult = signal<CsvImportResult | null>(null);

  readonly dragOverUpload = signal(false);

  ngOnInit(): void {
    const p = this.data.parentPath;
    if (p && p.trim()) {
      this.parentPath.set(p.replace(/\/+$/, '') || '/');
    } else {
      this.resolvingPath.set(true);
      this.importService.getDefaultImportParentPath().subscribe({
        next: (path) => {
          this.parentPath.set(path);
          this.resolvingPath.set(false);
        },
        error: () => {
          this.pathError.set('Could not resolve a default folder. Open a folder in Browse first.');
          this.resolvingPath.set(false);
        },
      });
    }
  }

  /** Open Nuxeo-backed folder picker; path is live data from the repository, not fixed text. */
  openFolderPicker(): void {
    const path = this.parentPath() ?? '/default-domain';
    this.matDialog
      .open(FolderPickerDialogComponent, {
        width: '540px',
        maxWidth: '95vw',
        data: { initialPath: path },
      })
      .afterClosed()
      .subscribe((result: FolderPickerDialogResult | undefined) => {
        if (result?.path) {
          this.parentPath.set(result.path.replace(/\/+$/, '') || '/');
        }
      });
  }

  /** Breadcrumb like "Domain > Workspaces > BMW" */
  destinationBreadcrumb(): string {
    const p = this.parentPath() ?? '';
    const parts = p.split('/').filter(Boolean);
    if (parts.length === 0) return '—';
    return parts
      .map((seg) => {
        if (seg === 'default-domain') return 'Domain';
        if (seg === 'workspaces' || seg === 'workspace') return 'Workspaces';
        return decodeURIComponent(seg);
      })
      .join(' > ');
  }

  selectLandingMode(mode: CreateMode): void {
    this.selectedMode.set(mode);
  }

  isModeSelected(mode: CreateMode): boolean {
    return this.selectedMode() === mode;
  }

  /** Returns tabindex for roving-tabindex keyboard navigation within the radio group. */
  getChoiceTabindex(mode: CreateMode): 0 | -1 {
    const selected = this.selectedMode();
    if (selected === null) {
      return mode === this.LANDING_MODES[0] ? 0 : -1;
    }
    return selected === mode ? 0 : -1;
  }

  /** Handles Arrow key navigation across the landing choice radio group. */
  onChoiceGridKeydown(event: KeyboardEvent): void {
    const modes = this.LANDING_MODES;
    const current = this.selectedMode() ?? modes[0];
    const idx = modes.indexOf(current);
    let next = idx;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (idx + 1) % modes.length;
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (idx - 1 + modes.length) % modes.length;
      event.preventDefault();
    } else {
      return;
    }

    this.selectLandingMode(modes[next]);
    const grid = event.currentTarget as HTMLElement;
    const buttons = grid.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
    buttons[next]?.focus();
  }

  /** Landing: Next → branch to template gallery, upload screen, or CSV */
  onLandingNext(): void {
    const mode = this.selectedMode();
    if (!mode) return;
    this.error.set(null);
    if (mode === 'template') {
      this.templatePageIndex.set(0);
      this.view.set('templateBrowse');
    } else if (mode === 'upload') {
      this.uploadFiles.set([]);
      this.view.set('uploadScreen');
    } else {
      this.csvFile.set(null);
      this.view.set('csv');
    }
  }

  goLanding(): void {
    this.view.set('landing');
    this.error.set(null);
    this.selectedTemplate.set(null);
  }

  goTemplateBrowse(): void {
    this.view.set('templateBrowse');
    this.selectedTemplate.set(null);
  }

  prevTemplatePage(): void {
    this.templatePageIndex.update((i) => Math.max(0, i - 1));
  }

  nextTemplatePage(): void {
    const max = this.templatePageCount() - 1;
    this.templatePageIndex.update((i) => Math.min(max, i + 1));
  }

  /** Card "Get Started" → title form */
  startTemplateFromCard(t: TemplateDef): void {
    this.selectedTemplate.set(t);
    this.docTitle = t.label;
    this.docName = '';
    this.view.set('templateForm');
  }

  /** Template gallery: Next → form with current selection or first visible template */
  onTemplateBrowseNext(): void {
    if (!this.selectedTemplate()) {
      const first = this.pagedTemplates()[0] ?? this.filteredBusinessTemplates()[0];
      if (first) {
        this.selectedTemplate.set(first);
        this.docTitle = first.label;
        this.docName = '';
      }
    }
    if (this.selectedTemplate()) {
      this.view.set('templateForm');
    }
  }

  createFromTemplate(): void {
    const path = this.parentPath();
    const t = this.selectedTemplate();
    if (!path || !t) return;
    const title = this.docTitle.trim() || t.label;
    const name = sanitizeDocumentName(this.docName.trim() || title);
    this.busy.set(true);
    this.error.set(null);
    const props: Record<string, unknown> = { 'dc:title': title };
    if (t.type === 'Note') {
      props['note:note'] = '<p></p>';
    }
    this.importService.createChildDocument(path, name, t.type, props).subscribe({
      next: () => {
        this.busy.set(false);
        this.successMessage.set(`Created ${t.type} “${title}”.`);
        this.view.set('success');
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.busy.set(false);
        this.error.set(err?.error?.message ?? err?.message ?? 'Create failed');
      },
    });
  }

  onUploadInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = input.files;
    if (!list?.length) return;
    this.addFiles(Array.from(list));
    input.value = '';
  }

  onUploadDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOverUpload.set(false);
    const list = ev.dataTransfer?.files;
    if (list?.length) this.addFiles(Array.from(list));
  }

  onUploadDragOver(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.dragOverUpload.set(true);
  }

  onUploadDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOverUpload.set(false);
  }

  private addFiles(files: File[]): void {
    this.uploadFiles.update((cur) => [...cur, ...files]);
  }

  removeUploadAt(i: number): void {
    this.uploadFiles.update((files) => files.filter((_, j) => j !== i));
  }

  onCsvInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    this.csvFile.set(f ?? null);
  }

  /** Upload screen: Next runs import */
  runUpload(): void {
    const path = this.parentPath();
    const files = this.uploadFiles();
    if (!path || files.length === 0) return;
    this.busy.set(true);
    this.error.set(null);
    (this.importService as unknown as DocumentImportServiceWithFileOptions)
      .importFiles(path, files, { autoClassify: this.autoClassifyOnUpload })
      .subscribe({
        next: (docs) => {
          this.busy.set(false);
          this.successMessage.set(`Uploaded ${docs.length} file(s).`);
          this.view.set('success');
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.busy.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'Upload failed');
        },
      });
  }

  runCsv(): void {
    const path = this.parentPath();
    const file = this.csvFile();
    if (!path || !file) return;
    this.busy.set(true);
    this.error.set(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      this.importService.importFromCsvText(path, text).subscribe({
        next: (res) => {
          this.busy.set(false);
          this.csvResult.set(res);
          const parts: string[] = [];
          parts.push(`Created ${res.created.length} document(s).`);
          if (res.skipped.length) parts.push(`${res.skipped.length} row(s) skipped.`);
          if (res.errors.length) parts.push(`${res.errors.length} error(s).`);
          this.successMessage.set(parts.join(' '));
          this.view.set('success');
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.busy.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'CSV import failed');
        },
      });
    };
    reader.onerror = () => {
      this.busy.set(false);
      this.error.set('Could not read CSV file');
    };
    reader.readAsText(file);
  }

  close(): void {
    this.dialogRef.close();
  }

  doneNavigateBrowse(): void {
    const p = this.parentPath();
    this.dialogRef.close({ refreshed: true, path: p });
  }

  showFooterNext(): boolean {
    const v = this.view();
    if (v === 'landing') return true;
    if (v === 'templateBrowse') return true;
    if (v === 'uploadScreen') return true;
    return false;
  }

  footerNextLabel(): string {
    const v = this.view();
    if (v === 'landing') return 'Next';
    if (v === 'templateBrowse') return 'Next';
    if (v === 'uploadScreen') return 'Next';
    return 'Next';
  }

  onFooterNext(): void {
    const v = this.view();
    if (v === 'landing') this.onLandingNext();
    else if (v === 'templateBrowse') this.onTemplateBrowseNext();
    else if (v === 'uploadScreen') this.runUpload();
  }

  footerNextDisabled(): boolean {
    if (this.busy() || this.resolvingPath()) return true;
    const v = this.view();
    if (v === 'landing') return !this.selectedMode();
    if (v === 'uploadScreen') return this.uploadFiles().length === 0;
    if (v === 'templateBrowse') return false;
    return false;
  }

  showFooterBack(): boolean {
    const v = this.view();
    return v === 'templateBrowse' || v === 'templateForm' || v === 'uploadScreen' || v === 'csv';
  }

  onFooterBack(): void {
    const v = this.view();
    if (v === 'templateForm') this.goTemplateBrowse();
    else if (v === 'templateBrowse' || v === 'uploadScreen' || v === 'csv') this.goLanding();
  }

  /** Explains why Next is disabled on the upload step (clearer than a grey button alone). */
  uploadFooterHint(): string | null {
    if (this.view() !== 'uploadScreen' || this.busy()) {
      return null;
    }
    if (this.uploadFiles().length > 0) {
      return null;
    }
    return 'Add at least one file to continue.';
  }
}
