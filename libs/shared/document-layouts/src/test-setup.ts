import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

import { provideTestTranslations } from '@agentic-ui/testing/i18n';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Templates here bind through `| translate`, so component tests need `TranslateService`
// or they fail with NG0201 — and need the real catalogue, or assertions on visible text see
// raw keys instead of English. See tools/i18n/test-translate-setup.ts.
provideTestTranslations();
