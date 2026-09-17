import { DestroyRef, Directive, ElementRef, inject, input, OnInit, output } from '@angular/core';

/** Emits once when the host element enters the viewport so permissions can be lazy-loaded. */
@Directive({
  selector: '[libGroupPermLazyLoad]',
  standalone: true,
})
export class GroupPermLazyLoadDirective implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly groupId = input.required<string>({ alias: 'libGroupPermLazyLoad' });
  readonly visible = output<string>();

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.visible.emit(this.groupId());
          this.observer?.disconnect();
        }
      },
      { rootMargin: '64px' },
    );
    this.observer.observe(this.el.nativeElement);
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }
}
