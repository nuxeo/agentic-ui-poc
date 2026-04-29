import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, catchError, forkJoin, of, switchMap, timer } from 'rxjs';

import {
  KdClientService,
  KdDiscoveryError,
  type KdAgentDetails,
  type KdAgentSummary,
  type KdAnswerResponse,
  type KdFeedbackValue,
  type KdGuardrail,
  type KdModelInfo,
  type KdQuestionHistoryItem,
} from '@agentic-ui/shared/kd-client';

/**
 * Consumer-facing Knowledge Discovery page.
 *
 * Agent management (create/edit/delete) deliberately lives outside of this
 * app: the Hyland Content Intelligence Connector exposes only read/invoke
 * operations (no CRUD) and the upstream Discovery API rejects agent create
 * requests over the connector's auth. Users manage agents in the Hyland
 * Insight admin UI; we just pick one, ask questions, and render the answer.
 */
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
    MatTooltipModule,
  ],
  templateUrl: './knowledge-discovery.html',
  styleUrl: './knowledge-discovery.scss',
})
export class KnowledgeDiscoveryComponent {
  private readonly kdClient = inject(KdClientService);
  private readonly destroyRef = inject(DestroyRef);
  private answerPollSub: Subscription | null = null;
  private readonly insufficientAnswerText =
    "I don't have enough information to answer this question";

  readonly loadingAgents = signal(false);
  readonly agentsError = signal<string | null>(null);
  readonly agents = signal<KdAgentSummary[]>([]);
  readonly selectedAgentId = signal<string | null>(null);
  readonly selectedAgent = signal<KdAgentDetails | null>(null);
  readonly loadingAgentDetails = signal(false);
  readonly agentDetailsError = signal<string | null>(null);
  readonly models = signal<KdModelInfo[]>([]);
  readonly guardrailGroups = signal<
    { displayName: string; description: string; guardrails: KdGuardrail[] }[]
  >([]);
  readonly loadingReferenceData = signal(false);
  readonly referenceDataError = signal<string | null>(null);

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
  readonly isAwaitingResponse = computed(() => this.submittingQuestion() || this.pollingAnswer());
  readonly loadingTitle = computed(() =>
    this.submittingQuestion() ? 'Submitting your question' : 'Generating answer',
  );
  readonly loadingMessage = computed(() =>
    this.submittingQuestion()
      ? 'Sending the request to Knowledge Discovery.'
      : 'Searching the selected agent and gathering grounded citations.',
  );
  readonly canAsk = computed(
    () =>
      this.hasSelection() && this.questionText().trim().length > 0 && !this.isAwaitingResponse(),
  );

  /**
   * The Discovery API only accepts a `dynamicFilter` on agents that were
   * configured with a `dynamicFilterTemplate`. Sending one on an agent
   * without a template comes back as a hard 400 Bad Request. We therefore
   * only show the Advanced Filter field when the selected agent declares a
   * template.
   */
  readonly agentSupportsDynamicFilter = computed(() => {
    const template = this.selectedAgent()?.dynamicFilterTemplate;
    return template !== null && template !== undefined;
  });

  constructor() {
    this.loadReferenceData();
    this.loadAgents();
  }

  loadReferenceData(): void {
    this.loadingReferenceData.set(true);
    this.referenceDataError.set(null);

    forkJoin({
      models: this.kdClient.listModels(),
      guardrails: this.kdClient.listGuardrails(),
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
    this.agentDetailsError.set(null);

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
          this.agentDetailsError.set(err?.error?.detail ?? 'Failed to load agent details.');
          this.loadingAgentDetails.set(false);
        },
      });
  }

  submitQuestion(): void {
    const agentId = this.selectedAgentId();
    const question = this.questionText().trim();
    if (!agentId || !question) return;

    let dynamicFilter: Record<string, unknown> | null = null;
    if (this.agentSupportsDynamicFilter()) {
      try {
        dynamicFilter = this.parseJsonText(this.dynamicFilterText(), 'dynamic filter');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Dynamic filter JSON is invalid.';
        this.questionError.set(message);
        return;
      }
    }

    this.submittingQuestion.set(true);
    this.questionError.set(null);
    this.answer.set(null);

    this.kdClient
      .submitQuestion({ agentId, question, dynamicFilter })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.activeQuestionId.set(result.questionId);

          const terminalStatuses: KdAnswerResponse['status'][] = ['Complete', 'Error', 'Blocked'];
          if (terminalStatuses.includes(result.status)) {
            this.kdClient
              .getAnswer(result.questionId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (answer) => {
                  this.submittingQuestion.set(false);
                  this.answer.set(answer);
                  if (this.selectedAgentId()) {
                    this.loadHistory(this.selectedAgentId() ?? '');
                  }
                },
                error: (err) => {
                  this.submittingQuestion.set(false);
                  this.questionError.set(
                    this.resolveQuestionError(
                      err,
                      'Failed to retrieve the Knowledge Discovery answer.',
                    ),
                  );
                },
              });
            return;
          }

          this.submittingQuestion.set(false);
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
            this.resolveQuestionError(err, 'Failed to submit the Knowledge Discovery question.'),
          );
          this.submittingQuestion.set(false);
        },
      });
  }

  /**
   * Format an error coming back from `KdClientService.submitQuestion`.
   * A 400 on a `dynamicFilter` payload is almost always the template
   * mismatch diagnosed in [docs/knowledge-discovery.md]; we surface that
   * as a targeted hint instead of the generic upstream message.
   */
  private resolveQuestionError(err: unknown, fallback: string): string {
    if (err instanceof KdDiscoveryError) {
      if (err.responseCode === 400) {
        if (this.dynamicFilterText().trim().length > 0) {
          return (
            'The Discovery service rejected the dynamic filter (HTTP 400). ' +
            "Make sure the selected agent has a compatible 'dynamicFilterTemplate' " +
            'configured in Hyland Insight — or clear the filter to ask without it.'
          );
        }
        const agent = this.selectedAgent();
        const model = this.models().find((entry) => entry.modelName === agent?.modelName);
        if (model && model.status && model.status !== 'Active') {
          const replacement = model.replacementModelName
            ? ` Replacement suggested by the catalogue: ${model.replacementModelName}.`
            : '';
          return (
            `The Discovery service rejected the question (HTTP 400). The agent's model ` +
            `'${agent?.modelName}' is marked '${model.status}' on this tenant.` +
            replacement +
            ' Update the agent in Hyland Insight and pick an Active model.'
          );
        }
      }
      return err.message;
    }
    const maybeDetail = (err as { error?: { detail?: string }; message?: string } | null)?.error
      ?.detail;
    const maybeMessage = (err as { message?: string } | null)?.message;
    return maybeDetail ?? maybeMessage ?? fallback;
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

  formatAnswerText(answer: string): string {
    const cleaned = answer.replace(/^#{1,6}\s*/gm, '').trim();
    if (!cleaned) return '';
    if (cleaned.toLowerCase() === this.insufficientAnswerText.toLowerCase()) {
      return "I couldn't find enough relevant information in this agent's knowledge base to answer that yet.";
    }
    return cleaned;
  }

  private parseJsonText(value: string, label: string): Record<string, unknown> | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(`The ${label} must be valid JSON.`);
    }

    if (parsed === null) return null;
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`The ${label} must be a JSON object.`);
    }
    return parsed as Record<string, unknown>;
  }
}
