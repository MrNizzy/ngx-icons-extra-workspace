import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly _currentTheme = signal<Theme>('light');
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    // Recuperar tema del localStorage o preferencia del sistema
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemTheme = this.getSystemTheme();
    const initialTheme = savedTheme || systemTheme;

    this.setTheme(initialTheme);
  }

  toggleTheme(): void {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    localStorage.setItem('theme', theme);

    // Actualizar clase en el body
    const body = this.document.body;
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(`${theme}-mode`);

    // Actualizar data attribute para Angular Material
    body.setAttribute('data-theme', theme);
  }

  private getSystemTheme(): Theme {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  isDarkMode(): boolean {
    return this._currentTheme() === 'dark';
  }

  isLightMode(): boolean {
    return this._currentTheme() === 'light';
  }
}
