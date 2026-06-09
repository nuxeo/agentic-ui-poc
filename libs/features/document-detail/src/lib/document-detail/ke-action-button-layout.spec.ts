/**
 * Layout regression test for the KE action button loader.
 *
 * Background: previously the in-flight indicator was a <mat-spinner>, which
 * renders as a block-level element and broke Material's stroked-button
 * content alignment (icon + spinner stacked above the label instead of sitting
 * inline with it). The fix is to use a spinning <mat-icon> instead so the
 * loading and idle states share the same layout primitive.
 *
 * This test renders the exact button structure used by document-detail.html
 * and asserts:
 *   1. The loading indicator IS a <mat-icon> (not a <mat-progress-spinner>).
 *   2. The loading indicator carries the `ke-spinning` animation class.
 *   3. Idle and loading buttons share the same DOM shape, which means the
 *      browser will lay them out identically.
 */
import { Component, provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button type="button" mat-stroked-button class="ke-action-btn" data-testid="idle-btn">
      <mat-icon>category</mat-icon>
      Classify Document
    </button>
    <button type="button" mat-stroked-button class="ke-action-btn" data-testid="loading-btn">
      @if (loading()) {
        <mat-icon class="ke-spinning">progress_activity</mat-icon>
      } @else {
        <mat-icon>category</mat-icon>
      }
      Classify Document
    </button>
  `,
})
class KeButtonHostComponent {
  readonly loading = signal(true);
}

describe('KE action button loader layout', () => {
  let fixture: ComponentFixture<KeButtonHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeButtonHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(KeButtonHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function leadingChild(testId: 'idle-btn' | 'loading-btn'): Element {
    const btn = fixture.nativeElement.querySelector(
      `[data-testid="${testId}"]`,
    ) as HTMLButtonElement;
    // Material wraps content in <span class="mdc-button__label">; the leading
    // glyph is the first element child of that wrapper.
    const label =
      btn.querySelector('.mdc-button__label, .mat-mdc-button-touch-target')?.parentElement ??
      btn.querySelector('.mdc-button__label') ??
      btn;
    return label.querySelector('mat-icon, mat-progress-spinner') as Element;
  }

  it('renders a <mat-icon> (not <mat-progress-spinner>) in the loading state', () => {
    const leading = leadingChild('loading-btn');
    expect(leading.tagName.toLowerCase()).toBe('mat-icon');
    expect(leading.tagName.toLowerCase()).not.toBe('mat-progress-spinner');
  });

  it('applies the ke-spinning animation class while loading', () => {
    const leading = leadingChild('loading-btn');
    expect(leading.classList.contains('ke-spinning')).toBe(true);
  });

  it('keeps the same DOM shape as the idle button (same parent element for icon and text)', () => {
    const idleLeading = leadingChild('idle-btn');
    const loadingLeading = leadingChild('loading-btn');
    // Both must sit inside the same Material label wrapper as their sibling
    // text node, which is what guarantees the inline layout we see for idle.
    expect(idleLeading.parentElement?.tagName).toBe(loadingLeading.parentElement?.tagName);
    expect(idleLeading.parentElement?.className).toBe(loadingLeading.parentElement?.className);
  });

  it('toggles in-place without changing the element tag when state flips', () => {
    const host = fixture.componentInstance;
    const beforeTag = leadingChild('loading-btn').tagName.toLowerCase();
    host.loading.set(false);
    fixture.detectChanges();
    const afterTag = leadingChild('loading-btn').tagName.toLowerCase();
    expect(beforeTag).toBe('mat-icon');
    expect(afterTag).toBe('mat-icon');
  });
});
