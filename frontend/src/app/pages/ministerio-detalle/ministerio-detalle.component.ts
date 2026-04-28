import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

export interface MinistryPhotoItem {
  url: string;
}

export interface MinistryVideoEmbed {
  src: SafeResourceUrl;
}

export interface MinistryInternalVideo {
  url: string;
}

@Component({
  selector: 'app-ministerio-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealOnScrollDirective],
  templateUrl: './ministerio-detalle.component.html',
  styleUrls: ['./ministerio-detalle.component.css']
})
export class MinisterioDetalleComponent implements OnInit {
  ministry: any = null;
  loading = true;
  error = false;

  heroBgUrl = '';
  iconDisplayUrl = '';
  photoItems: MinistryPhotoItem[] = [];
  videoEmbeds: MinistryVideoEmbed[] = [];
  internalVideos: MinistryInternalVideo[] = [];
  selectedPhoto: MinistryPhotoItem | null = null;
  hasStats = false;
  impactLines: string[] = [];

  constructor(
    private route: ActivatedRoute,
    public publicApi: PublicApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.publicApi.getMinistryDetail(id).subscribe({
      next: (data) => {
        this.ministry = data;

        this.iconDisplayUrl = data.iconUrl ? this.publicApi.resolveAssetUrl(data.iconUrl) : '';

        this.photoItems = (data.photos || []).map((p: { url: string }) => ({
          url: this.publicApi.resolveAssetUrl(p.url)
        }));

        this.heroBgUrl = this.resolveHeroBackground(data);

        const externalList = [...(data.videos || [])];
        if (data.videoUrl && !externalList.includes(data.videoUrl)) {
          externalList.unshift(data.videoUrl);
        }
        this.videoEmbeds = externalList
          .map((v: string) => this.buildEmbedUrl(v))
          .filter((v): v is SafeResourceUrl => v !== null)
          .map((src) => ({ src }));

        this.internalVideos = (data.internalVideos || []).map((v: { url: string }) => ({
          url: this.publicApi.resolveAssetUrl(v.url)
        }));

        const impact = data.impactStats;
        if (typeof impact === 'string' && impact.trim()) {
          this.impactLines = impact
            .split(/\n+/)
            .map((s: string) => s.trim())
            .filter(Boolean);
        } else {
          this.impactLines = [];
        }

        const vc = Number(data.volunteerCount);
        if (Number.isFinite(vc) && vc >= 0) {
          data.volunteerCount = vc;
        }
        this.hasStats = (Number.isFinite(vc) && vc > 0) || this.impactLines.length > 0;

        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedPhoto) this.closePhoto();
  }

  openPhoto(item: MinistryPhotoItem): void {
    this.selectedPhoto = item;
  }

  closePhoto(): void {
    this.selectedPhoto = null;
  }

  get heroFallbackGradient(): string {
    const from = this.ministry?.colorFrom || '#4f46e5';
    const to = this.ministry?.colorTo || '#7c3aed';
    return `linear-gradient(145deg, ${from} 0%, ${to} 55%, #0f172a 100%)`;
  }

  statusLabel(status: string | undefined): string {
    if (status === 'inactive' || status === 'draft') return 'Próximamente';
    if (status === 'coming_soon') return 'Muy pronto';
    return 'Activo';
  }

  private resolveHeroBackground(data: any): string {
    if (this.photoItems.length > 0) {
      return this.photoItems[0].url;
    }
    if (data.cardImageUrl) {
      return this.publicApi.resolveAssetUrl(data.cardImageUrl);
    }
    if (data.image) {
      return this.publicApi.resolveAssetUrl(data.image);
    }
    return '';
  }

  private buildEmbedUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;
    const videoId = this.extractYouTubeId(url);
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
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
}
