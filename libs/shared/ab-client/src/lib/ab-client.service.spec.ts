import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import { AB_CIC_OPERATIONS, DEFAULT_AB_CIC_OPERATIONS } from './ab.config';
import { AbClientService } from './ab-client.service';

function envelope<T>(response: T, responseCode = 200, responseMessage = 'OK'): unknown {
  return { response, responseCode, responseMessage };
}

describe('AbClientService', () => {
  let service: AbClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
        { provide: AB_CIC_OPERATIONS, useValue: DEFAULT_AB_CIC_OPERATIONS },
      ],
    });
    service = TestBed.inject(AbClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists agents via HylandAgents.getAllAgents', async () => {
    const p = firstValueFrom(service.listAgents());
    const req = httpMock.expectOne('/nuxeo/site/automation/HylandAgents.getAllAgents');
    expect(req.request.body).toEqual({});
    req.flush(
      envelope([{ id: 'a1', name: 'Test', description: '', agentType: 'rag', config: {} }]),
    );
    const agents = await p;
    expect(agents).toHaveLength(1);
    expect(agents[0]?.id).toBe('a1');
  });

  it('getAgent calls HylandAgents.LookupAgent with agentId', async () => {
    const p = firstValueFrom(service.getAgent('aid-1'));
    const req = httpMock.expectOne('/nuxeo/site/automation/HylandAgents.LookupAgent');
    expect(req.request.body).toEqual({ params: { agentId: 'aid-1' } });
    req.flush(envelope({ id: 'aid-1', name: 'One' }));
    expect(await p).toEqual({ id: 'aid-1', name: 'One' });
  });

  it('createAgent errors with AbClientError (not supported via CIC)', async () => {
    await expect(
      firstValueFrom(
        service.createAgent({
          name: 'N',
          description: 'D',
          agentType: 'tool',
          config: { llmModelId: 'm', systemPrompt: 's', tools: [] },
        }),
      ),
    ).rejects.toMatchObject({ name: 'AbClientError', responseCode: 501 });
  });

  it('listModels returns empty without HTTP', async () => {
    const rows = await firstValueFrom(service.listModels());
    expect(rows).toEqual([]);
  });

  it('health probes via getAllAgents', async () => {
    const p = firstValueFrom(service.health());
    const req = httpMock.expectOne('/nuxeo/site/automation/HylandAgents.getAllAgents');
    expect(req.request.body).toEqual({});
    req.flush(envelope([]));
    const body = await p;
    expect(body).toMatchObject({ ok: true, via: 'HylandAgents.getAllAgents' });
  });
});
