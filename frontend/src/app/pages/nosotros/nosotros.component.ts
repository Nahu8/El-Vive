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
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealOnScrollDirective],
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css']
})
export class NosotrosComponent implements OnInit {
  heroTitle = 'NOSOTROS';
  heroSubtitle = 'Conocé nuestra historia, valores y visión como comunidad de fe.';
  heroBadge = 'Conozca más acerca del ministerio';
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
  introTag = 'Quiénes somos';
  teamTag = 'Liderazgo';
  teamHeading = 'Presentación pastoral';
  teamSubtext = 'Rostros que acompañan y sirven a esta casa semana a semana.';
  pillarsTag = 'Fundamentos';
  pillarsHeading = 'Lo que nos define';
  nosotrosCta = {
    title: '¿Querés ser parte?',
    subtitle: 'Sumate a un ministerio o escribinos: nos encantaría conocerte.',
    primaryButtonText: 'Ver ministerios',
    primaryButtonUrl: '/ministerios',
    secondaryButtonText: 'Contacto',
    secondaryButtonUrl: '/contacto'
  };

  pageSections: Array<{
    type: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    caption?: string;
    layout?: 'left' | 'right';
  }> = [];
  leadershipIntro = { title: 'Pastores principales', subtitle: '' };
  pastoralCoverage = { title: 'Cobertura pastoral', description: '', zones: [] as Array<{ zone: string; pastor: string; contact?: string }> };
  pastorProfile = { title: 'Conocé al Pastor', name: '', role: '', description: '', ministryInfo: '', imageUrl: '' };
  proyectoPastor = { title: 'Proyecto Pastor', subtitle: '', projects: [] as Array<{ title: string; description: string; status?: string; imageUrls?: string[]; videoUrls?: string[] }> };
  pastor = {
    name: 'Hugo Aranda',
    role: 'Pastor Principal',
    description: '',
    quote: '',
    imageUrl: ''
  };
  pastora = {
    name: 'Débora Aranda',
    role: 'Pastora Principal',
    imageUrl: ''
  };
  group = {
    title: 'Equipo Pastoral',
    role: 'Liderazgo',
    imageUrl: ''
  };
  highlights: Array<{ title: string; content: string; linkText: string; linkUrl: string }> = [];

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
    this.publicApi.getNosotrosConfig().subscribe({
      next: (data) => {
        const pc = data.pageContent || {};
        this.heroTitle = pc.hero?.title || this.heroTitle;
        this.heroSubtitle = pc.hero?.subtitle || this.heroSubtitle;
        this.heroBadge = pc.hero?.badge || this.heroBadge;
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
        this.introTag = pc.nosotrosLabels?.introTag || this.introTag;
        this.teamTag = pc.nosotrosLabels?.teamTag || this.teamTag;
        this.teamHeading = pc.nosotrosLabels?.teamHeading || this.teamHeading;
        this.teamSubtext = pc.nosotrosLabels?.teamSubtext || this.teamSubtext;
        this.pillarsTag = pc.nosotrosLabels?.pillarsTag || this.pillarsTag;
        this.pillarsHeading = pc.nosotrosLabels?.pillarsHeading || this.pillarsHeading;
        this.nosotrosCta = {
          title: pc.nosotrosCta?.title || this.nosotrosCta.title,
          subtitle: pc.nosotrosCta?.subtitle || this.nosotrosCta.subtitle,
          primaryButtonText: pc.nosotrosCta?.primaryButtonText || this.nosotrosCta.primaryButtonText,
          primaryButtonUrl: pc.nosotrosCta?.primaryButtonUrl || this.nosotrosCta.primaryButtonUrl,
          secondaryButtonText: pc.nosotrosCta?.secondaryButtonText || this.nosotrosCta.secondaryButtonText,
          secondaryButtonUrl: pc.nosotrosCta?.secondaryButtonUrl || this.nosotrosCta.secondaryButtonUrl
        };
        this.pageSections = (pc.sections || []).map((s: any) => ({
          ...s,
          imageUrl: s.imageUrl ? this.resolveUrl(s.imageUrl) : s.imageUrl,
          videoUrl: s.videoUrl
        }));
        this.pastora = {
          name: pc.leadership?.pastoraName || this.pastora.name,
          role: pc.leadership?.pastoraRole || this.pastora.role,
          imageUrl: this.resolveUrl(pc.leadership?.pastoraImageUrl) || this.pastora.imageUrl
        };
        this.group = {
          title: pc.leadership?.groupTitle || this.group.title,
          role: pc.leadership?.groupRole || this.group.role,
          imageUrl: this.resolveUrl(pc.leadership?.groupImageUrl) || this.group.imageUrl
        };
        this.pastor = {
          name: pc.leadership?.pastorName || pc.pastor?.name || this.pastor.name,
          role: pc.leadership?.pastorRole || pc.pastor?.role || this.pastor.role,
          description: pc.leadership?.pastorDescription || pc.pastor?.description || this.pastor.description,
          quote: pc.leadership?.pastorQuote || pc.pastor?.quote || this.pastor.quote,
          imageUrl: this.resolveUrl(pc.leadership?.pastorImageUrl || pc.pastor?.imageUrl) || this.pastor.imageUrl
        };
        this.leadershipIntro = {
          title: pc.leadershipIntro?.title || 'Pastores principales',
          subtitle: pc.leadershipIntro?.subtitle || 'Hugo y Débora Aranda lideran el ministerio pastoral de nuestra iglesia.'
        };
        if (!pc.nosotrosLabels?.teamHeading && pc.leadershipIntro?.title) {
          this.teamHeading = pc.leadershipIntro.title;
        }
        if (!pc.nosotrosLabels?.teamSubtext && pc.leadershipIntro?.subtitle) {
          this.teamSubtext = pc.leadershipIntro.subtitle;
        }
        this.pastoralCoverage = {
          title: pc.pastoralCoverage?.title || 'Cobertura pastoral',
          description: pc.pastoralCoverage?.description || '',
          zones: Array.isArray(pc.pastoralCoverage?.zones)
            ? pc.pastoralCoverage.zones.map((z: any) => ({
                zone: z.zone || '',
                pastor: z.pastor || '',
                contact: z.contact || ''
              }))
            : []
        };
        this.pastorProfile = {
          title: pc.pastorProfile?.title || 'Conocé al Pastor',
          name: pc.pastorProfile?.name || this.pastor.name,
          role: pc.pastorProfile?.role || this.pastor.role,
          description: pc.pastorProfile?.description || '',
          ministryInfo: pc.pastorProfile?.ministryInfo || '',
          imageUrl: this.resolveUrl(pc.pastorProfile?.imageUrl) || ''
        };
        this.proyectoPastor = {
          title: pc.proyectoPastor?.title || 'Proyecto Pastor',
          subtitle: pc.proyectoPastor?.subtitle || '',
          projects: Array.isArray(pc.proyectoPastor?.projects)
            ? pc.proyectoPastor.projects.map((p: any) => ({
                title: p.title || '',
                description: p.description || '',
                status: p.status || '',
                imageUrls: (p.imageUrls || []).map((u: string) => this.resolveUrl(u)),
                videoUrls: p.videoUrls || []
              }))
            : []
        };
        this.highlights = Array.isArray(pc.highlights) && pc.highlights.length
          ? pc.highlights.map((h: any) => ({
              title: h.title || '',
              content: h.content || '',
              linkText: h.linkText || 'Leer más',
              linkUrl: h.linkUrl || ''
            }))
          : [
              {
                title: 'Nuestras Creencias',
                content: 'Vean cómo vemos a Dios, a la Biblia y a los fundamentos que guían nuestra misión.',
                linkText: 'Leer más',
                linkUrl: ''
              },
              {
                title: 'Nuestros Valores',
                content: 'Conocé los valores que sostienen nuestra visión y nuestra forma de vivir la fe.',
                linkText: 'Leer más',
                linkUrl: ''
              },
              {
                title: 'Nuestro Equipo',
                content: 'Conocé a los pastores y al equipo ministerial que sirve cada semana en la iglesia.',
                linkText: 'Leer más',
                linkUrl: ''
              }
            ];
      },
      error: () => undefined
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

  private extractYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return m?.[1] || null;
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

  get featureCards(): Array<{ title: string; content: string; linkText: string; linkUrl: string }> {
    if (this.highlights.length > 0) return this.highlights.slice(0, 3);
    return [
      {
        title: 'Nuestras Creencias',
        content: 'Vean cómo vemos a Dios, a la Biblia y a los fundamentos que guían nuestra misión.',
        linkText: 'Leer más',
        linkUrl: ''
      },
      {
        title: 'Nuestros Valores',
        content: 'Conocé los valores que sostienen nuestra visión y nuestra forma de vivir la fe.',
        linkText: 'Leer más',
        linkUrl: ''
      },
      {
        title: 'Nuestro Equipo',
        content: 'Conocé a los pastores y al equipo ministerial que sirve cada semana en la iglesia.',
        linkText: 'Leer más',
        linkUrl: ''
      }
    ];
  }

  /** Tarjetas de pastores principales (Hugo y Débora). */
  get mainPastorSlots(): Array<{
    key: string;
    name: string;
    role: string;
    imageUrl: string;
    placeholderLabel: string;
  }> {
    return [
      {
        key: 'pastor',
        name: this.pastor.name,
        role: this.pastor.role,
        imageUrl: this.pastor.imageUrl,
        placeholderLabel: 'Pastor'
      },
      {
        key: 'pastora',
        name: this.pastora.name,
        role: this.pastora.role,
        imageUrl: this.pastora.imageUrl,
        placeholderLabel: 'Pastora'
      }
    ];
  }

  get hasPastoralCoverage(): boolean {
    return !!(this.pastoralCoverage.description || this.pastoralCoverage.zones.length);
  }

  get hasPastorProfile(): boolean {
    const p = this.pastorProfile;
    return !!(p.name || p.description || p.ministryInfo || p.imageUrl);
  }

  get hasProyectoPastor(): boolean {
    return this.proyectoPastor.projects.length > 0 || !!this.proyectoPastor.subtitle;
  }

  /** ponytail: grupo pastoral opcional, fuera del bloque principal */
  get leadershipSlots(): Array<{
    key: string;
    name: string;
    role: string;
    imageUrl: string;
    placeholderLabel: string;
  }> {
    return [
      {
        key: 'pastor',
        name: this.pastor.name,
        role: this.pastor.role,
        imageUrl: this.pastor.imageUrl,
        placeholderLabel: 'Pastor'
      },
      {
        key: 'pastora',
        name: this.pastora.name,
        role: this.pastora.role,
        imageUrl: this.pastora.imageUrl,
        placeholderLabel: 'Pastora'
      },
      {
        key: 'group',
        name: this.group.title,
        role: this.group.role,
        imageUrl: this.group.imageUrl,
        placeholderLabel: 'Equipo'
      }
    ];
  }

  highlightHasLink(card: { linkUrl: string }): boolean {
    return !!(card.linkUrl && String(card.linkUrl).trim());
  }

  isExternalHighlightLink(url: string): boolean {
    return /^https?:\/\//i.test(String(url).trim());
  }

  get zigzagSections(): Array<{
    type: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    layout?: 'left' | 'right';
  }> {
    return this.pageSections
      .filter((s) => s.type === 'textImage' || s.type === 'video' || s.type === 'image' || s.type === 'text')
      .slice(0, 6)
      .map((s, index) => ({
        ...s,
        layout: s.layout || (index % 2 === 0 ? 'left' : 'right')
      }));
  }

  isExternalCtaLink(url: string): boolean {
    return /^https?:\/\//i.test(String(url).trim());
  }

  get showHeroVideo(): boolean {
    return !!(this.heroVideoUrl && this.heroVideoUrl.trim() && !this.currentHeroImageUrl);
  }
}