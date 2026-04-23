import { Router } from 'express';
import { config } from '../config.js';

const router: Router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    gateway: 'haip',
    model: config.haipModel,
    timestamp: new Date().toISOString(),
  });
});

export default router;
