import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicApiService } from '../../services/public-api.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {
  isPlaying = false;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  heroTitle = 'EL VIVE IGLESIA';
  heroButton1Text = 'VER EVENTOS';
  heroButton1Link = '/dias-reunion';
  heroButton2Text = 'CONOCE MAS';
  heroButton2Link = '/contacto';
  heroVideoUrl = '';

  videoSrc = '';
  themeIconUrl: string | null = null;
  heroIconUrl: string | null = null;
  heroVideoUrlLight: string | null = null;
  heroVideoUrlDark: string | null = null;
  heroIconUrlLight: string | null = null;
  heroIconUrlDark: string | null = null;
  heroVideoUrlDomLight: string | null = null;
  heroVideoUrlDomDark: string | null = null;
  heroVideoUrlMierLight: string | null = null;
  heroVideoUrlMierDark: string | null = null;
  heroIconUrlDomLight: string | null = null;
  heroIconUrlDomDark: string | null = null;
  heroIconUrlMierLight: string | null = null;
  heroIconUrlMierDark: string | null = null;
  heroBgLightColor = '#ffffff';
  heroBgDarkColor = '#000000';
  heroFadeEnabled = true;
  heroFadeLightColor = '#ffffff';
  heroFadeDarkColor = '#000000';

  constructor(
    private publicApi: PublicApiService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.loadTheme();
    this.loadHeroConfig();
  }

  private loadHeroConfig() {
    this.publicApi.getHomeConfig().subscribe({
      next: (data) => {
        this.heroTitle = data.heroTitle || this.heroTitle;
        this.heroButton1Text = data.heroButton1Text || this.heroButton1Text;
        this.heroButton1Link = data.heroButton1Link || this.heroButton1Link;
        this.heroButton2Text = data.heroButton2Text || this.heroButton2Text;
        this.heroButton2Link = data.heroButton2Link || this.heroButton2Link;
        this.heroBgLightColor = data.theme?.heroBgLightColor || '#ffffff';
        this.heroBgDarkColor = data.theme?.heroBgDarkColor || '#000000';
        this.heroFadeEnabled = data.theme?.heroFadeEnabled !== false;
        this.heroFadeLightColor = data.theme?.heroFadeLightColor || '#ffffff';
        this.heroFadeDarkColor = data.theme?.heroFadeDarkColor || '#000000';

        if (data.hasVideo) {
          this.heroVideoUrlDomLight = data.theme?.videoUrlDomLight ? this.publicApi.resolveAssetUrl(data.theme.videoUrlDomLight) : null;
          this.heroVideoUrlDomDark = data.theme?.videoUrlDomDark ? this.publicApi.resolveAssetUrl(data.theme.videoUrlDomDark) : null;
          this.heroVideoUrlMierLight = data.theme?.videoUrlMierLight ? this.publicApi.resolveAssetUrl(data.theme.videoUrlMierLight) : null;
          this.heroVideoUrlMierDark = data.theme?.videoUrlMierDark ? this.publicApi.resolveAssetUrl(data.theme.videoUrlMierDark) : null;
          this.heroVideoUrlLight = data.theme?.videoUrlLight ? this.publicApi.resolveAssetUrl(data.theme.videoUrlLight) : `${environment.apiBaseUrl}/api/home/video-light`;
          this.heroVideoUrlDark = data.theme?.videoUrlDark ? this.publicApi.resolveAssetUrl(data.theme.videoUrlDark) : `${environment.apiBaseUrl}/api/home/video-dark`;
          const isMier = Number(data?.theme?.context?.variant) === 2;
          const isDark = this.themeService.isDarkMode();
          this.videoSrc = isMier
            ? (isDark
              ? (this.heroVideoUrlMierDark || this.heroVideoUrlMierLight || this.heroVideoUrlDark || this.heroVideoUrlLight || `${environment.apiBaseUrl}/api/home/current-video?dark=1`)
              : (this.heroVideoUrlMierLight || this.heroVideoUrlMierDark || this.heroVideoUrlLight || this.heroVideoUrlDark || `${environment.apiBaseUrl}/api/home/current-video`))
            : (isDark
              ? (this.heroVideoUrlDomDark || this.heroVideoUrlDomLight || this.heroVideoUrlDark || this.heroVideoUrlLight || `${environment.apiBaseUrl}/api/home/current-video?dark=1`)
              : (this.heroVideoUrlDomLight || this.heroVideoUrlDomDark || this.heroVideoUrlLight || this.heroVideoUrlDark || `${environment.apiBaseUrl}/api/home/current-video`));
        } else {
          this.videoSrc = 'assets/videos/MinisteriosServicios Pantalla.mp4';
        }

        this.heroVideoUrl = this.videoSrc;
        this.themeIconUrl = data.theme?.iconUrl || null;
        this.heroIconUrlDomLight = data.theme?.iconUrlDomLight ? this.publicApi.resolveAssetUrl(data.theme.iconUrlDomLight) : null;
        this.heroIconUrlDomDark = data.theme?.iconUrlDomDark ? this.publicApi.resolveAssetUrl(data.theme.iconUrlDomDark) : null;
        this.heroIconUrlMierLight = data.theme?.iconUrlMierLight ? this.publicApi.resolveAssetUrl(data.theme.iconUrlMierLight) : null;
        this.heroIconUrlMierDark = data.theme?.iconUrlMierDark ? this.publicApi.resolveAssetUrl(data.theme.iconUrlMierDark) : null;
        this.heroIconUrlLight = data.theme?.iconUrlLight ? this.publicApi.resolveAssetUrl(data.theme.iconUrlLight) : `${environment.apiBaseUrl}/api/home/icon-light`;
        this.heroIconUrlDark = data.theme?.iconUrlDark ? this.publicApi.resolveAssetUrl(data.theme.iconUrlDark) : `${environment.apiBaseUrl}/api/home/icon-dark`;
        const isMier = Number(data?.theme?.context?.variant) === 2;
        const isDark = this.themeService.isDarkMode();
        this.heroIconUrl = data.hasIcon ? (isMier
          ? (isDark
            ? (this.heroIconUrlMierDark || this.heroIconUrlMierLight || this.heroIconUrlDark || this.heroIconUrlLight || `${environment.apiBaseUrl}/api/home/current-icon?dark=1`)
            : (this.heroIconUrlMierLight || this.heroIconUrlMierDark || this.heroIconUrlLight || this.heroIconUrlDark || `${environment.apiBaseUrl}/api/home/current-icon`))
          : (isDark
            ? (this.heroIconUrlDomDark || this.heroIconUrlDomLight || this.heroIconUrlDark || this.heroIconUrlLight || `${environment.apiBaseUrl}/api/home/current-icon?dark=1`)
            : (this.heroIconUrlDomLight || this.heroIconUrlDomDark || this.heroIconUrlLight || this.heroIconUrlDark || `${environment.apiBaseUrl}/api/home/current-icon`)))
          : null;

        this.reloadVideo();
      },
      error: () => {
        this.videoSrc = 'assets/videos/MinisteriosServicios Pantalla.mp4';
        this.reloadVideo();
      }
    });

    this.themeService.darkMode$.subscribe((isDark) => {
      const isMier = this.themeService.getCurrentTheme().variant === 2;
      const nextVideo = isDark
        ? (isMier
          ? (this.heroVideoUrlMierDark || this.heroVideoUrlMierLight || this.heroVideoUrlDark || this.heroVideoUrlLight || this.videoSrc)
          : (this.heroVideoUrlDomDark || this.heroVideoUrlDomLight || this.heroVideoUrlDark || this.heroVideoUrlLight || this.videoSrc))
        : (isMier
          ? (this.heroVideoUrlMierLight || this.heroVideoUrlMierDark || this.heroVideoUrlLight || this.heroVideoUrlDark || this.videoSrc)
          : (this.heroVideoUrlDomLight || this.heroVideoUrlDomDark || this.heroVideoUrlLight || this.heroVideoUrlDark || this.videoSrc));
      if (nextVideo && nextVideo !== this.videoSrc) {
        this.videoSrc = nextVideo;
        this.heroVideoUrl = nextVideo;
        this.reloadVideo();
      }
      this.heroIconUrl = isDark
        ? (isMier
          ? (this.heroIconUrlMierDark || this.heroIconUrlMierLight || this.heroIconUrlDark || this.heroIconUrlLight || this.heroIconUrl)
          : (this.heroIconUrlDomDark || this.heroIconUrlDomLight || this.heroIconUrlDark || this.heroIconUrlLight || this.heroIconUrl))
        : (isMier
          ? (this.heroIconUrlMierLight || this.heroIconUrlMierDark || this.heroIconUrlLight || this.heroIconUrlDark || this.heroIconUrl)
          : (this.heroIconUrlDomLight || this.heroIconUrlDomDark || this.heroIconUrlLight || this.heroIconUrlDark || this.heroIconUrl));
    });
  }

  private reloadVideo() {
    setTimeout(() => {
      const video = this.videoElement?.nativeElement;
      if (!video) return;

      video.muted = true;
      video.playsInline = true as any;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.load();

      video.play().then(() => {
        this.isPlaying = true;
      }).catch(() => {
        let attempts = 0;
        const retryInterval = setInterval(() => {
          attempts++;
          video.play().then(() => {
            clearInterval(retryInterval);
            this.isPlaying = true;
          }).catch(() => {
            if (attempts >= 5) {
              clearInterval(retryInterval);
              // Mantener autoplay silencioso sin botón manual.
              // Si falla, se reintentará en próximos cambios de fuente/tema.
            }
          });
        }, 1000);
      });
    }, 50);
  }

  onVideoLoaded() {
    const video = this.videoElement?.nativeElement;
    if (video) video.classList.add('video-visible');
  }

  onVideoError() {
    console.error('Error cargando video:', this.videoSrc);
    // Fallback visual seguro para evitar hero vacío
    if (this.videoSrc !== 'assets/videos/MinisteriosServicios Pantalla.mp4') {
      this.videoSrc = 'assets/videos/MinisteriosServicios Pantalla.mp4';
      this.reloadVideo();
    }
  }

  playVideo() {
    const video = this.videoElement?.nativeElement;
    if (!video) return;
    video.play().then(() => {
      this.isPlaying = true;
    }).catch(() => {});
  }

  get headerFadeStyle(): string {
    const color = this.themeService.isDarkMode() ? this.heroFadeDarkColor : this.heroFadeLightColor;
    return `linear-gradient(to top, ${color} 0%, transparent 100%)`;
  }

  get headerBgColor(): string {
    return this.themeService.isDarkMode() ? this.heroBgDarkColor : this.heroBgLightColor;
  }
}
