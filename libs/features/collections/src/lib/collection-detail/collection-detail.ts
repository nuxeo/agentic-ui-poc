import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  NuxeoDocument,
  NuxeoAce,
  NuxeoAcl,
  CollectionService,
  DocumentDetailService,
} from '@agentic-ui/shared/nuxeo-client';
import { ShareDialogComponent, ShareDialogData } from '@agentic-ui/shared/ui';
import { EditCollectionDialogComponent, EditCollectionDialogData } from '../edit-collection-dialog/edit-collection-dialog';
import { AddPermissionDialogComponent, AddPermissionDialogData } from '../add-permission-dialog/add-permission-dialog';
import { UpdatePermissionDialogComponent, UpdatePermissionDialogData } from '../update-permission-dialog/update-permission-dialog';
import { DeletePermissionDialogComponent, DeletePermissionDialogData } from '../delete-permission-dialog/delete-permission-dialog';
import { ShareExternalDialogComponent, ShareExternalDialogData } from '../share-external-dialog/share-external-dialog';

const DOC_TYPE_ICONS: Record<string, string> = {
  File: 'description',
  Note: 'sticky_note_2',
  Picture: 'image',
  Video: 'videocam',
  Audio: 'audiotrack',
  Folder: 'folder',
  Workspace: 'workspaces',
  Collection: 'collections_bookmark',
};

