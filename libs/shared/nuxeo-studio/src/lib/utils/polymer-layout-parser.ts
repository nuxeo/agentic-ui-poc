import {
  FieldWidgetConfig,
  LayoutConfig,
  LayoutMode,
  LayoutSection,
  WidgetType,
} from '../models/layout.model';

/**
 * Mapping from Polymer/Nuxeo element tag names to Angular WidgetType.
 * Covers the standard elements produced by Studio Designer.
 */
const ELEMENT_TO_WIDGET: Record<string, WidgetType> = {
  'nuxeo-input': 'text',
  'nuxeo-textarea': 'textarea',
  'nuxeo-date-picker': 'date',
  'nuxeo-date': 'date',
  'nuxeo-datetime-picker': 'datetime',
  'nuxeo-directory-suggestion': 'directory',
  'nuxeo-directory-checkbox': 'directory',
  'nuxeo-directory-radio-group': 'radio',
  'nuxeo-user-suggestion': 'usergroup',
  'nuxeo-user-group-suggestion': 'usergroup',
  'nuxeo-select': 'select',
  'nuxeo-select2': 'select',
  'nuxeo-checkbox': 'checkbox',
  'nuxeo-toggle-button': 'toggle',
  'nuxeo-html-editor': 'htmleditor',
  'nuxeo-tag-suggestion': 'tag',
  'nuxeo-dropzone': 'blob',
  'nuxeo-file': 'blob',
  'nuxeo-document-suggestion': 'document',
  'nuxeo-data-table': 'datatable',
  'nuxeo-document-viewer': 'blob',
  'nuxeo-document-attachments': 'blob',
};

/** Elements that operate on the whole document, not a specific property xpath. */
const DOCUMENT_LEVEL_ELEMENTS = new Set([
  'nuxeo-document-viewer',
  'nuxeo-document-attachments',
  'nuxeo-document-content',
]);

/**
 * Regex to extract the xpath from Polymer two-way / one-way bindings:
 *   value="{{document.properties.dc:title}}"
 *   value="[[document.properties.dc:title]]"
 * Also matches bindings inside text content and format helpers like
 *   [[formatDirectory(document.properties.dc:nature)]]
 */
const BINDING_REGEX =
  /\{\{document\.properties\.([\w:./\-[\]]+)\}\}|\[\[(?:\w+\()?document\.properties\.([\w:./\-[\]]+)\)?\]\]/;

