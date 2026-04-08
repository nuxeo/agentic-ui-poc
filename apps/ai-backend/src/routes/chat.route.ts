import { Router } from 'express';
import { chatCompletionStream } from '../services/openai.service.js';
import { ragChat } from '../services/rag.service.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const router: Router = Router();

router.post('/chat', async (req, res, next) => {
  try {
    const { message, history, context, stream } = req.body as {
      message: string;
      history?: ChatCompletionMessageParam[];
      context?: { docId?: string; page?: string };
      stream?: boolean;
    };

    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const { sources, systemPrompt } = await ragChat(message, history ?? [], context);

      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...(history ?? []),
        { role: 'user', content: message },
      ];

      const completion = await chatCompletionStream(messages, { maxTokens: 1024 });

      for await (const chunk of completion) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
      res.end();
      return;
    }

    const result = await ragChat(message, history ?? [], context);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
