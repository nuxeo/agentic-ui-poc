import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, catchError, forkJoin, of, switchMap, timer } from 'rxjs';

import {
  KdClientService,
  type KdAgentDetails,
  type KdAgentSummary,
  type KdAgentUpsertRequest,
  type KdAnswerResponse,
  type KdFeedbackValue,
  type KdGuardrail,
  type KdModelInfo,
  type KdQuestionHistoryItem,
} from '@agentic-ui/shared/kd-client';

import {
  KD_AGENT_DIALOG_OPTIONS,
  KdAgentDialogComponent,
  type KdAgentDialogData,
} from '../kd-agent-dialog/kd-agent-dialog';

@Component({
  selector: 'lib-knowledge-discovery',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './knowledge-discovery.html',
  styleUrl: './knowledge-discovery.scss',
})
export class KnowledgeDiscoveryComponent {
  private readonly kdClient = inject(KdClientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private answerPollSub: Subscription | null = null;

  readonly loadingAgents = signal(false);
  readonly agentsError = signal<string | null>(null);
  readonly agents = signal<KdAgentSummary[]>([]);
  readonly selectedAgentId = signal<string | null>(null);
  readonly selectedAgent = signal<KdAgentDetails | null>(null);
  readonly loadingAgentDetails = signal(false);
  readonly models = signal<KdModelInfo[]>([]);
  readonly guardrailGroups = signal<
    { displayName: string; description: string; guardrails: KdGuardrail[] }[]
  >([]);
  readonly loadingReferenceData = signal(false);
  readonly referenceDataError = signal<string | null>(null);

  readonly savingAgent = signal(false);
  readonly deletingAgent = signal(false);
  readonly agentActionError = signal<string | null>(null);

  readonly questionText = signal('');
  readonly dynamicFilterText = signal('');
  readonly questionError = signal<string | null>(null);
  readonly submittingQuestion = signal(false);
  readonly activeQuestionId = signal<string | null>(null);
  readonly answer = signal<KdAnswerResponse | null>(null);
  readonly pollingAnswer = signal(false);
  readonly feedbackInFlight = signal<KdFeedbackValue | null>(null);

  readonly history = signal<KdQuestionHistoryItem[]>([]);
  readonly loadingHistory = signal(false);

  readonly hasSelection = computed(() => this.selectedAgentId() !== null);
  readonly canAsk = computed(
    () =>
      this.hasSelection() && this.questionText().trim().length > 0 && !this.submittingQuestion(),
  );

  constructor() {
    this.loadReferenceData();
    this.loadAgents();
  }

  loadReferenceData(): void {
    this.loadingReferenceData.set(true);
    this.referenceDataError.set(null);

    forkJoin({
      models: this.kdClient.listModels().pipe(catchError(() => of([] as KdModelInfo[]))),
      guardrails: this.kdClient.listGuardrails().pipe(
        catchError(() =>
          of({
            guardrailGroups: [] as {
              displayName: string;
              description: string;
              guardrails: KdGuardrail[];
            }[],
          }),
        ),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ models, guardrails }) => {
          this.models.set(models);
          this.guardrailGroups.set(guardrails.guardrailGroups);
          this.loadingReferenceData.set(false);
        },
        error: () => {
          this.referenceDataError.set('Failed to load Knowledge Discovery models and guardrails.');
          this.loadingReferenceData.set(false);
        },
      });
  }

