import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import type {
  KdAgentDetails,
  KdAgentUpsertRequest,
  KdGuardrail,
  KdModelInfo,
} from '@agentic-ui/shared/kd-client';

export interface KdAgentDialogData {
  agent: KdAgentDetails | null;
  models: KdModelInfo[];
  guardrailGroups: { displayName: string; description: string; guardrails: KdGuardrail[] }[];
}

export const KD_AGENT_DIALOG_OPTIONS: Partial<MatDialogConfig> = {
  width: 'min(860px, 95vw)',
  maxWidth: '95vw',
  maxHeight: '90vh',
  autoFocus: 'first-tabbable',
  restoreFocus: true,
  panelClass: 'kd-agent-dialog-panel',
};

interface AgentFormState {
  name: string;
  description: string;
  modelName: string;
  instructions: string;
  sourceIdsText: string;
  accessRightsText: string;
  staticFilterText: string;
  dynamicFilterTemplateText: string;
  selectedGuardrailNames: string[];
  avatarUrl: string;
  agentType: string;
  knowledgeGraphDomainId: string;
}

const EMPTY_FORM: AgentFormState = {
  name: '',
  description: '',
  modelName: '',
  instructions: '',
  sourceIdsText: '',
  accessRightsText: '[]',
  staticFilterText: '',
  dynamicFilterTemplateText: '',
  selectedGuardrailNames: [],
  avatarUrl: '',
  agentType: 'standard',
  knowledgeGraphDomainId: '',
};

@Component({
  selector: 'lib-kd-agent-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './kd-agent-dialog.html',
  styleUrl: './kd-agent-dialog.scss',
})
export class KdAgentDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<KdAgentDialogComponent, KdAgentUpsertRequest | undefined>,
  );
  readonly data = inject<KdAgentDialogData>(MAT_DIALOG_DATA);

  readonly isEditing = !!this.data.agent;
  readonly form = signal<AgentFormState>(this.buildInitialForm());
  readonly error = signal<string | null>(null);

  readonly availableGuardrails = this.data.guardrailGroups.flatMap((group) => group.guardrails);
  readonly canSave = computed(() => {
    const state = this.form();
    return state.name.trim().length > 0 && state.modelName.trim().length > 0;
  });

  private buildInitialForm(): AgentFormState {
    const agent = this.data.agent;
    if (!agent) {
      return {
        ...EMPTY_FORM,
        modelName: this.data.models[0]?.name ?? '',
      };
    }

    return {
      name: agent.name,
      description: agent.description,
      modelName: agent.modelName,
      instructions: agent.instructions,
      sourceIdsText: agent.sourceIds.join(', '),
      accessRightsText: JSON.stringify(agent.accessRights ?? [], null, 2),
      staticFilterText: agent.staticFilterExpression
        ? JSON.stringify(agent.staticFilterExpression, null, 2)
        : '',
      dynamicFilterTemplateText: agent.dynamicFilterTemplate
        ? JSON.stringify(agent.dynamicFilterTemplate, null, 2)
        : '',
      selectedGuardrailNames: agent.guardrails.map((guardrail) => guardrail.name),
      avatarUrl: agent.avatarUrl ?? '',
      agentType: agent.agentType ?? 'standard',
      knowledgeGraphDomainId: agent.knowledgeGraphDomainId ?? '',
    };
  }

  update<K extends keyof AgentFormState>(key: K, value: AgentFormState[K]): void {
    this.form.update((state) => ({ ...state, [key]: value }));
  }

  isGuardrailSelected(name: string): boolean {
    return this.form().selectedGuardrailNames.includes(name);
  }

  toggleGuardrail(name: string): void {
    const current = new Set(this.form().selectedGuardrailNames);
    if (current.has(name)) {
      current.delete(name);
    } else {
      current.add(name);
    }
    this.update('selectedGuardrailNames', Array.from(current));
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  save(): void {
    if (!this.canSave()) {
      this.error.set('Name and model are required.');
      return;
    }

    try {
      const payload = this.buildPayload();
      this.dialogRef.close(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Agent configuration is invalid.';
      this.error.set(message);
    }
  }

  private buildPayload(): KdAgentUpsertRequest {
    const state = this.form();
    const accessRights = this.parseJsonText(state.accessRightsText, 'access rights');
    const staticFilterExpression = this.parseJsonText(
      state.staticFilterText,
      'static filter expression',
    );
    const dynamicFilterTemplate = this.parseJsonText(
      state.dynamicFilterTemplateText,
      'dynamic filter template',
    );

    return {
      name: state.name.trim(),
      description: state.description.trim(),
      modelName: state.modelName.trim(),
      instructions: state.instructions.trim(),
      sourceIds: this.parseList(state.sourceIdsText),
      accessRights: Array.isArray(accessRights)
        ? accessRights.map((item) => item as { type: string; id: string })
        : [],
      staticFilterExpression,
      dynamicFilterTemplate,
      guardrails: this.availableGuardrails.filter((guardrail) =>
        state.selectedGuardrailNames.includes(guardrail.name),
      ),
      avatarUrl: state.avatarUrl.trim(),
      agentType: state.agentType.trim() || 'standard',
      knowledgeGraphDomainId: state.knowledgeGraphDomainId.trim(),
    };
  }

  private parseList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
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
