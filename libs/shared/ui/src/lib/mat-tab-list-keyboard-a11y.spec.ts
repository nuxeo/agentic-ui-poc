import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import {
  MAT_TAB_LIST_KEYDOWN_ATTR,
  wireMatTabListKeyboardA11y,
} from './mat-tab-list-keyboard-a11y';
import { MatTabListKeydownDirective } from './mat-tab-list-keydown.directive';

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

function materialTabHeaderMarkup(): HTMLElement {
  const root = document.createElement('mat-tab-group');
  root.innerHTML = `
    <div class="mat-mdc-tab-label-container">
      <div class="mat-mdc-tab-list" role="tablist">
        <div class="mat-mdc-tab-labels">
          <button type="button" role="tab">View</button>
          <button type="button" role="tab">History</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  return root;
}

@Component({
  standalone: true,
  imports: [MatTabsModule, MatTabListKeydownDirective],
  template: `
    <mat-tab-group libMatTabListKeydown>
      <mat-tab label="View">View body</mat-tab>
      <mat-tab label="History">History body</mat-tab>
    </mat-tab-group>
  `,
})
class MatTabGroupKeyboardHostComponent {}

describe('wireMatTabListKeyboardA11y', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('marks the tablist and removes the marker on cleanup', () => {
    const root = materialTabHeaderMarkup();
    const tabList = root.querySelector<HTMLElement>('.mat-mdc-tab-list')!;

    const cleanup = wireMatTabListKeyboardA11y(root);
    expect(cleanup).not.toBeNull();
    expect(tabList.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR)).toBe('true');

    cleanup!();
    expect(tabList.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR)).toBeNull();
  });

  it('focuses the first tab when keydown targets the tablist itself', () => {
    const root = materialTabHeaderMarkup();
    const tabList = root.querySelector<HTMLElement>('.mat-mdc-tab-list')!;
    const firstTab = root.querySelector<HTMLElement>('[role="tab"]')!;

    wireMatTabListKeyboardA11y(root);
    tabList.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(firstTab);
  });

  it('returns null when the tablist is missing', () => {
    const root = document.createElement('mat-tab-group');
    document.body.appendChild(root);
    expect(wireMatTabListKeyboardA11y(root)).toBeNull();
  });
});

describe('MatTabListKeydownDirective on Material tab group', () => {
  let fixture: ComponentFixture<MatTabGroupKeyboardHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTabGroupKeyboardHostComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatTabGroupKeyboardHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('preserves Material ArrowRight navigation when keydown originates on a tab', () => {
    const host = fixture.nativeElement as HTMLElement;
    const tabList = host.querySelector<HTMLElement>('.mat-mdc-tab-list[role="tablist"]')!;
    const tabs = host.querySelectorAll<HTMLElement>('[role="tab"]');
    expect(tabs.length).toBeGreaterThanOrEqual(2);

    expect(tabList.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR)).toBe('true');

    const tabGroup = fixture.debugElement.query(By.directive(MatTabGroup))
      .componentInstance as MatTabGroup;

    tabs[1]!.click();
    fixture.detectChanges();
    expect(tabGroup.selectedIndex).toBe(1);

    tabs[0]!.focus();
    expect(document.activeElement).toBe(tabs[0]);

    const firstTabFocusSpy = vi.spyOn(tabs[0]!, 'focus');
    firstTabFocusSpy.mockClear();

    tabs[0]!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(firstTabFocusSpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(tabs[0]);

    tabList.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(tabs[0]);
  });
});
