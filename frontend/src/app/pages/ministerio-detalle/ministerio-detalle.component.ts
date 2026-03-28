import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ministerio-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ministerio-detalle.component.html',
  styleUrls: ['./ministerio-detalle.component.css']
})
export class MinisterioDetalleComponent implements OnInit {
  ministry: any = null;
  loading = true;
  error = false;
  environment = environment;

  videoEmbeds: SafeResourceUrl[] = [];
  internalVideoUrls: string[] = [];
  photoUrls: string[] = [];
  selectedPhoto: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private publicApi: PublicApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicApi.getMinistryDetail(id).subscribe({
        next: (data) => {
          this.ministry = data;

          if (data.photos && data.photos.length > 0) {
            this.photoUrls = data.photos.map((p: any) => environment.apiBaseUrl + p.url);
          }
          if (data.iconUrl) {
            this.ministry.iconFullUrl = environment.apiBaseUrl + data.iconUrl;
          }

          const allVideos = [...(data.videos || [])];
          if (data.videoUrl && !allVideos.includes(data.videoUrl)) {
            allVideos.unshift(data.videoUrl);
          }
          this.videoEmbeds = allVideos
            .map((v: string) => this.buildEmbedUrl(v))
            .filter((v): v is SafeResourceUrl => v !== null);

          this.internalVideoUrls = (data.internalVideos || []).map(
            (v: { url: string }) => environment.apiBaseUrl + v.url
          );

          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  openPhoto(url: string): void {
    this.selectedPhoto = url;
  }

  closePhoto(): void {
    this.selectedPhoto = null;
  }

  private buildEmbedUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;
    const videoId = this.extractYouTubeId(url);
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}`
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
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m?.[1]) return m[1];
    }
    if (!url.includes('/') && !url.includes('.') && url.length >= 8) return url;
    return null;
  }
}
