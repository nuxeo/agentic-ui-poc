import type { Document } from '@hylandsoftware/hxcs-js-client';

export function hxpDocTitle(doc: Document): string {
  return doc.sys_title ?? doc.sys_name ?? 'Untitled';
}

export function hxpDocTypeLabel(doc: Document): string {
  return (doc['sys_typeLabel'] as string | undefined) ?? doc.sys_primaryType ?? 'File';
}

/** A string from a mapped Nuxeo property, or `''` when the document has no value for it. */
function text(doc: Document, key: string): string {
  const value = doc[key];
  return typeof value === 'string' ? value : '';
}

/**
 * The `hx:*` keys these used to read are gone.
 *
 * They duplicated Dublin Core under names no adf-hx component recognised, and once the mapper
 * started emitting Nuxeo's real properties as `prefix_field` they would have rendered in the
 * adopted metadata panel as cards with no label — `translateProperty` splits on `_`, and
 * `hx:nature` has none. These read `dc_*` and `uid_*` directly now, which is the same value from
 * the same source with one fewer surface in between.
 *
 * `text()` rather than `?? ''`: the mapper omits a property Nuxeo holds no value for, so an
 * absent key is the normal case rather than an error.
 */
export function hxpBrowseCellValue(doc: Document, key: string): string {
  switch (key) {
    case 'title':
      return hxpDocTitle(doc);
    case 'type':
      return hxpDocTypeLabel(doc);
    case 'modified':
      return doc.sys_modified ? new Date(doc.sys_modified).toLocaleDateString() : '';
    case 'lastContributor':
      return text(doc, 'dc_lastContributor');
    case 'state':
      return text(doc, 'dc_nature');
    case 'version': {
      const major = doc['uid_major_version'];
      if (major === undefined || major === null) {
        return '';
      }
      return `${major}.${doc['uid_minor_version'] ?? 0}`;
    }
    case 'created':
      return doc.sys_created ? new Date(doc.sys_created).toLocaleDateString() : '';
    case 'author':
      return text(doc, 'dc_creator');
    case 'nature':
      return text(doc, 'dc_nature');
    case 'coverage':
      return text(doc, 'dc_coverage');
    case 'subjects': {
      // Nuxeo sends a real array; the old `hx:subjects` was pre-joined by the mapper.
      const subjects = doc['dc_subjects'];
      return Array.isArray(subjects) ? subjects.join(', ') : text(doc, 'dc_subjects');
    }
    case 'flags':
      return '';
    default:
      return '';
  }
}

export function hxpLastContributor(doc: Document): string {
  return text(doc, 'dc_lastContributor');
}
