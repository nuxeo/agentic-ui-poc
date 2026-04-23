import { openai, config } from '../config.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULTS: Required<ChatOptions> = {
  model: config.haipModel,
  temperature: 0.3,
  maxTokens: 2048,
};

const HAIP_METADATA = config.haipEnvironmentId
  ? { metadata: { environment_id: config.haipEnvironmentId, user_id: 'nuxeo-agentic-ui' } }
  : {};

export async function chatCompletion(
  messages: ChatCompletionMessageParam[],
  opts: ChatOptions = {},
): Promise<string> {
  const { model, temperature, maxTokens } = { ...DEFAULTS, ...opts };
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
    ...HAIP_METADATA,
  } as Parameters<typeof openai.chat.completions.create>[0] & { stream: false });
  return response.choices[0]?.message?.content?.trim() ?? '';
}

export async function chatCompletionStream(
  messages: ChatCompletionMessageParam[],
  opts: ChatOptions = {},
) {
  const { model, temperature, maxTokens } = { ...DEFAULTS, ...opts };
  return openai.chat.completions.stream({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...HAIP_METADATA,
  } as Parameters<typeof openai.chat.completions.stream>[0]);
}

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: config.haipEmbeddingModel,
    input: text,
  });
  return response.data[0].embedding;
}
