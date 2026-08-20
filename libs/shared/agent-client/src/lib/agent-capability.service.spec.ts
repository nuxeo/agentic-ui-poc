import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AgentCapabilityService } from './agent-capability.service';
import { AGENT_CAPABILITY_PROBE_TIMEOUT, AGENT_CAPABILITY_PROBE_TIMEOUT_MS } from './agent.config';

const DEPLOYED = {
  agentRuntime: true,
  protocol: 'ag-ui',
  protocolVersion: '0.0.57',
  transports: ['sse'],
  endpoints: { run: '/agent/run' },
  features: {
    streaming: true,
    toolCalls: true,
    humanInTheLoop: true,
    sharedState: true,
    threadPersistence: true,
    cancel: true,
  },
};

describe('AgentCapabilityService', () => {
  let service: AgentCapabilityService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AgentCapabilityService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('probes the same-origin capability endpoint', () => {
    service.probe().subscribe();
    const request = http.expectOne('/nuxeo/agent/capabilities');
    expect(request.request.method).toBe('GET');
    request.flush(DEPLOYED);
  });

  it('reports the runtime and its optional features when a gateway answers', () => {
    let result: boolean | undefined;
    service.probe().subscribe((value) => (result = value));
    http.expectOne('/nuxeo/agent/capabilities').flush(DEPLOYED);

    expect(result).toBe(true);
    expect(service.agentRuntimeAvailable()).toBe(true);
    expect(service.agentRuntimeFeatures().humanInTheLoop).toBe(true);
    expect(service.probeSettled()).toBe(true);
  });

  // The degraded path is the one a meaningful number of OnPrem customers will run, so
  // every way of failing has to land on the same answer rather than on an exception.
  it.each([
    ['a 404 because the gateway is not deployed', () => new HttpErrorResponse({ status: 404 })],
    ['a 500 from a broken reverse proxy', () => new HttpErrorResponse({ status: 500 })],
    [
      'a 401, which must not be mistaken for "deployed"',
      () => new HttpErrorResponse({ status: 401 }),
    ],
  ])('falls back on %s', (_label, makeError) => {
    let result: boolean | undefined;
    service.probe().subscribe((value) => (result = value));
    const error = makeError();
    http
      .expectOne('/nuxeo/agent/capabilities')
      .flush('', { status: error.status, statusText: 'err' });

    expect(result).toBe(false);
    expect(service.agentRuntimeAvailable()).toBe(false);
    expect(service.probeSettled()).toBe(true);
  });

  it('falls back when something else answers on the path', () => {
    let result: boolean | undefined;
    service.probe().subscribe((value) => (result = value));
    http.expectOne('/nuxeo/agent/capabilities').flush('<html>Nuxeo login</html>');

    expect(result).toBe(false);
    expect(service.agentRuntimeFeatures().streaming).toBe(false);
  });

  it('falls back when the body omits agentRuntime: true', () => {
    let result: boolean | undefined;
    service.probe().subscribe((value) => (result = value));
    http.expectOne('/nuxeo/agent/capabilities').flush({ agentRuntime: 'yes', features: {} });

    expect(result).toBe(false);
  });

  it('gives the bootstrap probe the two seconds the ADR allows', () => {
    expect(AGENT_CAPABILITY_PROBE_TIMEOUT_MS).toBe(2000);
  });

  it('falls back rather than hanging when the probe exceeds its timeout', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AGENT_CAPABILITY_PROBE_TIMEOUT, useValue: 5 },
      ],
    });
    const timedOut = TestBed.inject(AgentCapabilityService);
    http = TestBed.inject(HttpTestingController);

    let result: boolean | undefined;
    timedOut.probe().subscribe((value) => (result = value));
    // Leave the request hanging, as an unreachable gateway behind a proxy would. The
    // timeout cancels it, which is why there is nothing left to flush afterwards.
    const request = http.expectOne('/nuxeo/agent/capabilities');
    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(result).toBe(false);
    expect(timedOut.agentRuntimeAvailable()).toBe(false);
    expect(request.cancelled).toBe(true);
  });

  it('probes once per browser session and reuses the answer', () => {
    service.probe().subscribe();
    http.expectOne('/nuxeo/agent/capabilities').flush(DEPLOYED);

    let second: boolean | undefined;
    service.probe().subscribe((value) => (second = value));

    http.expectNone('/nuxeo/agent/capabilities');
    expect(second).toBe(true);
  });

  // Persisting the answer would mean a customer who installs the gateway has to clear
  // browser storage before the app notices it.
  it('keeps the answer out of persistent storage', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem, getItem: () => null, removeItem: vi.fn() });

    service.probe().subscribe();
    http.expectOne('/nuxeo/agent/capabilities').flush(DEPLOYED);

    expect(setItem).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
