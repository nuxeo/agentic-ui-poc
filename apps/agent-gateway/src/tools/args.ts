/**
 * Argument readers for tool inputs.
 *
 * Tool arguments arrive as JSON the model generated, so they are untrusted in the
 * ordinary sense — a missing field or a number where a string belongs is routine,
 * not exceptional. These readers turn that into one clear error the agent loop can
 * hand straight back to the model as a tool result, which is usually enough for it
 * to retry correctly.
 */

export class ToolArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolArgumentError';
  }
}

type Args = Record<string, unknown>;

export function requiredString(args: Args, name: string): string {
  const value = args[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ToolArgumentError(`"${name}" is required and must be a non-empty string.`);
  }
  return value;
}

export function optionalString(args: Args, name: string): string | undefined {
  const value = args[name];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new ToolArgumentError(`"${name}" must be a string.`);
  }
  return value;
}

export function requiredStringArray(args: Args, name: string): string[] {
  const value = args[name];
  if (!Array.isArray(value) || value.length === 0) {
    throw new ToolArgumentError(`"${name}" is required and must be a non-empty array of strings.`);
  }
  return value.map((entry, index) => {
    if (typeof entry !== 'string' || entry.trim() === '') {
      throw new ToolArgumentError(`"${name}[${index}]" must be a non-empty string.`);
    }
    return entry;
  });
}

export function optionalStringArray(args: Args, name: string): string[] | undefined {
  if (args[name] === undefined || args[name] === null) return undefined;
  return requiredStringArray(args, name);
}

export function optionalInteger(args: Args, name: string, fallback: number, max?: number): number {
  const value = args[name];
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ToolArgumentError(`"${name}" must be a positive number.`);
  }
  const rounded = Math.floor(parsed);
  return max === undefined ? rounded : Math.min(rounded, max);
}

export function optionalNonNegativeInteger(args: Args, name: string, fallback: number): number {
  const value = args[name];
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ToolArgumentError(`"${name}" must be zero or a positive number.`);
  }
  return Math.floor(parsed);
}

export function requiredRecord(args: Args, name: string): Record<string, unknown> {
  const value = args[name];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ToolArgumentError(`"${name}" is required and must be an object.`);
  }
  return value as Record<string, unknown>;
}

export function optionalBoolean(args: Args, name: string, fallback: boolean): boolean {
  const value = args[name];
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new ToolArgumentError(`"${name}" must be a boolean.`);
}
