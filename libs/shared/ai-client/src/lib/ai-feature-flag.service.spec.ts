import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AiFeatureFlagService } from './ai-feature-flag.service';

const DEPLOYED = { agentRuntime: true, features: { streaming: true } };

/** The host's own `localStorage` varies by Node version; drive a predictable one instead. */
function memoryStorage(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed));
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  };
}

describe('AiFeatureFlagService', () => {
  let service: AiFeatureFlagService;
  let http: HttpTestingController;
  let storage: ReturnType<typeof memoryStorage>;

  function configure(seed: Record<string, string> = {}) {
    storage = memoryStorage(seed);
    vi.stubGlobal('localStorage', storage);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AiFeatureFlagService);
    http = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => configure());

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
  });

  function probe(respond: (request: ReturnType<HttpTestingController['expectOne']>) => void) {
    service.probeAgentRuntime().subscribe();
    respond(http.expectOne('/nuxeo/agent/capabilities'));
  }

  it('starts on the AI opt-in but off the agent path until the probe answers', () => {
    expect(service.aiEnabled()).toBe(true);
    expect(service.agentRuntimeAvailable()).toBe(false);
    expect(service.agentPathEnabled()).toBe(false);
    expect(service.automationPathEnabled()).toBe(true);
  });

  it('switches to the agent path when a gateway is deployed', () => {
    probe((request) => request.flush(DEPLOYED));

    expect(service.agentPathEnabled()).toBe(true);
    expect(service.automationPathEnabled()).toBe(false);
  });

  // The configuration customers actually hit: AI on, no gateway installed. The app must
  // keep working on the Automation operations rather than showing a broken assistant.
  it('degrades to the Automation path when no gateway answers', () => {
    probe((request) => request.flush('', { status: 404, statusText: 'Not Found' }));

    expect(service.aiEnabled()).toBe(true);
    expect(service.agentRuntimeAvailable()).toBe(false);
    expect(service.agentPathEnabled()).toBe(false);
    expect(service.automationPathEnabled()).toBe(true);
  });

  it('keeps both paths off when the user opts out of AI, gateway or not', () => {
    probe((request) => request.flush(DEPLOYED));
    service.setEnabled(false);

    expect(service.agentRuntimeAvailable()).toBe(true);
    expect(service.agentPathEnabled()).toBe(false);
    expect(service.automationPathEnabled()).toBe(false);
  });

  it('persists the user opt-out but never the deployment answer', () => {
    probe((request) => request.flush(DEPLOYED));
    service.toggle();

    expect(storage.getItem('ai-features-enabled')).toBe('false');
    expect([...storage.store.keys()].some((key) => /agent/i.test(key))).toBe(false);
  });

  it('honours a stored opt-out once the default-on migration has run', () => {
    TestBed.resetTestingModule();
    configure({
      'ai-features-default-enabled-v1': 'true',
      'ai-features-enabled': 'false',
    });

    expect(service.aiEnabled()).toBe(false);
  });

  // Safari private browsing throws on every storage access. AI staying on for the session
  // is the intended behaviour; throwing out of a signal initialiser would break the shell.
  it('stays usable when localStorage throws on read and on write', () => {
    TestBed.resetTestingModule();
    const hostile = {
      getItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
      setItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
      removeItem: () => undefined,
      clear: () => undefined,
    };
    vi.stubGlobal('localStorage', hostile);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AiFeatureFlagService);
    http = TestBed.inject(HttpTestingController);

    expect(service.aiEnabled()).toBe(true);
    expect(() => service.setEnabled(false)).not.toThrow();
    expect(service.aiEnabled()).toBe(false);
  });
});
