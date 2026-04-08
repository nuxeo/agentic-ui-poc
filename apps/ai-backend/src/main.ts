import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';

import healthRoute from './routes/health.route.js';
import nlToNxqlRoute from './routes/nl-to-nxql.route.js';
import summarizeRoute from './routes/summarize.route.js';
import chatRoute from './routes/chat.route.js';
import suggestTagsRoute from './routes/suggest-tags.route.js';
import classifyRoute from './routes/classify.route.js';
import similarRoute from './routes/similar.route.js';
import anomaliesRoute from './routes/anomalies.route.js';
import sentimentRoute from './routes/sentiment.route.js';
import insightsRoute from './routes/insights.route.js';
import nlPermissionsRoute from './routes/nl-permissions.route.js';
import auditAiRoute from './routes/audit-ai.route.js';

const allowedOrigins = (
  process.env['AI_BACKEND_ALLOWED_ORIGINS'] ?? 'http://localhost:4200,http://127.0.0.1:4200'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
  }),
);
app.use(express.json({ limit: '10mb' }));

app.use('/ai', healthRoute);
app.use('/ai', nlToNxqlRoute);
app.use('/ai', summarizeRoute);
app.use('/ai', chatRoute);
app.use('/ai', suggestTagsRoute);
app.use('/ai', classifyRoute);
app.use('/ai', similarRoute);
app.use('/ai', anomaliesRoute);
app.use('/ai', sentimentRoute);
app.use('/ai', insightsRoute);
app.use('/ai', nlPermissionsRoute);
app.use('/ai', auditAiRoute);

app.use(errorHandler);

app.listen(config.port, () => {
  console.warn(`[ai-backend] running on http://localhost:${config.port}`);
  console.warn(`[ai-backend] health check: http://localhost:${config.port}/ai/health`);
  console.warn(`[ai-backend] Nuxeo target: ${config.nuxeoUrl}`);
});
