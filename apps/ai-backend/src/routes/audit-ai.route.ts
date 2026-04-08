import { Router } from 'express';
import { chatCompletion } from '../services/openai.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';

const router = Router();

router.post('/audit/nl-filter', async (req, res, next) => {
  try {
    const { query, today } = req.body as { query: string; today?: string };
    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    const todayStr = today || new Date().toISOString().split('T')[0];
    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.nlAuditFilter },
        { role: 'user', content: `Today is ${todayStr}. User query: "${query}"` },
      ],
      { model: 'gpt-4o-mini', maxTokens: 256 },
    );

    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

router.post('/audit/summarize', async (req, res, next) => {
  try {
    const { entries } = req.body as { entries: unknown[] };
    if (!entries?.length) {
      res.status(400).json({ error: 'entries array is required' });
      return;
    }

    const truncated = JSON.stringify(entries).slice(0, 30000);
    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.auditSummary },
        { role: 'user', content: `Analyze these ${entries.length} audit events:\n${truncated}` },
      ],
      { maxTokens: 1024 },
    );

    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
