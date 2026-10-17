import { FormArray, FormControl, FormGroup, } from '@angular/forms';
import { nxsDateFromAdapter, nxsDateToAdapter } from '../date-input/adapter-date';
/** Deeper complex fields are shown read-only: no schema shipped with Nuxeo nests further. */
export const MAX_COMPLEX_DEPTH = 4;
const NUMBER_TYPES = new Set(['long', 'integer', 'double']);
const INTEGER_TYPES = new Set(['long', 'integer']);
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
export const baseType = (definition) => definition.type.endsWith('[]') ? definition.type.slice(0, -2) : definition.type;
const isList = (definition) => definition.type.endsWith('[]');
export function fieldKind(definition, depth = 0) {
    const base = baseType(definition);
    if (base === 'complex') {
        const editable = depth < MAX_COMPLEX_DEPTH && Object.keys(definition.fields ?? {}).length > 0;
        if (!editable)
            return 'read-only';
        return isList(definition) ? 'complex-list' : 'complex';
    }
    if (base === 'blob')
        return 'read-only';
    if (isList(definition))
        return definition.directory ? 'vocabulary-list' : 'list';
    if (definition.directory)
        return 'vocabulary';
    if (NUMBER_TYPES.has(base))
        return 'number';
    if (base === 'date')
        return 'date';
    if (base === 'boolean')
        return 'boolean';
    return 'text';
}
const isEmpty = (value) => value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);
/** Nuxeo matches a pattern against the whole value; an expression JavaScript cannot compile is not checked. */
function wholeMatch(pattern) {
    try {
        return new RegExp(`^(?:${pattern})$`, 'u');
    }
    catch {
        return null;
    }
}
/** The errors one scalar value has against its constraints. An empty value has none. */
function scalarErrors(value, base, constraints) {
    if (isEmpty(value))
        return null;
    if (NUMBER_TYPES.has(base)) {
        if (typeof value !== 'number' || !Number.isFinite(value))
            return { number: true };
        if (INTEGER_TYPES.has(base) && !Number.isInteger(value))
            return { integer: true };
        const { minimum, maximum, minimumInclusive = true, maximumInclusive = true } = constraints;
        if (minimum !== undefined && (minimumInclusive ? value < minimum : value <= minimum)) {
            return { minimum: { bound: minimum, inclusive: minimumInclusive } };
        }
        if (maximum !== undefined && (maximumInclusive ? value > maximum : value >= maximum)) {
            return { maximum: { bound: maximum, inclusive: maximumInclusive } };
        }
        return null;
    }
    if (typeof value !== 'string')
        return null;
    const text = value.trim();
    if (constraints.minLength !== undefined && text.length < constraints.minLength) {
        return { minLength: { count: constraints.minLength } };
    }
    if (constraints.maxLength !== undefined && text.length > constraints.maxLength) {
        return { maxLength: { count: constraints.maxLength } };
    }
    const pattern = constraints.pattern === undefined ? null : wholeMatch(constraints.pattern);
    if (pattern && !pattern.test(text))
        return { pattern: true };
    return null;
}
function validatorFor(definition) {
    const base = baseType(definition);
    const constraints = definition.constraints ?? {};
    const list = isList(definition);
    return (control) => {
        const value = control.value;
        if (definition.required && isEmpty(value))
            return { required: true };
        if (!list)
            return scalarErrors(value, base, constraints);
        const items = Array.isArray(value) ? value : [];
        return items.some((item) => scalarErrors(item, base, constraints) !== null)
            ? { item: true }
            : null;
    };
}
function toDate(value) {
    if (value instanceof Date)
        return value;
    if (typeof value !== 'string' || value === '')
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
/**
 * The instant each date control was built from, for a date adapter that does not hold JS dates. A
 * Nuxeo date property is an instant, and the datepicker edits only its day; an adapter holding JS
 * dates keeps the instant in the control's value itself, but one holding calendar days does not.
 * So the instant is written back while the control still names its day, as it is for JS dates.
 */
const builtInstants = new WeakMap();
/** A date field's control, holding the property's date as `adapter` holds dates. */
function dateControl(definition, value, adapter) {
    const instant = toDate(value);
    const control = new FormControl(nxsDateToAdapter(adapter, instant), validatorFor(definition));
    if (instant)
        builtInstants.set(control, instant);
    return control;
}
/**
 * A date field's value as the property takes it, an ISO 8601 instant: the instant it was built
 * from while it names the same local day, otherwise that day's local midnight — what a JS date
 * picked in the field is. `null` when it holds no valid date.
 */
function dateProperty(control, adapter) {
    const day = nxsDateFromAdapter(adapter, control.value);
    if (!day)
        return null;
    const instant = builtInstants.get(control);
    const sameDay = !!instant &&
        instant.getFullYear() === day.getFullYear() &&
        instant.getMonth() === day.getMonth() &&
        instant.getDate() === day.getDate();
    return (sameDay ? instant : day).toISOString();
}
function toNumber(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value !== 'string' || value.trim() === '')
        return null;
    return Number(value);
}
function scalarValue(base, value) {
    if (NUMBER_TYPES.has(base))
        return toNumber(value);
    if (base === 'date')
        return toDate(value);
    if (base === 'boolean')
        return value === true || value === 'true';
    if (typeof value === 'string')
        return value;
    return value === null || value === undefined ? '' : String(value);
}
function complexGroup(definition, value, adapter, depth) {
    const record = isRecord(value) ? value : {};
    const fields = definition.fields ?? {};
    const controls = {};
    for (const name of Object.keys(fields)) {
        controls[name] = buildControl(fields[name], record[name], adapter, depth + 1);
    }
    return new FormGroup(controls);
}
/** One complex list item, empty, for the "Add" button. */
export function newComplexItem(definition, adapter, depth) {
    return complexGroup(definition, {}, adapter, depth);
}
/**
 * The control for one field, holding its current value in the shape its form control edits. A
 * date field's value is a date as `adapter`, the datepicker's, holds dates: a JS `Date` for
 * Material's native adapter and date-fns, a Luxon `DateTime` for Luxon's.
 */
