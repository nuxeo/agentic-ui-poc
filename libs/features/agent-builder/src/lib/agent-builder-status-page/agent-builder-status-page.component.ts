import { JsonPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, switchMap, tap, finalize } from 'rxjs';

import { AbClientService, AbClientError } from '@agentic-ui/shared/ab-client';

@Component({
  selector: 'lib-agent-builder-status-page',
  standalone: true,
  imports: [JsonPipe, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './agent-builder-status-page.component.html',
  styleUrl: './agent-builder-status-page.component.scss',
})
export class AgentBuilderStatusPageComponent {
  private readonly ab = inject(AbClientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly payload = signal<unknown>(null);

  constructor() {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => this.ab.health().pipe(finalize(() => this.loading.set(false)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (body) => this.payload.set(body),
        error: (err) => {
          if (err instanceof AbClientError) {
            this.error.set(err.message);
          } else {
            this.error.set(
              (err as { error?: { responseMessage?: string } })?.error?.responseMessage ??
                'Health check failed.',
            );
          }
        },
      });

    queueMicrotask(() => this.reload$.next());
  }

  refresh(): void {
    this.reload$.next();
  }
}
