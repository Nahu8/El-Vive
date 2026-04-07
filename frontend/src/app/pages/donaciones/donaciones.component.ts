import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme.service';

const API_BASE = environment.apiBaseUrl;

export interface WhyGiveCard {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface PaymentMethodCard {
  label: string;
  description?: string;
  detail: string;
  icon?: string;
  imageUrl?: string;
}

export interface DonacionesCta {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-donaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './donaciones.component.html',
  styleUrls: ['./donaciones.component.css']
})
export class DonacionesComponent implements OnInit {
  heroTitle = 'DONACIONES';
  heroBadge = '';
  heroSubtitle = 'Tu aporte ayuda a sostener la obra de la iglesia y bendecir a nuestra comunidad.';
  heroImageUrl = '';
  heroImageUrlLight = '';
  heroImageUrlDark = '';
  heroVideoUrl = '';
  heroBgLightColor = '#ffffff';
  heroBgDarkColor = '#000000';
  heroFadeEnabled = true;
  heroFadeLightColor = '#000000';
  heroFadeDarkColor = '#000000';

  introTitle = '';
  introContent = '';

  whyGive: WhyGiveCard[] = [];
  paymentMethods: PaymentMethodCard[] = [];
  donacionesCta: DonacionesCta | null = null;

  pageSections: Array<{
    type: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    caption?: string;
    layout?: 'left' | 'right';
  }> = [];

  copiedKey: string | null = null;
  private copyClearTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private publicApi: PublicApiService,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadContent();
  }

  loadContent() {
    this.publicApi.getDonacionesConfig().subscribe({
      next: (data) => {
        const pc = data.pageContent || {};
        this.heroTitle = pc.hero?.title || this.heroTitle;
        this.heroBadge = pc.hero?.badge || '';
        this.heroSubtitle = pc.hero?.subtitle || this.heroSubtitle;
        this.heroImageUrl = this.resolveUrl(pc.hero?.backgroundImageUrl);
        this.heroImageUrlLight = this.resolveUrl(pc.hero?.backgroundImageUrlLight || pc.hero?.backgroundImageUrl);
        this.heroImageUrlDark = this.resolveUrl(pc.hero?.backgroundImageUrlDark || pc.hero?.backgroundImageUrl);
        this.heroVideoUrl = this.resolveUrl(pc.hero?.backgroundVideoUrl) || pc.hero?.backgroundVideoUrl || '';
        this.heroBgLightColor = pc.hero?.bgColorLight || '#ffffff';
        this.heroBgDarkColor = pc.hero?.bgColorDark || '#000000';
        this.heroFadeEnabled = pc.hero?.fadeEnabled !== false;
        this.heroFadeLightColor = pc.hero?.fadeColorLight || '#000000';
        this.heroFadeDarkColor = pc.hero?.fadeColorDark || '#000000';
        this.introTitle = pc.intro?.title || '';
        this.introContent = pc.intro?.content || '';
        this.whyGive = Array.isArray(pc.whyGive) ? pc.whyGive.map((w: any) => ({
          title: w.title || '',
          content: w.content || '',
          imageUrl: w.imageUrl ? this.resolveUrl(w.imageUrl) : ''
        })) : [];
        this.paymentMethods = Array.isArray(pc.paymentMethods) ? pc.paymentMethods.map((p: any) => ({
          label: p.label || '',
          description: p.description || '',
          detail: p.detail || '',
          icon: p.icon || '💰',
          imageUrl: p.imageUrl ? this.resolveUrl(p.imageUrl) : ''
        })) : [];
        this.donacionesCta = pc.donacionesCta?.title
          ? {
              title: pc.donacionesCta.title,
              subtitle: pc.donacionesCta.subtitle,
              buttonText: pc.donacionesCta.buttonText,
              buttonUrl: pc.donacionesCta.buttonUrl || '/contacto',
              imageUrl: pc.donacionesCta.imageUrl ? this.resolveUrl(pc.donacionesCta.imageUrl) : ''
            }
          : null;
        this.pageSections = (pc.sections || []).map((s: any) => ({
          ...s,
          imageUrl: s.imageUrl ? this.resolveUrl(s.imageUrl) : s.imageUrl,
          videoUrl: s.videoUrl
        }));
      },
      error: (err) => console.error('Error cargando donaciones:', err)
    });
  }

  private resolveUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let p = path.startsWith('/') ? path : '/' + path;
    if (p.startsWith('/images/') || p.startsWith('/videos/') || p.startsWith('/icons/')) {
      p = '/uploads' + p;
    }
    return API_BASE + p;
  }

  getSafeVideoUrl(url: string | undefined): SafeResourceUrl | null {
    if (!url) return null;
    const id = this.extractYouTubeId(url);
    if (id) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
    }
    if (url.includes('youtube.com/embed/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }

  get currentHeroImageUrl(): string {
    return this.themeService.isDarkMode()
      ? (this.heroImageUrlDark || this.heroImageUrlLight || this.heroImageUrl)
      : (this.heroImageUrlLight || this.heroImageUrlDark || this.heroImageUrl);
  }

  get heroBgColor(): string {
    return this.themeService.isDarkMode() ? this.heroBgDarkColor : this.heroBgLightColor;
  }

  get heroFadeStyle(): string {
    const fadeColor = this.themeService.isDarkMode() ? this.heroFadeDarkColor : this.heroFadeLightColor;
    return `linear-gradient(to top, ${fadeColor}, transparent)`;
  }

  get pageBgColor(): string {
    return this.themeService.isDarkMode() ? this.heroBgDarkColor : this.heroBgLightColor;
  }

  copyDetail(key: string, text: string): void {
    const t = (text || '').trim();
    if (!t || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(t).then(() => {
      this.copiedKey = key;
      if (this.copyClearTimer) clearTimeout(this.copyClearTimer);
      this.copyClearTimer = setTimeout(() => {
        this.copiedKey = null;
        this.copyClearTimer = null;
      }, 2000);
    });
  }

  isCopied(key: string): boolean {
    return this.copiedKey === key;
  }

  private extractYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return m?.[1] || null;
  }
}
