import { Router } from 'express';
import { chatCompletion } from '../services/openai.service.js';
import { getDocumentById, getDocumentBlob } from '../services/nuxeo.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';

const router = Router();

router.post('/summarize', async (req, res, next) => {
  try {
    const { docId } = req.body as { docId: string };
    if (!docId) {
      res.status(400).json({ error: 'docId is required' });
      return;
    }

    const doc = (await getDocumentById(docId)) as Record<string, unknown>;
    const props = doc['properties'] as Record<string, unknown> | undefined;
    let content = `Title: ${props?.['dc:title'] ?? 'Unknown'}\nType: ${doc['type']}\nPath: ${doc['path']}\n`;

    try {
      const blobText = await getDocumentBlob(docId);
      const truncated =
        blobText.length > 50000 ? blobText.slice(0, 50000) + '\n[...truncated]' : blobText;
      content += `\nContent:\n${truncated}`;
    } catch {
      content += '\n[No readable blob content available]';
    }

    if (props?.['note:note']) {
      content += `\nNote content:\n${props['note:note']}`;
    }

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.summarize },
        { role: 'user', content },
      ],
      { maxTokens: 1024 },
    );

    res.json(JSON.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
