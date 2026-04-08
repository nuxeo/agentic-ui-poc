import { Router } from 'express';
import { chatCompletion } from '../services/openai.service.js';
import { getDocumentById, getDocumentBlob } from '../services/nuxeo.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';

const router = Router();

router.post('/classify', async (req, res, next) => {
  try {
    const { docId } = req.body as { docId: string };
    if (!docId) {
      res.status(400).json({ error: 'docId is required' });
      return;
    }

    const doc = (await getDocumentById(docId)) as Record<string, unknown>;
    const props = doc['properties'] as Record<string, unknown> | undefined;
    let content = `Title: ${props?.['dc:title']}\nType: ${doc['type']}\nPath: ${doc['path']}\n`;
    content += `Current description: ${props?.['dc:description'] ?? 'none'}\n`;
    content += `Current nature: ${props?.['dc:nature'] ?? 'none'}\n`;

    try {
      const blob = await getDocumentBlob(docId);
      content += `\nContent preview:\n${blob.slice(0, 20000)}`;
    } catch {
      /* no blob */
    }

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.classify },
        { role: 'user', content },
      ],
      { maxTokens: 512 },
    );

    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
