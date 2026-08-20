import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelResizeHandleComponent } from './panel-resize-handle.component';

/**
 * The grip in isolation.
 *
 * Worth its own suite because the sign of the drag is the one thing here that is easy to
 * get backwards and impossible to notice in a unit test of the shell: a panel that gets
 * narrower when you drag it outward still passes every assertion about *a* width changing.
 */
describe('PanelResizeHandleComponent', () => {
  let fixture: ComponentFixture<PanelResizeHandleComponent>;
  let component: PanelResizeHandleComponent;
  let resized: number[];
  let committed: number[];
  let dragStates: boolean[];

  /**
   * A pointer event carrying only what the component reads.
   *
   * `setPointerCapture` is absent from jsdom's element prototype, so the component calls
   * it optionally; here the target is a stub that records the calls, which is how the
   * capture assertions below are possible at all.
   */
  function pointer(clientX: number, overrides: Partial<PointerEvent> = {}): PointerEvent {
    return {
      clientX,
      pointerId: 1,
      button: 0,
      target: captureTarget,
      preventDefault: () => undefined,
      ...overrides,
    } as unknown as PointerEvent;
  }

  let captureTarget: {
    setPointerCapture: jasmine.Spy;
    releasePointerCapture: jasmine.Spy;
  };

  function build(width = 400, min = 320, max = 720, side: 'start' | 'end' = 'end') {
    fixture = TestBed.createComponent(PanelResizeHandleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('width', width);
    fixture.componentRef.setInput('min', min);
    fixture.componentRef.setInput('max', max);
    fixture.componentRef.setInput('side', side);

    resized = [];
    committed = [];
    dragStates = [];
    component.resized.subscribe((value) => resized.push(value));
    component.committed.subscribe((value) => committed.push(value));
    component.dragChanged.subscribe((value) => dragStates.push(value));

    fixture.detectChanges();
  }

  beforeEach(() => {
    captureTarget = {
      setPointerCapture: jasmine.createSpy('setPointerCapture'),
      releasePointerCapture: jasmine.createSpy('releasePointerCapture'),
    };
    TestBed.configureTestingModule({ imports: [PanelResizeHandleComponent] });
  });

  /**
   * The sign. An `end`-anchored panel grows as the pointer moves *left*, because its grip
   * is on its inner edge and its outer edge is pinned to the window.
   */
  it('widens an end-anchored panel when the pointer moves toward the start', () => {
    build(400);

    component.onPointerDown(pointer(1000));
    component.onPointerMove(pointer(940));

    expect(resized).toEqual([460]);
  });

  it('narrows an end-anchored panel when the pointer moves toward the end', () => {
    build(400);

    component.onPointerDown(pointer(1000));
    component.onPointerMove(pointer(1060));

    expect(resized).toEqual([340]);
  });

  it('reverses the sign for a start-anchored panel', () => {
    build(400, 320, 720, 'start');

    component.onPointerDown(pointer(400));
    component.onPointerMove(pointer(460));

    expect(resized).toEqual([460]);
  });

  it('tracks the pointer continuously rather than only on release', () => {
    build(400);

    component.onPointerDown(pointer(1000));
    component.onPointerMove(pointer(980));
    component.onPointerMove(pointer(960));
    component.onPointerMove(pointer(940));

    expect(resized).toEqual([420, 440, 460]);
    expect(committed).toEqual([]);
  });

  it('commits once, on release', () => {
    build(400);

    component.onPointerDown(pointer(1000));
    component.onPointerMove(pointer(950));
    component.onPointerUp(pointer(950));

    expect(committed).toEqual([450]);
  });

  it('clamps the drag to the range it was given', () => {
    build(400, 320, 720);

    component.onPointerDown(pointer(1000));
    component.onPointerMove(pointer(0));
    component.onPointerMove(pointer(2000));

    expect(resized).toEqual([720, 320]);
  });

  /**
   * The grip is 8px wide and the pointer leaves it on the first move, so a drag that
   * relied on the element receiving the events would end immediately. Capture is what
   * keeps the events coming, including a release outside the window.
   */
  it('captures the pointer so the drag survives leaving the grip', () => {
    build();

    component.onPointerDown(pointer(1000));
    expect(captureTarget.setPointerCapture).toHaveBeenCalledWith(1);

    component.onPointerUp(pointer(950));
    expect(captureTarget.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('ignores a move from a pointer that did not start the drag', () => {
    build();

    component.onPointerDown(pointer(1000));
    component.onPointerMove(pointer(900, { pointerId: 2 }));

    expect(resized).toEqual([]);
  });

  it('ignores a move when no drag is in progress', () => {
    build();

    component.onPointerMove(pointer(900));

    expect(resized).toEqual([]);
  });

  it('ignores anything but the primary button', () => {
    build();

    component.onPointerDown(pointer(1000, { button: 2 }));
    component.onPointerMove(pointer(900));

    expect(component.dragging()).toBe(false);
    expect(resized).toEqual([]);
  });

  /**
   * Cancellation is the user saying they did not mean it — the OS took the pointer, or
   * Escape was pressed. Keeping wherever the pointer happened to be would leave the panel
   * mid-drag, which is the one width nobody chose.
   */
  it('reverts to the starting width when the drag is cancelled', () => {
    build(400);

    component.onPointerDown(pointer(1000));
    component.onPointerMove(pointer(900));
    component.onPointerCancel(pointer(900));

    expect(resized).toEqual([500, 400]);
    expect(committed).toEqual([]);
    expect(component.dragging()).toBe(false);
  });

  it('reports the drag state so the panel can drop its width transition', () => {
    build();

    component.onPointerDown(pointer(1000));
    expect(component.dragging()).toBe(true);
    component.onPointerUp(pointer(950));

    expect(dragStates).toEqual([true, false]);
  });

  it('does not start a second drag while one is in progress', () => {
    build(400);

    component.onPointerDown(pointer(1000));
    component.onPointerDown(pointer(500, { pointerId: 2 }));
    component.onPointerMove(pointer(960));

    // Still measured from the first drag's origin, not the second's.
    expect(resized).toEqual([440]);
  });

  describe('keyboard', () => {
    function key(name: string, shiftKey = false): KeyboardEvent {
      return { key: name, shiftKey, preventDefault: () => undefined } as KeyboardEvent;
    }

    it('grows an end-anchored panel with the left arrow', () => {
      build(400);
      component.onKeydown(key('ArrowLeft'));

      expect(resized).toEqual([416]);
      // No release to commit on, so each press commits.
      expect(committed).toEqual([416]);
    });

    it('shrinks an end-anchored panel with the right arrow', () => {
      build(400);
      component.onKeydown(key('ArrowRight'));

      expect(resized).toEqual([384]);
    });

    it('takes a coarser step with shift held', () => {
      build(400);
      component.onKeydown(key('ArrowLeft', true));

      expect(resized).toEqual([464]);
    });

    it('jumps to the widest and narrowest with Home and End', () => {
      build(400, 320, 720);
      component.onKeydown(key('Home'));
      component.onKeydown(key('End'));

      expect(resized).toEqual([720, 320]);
    });

    it('reverses the arrows for a start-anchored panel', () => {
      build(400, 320, 720, 'start');
      component.onKeydown(key('ArrowRight'));

      expect(resized).toEqual([416]);
    });

    it('clamps a step at the edge of the range', () => {
      build(720, 320, 720);
      component.onKeydown(key('ArrowLeft'));

      expect(resized).toEqual([720]);
    });

    it('leaves keys it does not own alone, so Tab still moves the focus', () => {
      build();
      component.onKeydown(key('Tab'));
      component.onKeydown(key('Enter'));
      component.onKeydown(key(' '));

      expect(resized).toEqual([]);
      expect(committed).toEqual([]);
    });
  });

  /**
   * A window too narrow to give the panel and the page behind it both a usable width. The
   * grip going inert is the honest answer; appearing draggable and refusing to move is not.
   */
  describe('in a window with no room to resize', () => {
    it('reports itself disabled when the range has collapsed', () => {
      build(320, 320, 320);
      expect(component.disabled()).toBe(true);
    });

    it('refuses a drag', () => {
      build(320, 320, 320);

      component.onPointerDown(pointer(1000));
      component.onPointerMove(pointer(900));

      expect(component.dragging()).toBe(false);
      expect(resized).toEqual([]);
    });

    it('refuses a key press', () => {
      build(320, 320, 320);
      component.onKeydown({ key: 'ArrowLeft', preventDefault: () => undefined } as KeyboardEvent);

      expect(resized).toEqual([]);
    });

    it('drops out of the tab order and says so', () => {
      build(320, 320, 320);
      const grip: HTMLElement = fixture.nativeElement.querySelector('.panel-resize-grip');

      expect(grip.getAttribute('aria-disabled')).toBe('true');
      expect(grip.getAttribute('tabindex')).toBe('-1');
    });
  });

  /**
   * `separator` with a value is the role that makes arrow keys mean "move me" rather than
   * "move the focus", and the values are what a screen reader reads out during a resize.
   */
  it('exposes itself as a focusable separator carrying its range', () => {
    build(480, 320, 720);
    const grip: HTMLElement = fixture.nativeElement.querySelector('.panel-resize-grip');

    expect(grip.getAttribute('role')).toBe('separator');
    expect(grip.getAttribute('aria-orientation')).toBe('vertical');
    expect(grip.getAttribute('aria-valuenow')).toBe('480');
    expect(grip.getAttribute('aria-valuemin')).toBe('320');
    expect(grip.getAttribute('aria-valuemax')).toBe('720');
    expect(grip.getAttribute('tabindex')).toBe('0');
  });

  it('takes its accessible name from the panel it resizes', () => {
    build();
    fixture.componentRef.setInput('label', 'Resize the AI assistant panel');
    fixture.detectChanges();

    const grip: HTMLElement = fixture.nativeElement.querySelector('.panel-resize-grip');
    expect(grip.getAttribute('aria-label')).toBe('Resize the AI assistant panel');
  });
});