/** Regex to extract label key from Polymer i18n helper: [[i18n('someKey')]] */
const I18N_REGEX = /^\[\[i18n\(['"](.+?)['"]\)\]\]$/;

/**
 * Parse a Nuxeo Studio Designer Polymer HTML layout into a LayoutConfig.
 *
 * This is a stateless utility — no Angular DI required. It uses the browser's
 * DOMParser to parse the HTML and extract widget elements, xpaths, labels,
 * and section groupings.
 *
 * Real Nuxeo layouts are wrapped in `<dom-module><template>...</template></dom-module>`.
 * HTML5 `<template>` puts its children into a DocumentFragment, making them
 * invisible to querySelector on the main document. We preprocess the HTML
 * to unwrap these before parsing.
 */
export function parsePolymerLayout(
  html: string,
  docType: string,
  mode: LayoutMode,
): LayoutConfig | null {
  if (!html || html.trim().length === 0) return null;

  const preprocessed = preprocessPolymerHtml(html);
  const doc = new DOMParser().parseFromString(preprocessed, 'text/html');

  const sections = extractSections(doc, mode);
  if (sections.length === 0) return null;

  return { docType, mode, sections };
}

/**
 * Preprocess Polymer HTML to make content accessible to DOMParser.
 *
 * HTML5 `<template>` elements store their children in a DocumentFragment
 * that is NOT queryable from the parent document. Real Nuxeo layouts always
 * wrap content in `<dom-module><template>...</template></dom-module>`.
 *
 * We convert `<template>` tags to `<div>` so content stays in the regular
 * DOM tree, and strip `<script>` blocks which contain Polymer JS.
 */
function preprocessPolymerHtml(html: string): string {
  let result = html;
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
  result = result.replace(/<\/?dom-module[^>]*>/gi, '');
  result = result.replace(/<template(\s[^>]*)?>/gi, '<div$1>');
  result = result.replace(/<\/template>/gi, '</div>');
  return result;
}

/**
 * Extract sections from the parsed HTML document.
 * Looks for `<nuxeo-card>` or `<div class="layout">` as section containers.
 * If none found, treats the entire document as a single section.
 */
function extractSections(doc: Document, mode: LayoutMode): LayoutSection[] {
  const cards = doc.querySelectorAll('nuxeo-card');
  if (cards.length > 0) {
    return Array.from(cards)
      .map((card) => cardToSection(card as HTMLElement, mode))
      .filter((s) => s.fields.length > 0);
  }

  const layoutDivs = doc.querySelectorAll('div.layout, div[role="layout"]');
  if (layoutDivs.length > 0) {
    return Array.from(layoutDivs)
      .map((div) => containerToSection(div as HTMLElement, mode))
      .filter((s) => s.fields.length > 0);
  }

  const fields = extractFieldsFromContainer(doc.body ?? doc.documentElement, mode);
  if (fields.length === 0) return [];

  return [{ label: 'General', collapsed: false, columns: 1, fields }];
}

function cardToSection(card: HTMLElement, mode: LayoutMode): LayoutSection {
  const heading = card.getAttribute('heading') ?? card.getAttribute('label') ?? 'Section';
  const icon = card.getAttribute('icon');
  const collapsed = card.hasAttribute('collapsible') && card.hasAttribute('opened') === false;

  const fields = extractFieldsFromContainer(card, mode);

  return {
    label: heading,
    collapsed,
    columns: detectColumns(card),
    fields,
    ...(icon ? { cssClass: `icon-${icon}` } : {}),
  };
}

function containerToSection(container: HTMLElement, mode: LayoutMode): LayoutSection {
  const label =
    container.getAttribute('heading') ??
    container.getAttribute('aria-label') ??
    container.getAttribute('data-label') ??
    'Section';

  const fields = extractFieldsFromContainer(container, mode);

  return { label, collapsed: false, columns: detectColumns(container), fields };
}

/**
 * Extract all widget fields from a container element.
 * Finds elements with role="widget" or known Nuxeo element tags.
 */
function extractFieldsFromContainer(container: Element, mode: LayoutMode): FieldWidgetConfig[] {
  const fields: FieldWidgetConfig[] = [];
  const seen = new Set<string>();

  const pushField = (field: FieldWidgetConfig | null) => {
    if (field && !seen.has(field.xpath)) {
      seen.add(field.xpath);
      fields.push(field);
    }
  };

  const widgetElements = container.querySelectorAll('[role="widget"]');
  if (widgetElements.length > 0) {
    widgetElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const tagName = htmlEl.tagName.toLowerCase();

      if (DOCUMENT_LEVEL_ELEMENTS.has(tagName)) {
        return;
      }

      if (ELEMENT_TO_WIDGET[tagName] !== undefined || hasDirectBinding(htmlEl)) {
        pushField(elementToFieldConfig(htmlEl, mode));
      } else {
        extractFieldsFromWrapperDiv(htmlEl, mode).forEach(pushField);
      }
    });
    return fields;
  }

  const knownTags = Object.keys(ELEMENT_TO_WIDGET);
  const selector = knownTags.join(', ');
  const elements = container.querySelectorAll(selector);
  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (!DOCUMENT_LEVEL_ELEMENTS.has(htmlEl.tagName.toLowerCase())) {
      pushField(elementToFieldConfig(htmlEl, mode));
    }
  });

  return fields;
}

/**
 * Check if an element has a direct property binding (value, selected, etc.).
 */
function hasDirectBinding(el: HTMLElement): boolean {
  const attrs = ['value', 'selected', 'selected-item', 'selected-items', 'property', 'field'];
  return attrs.some((a) => el.getAttribute(a) !== null);
}

