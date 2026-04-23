import { Router } from 'express';
import { config } from '../config.js';
import { chatCompletion } from '../services/openai.service.js';
import { nxqlSearch, getDocumentAcl } from '../services/nuxeo.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';
import { escapeNxql } from '../utils/nxql-escape.js';

const router: Router = Router();

router.post('/nl-permissions', async (req, res, next) => {
  try {
    const { query } = req.body as { query: string };
    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    const intentResult = await chatCompletion(
      [
        {
          role: 'system',
          content:
            'Extract the document path or search criteria from a permissions question. Return JSON: { "path": "/some/path" } or { "search": "some title" }. Return ONLY valid JSON.',
        },
        { role: 'user', content: query },
      ],
      { model: config.haipModelFast, maxTokens: 256 },
    );

    let aclData: unknown = {};
    try {
      const intent = JSON.parse(intentResult);
      if (intent.path) {
        const docs = (await nxqlSearch(
          `SELECT * FROM Document WHERE ecm:path STARTSWITH '${escapeNxql(intent.path)}' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0`,
          5,
        )) as Record<string, unknown>;
        const entries = (docs['entries'] as Array<Record<string, unknown>>) ?? [];
        const acls = await Promise.all(
          entries.slice(0, 3).map(async (e) => ({
            title: (e['properties'] as Record<string, unknown>)?.['dc:title'],
            path: e['path'],
            acl: await getDocumentAcl(e['uid'] as string).catch(() => null),
          })),
        );
        aclData = acls;
      } else if (intent.search) {
        const docs = (await nxqlSearch(
          `SELECT * FROM Document WHERE dc:title ILIKE '%${escapeNxql(intent.search)}%' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0`,
          3,
        )) as Record<string, unknown>;
        const entries = (docs['entries'] as Array<Record<string, unknown>>) ?? [];
        const acls = await Promise.all(
          entries.map(async (e) => ({
            title: (e['properties'] as Record<string, unknown>)?.['dc:title'],
            path: e['path'],
            acl: await getDocumentAcl(e['uid'] as string).catch(() => null),
          })),
        );
        aclData = acls;
      }
    } catch {
      /* intent parsing failed */
    }

    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPTS.nlPermissions },
        {
          role: 'user',
          content: `Question: ${query}\n\nACL data:\n${JSON.stringify(aclData, null, 2).slice(0, 15000)}`,
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
