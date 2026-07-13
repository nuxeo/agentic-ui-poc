import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { BrowseService } from '@agentic-ui/shared/nuxeo-client';

/**
 * Resolves the current user's personal workspace and opens it in browse view,
 * matching Nuxeo Web UI (`User.GetUserWorkspace` + `navigateTo('browse', path)`).
 */
@Component({
  standalone: true,
  imports: [MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './personal-space-page.component.html',
  styleUrl: './personal-space-page.component.scss',
})
export class PersonalSpacePageComponent {
  private readonly browseService = inject(BrowseService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadPersonalWorkspace();
  }

  retry(): void {
    this.loadPersonalWorkspace();
  }

  private loadPersonalWorkspace(): void {
    this.loading.set(true);
    this.error.set(null);

    this.browseService
      .getUserWorkspace()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (workspace) => {
          void this.router.navigateByUrl(`/browse${workspace.path}`, { replaceUrl: true });
        },
        error: () => {
          this.error.set('Unable to load your personal workspace.');
          this.loading.set(false);
        },
      });
  }
}
