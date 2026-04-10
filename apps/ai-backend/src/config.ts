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
  openaiApiKey: process.env['OPENAI_API_KEY'] ?? '',
  openaiModel: process.env['OPENAI_MODEL'] ?? 'gpt-4o',
  openaiModelFast: process.env['OPENAI_MODEL_FAST'] ?? 'gpt-4o-mini',
  openaiEmbeddingModel: process.env['OPENAI_EMBEDDING_MODEL'] ?? 'text-embedding-3-small',
  nuxeoUrl: process.env['NUXEO_URL'] ?? 'http://localhost:8080',
  nuxeoAuth: process.env['NUXEO_AUTH'] ?? 'Administrator:Administrator',
} as const;

if (!config.openaiApiKey) {
  console.error('OPENAI_API_KEY is required. Set it in apps/ai-backend/.env');
  process.exit(1);
}

export const openai = new OpenAI({ apiKey: config.openaiApiKey });

export function nuxeoBasicAuth(): string {
  return Buffer.from(config.nuxeoAuth).toString('base64');
}
