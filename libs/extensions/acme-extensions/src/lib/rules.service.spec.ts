import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { EMPTY_EXTENSION_RULE_CONTEXT } from '@nuxeo-satori/platform/extensions';

import { AcmeRulesService } from './rules.service';

describe('AcmeRulesService', () => {
  let service: AcmeRulesService;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AcmeRulesService],
    });
    service = TestBed.inject(AcmeRulesService);
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // Mock implementation - suppress console output in tests
    });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('isLegalTeam', () => {
    it('returns true when user has a username', () => {
      const context = {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        user: { username: 'testuser', isAdministrator: false },
      };
      expect(service.isLegalTeam(context)).toBe(true);
    });

    it('returns false when user has no username', () => {
      const context = {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        user: { username: null, isAdministrator: false },
      };
      expect(service.isLegalTeam(context)).toBe(false);
    });
  });

  describe('exportSummary', () => {
    it('logs a warning with context details when called', () => {
      const context = {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        url: '/documents/123',
        selectionCount: 5,
        document: { uid: 'doc-123' },
      };

      service.exportSummary(context);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[acme] exportSummary is not implemented yet', {
        url: '/documents/123',
        selectionCount: 5,
        document: 'doc-123',
      });
    });

    it('handles context without document', () => {
      const context = {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        url: '/browse',
        selectionCount: 0,
        document: null,
      };

      service.exportSummary(context);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[acme] exportSummary is not implemented yet', {
        url: '/browse',
        selectionCount: 0,
        document: null,
      });
    });
  });

  describe('exportClaim', () => {
    it('logs a warning with context details when called', () => {
      const context = {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        url: '/documents/456',
        selectionCount: 3,
        document: { uid: 'doc-456' },
      };

      service.exportClaim(context);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[acme] exportClaim is not implemented yet', {
        url: '/documents/456',
        selectionCount: 3,
        document: 'doc-456',
      });
    });

    it('handles context without document', () => {
      const context = {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        url: '/search',
        selectionCount: 10,
        document: null,
      };

      service.exportClaim(context);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[acme] exportClaim is not implemented yet', {
        url: '/search',
        selectionCount: 10,
        document: null,
      });
    });
  });
});
