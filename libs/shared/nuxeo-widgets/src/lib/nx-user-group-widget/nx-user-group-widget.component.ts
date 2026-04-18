import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '@agentic-ui/shared/nuxeo-client';
import { NxWidgetBase } from '../base/nx-widget-base';

interface UserSuggestion {
  id: string;
  displayLabel: string;
  type: 'user' | 'group';
}

/**
 * User and group suggestion widget with typeahead search.
 */
@Component({
  selector: 'nx-user-group-widget',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
  ],
  template: `
    @if (isEditable()) {
      @if (multiple()) {
        <mat-form-field appearance="outline" class="nx-widget-full">
          <mat-label>{{ label() }}</mat-label>
          <mat-chip-grid #chipGrid>
            @for (user of arrayValue(); track user) {
              <mat-chip-row (removed)="removeValue(user)">
                {{ user }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip-row>
            }
          </mat-chip-grid>
          <input
            matInput
            [matChipInputFor]="chipGrid"
            [matAutocomplete]="auto"
            [placeholder]="placeholder() || 'Search users/groups...'"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchInput($event)"
          />
          <mat-autocomplete
            #auto="matAutocomplete"
            (optionSelected)="addValue($event.option.value)"
          >
            @for (s of suggestions(); track s.id) {
              <mat-option [value]="s.id">
                <mat-icon>{{ s.type === 'group' ? 'group' : 'person' }}</mat-icon>
                {{ s.displayLabel }}
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>
      } @else {
        <mat-form-field appearance="outline" class="nx-widget-full">
          <mat-label>{{ label() }}</mat-label>
          <input
            matInput
            [matAutocomplete]="autoSingle"
            [value]="singleValue()"
            [placeholder]="placeholder() || 'Search users/groups...'"
            [required]="required()"
            [disabled]="disabled()"
            (input)="onSearchInput(asInput($event).value)"
          />
          <mat-autocomplete
            #autoSingle="matAutocomplete"
            (optionSelected)="emitChange($event.option.value)"
          >
            @for (s of suggestions(); track s.id) {
              <mat-option [value]="s.id">
                <mat-icon>{{ s.type === 'group' ? 'group' : 'person' }}</mat-icon>
                {{ s.displayLabel }}
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>
      }
    } @else {
      <div class="nx-widget-view">
        <span class="nx-widget-label">{{ label() }}</span>
        @if (multiple()) {
          <span class="nx-widget-value">{{ arrayValue().join(', ') || '—' }}</span>
        } @else {
          <span class="nx-widget-value">{{ singleValue() || '—' }}</span>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .nx-widget-full {
        width: 100%;
      }
      .nx-widget-view {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px 0;
      }
      .nx-widget-label {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant, #666);
      }
      .nx-widget-value {
        font-size: 14px;
      }
    `,
  ],
})
export class NxUserGroupWidgetComponent extends NxWidgetBase implements OnInit {
  private readonly userService = inject(UserService);
  private readonly searchSubject = new Subject<string>();

  readonly suggestions = signal<UserSuggestion[]>([]);
  readonly searchTerm = signal('');

  readonly singleValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined ? String(v) : '';
  });

  readonly arrayValue = computed(() => {
    const v = this.value();
    if (Array.isArray(v)) return v.map(String);
    return v !== null && v !== undefined ? [String(v)] : [];
  });

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((term) => {
          if (!term || term.length < 2) return of([]);
          return this.userService.searchUsers(term);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((users) => {
        this.suggestions.set(
          (
            users as { id: string; displayLabel?: string; properties?: Record<string, unknown> }[]
          ).map((u) => ({
            id: u.id,
            displayLabel: (u.properties?.['firstName']
              ? `${u.properties['firstName']} ${u.properties['lastName']}`
              : u.id) as string,
            type: 'user' as const,
          })),
        );
      });
  }

  onSearchInput(term: string): void {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  addValue(userId: string): void {
    const current = this.arrayValue();
    if (!current.includes(userId)) {
      this.emitChange([...current, userId]);
    }
    this.searchTerm.set('');
  }

  removeValue(userId: string): void {
    this.emitChange(this.arrayValue().filter((id) => id !== userId));
  }

  asInput(event: Event): HTMLInputElement {
    return event.target as HTMLInputElement;
  }
}
