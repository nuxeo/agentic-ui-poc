import { Router } from 'express';
import { chatCompletion } from '../services/openai.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';

const router: Router = Router();

router.post('/sentiment', async (req, res, next) => {
  try {
    const { comments } = req.body as { comments: Array<{ id: string; text: string }> };
    if (!comments?.length) {
      res.status(400).json({ error: 'comments array is required' });
      return;
    }

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.sentiment },
        { role: 'user', content: JSON.stringify(comments) },
      ],
      { model: 'gpt-4o-mini', maxTokens: 1024 },
    );

    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
