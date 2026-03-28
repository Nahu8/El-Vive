import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicApiService } from '../../services/public-api.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  footerBrandTitle = 'ÉL VIVE IGLESIA';
  footerIconUrl = '';
  private _footerIconUrl = '';
  private _footerIconUrlLight = '';
  private _footerIconUrlDark = '';
  footerBrandDescription = 'Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad. Únete a nosotros en nuestro viaje espiritual.';
  footerFacebookUrl = '';
  footerInstagramUrl = '';
  footerYoutubeUrl = '';
  footerAddress = '';
  footerEmail = '';
  footerPhone = '';
  footerCopyright = '© 2025 ÉL VIVE IGLESIA. Todos los derechos reservados.';
  footerPrivacyUrl = '#';
  footerTermsUrl = '#';
  quickLinks: { label: string; path: string }[] = [
    { label: 'Días de Reunión', path: '/dias-reunion' },
    { label: 'Ministerios', path: '/ministerios' },
    { label: 'Contacto', path: '/contacto' }
  ];

  constructor(
    private publicApi: PublicApiService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.darkMode$.subscribe(() => this.updateFooterIcon());
    this.publicApi.getLayoutConfig().subscribe({
      next: (data) => {
        this.footerBrandTitle = data.footerBrandTitle || this.footerBrandTitle;
        this.footerBrandDescription = data.footerBrandDescription || this.footerBrandDescription;
        this._footerIconUrl = data.footerIconUrl || '';
        this._footerIconUrlLight = data.footerIconUrlLight || '';
        this._footerIconUrlDark = data.footerIconUrlDark || '';
        this.updateFooterIcon();
        this.footerFacebookUrl = data.footerFacebookUrl || '';
        this.footerInstagramUrl = data.footerInstagramUrl || '';
        this.footerYoutubeUrl = data.footerYoutubeUrl || '';
        this.footerAddress = data.footerAddress || '';
        this.footerEmail = data.footerEmail || '';
        this.footerPhone = data.footerPhone || '';
        this.footerCopyright = data.footerCopyright || this.footerCopyright;
        this.footerPrivacyUrl = data.footerPrivacyUrl || '#';
        this.footerTermsUrl = data.footerTermsUrl || '#';
        if (data.quickLinks?.length) {
          this.quickLinks = data.quickLinks;
        }
      },
      error: () => {}
    });
  }

  private updateFooterIcon(): void {
    const dark = this.themeService.isDarkMode();
    const url = dark
      ? (this._footerIconUrlDark || this._footerIconUrl)
      : (this._footerIconUrlLight || this._footerIconUrl);
    this.footerIconUrl = url
      ? (url.startsWith('http') ? url : environment.apiBaseUrl + url)
      : '';
  }
}
