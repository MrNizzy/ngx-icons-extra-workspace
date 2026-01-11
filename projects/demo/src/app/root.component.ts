import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggle } from './components/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle],
  template: `
    <router-outlet />
    <app-theme-toggle />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRoot {}
