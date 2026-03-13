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

  // IntersectionObserver reference (for cleanup)
  private _observer: IntersectionObserver | null = null;
  // Track timeouts created for staggered preload so we can clear them
  private _preloadTimeouts: any[] = [];
  // YouTube players map (keyed by videoId)
  private _players: Record<string, any> = {};
  // Pause timeouts for players so we can clear them on destroy
  private _playerPauseTimeouts: Record<string, any> = {};
  // Promise used while loading the YouTube iframe API
  private _ytApiLoading?: Promise<void>;
  // Stagger configuration (ms between preloads)
  preloadStaggerMs = 300;
  initialPreloadDelayMs = 150;
  // Snippet length in seconds (used for automatic pause)
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
        console.error('Error cargando Celebrations:', error);
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

  // no additional NgZone usage required

  ngAfterViewChecked() {
    if (!this._initialized && this.celebrations.length > 0 && this.celebrationSection?.nativeElement) {
      this._initialized = true;
      this.initializeCelebrations();
    }
  }

  private initializeCelebrations() {
    // Pre-load the first celebration so it appears fast on first paint
    const first = this.celebrations[0];
    if (first && !first.embedUrl) {
      // prepare the embedUrl (sanitized) but DO NOT set shouldLoad yet —
      // iframe will be created when the section intersects (keeps animation)
      first.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(first.videoId, first.startTime));
    }

    // Kick off staggered preload shortly after initial paint to improve perceived speed
    const t = setTimeout(() => this.preloadAllWithStagger(), this.initialPreloadDelayMs);
    this._preloadTimeouts.push(t);

    this.setupScrollAnimations();
  }

  private setupScrollAnimations() {
    // Use multiple thresholds so we can update animation smoothly based on
    // the intersectionRatio (scroll-synced animation). We'll create the
    // iframe only once the section is sufficiently visible (> 0.6).
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

        // Apply smooth opacity and translate based on ratio so animation
        // follows scroll progress. Direction alternates per index.
          if (i >= 0) {
            // If this section already finished its animation, keep final state and skip
            if (this.celebrations[i].animated) {
              target.style.opacity = '1';
              target.style.transform = 'translateX(0px)';
              return;
            }

            // Make animation more noticeable:
            // - increase horizontal offset (120px)
            // - use an eased opacity curve so elements become visible earlier
            const baseDirection = (i % 2 === 1) ? 120 : -120;
            const clamped = Math.min(Math.max(ratio, 0), 1);
            // sqrt easing (pow 0.5) makes the element appear more quickly as you scroll
            const eased = Math.pow(clamped, 0.5);
            const translatePx = (1 - eased) * baseDirection;
            target.style.opacity = String(eased);
            target.style.transform = `translateX(${translatePx}px)`;

          // When we reach reasonable visibility, prepare and show the iframe
          if (ratio >= 0.2 && !this.celebrations[i].embedUrl) {
            console.debug('[celebrations] preparing embedUrl on scroll for', i, this.celebrations[i].videoId, 'ratio=', ratio);
            this.celebrations[i].embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(this.celebrations[i].videoId, this.celebrations[i].startTime));
          }

          // Only create the iframe (shouldLoad) when sufficiently visible so autoplay
          // triggers but we keep animation in sync (use 0.6 threshold)
          if (ratio >= 0.6 && !this.celebrations[i].shouldLoad) {
            this.celebrations[i].shouldLoad = true;
            // attempt to initialize a YouTube player for this index
            setTimeout(() => this.initPlayerForIndex(i), 80);
          }

          // When fully visible enough, mark as animated and unobserve so the
          // animation doesn't run again on later scrolls.
          if (ratio >= 0.6 && !this.celebrations[i].animated) {
            this.celebrations[i].animated = true;
            target.style.opacity = '1';
            target.style.transform = 'translateX(0px)';
            if (this._observer) { this._observer.unobserve(target); }
          }
        } else {
          // Fallback: set opacity based on intersection
          target.style.opacity = String(Math.min(Math.max(entry.intersectionRatio, 0), 1));
        }
      });
    }, observerOptions);

    // Save observer reference for cleanup
    this._observer = observer;

    // Observar cada sección
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
      console.debug('[celebrations] loadVideo -> preparing embedUrl for', index, item.videoId);
      item.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(item.videoId, item.startTime));
    }
    item.shouldLoad = true;
    // after Angular renders the iframe container, initialize the YT player
    setTimeout(() => this.initPlayerForIndex(index), 80);
  }

  /** Extract YouTube video ID from various URL formats */
  extractVideoId(urlOrId: string): string {
    if (!urlOrId) { return ''; }
    
    // Limpiar espacios en blanco
    urlOrId = urlOrId.trim();
    
    // Si ya es solo un ID (sin caracteres especiales de URL), devolverlo
    if (!urlOrId.includes('http') && !urlOrId.includes('/') && !urlOrId.includes('?')) {
      return urlOrId;
    }
    
    // Patrones para extraer el videoId de diferentes formatos de URL
    const patterns = [
      // https://www.youtube.com/watch?v=jRq2LCrdCa8
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      // https://youtube.com/watch?v=jRq2LCrdCa8&t=30s
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
      // https://youtu.be/jRq2LCrdCa8
      /youtu\.be\/([^?\n#]+)/,
      // https://www.youtube.com/embed/jRq2LCrdCa8
      /youtube\.com\/embed\/([^?\n#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Si no coincide con ningún patrón, devolver el string original (por si acaso ya es un ID)
    return urlOrId;
  }

  /** Return the raw embed URL string (not sanitized) */
  getVideoUrl(videoId: string, startTime?: number): string {
    if (!videoId) { return ''; }
    
    // Extraer el videoId si es una URL completa
    const extractedId = this.extractVideoId(videoId);
    if (!extractedId) { return ''; }
    
    // Build embed URL with autoplay and mute so the iframe starts muted when loaded
    // include enablejsapi=1 so we can control playback via the IFrame API if needed
    let url = `https://www.youtube.com/embed/${extractedId}?autoplay=1&mute=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`;
    if (startTime) { url += `&start=${startTime}`; }
    return url;
  }

  /** Start staggered preload of all celebration videos to avoid network spikes */
  preloadAllWithStagger() {
    this.celebrations.forEach((_, i) => {
      const delay = i * this.preloadStaggerMs;
      const t = setTimeout(() => {
        const item = this.celebrations[i];
        if (!item) { return; }
        if (!item.embedUrl) {
          console.debug('[celebrations] preloading', i, item.videoId);
          item.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getVideoUrl(item.videoId, item.startTime));
        }
        // mark shouldLoad so iframe will be created
        item.shouldLoad = true;
        // Initialize player after a short delay to allow DOM insertion
        setTimeout(() => this.initPlayerForIndex(i), 120 + (i * 40));
      }, delay);
      this._preloadTimeouts.push(t);
    });
  }

  /** Ensure the YouTube IFrame API is loaded and ready */
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

  /** Create/init a YT.Player for the celebration at index (if not already) and pause after 20s */
  private async initPlayerForIndex(index: number) {
    const item = this.celebrations[index];
    if (!item || !item.videoId) { return; }
    
    // Asegurar que el videoId esté limpio (sin URL completa)
    const cleanVideoId = this.extractVideoId(item.videoId);
    if (!cleanVideoId) { return; }
    
    // if player already exists for this videoId, don't recreate
    if (this._players[cleanVideoId]) { return; }

    await this.ensureYouTubeApiLoaded();

    // The container id we will render the player into
    const containerId = `yt-player-${index}`;

    // If the container element isn't yet in DOM, wait a bit and retry
    const el = document.getElementById(containerId);
    if (!el) {
      setTimeout(() => this.initPlayerForIndex(index), 120);
      return;
    }

    try {
      const Player = (window as any).YT.Player;
      const player = new Player(containerId, {
        videoId: cleanVideoId, // Usar el videoId limpio
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
            try { ev.target.playVideo(); } catch (e) { /* ignore */ }
            // schedule automatic pause after configured seconds (fallback)
            const pauseT = setTimeout(() => {
              try { ev.target.pauseVideo(); } catch (e) { /* ignore */ }
            }, this._snippetLengthSec * 1000);
            this._playerPauseTimeouts[cleanVideoId] = pauseT;
          }
        }
      });
      this._players[cleanVideoId] = player;
    } catch (err) {
      console.warn('[celebrations] failed to init YT player for', cleanVideoId, err);
    }
  }

  ngOnDestroy(): void {
    // Clear any pending timeouts
    this._preloadTimeouts.forEach(t => clearTimeout(t));
    this._preloadTimeouts = [];
    // Disconnect observer
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    // Clear player pause timeouts
    Object.values(this._playerPauseTimeouts).forEach((t: any) => clearTimeout(t));
    this._playerPauseTimeouts = {};
    // Destroy any YT players
    Object.values(this._players).forEach((p: any) => { try { p.destroy(); } catch (_) {} });
    this._players = {};
  }
}

