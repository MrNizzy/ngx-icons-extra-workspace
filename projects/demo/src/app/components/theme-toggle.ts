import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../services/theme.service';
import { NgxIcon } from 'ngx-icons-extra';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatButtonModule, MatIconModule, NgxIcon],
  template: `
    <button
      mat-fab
      class="theme-toggle-btn"
      (click)="themeService.toggleTheme()"
      matTooltip="Cambiar tema"
      matTooltipPosition="left"
    >
      <mat-icon>
        @if (themeService.isDarkMode()) {
        <ngx-icon collection="line-md" icon="moon-alt-to-sunny-outline-loop-transition" />
        } @else {
        <ngx-icon collection="line-md" icon="sunny-outline-to-moon-loop-transition"></ngx-icon>
        }
      </mat-icon>
    </button>
  `,
  styles: [
    `
      .theme-toggle-btn {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 1000;
        border: 1px solid color-mix(in srgb, var(--mat-sys-outline-variant) 40%, transparent);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
        transition: all 0.3s ease;
      }

      .theme-toggle-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px color-mix(in srgb, var(--mat-sys-primary) 20%, transparent);
      }

      .theme-toggle-btn:active {
        transform: scale(0.95);
      }

      @media (max-width: 768px) {
        .theme-toggle-btn {
          bottom: 1rem;
          right: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);
}