export function buildControl(definition, value, adapter, depth = 0) {
    const kind = fieldKind(definition, depth);
    if (kind === 'read-only')
        return new FormControl({ value, disabled: true });
    if (kind === 'complex')
        return complexGroup(definition, value, adapter, depth);
    if (kind === 'complex-list') {
        const items = Array.isArray(value) ? value : [];
        const required = (control) => definition.required && control.length === 0 ? { required: true } : null;
        return new FormArray(items.map((item) => complexGroup(definition, item, adapter, depth)), required);
    }
    if (kind === 'date')
        return dateControl(definition, value, adapter);
    const base = baseType(definition);
    const initial = kind === 'list' || kind === 'vocabulary-list'
        ? (Array.isArray(value) ? value : []).map((item) => scalarValue(base, item))
        : scalarValue(base, value);
    return new FormControl(initial, validatorFor(definition));
}
/**
 * A control's value as the document property takes it. A date is an ISO 8601 instant whatever
 * `adapter`, the one the control was built with, holds dates as.
 */
export function propertyValue(definition, control, adapter, depth = 0, multiline = false) {
    const kind = fieldKind(definition, depth);
    if (kind === 'complex' && control instanceof FormGroup) {
        const fields = definition.fields ?? {};
        const out = {};
        for (const name of Object.keys(fields)) {
            const child = control.controls[name];
            if (child)
                out[name] = propertyValue(fields[name], child, adapter, depth + 1);
        }
        return out;
    }
    if (kind === 'complex-list' && control instanceof FormArray) {
        return control.controls.map((item) => propertyValue({ ...definition, type: 'complex' }, item, adapter, depth));
    }
    const value = control.value;
    if (value instanceof Date)
        return value.toISOString();
    if (kind === 'date')
        return dateProperty(control, adapter);
    if (typeof value === 'string') {
        if (value.trim() === '')
            return null;
        return multiline ? value : value.trim();
    }
    return value ?? null;
}
/** The error to show for a control, most fundamental first: one message at a time. */
export function firstError(control) {
    const errors = control.errors;
    if (!errors)
        return null;
    if (typeof errors['server'] === 'string')
        return { key: 'server', params: { message: errors['server'] } };
    if (errors['required'])
        return { key: 'required', params: {} };
    if (errors['matDatepickerParse'])
        return { key: 'date', params: {} };
    for (const key of ['number', 'integer', 'pattern', 'item']) {
        if (errors[key])
            return { key, params: {} };
    }
    for (const key of ['minLength', 'maxLength']) {
        if (isRecord(errors[key]))
            return { key, params: errors[key] };
    }
    for (const key of ['minimum', 'maximum']) {
        const error = errors[key];
        if (isRecord(error)) {
            return { key: `${key}${error['inclusive'] === false ? '-exclusive' : ''}`, params: error };
        }
    }
    return { key: 'invalid', params: {} };
}
