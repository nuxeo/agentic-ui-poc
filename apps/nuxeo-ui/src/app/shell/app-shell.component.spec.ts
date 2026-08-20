import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SatPlatformNavStateService } from '@hylandsoftware/satori-ui/platform-nav';
import { NEVER, of } from 'rxjs';

import { AiChatService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';
import {
  BrowseContextService,
  CollectionService,
  DocumentDetailService,
  SearchService,
  SelectionService,
} from '@agentic-ui/shared/nuxeo-client';

import { AuthService } from '../auth/auth.service';
import { SessionTimeoutService } from '../auth/session-timeout.service';
import { PLATFORM_NAV_ITEMS, type AppNavItem } from '../platform-nav-items';
import { AppShellComponent } from './app-shell.component';

/**
 * Built through the injector rather than rendered: these tests are about the nav-click
 * routing decision, and instantiating the template would drag in the whole Satori platform
 * nav for no extra signal.
 */
function navItem(path: string): AppNavItem {
  const item = PLATFORM_NAV_ITEMS.find((entry) => entry.path === path);
  if (!item) throw new Error(`No nav item for ${path}`);
  return item;
}

/**
 * The panel frame's state, which the shell reads and writes but does not own — it lives on
 * `AiChatService` because the panel component is destroyed on every close and a width held
 * there would reset on each toggle.
 */
function fakeChat() {
  return {
    panelOpen: signal(false),
    panelWidth: signal(400),
    togglePanel: jasmine.createSpy('togglePanel'),
    setContext: jasmine.createSpy('setContext'),
    setPanelWidth: jasmine.createSpy('setPanelWidth'),
    resetPanelWidth: jasmine.createSpy('resetPanelWidth'),
  };
}

describe('AppShellComponent nav clicks', () => {
  let router: jasmine.SpyObj<Router>;
  let auth: {
    isAdministrator: jasmine.Spy;
    hasAdministrationAccess: jasmine.Spy;
    username: () => string;
  };
  let event: jasmine.SpyObj<Event>;
  let chat: ReturnType<typeof fakeChat>;
  let built: AppShellComponent | null = null;
  const realInnerWidth = window.innerWidth;

  function build(): AppShellComponent {
    built = TestBed.runInInjectionContext(() => new AppShellComponent());
    return built;
  }

  /**
   * Drives the shell's viewport signal the way the real listener does.
   *
   * `innerWidth` is writable but not reset between specs, so it is restored in `afterEach`
   * — a leaked narrow window would make the panel-width expectations of every later spec
   * depend on the order they ran in.
   */
  function setViewportWidth(width: number): void {
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    window.dispatchEvent(new Event('resize'));
  }

  afterEach(() => {
    // No fixture, so the window listeners the constructor adds need removing by hand.
    built?.ngOnDestroy();
    built = null;
    Object.defineProperty(window, 'innerWidth', {
      value: realInnerWidth,
      configurable: true,
    });
  });

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl', 'navigate'], {
      url: '/dashboard',
      events: NEVER,
    });
    auth = {
      isAdministrator: jasmine.createSpy('isAdministrator').and.returnValue(true),
      hasAdministrationAccess: jasmine.createSpy('hasAdministrationAccess').and.returnValue(true),
      username: () => 'jdoe',
    };
    event = jasmine.createSpyObj<Event>('Event', ['preventDefault', 'stopPropagation']);
    chat = fakeChat();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        {
          provide: SatPlatformNavStateService,
          useValue: { collapsed: () => true, toggleCollapsed: jasmine.createSpy('toggle') },
        },
        {
          provide: SessionTimeoutService,
          useValue: { start: jasmine.createSpy('start'), stop: jasmine.createSpy('stop') },
        },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']),
        },
        { provide: MatDialog, useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open']) },
        {
          provide: SelectionService,
          useValue: {
            selectedCount: signal(0),
            selectedItems: signal([]),
            clear: jasmine.createSpy('clear'),
          },
        },
        {
          provide: CollectionService,
          useValue: { getFavorites: () => of({ entries: [], totalSize: 0 }) },
        },
        {
          provide: DocumentDetailService,
          useValue: jasmine.createSpyObj<DocumentDetailService>('DocumentDetailService', [
            'fetchThumbnail',
            'getVersions',
            'bulkDownload',
            'addToCollection',
          ]),
        },
        {
          provide: SearchService,
          useValue: jasmine.createSpyObj<SearchService>('SearchService', [
            'suggestFromSuggestersLauncher',
          ]),
        },
        {
          provide: BrowseContextService,
          useValue: jasmine.createSpyObj<BrowseContextService>('BrowseContextService', [
            'setFromRouterUrl',
            'requestTreeRefresh',
          ]),
        },
        { provide: AiChatService, useValue: chat },
        {
          provide: AiFeatureFlagService,
          useValue: { aiEnabled: signal(true), agentPathEnabled: signal(false) },
        },
      ],
    });
  });

  // The three list pages exist and are lazily routed, but every entry in their drawers
  // opens a document, so before this the pages could only be reached by typing the URL.
  for (const path of ['/recently-viewed', '/expired-queue', '/favorites']) {
    it(`opens the drawer and the page for ${path}`, () => {
      const shell = build();

      shell.onNavClick(navItem(path), event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(shell.drawerOpen()).toBe(true);
      expect(shell.activeDrawerItem()?.path).toBe(path);
      expect(router.navigateByUrl).toHaveBeenCalledWith(path);
    });
  }

  // For these the drawer chooses which page to open — a folder, a task, a filter — so
  // navigating on the nav click would make that choice for the user.
  for (const path of ['/browse', '/search', '/tasks', '/documents', '/collections', '/trash']) {
    it(`opens only the drawer for ${path}`, () => {
      const shell = build();

      shell.onNavClick(navItem(path), event);

      expect(shell.drawerOpen()).toBe(true);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  }

  it('closes the drawer on a second click without navigating again', () => {
    const shell = build();

    shell.onNavClick(navItem('/favorites'), event);
    router.navigateByUrl.calls.reset();
    shell.onNavClick(navItem('/favorites'), event);

    expect(shell.drawerOpen()).toBe(false);
    expect(shell.activeDrawerItem()).toBeNull();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('sends an administrator to analytics and a poweruser to users & groups', () => {
    const shell = build();

    shell.onNavClick(navItem('/administration'), event);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/administration/analytics');

    shell.onNavClick(navItem('/administration'), event);
    auth.isAdministrator.and.returnValue(false);
    shell.onNavClick(navItem('/administration'), event);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/administration/users-groups');
  });

  it('navigates and leaves no drawer open for an item that has no drawer', () => {
    const shell = build();

    shell.onNavClick(navItem('/favorites'), event);
    shell.onNavClick(navItem('/dashboard'), event);

    expect(shell.drawerOpen()).toBe(false);
    expect(shell.activeDrawerItem()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  /**
   * The shell's half of a resizable assistant panel: it owns the drawer frame, so it is
   * what turns the grip's reported width into a width the drawer is actually given.
   *
   * The clamp is the part worth pinning here rather than in the size module, because the
   * shell is where the viewport enters the calculation — a `side` drawer takes its width
   * out of the page rather than covering it, so an unbounded panel does not overlap the
   * document list, it squeezes it to nothing.
   */
  describe('assistant panel width', () => {
    // The Karma window is ~756px, narrow enough that every width here would be trimmed by
    // the content floor. Each spec states the window it means, so none of them depends on
    // the size of the browser the suite happens to run in.
    it('offers the stored width to the drawer', () => {
      chat.panelWidth.set(560);
      const shell = build();
      setViewportWidth(1440);

      expect(shell.aiChatWidth()).toBe(560);
    });

    it('persists a width the user released on', () => {
      const shell = build();
      shell.onAiChatResizeCommitted(520);

      expect(chat.setPanelWidth).toHaveBeenCalledWith(520);
    });

    // A drag emits a width per pointer event. Persisting each one would write storage
    // dozens of times for a single gesture and record widths the user only passed through.
    it('moves the panel without persisting while the grip is being dragged', () => {
      const shell = build();
      shell.onAiChatResize(520);

      expect(chat.setPanelWidth).toHaveBeenCalledWith(520, false);
    });

    it('restores the default width on a double-click', () => {
      build().resetAiChatWidth();
      expect(chat.resetPanelWidth).toHaveBeenCalled();
    });

    it('reports the drag so the panel can drop its width transition', () => {
      const shell = build();
      expect(shell.aiChatResizing()).toBe(false);

      shell.onAiChatResizingChanged(true);
      expect(shell.aiChatResizing()).toBe(true);

      shell.onAiChatResizingChanged(false);
      expect(shell.aiChatResizing()).toBe(false);
    });

    it('caps the grip at a width that leaves the page behind it usable', () => {
      const shell = build();

      // 1440px has room for the panel's own 720px maximum...
      setViewportWidth(1440);
      expect(shell.aiChatMaxWidth()).toBe(720);

      // ...900px does not, so what is left after the content's floor wins.
      setViewportWidth(900);
      expect(shell.aiChatMaxWidth()).toBe(540);
    });

    /**
     * The stored preference survives a narrow window. It is trimmed for as long as the
     * window is small and comes back when it is widened, rather than being overwritten —
     * which is why the shell clamps on read and the service clamps on write.
     */
    it('narrows a wide preference to fit a small window without forgetting it', () => {
      chat.panelWidth.set(700);
      const shell = build();

      setViewportWidth(900);
      expect(shell.aiChatWidth()).toBe(540);
      expect(chat.setPanelWidth).not.toHaveBeenCalled();

      setViewportWidth(1440);
      expect(shell.aiChatWidth()).toBe(700);
    });

    it('stops offering to resize in a window with no room for it', () => {
      const shell = build();
      setViewportWidth(600);

      expect(shell.aiChatMaxWidth()).toBe(shell.aiChatMinWidth);
    });
  });
});
