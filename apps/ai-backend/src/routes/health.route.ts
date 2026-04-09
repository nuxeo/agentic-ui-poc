import { Router } from 'express';

const router: Router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', gateway: 'haip', timestamp: new Date().toISOString() });
});

export default router;
