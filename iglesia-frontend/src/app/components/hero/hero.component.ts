import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicApiService } from '../../services/public-api.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {
  isPlaying = false;
  showPlayButton = false;

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

        if (data.hasVideo) {
          this.videoSrc = 'http://127.0.0.1:3000/api/home/current-video';
        } else {
          this.videoSrc = 'assets/videos/MinisteriosServicios Pantalla.mp4';
        }

        this.heroVideoUrl = this.videoSrc;
        this.themeIconUrl = data.theme?.iconUrl || null;
        this.heroIconUrl = data.hasIcon ? 'http://127.0.0.1:3000/api/home/current-icon' : null;

        this.reloadVideo();
      },
      error: () => {
        this.videoSrc = 'assets/videos/MinisteriosServicios Pantalla.mp4';
        this.reloadVideo();
      }
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
        this.showPlayButton = false;
      }).catch(() => {
        let attempts = 0;
        const retryInterval = setInterval(() => {
          attempts++;
          video.play().then(() => {
            clearInterval(retryInterval);
            this.isPlaying = true;
            this.showPlayButton = false;
          }).catch(() => {
            if (attempts >= 5) {
              clearInterval(retryInterval);
              this.showPlayButton = true;
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
  }

  playVideo() {
    const video = this.videoElement?.nativeElement;
    if (!video) return;
    video.play().then(() => {
      this.isPlaying = true;
      this.showPlayButton = false;
    }).catch(() => {
      this.showPlayButton = true;
    });
  }
}
