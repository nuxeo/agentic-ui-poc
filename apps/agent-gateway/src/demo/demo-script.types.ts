/**
 * The demo script format.
 *
 * A script is a transcript the gateway replays instead of calling a model. Every
 * other part of the run is the real thing: the real `runAgent` loop, the real
 * AG-UI framing, the real interrupt mechanism, and — where a turn calls a tool the
 * registry owns — the real tool executing against the real Nuxeo as the real
 * signed-in caller. Only the model is replaced.
 *
 * ---
 *
 * ## The honesty rules, which are the point of this file
 *
 * A demo that invents a document title is worse than no demo: it is a claim about
 * the audience's own repository that anybody in the room can check. Two rules make
 * fabrication visible rather than possible-but-discouraged.
 *
 * **1. Every tool call declares where its data comes from, and the declaration is
 * verified against the registry.** `validateDemoScripts` fails if a step claims
 * `real-nuxeo` for a tool the demo registry has replaced, or claims `canned` for
 * one it has not. The two cannot drift, because neither side is the source of
 * truth on its own — they have to agree.
 *
 * **2. Scripted prose describes method, never findings.** A turn's `text` may say
 * what the agent is doing and why; it may not assert what it found. "I searched
 * for the most recently modified documents — the tool card shows what came back"
 * is allowed. "I found three contracts, the newest is the Acme MSA" is not, because
 * the script cannot know that and would be lying whenever it is wrong. Only tool
 * cards and citations, which carry live data, assert facts about content. This one
 * cannot be machine-checked in full, so it is stated here and asserted in review.
 * What *is* checked: a turn that leans on a tool result must name it in `factsFrom`,
 * and `validateDemoScripts` rejects a `factsFrom` that does not match a call the
 * script actually made earlier. Prose about a result that was never fetched is
 * therefore a startup failure rather than a reviewer's catch.
 */

/** Where the data in a tool result actually came from. */
export type DemoDataProvenance =
  /** The shipped tool ran, unmodified, against the configured Nuxeo as the caller. */
  | 'real-nuxeo'
  /** A browser-executed tool. The real human-in-the-loop mechanism; carries no data at all. */
  | 'frontend'
  /** A demo replacement whose facts are read live from Nuxeo but whose narration is scripted. */
  | 'hybrid'
  /** Fully fabricated. Only for operations that would write, or that need software this instance lacks. */
  | 'canned';

/** True for the provenances that are a departure from real data and so need a stated reason. */
export function requiresJustification(provenance: DemoDataProvenance): boolean {
  return provenance === 'hybrid' || provenance === 'canned';
}

/**
 * Facts a later turn may compute its tool arguments from: the results of tool calls
 * already made in this conversation, keyed by `toolCallId`, parsed from the tool
 * messages the loop fed back.
 *
 * This is what lets a scripted plan act on data it could not know in advance — the
 * second step reads a uid out of the first step's *real* search result rather than
 * hard-coding one that would only exist on one machine.
 */
export interface DemoFacts {
  readonly resultsByToolCallId: Readonly<Record<string, unknown>>;
  /** Results in the order the calls were made, for scripts that just want "the last one". */
  readonly results: readonly unknown[];
}

export interface DemoToolCallStep {
  /** Stable `toolCallId`. Scripts use readable ids because they show up in logs and frames. */
  readonly id: string;
  readonly name: string;
  /**
   * JSON argument string, or a function of the real results already in hand.
   *
   * Returning an empty string skips the call and lets the turn end as text. That is
   * the escape hatch for a step whose arguments depend on live data that turned out
   * not to exist — a repository with nothing in it should make the agent say so,
   * not make it call a tool with a missing uid and show an error card.
   */
  readonly args: string | ((facts: DemoFacts) => string);
  /**
   * Streamed in place of the call when `args` returns `''`. Required whenever `args`
   * is a function, because a computed argument set can always come back empty and
   * the alternative is an assistant turn with nothing in it.
   */
  readonly ifSkipped?: string;
  readonly provenance: DemoDataProvenance;
  /** Why this is not real. Required for `hybrid` and `canned`; rejected for `real-nuxeo`. */
  readonly why?: string;
  /** Argument chunks to split the stream into, so the card fills in progressively. Default 2. */
  readonly argChunks?: number;
}

export interface DemoThinkingStep {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
}

export interface DemoTurnBody {
  /** Thinking steps opened before this turn's text or tool call. */
  readonly thinking?: readonly DemoThinkingStep[];
  /**
   * Assistant prose, streamed token by token. Method, not findings — see the file
   * header.
   *
   * The function form exists for one honest purpose: a turn whose wording would be
   * wrong if the live tool result came back empty. "That is the live result above"
   * is a lie on an empty repository, so such a turn picks its sentence from the
   * facts instead of asserting one.
   */
  readonly text?: string | ((facts: DemoFacts) => string);
  readonly toolCall?: DemoToolCallStep;
  /**
   * The tool call whose live result this turn's prose refers to. Required by rule 2
   * for any turn that talks about a result, and validated against the calls the
   * script actually makes.
   */
  readonly factsFrom?: string;
  /** Extra pause before the turn starts, in milliseconds at speed 1. */
  readonly pauseMs?: number;
}

