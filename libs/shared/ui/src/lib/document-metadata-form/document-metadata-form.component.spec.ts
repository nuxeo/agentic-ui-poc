import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AgentFormField, AgentFormSubmission } from '@agentic-ui/shared/agent-client';

import { DocumentMetadataFormComponent } from './document-metadata-form.component';

/**
 * The chat-rendered metadata form.
 *
 * The properties under test are the ones that make it safe to mount somewhere the
 * agent chose. The first is the one worth stating plainly: **it writes nothing.**
 * It injects no domain service — there is no `BrowseService` and no
 * `DocumentService` in the constructor — so a write is not something it fails to
 * do, it is something it has no way to do. That is the difference between this
 * and lifting `EditMetadataDialogComponent`, which calls
 * `browseService.updateDocument()` from its own submit handler.
 *
 * The rest: it submits only what the user could actually change, it renders an
 * unresolved target as the bare uid, and it marks a value the model authored as
 * one.
 */

const UID = 'aaaaaaaa-1111-2222-3333-444444444444';

function field(overrides: Partial<AgentFormField> = {}): AgentFormField {
  return {
    name: 'dc:title',
    label: 'Title',
    type: 'text',
    editable: true,
    value: 'A stored title',
    source: 'current',
    ...overrides,
  };
}

