import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

/**
 * This library had no setup file, because its only spec — `ai-error.spec.ts` — tests a pure function
 * and never touches the TestBed. The service specs added alongside it do, and fail with
 * "Need to call TestBed.initTestEnvironment() first" without this.
 *
 * Mirrors `libs/shared/extensions/src/test-setup.ts`. No `provideTestTranslations()` here: nothing in
 * this library renders a template, and the one `TranslateService` consumer — `AiChatService` — is
 * given a stub resolver in its own spec.
 */
TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
