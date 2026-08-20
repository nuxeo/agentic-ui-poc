import { Component, output, type Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  provideAgentFormComponents,
  type AgentFormDefinition,
  type AgentFormProps,
  type AgentFormRequest,
  type AgentFormSubmission,
} from '@agentic-ui/shared/agent-client';
import { documentMetadataForm } from '@agentic-ui/shared/ui/agent-forms';

import { AgentFormHostComponent } from './agent-form-host.component';

const UID = 'aaaaaaaa-1111-2222-3333-444444444444';

function formProps(overrides: Partial<AgentFormProps> = {}): AgentFormProps {
  return {
    toolCallId: 'call-1',
    target: { uid: UID, title: 'Q3 revenue review' },
    title: 'Edit metadata',
    submitLabel: 'Save changes',
    fields: [
      {
        name: 'dc:title',
        label: 'Title',
        type: 'text',
        editable: true,
        value: 'A stored title',
        source: 'current',
      },
    ],
    ...overrides,
  };
}

function request(name = 'documentMetadataForm'): AgentFormRequest {
  return { name, props: formProps() };
}

/**
 * The host that mounts a submitting component in the transcript.
 *
 * The properties under test are the ones that differ from the widget host, which
 * is why this is a sibling rather than a reuse: a form has outputs whose
 * emissions answer a gated write, so what matters is *when* they are wired and
 * what happens when they cannot be.
 *
 * The governing rule for every failure case: **a form that cannot be mounted
 * reports `unavailable` and emits neither answer.** Not a submission, which would
 * write something nobody saw; not a cancellation, which would refuse something
 * the user may have wanted. The panel then draws the approval card, so the
 * decision stays answerable.
 */
describe('AgentFormHostComponent', () => {
  let fixture: ComponentFixture<AgentFormHostComponent>;
  let submissions: AgentFormSubmission[];
  let cancellations: number;
  let unavailable: number;

  /**
   * Applies a request and waits for the lazy chunk, the way a real mount happens.
   * The dynamic `import()` is not stubbed, so this settles the effect, then the
   * download, then renders.
   */
  async function show(next: AgentFormRequest): Promise<void> {
    fixture.componentRef.setInput('request', next);
    fixture.detectChanges();
    for (let turn = 0; turn < 50 && fixture.componentInstance.loading(); turn += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      fixture.detectChanges();
    }
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function mountedForm(): HTMLElement | null {
    return host().querySelector('lib-document-metadata-form');
  }

  function create(providers: unknown[] = provideAgentFormComponents(documentMetadataForm)): void {
    TestBed.configureTestingModule({
      imports: [AgentFormHostComponent],
      providers: providers as never[],
    });
    fixture = TestBed.createComponent(AgentFormHostComponent);
    submissions = [];
    cancellations = 0;
    unavailable = 0;
    fixture.componentInstance.submitted.subscribe((value) => submissions.push(value));
    fixture.componentInstance.cancelled.subscribe(() => (cancellations += 1));
    fixture.componentInstance.unavailable.subscribe(() => (unavailable += 1));
  }

  it('mounts the registered component and shows the declared prose', async () => {
    create();

    await show(request());

    expect(mountedForm()).toBeTruthy();
    expect(host().textContent).toContain('Edit metadata');
    expect(host().textContent).toContain('Save changes');
    expect(unavailable).toBe(0);
  });

  it('reports the values the mounted component emitted', async () => {
    create();
    await show(request());

    const control = host().querySelector('input') as HTMLInputElement;
    control.value = 'A title the user typed';
    control.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (host().querySelector('.metadata-form__submit') as HTMLButtonElement).click();

    expect(submissions).toEqual([{ 'dc:title': 'A title the user typed' }]);
  });

  it('reports a cancellation from the mounted component', async () => {
    create();
    await show(request());

    (host().querySelector('.metadata-form__cancel') as HTMLButtonElement).click();

    expect(cancellations).toBe(1);
    expect(submissions).toEqual([]);
  });

  describe('when the form cannot be mounted', () => {
    it('reports unavailable for a component this application does not register', async () => {
      // Unreachable while the host and the runtime resolve the same catalogue —
      // the runtime already refused the name. Handled anyway: an allowlist with
      // an unhandled miss is not one.
      create();

      await show(request('documentDeleteForm'));

      expect(unavailable).toBe(1);
      expect(mountedForm()).toBeNull();
      expect(submissions).toEqual([]);
      expect(cancellations).toBe(0);
    });

    it('reports unavailable when the chunk fails to download', async () => {
      const failing: AgentFormDefinition = {
        name: 'documentMetadataForm',
        load: () => Promise.reject(new Error('offline')),
        inputs: () => ({}),
        outputs: { submitted: 'submitted', cancelled: 'cancelled' },
      };
      create(provideAgentFormComponents(failing));

      await show(request());

      expect(unavailable).toBe(1);
      expect(submissions).toEqual([]);
      expect(cancellations).toBe(0);
    });

    it('destroys a component whose inputs could not be applied', async () => {
      // `setInput` throws for an input the component does not declare. A
      // half-populated form is worse than none: it would submit values against a
      // field set the user was never shown.
      const wrongInputs: AgentFormDefinition = {
        ...documentMetadataForm,
        inputs: () => ({ notAnInput: true }),
      };
      create(provideAgentFormComponents(wrongInputs));

      await show(request());

      expect(unavailable).toBe(1);
      expect(mountedForm()).toBeNull();
    });

    it('wires nothing when a declared output is not an output', async () => {
      @Component({ selector: 'app-not-a-form', standalone: true, template: '' })
      class NotAFormComponent {
        readonly submitted = 'a string, not an OutputRef';
        readonly cancelled = output<void>();
      }
      const misdeclared: AgentFormDefinition = {
        name: 'documentMetadataForm',
        load: () => Promise.resolve(NotAFormComponent as Type<unknown>),
        inputs: () => ({}),
        outputs: { submitted: 'submitted', cancelled: 'cancelled' },
      };
      create(provideAgentFormComponents(misdeclared));

      await show(request());

      // Calling whatever was found there is the alternative, and it is worse.
      expect(unavailable).toBe(1);
      expect(mountedForm()).toBeNull();
    });
  });

  describe('teardown', () => {
    it('stops reporting from a component it has replaced', async () => {
      create();
      await show(request());
      const first = host().querySelector('.metadata-form__cancel') as HTMLButtonElement;

      await show({ name: 'documentMetadataForm', props: formProps({ toolCallId: 'call-2' }) });
      first.click();

      // The transcript re-renders constantly. A subscription outliving its
      // component would answer an interrupt from a form no longer on screen.
      expect(cancellations).toBe(0);
    });

    it('leaves nothing mounted when destroyed', async () => {
      create();
      await show(request());

      fixture.destroy();

      expect(mountedForm()).toBeNull();
    });

    it('does not report from a destroyed component', async () => {
      create();
      await show(request());
      const cancel = host().querySelector('.metadata-form__cancel') as HTMLButtonElement;

      fixture.componentInstance.ngOnDestroy();
      cancel.click();

      expect(cancellations).toBe(0);
      expect(submissions).toEqual([]);
    });
  });
});