describe('DocumentMetadataFormComponent', () => {
  let fixture: ComponentFixture<DocumentMetadataFormComponent>;
  let submissions: AgentFormSubmission[];
  let cancellations: number;

  function render(fields: readonly AgentFormField[], target = { uid: UID, title: 'Q3 review' }) {
    fixture = TestBed.createComponent(DocumentMetadataFormComponent);
    fixture.componentRef.setInput('target', target);
    fixture.componentRef.setInput('title', 'Edit metadata');
    fixture.componentRef.setInput('submitLabel', 'Save changes');
    fixture.componentRef.setInput('fields', fields);
    submissions = [];
    cancellations = 0;
    fixture.componentInstance.submitted.subscribe((value) => submissions.push(value));
    fixture.componentInstance.cancelled.subscribe(() => (cancellations += 1));
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function text(): string {
    return fixture.nativeElement.textContent as string;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DocumentMetadataFormComponent] });
  });

  it('reaches no service that could perform the write itself', () => {
    // The whole design in one assertion. The component emits; the panel answers
    // the interrupt; the gateway writes, behind the gate it was already behind.
    const source = DocumentMetadataFormComponent.toString();

    expect(source).not.toMatch(/updateDocument|BrowseService|DocumentService|HttpClient/);
  });

  describe('the target', () => {
    it('shows the resolved title and keeps the uid beside it', () => {
      // The title is a lookup; the uid is what the write actually carries.
      render([field()], { uid: UID, title: 'Q3 revenue review' });

      expect(text()).toContain('Q3 revenue review');
      expect(text()).toContain(UID);
    });

    it('renders an unresolved target as the bare uid and nothing else', () => {
      // ADR 001: `title` is present only when Nuxeo answered for this caller, so
      // its absence means unresolved. A wrong name on the affordance authorising
      // a write is worse than an unfriendly one.
      render([field()], { uid: UID });

      expect(fixture.componentInstance.targetLabel()).toBe(UID);
      expect(fixture.componentInstance.targetResolved()).toBe(false);
    });
  });

  describe('what a submission carries', () => {
    it('submits the editable fields', () => {
      const form = render([field({ name: 'dc:title', value: 'Old' })]);

      form.edit('dc:title', 'New title');
      form.submit();

      expect(submissions).toEqual([{ 'dc:title': 'New title' }]);
    });

    it('submits an untouched editable field as the value it displayed', () => {
      // Different from omitting it: the gateway keeps what the interrupt held for
      // an unsubmitted field, which is the same value — but the user saw this one
      // and left it, and the request should say so.
      render([field({ value: 'A stored title' })]).submit();

      expect(submissions).toEqual([{ 'dc:title': 'A stored title' }]);
    });

    it('never submits a display-only field, however it was rendered', () => {
      const form = render([
        field({ name: 'dc:title', editable: true }),
        field({ name: 'dc:creator', label: 'Created by', editable: false, value: 'jdoe' }),
      ]);

      form.submit();

      // The gateway drops it anyway. Sending it would make the request read, to
      // anyone auditing it, as though the user had changed something they could
      // not see a control for.
      expect(submissions[0]).not.toHaveProperty('dc:creator');
      expect(Object.keys(submissions[0])).toEqual(['dc:title']);
    });

    it('shows display-only fields, because they are what makes the form reviewable', () => {
      render([
        field({ name: 'dc:title', editable: true }),
        field({ name: 'dc:creator', label: 'Created by', editable: false, value: 'jdoe' }),
      ]);

      expect(text()).toContain('Created by');
      expect(text()).toContain('jdoe');
    });

    it('submits a cleared field as null rather than as an empty string', () => {
      // "No value" rather than "the empty string", which is what the gateway then
      // checks against `required`.
      const form = render([field({ name: 'dc:description', value: 'Some text' })]);

      form.edit('dc:description', '');
      form.submit();

      expect(submissions).toEqual([{ 'dc:description': null }]);
    });

    it('accepts one answer and ignores a second', () => {
      const form = render([field()]);

      form.submit();
      form.submit();
      form.cancel();

      expect(submissions).toHaveLength(1);
      expect(cancellations).toBe(0);
    });
  });

  describe('each declared type', () => {
    it('submits a number as a number', () => {
      const form = render([field({ name: 'x:count', type: 'number', value: 1 })]);

      form.edit('x:count', '42');
      form.submit();

      expect(submissions).toEqual([{ 'x:count': 42 }]);
    });

    it('submits an emptied number as null rather than zero', () => {
      // Coercion is how a form ends up writing 0 for the empty string.
      const form = render([field({ name: 'x:count', type: 'number', value: 7 })]);

      form.edit('x:count', '');
      form.submit();

      expect(submissions).toEqual([{ 'x:count': null }]);
    });

    it('submits a boolean as a boolean, including false', () => {
      const form = render([field({ name: 'x:flag', type: 'boolean', value: true })]);

      form.editBoolean('x:flag', false);
      form.submit();

      expect(submissions).toEqual([{ 'x:flag': false }]);
    });

    it('submits a date as the string the control holds', () => {
      const form = render([field({ name: 'dc:expired', type: 'date', value: null })]);

      form.edit('dc:expired', '2026-12-31');
      form.submit();

      expect(submissions).toEqual([{ 'dc:expired': '2026-12-31' }]);
    });

    it('renders a multiline field as a textarea', () => {
      render([field({ name: 'dc:description', type: 'multiline' })]);

      expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
    });
  });

  describe('the courtesy checks', () => {
    it('refuses to submit an empty required field, and says which', () => {
      const form = render([field({ required: true, value: 'A title' })]);

      form.edit('dc:title', '   ');
      form.submit();
      fixture.detectChanges();

      expect(submissions).toEqual([]);
      expect(text()).toContain('Title is required.');
    });

    it('refuses to submit past a declared maxLength', () => {
      const form = render([field({ maxLength: 10 })]);

      form.edit('dc:title', 'far too long to fit');
      form.submit();
      fixture.detectChanges();

      expect(submissions).toEqual([]);
      expect(text()).toContain('longer than 10 characters');
    });

    it('says nothing about a problem until a submit has been attempted', () => {
      const form = render([field({ required: true })]);

      form.edit('dc:title', '');
      fixture.detectChanges();

      expect(text()).not.toContain('is required');
    });

    it('submits once the problem is corrected', () => {
      const form = render([field({ required: true })]);

      form.edit('dc:title', '');
      form.submit();
      form.edit('dc:title', 'A real title');
      form.submit();

      expect(submissions).toEqual([{ 'dc:title': 'A real title' }]);
    });

    it('lets an empty optional field through', () => {
      const form = render([field({ name: 'dc:description', required: undefined })]);

      form.edit('dc:description', '');
      form.submit();

      expect(submissions).toEqual([{ 'dc:description': null }]);
    });
  });

  describe('a value the model authored', () => {
    it('is marked as suggested, so the user knows they are reviewing one', () => {
      render([field({ source: 'proposed', value: 'Title the model chose' })]);

      expect(text()).toContain('suggested');
      expect(text()).toContain('Check them before saving');
    });

    it('is not marked when every value came from Nuxeo', () => {
      render([field({ source: 'current' })]);

      expect(fixture.componentInstance.hasProposedValues()).toBe(false);
      expect(text()).not.toContain('Check them before saving');
    });

    it('still shows the proposed value, because that is what is being reviewed', () => {
      render([field({ source: 'proposed', value: 'Title the model chose' })]);

      expect(fixture.componentInstance.rows()[0].text).toBe('Title the model chose');
    });

    /**
     * The display-only rows are the ones a reader cannot check.
     *
     * `source` is set from whether the write's arguments mentioned the field, regardless
     * of whether it is editable — so a model naming `dc:creator` in an update has its own
     * string rendered in the block this component's own comment calls "the context that
     * makes the form reviewable". `updateMetadata` declares three display-only fields, so
     * the shape is reachable rather than hypothetical.
     *
     * An editable row's proposal sits in a control the user is about to read anyway. These
     * have no control, and were the only values on the form carrying no provenance at all.
     * Nothing is written either way: the overlay drops non-editable fields server-side, so
     * this is display honesty rather than a write path.
     */
    describe('on a row the user cannot edit', () => {
      const proposedCreator = field({
        name: 'dc:creator',
        label: 'Created by',
        editable: false,
        value: 'Administrator',
        source: 'proposed',
      });

      it('is marked as suggested rather than printed as the document’s own value', () => {
        render([field(), proposedCreator]);

        expect(fixture.componentInstance.hasProposedReadOnlyValues()).toBe(true);
        expect(text()).toContain('suggested');
      });

      it('says the marked values are the assistant’s, not the document’s', () => {
        // "Check them before saving" points at the editable controls, and there is
        // nothing to check or save here — so the banner needs the second sentence.
        render([field(), proposedCreator]);

        expect(text()).toContain("are the assistant's, not the document's");
      });

      it('says nothing of the kind when the display-only values came from Nuxeo', () => {
        render([
          field({ source: 'proposed' }),
          field({ name: 'dc:creator', editable: false, value: 'jdoe', source: 'current' }),
        ]);

        expect(fixture.componentInstance.hasProposedReadOnlyValues()).toBe(false);
        expect(text()).not.toContain("are the assistant's");
      });

      it('is still never submitted, marked or not', () => {
        const form = render([field(), proposedCreator]);

        form.submit();

        expect(submissions).toEqual([{ 'dc:title': 'A stored title' }]);
      });
    });
  });

  describe('cancelling', () => {
    it('reports it once and submits nothing', () => {
      const form = render([field()]);

      form.cancel();
      form.cancel();

      expect(cancellations).toBe(1);
      expect(submissions).toEqual([]);
    });
  });
});
