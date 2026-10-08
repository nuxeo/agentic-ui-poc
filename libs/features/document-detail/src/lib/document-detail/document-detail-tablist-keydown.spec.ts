/**
 * NXENG-821 — document-detail applies `libMatTabListKeydown` on its main tab group.
 * Renders the same host attribute the production template uses and asserts the IBM
 * marker lands on Material's `role="tablist"` node after `afterNextRender`.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { MAT_TAB_LIST_KEYDOWN_ATTR, MatTabListKeydownDirective } from '@nuxeo-satori/platform/ui';

(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver ??= class {
  observe(): void {
    /* no-op */
  }
  unobserve(): void {
    /* no-op */
  }
  disconnect(): void {
    /* no-op */
  }
};

@Component({
  standalone: true,
  imports: [MatTabsModule, MatTabListKeydownDirective],
  template: `
    <mat-tab-group libMatTabListKeydown class="detail-tabs">
      <mat-tab label="View">View body</mat-tab>
      <mat-tab label="History">History body</mat-tab>
    </mat-tab-group>
  `,
})
class DocumentDetailTablistHostComponent {}

describe('DocumentDetailComponent — tablist keydown marker (NXENG-821)', () => {
  let fixture: ComponentFixture<DocumentDetailTablistHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDetailTablistHostComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetailTablistHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('sets data-satori-tablist-keydown on the generated tablist', () => {
    const tabList = fixture.nativeElement.querySelector<HTMLElement>(
      '.mat-mdc-tab-list[role="tablist"]',
    );
    expect(tabList).toBeTruthy();
    expect(tabList!.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR)).toBe('true');
  });
});
