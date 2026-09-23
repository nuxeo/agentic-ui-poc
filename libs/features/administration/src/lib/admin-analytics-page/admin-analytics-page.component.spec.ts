import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AdminAnalyticsPageComponent } from './admin-analytics-page.component';
import { AdministrationService } from '@nuxeo-satori/platform/nuxeo-client';
import { TranslateService } from '@ngx-translate/core';
import { AiGatewayService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';

describe('AdminAnalyticsPageComponent', () => {
  let component: AdminAnalyticsPageComponent;
  let fixture: ComponentFixture<AdminAnalyticsPageComponent>;
  let mockAdminService: {
    getDefaultDomainPath: ReturnType<typeof vi.fn>;
    getNxqlTotalSize: ReturnType<typeof vi.fn>;
    nxqlSearch: ReturnType<typeof vi.fn>;
  };
  let mockTranslateService: {
    instant: ReturnType<typeof vi.fn>;
  };
  let mockAiGatewayService: {
    detectAnomalies: ReturnType<typeof vi.fn>;
  };
  let mockAiFeatureFlagService: Record<string, unknown>;

  beforeEach(() => {
    mockAdminService = {
      getDefaultDomainPath: vi.fn(),
      getNxqlTotalSize: vi.fn(),
      nxqlSearch: vi.fn(),
    };

    mockTranslateService = {
      instant: vi.fn((key: string) => key),
    };

    mockAiGatewayService = {
      detectAnomalies: vi.fn(),
    };

    mockAiFeatureFlagService = {};

    TestBed.configureTestingModule({
      imports: [AdminAnalyticsPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AdministrationService, useValue: mockAdminService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: AiGatewayService, useValue: mockAiGatewayService },
        { provide: AiFeatureFlagService, useValue: mockAiFeatureFlagService },
      ],
    });

    fixture = TestBed.createComponent(AdminAnalyticsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize with all signal default values', () => {
      expect(component.distPath()).toBe('/default-domain/');
      expect(component.repoPath()).toBe('/default-domain/');
      expect(component.distLoading()).toBe(false);
      expect(component.repoLoading()).toBe(false);
      expect(component.wfLoading()).toBe(false);
      expect(component.distributionWarning()).toBe(false);
      expect(component.totalUnderPath()).toBeNull();
      expect(component.typeRows()).toEqual([]);
      expect(component.repoDocs()).toEqual([]);
      expect(component.repoTotal()).toBe(0);
      expect(component.searchMetricTotal()).toBeNull();
      expect(component.wfTotal()).toBeNull();
      expect(component.aiAnomalies()).toEqual([]);
      expect(component.aiAnomalySummary()).toBe('');
      expect(component.aiAnomalyLoading()).toBe(false);
      expect(component.aiAnomalyTimeRange()).toBe('24h');
    });

    it('should have featureFlags service properly injected and accessible', () => {
      expect(component.featureFlags).toBeDefined();
      expect(component.featureFlags).toBe(mockAiFeatureFlagService);
    });
  });

  describe('ngOnInit', () => {
    it('should successfully fetch default domain path and trigger all refresh methods', () => {
      const mockPath = '/default-domain';
      mockAdminService.getDefaultDomainPath.mockReturnValue(of(mockPath));
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(0));
      mockAdminService.nxqlSearch.mockReturnValue(of({ entries: [], totalSize: 0 }));

      component.ngOnInit();

      expect(mockAdminService.getDefaultDomainPath).toHaveBeenCalled();
      expect(component.distPath()).toBe('/default-domain/');
      expect(component.repoPath()).toBe('/default-domain/');
      expect(mockAdminService.getNxqlTotalSize).toHaveBeenCalled();
      expect(mockAdminService.nxqlSearch).toHaveBeenCalled();
    });

    it('should normalize default domain path with trailing slash', () => {
      const mockPath = '/custom-domain';
      mockAdminService.getDefaultDomainPath.mockReturnValue(of(mockPath));
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(0));
      mockAdminService.nxqlSearch.mockReturnValue(of({ entries: [], totalSize: 0 }));

      component.ngOnInit();

      expect(component.distPath()).toBe('/custom-domain/');
      expect(component.repoPath()).toBe('/custom-domain/');
    });

    it('should handle error when fetching default domain path and still trigger refresh methods', () => {
      mockAdminService.getDefaultDomainPath.mockReturnValue(
        throwError(() => new Error('API Error')),
      );
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(0));
      mockAdminService.nxqlSearch.mockReturnValue(of({ entries: [], totalSize: 0 }));

      component.ngOnInit();

      expect(mockAdminService.getDefaultDomainPath).toHaveBeenCalled();
      expect(mockAdminService.getNxqlTotalSize).toHaveBeenCalled();
      expect(mockAdminService.nxqlSearch).toHaveBeenCalled();
    });
  });

  describe('refreshDistribution', () => {
    it('should fetch total count and type distribution with valid non-default path', () => {
      component.distPath.set('/workspaces/test');
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(100));

      component.refreshDistribution();

      expect(component.distPath()).toBe('/workspaces/test/');
      expect(component.distributionWarning()).toBe(false);
      expect(component.distLoading()).toBe(false);
      expect(mockAdminService.getNxqlTotalSize).toHaveBeenCalledTimes(7);
      expect(component.totalUnderPath()).toBe(100);
      expect(component.typeRows().length).toBe(6);
    });

    it('should set warning flag and clear data with default domain path without API calls', () => {
      component.distPath.set('/default-domain/');

      component.refreshDistribution();

      expect(component.distributionWarning()).toBe(true);
      expect(component.totalUnderPath()).toBeNull();
      expect(component.typeRows()).toEqual([]);
      expect(mockAdminService.getNxqlTotalSize).not.toHaveBeenCalled();
    });

    it('should normalize path by adding trailing slash', () => {
      component.distPath.set('/workspaces/test');
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(50));

      component.refreshDistribution();

      expect(component.distPath()).toBe('/workspaces/test/');
    });

    it('should handle API errors by clearing data and stopping loading spinner', () => {
      component.distPath.set('/workspaces/test');
      mockAdminService.getNxqlTotalSize.mockReturnValue(throwError(() => new Error('API Error')));

      component.refreshDistribution();

      expect(component.distLoading()).toBe(false);
      expect(component.totalUnderPath()).toBeNull();
      expect(component.typeRows()).toEqual([]);
    });

    it('should escape single quotes in NXQL path literals', () => {
      component.distPath.set("/workspaces/test's-path");
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(10));

      component.refreshDistribution();

      const calls = mockAdminService.getNxqlTotalSize.mock.calls;
      expect(calls[0][0]).toContain("test''s-path");
    });

    it('should query all primary types: Folder, File, Note, Picture, Workspace, Collection', () => {
      component.distPath.set('/workspaces/test');
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(10));

      component.refreshDistribution();

      expect(mockAdminService.getNxqlTotalSize).toHaveBeenCalledTimes(7);
      const calls = mockAdminService.getNxqlTotalSize.mock.calls;
      expect(calls[1][0]).toContain("ecm:primaryType = 'Folder'");
      expect(calls[2][0]).toContain("ecm:primaryType = 'File'");
      expect(calls[3][0]).toContain("ecm:primaryType = 'Note'");
      expect(calls[4][0]).toContain("ecm:primaryType = 'Picture'");
      expect(calls[5][0]).toContain("ecm:primaryType = 'Workspace'");
      expect(calls[6][0]).toContain("ecm:primaryType = 'Collection'");
    });
  });

  describe('refreshRepositorySample', () => {
    it('should fetch up to 25 documents sorted by modified date descending', () => {
      const mockDocs = [
        { uid: '1', path: '/doc1', type: 'File', properties: { 'dc:modified': '2026-09-20' } },
        { uid: '2', path: '/doc2', type: 'Folder', properties: { 'dc:modified': '2026-09-19' } },
      ];
      component.repoPath.set('/workspaces/test');
      mockAdminService.nxqlSearch.mockReturnValue(of({ entries: mockDocs, totalSize: 2 }));

      component.refreshRepositorySample();

      expect(component.repoPath()).toBe('/workspaces/test/');
      expect(mockAdminService.nxqlSearch).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY dc:modified DESC'),
        25,
        0,
      );
      expect(component.repoDocs()).toEqual(mockDocs);
      expect(component.repoTotal()).toBe(2);
      expect(component.repoLoading()).toBe(false);
    });

    it('should normalize path with trailing slash', () => {
      component.repoPath.set('/workspaces/test');
      mockAdminService.nxqlSearch.mockReturnValue(of({ entries: [], totalSize: 0 }));

      component.refreshRepositorySample();

      expect(component.repoPath()).toBe('/workspaces/test/');
    });

    it('should handle API errors by clearing docs and stopping spinner', () => {
      component.repoPath.set('/workspaces/test');
      mockAdminService.nxqlSearch.mockReturnValue(throwError(() => new Error('API Error')));

      component.refreshRepositorySample();

      expect(component.repoDocs()).toEqual([]);
      expect(component.repoTotal()).toBe(0);
      expect(component.repoLoading()).toBe(false);
    });
  });

  describe('refreshSearchMetric', () => {
    it('should fetch total searchable document count', () => {
      const mockCount = 500;
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(mockCount));

      component.refreshSearchMetric();

      expect(mockAdminService.getNxqlTotalSize).toHaveBeenCalledWith(
        expect.stringContaining("ecm:mixinType != 'HiddenInNavigation'"),
      );
      expect(component.searchMetricTotal()).toBe(mockCount);
    });

    it('should handle API errors by setting null value', () => {
      mockAdminService.getNxqlTotalSize.mockReturnValue(throwError(() => new Error('API Error')));

      component.refreshSearchMetric();

      expect(component.searchMetricTotal()).toBeNull();
    });
  });

  describe('runAnomalyDetection', () => {
    it('should call AI gateway with current time range signal value', () => {
      const mockResponse = {
        anomalies: [
          { timestamp: '2026-09-22T10:00:00Z', severity: 'high', description: 'Test anomaly' },
        ],
        summary: 'Test summary',
      };
      component.aiAnomalyTimeRange.set('7d');
      mockAiGatewayService.detectAnomalies.mockReturnValue(of(mockResponse));

      component.runAnomalyDetection();

      expect(mockAiGatewayService.detectAnomalies).toHaveBeenCalledWith('7d');
    });

    it('should update anomalies and summary on success', () => {
      const mockResponse = {
        anomalies: [
          { timestamp: '2026-09-22T10:00:00Z', severity: 'high', description: 'Test anomaly 1' },
          { timestamp: '2026-09-22T11:00:00Z', severity: 'medium', description: 'Test anomaly 2' },
        ],
        summary: 'Found 2 anomalies in the last 24 hours',
      };
      mockAiGatewayService.detectAnomalies.mockReturnValue(of(mockResponse));

      component.runAnomalyDetection();

      expect(component.aiAnomalies()).toEqual(mockResponse.anomalies);
      expect(component.aiAnomalySummary()).toBe(mockResponse.summary);
      expect(component.aiAnomalyLoading()).toBe(false);
    });

    it('should handle errors with translated error message and clear anomalies', () => {
      const errorMessage = 'admin.message.failed-to-detect-anomalies';
      mockTranslateService.instant.mockReturnValue(errorMessage);
      mockAiGatewayService.detectAnomalies.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      component.runAnomalyDetection();

      expect(component.aiAnomalies()).toEqual([]);
      expect(component.aiAnomalySummary()).toBe(errorMessage);
      expect(mockTranslateService.instant).toHaveBeenCalledWith(
        'admin.message.failed-to-detect-anomalies',
      );
      expect(component.aiAnomalyLoading()).toBe(false);
    });

    it('should set loading state correctly during async operation', () => {
      const mockResponse = {
        anomalies: [],
        summary: 'No anomalies detected',
      };
      mockAiGatewayService.detectAnomalies.mockReturnValue(of(mockResponse));

      expect(component.aiAnomalyLoading()).toBe(false);

      component.runAnomalyDetection();

      expect(component.aiAnomalyLoading()).toBe(false);
    });
  });

  describe('severityColor', () => {
    it('should return #d32f2f for high severity', () => {
      expect(component.severityColor('high')).toBe('#d32f2f');
    });

    it('should return #ed6c02 for medium severity', () => {
      expect(component.severityColor('medium')).toBe('#ed6c02');
    });

    it('should return #2e7d32 for low severity', () => {
      expect(component.severityColor('low')).toBe('#2e7d32');
    });

    it('should return #2e7d32 for any other severity', () => {
      expect(component.severityColor('unknown')).toBe('#2e7d32');
      expect(component.severityColor('')).toBe('#2e7d32');
      expect(component.severityColor('info')).toBe('#2e7d32');
    });
  });

  describe('refreshWorkflow', () => {
    it('should fetch workflow document count with correct NXQL query', () => {
      const mockCount = 42;
      mockAdminService.getNxqlTotalSize.mockReturnValue(of(mockCount));

      component.refreshWorkflow();

      expect(mockAdminService.getNxqlTotalSize).toHaveBeenCalledWith(
        "SELECT * FROM Document WHERE ecm:primaryType IN ('DocumentRoute', 'Route', 'RoutingTask')",
      );
      expect(component.wfTotal()).toBe(mockCount);
      expect(component.wfLoading()).toBe(false);
    });

    it('should handle API errors by setting null value and stopping spinner', () => {
      mockAdminService.getNxqlTotalSize.mockReturnValue(throwError(() => new Error('API Error')));

      component.refreshWorkflow();

      expect(component.wfTotal()).toBeNull();
      expect(component.wfLoading()).toBe(false);
    });
  });
});