/**
 * Handle `<div role="widget">` wrapper elements found in metadata layouts.
 * These wrap inner elements or text content that contains property bindings.
 *
 * Example from real nuxeo-file-metadata-layout.html:
 *   <div role="widget">
 *     <label>[[i18n('label.dublincore.title')]]</label>
 *     <div name="title">[[document.properties.dc:title]]</div>
 *   </div>
 */
function extractFieldsFromWrapperDiv(wrapper: HTMLElement, mode: LayoutMode): FieldWidgetConfig[] {
  const results: FieldWidgetConfig[] = [];

  const innerKnownEls = wrapper.querySelectorAll(Object.keys(ELEMENT_TO_WIDGET).join(', '));
  if (innerKnownEls.length > 0) {
    innerKnownEls.forEach((inner) => {
      const field = elementToFieldConfig(inner as HTMLElement, mode);
      if (field) results.push(field);
    });
    return results;
  }

  const xpath = extractXpathFromTextContent(wrapper);
  if (!xpath) return results;

  const labelEl = wrapper.querySelector('label');
  const rawLabel = labelEl?.textContent?.trim() ?? '';
  const label = cleanLabel(rawLabel, xpath);

  results.push({
    xpath,
    widget: inferWidgetFromMetadataDiv(wrapper),
    label,
    readOnly: true,
  });

  return results;
}

/**
 * Extract xpath from text content bindings inside a wrapper div.
 * Scans all text nodes for [[document.properties.X]] or {{document.properties.X}}.
 */
function extractXpathFromTextContent(el: HTMLElement): string | null {
  const html = el.innerHTML;
  const match = BINDING_REGEX.exec(html);
  return match ? (match[1] ?? match[2]) : null;
}

/**
 * Infer widget type from a metadata display div.
 * Checks for known child elements like nuxeo-date.
 */
function inferWidgetFromMetadataDiv(wrapper: HTMLElement): WidgetType {
  if (wrapper.querySelector('nuxeo-date')) return 'date';
  if (wrapper.querySelector('nuxeo-user-tag, nuxeo-user-avatar')) return 'usergroup';
  return 'text';
}

/**
 * Convert a single Polymer element to a FieldWidgetConfig.
 */
function elementToFieldConfig(el: HTMLElement, mode: LayoutMode): FieldWidgetConfig | null {
  const tagName = el.tagName.toLowerCase();
  const widgetType = ELEMENT_TO_WIDGET[tagName];

  const xpath = extractXpath(el);
  if (!xpath) return null;

  const rawLabel = el.getAttribute('label') ?? '';
  const label = cleanLabel(rawLabel, xpath);
  const widget = widgetType ?? inferWidgetFromAttributes(el);

  const multipleAttr = el.getAttribute('multiple');
  const isMultiple = multipleAttr !== null && multipleAttr !== 'false';

  const config: FieldWidgetConfig = {
    xpath,
    widget,
    label,
    required: el.hasAttribute('required'),
    readOnly:
      mode === 'view' ||
      mode === 'metadata' ||
      el.hasAttribute('readonly') ||
      el.hasAttribute('read-only'),
    multiple: isMultiple,
  };

  const placeholder = el.getAttribute('placeholder');
  if (placeholder) config.placeholder = cleanLabel(placeholder, '');

  const directoryName = el.getAttribute('directory-name') ?? el.getAttribute('directoryName');
  if (directoryName) {
    config.directory = directoryName;
    if (config.widget === 'text') config.widget = 'directory';
  }

  const min = el.getAttribute('min');
  if (min !== null) config.min = Number(min);

  const max = el.getAttribute('max');
  if (max !== null) config.max = Number(max);

  const maxLength = el.getAttribute('maxlength') ?? el.getAttribute('max-length');
  if (maxLength !== null) config.maxLength = Number(maxLength);

  const rows = el.getAttribute('rows');
  if (rows !== null) config.rows = Number(rows);

  const accept = el.getAttribute('accept');
  if (accept) config.accept = accept;

  const hidden = el.hasAttribute('hidden');
  if (hidden) config.widget = 'hidden';

  const width = detectFieldWidth(el);
  if (width) config.width = width;

  const subFields = extractSubFields(el, mode);
  if (subFields.length > 0) config.fields = subFields;

  return config;
}

