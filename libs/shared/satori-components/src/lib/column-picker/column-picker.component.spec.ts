import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxsColumnPickerComponent, type NxsPickableColumn } from './column-picker.component';

const COLUMNS: readonly NxsPickableColumn[] = [
  { key: 'title', label: 'Title', visible: true },
  { key: 'modified', label: 'Modified', visible: true },
  { key: 'author', label: 'Author', visible: false },
  { key: 'state', label: 'State', visible: false },
];

@Component({
  standalone: true,
  imports: [NxsColumnPickerComponent],
  template: `
    <button type="button" class="opener" (click)="open.set(true)">Manage columns</button>
    @if (open()) {
      <nxs-column-picker
        [columns]="columns()"
        [required]="required()"
        [defaults]="defaults()"
        (apply)="applied.push($event); open.set(false)"
        (dismiss)="dismissed = dismissed + 1; open.set(false)"
      />
    }
  `,
})
class HostComponent {
  readonly open = signal(true);
  readonly columns = signal<readonly NxsPickableColumn[]>(COLUMNS);
  readonly required = signal<readonly string[]>(['title']);
  readonly defaults = signal<readonly string[]>(['title', 'modified']);
  readonly applied: (readonly string[])[] = [];
  dismissed = 0;
}

describe('NxsColumnPickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const panel = (): HTMLElement | null => el().querySelector('[role="dialog"]');
  const checkbox = (label: string): HTMLInputElement => {
    const option = [...el().querySelectorAll('mat-checkbox')].find(
      (node) => node.textContent?.trim() === label,
    );
    const input = option?.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    if (!input) throw new Error(`no checkbox labelled ${label}`);
    return input;
  };
  const button = (text: string): HTMLButtonElement => {
    const match = [...el().querySelectorAll('button')].find(
      (node) => node.textContent?.trim() === text,
    );
    if (!match) throw new Error(`no button reading ${text}`);
    return match as HTMLButtonElement;
  };

  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await render();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    await render();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('is a modal dialog named by its translated title', () => {
    expect(panel()?.getAttribute('aria-modal')).toBe('true');
    expect(panel()?.getAttribute('aria-label')).toBe('Column Settings');
    expect(el().querySelector('.nxs-column-picker__title')?.textContent?.trim()).toBe(
      'Column Settings',
    );
  });

  it('names the backdrop, so the way out is announced', () => {
    expect(el().querySelector('.nxs-column-picker__backdrop')?.getAttribute('aria-label')).toBe(
      'Close column picker',
    );
  });

  it('takes focus when it opens', () => {
    expect(document.activeElement).toBe(panel());
  });

  it('offers every column, checked as it is shown now', () => {
    expect(checkbox('Title').checked).toBe(true);
    expect(checkbox('Modified').checked).toBe(true);
    expect(checkbox('Author').checked).toBe(false);
    expect(checkbox('State').checked).toBe(false);
  });

  it('will not let a required column be switched off', async () => {
    expect(checkbox('Title').disabled).toBe(true);
    await click(button('Done'));
    expect(host.applied.at(-1)).toContain('title');
  });

  it('keeps a required column even when the host passes it hidden', async () => {
    host.columns.set(COLUMNS.map((c) => (c.key === 'title' ? { ...c, visible: false } : c)));
    await render();
    expect(checkbox('Title').checked).toBe(true);
    await click(button('Done'));
    expect(host.applied.at(-1)).toEqual(['title', 'modified']);
  });

  it('emits the chosen keys in the columns’ order, not click order', async () => {
    await click(checkbox('State'));
    await click(checkbox('Author'));
    await click(button('Done'));
    expect(host.applied).toEqual([['title', 'modified', 'author', 'state']]);
  });

  it('removes a column the user unticks', async () => {
    await click(checkbox('Modified'));
    await click(button('Done'));
    expect(host.applied).toEqual([['title']]);
  });

  it('resets to the host’s defaults, not to what was shown', async () => {
    host.defaults.set(['title', 'state']);
    await render();
    await click(button('Reset'));
    expect(checkbox('Modified').checked).toBe(false);
    expect(checkbox('State').checked).toBe(true);
    await click(button('Done'));
    expect(host.applied).toEqual([['title', 'state']]);
  });

  it('discards pending changes on Escape and emits dismiss, not apply', async () => {
    await click(checkbox('Author'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await render();
    expect(host.dismissed).toBe(1);
    expect(host.applied).toEqual([]);
    expect(panel()).toBeNull();
  });

  it('discards pending changes on a backdrop click', async () => {
    await click(checkbox('Author'));
    await click(el().querySelector('.nxs-column-picker__backdrop') as HTMLElement);
    expect(host.dismissed).toBe(1);
    expect(host.applied).toEqual([]);
  });

  it('opens fresh from the host’s state after a discarded edit', async () => {
    await click(checkbox('Author'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await render();
    host.open.set(true);
    await render();
    expect(checkbox('Author').checked).toBe(false);
  });

  it('hands focus back to the control that opened it', async () => {
    host.open.set(false);
    await render();
    const opener = el().querySelector('.opener') as HTMLButtonElement;
    opener.focus();
    host.open.set(true);
    await render();
    expect(document.activeElement).toBe(panel());
    await click(button('Done'));
    expect(document.activeElement).toBe(opener);
  });

  it('does not try to refocus an opener that has left the page', async () => {
    host.open.set(false);
    await render();
    const opener = el().querySelector('.opener') as HTMLButtonElement;
    opener.focus();
    host.open.set(true);
    await render();
    opener.remove();
    const focus = vi.spyOn(opener, 'focus');
    await click(button('Done'));
    expect(focus).not.toHaveBeenCalled();
  });

  it('renders an empty list, and still applies, when there are no columns', async () => {
    host.columns.set([]);
    host.required.set([]);
    await render();
    expect(el().querySelectorAll('mat-checkbox').length).toBe(0);
    await click(button('Done'));
    expect(host.applied).toEqual([[]]);
  });

  it('ignores a toggle on a required column', async () => {
    const picker = fixture.debugElement.children
      .map((child) => child.componentInstance)
      .find((instance) => instance instanceof NxsColumnPickerComponent) as unknown as {
      toggle(key: string): void;
    };
    picker.toggle('title');
    await render();
    await click(button('Done'));
    expect(host.applied).toEqual([['title', 'modified']]);
  });
});