@Component({
  selector: 'lib-collection-detail',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './collection-detail.html',
  styleUrl: './collection-detail.scss',
})
export class CollectionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly collectionService = inject(CollectionService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly collection = signal<NuxeoDocument | null>(null);
  readonly members = signal<NuxeoDocument[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalSize = signal(0);

  readonly isLocked = signal(false);
  readonly lockOwner = signal<string | null>(null);
  readonly isSubscribed = signal(false);
  readonly actionInProgress = signal<string | null>(null);
  readonly clipboardDocs = signal<Array<{ uid: string; title: string }>>(
    JSON.parse(localStorage.getItem('nuxeo_clipboard') ?? '[]'),
  );

  private collectionUid = '';

  readonly isInClipboard = computed(() =>
    this.clipboardDocs().some((d) => d.uid === this.collectionUid),
  );

  readonly localAces = computed<NuxeoAce[]>(() => {
    const acls = this.collection()?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    const local = acls.find((a) => a.name === 'local');
    return local?.aces.filter((ace) => ace.granted && !ace.externalUser) ?? [];
  });

  readonly inheritedAces = computed<NuxeoAce[]>(() => {
    const acls = this.collection()?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    const inherited = acls.find((a) => a.name === 'inherited');
    return inherited?.aces.filter((ace) => ace.granted) ?? [];
  });

  readonly externalAces = computed<NuxeoAce[]>(() => {
    const acls = this.collection()?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    return acls.flatMap((a) => a.aces).filter((ace) => ace.externalUser && ace.granted);
  });

  readonly isInheritanceBlocked = computed<boolean>(() => {
    const acls = this.collection()?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return false;
    return !acls.some((a) => a.name === 'inherited');
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.collectionUid = params.get('uid') ?? '';
      if (this.collectionUid) {
        this.loadCollection();
        this.loadMembers();
      }
    });
  }

  private loadCollection(): void {
    this.detailService.getFullDocument(this.collectionUid).subscribe({
      next: (doc) => {
        this.collection.set(doc);
        this.syncActionStates(doc);
      },
      error: () => {
        this.collectionService.getById(this.collectionUid).subscribe({
          next: (doc) => this.collection.set(doc),
          error: () => {},
        });
      },
    });
  }

  private syncActionStates(doc: NuxeoDocument): void {
    this.isLocked.set(!!doc.lockOwner);
    this.lockOwner.set(doc.lockOwner ?? null);
    const subs = doc.contextParameters?.subscribedNotifications;
    this.isSubscribed.set(Array.isArray(subs) && subs.length > 0);
  }

  loadMembers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.collectionService.getCollectionMembers(this.collectionUid, 50).subscribe({
      next: (res) => {
        this.members.set(res.entries);
        this.totalSize.set(res.totalSize);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load collection contents.');
        this.loading.set(false);
      },
    });
  }

  breadcrumbPath(): string {
    const col = this.collection();
    if (!col?.path) return '';
    const segments = col.path.split('/').filter(Boolean);
    segments.pop();
    return segments.join(' > ');
  }

  creator(): string {
    const col = this.collection();
    return (col?.properties?.['dc:creator'] as string) ?? '';
  }

  docIcon(doc: NuxeoDocument): string {
    return DOC_TYPE_ICONS[doc.type] ?? 'insert_drive_file';
  }

  lastContributor(doc: NuxeoDocument): string {
    return (doc.properties?.['dc:lastContributor'] as string) ?? '';
  }

  contributorInitial(doc: NuxeoDocument): string {
    const c = this.lastContributor(doc);
    return c ? c.charAt(0).toUpperCase() : '?';
  }

  onRowClick(doc: NuxeoDocument): void {
    void this.router.navigateByUrl(`/doc/${doc.uid}`);
  }

  // --- Actions ---

  editCollection(): void {
    const col = this.collection();
    if (!col) return;

    const dialogRef = this.dialog.open(EditCollectionDialogComponent, {
      data: { document: col } satisfies EditCollectionDialogData,
      width: '560px',
    });

    dialogRef.afterClosed().subscribe((updatedDoc: NuxeoDocument | undefined) => {
      if (updatedDoc) {
        this.collection.set(updatedDoc);
        this.toast('Collection updated');
      }
    });
  }

  toggleLock(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('lock');
    const op = this.isLocked()
      ? this.detailService.unlockDocument(this.collectionUid)
      : this.detailService.lockDocument(this.collectionUid);

    op.subscribe({
      next: () => {
        const wasLocked = this.isLocked();
        this.isLocked.set(!wasLocked);
        this.lockOwner.set(wasLocked ? null : 'Administrator');
        this.actionInProgress.set(null);
        this.toast(wasLocked ? 'Collection unlocked' : 'Collection locked');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Action failed');
      },
    });
  }

  toggleSubscription(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('subscribe');
    const op = this.isSubscribed()
      ? this.detailService.unsubscribe(this.collectionUid)
      : this.detailService.subscribe(this.collectionUid);

    op.subscribe({
      next: () => {
        const wasSub = this.isSubscribed();
        this.isSubscribed.set(!wasSub);
        this.actionInProgress.set(null);
        this.toast(wasSub ? 'Notifications disabled' : 'Notifications enabled');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Action failed');
      },
    });
  }

  deleteCollection(): void {
    if (this.actionInProgress()) return;
    if (!confirm('Are you sure you want to delete this collection?')) return;
    this.actionInProgress.set('trash');

    this.detailService.trashDocument(this.collectionUid).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.toast('Collection moved to trash');
        void this.router.navigateByUrl('/collections');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to delete collection');
      },
    });
  }

  toggleClipboard(): void {
    const current = this.clipboardDocs();
    const col = this.collection();
    if (!col) return;

    if (this.isInClipboard()) {
      const updated = current.filter((c) => c.uid !== this.collectionUid);
      this.clipboardDocs.set(updated);
      localStorage.setItem('nuxeo_clipboard', JSON.stringify(updated));
      this.toast('Removed from clipboard');
    } else {
      const updated = [...current, { uid: col.uid, title: col.title }];
      this.clipboardDocs.set(updated);
      localStorage.setItem('nuxeo_clipboard', JSON.stringify(updated));
      this.toast('Added to clipboard');
    }
  }

  exportCollection(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('export');

    const title = this.collection()?.title ?? 'collection';
    this.collectionService.bulkDownload(this.collectionUid, `${title}.zip`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        this.actionInProgress.set(null);
        this.toast('Download started');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Export failed');
      },
    });
  }

  shareCollection(): void {
    this.dialog.open(ShareDialogComponent, {
      data: {
        title: this.collection()?.title ?? 'Collection',
        url: window.location.href,
      } satisfies ShareDialogData,
      width: '520px',
    });
  }

  permissionLabel(permission: string): string {
    const labels: Record<string, string> = {
      Everything: 'Manage everything',
      ReadWrite: 'Edit',
      Read: 'Read',
      Write: 'Write',
      ReadRemove: 'Read & Remove',
      AddChildren: 'Add Children',
      Remove: 'Remove',
      ManageWorkflows: 'Manage Workflows',
      ReadCanCollect: 'Can collect',
    };
    return labels[permission] ?? permission;
  }

  aceTimeFrame(ace: NuxeoAce): string {
    if (!ace.begin && !ace.end) return 'Permanent';
    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!ace.begin && ace.end) return `Until ${fmt(ace.end)}`;
    const parts: string[] = [];
    if (ace.begin) parts.push(`from ${fmt(ace.begin)}`);
    if (ace.end) parts.push(`to ${fmt(ace.end)}`);
    return parts.join(' ');
  }

  addPermission(): void {
    const dialogRef = this.dialog.open(AddPermissionDialogComponent, {
      data: { documentUid: this.collectionUid } satisfies AddPermissionDialogData,
      width: '560px',
    });

    dialogRef.afterClosed().subscribe((created: boolean | undefined) => {
      if (created) {
        this.loadCollection();
        this.toast('Permission added');
      }
    });
  }

  editPermission(ace: NuxeoAce): void {
    const dialogRef = this.dialog.open(UpdatePermissionDialogComponent, {
      data: { documentUid: this.collectionUid, ace } satisfies UpdatePermissionDialogData,
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((updated: boolean | undefined) => {
      if (updated) {
        this.loadCollection();
        this.toast('Permission updated');
      }
    });
  }

  deletePermission(ace: NuxeoAce): void {
    const dialogRef = this.dialog.open(DeletePermissionDialogComponent, {
      data: {
        documentUid: this.collectionUid,
        ace,
        permissionLabel: this.permissionLabel(ace.permission),
        timeFrameLabel: this.aceTimeFrame(ace),
      } satisfies DeletePermissionDialogData,
      width: '560px',
    });

    dialogRef.afterClosed().subscribe((deleted: boolean | undefined) => {
      if (deleted) {
        this.loadCollection();
        this.toast('Permission deleted');
      }
    });
  }

  displayUsername(ace: NuxeoAce): string {
    return ace.username.replace(/^transient\//, '');
  }

  editExternalPermission(ace: NuxeoAce): void {
    const dialogRef = this.dialog.open(UpdatePermissionDialogComponent, {
      data: {
        documentUid: this.collectionUid,
        ace,
        isExternal: true,
      } satisfies UpdatePermissionDialogData,
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((updated: boolean | undefined) => {
      if (updated) {
        this.loadCollection();
        this.toast('Permission updated');
      }
    });
  }

  sendNotificationEmail(ace: NuxeoAce): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('notify-' + ace.id);

    this.detailService
      .sendNotificationEmailForPermission(this.collectionUid, ace.id)
      .subscribe({
        next: () => {
          this.actionInProgress.set(null);
          this.toast('Notification email sent');
        },
        error: () => {
          this.actionInProgress.set(null);
          this.toast('Failed to send notification');
        },
      });
  }

  shareWithExternal(): void {
    const dialogRef = this.dialog.open(ShareExternalDialogComponent, {
      data: { documentUid: this.collectionUid } satisfies ShareExternalDialogData,
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((created: boolean | undefined) => {
      if (created) {
        this.loadCollection();
        this.toast('Shared with external user');
      }
    });
  }

  toggleInheritance(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('inheritance');

    const blocked = this.isInheritanceBlocked();
    const op = blocked
      ? this.detailService.unblockPermissionInheritance(this.collectionUid)
      : this.detailService.blockPermissionInheritance(this.collectionUid);

    op.subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.loadCollection();
        this.toast(blocked ? 'Inheritance unblocked' : 'Inheritance blocked');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Action failed');
      },
    });
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
