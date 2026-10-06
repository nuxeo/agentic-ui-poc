import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ExtensionComponentRegistry } from './extension-component-registry.service';
import { ExtensionOutletComponent } from './extension-outlet.component';
import { testTranslateModule } from '@agentic-ui/testing/i18n';

@Component({ standalone: true, template: '<p class="panel">registered panel</p>' })
class RegisteredPanelComponent {}

let viewInstances = 0;

@Component({
  standalone: true,
  template: '<p class="view">{{ title() }}</p>',
})
class DocumentViewComponent {
  readonly title = input('');
  constructor() {
    viewInstances += 1;
  }
}

/**
 * Drive one resolve-and-render cycle.
 *
 * Three phases, and all three are needed: `detectChanges()` runs the effect, which
 * *starts* the dynamic import; the macrotask lets that promise settle; the second
 * `detectChanges()` renders what it produced. `whenStable()` alone was not enough —
 * the load is a plain promise the fixture does not track.
 */
async function settle(fixture: { detectChanges: () => void }) {
  fixture.detectChanges();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

/**
 * The outlet is how a manifest turns an ID into rendered UI, so the cases worth
 * pinning are the ones where the ID resolves to nothing useful.
 */
describe('ExtensionOutletComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [testTranslateModule(), ExtensionOutletComponent] });
  });

  it('renders a component registered under an ID', async () => {
    TestBed.inject(ExtensionComponentRegistry).register({
      'acme.panel.reports': () => Promise.resolve(RegisteredPanelComponent),
    });

    const fixture = TestBed.createComponent(ExtensionOutletComponent);
    fixture.componentRef.setInput('componentId', 'acme.panel.reports');
    await settle(fixture);

    expect(fixture.nativeElement.querySelector('.panel')).toBeTruthy();
    expect(fixture.componentInstance.unresolved()).toBe(false);
  });

  it('survives componentInputs being undefined, as router input binding makes it', async () => {
    // The regression this pins. `withComponentInputBinding()` sets *every* declared
    // input from route data, passing `undefined` for keys the route omits — which
    // overrides the `{}` default on the input. Routing straight to the outlet with
    // `data: { componentId: '...' }` therefore made `componentInputs()` `undefined`,
    // and `Object.entries(undefined)` threw inside `render()`, blanking the route.
    //
    // Watched fail on purpose: with the `?? {}` removed this throws
    // "Cannot convert undefined or null to object" and the panel never renders.
    TestBed.inject(ExtensionComponentRegistry).register({
      'acme.panel.reports': () => Promise.resolve(RegisteredPanelComponent),
    });

    const fixture = TestBed.createComponent(ExtensionOutletComponent);
    fixture.componentRef.setInput('componentId', 'acme.panel.reports');
    fixture.componentRef.setInput('componentInputs', undefined);
    await settle(fixture);

    expect(fixture.nativeElement.querySelector('.panel')).toBeTruthy();
  });

  it('reports unresolved rather than throwing for an unknown ID', async () => {
    // A manifest may name a component a newer build provides. That has to leave the
    // host able to render a fallback, not take the application down.
    const fixture = TestBed.createComponent(ExtensionOutletComponent);
    fixture.componentRef.setInput('componentId', 'acme.panel.doesNotExist');
    await settle(fixture);

    expect(fixture.componentInstance.unresolved()).toBe(true);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  describe('inputs', () => {
    beforeEach(() => {
      viewInstances = 0;
      TestBed.inject(ExtensionComponentRegistry).register({
        'acme.views.claim': DocumentViewComponent,
      });
    });

    /**
     * A host may offer an input not every component declares — `documentView` always
     * offers `document`. Angular's `setInput` does not throw on an undeclared name: in a
     * development build it logs NG0303, so a `try/catch` around it never fired.
     */
    it('sets the inputs a component declares and skips the rest without logging', async () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const fixture = TestBed.createComponent(ExtensionOutletComponent);
      fixture.componentRef.setInput('componentId', 'acme.views.claim');
      fixture.componentRef.setInput('componentInputs', {
        title: 'Claim 42',
        document: { uid: 'x' },
      });
      await settle(fixture);

      expect(fixture.nativeElement.querySelector('.view')?.textContent).toBe('Claim 42');
      expect(errors).not.toHaveBeenCalled();
      errors.mockRestore();
    });

    /**
     * The focused document is a new object on every refetch. Recreating the component for
     * each one would throw away whatever state the rendered view holds.
     */
    it('updates the live component when only its inputs change', async () => {
      const fixture = TestBed.createComponent(ExtensionOutletComponent);
      fixture.componentRef.setInput('componentId', 'acme.views.claim');
      fixture.componentRef.setInput('componentInputs', { title: 'first' });
      await settle(fixture);

      fixture.componentRef.setInput('componentInputs', { title: 'second' });
      await settle(fixture);

      expect(fixture.nativeElement.querySelector('.view')?.textContent).toBe('second');
      expect(viewInstances).toBe(1);
    });

    it('recreates the component when the id changes', async () => {
      TestBed.inject(ExtensionComponentRegistry).register({
        'acme.views.case': DocumentViewComponent,
      });
      const fixture = TestBed.createComponent(ExtensionOutletComponent);
      fixture.componentRef.setInput('componentId', 'acme.views.claim');
      fixture.componentRef.setInput('componentInputs', { title: 'kept' });
      await settle(fixture);

      fixture.componentRef.setInput('componentId', 'acme.views.case');
      await settle(fixture);

      expect(viewInstances).toBe(2);
      expect(fixture.nativeElement.querySelectorAll('.view')).toHaveLength(1);
      expect(fixture.nativeElement.querySelector('.view')?.textContent).toBe('kept');
    });

    /**
     * Two descriptors can share a component and differ in inputs. Updating in place would
     * leave a key the second one omits at the first one's value, so a changed key set
     * recreates instead.
     */
    it('does not keep the value of an input the new inputs omit', async () => {
      const fixture = TestBed.createComponent(ExtensionOutletComponent);
      fixture.componentRef.setInput('componentId', 'acme.views.claim');
      fixture.componentRef.setInput('componentInputs', { title: 'Claim summary' });
      await settle(fixture);

      fixture.componentRef.setInput('componentInputs', { document: { uid: 'y' } });
      await settle(fixture);

      expect(fixture.nativeElement.querySelector('.view')?.textContent).toBe('');
    });

    /**
     * Switching to a component that is still loading must not leave the previous one on
     * screen: it would be interactive, and the in-place input path would hand it the new
     * document.
     */
    it('removes the previous component while the next one loads', async () => {
      let finishLoad: (type: typeof RegisteredPanelComponent) => void = () => undefined;
      TestBed.inject(ExtensionComponentRegistry).register({
        'acme.views.slow': () =>
          new Promise<typeof RegisteredPanelComponent>((resolve) => (finishLoad = resolve)),
      });
      const fixture = TestBed.createComponent(ExtensionOutletComponent);
      fixture.componentRef.setInput('componentId', 'acme.views.claim');
      fixture.componentRef.setInput('componentInputs', { title: 'Claim 42' });
      await settle(fixture);

      fixture.componentRef.setInput('componentId', 'acme.views.slow');
      await settle(fixture);

      expect(fixture.componentInstance.loading()).toBe(true);
      expect(fixture.nativeElement.querySelector('.view')).toBeNull();

      finishLoad(RegisteredPanelComponent);
      await settle(fixture);

      expect(fixture.nativeElement.querySelector('.panel')).toBeTruthy();
    });
  });
});
