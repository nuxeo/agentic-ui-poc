import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

import { provideTestTranslations } from '@agentic-ui/testing/i18n';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Composite components translate their own chrome through `| translate`, so their tests need
// `TranslateService` and the real catalogue, or assertions on visible text see raw keys. See
// tools/i18n/test-translate-setup.ts.
provideTestTranslations();
