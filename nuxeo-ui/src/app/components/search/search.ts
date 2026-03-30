import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { NuxeoService, NuxeoDocument } from '../../services/nuxeo';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
})
export class SearchComponent implements OnInit {
  private readonly nuxeo = inject(NuxeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  searchControl = new FormControl('');
  results = signal<NuxeoDocument[]>([]);
  loading = signal(false);
  error = signal('');
  searched = signal(false);
  displayedColumns = ['title', 'type', 'path', 'lastModified', 'actions'];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchControl.setValue(params['q']);
        this.doSearch(params['q']);
      }
    });
  }

  search(): void {
    const q = this.searchControl.value?.trim();
    if (!q) return;
    this.router.navigate([], { queryParams: { q }, replaceUrl: true });
    this.doSearch(q);
  }

  doSearch(query: string): void {
    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.nuxeo.search(query).pipe(
      catchError(err => {
        this.error.set('Search failed: ' + (err.message || 'Unknown error'));
        return of({ entries: [], totalSize: 0, 'entity-type': 'documents' });
      })
    ).subscribe(result => {
      this.results.set(result.entries || []);
      this.loading.set(false);
    });
  }

  openDocument(doc: NuxeoDocument): void {
    this.router.navigate(['/document', doc.uid]);
  }
}
