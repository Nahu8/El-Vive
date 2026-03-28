import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicApiService } from '../../services/public-api.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  isMenuOpen = false;
  showFirstLogo = true;
  private _logoInterval: any = null;

  currentIconUrl: string = '/assets/imagenes/elvive.png';
  private headerIconUrl = '';
  private headerIconUrlLight = '';
  private headerIconUrlDark = '';
  navLinks: { label: string; path: string }[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Nosotros', path: '/nosotros' },
    { label: 'Ministerios', path: '/ministerios' },
    { label: 'Días de Reunión', path: '/dias-reunion' },
    { label: 'Donaciones', path: '/donaciones' },
    { label: 'Contacto', path: '/contacto' }
  ];

  constructor(
    private publicApi: PublicApiService,
    public themeService: ThemeService
  ) {}

  private resolveIconUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? environment.apiBaseUrl + path : environment.apiBaseUrl + '/' + path;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngAfterViewInit(): void {
    this.loadNavbarTheme();
    this.themeService.darkMode$.subscribe(() => this.updateIconByTheme());
    this._logoInterval = setInterval(() => {
      this.showFirstLogo = !this.showFirstLogo;
    }, 20000);
  }

  private updateIconByTheme(): void {
    const dark = this.themeService.isDarkMode();
    const url = dark
      ? (this.headerIconUrlDark || this.headerIconUrl)
      : (this.headerIconUrlLight || this.headerIconUrl);
    this.currentIconUrl = url ? this.resolveIconUrl(url) : '/assets/imagenes/elvive.png';
  }

  private loadNavbarTheme() {
    forkJoin({
      layout: this.publicApi.getLayoutConfig(),
      home: this.publicApi.getHomeConfig()
    }).subscribe({
      next: ({ layout, home }) => {
        if (layout.navLinks?.length) this.navLinks = layout.navLinks;
        this.headerIconUrl = layout.headerIconUrl || '';
        this.headerIconUrlLight = layout.headerIconUrlLight || '';
        this.headerIconUrlDark = layout.headerIconUrlDark || '';
        if (home.theme?.iconUrl && !this.headerIconUrl && !this.headerIconUrlLight && !this.headerIconUrlDark) {
          this.headerIconUrl = home.theme.iconUrl;
        }
        this.updateIconByTheme();
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    if (this._logoInterval) {
      clearInterval(this._logoInterval);
      this._logoInterval = null;
    }
  }
  
}
