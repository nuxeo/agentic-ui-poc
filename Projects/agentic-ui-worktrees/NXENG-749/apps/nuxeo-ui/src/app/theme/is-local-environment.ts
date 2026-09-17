import { isDevMode } from '@angular/core';

/** True when running a local dev build (`ng serve`), not beta/production deployments. */
export function isLocalEnvironment(): boolean {
  return isDevMode();
}
