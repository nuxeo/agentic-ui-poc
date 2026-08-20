import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Node 22+ defines `localStorage` and `sessionStorage` on globalThis, and reading either
// throws `SecurityError: Cannot initialize local storage without a --localstorage-file
// path` unless the process was started with that flag. Vitest's jsdom environment copies a
// window property onto globalThis only when the name is not already a global (getWindowKeys
// in vitest), and neither name is on its allowlist — so Node's throwing getter shadows
// jsdom's Storage for the whole run and any spec that touches Web Storage fails.
// Rebind jsdom's own implementation, which is what a browser gives production code. This
// becomes a no-op assignment of the same object if Vitest starts copying these itself.
const jsdomWindow = (globalThis as { jsdom?: { window: Window & typeof globalThis } }).jsdom
  ?.window;
if (jsdomWindow) {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, key, {
      value: jsdomWindow[key],
      configurable: true,
      writable: true,
    });
  }
}
