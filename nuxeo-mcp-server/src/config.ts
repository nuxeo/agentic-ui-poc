export interface NuxeoMcpConfig {
  nuxeoBaseUrl: string;
  readOnly: boolean;
  /** Empty set means no allowlist (all operations allowed when not read-only). */
  automationAllowlist: Set<string>;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

export function loadConfig(): NuxeoMcpConfig {
  const nuxeoBaseUrl = requireEnv('NUXEO_URL').replace(/\/+$/, '');
  const readOnly = process.env.NUXEO_READ_ONLY === 'true' || process.env.NUXEO_READ_ONLY === '1';

  const allowRaw = process.env.NUXEO_AUTOMATION_ALLOWLIST?.trim();
  const automationAllowlist = new Set<string>(
    allowRaw
      ? allowRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  );

  return { nuxeoBaseUrl, readOnly, automationAllowlist };
}

export function getAuthHeader(): string {
  const token = process.env.NUXEO_TOKEN?.trim();
  if (token) {
    return `Bearer ${token}`;
  }
  const user = process.env.NUXEO_USER?.trim();
  const pass = process.env.NUXEO_PASSWORD ?? '';
  if (!user) {
    throw new Error('Set NUXEO_USER and NUXEO_PASSWORD, or NUXEO_TOKEN for Bearer auth.');
  }
  const b64 = Buffer.from(`${user}:${pass}`, 'utf8').toString('base64');
  return `Basic ${b64}`;
}
