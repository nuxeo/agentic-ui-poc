/**
 * Vitest setup file for integration tests with Angular TestBed support.
 *
 * Initializes Angular testing environment for vitest so TestBed can be used
 * in integration tests that depend on Angular services.
 *
 * This fixes the "Need to call TestBed.initTestEnvironment() first" error
 * that blocked SearchService integration tests.
 */

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize Angular testing environment for vitest
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

console.log('[vitest-setup] Angular TestBed initialized for integration tests');
