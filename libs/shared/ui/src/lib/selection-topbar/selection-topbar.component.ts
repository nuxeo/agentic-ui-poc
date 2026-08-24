import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'lib-selection-topbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './selection-topbar.component.html',
  styleUrl: './selection-topbar.component.scss',
})
export class SelectionTopbarComponent {
  @ViewChild('selectionPopupPanel')
  private selectionPopupPanel?: ElementRef<HTMLElement>;

  private lastFocusedElement: HTMLElement | null = null;

  readonly selectedCount = input.required<number>();
  readonly selectedItems = input<
    Array<{ id: string; name: string; preview: SafeUrl | string | null }>
  >([]);
  readonly clearOnly = input(false);
  readonly cleared = output<void>();
  readonly publishRequested = output<void>();
  readonly addToClipboardRequested = output<void>();
  readonly addToCollectionRequested = output<void>();
  readonly downloadZipRequested = output<void>();
  readonly compareRequested = output<void>();
  readonly deleted = output<void>();
  readonly selectionPopupOpen = signal(false);

  private readonly closePopupInClearOnlyMode = effect(() => {
    if (this.clearOnly()) {
      this.selectionPopupOpen.set(false);
    }
  });

  openSelectionPopup(): void {
    this.lastFocusedElement = document.activeElement as HTMLElement | null;
    this.selectionPopupOpen.set(true);
    queueMicrotask(() => {
      this.selectionPopupPanel?.nativeElement.focus();
    });
  }

  closeSelectionPopup(): void {
    this.selectionPopupOpen.set(false);
    const elementToFocus = this.lastFocusedElement;
    this.lastFocusedElement = null;
    if (elementToFocus) {
      queueMicrotask(() => elementToFocus.focus());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectionPopupOpen()) {
      this.closeSelectionPopup();
    }
  }
}
