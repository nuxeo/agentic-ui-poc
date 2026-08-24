import { Injectable, computed } from '@angular/core';

import { isLocalEnvironment } from './is-local-environment';

/** Gates the Themes settings UI and custom theme selection to local development only. */
@Injectable({ providedIn: 'root' })
export class ThemingFeatureFlagService {
  readonly themingEnabled = computed(() => isLocalEnvironment());
}
