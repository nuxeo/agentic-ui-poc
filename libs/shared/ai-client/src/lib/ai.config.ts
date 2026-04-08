import { InjectionToken } from '@angular/core';

export const AI_BACKEND_URL = new InjectionToken<string>('AI_BACKEND_URL', {
  providedIn: 'root',
  factory: () => '',
});
