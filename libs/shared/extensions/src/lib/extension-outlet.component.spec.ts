import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ExtensionComponentRegistry } from './extension-component-registry.service';
import { ExtensionOutletComponent } from './extension-outlet.component';

@Component({ standalone: true, template: '<p class="panel">registered panel</p>' })
class RegisteredPanelComponent {}

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
    TestBed.configureTestingModule({ imports: [ExtensionOutletComponent] });
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
});