export interface DemoTurn extends DemoTurnBody {
  /**
   * Replayed instead of this turn when the user declined the preceding approval.
   * One level only: a declined branch cannot itself branch.
   */
  readonly ifDeclined?: DemoTurnBody;
}

export interface DemoScript {
  readonly id: string;
  /** The exact sentence the runbook tells the driver to type. Matched first, verbatim. */
  readonly prompt: string;
  /** Lower-cased substrings that also select this script, for a driver who paraphrases. */
  readonly triggers: readonly string[];
  /** One line for the probe and the startup log: what this beat is for. */
  readonly demonstrates: string;
  readonly turns: readonly DemoTurn[];
}

export class DemoScriptError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`Invalid demo script definitions:\n  - ${issues.join('\n  - ')}`);
    this.name = 'DemoScriptError';
  }
}

/** Resolves a tool name to how the composed registry will actually serve it. */
export type ProvenanceLookup = (toolName: string) => DemoDataProvenance | undefined;

/** Both bodies a turn can replay as. Mutually exclusive at runtime. */
function bodiesOf(turn: DemoTurn): DemoTurnBody[] {
  return turn.ifDeclined ? [turn, turn.ifDeclined] : [turn];
}

interface StepCheck {
  readonly scriptId: string;
  readonly step: DemoToolCallStep;
  readonly seenCallIds: Set<string>;
  readonly provenanceOf: ProvenanceLookup;
}

function collectStepIssues({ scriptId, step, seenCallIds, provenanceOf }: StepCheck): string[] {
  const issues: string[] = [];

  if (seenCallIds.has(step.id)) {
    issues.push(
      `Script "${scriptId}" reuses toolCallId "${step.id}". Ids must be unique per ` +
        `conversation or the client attaches two calls to one card.`,
    );
  }

  const actual = provenanceOf(step.name);
  if (actual === undefined) {
    issues.push(
      `Script "${scriptId}" calls "${step.name}", which the demo registry does not serve and ` +
        `which is not a declared frontend tool. An unknown name would be treated as a frontend ` +
        `tool and would end the run at that point.`,
    );
  } else if (actual !== step.provenance) {
    issues.push(
      `Script "${scriptId}" declares "${step.name}" as ${step.provenance}, but the demo ` +
        `registry serves it as ${actual}. The declaration is what the runbook and the ` +
        `capability probe publish, so a mismatch is a demo that misrepresents its data.`,
    );
  }

  if (!requiresJustification(step.provenance) && step.why) {
    issues.push(
      `Script "${scriptId}" gives a "why" for the ${step.provenance} call "${step.name}". ` +
        `"why" exists to justify not being real; a real call needs no excuse.`,
    );
  }
  if (typeof step.args === 'function' && !step.ifSkipped?.trim()) {
    issues.push(
      `Script "${scriptId}" computes the arguments for "${step.name}" from live data but gives ` +
        `no "ifSkipped" sentence. A computed argument set can come back empty, and a turn that ` +
        `then neither calls a tool nor says anything renders an empty bubble.`,
    );
  }

  if (requiresJustification(step.provenance) && !step.why?.trim()) {
    issues.push(
      `Script "${scriptId}" calls "${step.name}" as ${step.provenance} without a "why". ` +
        `Every departure from real data has to be justified in one sentence, because that ` +
        `sentence is what the runbook prints.`,
    );
  }

  return issues;
}

/**
 * Fails the process at startup on any script that could mislead.
 *
 * Called from the demo entry point before the port is bound, and again from the
 * spec suite, so a bad script is a startup failure rather than something a viewer
 * notices on a projector.
 */
export function validateDemoScripts(
  scripts: readonly DemoScript[],
  provenanceOf: ProvenanceLookup,
): void {
  const issues: string[] = [];
  const seenScriptIds = new Set<string>();

  for (const script of scripts) {
    if (seenScriptIds.has(script.id)) {
      issues.push(`Two scripts share the id "${script.id}".`);
    }
    seenScriptIds.add(script.id);

    if (!script.prompt.trim()) {
      issues.push(
        `Script "${script.id}" has no prompt, so the runbook cannot tell anyone to run it.`,
      );
    }
    if (script.turns.length === 0) {
      issues.push(`Script "${script.id}" has no turns.`);
    }

    const seenCallIds = new Set<string>();
    for (const turn of script.turns) {
      const bodies = bodiesOf(turn);

      // Both bodies are checked against the ids from *strictly earlier* turns,
      // before either of this turn's calls is recorded. That is what stops a
      // declined branch from describing the result of the write it declined.
      for (const body of bodies) {
        if (body.factsFrom && !seenCallIds.has(body.factsFrom)) {
          issues.push(
            `Script "${script.id}" has a turn citing facts from "${body.factsFrom}", which no ` +
              `earlier turn of the same branch calls. Prose about a result that was never ` +
              `fetched is exactly the fabrication the format exists to prevent.`,
          );
        }
      }

      for (const body of bodies) {
        if (!body.toolCall) continue;
        issues.push(
          ...collectStepIssues({
            scriptId: script.id,
            step: body.toolCall,
            seenCallIds,
            provenanceOf,
          }),
        );
        seenCallIds.add(body.toolCall.id);
      }
    }
  }

  if (issues.length > 0) throw new DemoScriptError(issues);
}
