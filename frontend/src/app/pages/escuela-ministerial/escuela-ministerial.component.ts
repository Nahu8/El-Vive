import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

const API_BASE = environment.apiBaseUrl;

@Component({
  selector: 'app-escuela-ministerial',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealOnScrollDirective],
  templateUrl: './escuela-ministerial.component.html',
  styleUrls: ['./escuela-ministerial.component.css']
})
export class EscuelaMinisterialComponent implements OnInit {
  heroTitle = 'ESCUELA MINISTERIAL';
  heroSubtitle = 'Formación y capacitación para quienes desean servir con excelencia en el ministerio.';
  heroImageUrlLight = '';
  heroImageUrlDark = '';
  heroVideoUrl = '';
  heroBgLightColor = '#eef2ff';
  heroBgDarkColor = '#1e1b4b';
  heroFadeEnabled = true;
  heroFadeLightColor = '#ffffff';
  heroFadeDarkColor = '#000000';

  intro = { title: '', content: '' };
  objective = { title: '', content: '' };
  generalInfo = { title: '', content: '' };
  program = { title: '', content: '', items: [] as string[] };
  requirements = { title: '', items: [] as string[] };
  registration = { title: '', content: '', formUrl: '', pdfUrl: '' };
  presentationVideoUrl = '';
  images: Array<{ url: string; caption?: string }> = [];
  socialMedia = { facebook: '', instagram: '' };
  pageSections: Array<{ type: string; title?: string; content?: string; imageUrl?: string; videoUrl?: string; layout?: string }> = [];

  constructor(
    private publicApi: PublicApiService,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.publicApi.getEscuelaMinisterialConfig().subscribe({
      next: (data) => this.applyContent(data.pageContent || {}),
      error: () => undefined
    });
  }

  private applyContent(pc: any) {
    this.heroTitle = pc.hero?.title || this.heroTitle;
    this.heroSubtitle = pc.hero?.subtitle || this.heroSubtitle;
    this.heroImageUrlLight = this.resolveUrl(pc.hero?.backgroundImageUrlLight || pc.hero?.backgroundImageUrl);
    this.heroImageUrlDark = this.resolveUrl(pc.hero?.backgroundImageUrlDark || pc.hero?.backgroundImageUrl);
    this.heroVideoUrl = this.resolveUrl(pc.hero?.backgroundVideoUrl) || pc.hero?.backgroundVideoUrl || '';
    this.heroBgLightColor = pc.hero?.bgColorLight || '#eef2ff';
    this.heroBgDarkColor = pc.hero?.bgColorDark || '#1e1b4b';
    this.heroFadeEnabled = pc.hero?.fadeEnabled !== false;
    this.heroFadeLightColor = pc.hero?.fadeColorLight || '#ffffff';
    this.heroFadeDarkColor = pc.hero?.fadeColorDark || '#000000';
    this.intro = { title: pc.intro?.title || '', content: pc.intro?.content || '' };
    this.objective = { title: pc.objective?.title || '', content: pc.objective?.content || '' };
    this.generalInfo = { title: pc.generalInfo?.title || '', content: pc.generalInfo?.content || '' };
    this.program = {
      title: pc.program?.title || '',
      content: pc.program?.content || '',
      items: Array.isArray(pc.program?.items) ? pc.program.items : []
    };
    this.requirements = {
      title: pc.requirements?.title || '',
      items: Array.isArray(pc.requirements?.items) ? pc.requirements.items : []
    };
    this.registration = {
      title: pc.registration?.title || '',
      content: pc.registration?.content || '',
      formUrl: pc.registration?.formUrl || '',
      pdfUrl: pc.registration?.pdfUrl ? this.resolveUrl(pc.registration.pdfUrl) : ''
    };
    this.presentationVideoUrl = pc.presentationVideo?.url || '';
    this.images = (pc.images || []).map((img: any) => ({
      url: this.resolveUrl(img.url),
      caption: img.caption || ''
    }));
    this.socialMedia = {
      facebook: pc.socialMedia?.facebook || '',
      instagram: pc.socialMedia?.instagram || ''
    };
    this.pageSections = (pc.sections || []).map((s: any) => ({
      ...s,
      imageUrl: s.imageUrl ? this.resolveUrl(s.imageUrl) : s.imageUrl
    }));
  }

  get currentHeroImageUrl(): string {
    return this.themeService.isDarkMode()
      ? (this.heroImageUrlDark || this.heroImageUrlLight)
      : (this.heroImageUrlLight || this.heroImageUrlDark);
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

  get hasSocialMedia(): boolean {
    return !!(this.socialMedia.facebook || this.socialMedia.instagram);
  }

  getSafeVideoUrl(url: string | undefined): SafeResourceUrl | null {
    if (!url) return null;
    const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    if (id) return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
    if (url.includes('youtube.com/embed/')) return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return null;
  }

  isExternalLink(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  private resolveUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let p = path.startsWith('/') ? path : '/' + path;
    if (p.startsWith('/images/') || p.startsWith('/videos/') || p.startsWith('/icons/')) p = '/uploads' + p;
    return API_BASE + p;
  }
}
