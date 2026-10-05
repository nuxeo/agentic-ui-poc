import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'lib-ui',
  imports: [TranslatePipe],
  templateUrl: './ui.html',
  styleUrl: './ui.scss',
})
export class UiComponent {}
