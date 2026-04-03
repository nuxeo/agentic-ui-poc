import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SettingsService, type ConnectedAccount } from '@agentic-ui/shared/nuxeo-client';

@Component({
  standalone: true,
  templateUrl: './cloud-services-page.component.html',
  styleUrl: './cloud-services-page.component.scss',
})
export class CloudServicesPageComponent {
  private readonly settingsService = inject(SettingsService);

  readonly title = 'Connected accounts';
  readonly serviceAccounts = signal<ConnectedAccount[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.settingsService
      .getConnectedAccounts()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (accounts) => {
          this.serviceAccounts.set(accounts);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load connected accounts.');
          this.loading.set(false);
        },
      });
  }

  sharedLabel(shared: boolean): string {
    return shared ? 'Yes' : 'No';
  }
}
