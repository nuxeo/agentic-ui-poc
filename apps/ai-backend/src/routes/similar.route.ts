import { Router } from 'express';
import { chatCompletion, createEmbedding } from '../services/openai.service.js';
import { getDocumentById, nxqlSearch } from '../services/nuxeo.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';

const embeddingCache = new Map<string, number[]>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const router = Router();

router.post('/similar', async (req, res, next) => {
  try {
    const { docId, limit = 5 } = req.body as { docId: string; limit?: number };
    if (!docId) {
      res.status(400).json({ error: 'docId is required' });
      return;
    }

    const doc = (await getDocumentById(docId)) as Record<string, unknown>;
    const props = doc['properties'] as Record<string, unknown> | undefined;
    const title = (props?.['dc:title'] as string) ?? '';
    const description = (props?.['dc:description'] as string) ?? '';
    const docText = `${title}. ${description}`;

    const queryResult = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.similar },
        {
          role: 'user',
          content: `Document title: ${title}\nType: ${doc['type']}\nPath: ${doc['path']}\nDescription: ${description}`,
        },
      ],
      { model: 'gpt-4o-mini', maxTokens: 256 },
    );

    let nxql: string;
    try {
      nxql = JSON.parse(queryResult).nxql;
    } catch {
      nxql = `SELECT * FROM Document WHERE ecm:fulltext = '${title.replace(/'/g, "\\'")}' AND ecm:uuid != '${docId}' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0`;
    }

    const results = (await nxqlSearch(nxql, 20)) as Record<string, unknown>;
    const entries = (results['entries'] as Array<Record<string, unknown>>) ?? [];

    if (entries.length === 0) {
      res.json({ documents: [] });
      return;
    }

    const sourceEmbedding = embeddingCache.get(docId) ?? (await createEmbedding(docText));
    embeddingCache.set(docId, sourceEmbedding);

    const scored = await Promise.all(
      entries.slice(0, 10).map(async (entry) => {
        const eProps = entry['properties'] as Record<string, unknown> | undefined;
        const eTitle = (eProps?.['dc:title'] as string) ?? '';
        const eDesc = (eProps?.['dc:description'] as string) ?? '';
        const uid = entry['uid'] as string;

        let emb = embeddingCache.get(uid);
        if (!emb) {
          emb = await createEmbedding(`${eTitle}. ${eDesc}`);
          embeddingCache.set(uid, emb);
        }

        return {
          uid,
          title: eTitle,
          path: entry['path'] as string,
          type: entry['type'] as string,
          score: cosineSimilarity(sourceEmbedding, emb),
        };
      }),
    );

    scored.sort((a, b) => b.score - a.score);
    res.json({ documents: scored.slice(0, limit) });
  } catch (err) {
    next(err);
  }
});

export default router;
