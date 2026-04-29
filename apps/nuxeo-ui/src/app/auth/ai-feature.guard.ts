import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AiFeatureFlagService } from '@agentic-ui/shared/ai-client';

export const aiFeatureGuard: CanMatchFn = () => {
  const featureFlags = inject(AiFeatureFlagService);
  const router = inject(Router);

  return featureFlags.aiEnabled() ? true : router.createUrlTree(['/dashboard']);
};
