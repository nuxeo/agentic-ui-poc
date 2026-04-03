import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  SettingsService,
  type AuthorizedApplication,
} from '@agentic-ui/shared/nuxeo-client';

@Component({
  standalone: true,
  templateUrl: './authorized-applications-page.component.html',
  styleUrl: './authorized-applications-page.component.scss',
})
export class AuthorizedApplicationsPageComponent {
  private readonly settingsService = inject(SettingsService);

  readonly applications = signal<AuthorizedApplication[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.settingsService
      .getAuthorizedApplications()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (applications) => {
          this.applications.set(applications);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load authorized applications.');
          this.loading.set(false);
        },
      });
  }
}
