import { chatCompletion } from './openai.service.js';
import { config } from '../config.js';
import { nxqlSearch, getDocumentById, getDocumentBlob, getUserTasks } from './nuxeo.service.js';
import { SYSTEM_PROMPTS } from '../context/system-prompts.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface RagResult {
  reply: string;
  sources: Array<{ uid: string; title: string; path: string; type?: string }>;
  systemPrompt: string;
}

export async function ragChat(
  message: string,
  history: ChatCompletionMessageParam[],
  context?: { docId?: string; page?: string },
): Promise<RagResult> {
  const sources: RagResult['sources'] = [];
  let nuxeoContext = '';

  if (context?.docId) {
    try {
      const doc = (await getDocumentById(context.docId)) as Record<string, unknown>;
      const props = doc['properties'] as Record<string, unknown> | undefined;
      const title = (props?.['dc:title'] as string) ?? 'Unknown';
      const description = (props?.['dc:description'] as string) ?? '';
      const creator = (props?.['dc:creator'] as string) ?? '';
      const created = (props?.['dc:created'] as string) ?? '';
      const modified = (props?.['dc:modified'] as string) ?? '';
      const subjects = (props?.['dc:subjects'] as string[]) ?? [];
      const nature = (props?.['dc:nature'] as string) ?? '';

      nuxeoContext += `\n\nThe user is currently viewing this document:\n`;
      nuxeoContext += `Title: ${title}\n`;
      nuxeoContext += `Path: ${doc['path']}\n`;
      nuxeoContext += `Type: ${doc['type']}\n`;
      nuxeoContext += `State: ${doc['state']}\n`;
      if (description) nuxeoContext += `Description: ${description}\n`;
      if (creator) nuxeoContext += `Creator: ${creator}\n`;
      if (created) nuxeoContext += `Created: ${created}\n`;
      if (modified) nuxeoContext += `Last Modified: ${modified}\n`;
      if (nature) nuxeoContext += `Nature: ${nature}\n`;
      if (subjects.length) nuxeoContext += `Subjects: ${subjects.join(', ')}\n`;

      sources.push({
        uid: doc['uid'] as string,
        title,
        path: doc['path'] as string,
        type: doc['type'] as string,
      });

      try {
        const blobContent = await getDocumentBlob(context.docId);
        if (blobContent && blobContent.length < 8000) {
          nuxeoContext += `\nDocument content:\n${blobContent}\n`;
        } else if (blobContent) {
          nuxeoContext += `\nDocument content (truncated):\n${blobContent.substring(0, 8000)}\n`;
        }
      } catch {
        /* blob not available for this doc type */
      }
    } catch (e) {
      console.error('[rag] doc fetch failed:', e instanceof Error ? e.message : e);
    }
  }

  const searchIntent = await chatCompletion(
    [
      { role: 'system', content: SYSTEM_PROMPTS.nlToNxql },
      { role: 'user', content: message },
    ],
    { model: config.haipModelFast, maxTokens: 256 },
  );

  let nxql: string | null = null;
  try {
    const parsed = JSON.parse(searchIntent);
    const raw = parsed.nxql ?? null;
    if (raw && raw !== 'NONE' && raw.toUpperCase().startsWith('SELECT')) {
      nxql = raw;
    }
  } catch {
    if (searchIntent.toUpperCase().startsWith('SELECT')) {
      nxql = searchIntent;
    }
  }

  if (nxql) {
    const appendSearchResults = (results: Record<string, unknown>) => {
      const entries = (results['entries'] as Array<Record<string, unknown>>) ?? [];
      if (entries.length > 0) {
        nuxeoContext += `\n\nHere are the documents found in the Nuxeo repository (present these as results to the user):\n`;
        for (const entry of entries) {
          const props = entry['properties'] as Record<string, unknown> | undefined;
          const title = (props?.['dc:title'] as string) ?? 'Unknown';
          const creator = (props?.['dc:creator'] as string) ?? '';
          const created = (props?.['dc:created'] as string) ?? '';
          const modified = (props?.['dc:modified'] as string) ?? '';
          sources.push({
            uid: entry['uid'] as string,
            title,
            path: entry['path'] as string,
            type: entry['type'] as string,
          });
          nuxeoContext += `- "${title}" | type: ${entry['type']} | path: ${entry['path']} | uid: ${entry['uid']}`;
          if (creator) nuxeoContext += ` | creator: ${creator}`;
          if (created) nuxeoContext += ` | created: ${created}`;
          if (modified) nuxeoContext += ` | modified: ${modified}`;
          nuxeoContext += `\n`;
        }
        nuxeoContext += `\nTotal results in repository: ${results['resultsCount'] ?? 'unknown'}\n`;
      }
    };

    try {
      const results = (await nxqlSearch(nxql, 5)) as Record<string, unknown>;
      appendSearchResults(results);
    } catch (e) {
      console.error('[rag] search failed, trying fallback:', e instanceof Error ? e.message : e);
      const fallback =
        "SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ORDER BY dc:modified DESC";
      try {
        const results = (await nxqlSearch(fallback, 5)) as Record<string, unknown>;
        appendSearchResults(results);
      } catch (e2) {
        console.error('[rag] fallback search also failed:', e2 instanceof Error ? e2.message : e2);
      }
    }
  }

  const taskKeywords = /\b(tasks?|pending|workflow|assigned|review|approval|to.?do)\b/i;
  if (taskKeywords.test(message)) {
    try {
      const taskResult = (await getUserTasks('Administrator')) as Record<string, unknown>;
      const tasks = (taskResult['entries'] as Array<Record<string, unknown>>) ?? [];
      if (tasks.length > 0) {
        nuxeoContext += `\n\nUser's pending tasks:\n`;
        for (const task of tasks) {
          const name = task['name'] ?? task['nodeName'] ?? 'Unnamed';
          const directive = task['directive'] ?? '';
          const created = task['created'] ?? '';
          const dueDate = task['dueDate'] ?? 'no due date';
          const docIds = (task['targetDocumentIds'] as Array<{ id: string }>) ?? [];
          nuxeoContext += `- Task: "${name}" | directive: ${directive} | created: ${created} | due: ${dueDate} | documents: ${docIds.map((d) => d.id).join(', ')}\n`;
        }
      } else {
        nuxeoContext += `\n\nThe user has no pending tasks.\n`;
      }
    } catch (e) {
      console.error('[rag] task fetch failed:', e instanceof Error ? e.message : e);
    }
  }

  const systemPrompt = SYSTEM_PROMPTS.chat + nuxeoContext;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  const reply = await chatCompletion(messages, { maxTokens: 1024 });
  return { reply, sources, systemPrompt };
}
