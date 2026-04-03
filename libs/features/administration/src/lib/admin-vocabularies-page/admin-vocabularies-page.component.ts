import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  AdministrationService,
  DirectoryEntry,
  DirectoryService,
} from '@agentic-ui/shared/nuxeo-client';

@Component({
  selector: 'lib-admin-vocabularies-page',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './admin-vocabularies-page.component.html',
  styleUrl: './admin-vocabularies-page.component.scss',
})
export class AdminVocabulariesPageComponent implements OnInit {
  private readonly directoryService = inject(DirectoryService);
  private readonly adminService = inject(AdministrationService);

  directoryNames = signal<string[]>([]);
  selectedDirectory = signal<string>('');
  entries = signal<DirectoryEntry[]>([]);
  loading = signal(false);
  loadingList = signal(false);

  readonly columns = ['id', 'label', 'ordering'] as const;

  ngOnInit(): void {
    this.loadingList.set(true);
    this.adminService.listDirectoryNames().subscribe({
      next: (names) => {
        this.directoryNames.set(names);
        this.loadingList.set(false);
        if (names.length && !this.selectedDirectory()) {
          this.selectedDirectory.set(names[0]);
          this.loadEntries(names[0]);
        }
      },
      error: () => this.loadingList.set(false),
    });
  }

  onDirectoryChange(name: string): void {
    this.selectedDirectory.set(name);
    this.loadEntries(name);
  }

  loadEntries(directoryName: string): void {
    if (!directoryName) {
      this.entries.set([]);
      return;
    }
    this.loading.set(true);
    this.directoryService.getEntries(directoryName).subscribe({
      next: (rows) => {
        this.entries.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.entries.set([]);
        this.loading.set(false);
      },
    });
  }
}
