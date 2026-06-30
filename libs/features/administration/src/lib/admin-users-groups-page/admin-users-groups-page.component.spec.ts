import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { UserService } from '@agentic-ui/shared/nuxeo-client';

import { AdminUsersGroupsPageComponent } from './admin-users-groups-page.component';

describe('AdminUsersGroupsPageComponent (NXSAT-166)', () => {
  let fixture: ComponentFixture<AdminUsersGroupsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersGroupsPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            searchUsersPaged: vi
              .fn()
              .mockReturnValue(of({ 'entity-type': 'users', entries: [], totalSize: 0 })),
            searchGroupsPaged: vi
              .fn()
              .mockReturnValue(of({ 'entity-type': 'groups', entries: [], totalSize: 0 })),
          },
        },
        {
          provide: MatDialog,
          useValue: { open: vi.fn() },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersGroupsPageComponent);
    fixture.detectChanges();
  });

  it('does not render a redundant header search button (NXSAT-166)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.ug-page__header button[aria-label="Search"]')).toBeNull();
    expect(el.querySelectorAll('.ug-toolbar button[aria-label="Run search"]').length).toBe(1);
  });
});
