import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { NuxeoService, NuxeoDocument } from '../../services/nuxeo';
import { catchError, of } from 'rxjs';

interface MetadataRow {
  key: string;
  value: string;
}

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './document-viewer.html',
  styleUrls: ['./document-viewer.scss'],
})
export class DocumentViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly nuxeo = inject(NuxeoService);

  document = signal<NuxeoDocument | null>(null);
  loading = signal(false);
  error = signal('');
  metadataRows = signal<MetadataRow[]>([]);
  metadataColumns = ['key', 'value'];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.loadDocument(id);
    });
  }

  loadDocument(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.nuxeo.getDocument(`/id/${id}`).pipe(
      catchError(err => {
        this.error.set('Failed to load document: ' + (err.message || 'Unknown error'));
        return of(null);
      })
    ).subscribe(doc => {
      if (doc) {
        this.document.set(doc);
        this.buildMetadata(doc);
      }
      this.loading.set(false);
    });
  }

  buildMetadata(doc: NuxeoDocument): void {
    const rows: MetadataRow[] = [];
    const props = doc.properties || {};
    for (const [key, value] of Object.entries(props)) {
      if (value !== null && value !== undefined && value !== '') {
        rows.push({ key, value: String(value) });
      }
    }
    this.metadataRows.set(rows);
  }

  getDownloadUrl(): string {
    const doc = this.document();
    return doc ? this.nuxeo.getDownloadUrl(doc) : '';
  }
}
