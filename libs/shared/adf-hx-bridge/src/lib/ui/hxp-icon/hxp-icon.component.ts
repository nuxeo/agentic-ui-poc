import { Component, computed, input } from '@angular/core';
import { HXP_ICON_PATHS, type HxpIconName } from './hxp-icon-paths';

export type { HxpIconName };

@Component({
  selector: 'hxp-icon',
  standalone: true,
  templateUrl: './hxp-icon.component.html',
  styleUrl: './hxp-icon.component.scss',
  host: {
    class: 'hxp-icon',
    '[class.hxp-icon--sm]': 'size() === "sm"',
    '[class.hxp-icon--md]': 'size() === "md"',
    '[class.hxp-icon--lg]': 'size() === "lg"',
    role: 'img',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.aria-label]': '!decorative() ? label() : null',
  },
})
export class HxpIconComponent {
  readonly name = input.required<HxpIconName>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly decorative = input(true);
  readonly label = input('');

  protected readonly paths = computed(() => {
    const raw = HXP_ICON_PATHS[this.name()];
    return Array.isArray(raw) ? raw : [raw];
  });
}
