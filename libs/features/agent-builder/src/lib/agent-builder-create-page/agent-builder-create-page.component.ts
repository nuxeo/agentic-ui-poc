import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { finalize } from 'rxjs';

import { AbClientService, AbClientError } from '@agentic-ui/shared/ab-client';

@Component({
  selector: 'lib-agent-builder-create-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './agent-builder-create-page.component.html',
  styleUrl: './agent-builder-create-page.component.scss',
})
export class AgentBuilderCreatePageComponent {
  private static readonly FALLBACK_MODELS: Array<{ id: string; label: string }> = [
    {
      id: 'anthropic.claude-sonnet-4-5-20250929-v1:0',
      label: 'Claude Sonnet 4.5',
    },
    {
      id: 'anthropic.claude-sonnet-4-20250514-v1:0',
      label: 'Claude 4 Sonnet',
    },
    {
      id: 'amazon.nova-micro-v1:0',
      label: 'Amazon Nova Micro',
    },
    {
      id: 'anthropic.claude-haiku-4-5-20251001-v1:0',
      label: 'Claude Haiku 4.5',
    },
    {
      id: 'amazon.nova-lite-v1:0',
      label: 'Amazon Nova Lite',
    },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly ab = inject(AbClientService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly modelsLoading = signal(false);
  readonly models = signal<Array<{ id: string; label: string }>>([]);
  readonly submitting = signal(false);
  readonly inputDialogOpen = signal(false);
  readonly outcomeDialogOpen = signal(false);

  readonly inputTypes = ['string', 'number', 'boolean'] as const;
  readonly outcomeTypes = ['string', 'number', 'boolean', 'object'] as const;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(200)]],
    modelId: ['', [Validators.required, Validators.maxLength(200)]],
    systemPrompt: ['', [Validators.maxLength(16_000)]],
    inputs: this.fb.array<FormGroup>([]),
    outcomes: this.fb.array<FormGroup>([]),
  });
  readonly inputDraftForm = this.inputGroup();
  readonly outcomeDraftForm = this.outcomeGroup();

  constructor() {
    this.loadModels();
  }

  get inputs(): FormArray<FormGroup> {
    return this.form.controls.inputs as FormArray<FormGroup>;
  }

  get outcomes(): FormArray<FormGroup> {
    return this.form.controls.outcomes as FormArray<FormGroup>;
  }

  private inputGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      type: ['string', Validators.required],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  private outcomeGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      type: ['number', Validators.required],
      description: ['', [Validators.maxLength(500)]],
      required: [false],
    });
  }

  addInput(): void {
    this.inputDraftForm.reset({
      name: '',
      type: 'string',
      description: '',
    });
    this.inputDialogOpen.set(true);
  }

  removeInput(index: number): void {
    this.inputs.removeAt(index);
  }

  addOutcome(): void {
    this.outcomeDraftForm.reset({
      name: '',
      type: 'number',
      description: '',
      required: false,
    });
    this.outcomeDialogOpen.set(true);
  }

  removeOutcome(index: number): void {
    this.outcomes.removeAt(index);
  }

  closeInputDialog(): void {
    this.inputDialogOpen.set(false);
  }

  saveInput(): void {
    if (this.inputDraftForm.invalid) {
      this.inputDraftForm.markAllAsTouched();
      return;
    }
    this.inputs.push(this.inputGroup());
    this.inputs.at(this.inputs.length - 1).patchValue(this.inputDraftForm.getRawValue());
    this.inputDialogOpen.set(false);
  }

  closeOutcomeDialog(): void {
    this.outcomeDialogOpen.set(false);
  }

  saveOutcome(): void {
    if (this.outcomeDraftForm.invalid) {
      this.outcomeDraftForm.markAllAsTouched();
      return;
    }
    this.outcomes.push(this.outcomeGroup());
    this.outcomes.at(this.outcomes.length - 1).patchValue(this.outcomeDraftForm.getRawValue());
    this.outcomeDialogOpen.set(false);
  }

  private loadModels(): void {
    this.modelsLoading.set(true);
    this.ab
      .listModels()
      .pipe(
        finalize(() => this.modelsLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          const mapped = rows
            .map((m) => {
              const id = m.id ?? '';
              if (!id) return null;
              const label = m.displayName?.trim() || m.name?.trim() || id;
              return { id, label };
            })
            .filter((x): x is { id: string; label: string } => x !== null);
          this.models.set(mapped.length ? mapped : AgentBuilderCreatePageComponent.FALLBACK_MODELS);
        },
        error: () => {
          this.models.set(AgentBuilderCreatePageComponent.FALLBACK_MODELS);
        },
      });
  }

  onTestClick(): void {
    this.snackBar.open(
      'Test is not wired in this shell. Deploy saves the agent via the connector.',
      'Dismiss',
      { duration: 6000 },
    );
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description, modelId, systemPrompt } = this.form.getRawValue();

    const config: Record<string, unknown> = {};
    const mid = modelId.trim();
    if (mid) config['llmModelId'] = mid;
    const sp = systemPrompt.trim();
    if (sp) config['systemPrompt'] = sp;

    const inputRows = this.inputs.getRawValue() as Array<{
      name: string;
      type: string;
      description: string;
    }>;
    const inputsPayload = inputRows
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        type: r.type,
        description: (r.description ?? '').trim(),
      }));
    if (inputsPayload.length) config['inputs'] = inputsPayload;

    const outcomeRows = this.outcomes.getRawValue() as Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
    }>;
    const outcomesPayload = outcomeRows
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        type: r.type,
        description: (r.description ?? '').trim(),
        required: !!r.required,
      }));
    if (outcomesPayload.length) config['outcomes'] = outcomesPayload;

    this.submitting.set(true);
    this.ab
      .createAgent({
        name: name.trim(),
        description: description.trim(),
        agentType: 'assistant',
        config,
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Agent deployed.', 'Dismiss', { duration: 4000 });
          void this.router.navigate(['/agent-builder/agents']);
        },
        error: (err) => {
          const msg =
            err instanceof AbClientError
              ? err.message
              : ((err as { error?: { responseMessage?: string } })?.error?.responseMessage ??
                'Failed to create agent.');
          this.snackBar.open(msg, 'Dismiss', { duration: 8000 });
        },
      });
  }
}
