import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname =
  typeof import.meta.dirname === 'string'
    ? import.meta.dirname
    : dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  haipBaseUrl: process.env['HAIP_BASE_URL'] ?? '',
  haipApiKey: process.env['HAIP_API_KEY'] ?? '',
  haipModel: process.env['HAIP_MODEL'] ?? 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  haipModelFast: process.env['HAIP_MODEL_FAST'] ?? 'amazon.nova-micro-v1:0',
  haipEmbeddingModel:
    process.env['HAIP_EMBEDDING_MODEL'] ?? 'bedrock-amazon-titan-text-embeddings-v2',
  haipEnvironmentId: process.env['HAIP_ENVIRONMENT_ID'] ?? '',
  nuxeoUrl: process.env['NUXEO_URL'] ?? 'http://localhost:8080',
  nuxeoAuth: process.env['NUXEO_AUTH'] ?? '',
} as const;

if (!config.haipApiKey) {
  console.error('HAIP_API_KEY is required. Set it in apps/ai-backend/.env');
  process.exit(1);
}

if (!config.haipBaseUrl) {
  console.error('HAIP_BASE_URL is required. Set it in apps/ai-backend/.env');
  process.exit(1);
}

if (!config.nuxeoAuth) {
  console.error(
    'NUXEO_AUTH is required. Set it in apps/ai-backend/.env (format: username:password)',
  );
  process.exit(1);
}

export const openai = new OpenAI({
  apiKey: config.haipApiKey,
  baseURL: `${config.haipBaseUrl}/v1`,
  defaultHeaders: {
    'User-Agent': 'NuxeoAgenticUI/1.0.0 (POC) openai-node/4.x',
  },
});

export function nuxeoBasicAuth(): string {
  return Buffer.from(config.nuxeoAuth).toString('base64');
}
