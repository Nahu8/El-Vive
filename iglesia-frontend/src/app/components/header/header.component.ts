import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicApiService } from '../../services/public-api.service';

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
  navClasses: string = 'bg-transparent border-b border-transparent text-white';
  navLinks: { label: string; path: string }[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Ministerios', path: '/ministerios' },
    { label: 'Días de Reunión', path: '/dias-reunion' },
    { label: 'Contacto', path: '/contacto' }
  ];

  constructor(private publicApi: PublicApiService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngAfterViewInit(): void {
    this.loadNavbarTheme();
    // Toggle logos every 20 seconds
    this._logoInterval = setInterval(() => {
      this.showFirstLogo = !this.showFirstLogo;
    }, 20000);
  }

  private loadNavbarTheme() {
    this.publicApi.getLayoutConfig().subscribe({
      next: (data) => {
        if (data.navLinks?.length) {
          this.navLinks = data.navLinks;
        }
      },
      error: () => {}
    });
    this.publicApi.getHomeConfig().subscribe({
      next: (data) => {
        const theme = data.theme;
        if (theme?.iconUrl) {
          this.currentIconUrl = theme.iconUrl;
        }
        if (theme?.palette) {
          const palette = theme.palette as any;
          const text = palette.navText || 'white';
          this.navClasses = `border-b text-${text}`;
        }
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
