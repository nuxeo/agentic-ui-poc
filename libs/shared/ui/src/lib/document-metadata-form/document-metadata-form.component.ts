import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import type {
  AgentFormField,
  AgentFormSubmission,
  AgentFormTarget,
  AgentFormValue,
} from '@agentic-ui/shared/agent-client';

/** One field as the form renders and edits it. */
export interface MetadataFormRow {
  readonly field: AgentFormField;
  /** What the control currently holds. Always a string; typed on submit. */
  readonly text: string;
  /** For a boolean field, which has a checkbox rather than a text control. */
  readonly checked: boolean;
  /** The reason this row cannot be submitted, or empty. Shown under the control. */
  readonly problem: string;
}

/**
 * The `documentMetadataForm` component: a gated metadata write, answered in chat.
 *
 * **It does not write.** It emits the values the user typed and the chat panel
 * answers the interrupt the write is held on; the gateway performs the write,
 * behind the same approval gate and the same one-shot ledger as an approval card.
 * That is the entire point of the design, and it is what "just lift the existing
 * edit dialog into the chat" would have destroyed: `EditMetadataDialogComponent`
 * calls `browseService.updateDocument()` from its own submit handler, so lifting
 * it would send the write out on the user's Nuxeo session, past a gate that is
 * not bypassed so much as absent from that path, with the gateway holding no
 * record it happened (ADR 001; `docs/generative-ui-readiness.md`).
 *
 * **It is a new component rather than an extraction, and that was the cheaper
 * honest option** — the same call stage 1 made for the read-only card. The
 * metadata surface this application already has is entangled inside edit dialogs
 * and inside `document-detail` (3,962 lines against twenty injected services);
 * neither travels, and neither is shaped like something that emits its values
 * instead of applying them.
 *
 * **What it deliberately does not decide.** Which fields exist, which are
 * writable, and what they currently hold all come from the declaration, which
 * comes from the tool's own registration and from Nuxeo read as the caller.
 * `required` and `maxLength` are re-checked here as a courtesy so the user is
 * told before a round trip, and are enforced server-side regardless — this
 * component being wrong could waste a request, and could not widen a write.
 */
