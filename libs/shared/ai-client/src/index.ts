export { AI_BACKEND_URL } from './lib/ai.config';
export { AiGatewayService } from './lib/ai-gateway.service';
export { AiChatService, type ChatEntry } from './lib/ai-chat.service';
export {
  AI_PANEL_DEFAULT_WIDTH,
  AI_PANEL_MAX_WIDTH,
  AI_PANEL_MIN_CONTENT_WIDTH,
  AI_PANEL_MIN_WIDTH,
  AI_PANEL_WIDTH_STORAGE_KEY,
  aiPanelMaxWidth,
  clampAiPanelWidth,
  clampAiPanelWidthToBounds,
} from './lib/ai-chat-panel-size';
export { AiFeatureFlagService } from './lib/ai-feature-flag.service';
export type {
  NlToNxqlRequest,
  NlToNxqlResponse,
  NlToNxqlSuggestionsResponse,
  SummarizeResponse,
  SuggestedTag,
  SuggestTagsResponse,
  ClassifyResponse,
  DocRef,
  SimilarDoc,
  SimilarResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  SentimentItem,
  SentimentResponse,
  Insight,
  InsightsResponse,
  AuditAnomaly,
  AnomaliesResponse,
  PermissionResult,
  NlPermissionsResponse,
  AuditFilterResponse,
  AuditSummaryStat,
  AuditSummaryUser,
  AuditSummaryResponse,
} from './lib/ai.models';
