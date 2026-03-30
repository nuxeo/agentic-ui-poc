import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NuxeoService } from './nuxeo';

describe('NuxeoService', () => {
  let service: NuxeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NuxeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have getChildren method', () => {
    expect(typeof service.getChildren).toBe('function');
  });

  it('should have search method', () => {
    expect(typeof service.search).toBe('function');
  });

  it('should have uploadDocument method', () => {
    expect(typeof service.uploadDocument).toBe('function');
  });
});
