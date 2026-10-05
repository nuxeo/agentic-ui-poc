import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { beforeEach, describe, expect, it } from 'vitest';

import { HxpBrowseTrashComponent } from './hxp-browse-trash.component';

/**
 * The Trash tab's body. The state worth pinning is the failure: a trash that could not be read
 * used to render "Trash is empty", which tells the user their deleted documents are gone.
 */
describe('HxpBrowseTrashComponent', () => {
  let fixture: ComponentFixture<HxpBrowseTrashComponent>;

  const trashed: Document = {
    sys_id: 'gone-1',
    sys_title: 'Invoice',
    sys_primaryType: 'File',
    sys_modified: '2026-09-23T10:00:00.000Z',
  };

  const text = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HxpBrowseTrashComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HxpBrowseTrashComponent);
  });

  it('reports a failed load as a failure with a retry, not as an empty trash', async () => {
    fixture.componentRef.setInput('error', true);
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);
    fixture.detectChanges();
    await fixture.whenStable();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('hxp.hxp-browse-trash.failed-to-load');
    expect(text()).not.toContain('hxp.hxp-browse-trash.trash-is-empty');

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();
    expect(retries).toBe(1);
  });

  it('shows the empty state only when the load succeeded with nothing in it', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text()).toContain('hxp.hxp-browse-trash.trash-is-empty');
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')).toBeNull();
  });

  it('lists trashed documents with a restore action', async () => {
    fixture.componentRef.setInput('documents', [trashed]);
    let restored: Document | undefined;
    fixture.componentInstance.restore.subscribe((doc) => (restored = doc));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text()).toContain('Invoice');
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.hxp-trash__restore')
      ?.click();
    expect(restored?.sys_id).toBe('gone-1');
  });

  it('shows the spinner rather than the empty state while loading', async () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('hxp-spinner')).not.toBeNull();
    expect(text()).not.toContain('hxp.hxp-browse-trash.trash-is-empty');
  });
});