  loadAgents(selectAgentId?: string): void {
    this.loadingAgents.set(true);
    this.agentsError.set(null);

    this.kdClient
      .listAgents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agents) => {
          this.agents.set(agents);
          this.loadingAgents.set(false);

          const nextAgentId = selectAgentId ?? this.selectedAgentId() ?? agents[0]?.id ?? null;
          if (nextAgentId) {
            this.selectAgent(nextAgentId);
          }
        },
        error: (err) => {
          this.agentsError.set(err?.error?.detail ?? 'Failed to load Knowledge Discovery agents.');
          this.loadingAgents.set(false);
        },
      });
  }

  selectAgent(agentId: string): void {
    this.stopAnswerPolling();
    this.selectedAgentId.set(agentId);
    this.loadingAgentDetails.set(true);
    this.agentActionError.set(null);

    this.kdClient
      .getAgent(agentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agent) => {
          this.selectedAgent.set(agent);
          this.loadingAgentDetails.set(false);
          this.loadHistory(agent.id);
        },
        error: (err) => {
          this.agentActionError.set(err?.error?.detail ?? 'Failed to load agent details.');
          this.loadingAgentDetails.set(false);
        },
      });
  }

  openCreateAgentDialog(): void {
    this.openAgentDialog(null);
  }

  openEditAgentDialog(): void {
    const agent = this.selectedAgent();
    if (!agent) return;
    this.openAgentDialog(agent);
  }

  private openAgentDialog(agent: KdAgentDetails | null): void {
    const data: KdAgentDialogData = {
      agent,
      models: this.models(),
      guardrailGroups: this.guardrailGroups(),
    };

    this.dialog
      .open<KdAgentDialogComponent, KdAgentDialogData, KdAgentUpsertRequest | undefined>(
        KdAgentDialogComponent,
        {
          ...KD_AGENT_DIALOG_OPTIONS,
          data,
        },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        if (!payload) return;
        this.saveAgent(payload, agent?.id ?? null);
      });
  }

  private saveAgent(payload: KdAgentUpsertRequest, existingId: string | null): void {
    this.savingAgent.set(true);
    this.agentActionError.set(null);

    const request$ = existingId
      ? this.kdClient.updateAgent(existingId, payload)
      : this.kdClient.createAgent(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (agent) => {
        this.savingAgent.set(false);
        this.snackBar.open(`Agent "${agent.name}" saved.`, 'OK', { duration: 3000 });
        this.loadAgents(agent.id);
      },
      error: (err) => {
        const message = err?.error?.detail ?? 'Failed to save the Knowledge Discovery agent.';
        this.agentActionError.set(message);
        this.savingAgent.set(false);
        this.snackBar.open(message, 'Dismiss', { duration: 5000 });
      },
    });
  }

  deleteAgent(): void {
    const agentId = this.selectedAgentId();
    if (!agentId) return;

    this.deletingAgent.set(true);
    this.kdClient
      .deleteAgent(agentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.stopAnswerPolling();
          this.snackBar.open('Agent deleted.', 'OK', { duration: 3000 });
          this.deletingAgent.set(false);
          this.selectedAgentId.set(null);
          this.selectedAgent.set(null);
          this.history.set([]);
          this.answer.set(null);
          this.loadAgents();
        },
        error: (err) => {
          this.agentActionError.set(err?.error?.detail ?? 'Failed to delete the selected agent.');
          this.deletingAgent.set(false);
        },
      });
  }

  submitQuestion(): void {
    const agentId = this.selectedAgentId();
    const question = this.questionText().trim();
    if (!agentId || !question) return;

    let dynamicFilter: Record<string, unknown> | null = null;
    try {
      dynamicFilter = this.parseJsonText(this.dynamicFilterText(), 'dynamic filter');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Dynamic filter JSON is invalid.';
      this.questionError.set(message);
      return;
    }

    this.submittingQuestion.set(true);
    this.questionError.set(null);
    this.answer.set(null);

    this.kdClient
      .submitQuestion({ agentId, question, dynamicFilter })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.submittingQuestion.set(false);
          this.activeQuestionId.set(result.questionId);

          const terminalStatuses: KdAnswerResponse['status'][] = ['Complete', 'Error', 'Blocked'];
          if (terminalStatuses.includes(result.status)) {
            this.kdClient
              .getAnswer(result.questionId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (answer) => {
                  this.answer.set(answer);
                  if (this.selectedAgentId()) {
                    this.loadHistory(this.selectedAgentId() ?? '');
                  }
                },
                error: (err) => {
                  this.questionError.set(
                    err?.error?.detail ?? 'Failed to retrieve the Knowledge Discovery answer.',
                  );
                },
              });
            return;
          }

          this.answer.set({
            questionId: result.questionId,
            agentId,
            question,
            status: result.status,
            answer: '',
            citations: [],
          });
          this.pollForAnswer(result.questionId);
        },
        error: (err) => {
          this.questionError.set(
            err?.error?.detail ?? 'Failed to submit the Knowledge Discovery question.',
          );
          this.submittingQuestion.set(false);
        },
      });
  }

  submitFeedback(feedback: KdFeedbackValue): void {
    const questionId = this.activeQuestionId();
    if (!questionId) return;

    this.feedbackInFlight.set(feedback);
    this.kdClient
      .submitFeedback(questionId, { feedback })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.feedbackInFlight.set(null);
          this.answer.update((current) => (current ? { ...current, feedback } : current));
          if (this.selectedAgentId()) {
            this.loadHistory(this.selectedAgentId() ?? '');
          }
        },
        error: () => {
          this.feedbackInFlight.set(null);
          this.questionError.set('Failed to submit Knowledge Discovery feedback.');
        },
      });
  }

  loadHistory(agentId: string): void {
    this.loadingHistory.set(true);
    this.kdClient
      .getQuestionHistory(agentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          this.history.set(history.data);
          this.loadingHistory.set(false);
        },
        error: () => {
          this.loadingHistory.set(false);
          this.history.set([]);
        },
      });
  }

  private pollForAnswer(questionId: string): void {
    this.stopAnswerPolling();
    this.pollingAnswer.set(true);

    this.answerPollSub = timer(0, 1500)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() =>
          this.kdClient.getAnswer(questionId).pipe(
            catchError((err) => {
              this.questionError.set(
                err?.error?.detail ?? 'Failed to retrieve the Knowledge Discovery answer.',
              );
              this.pollingAnswer.set(false);
              return of(null);
            }),
          ),
        ),
      )
      .subscribe((answer) => {
        if (!answer) return;

        this.answer.set(answer);
        if (['Complete', 'Error', 'Blocked'].includes(answer.status)) {
          this.pollingAnswer.set(false);
          this.stopAnswerPolling();
          if (this.selectedAgentId()) {
            this.loadHistory(this.selectedAgentId() ?? '');
          }
        }
      });
  }

  private stopAnswerPolling(): void {
    this.answerPollSub?.unsubscribe();
    this.answerPollSub = null;
    this.pollingAnswer.set(false);
  }

  private parseJsonText(value: string, label: string): Record<string, unknown> | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed === null) return null;
      if (typeof parsed !== 'object') {
        throw new Error(`The ${label} must be a JSON object or array.`);
      }
      return parsed as Record<string, unknown>;
    } catch {
      throw new Error(`The ${label} must be valid JSON.`);
    }
  }
}
