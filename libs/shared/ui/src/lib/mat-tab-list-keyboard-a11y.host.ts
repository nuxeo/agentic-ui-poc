import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';

import { MatTabListKeydownDirective } from './mat-tab-list-keydown.directive';

@Component({
  standalone: true,
  imports: [MatTabsModule, MatTabListKeydownDirective, TranslateModule],
  templateUrl: './mat-tab-list-keyboard-a11y.host.html',
})
export class MatTabListKeyboardA11yHostComponent {}
