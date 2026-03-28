import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';
import { ThemeService } from '../../services/theme.service';

import { environment } from '../../../environments/environment';
const API_BASE = environment.apiBaseUrl;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactInfo = {
    email: '',
    phone: '',
    address: '',
    city: '',
    mapEmbed: '',
    additionalInfo: ''
  };

  schedules: Record<string, string> = {};
  scheduleItems = [
    { key: 'sunday', label: 'Servicio Dominical' },
    { key: 'wednesday', label: 'Estudio Bíblico' },
    { key: 'friday', label: 'Jóvenes' },
    { key: 'officeHours', label: 'Horario de Oficina' },
    { key: 'emergencyHours', label: 'Emergencia' }
  ];

  // pageContent
  heroTitle = 'CONTACTO';
  heroSubtitle = 'Estamos aquí para servirte. No dudes en contactarnos.';
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

  pageSections: Array<{
    type: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    caption?: string;
    layout?: 'left' | 'right';
  }> = [];

  mapTitle = 'Nuestra ubicación';
  mapDescription = '';
  mapImageUrl = '';
  googleMapsUrl = '';

  constructor(
    private publicApi: PublicApiService,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadContactInfo();
  }

  loadContactInfo() {
    this.publicApi.getContactConfig().subscribe({
      next: (data) => {
        this.contactInfo = {
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          mapEmbed: data.mapEmbed || '',
          additionalInfo: data.additionalInfo || ''
        };
        this.schedules = data.schedules || {};

        const pc = data.pageContent || {};
        this.heroTitle = pc.hero?.title || this.heroTitle;
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

        this.pageSections = (pc.sections || []).map((s: any) => ({
          ...s,
          imageUrl: s.imageUrl ? this.resolveUrl(s.imageUrl) : s.imageUrl,
          videoUrl: s.videoUrl
        }));

        this.mapTitle = pc.map?.title || this.mapTitle;
        this.mapDescription = pc.map?.description || '';
        this.mapImageUrl = pc.map?.imageUrl ? this.resolveUrl(pc.map.imageUrl) : '';
        this.googleMapsUrl = pc.map?.googleMapsUrl || '';
      },
      error: (err) => console.error('Error cargando contacto:', err)
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

  getScheduleValue(key: string): string {
    return this.schedules[key] || '';
  }

  getSafeMapEmbed(): SafeHtml {
    const raw = this.contactInfo.mapEmbed || '';
    return raw ? this.sanitizer.bypassSecurityTrustHtml(raw) : '';
  }

  getSafeVideoUrl(url: string | undefined): SafeResourceUrl | null {
    if (!url) return null;
    const id = this.extractYouTubeId(url);
    if (id) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${id}`
      );
    }
    if (url.includes('youtube.com/embed/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }

  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m?.[1]) return m[1];
    }
    if (!url.includes('/') && !url.includes('.') && url.length >= 8) return url;
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
}
