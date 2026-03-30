import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NuxeoService, NuxeoDocument } from '../../services/nuxeo';
import { catchError, of } from 'rxjs';

interface Breadcrumb {
  label: string;
  path: string;
}

@Component({
  selector: 'app-browser',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './browser.html',
  styleUrls: ['./browser.scss'],
})
export class BrowserComponent implements OnInit {
  private readonly nuxeo = inject(NuxeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  documents = signal<NuxeoDocument[]>([]);
  loading = signal(false);
  error = signal('');
  currentPath = signal('/');
  breadcrumbs = signal<Breadcrumb[]>([{ label: 'Root', path: '/' }]);
  displayedColumns = ['icon', 'title', 'type', 'lastModified', 'actions'];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const path = params['path'] ? '/' + params['path'] : '/';
      this.navigateTo(path);
    });
  }

  navigateTo(path: string): void {
    this.currentPath.set(path);
    this.updateBreadcrumbs(path);
    this.loadChildren(path);
  }

  loadChildren(path: string): void {
    this.loading.set(true);
    this.error.set('');
    this.nuxeo.getChildren(path).pipe(
      catchError(err => {
        this.error.set('Failed to load documents: ' + (err.message || 'Unknown error'));
        return of({ entries: [], totalSize: 0, 'entity-type': 'documents' });
      })
    ).subscribe(result => {
      this.documents.set(result.entries || []);
      this.loading.set(false);
    });
  }

  updateBreadcrumbs(path: string): void {
    const parts = path.split('/').filter(Boolean);
    const crumbs: Breadcrumb[] = [{ label: 'Root', path: '/' }];
    let current = '';
    for (const part of parts) {
      current += '/' + part;
      crumbs.push({ label: part, path: current });
    }
    this.breadcrumbs.set(crumbs);
  }

  openDocument(doc: NuxeoDocument): void {
    if (doc.type === 'Folder' || doc.type === 'Workspace' || doc.facets?.includes('Folderish')) {
      this.router.navigate(['/browser', doc.path.replace(/^\//, '')]);
    } else {
      this.router.navigate(['/document', doc.uid]);
    }
  }

  getIcon(doc: NuxeoDocument): string {
    if (doc.type === 'Folder' || doc.type === 'Workspace' || doc.facets?.includes('Folderish')) {
      return 'folder';
    }
    const title = doc.title?.toLowerCase() || '';
    if (title.endsWith('.pdf')) return 'picture_as_pdf';
    if (title.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image';
    if (title.match(/\.(mp4|avi|mov)$/)) return 'videocam';
    if (title.match(/\.(mp3|wav|ogg)$/)) return 'audiotrack';
    if (title.match(/\.(doc|docx)$/)) return 'description';
    if (title.match(/\.(xls|xlsx)$/)) return 'table_chart';
    if (title.match(/\.(ppt|pptx)$/)) return 'slideshow';
    return 'insert_drive_file';
  }
}