@Component({
  selector: 'lib-document-metadata-form',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './document-metadata-form.component.html',
  styleUrl: './document-metadata-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentMetadataFormComponent {
  readonly target = input.required<AgentFormTarget>();
  readonly title = input.required<string>();
  readonly submitLabel = input.required<string>();
  readonly fields = input.required<readonly AgentFormField[]>();

  /** The values the user typed. The panel turns this into the `resume` payload. */
  readonly submitted = output<AgentFormSubmission>();
  /** The user backed out. Answered as a decline, so nothing is written. */
  readonly cancelled = output<void>();

  /**
   * Edits the user has made, by field name. Absent means untouched, which is
   * different from cleared: an untouched field submits the value the form
   * displayed, and a cleared one submits null.
   */
  private readonly edits = signal<Readonly<Record<string, string>>>({});
  /** True once a submit has been attempted, so problems are not shown while typing. */
  readonly showProblems = signal(false);
  /** True once submitted, so the controls stop accepting a second answer. */
  readonly sent = signal(false);

  /**
   * What the target is called.
   *
   * **An unresolved target renders as the bare uid**, never as a label from the
   * arguments and never as anything the model supplied. `title` is present only
   * when Nuxeo answered for this caller, so its absence means the document could
   * not be read — and a wrong name on the affordance authorising a write to it is
   * worse than an unfriendly one (ADR 001).
   */
  readonly targetLabel = computed(() => this.target().title ?? this.target().uid);

  /** True when the label is a real title, so the uid is worth printing beneath it. */
  readonly targetResolved = computed(() => this.target().title !== undefined);

  readonly rows = computed<MetadataFormRow[]>(() => {
    const edits = this.edits();
    const check = this.showProblems();
    return this.fields().map((field) => {
      const text = Object.prototype.hasOwnProperty.call(edits, field.name)
        ? edits[field.name]
        : displayText(field.value);
      return {
        field,
        text,
        checked: text === 'true',
        problem: check ? problemWith(field, text) : '',
      };
    });
  });

  readonly editableRows = computed(() => this.rows().filter((row) => row.field.editable));
  readonly readOnlyRows = computed(() => this.rows().filter((row) => !row.field.editable));

  /**
   * Whether the model authored any of the values on screen.
   *
   * Worth saying once above the form rather than only per field: the user is
   * reviewing a suggestion, and that changes what reading it carefully means.
   */
  readonly hasProposedValues = computed(() =>
    this.fields().some((field) => field.source === 'proposed'),
  );

  /**
   * Whether the model authored a value on a row the user cannot edit.
   *
   * The case the per-field badge alone under-serves. `source` is set from whether the
   * write's arguments mentioned the field, independently of whether it is editable, so
   * a model naming `dc:creator` gets its own string rendered in the block a reader
   * takes for the document's current state — and `updateMetadata` declares three
   * display-only fields, so the shape is reachable rather than hypothetical.
   *
   * An editable row's proposal can be checked by reading the control next to it. These
   * rows have no control, which is exactly why they need saying out loud. Nothing is
   * written either way; the overlay drops non-editable fields server-side.
   */
  readonly hasProposedReadOnlyValues = computed(() =>
    this.fields().some((field) => !field.editable && field.source === 'proposed'),
  );

  edit(name: string, text: string): void {
    this.edits.update((current) => ({ ...current, [name]: text }));
  }

  editBoolean(name: string, checked: boolean): void {
    this.edit(name, checked ? 'true' : 'false');
  }

  /**
   * Emits the editable fields, typed as each one declared.
   *
   * Only editable fields are sent. The gateway drops a display-only field however
   * it is submitted, so including them would be sending values that cannot be
   * written — and a submission that carries a field the user could not change
   * reads, to anyone auditing the request, as though they had.
   */
  submit(): void {
    if (this.sent()) return;
    this.showProblems.set(true);
    const rows = this.editableRows();
    if (rows.some((row) => problemWith(row.field, row.text))) return;

    const fields: Record<string, AgentFormValue> = {};
    for (const row of rows) fields[row.field.name] = submittedValue(row.field, row.text);
    this.sent.set(true);
    this.submitted.emit(fields);
  }

  cancel(): void {
    if (this.sent()) return;
    this.sent.set(true);
    this.cancelled.emit();
  }
}

/** How a declared value is shown in a control. `null` is an empty control. */
function displayText(value: AgentFormValue): string {
  if (value === null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  return value;
}

/**
 * One control's value, typed as the field declared.
 *
 * The empty string becomes `null` rather than `0` or `""`, because a user
 * clearing a field means "no value" — and the gateway distinguishes a submitted
 * null (which it checks against `required`) from an unsubmitted field (which
 * keeps what the interrupt held).
 */
function submittedValue(field: AgentFormField, text: string): AgentFormValue {
  switch (field.type) {
    case 'boolean':
      return text === 'true';
    case 'number': {
      if (text.trim() === '') return null;
      const parsed = Number(text);
      // Unreachable through the UI: `problemWith` refuses a non-numeric string
      // before this runs, and the control is `type="number"`. Kept because
      // returning `NaN` here would serialise as `null` and write silently.
      return Number.isFinite(parsed) ? parsed : null;
    }
    default:
      return text === '' ? null : text;
  }
}

/**
 * Why this value cannot be submitted, or the empty string.
 *
 * A courtesy check, not the enforcement: `interrupt-forms.ts` re-checks every one
 * of these server-side whatever the browser does. The wording is the user's, and
 * deliberately does not echo the value back.
 */
function problemWith(field: AgentFormField, text: string): string {
  const empty = text.trim() === '';
  if (field.required && empty && field.type !== 'boolean') {
    return `${field.label} is required.`;
  }
  if (field.maxLength !== undefined && text.length > field.maxLength) {
    return `${field.label} is longer than ${field.maxLength} characters.`;
  }
  if (field.type === 'number' && !empty && !Number.isFinite(Number(text))) {
    return `${field.label} must be a number.`;
  }
  if (field.type === 'date' && !empty && Number.isNaN(Date.parse(text))) {
    return `${field.label} must be a date.`;
  }
  return '';
}
