import { describe, it, expect } from 'vitest';
import { parsePolymerLayout } from './polymer-layout-parser';
import type { LayoutConfig } from '../models/layout.model';

/** Asserts result is non-null and returns it typed, satisfying lint (no `!` assertion). */
function assertLayout(result: LayoutConfig | null): LayoutConfig {
  expect(result).not.toBeNull();
  return result as LayoutConfig;
}

describe('parsePolymerLayout', () => {
  it('returns null for empty HTML', () => {
    expect(parsePolymerLayout('', 'File', 'edit')).toBeNull();
    expect(parsePolymerLayout('   ', 'File', 'edit')).toBeNull();
  });

  it('returns null for HTML with no widget elements', () => {
    const html = '<div><p>No widgets here</p></div>';
    expect(parsePolymerLayout(html, 'File', 'edit')).toBeNull();
  });

  it('parses a single nuxeo-input with two-way binding', () => {
    const html = `
      <nuxeo-input role="widget"
        value="{{document.properties.dc:title}}"
        label="Title"
        required>
      </nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.docType).toBe('File');
    expect(result.mode).toBe('edit');
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].label).toBe('General');

    const field = result.sections[0].fields[0];
    expect(field.xpath).toBe('dc:title');
    expect(field.widget).toBe('text');
    expect(field.label).toBe('Title');
    expect(field.required).toBe(true);
  });

  it('parses one-way binding syntax [[...]]', () => {
    const html = `
      <nuxeo-input role="widget"
        value="[[document.properties.dc:description]]"
        label="Description">
      </nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'Note', 'view'));
    const field = result.sections[0].fields[0];
    expect(field.xpath).toBe('dc:description');
    expect(field.readOnly).toBe(true);
  });

  it('parses nuxeo-directory-suggestion with directory-name', () => {
    const html = `
      <nuxeo-directory-suggestion role="widget"
        value="{{document.properties.dc:nature}}"
        label="Nature"
        directory-name="nature">
      </nuxeo-directory-suggestion>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.xpath).toBe('dc:nature');
    expect(field.widget).toBe('directory');
    expect(field.directory).toBe('nature');
  });

  it('parses nuxeo-textarea', () => {
    const html = `
      <nuxeo-textarea role="widget"
        value="{{document.properties.dc:description}}"
        label="Description"
        rows="4">
      </nuxeo-textarea>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.widget).toBe('textarea');
    expect(field.rows).toBe(4);
  });

  it('parses nuxeo-date-picker', () => {
    const html = `
      <nuxeo-date-picker role="widget"
        value="{{document.properties.dc:expired}}"
        label="Expires">
      </nuxeo-date-picker>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.widget).toBe('date');
    expect(field.xpath).toBe('dc:expired');
  });

  it('parses nuxeo-user-suggestion', () => {
    const html = `
      <nuxeo-user-suggestion role="widget"
        value="{{document.properties.dc:creator}}"
        label="Creator"
        readonly>
      </nuxeo-user-suggestion>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.widget).toBe('usergroup');
    expect(field.readOnly).toBe(true);
  });

  it('parses nuxeo-dropzone (blob)', () => {
    const html = `
      <nuxeo-dropzone role="widget"
        value="{{document.properties.file:content}}"
        label="File"
        accept=".pdf,.docx">
      </nuxeo-dropzone>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.widget).toBe('blob');
    expect(field.accept).toBe('.pdf,.docx');
  });

  it('parses nuxeo-checkbox', () => {
    const html = `
      <nuxeo-checkbox role="widget"
        value="{{document.properties.custom:active}}"
        label="Active">
      </nuxeo-checkbox>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'CustomType', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.widget).toBe('checkbox');
  });

  it('parses nuxeo-tag-suggestion', () => {
    const html = `
      <nuxeo-tag-suggestion role="widget"
        value="{{document.properties.nxtag:tags}}"
        label="Tags"
        multiple>
      </nuxeo-tag-suggestion>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.widget).toBe('tag');
    expect(field.multiple).toBe(true);
  });

  it('preserves field ordering from HTML', () => {
    const html = `
      <nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title"></nuxeo-input>
      <nuxeo-textarea role="widget" value="{{document.properties.dc:description}}" label="Description"></nuxeo-textarea>
      <nuxeo-directory-suggestion role="widget" value="{{document.properties.dc:nature}}" label="Nature" directory-name="nature"></nuxeo-directory-suggestion>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    const fields = result.sections[0].fields;
    expect(fields).toHaveLength(3);
    expect(fields[0].xpath).toBe('dc:title');
    expect(fields[1].xpath).toBe('dc:description');
    expect(fields[2].xpath).toBe('dc:nature');
  });

  it('deduplicates fields with the same xpath', () => {
    const html = `
      <nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title"></nuxeo-input>
      <nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title Again"></nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields).toHaveLength(1);
  });

  it('groups fields into sections by nuxeo-card', () => {
    const html = `
      <nuxeo-card heading="General">
        <nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title"></nuxeo-input>
      </nuxeo-card>
      <nuxeo-card heading="Details">
        <nuxeo-textarea role="widget" value="{{document.properties.dc:description}}" label="Description"></nuxeo-textarea>
      </nuxeo-card>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].label).toBe('General');
    expect(result.sections[0].fields[0].xpath).toBe('dc:title');
    expect(result.sections[1].label).toBe('Details');
    expect(result.sections[1].fields[0].xpath).toBe('dc:description');
  });

  it('skips nuxeo-card sections with no widget fields', () => {
    const html = `
      <nuxeo-card heading="Empty">
        <p>Just text, no widgets</p>
      </nuxeo-card>
      <nuxeo-card heading="With Widgets">
        <nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title"></nuxeo-input>
      </nuxeo-card>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].label).toBe('With Widgets');
  });

  it('marks all fields readOnly in view mode', () => {
    const html = `
      <nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title"></nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'view'));
    expect(result.sections[0].fields[0].readOnly).toBe(true);
  });

  it('falls back to known tags when role="widget" is missing', () => {
    const html = `
      <nuxeo-input value="{{document.properties.dc:title}}" label="Title"></nuxeo-input>
      <nuxeo-date-picker value="{{document.properties.dc:expired}}" label="Expires"></nuxeo-date-picker>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields).toHaveLength(2);
  });

  it('extracts min, max, maxlength attributes', () => {
    const html = `
      <nuxeo-input role="widget"
        value="{{document.properties.custom:count}}"
        label="Count"
        min="0"
        max="100"
        maxlength="5">
      </nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'CustomType', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.min).toBe(0);
    expect(field.max).toBe(100);
    expect(field.maxLength).toBe(5);
  });

  it('handles placeholder attribute', () => {
    const html = `
      <nuxeo-input role="widget"
        value="{{document.properties.dc:title}}"
        label="Title"
        placeholder="Enter title...">
      </nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields[0].placeholder).toBe('Enter title...');
  });

  it('handles property attribute as xpath fallback', () => {
    const html = `
      <nuxeo-input role="widget" property="dc:title" label="Title"></nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields[0].xpath).toBe('dc:title');
  });

  // ─── Tests for issues found against real lts-2025 layouts ───

  it('strips i18n label wrappers and converts to readable text', () => {
    const html = `
      <nuxeo-input role="widget"
        value="{{document.properties.dc:title}}"
        label="[[i18n('label.dublincore.title')]]">
      </nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields[0].label).toBe('Title');
  });

  it('strips i18n from simple keys', () => {
    const html = `
      <nuxeo-input role="widget"
        value="{{document.properties.dc:title}}"
        label="[[i18n('title')]]">
      </nuxeo-input>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields[0].label).toBe('Title');
  });

  it('parses nuxeo-select using selected attribute binding', () => {
    const html = `
      <nuxeo-select role="widget"
        label="Format"
        selected="{{document.properties.note:mime_type}}">
      </nuxeo-select>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'Note', 'edit'));
    const field = result.sections[0].fields[0];
    expect(field.xpath).toBe('note:mime_type');
    expect(field.widget).toBe('select');
  });

  it('handles multiple="true" as a string value', () => {
    const html = `
      <nuxeo-directory-suggestion role="widget"
        value="{{document.properties.dc:subjects}}"
        label="Subjects"
        directory-name="l10nsubjects"
        multiple="true">
      </nuxeo-directory-suggestion>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields[0].multiple).toBe(true);
  });

  it('handles multiple="false" correctly', () => {
    const html = `
      <nuxeo-directory-suggestion role="widget"
        value="{{document.properties.dc:nature}}"
        label="Nature"
        directory-name="nature"
        multiple="false">
      </nuxeo-directory-suggestion>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
    expect(result.sections[0].fields[0].multiple).toBe(false);
  });

  it('skips nuxeo-document-viewer (whole-document widget)', () => {
    const html = `
      <nuxeo-document-viewer role="widget" document="[[document]]"></nuxeo-document-viewer>
    `;
    expect(parsePolymerLayout(html, 'File', 'view')).toBeNull();
  });

  it('skips nuxeo-document-attachments (whole-document widget)', () => {
    const html = `
      <nuxeo-input role="widget" value="{{document.properties.dc:title}}" label="Title"></nuxeo-input>
      <nuxeo-document-attachments role="widget" document="[[document]]"></nuxeo-document-attachments>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'metadata'));
    expect(result.sections[0].fields).toHaveLength(1);
    expect(result.sections[0].fields[0].xpath).toBe('dc:title');
  });

  it('does not treat hidden$ as hidden (Polymer computed attribute)', () => {
    const html = `
      <div role="widget" hidden$="[[!document.properties.dc:description]]">
        <label>Description</label>
        <div>[[document.properties.dc:description]]</div>
      </div>
    `;
    const result = assertLayout(parsePolymerLayout(html, 'File', 'metadata'));
    const field = result.sections[0].fields[0];
    expect(field.xpath).toBe('dc:description');
    expect(field.widget).not.toBe('hidden');
  });

  // ─── Real lts-2025 layout integration tests ───

  describe('real lts-2025 nuxeo-file-edit-layout', () => {
    const html = `
<dom-module id="nuxeo-file-edit-layout">
  <template>
    <style include="nuxeo-styles">
      .inputclass {
        margin-bottom: 12px;
      }
    </style>
    <div class="inputclass">
      <nuxeo-input
        role="widget"
        label="[[i18n('title')]]"
        name="title"
        value="{{document.properties.dc:title}}"
        autofocus
        required
        id="inputElem"
        error-message="[[i18n('title.err')]]"
        on-value-changed="_validateOnChange"
      >
      </nuxeo-input>
    </div>
    <nuxeo-textarea
      role="widget"
      label="[[i18n('label.description')]]"
      name="description"
      value="{{document.properties.dc:description}}"
    >
    </nuxeo-textarea>

    <nuxeo-directory-suggestion
      role="widget"
      label="[[i18n('label.dublincore.nature')]]"
      name="nature"
      directory-name="nature"
      value="{{document.properties.dc:nature}}"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]"
      min-chars="0"
    >
    </nuxeo-directory-suggestion>

    <nuxeo-directory-suggestion
      role="widget"
      label="[[i18n('label.dublincore.subjects')]]"
      directory-name="l10nsubjects"
      name="subjects"
      value="{{document.properties.dc:subjects}}"
      multiple="true"
      dbl10n="true"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]"
      min-chars="0"
    >
    </nuxeo-directory-suggestion>

    <nuxeo-directory-suggestion
      role="widget"
      label="[[i18n('label.dublincore.coverage')]]"
      directory-name="l10ncoverage"
      name="coverage"
      value="{{document.properties.dc:coverage}}"
      dbl10n="true"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]"
      min-chars="0"
    >
    </nuxeo-directory-suggestion>

    <nuxeo-date-picker
      role="widget"
      label="[[i18n('label.dublincore.expire')]]"
      name="expired"
      value="{{document.properties.dc:expired}}"
      aria-label$="[[i18n('label.dublincore.expire')]]"
    >
    </nuxeo-date-picker>
  </template>

  <script>
    Polymer({
      is: 'nuxeo-file-edit-layout',
      behaviors: [Nuxeo.LayoutBehavior],
      properties: {
        document: Object,
      },
      validate() {
        return this.$.inputElem.validate();
      },
      _validateOnChange() {
        this.$.inputElem.validate();
      },
    });
  </script>
</dom-module>`;

    it('extracts all 6 fields', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].fields).toHaveLength(6);
    });

    it('correctly identifies field types', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
      const fields = result.sections[0].fields;
      expect(fields[0]).toMatchObject({ xpath: 'dc:title', widget: 'text', required: true });
      expect(fields[1]).toMatchObject({ xpath: 'dc:description', widget: 'textarea' });
      expect(fields[2]).toMatchObject({
        xpath: 'dc:nature',
        widget: 'directory',
        directory: 'nature',
      });
      expect(fields[3]).toMatchObject({
        xpath: 'dc:subjects',
        widget: 'directory',
        directory: 'l10nsubjects',
        multiple: true,
      });
      expect(fields[4]).toMatchObject({
        xpath: 'dc:coverage',
        widget: 'directory',
        directory: 'l10ncoverage',
      });
      expect(fields[5]).toMatchObject({ xpath: 'dc:expired', widget: 'date' });
    });

    it('cleans i18n labels to readable strings', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
      const fields = result.sections[0].fields;
      expect(fields[0].label).toBe('Title');
      expect(fields[1].label).toBe('Description');
      expect(fields[2].label).toBe('Nature');
      expect(fields[3].label).toBe('Subjects');
      expect(fields[4].label).toBe('Coverage');
      expect(fields[5].label).toBe('Expire');
    });

    it('sets fields as editable in edit mode', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'edit'));
      const fields = result.sections[0].fields;
      expect(fields.every((f) => f.readOnly !== true)).toBe(true);
    });
  });

  describe('real lts-2025 nuxeo-file-create-layout', () => {
    const html = `
<dom-module id="nuxeo-file-create-layout">
  <template>
    <style include="nuxeo-styles">
      .inputclass { margin-bottom: 12px; }
    </style>
    <div class="inputclass">
      <nuxeo-input role="widget" label="[[i18n('title')]]" name="title" id="inputElem"
        value="{{document.properties.dc:title}}" autofocus required
        error-message="[[i18n('title.err')]]" on-value-changed="_validateOnChange">
      </nuxeo-input>
    </div>
    <nuxeo-textarea role="widget" label="[[i18n('label.description')]]" name="description"
      value="{{document.properties.dc:description}}">
    </nuxeo-textarea>
    <nuxeo-dropzone role="widget" label="[[i18n('file.content')]]" name="content"
      value="{{document.properties.file:content}}"></nuxeo-dropzone>
    <nuxeo-directory-suggestion role="widget" label="[[i18n('label.dublincore.nature')]]"
      name="nature" directory-name="nature" value="{{document.properties.dc:nature}}"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]" min-chars="0">
    </nuxeo-directory-suggestion>
    <nuxeo-directory-suggestion role="widget" label="[[i18n('label.dublincore.subjects')]]"
      directory-name="l10nsubjects" name="subjects" value="{{document.properties.dc:subjects}}"
      multiple="true" dbl10n="true"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]" min-chars="0">
    </nuxeo-directory-suggestion>
    <nuxeo-directory-suggestion role="widget" label="[[i18n('label.dublincore.coverage')]]"
      directory-name="l10ncoverage" name="coverage" value="{{document.properties.dc:coverage}}"
      dbl10n="true"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]" min-chars="0">
    </nuxeo-directory-suggestion>
    <nuxeo-date-picker role="widget" label="[[i18n('label.dublincore.expire')]]" name="expired"
      value="{{document.properties.dc:expired}}" aria-label$="[[i18n('label.dublincore.expire')]]">
    </nuxeo-date-picker>
  </template>
  <script>
    Polymer({ is: 'nuxeo-file-create-layout' });
  </script>
</dom-module>`;

    it('extracts 7 fields including nuxeo-dropzone', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'create'));
      expect(result.sections[0].fields).toHaveLength(7);
      expect(result.sections[0].fields[2]).toMatchObject({ xpath: 'file:content', widget: 'blob' });
    });
  });

  describe('real lts-2025 nuxeo-file-view-layout', () => {
    const html = `
<dom-module id="nuxeo-file-view-layout">
  <template>
    <style include="nuxeo-styles">
      :host { @apply --paper-card; }
    </style>
    <nuxeo-document-viewer role="widget" document="[[document]]"></nuxeo-document-viewer>
  </template>
  <script>
    Polymer({ is: 'nuxeo-file-view-layout' });
  </script>
</dom-module>`;

    it('returns null because only document-level viewer is present (no property fields)', () => {
      expect(parsePolymerLayout(html, 'File', 'view')).toBeNull();
    });
  });

  describe('real lts-2025 nuxeo-file-metadata-layout', () => {
    const html = `
<dom-module id="nuxeo-file-metadata-layout">
  <template>
    <style include="nuxeo-styles"></style>

    <div role="widget">
      <label>[[i18n('label.dublincore.title')]]</label>
      <div name="title">[[document.properties.dc:title]]</div>
    </div>

    <div role="widget" hidden$="[[!document.properties.dc:description]]">
      <label>[[i18n('label.dublincore.description')]]</label>
      <div name="description" class="multiline">[[document.properties.dc:description]]</div>
    </div>

    <div role="widget" hidden$="[[!document.properties.dc:nature]]">
      <label>[[i18n('label.dublincore.nature')]]</label>
      <div name="nature">[[formatDirectory(document.properties.dc:nature)]]</div>
    </div>

    <nuxeo-directory-suggestion
      role="widget"
      label="[[i18n('label.dublincore.subjects')]]"
      directory-name="l10nsubjects"
      name="subjects"
      value="{{document.properties.dc:subjects}}"
      hidden$="[[!document.properties.dc:subjects.length]]"
      multiple="true"
      dbl10n="true"
      readonly
    >
    </nuxeo-directory-suggestion>

    <div role="widget" hidden$="[[!document.properties.dc:coverage]]">
      <label>[[i18n('label.dublincore.coverage')]]</label>
      <div name="coverage">[[formatDirectory(document.properties.dc:coverage)]]</div>
    </div>

    <div role="widget" hidden$="[[!document.properties.dc:expired]]">
      <label>[[i18n('label.dublincore.expire')]]</label>
      <nuxeo-date
        name="expired"
        aria-label$="[[i18n('label.dublincore.expire')]]"
        datetime="[[document.properties.dc:expired]]"
      ></nuxeo-date>
    </div>

    <nuxeo-document-attachments role="widget" document="[[document]]"></nuxeo-document-attachments>
  </template>
  <script>
    Polymer({ is: 'nuxeo-file-metadata-layout' });
  </script>
</dom-module>`;

    it('extracts 6 property fields and skips nuxeo-document-attachments', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'metadata'));
      expect(result.sections[0].fields).toHaveLength(6);
    });

    it('correctly parses wrapper div fields with inner text bindings', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'metadata'));
      const fields = result.sections[0].fields;
      expect(fields[0]).toMatchObject({ xpath: 'dc:title', label: 'Title', readOnly: true });
      expect(fields[1]).toMatchObject({
        xpath: 'dc:description',
        label: 'Description',
        readOnly: true,
      });
      expect(fields[2]).toMatchObject({ xpath: 'dc:nature', label: 'Nature', readOnly: true });
    });

    it('parses nuxeo-directory-suggestion inside metadata as readOnly', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'metadata'));
      const subjectsField = result.sections[0].fields[3];
      expect(subjectsField).toMatchObject({
        xpath: 'dc:subjects',
        widget: 'directory',
        directory: 'l10nsubjects',
        multiple: true,
        readOnly: true,
      });
    });

    it('detects nuxeo-date inside wrapper div as date widget', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'metadata'));
      const expiredField = result.sections[0].fields[5];
      expect(expiredField.xpath).toBe('dc:expired');
      expect(expiredField.widget).toBe('date');
    });

    it('parses formatDirectory() bindings inside text content', () => {
      const result = assertLayout(parsePolymerLayout(html, 'File', 'metadata'));
      const natureField = result.sections[0].fields[2];
      expect(natureField.xpath).toBe('dc:nature');
    });
  });

  describe('real lts-2025 nuxeo-note-edit-layout', () => {
    const html = `
<dom-module id="nuxeo-note-edit-layout">
  <template>
    <style include="nuxeo-styles">
      .inputclass { margin-bottom: 12px; }
    </style>
    <div class="inputclass">
      <nuxeo-input role="widget" label="[[i18n('title')]]" name="title"
        value="{{document.properties.dc:title}}" autofocus required id="inputElem"
        error-message="[[i18n('title.err')]]" on-value-changed="_validateOnChange">
      </nuxeo-input>
    </div>
    <nuxeo-textarea role="widget" label="[[i18n('label.description')]]" name="description"
      value="{{document.properties.dc:description}}">
    </nuxeo-textarea>
    <nuxeo-select role="widget" label="[[i18n('noteEditLayout.format')]]"
      options="[[formats]]" selected="{{document.properties.note:mime_type}}">
    </nuxeo-select>
    <nuxeo-directory-suggestion role="widget" label="[[i18n('label.dublincore.nature')]]"
      name="nature" directory-name="nature" value="{{document.properties.dc:nature}}"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]" min-chars="0">
    </nuxeo-directory-suggestion>
    <nuxeo-directory-suggestion role="widget" label="[[i18n('label.dublincore.subjects')]]"
      directory-name="l10nsubjects" name="subjects" value="{{document.properties.dc:subjects}}"
      multiple="true" dbl10n="true"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]" min-chars="0">
    </nuxeo-directory-suggestion>
    <nuxeo-directory-suggestion role="widget" label="[[i18n('label.dublincore.coverage')]]"
      directory-name="l10ncoverage" name="coverage" value="{{document.properties.dc:coverage}}"
      dbl10n="true"
      placeholder="[[i18n('dublincoreEdit.directorySuggestion.placeholder')]]" min-chars="0">
    </nuxeo-directory-suggestion>
    <nuxeo-date-picker role="widget" label="[[i18n('label.dublincore.expire')]]" name="expired"
      value="{{document.properties.dc:expired}}" aria-label$="[[i18n('label.dublincore.expire')]]">
    </nuxeo-date-picker>
  </template>
  <script>
    Polymer({ is: 'nuxeo-note-edit-layout' });
  </script>
</dom-module>`;

    it('extracts 7 fields including nuxeo-select for mime_type', () => {
      const result = assertLayout(parsePolymerLayout(html, 'Note', 'edit'));
      expect(result.sections[0].fields).toHaveLength(7);
    });

    it('parses nuxeo-select with selected binding for note:mime_type', () => {
      const result = assertLayout(parsePolymerLayout(html, 'Note', 'edit'));
      const selectField = result.sections[0].fields[2];
      expect(selectField).toMatchObject({
        xpath: 'note:mime_type',
        widget: 'select',
      });
      expect(selectField.label).toBe('Format');
    });
  });

  describe('real lts-2025 nuxeo-workspace-view-layout', () => {
    const html = `
<dom-module id="nuxeo-workspace-view-layout">
  <template>
    <nuxeo-document-content document="[[document]]"></nuxeo-document-content>
  </template>
  <script>
    Polymer({ is: 'nuxeo-workspace-view-layout' });
  </script>
</dom-module>`;

    it('returns null because nuxeo-document-content is a document-level element', () => {
      expect(parsePolymerLayout(html, 'Workspace', 'view')).toBeNull();
    });
  });
});
