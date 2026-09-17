import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  BrowseService,
  isFolderishDocument,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';

export interface FolderPickerDialogData {
  /** Folder path to start from (e.g. current import target). */
  initialPath: string;
}

export interface FolderPickerDialogResult {
  path: string;
  title: string;
}

function normalizePath(p: string): string {
  return p.replace(/\/+$/, '') || '/';
}

function parentPath(path: string): string | null {
  const n = normalizePath(path);
  const parts = n.split('/').filter(Boolean);
  if (parts.length <= 1) {
    return null;
  }
  return `/${parts.slice(0, -1).join('/')}`;
}

@Component({
  selector: 'lib-folder-picker-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './folder-picker-dialog.component.html',
  styleUrl: './folder-picker-dialog.component.scss',
})
export class FolderPickerDialogComponent implements OnInit {
  private readonly dialogRef = inject(
    MatDialogRef<FolderPickerDialogComponent, FolderPickerDialogResult>,
  );
  readonly data = inject<FolderPickerDialogData>(MAT_DIALOG_DATA);
  private readonly browse = inject(BrowseService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentPath = signal('');
  readonly currentTitle = signal('');
  readonly folders = signal<NuxeoDocument[]>([]);

  ngOnInit(): void {
    this.currentPath.set(normalizePath(this.data.initialPath || '/default-domain'));
    this.loadCurrent();
  }

  breadcrumbDisplay(): string {
    return this.formatBreadcrumb(this.currentPath());
  }

  private formatBreadcrumb(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts
      .map((seg) => {
        if (seg === 'default-domain') return 'Domain';
        if (seg === 'workspaces' || seg === 'workspace') return 'Workspaces';
        if (seg === 'userworkspaces' || seg === 'UserWorkspaces') return 'UserWorkspaces';
        return decodeURIComponent(seg);
      })
      .join(' > ');
  }

  loadCurrent(): void {
    const path = this.currentPath();
    this.loading.set(true);
    this.error.set(null);
    this.browse.getByPath(path).subscribe({
      next: (doc) => {
        if (!isFolderishDocument(doc)) {
          this.error.set('Selected path is not a folder. Choose a folder or go up one level.');
          this.loading.set(false);
          return;
        }
        this.currentTitle.set(doc.title ?? path.split('/').pop() ?? path);
        this.browse.getChildren(path, 200, 0).subscribe({
          next: (list) => {
            const onlyFolders = (list.entries ?? []).filter((d) => isFolderishDocument(d));
            onlyFolders.sort((a, b) =>
              (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' }),
            );
            this.folders.set(onlyFolders);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Could not load folder contents.');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Could not resolve this path. Try another folder.');
        this.loading.set(false);
      },
    });
  }

  canGoUp(): boolean {
    return parentPath(this.currentPath()) !== null;
  }

  goUp(): void {
    const p = parentPath(this.currentPath());
    if (p === null) return;
    this.currentPath.set(p);
    this.loadCurrent();
  }

  openFolder(doc: NuxeoDocument): void {
    if (!doc.path || !isFolderishDocument(doc)) return;
    this.currentPath.set(normalizePath(doc.path));
    this.loadCurrent();
  }

  selectCurrent(): void {
    this.dialogRef.close({
      path: this.currentPath(),
      title: this.currentTitle(),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
