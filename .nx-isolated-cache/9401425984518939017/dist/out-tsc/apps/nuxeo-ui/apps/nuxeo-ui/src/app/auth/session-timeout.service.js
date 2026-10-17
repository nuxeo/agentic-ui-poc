import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionExpiryWarningDialogComponent, } from './session-expiry-warning-dialog.component';
import { SESSION_TIMEOUT_CONFIG } from './session-timeout.config';
import * as i0 from "@angular/core";
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];
export class SessionTimeoutService {
    auth = inject(AuthService);
    router = inject(Router);
    dialog = inject(MatDialog);
    config = inject(SESSION_TIMEOUT_CONFIG);
    running = false;
    warningTimer = null;
    logoutTimer = null;
    dialogRef = null;
    expiring = false;
    boundOnActivity = () => this.onUserActivity();
    start() {
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
    stop() {
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
    recordActivity() {
        if (!this.running || this.dialogRef) {
            return;
        }
        this.scheduleIdleTimers();
    }
    /** Forces logout when the server rejects the session (HTTP 401). */
    expireDueToServer() {
        this.expireSession();
    }
    onUserActivity() {
        if (!this.running || this.dialogRef) {
            return;
        }
        this.scheduleIdleTimers();
    }
    scheduleIdleTimers() {
        this.clearTimers();
        const warningBefore = this.effectiveWarningBeforeMs();
        const warningDelay = Math.max(0, this.config.idleTimeoutMs - warningBefore);
        this.warningTimer = setTimeout(() => this.showWarning(), warningDelay);
    }
    effectiveWarningBeforeMs() {
        return Math.min(this.config.warningBeforeMs, this.config.idleTimeoutMs);
    }
    showWarning() {
        if (!this.running || this.dialogRef || !this.auth.isAuthenticated()) {
            return;
        }
        const warningBefore = this.effectiveWarningBeforeMs();
        const warningMinutes = Math.max(1, Math.round(warningBefore / 60_000));
        const data = { warningMinutes };
        this.dialogRef = this.dialog.open(SessionExpiryWarningDialogComponent, {
            disableClose: true,
            width: '28rem',
            data,
        });
        this.logoutTimer = setTimeout(() => {
            this.closeDialog();
            this.expireSession();
        }, warningBefore);
        this.dialogRef.afterClosed().subscribe((staySignedIn) => {
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
    expireSession() {
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
    clearTimers() {
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
        if (this.logoutTimer) {
            clearTimeout(this.logoutTimer);
            this.logoutTimer = null;
        }
    }
    closeDialog() {
        this.dialogRef?.close();
        this.dialogRef = null;
    }
    static ɵfac = function SessionTimeoutService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SessionTimeoutService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SessionTimeoutService, factory: SessionTimeoutService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SessionTimeoutService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
