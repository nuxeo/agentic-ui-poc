import { Router } from 'express';
import { config } from '../config.js';

const router: Router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    gateway: 'openai',
    model: config.openaiModel,
    timestamp: new Date().toISOString(),
  });
});

export default router;
