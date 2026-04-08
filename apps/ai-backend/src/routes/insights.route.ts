import { Router } from 'express';
import { chatCompletion } from '../services/openai.service.js';
import { getUserTasks, searchDocuments } from '../services/nuxeo.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';

const router = Router();

router.post('/insights', async (req, res, next) => {
  try {
    const { userId = 'Administrator' } = req.body as { userId?: string };

    const [tasks, recentDocs] = await Promise.all([
      getUserTasks(userId).catch(() => ({ entries: [] })),
      searchDocuments(
        `SELECT * FROM Document WHERE dc:creator = '${userId}' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ORDER BY dc:modified DESC`,
        20,
      ).catch(() => ({ entries: [] })),
    ]);

    const context = `User: ${userId}\n\nTasks:\n${JSON.stringify(tasks, null, 2).slice(0, 10000)}\n\nRecent documents:\n${JSON.stringify(recentDocs, null, 2).slice(0, 10000)}`;

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.insights },
        { role: 'user', content: context },
      ],
      { model: 'gpt-4o-mini', maxTokens: 1024 },
    );

    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
