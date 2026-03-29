import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PublicApiService } from './public-api.service';

export interface ThemeData {
  videoUrl: string | null;
  iconUrl: string | null;
  palette: { primary: string; secondary: string; accent: string } | null;
  variant: number;
  variantLabel: string;
}

function getThemeStorageKey(): string {
  if (typeof localStorage === 'undefined') return 'elvive-dark-mode';
  let vid = localStorage.getItem('elvive-visitor-id');
  if (!vid) {
    vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('elvive-visitor-id', vid);
  }
  return `elvive-theme-${vid}`;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeData>({
    videoUrl: null,
    iconUrl: null,
    palette: null,
    variant: 1,
    variantLabel: 'default'
  });

  private darkModeSubject = new BehaviorSubject<boolean>(true);
  private storageKey = 'elvive-dark-mode';

  theme$ = this.themeSubject.asObservable();
  darkMode$ = this.darkModeSubject.asObservable();

  constructor(private publicApi: PublicApiService) {
    if (typeof localStorage !== 'undefined') {
      this.storageKey = getThemeStorageKey();
      const raw = localStorage.getItem(this.storageKey);
      // Sin valor guardado: modo noche por defecto
      const saved = raw === null ? true : raw === 'true';
      this.darkModeSubject.next(saved);
      document.documentElement.classList.toggle('dark-theme', saved);
      document.documentElement.classList.toggle('light-theme', !saved);
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }

  loadTheme(): void {
    this.publicApi.getHomeConfig().subscribe({
      next: (data) => {
        const theme = data.theme;
        if (theme) {
          this.themeSubject.next({
            videoUrl: theme.videoUrl || null,
            iconUrl: theme.iconUrl || null,
            palette: theme.palette || null,
            variant: theme.context?.variant || 1,
            variantLabel: theme.context?.variantLabel || 'default'
          });
          this.applyPalette(theme.palette);
        }
      },
      error: (err) => console.error('Error cargando theme:', err)
    });
    this.applyDarkMode();
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.getValue();
  }

  toggleDarkMode(): void {
    const next = !this.darkModeSubject.getValue();
    this.darkModeSubject.next(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, String(next));
    }
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    const dark = this.darkModeSubject.getValue();
    document.documentElement.classList.toggle('dark-theme', dark);
    document.documentElement.classList.toggle('light-theme', !dark);
  }

  private applyPalette(palette: any): void {
    if (!palette) return;
    const root = document.documentElement;
    if (palette.primary) root.style.setProperty('--theme-primary', palette.primary);
    if (palette.secondary) root.style.setProperty('--theme-secondary', palette.secondary);
    if (palette.accent) root.style.setProperty('--theme-accent', palette.accent);
  }

  getCurrentTheme(): ThemeData {
    return this.themeSubject.getValue();
  }
}
