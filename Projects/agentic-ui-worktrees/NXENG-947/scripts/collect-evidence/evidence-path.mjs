import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

/** Desktop folder for all ticket evidence (screenshots, videos, reports). */
export const EVIDENCE_ROOT =
  process.env['AGENTIC_UI_EVIDENCE_DIR'] ??
  join(homedir(), 'Desktop', 'agentic-ui-evidence');

/**
 * Output directory for a single ticket's evidence artifacts.
 * @param {string} ticketId e.g. NXSAT-174
 */
export function evidenceDirForTicket(ticketId) {
  return resolve(EVIDENCE_ROOT, ticketId);
}
