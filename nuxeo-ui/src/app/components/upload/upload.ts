import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NuxeoService } from '../../services/nuxeo';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './upload.html',
  styleUrls: ['./upload.scss'],
})
export class UploadComponent {
  private readonly nuxeo = inject(NuxeoService);
  private readonly fb = inject(FormBuilder);
  private readonly snackbar = inject(MatSnackBar);

  form = this.fb.nonNullable.group({
    parentPath: ['/', Validators.required],
    title: [''],
  });

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  uploadProgress = signal(0);
  dragOver = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
      if (!this.form.get('title')!.value) {
        this.form.patchValue({ title: input.files[0].name });
      }
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile.set(file);
      if (!this.form.get('title')!.value) {
        this.form.patchValue({ title: file.name });
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file || this.form.invalid) return;
    this.uploading.set(true);
    this.uploadProgress.set(10);
    const { parentPath } = this.form.getRawValue();
    this.nuxeo.uploadDocument(parentPath, file).subscribe({
      next: () => {
        this.uploadProgress.set(100);
        this.uploading.set(false);
        this.selectedFile.set(null);
        this.form.reset({ parentPath: '/', title: '' });
        this.snackbar.open('File uploaded successfully!', 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadProgress.set(0);
        this.snackbar.open('Upload failed: ' + (err.message || 'Unknown error'), 'Close', { duration: 6000 });
      },
    });
  }
}
