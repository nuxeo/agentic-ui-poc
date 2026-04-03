import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NuxeoDriveService } from '@agentic-ui/shared/nuxeo-client';

export interface DriveDialogData {
  docUid: string;
  filename: string;
  blobUrl: string;
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
  selector: 'lib-drive-dialog',
  standalone: true,
  imports: [MatDialogModule, MatProgressSpinnerModule],
  template: `
    <div class="drive-dialog">
      @if (checking()) {
        <div class="launching-state">
          <mat-spinner diameter="32" />
          <p class="launching-text">Checking Nuxeo Drive...</p>
        </div>
      } @else {
        <h2>Download Nuxeo Drive Client</h2>
        <table class="drive-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Package to Install</th>
            </tr>
          </thead>
          <tbody>
            @for (pkg of packages; track pkg.platform) {
              <tr>
                <td>
                  <span class="platform-badge">{{ pkg.platform }}</span>
                </td>
                <td>
                  <a class="package-link" [href]="pkg.url" target="_blank" rel="noopener">{{
                    pkg.name
                  }}</a>
                </td>
              </tr>
            }
          </tbody>
        </table>
        <button type="button" class="close-link" (click)="close()">Close</button>
      }
    </div>
  `,
  styles: [
    `
      .drive-dialog {
        padding: 28px 32px;
      }
      h2 {
        margin: 0 0 24px;
        font-size: 22px;
        font-weight: 600;
        color: #333;
      }
      .launching-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 32px 0;
      }
      .launching-text {
        font-size: 15px;
        font-weight: 500;
        color: #333;
        margin: 0;
      }
      .drive-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      .drive-table th {
        text-align: left;
        font-size: 13px;
        font-weight: 500;
        color: #888;
        padding: 0 16px 12px 0;
      }
      .drive-table td {
        padding: 12px 16px 12px 0;
        border-top: 1px solid #f0f0f0;
        vertical-align: middle;
      }
      .platform-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 3px;
        background: #455a64;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
      }
      .package-link {
        font-size: 14px;
        color: #333;
        text-decoration: none;
        &:hover {
          color: #3f51b5;
          text-decoration: underline;
        }
      }
      .close-link {
        border: none;
        background: none;
        font-size: 14px;
        color: #3f51b5;
        cursor: pointer;
        padding: 0;
        &:hover {
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class DriveDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DriveDialogComponent>);
  private readonly driveService = inject(NuxeoDriveService);
  private readonly data = inject<DriveDialogData>(MAT_DIALOG_DATA);

  readonly packages = DRIVE_PACKAGES;
  readonly checking = signal(true);

  ngOnInit(): void {
    this.driveService.hasDriveToken().subscribe((hasToken) => {
      if (hasToken) {
        const url = this.driveService.buildEditUrl(
          this.data.docUid,
          this.data.blobUrl ?? '',
          this.data.filename,
        );
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
