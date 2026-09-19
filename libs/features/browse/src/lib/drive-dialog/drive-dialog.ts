import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NuxeoDriveService } from '@nuxeo-satori/platform/nuxeo-client';

export interface BrowseDriveDialogData {
  docUid: string;
  docPath: string;
}

interface DrivePackage {
  platform: string;
  name: string;
  url: string;
}

const DRIVE_PACKAGES: DrivePackage[] = [
  {
    platform: 'Linux',
    name: 'Nuxeo-Drive-X86_64.AppImage',
    url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive-x86_64.AppImage',
  },
  {
    platform: 'macOS',
    name: 'Nuxeo-Drive.Dmg',
    url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.dmg',
  },
  {
    platform: 'Windows',
    name: 'Nuxeo-Drive.Exe',
    url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.exe',
  },
];

@Component({
  selector: 'lib-browse-drive-dialog',
  standalone: true,
  imports: [MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './drive-dialog.html',
  styleUrl: './drive-dialog.scss',
})
export class BrowseDriveDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<BrowseDriveDialogComponent>);
  private readonly driveService = inject(NuxeoDriveService);
  private readonly data = inject<BrowseDriveDialogData>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);

  readonly packages = DRIVE_PACKAGES;
  readonly checking = signal(true);

  ngOnInit(): void {
    this.driveService
      .hasDriveToken()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hasToken) => {
        if (hasToken) {
          const url = this.driveService.buildDirectTransferUrl(this.data.docPath || '/');
          this.driveService.openDriveUrl(url);
          this.dialogRef.close();
        } else {
          this.checking.set(false);
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
