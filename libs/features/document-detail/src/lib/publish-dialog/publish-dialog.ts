import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NuxeoDocument, DocumentDetailService } from '@nuxeo-satori/platform/nuxeo-client';

export interface PublishDialogData {
  documentUid: string;
  documentTitle: string;
  versionLabel: string;
  renditions: { name: string; label: string }[];
  versions: NuxeoDocument[];
}

interface FlatSection {
  uid: string;
  title: string;
  depth: number;
}

@Component({
  selector: 'lib-publish-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './publish-dialog.html',
  styleUrl: './publish-dialog.scss',
})
export class PublishDialogComponent implements OnInit {
  readonly data = inject<PublishDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PublishDialogComponent>);
  private readonly detailService = inject(DocumentDetailService);
  private readonly snackBar = inject(MatSnackBar);

  readonly flatSections = signal<FlatSection[]>([]);
  readonly sectionsLoading = signal(true);
  readonly publishing = signal(false);

  selectedSectionId = '';
  selectedVersion = '';
  showRenditions = false;
  selectedRendition = '';
  overrideExisting = false;

  ngOnInit(): void {
    this.selectedVersion = this.data.versionLabel;

    this.detailService.getSectionTree().subscribe({
      next: (res) => {
        this.flatSections.set(this.flattenSections(res.entries));
        this.sectionsLoading.set(false);
      },
      error: () => this.sectionsLoading.set(false),
    });
  }

  private flattenSections(docs: NuxeoDocument[]): FlatSection[] {
    const pathMap = new Map<string, NuxeoDocument>();
    for (const doc of docs) pathMap.set(doc.path, doc);

    const childrenMap = new Map<string, NuxeoDocument[]>();
    const roots: NuxeoDocument[] = [];

    for (const doc of docs) {
      const parentPath = doc.path.split('/').slice(0, -1).join('/');
      if (pathMap.has(parentPath)) {
        const siblings = childrenMap.get(parentPath) ?? [];
        siblings.push(doc);
        childrenMap.set(parentPath, siblings);
      } else {
        roots.push(doc);
      }
    }

    const result: FlatSection[] = [];
    const walk = (nodes: NuxeoDocument[], depth: number) => {
      for (const doc of nodes) {
        result.push({ uid: doc.uid, title: doc.title, depth });
        const children = childrenMap.get(doc.path) ?? [];
        if (children.length > 0) walk(children, depth + 1);
      }
    };
    walk(roots, 0);
    return result;
  }

  sectionIndent(depth: number): string {
    return '\u00A0\u00A0'.repeat(depth);
  }

  versionStr(doc: NuxeoDocument): string {
    const major = Number(doc.properties['uid:major_version'] ?? 0);
    const minor = Number(doc.properties['uid:minor_version'] ?? 0);
    return `${major}.${minor}`;
  }

  close(): void {
    this.dialogRef.close();
  }

  publish(): void {
    if (!this.selectedSectionId || this.publishing()) return;
    this.publishing.set(true);

    const renditionName =
      this.showRenditions && this.selectedRendition && this.selectedRendition !== '__default__'
        ? this.selectedRendition
        : undefined;
    const defaultRendition = this.showRenditions && this.selectedRendition === '__default__';

    this.detailService
      .publishDocument(this.data.documentUid, this.selectedSectionId, {
        override: this.overrideExisting,
        renditionName,
        defaultRendition,
      })
      .subscribe({
        next: () => {
          this.publishing.set(false);
          this.snackBar.open(`"${this.data.documentTitle}" published successfully`, 'OK', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.publishing.set(false);
          this.snackBar.open('Failed to publish document', 'OK', { duration: 3000 });
        },
      });
  }
}
