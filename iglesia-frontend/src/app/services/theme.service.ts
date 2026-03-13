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

  theme$ = this.themeSubject.asObservable();

  constructor(private publicApi: PublicApiService) {}

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
