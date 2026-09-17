import { TestBed } from '@angular/core/testing';

import {
  DEFAULT_KD_CIC_OPERATIONS,
  DEFAULT_KD_UPSTREAM_PATHS,
  KD_CIC_OPERATIONS,
  KD_UPSTREAM_PATHS,
} from './kd.config';

/**
 * `KdClientService`'s own spec always provides both tokens explicitly, so the `providedIn:
 * 'root'` factories on them were never executed — `kd.config.ts` reported 100% statements
 * and 60% *functions*. These are the Layer 0 defaults every deployment that does not
 * override the tokens in `app.config.ts` actually runs on, so they need asserting directly.
 */
describe('kd.config injection tokens', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [] });
  });

  it('resolves KD_CIC_OPERATIONS to the connector 2025.x operation ids with no override', () => {
    const ops = TestBed.inject(KD_CIC_OPERATIONS);

    expect(ops).toBe(DEFAULT_KD_CIC_OPERATIONS);
    expect(ops).toEqual({
      getAllAgents: 'HylandKnowledgeDiscovery.getAllAgents',
      askQuestionAndGetAnswer: 'HylandKnowledgeDiscovery.askQuestionAndGetAnswer',
      startConversation: 'HylandKnowledgeDiscovery.startConversation',
      continueConversation: 'HylandKnowledgeDiscovery.continueConversation',
      conversationFeedback: 'HylandKnowledgeDiscovery.conversationFeedback',
      invoke: 'HylandKnowledgeDiscovery.Invoke',
    });
  });

  it('resolves KD_UPSTREAM_PATHS to the documented Agent and QnA paths with no override', () => {
    const paths = TestBed.inject(KD_UPSTREAM_PATHS);

    expect(paths).toBe(DEFAULT_KD_UPSTREAM_PATHS);
    expect(paths.listModels).toBe('/agent/models');
    expect(paths.listGuardrails).toBe('/agent/guardrails');
    expect(paths.getAgent('agent-1')).toBe('/agent/agents/agent-1');
    expect(paths.getQuestionHistory('agent-1', 2, 10)).toBe(
      '/qna/agents/agent-1/questions/history?pageNumber=2&pageSize=10',
    );
    expect(paths.getQuestionAnswer('qid-1')).toBe('/qna/questions/qid-1/answer');
  });

  it('url-encodes every id interpolated into an upstream path', () => {
    const paths = TestBed.inject(KD_UPSTREAM_PATHS);

    // Ids come from upstream payloads, so a reserved character must not be able to
    // graft extra path segments or query parameters onto the request.
    expect(paths.getAgent('team/agent 1')).toBe('/agent/agents/team%2Fagent%201');
    expect(paths.getQuestionHistory('a&b', 1, 25)).toBe(
      '/qna/agents/a%26b/questions/history?pageNumber=1&pageSize=25',
    );
    expect(paths.getQuestionAnswer('q?1')).toBe('/qna/questions/q%3F1/answer');
  });
});
