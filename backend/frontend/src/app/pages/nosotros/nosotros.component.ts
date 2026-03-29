import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme.service';

const API_BASE = environment.apiBaseUrl;

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css']
})
export class NosotrosComponent implements OnInit {
  heroTitle = 'NOSOTROS';
  heroSubtitle = 'Conocé nuestra historia, valores y visión como comunidad de fe.';
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
  pastor = {
    name: 'Ps. Juan Pérez',
    role: 'Pastor Principal',
    description: 'Con más de 15 años de ministerio, su pasión es acompañar familias en su crecimiento espiritual y servir a la comunidad con amor.',
    quote: 'Creemos en una iglesia viva, cercana y transformadora.',
    imageUrl: ''
  };
  pastora = {
    name: 'Ps. María González',
    role: 'Pastora',
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
        this.pastor = {
          name: pc.pastor?.name || this.pastor.name,
          role: pc.pastor?.role || this.pastor.role,
          description: pc.pastor?.description || this.pastor.description,
          quote: pc.pastor?.quote || this.pastor.quote,
          imageUrl: this.resolveUrl(pc.pastor?.imageUrl) || this.pastor.imageUrl
        };
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
          name: pc.leadership?.pastorName || this.pastor.name,
          role: pc.leadership?.pastorRole || this.pastor.role,
          description: this.pastor.description,
          quote: this.pastor.quote,
          imageUrl: this.resolveUrl(pc.leadership?.pastorImageUrl) || this.pastor.imageUrl
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
      error: (err) => console.error('Error cargando nosotros:', err)
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
    if (this.highlights.length >= 3) return this.highlights.slice(0, 3);
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

  get zigzagSections(): Array<{
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
}
