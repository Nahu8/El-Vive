import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { PublicApiService } from '../../services/public-api.service';

const API_BASE = 'http://127.0.0.1:3000';

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
  heroVideoUrl = '';

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
    private sanitizer: DomSanitizer
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
        this.heroVideoUrl = this.resolveUrl(pc.hero?.backgroundVideoUrl) || pc.hero?.backgroundVideoUrl || '';

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
    return path.startsWith('/') ? API_BASE + path : API_BASE + '/' + path;
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
}
