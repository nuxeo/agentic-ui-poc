import { Router } from 'express';
import { chatCompletion } from '../services/openai.service.js';
import { getAuditEvents } from '../services/nuxeo.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';

const router = Router();

router.post('/anomalies', async (req, res, next) => {
  try {
    const { timeRange = '24h' } = req.body as { timeRange?: string };

    const pageSize = timeRange === '30d' ? 200 : timeRange === '7d' ? 100 : 50;
    const auditData = await getAuditEvents(undefined, pageSize);

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.anomalies },
        {
          role: 'user',
          content: `Analyze these audit events for anomalies (time range: ${timeRange}):\n${JSON.stringify(auditData, null, 2).slice(0, 30000)}`,
        },
      ],
      { maxTokens: 1024 },
    );

    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
