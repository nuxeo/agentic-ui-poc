import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import {
  SessionExpiryWarningDialogComponent,
  type SessionExpiryWarningDialogData,
} from './session-expiry-warning-dialog.component';
import { SESSION_TIMEOUT_CONFIG } from './session-timeout.config';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly config = inject(SESSION_TIMEOUT_CONFIG);

  private running = false;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;
  private dialogRef: MatDialogRef<SessionExpiryWarningDialogComponent> | null = null;
  private expiring = false;
  private readonly boundOnActivity = () => this.onUserActivity();

  start(): void {
    if (this.running || !this.auth.isAuthenticated()) {
      return;
    }
    this.expiring = false;
    this.running = true;
    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, this.boundOnActivity, { passive: true });
    }
    this.scheduleIdleTimers();
  }

  stop(): void {
    if (!this.running) {
      return;
    }
    this.running = false;
    for (const event of ACTIVITY_EVENTS) {
      document.removeEventListener(event, this.boundOnActivity);
    }
    this.clearTimers();
    this.closeDialog();
  }

  /** Resets the idle countdown after successful Nuxeo API activity. */
  recordActivity(): void {
    if (!this.running || this.dialogRef) {
      return;
    }
    this.scheduleIdleTimers();
  }

  /** Forces logout when the server rejects the session (HTTP 401). */
  expireDueToServer(): void {
    this.expireSession();
  }

  private onUserActivity(): void {
    if (!this.running || this.dialogRef) {
      return;
    }
    this.scheduleIdleTimers();
  }

  private scheduleIdleTimers(): void {
    this.clearTimers();
    const warningBefore = this.effectiveWarningBeforeMs();
    const warningDelay = Math.max(0, this.config.idleTimeoutMs - warningBefore);
    this.warningTimer = setTimeout(() => this.showWarning(), warningDelay);
  }

  private effectiveWarningBeforeMs(): number {
    return Math.min(this.config.warningBeforeMs, this.config.idleTimeoutMs);
  }

  private showWarning(): void {
    if (!this.running || this.dialogRef || !this.auth.isAuthenticated()) {
      return;
    }

    const warningBefore = this.effectiveWarningBeforeMs();
    const warningMinutes = Math.max(1, Math.round(warningBefore / 60_000));
    const data: SessionExpiryWarningDialogData = { warningMinutes };

    this.dialogRef = this.dialog.open(SessionExpiryWarningDialogComponent, {
      disableClose: true,
      width: '28rem',
      data,
    });

    this.logoutTimer = setTimeout(() => {
      this.closeDialog();
      this.expireSession();
    }, warningBefore);

    this.dialogRef.afterClosed().subscribe((staySignedIn: boolean | undefined) => {
      this.dialogRef = null;
      if (!this.running) {
        return;
      }
      if (staySignedIn === true) {
        if (this.logoutTimer) {
          clearTimeout(this.logoutTimer);
          this.logoutTimer = null;
        }
        this.scheduleIdleTimers();
        return;
      }
      if (staySignedIn === false) {
        if (this.logoutTimer) {
          clearTimeout(this.logoutTimer);
          this.logoutTimer = null;
        }
        this.expireSession();
      }
    });
  }

  private expireSession(): void {
    if (this.expiring || !this.auth.isAuthenticated()) {
      return;
    }
    this.expiring = true;
    this.stop();
    this.auth.logout();
    void this.router.navigate(['/login'], {
      queryParams: { reason: 'session-expired' },
    });
  }

  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private closeDialog(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
  }
}
