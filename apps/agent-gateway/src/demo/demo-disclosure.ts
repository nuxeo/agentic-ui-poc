import type { AgentRuntimeDemoScript } from '../http/capabilities';
import { requiresJustification, type DemoScript, type DemoToolCallStep } from './demo-script.types';

/**
 * Turns the scripts into the disclosure published by `GET /agent/capabilities` and
 * printed at startup.
 *
 * The provenance in the probe is derived from the same declarations
 * `validateDemoScripts` checks against the live registry, so the published claim
 * about what is real cannot drift from what the tools actually do. That is the point
 * of publishing it at all: the runbook, the log line and the HTTP probe are three
 * renderings of one checked fact, not three prose descriptions that have to be kept
 * in step by hand.
 */
export function describeDemoScripts(
  scripts: readonly DemoScript[],
): readonly AgentRuntimeDemoScript[] {
  return scripts.map((script) => ({
    id: script.id,
    prompt: script.prompt,
    demonstrates: script.demonstrates,
    data: dataProvenance(script),
  }));
}

function stepsOf(script: DemoScript): DemoToolCallStep[] {
  return script.turns.flatMap((turn) =>
    (turn.ifDeclined ? [turn, turn.ifDeclined] : [turn]).flatMap((body) =>
      body.toolCall ? [body.toolCall] : [],
    ),
  );
}

function dataProvenance(script: DemoScript): Record<string, string> {
  const data: Record<string, string> = {};
  for (const step of stepsOf(script)) {
    data[step.name] =
      requiresJustification(step.provenance) && step.why
        ? `${step.provenance} — ${step.why}`
        : step.provenance;
  }
  return data;
}

/**
 * The calls that do not carry real data — `hybrid` and `canned` only.
 *
 * A `frontend` call is deliberately not in here. It is the genuine
 * human-in-the-loop mechanism handing the run to the browser, and listing it as
 * "not real" would train the operator to discount the one part of the approval
 * flow that is entirely real.
 */
function substitutedSteps(script: DemoScript): DemoToolCallStep[] {
  return stepsOf(script).filter((step) => requiresJustification(step.provenance));
}

/**
 * The startup banner.
 *
 * Loud, multi-line and unmissable, because the alternative failure mode is somebody
 * scrolling past one grey `mode=demo` line and believing a scripted answer. It also
 * names every non-real tool call, so the operator knows what is fabricated before
 * the first question is asked rather than after.
 */
export function demoStartupBanner(scripts: readonly DemoScript[], port: number): string[] {
  const lines = [
    '',
    '='.repeat(78),
    '  SCRIPTED DEMO MODE — NO LANGUAGE MODEL IS CALLED',
    '='.repeat(78),
    '  Assistant text is a fixed transcript. Tool calls run for real against the',
    '  configured Nuxeo as the signed-in caller, except where listed below.',
    '',
  ];

  for (const script of scripts) {
    lines.push(`  ${script.id}  —  "${script.prompt}"`);
    for (const step of substitutedSteps(script)) {
      lines.push(`      NOT REAL  ${step.name} (${step.provenance}): ${step.why ?? ''}`);
    }
  }

  lines.push('', `  Listening on http://localhost:${port}`, '='.repeat(78), '');
  return lines;
}
