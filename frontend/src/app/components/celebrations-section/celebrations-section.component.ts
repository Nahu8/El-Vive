import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-celebrations-section',
  imports: [CommonModule],
  templateUrl: './celebrations-section.component.html',
  styleUrls: ['./celebrations-section.component.css']
})
export class CelebrationsSectionComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('celebrationSection') celebrationSection!: ElementRef<HTMLElement>;
  @ViewChild('sobreLaRocaSection') sobreLaRocaSection!: ElementRef<HTMLElement>;
  @ViewChild('santaCenaSection') santaCenaSection!: ElementRef<HTMLElement>;

  private _observer: IntersectionObserver | null = null;

  private _preloadTimeouts: any[] = [];

  private _players: Record<string, any> = {};

  private _playerPauseTimeouts: Record<string, any> = {};

  private _ytApiLoading?: Promise<void>;

  preloadStaggerMs = 300;
  initialPreloadDelayMs = 150;

  private _snippetLengthSec = 25;

  celebrations: Array<{
    title: string;
    subtitle: string;
    description: string;
    videoId: string;
    startTime?: number;
    shouldLoad?: boolean;
    embedUrl?: SafeResourceUrl | null;
    animated?: boolean;
  }> = [];

  private _initialized = false;

  constructor(
    private sanitizer: DomSanitizer,
    private publicApi: PublicApiService
  ) {}

  ngOnInit() {
    this.loadCelebrations();
  }

  loadCelebrations() {
    this.publicApi.getHomeConfig().subscribe({
      next: (data) => {
        const celebrations = data.celebrations || [];
        this.celebrations = celebrations.map((celeb: any) => {
          const rawVideoId = celeb.videoId || '';
          const extractedVideoId = this.extractVideoId(rawVideoId);

          return {
            title: celeb.title || '',
            subtitle: celeb.subtitle || '',
            description: celeb.description || '',
            videoId: extractedVideoId,
            startTime: celeb.startTime || 0,
            shouldLoad: false,
            embedUrl: null,
            animated: false
          };
        });
      },
      error: (error) => {

        this.celebrations = [
          {
            title: 'CELEBRACIÓN',
            subtitle: 'Título de Celebración',
            description: 'Bajada o descripción de la celebración.',
            videoId: '3wuQUvXiLv8',
            startTime: 0,
            shouldLoad: false,
            embedUrl: null,
            animated: false
          },
          {
            title: 'SOBRE LA ROCA',
            subtitle: 'Título de Sobre la Roca',
            description: 'Bajada o descripción sobre este ministerio.',
            videoId: '2O1cS9zjM90',
            startTime: 0,
            shouldLoad: false,
            embedUrl: null,
            animated: false
          },
          {
            title: 'SANTA CENA',
            subtitle: 'Título de Santa Cena',
            description: 'Bajada o descripción sobre la Santa Cena.',
            videoId: '94Dje21syOA',
            startTime: 57,
            shouldLoad: false,
            embedUrl: null,
            animated: false
          }
        ];
      }
    });
  }

  ngAfterViewChecked() {
    if (!this._initialized && this.celebrations.length > 0 && this.celebrationSection?.nativeElement) {
      this._initialized = true;
      this.initializeCelebrations();
    }
  }

  private initializeCelebrations() {

    const first = this.celebrations[0];
    if (first && !first.embedUrl) {

      first.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(first.videoId, first.startTime));
    }

    const t = setTimeout(() => this.preloadAllWithStagger(), this.initialPreloadDelayMs);
    this._preloadTimeouts.push(t);

    this.setupScrollAnimations();
  }

  private setupScrollAnimations() {

    const observerOptions = {
      root: null,
      rootMargin: '200px 0px 200px 0px',
      threshold: [0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target as HTMLElement;
        const indexAttr = target.getAttribute('data-section-index');
        const i = indexAttr !== null ? parseInt(indexAttr, 10) : -1;
        const ratio = entry.intersectionRatio;

          if (i >= 0) {

            if (this.celebrations[i].animated) {
              target.style.opacity = '1';
              target.style.transform = 'translateX(0px)';
              return;
            }

            const baseDirection = (i % 2 === 1) ? 120 : -120;
            const clamped = Math.min(Math.max(ratio, 0), 1);

            const eased = Math.pow(clamped, 0.5);
            const translatePx = (1 - eased) * baseDirection;
            target.style.opacity = String(eased);
            target.style.transform = `translateX(${translatePx}px)`;

          if (ratio >= 0.2 && !this.celebrations[i].embedUrl) {

            this.celebrations[i].embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(this.celebrations[i].videoId, this.celebrations[i].startTime));
          }

          if (ratio >= 0.6 && !this.celebrations[i].shouldLoad) {
            this.celebrations[i].shouldLoad = true;

            setTimeout(() => this.initPlayerForIndex(i), 80);
          }

          if (ratio >= 0.6 && !this.celebrations[i].animated) {
            this.celebrations[i].animated = true;
            target.style.opacity = '1';
            target.style.transform = 'translateX(0px)';
            if (this._observer) { this._observer.unobserve(target); }
          }
        } else {

          target.style.opacity = String(Math.min(Math.max(entry.intersectionRatio, 0), 1));
        }
      });
    }, observerOptions);

    this._observer = observer;

    if (this.celebrationSection?.nativeElement) {
      this.celebrationSection.nativeElement.setAttribute('data-section-index', '0');
      observer.observe(this.celebrationSection.nativeElement);
    }
    if (this.sobreLaRocaSection?.nativeElement) {
      this.sobreLaRocaSection.nativeElement.setAttribute('data-section-index', '1');
      observer.observe(this.sobreLaRocaSection.nativeElement);
    }
    if (this.santaCenaSection?.nativeElement) {
      this.santaCenaSection.nativeElement.setAttribute('data-section-index', '2');
      observer.observe(this.santaCenaSection.nativeElement);
    }
  }

  loadVideo(index: number) {
    const item = this.celebrations[index];
    if (!item) { return; }
    if (!item.embedUrl) {

      item.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(item.videoId, item.startTime));
    }
    item.shouldLoad = true;

    setTimeout(() => this.initPlayerForIndex(index), 80);
  }

  extractVideoId(urlOrId: string): string {
    if (!urlOrId) { return ''; }
    

    urlOrId = urlOrId.trim();
    

    if (!urlOrId.includes('http') && !urlOrId.includes('/') && !urlOrId.includes('?')) {
      return urlOrId;
    }
    

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
      /youtu\.be\/([^?\n#]+)/,
      /youtube\.com\/embed\/([^?\n#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    

    return urlOrId;
  }

  getVideoUrl(videoId: string, startTime?: number): string {
    if (!videoId) { return ''; }
    

    const extractedId = this.extractVideoId(videoId);
    if (!extractedId) { return ''; }
    

    let url = `https://www.youtube.com/embed/${extractedId}?autoplay=1&mute=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`;
    if (startTime) { url += `&start=${startTime}`; }
    return url;
  }

  preloadAllWithStagger() {
    this.celebrations.forEach((_, i) => {
      const delay = i * this.preloadStaggerMs;
      const t = setTimeout(() => {
        const item = this.celebrations[i];
        if (!item) { return; }
        if (!item.embedUrl) {

          item.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(item.videoId, item.startTime));
        }

        item.shouldLoad = true;

        setTimeout(() => this.initPlayerForIndex(i), 120 + (i * 40));
      }, delay);
      this._preloadTimeouts.push(t);
    });
  }

  private ensureYouTubeApiLoaded(): Promise<void> {
    if ((window as any).YT && (window as any).YT.Player) {
      return Promise.resolve();
    }
    if (this._ytApiLoading) { return this._ytApiLoading; }
    this._ytApiLoading = new Promise((resolve) => {
      (window as any).onYouTubeIframeAPIReady = () => resolve();
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    });
    return this._ytApiLoading;
  }

  private async initPlayerForIndex(index: number) {
    const item = this.celebrations[index];
    if (!item || !item.videoId) { return; }
    

    const cleanVideoId = this.extractVideoId(item.videoId);
    if (!cleanVideoId) { return; }
    

    if (this._players[cleanVideoId]) { return; }

    await this.ensureYouTubeApiLoaded();

    const containerId = `yt-player-${index}`;

    const el = document.getElementById(containerId);
    if (!el) {
      setTimeout(() => this.initPlayerForIndex(index), 120);
      return;
    }

    try {
      const Player = (window as any).YT.Player;
      const player = new Player(containerId, {
        videoId: cleanVideoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          modestbranding: 1,
          start: item.startTime || 0,
          playsinline: 1
        },
        events: {
          onReady: (ev: any) => {
            try { ev.target.playVideo(); } catch { void 0; }

            const pauseT = setTimeout(() => {
              try { ev.target.pauseVideo(); } catch { void 0; }
            }, this._snippetLengthSec * 1000);
            this._playerPauseTimeouts[cleanVideoId] = pauseT;
          }
        }
      });
      this._players[cleanVideoId] = player;
    } catch (err) {

    }
  }

  ngOnDestroy(): void {

    this._preloadTimeouts.forEach(t => clearTimeout(t));
    this._preloadTimeouts = [];

    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    Object.values(this._playerPauseTimeouts).forEach((t: any) => clearTimeout(t));
    this._playerPauseTimeouts = {};

    Object.values(this._players).forEach((p: any) => { try { p.destroy(); } catch (_) {} });
    this._players = {};
  }
}

