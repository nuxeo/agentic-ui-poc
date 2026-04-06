import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NuxeoDocument, DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';

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
  template: `
    <h2 mat-dialog-title>Add to Collection</h2>

    <mat-dialog-content>
      @if (loading()) {
        <div class="dialog-loading">
          <mat-spinner diameter="24" />
          <span>Loading collections...</span>
        </div>
      } @else {
        <mat-form-field appearance="outline" class="collection-field">
          <mat-label>Collections</mat-label>
          <mat-select
            [(ngModel)]="selectedCollectionId"
            placeholder="Select a Collection..."
            required
          >
            @for (col of filteredCollections(); track col.uid) {
              <mat-option [value]="col.uid">{{ col.title }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
          <input
            matInput
            placeholder="Search or create collection..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            autocomplete="off"
          />
        </mat-form-field>

        @if (showCreateOption()) {
          <button
            class="create-collection-btn"
            (click)="createNewCollection()"
            [disabled]="creating()"
          >
            @if (creating()) {
              <mat-spinner diameter="16" />
            } @else {
              <mat-icon>add_circle</mat-icon>
            }
            <span>Create "{{ searchTerm() }}"</span>
          </button>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!selectedCollectionId || adding()"
        (click)="add()"
      >
        @if (adding()) {
          <mat-spinner diameter="18" />
        } @else {
          Add
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 400px;
      }

      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 8px !important;
      }

      .collection-field,
      .search-field {
        width: 100%;
      }

      .dialog-loading {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 13px;
      }

      .create-collection-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px dashed var(--mat-sys-primary);
        border-radius: 6px;
        background: var(--mat-sys-primary-container);
        cursor: pointer;
        font-size: 13px;
        color: var(--mat-sys-on-primary-container);
        font-weight: 500;
        transition: background 0.15s;

        &:hover:not(:disabled) {
          background: color-mix(in srgb, var(--mat-sys-primary) 12%, var(--mat-sys-surface));
        }

        &:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: var(--mat-sys-on-primary-container);
        }
      }

      mat-dialog-actions {
        padding: 8px 24px 16px;
      }
    `,
  ],
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
