import type Quill from 'quill';
import { describe, expect, it, vi } from 'vitest';
import { applyHeaderFormatSelectionOnly, parseHeaderValue } from './note-quill-header';

type QuillHeaderTestDouble = Pick<
  Quill,
  'formatLine' | 'setSelection' | 'getLine' | 'getIndex' | 'getSelection' | 'insertText'
>;

/**
 * `Partial`, not the full `Pick`: each test stubs only the Quill methods its own path calls, and
 * requiring all six made a test that never inserts text carry an unused `insertText` stub. The
 * `as unknown as Quill` is confined to this one helper so no test body needs a cast.
 *
 * Both of these were type errors in committed code that `nx test` could not see — Vitest strips
 * types through esbuild, so the suite was green while `tsc` had two errors here.
 */
function quillDouble(partial: Partial<QuillHeaderTestDouble>): Quill {
  return partial as unknown as Quill;
}

type LineTuple = ReturnType<Quill['getLine']>;

/**
 * A `getLine` return value.
 *
 * Two problems in one expression, both invisible to `nx test`: `[line, offset]` widens to an
 * array rather than the 2-tuple Quill declares, and `line` is a minimal stand-in for a `Block`
 * with 26+ members. `applyHeaderFormatSelectionOnly` reads only `length()` and
 * `domNode.textContent`, so the double stays minimal and the cast is confined to here rather
 * than repeated in every test that needs a line.
 */
function lineTuple(
  line: { length: () => number; domNode: { textContent: string } },
  offset: number,
): LineTuple {
  return [line, offset] as unknown as LineTuple;
}

describe('note-quill-header', () => {
  it('parseHeaderValue maps heading levels and normal', () => {
    expect(parseHeaderValue('1')).toBe(1);
    expect(parseHeaderValue(3)).toBe(3);
    expect(parseHeaderValue('')).toBe(false);
    expect(parseHeaderValue(false)).toBe(false);
    expect(parseHeaderValue('9')).toBe(false);
  });

  it('applyHeaderFormatSelectionOnly formats only the selected lines', () => {
    const formatLine = vi.fn();
    const setSelection = vi.fn();
    const getLine = vi.fn();
    const getIndex = vi.fn();
    const getSelection = vi.fn(() => ({ index: 2, length: 5 }));

    const quill = quillDouble({
      formatLine,
      setSelection,
      getLine,
      getIndex,
      getSelection,
    });

    applyHeaderFormatSelectionOnly(quill, '2');

    expect(formatLine).toHaveBeenCalledWith(2, 5, 'header', 2, expect.anything());
    expect(setSelection).toHaveBeenCalledWith(2, 5, expect.anything());
    expect(getLine).not.toHaveBeenCalled();
  });

  it('applyHeaderFormatSelectionOnly splits the line when cursor is after existing text', () => {
    const formatLine = vi.fn();
    const insertText = vi.fn();
    const setSelection = vi.fn();
    const line = { length: () => 1, domNode: { textContent: 'Hello' } };
    const getLine = vi.fn((): LineTuple => lineTuple(line, 5));
    const getIndex = vi.fn(() => 0);
    const getSelection = vi.fn(() => ({ index: 5, length: 0 }));

    const quill = quillDouble({
      formatLine,
      insertText,
      setSelection,
      getLine,
      getIndex,
      getSelection,
    });

    applyHeaderFormatSelectionOnly(quill, '1');

    expect(insertText).toHaveBeenCalledWith(5, '\n', expect.anything());
    expect(formatLine).toHaveBeenCalledWith(6, 1, 'header', 1, expect.anything());
    expect(setSelection).toHaveBeenCalledWith(6, 0, expect.anything());
  });

  it('applyHeaderFormatSelectionOnly pushes the trailing text down when the cursor is at the line start', () => {
    const formatLine = vi.fn();
    const insertText = vi.fn();
    const setSelection = vi.fn();
    const line = { length: () => 5, domNode: { textContent: 'Hello' } };
    const getLine = vi.fn((): LineTuple => lineTuple(line, 0));
    const getIndex = vi.fn(() => 0);
    const getSelection = vi.fn(() => ({ index: 0, length: 0 }));

    const quill = quillDouble({
      formatLine,
      insertText,
      setSelection,
      getLine,
      getIndex,
      getSelection,
    });

    applyHeaderFormatSelectionOnly(quill, '3');

    // The heading takes the new empty line; the existing text keeps its own formatting.
    expect(insertText).toHaveBeenCalledWith(0, '\n', expect.anything());
    expect(formatLine).toHaveBeenCalledWith(0, 1, 'header', 3, expect.anything());
    expect(setSelection).toHaveBeenCalledWith(0, 0, expect.anything());
  });

  it('applyHeaderFormatSelectionOnly formats an empty line in place without splitting it', () => {
    const formatLine = vi.fn();
    const insertText = vi.fn();
    const setSelection = vi.fn();
    const line = { length: () => 1, domNode: { textContent: '' } };
    const getLine = vi.fn((): LineTuple => lineTuple(line, 0));
    const getIndex = vi.fn(() => 7);
    const getSelection = vi.fn(() => ({ index: 7, length: 0 }));

    const quill = quillDouble({
      formatLine,
      insertText,
      setSelection,
      getLine,
      getIndex,
      getSelection,
    });

    applyHeaderFormatSelectionOnly(quill, '2');

    expect(insertText).not.toHaveBeenCalled();
    expect(formatLine).toHaveBeenCalledWith(7, 1, 'header', 2, expect.anything());
    expect(setSelection).toHaveBeenCalledWith(7, 0, expect.anything());
  });
});
