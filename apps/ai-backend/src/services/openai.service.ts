import { openai } from '../config.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULTS: Required<ChatOptions> = {
  model: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 2048,
};

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
  });
  return response.choices[0]?.message?.content?.trim() ?? '';
}

export async function chatCompletionStream(
  messages: ChatCompletionMessageParam[],
  opts: ChatOptions = {},
) {
  const { model, temperature, maxTokens } = { ...DEFAULTS, ...opts };
  return openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });
}

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}
