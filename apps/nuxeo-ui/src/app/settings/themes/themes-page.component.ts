import { NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { APP_THEMES, AppThemeDefinition } from '../../theme/app-theme';
import { AppThemeService } from '../../theme/app-theme.service';

@Component({
  standalone: true,
  selector: 'app-themes-page',
  imports: [NgStyle, MatButtonModule, MatIconModule],
  templateUrl: './themes-page.component.html',
  styleUrl: './themes-page.component.scss',
})
export class ThemesPageComponent {
  protected readonly themes = APP_THEMES;
  protected readonly theme = inject(AppThemeService);

  previewVars(t: AppThemeDefinition): Record<string, string> {
    const p = t.preview;
    return {
      '--tp-sidebar': p.sidebar,
      '--tp-surface': p.surface,
      '--tp-header': p.header,
      '--tp-accent': p.accent,
      '--tp-tile': p.tile,
    };
  }
}
