import { Router } from 'express';
import { config } from '../config.js';
import { chatCompletion } from '../services/openai.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';
import { NXQL_SCHEMA } from '../context/nxql-schema.js';

const router: Router = Router();

router.post('/nl-to-nxql', async (req, res, next) => {
  try {
    const { query, suggestions } = req.body as { query: string; suggestions?: boolean };
    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    if (suggestions) {
      const result = await chatCompletion(
        [
          { role: 'system', content: SYSTEM_PROMPTS.nlToNxqlSuggestions },
          { role: 'user', content: query },
        ],
        { model: config.openaiModelFast, maxTokens: 512 },
      );
      res.json(JSON.parse(result));
      return;
    }

    const result = await chatCompletion([
      { role: 'system', content: NXQL_SCHEMA + '\n\n' + SYSTEM_PROMPTS.nlToNxql },
      { role: 'user', content: query },
    ]);
    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
