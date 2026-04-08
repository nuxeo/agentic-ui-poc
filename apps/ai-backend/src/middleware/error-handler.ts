import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ai-backend]', err.message);

  if (err.message?.includes('rate_limit')) {
    res.status(429).json({ error: 'OpenAI rate limit reached. Please try again shortly.' });
    return;
  }

  if (err.message?.includes('insufficient_quota')) {
    res.status(402).json({ error: 'OpenAI quota exceeded. Check billing.' });
    return;
  }

  res.status(err.status ?? 500).json({
    error: err.message || 'Internal server error',
  });
}
