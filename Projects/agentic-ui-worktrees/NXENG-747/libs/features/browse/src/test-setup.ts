import '@angular/compiler';
// Zone.js, as `libs/shared/adf-hx-bridge` and `libs/features/document-detail` already load it.
// Without it `TestBed.createComponent` of any component whose providers reach `NgZone` fails with
// `NG0908: In this configuration Angular requires Zone.js` — which the adopted adf-hx permissions
// panel does, through adf-core.
import '@analogjs/vitest-angular/setup-zone';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// jsdom does not implement ResizeObserver — provide a no-op stub
global.ResizeObserver = class ResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
};

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
