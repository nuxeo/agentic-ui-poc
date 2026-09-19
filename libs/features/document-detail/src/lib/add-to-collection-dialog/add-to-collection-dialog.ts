import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NuxeoDocument, DocumentDetailService } from '@nuxeo-satori/platform/nuxeo-client';

@Component({
  selector: 'lib-add-to-collection-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-to-collection-dialog.html',
  styleUrl: './add-to-collection-dialog.scss',
})
export class AddToCollectionDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AddToCollectionDialogComponent>);
  private readonly detailService = inject(DocumentDetailService);

  readonly collections = signal<NuxeoDocument[]>([]);
  readonly loading = signal(true);
  readonly adding = signal(false);
  readonly creating = signal(false);
  readonly searchTerm = signal('');
  selectedCollectionId: string | null = null;

  readonly filteredCollections = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.collections();
    if (!term) return all;
    return all.filter((c) => c.title.toLowerCase().includes(term));
  });

  readonly showCreateOption = computed(() => {
    const term = this.searchTerm().trim();
    if (!term) return false;
    const exact = this.collections().some((c) => c.title.toLowerCase() === term.toLowerCase());
    return !exact;
  });

  ngOnInit(): void {
    this.detailService.getCollections().subscribe({
      next: (res) => {
        this.collections.set(res.entries);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  createNewCollection(): void {
    const title = this.searchTerm().trim();
    if (!title || this.creating()) return;
    this.creating.set(true);

    this.detailService.createCollection(title).subscribe({
      next: (newDoc) => {
        this.collections.update((cols) => [...cols, newDoc]);
        this.selectedCollectionId = newDoc.uid;
        this.searchTerm.set('');
        this.creating.set(false);
      },
      error: () => this.creating.set(false),
    });
  }

  add(): void {
    if (!this.selectedCollectionId) return;
    this.adding.set(true);
    this.dialogRef.close(this.selectedCollectionId);
  }
}
