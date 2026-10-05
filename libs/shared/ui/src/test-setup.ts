import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

import { provideTestTranslations } from '@agentic-ui/testing/i18n';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Templates in this library bind through `| translate`, so every component test needs
// `TranslateService` or it fails with NG0201 — and needs the real catalogue, or assertions on
// visible text would see raw keys instead of English. See tools/i18n/test-translate-setup.ts.
provideTestTranslations();
