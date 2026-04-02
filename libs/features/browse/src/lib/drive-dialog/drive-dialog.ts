import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  imports: [MatDialogModule],
  template: `
    <div class="drive-dialog">
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
      <button class="close-link" (click)="close()">Close</button>
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
export class BrowseDriveDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<BrowseDriveDialogComponent>);
  readonly packages = DRIVE_PACKAGES;
  close(): void {
    this.dialogRef.close();
  }
}