/**
 * Extract xpath from a Polymer element's value binding.
 * Tries multiple attribute names where bindings might exist.
 */
function extractXpath(el: HTMLElement): string | null {
  const bindingAttrs = [
    'value',
    'selected',
    'datetime',
    'selected-item',
    'selected-items',
    'selectedItem',
    'selectedItems',
  ];

  for (const attr of bindingAttrs) {
    const raw = el.getAttribute(attr);
    if (!raw) continue;

    const match = BINDING_REGEX.exec(raw);
    if (match) return match[1] ?? match[2];
  }

  const property = el.getAttribute('property');
  if (property) return property;

  const field = el.getAttribute('field');
  if (field) return field;

  return null;
}

/**
 * Clean a Polymer label value.
 * Strips i18n wrappers like [[i18n('label.dublincore.title')]] and
 * converts the key to a human-readable label.
 */
function cleanLabel(raw: string, xpath: string): string {
  if (!raw) return xpathToDisplayLabel(xpath);

  const i18nMatch = I18N_REGEX.exec(raw.trim());
  if (i18nMatch) {
    return i18nKeyToLabel(i18nMatch[1]);
  }

  if (raw.startsWith('[[') || raw.startsWith('{{')) {
    return xpathToDisplayLabel(xpath);
  }

  return raw;
}

/**
 * Convert an i18n key like "label.dublincore.title" or "title" to
 * a human-readable label like "Title".
 */
function i18nKeyToLabel(key: string): string {
  const parts = key.split('.');
  const last = parts[parts.length - 1];
  return last
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/^\s+/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Infer widget type from element attributes when tag name isn't recognized.
 */
function inferWidgetFromAttributes(el: HTMLElement): WidgetType {
  if (el.hasAttribute('directory-name') || el.hasAttribute('directoryName')) return 'directory';
  if (el.getAttribute('type') === 'date') return 'date';
  if (el.getAttribute('type') === 'number') return 'number';
  if (el.getAttribute('type') === 'checkbox') return 'checkbox';
  if (el.tagName.toLowerCase().includes('textarea')) return 'textarea';
  return 'text';
}

/**
 * Detect column count from container CSS classes or attributes.
 */
function detectColumns(container: HTMLElement): 1 | 2 | 3 {
  const classList = container.className ?? '';
  if (classList.includes('three-col') || classList.includes('layout-three')) return 3;
  if (
    classList.includes('two-col') ||
    classList.includes('layout-two') ||
    classList.includes('horizontal')
  )
    return 2;
  return 1;
}

/**
 * Detect field width from element CSS classes.
 */
function detectFieldWidth(el: HTMLElement): 'full' | 'half' | 'third' | undefined {
  const classList = el.className ?? '';
  if (classList.includes('half') || classList.includes('flex-2')) return 'half';
  if (classList.includes('third') || classList.includes('flex-1')) return 'third';
  if (classList.includes('full') || classList.includes('flex-4')) return 'full';
  return undefined;
}

/**
 * Extract sub-field definitions from nuxeo-data-table or complex elements.
 */
function extractSubFields(el: HTMLElement, mode: LayoutMode): FieldWidgetConfig[] {
  const columns = el.querySelectorAll('nuxeo-data-table-column');
  if (columns.length === 0) return [];

  const subFields: FieldWidgetConfig[] = [];
  columns.forEach((col) => {
    const colEl = col as HTMLElement;
    const xpath = colEl.getAttribute('name') ?? colEl.getAttribute('key') ?? '';
    const label = colEl.getAttribute('label') ?? xpath;
    if (xpath) {
      subFields.push({
        xpath,
        widget: 'text',
        label,
        readOnly: mode === 'view' || mode === 'metadata',
      });
    }
  });

  return subFields;
}

/**
 * Convert an xpath like "dc:title" to a display label like "Title".
 */
function xpathToDisplayLabel(xpath: string): string {
  const parts = xpath.split(':');
  const name = parts.length > 1 ? parts[parts.length - 1] : xpath;
  const withoutSlash = name.split('/').pop() ?? name;
  return withoutSlash
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s+/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
