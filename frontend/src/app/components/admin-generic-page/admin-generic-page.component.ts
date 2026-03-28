import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-generic-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-generic-page.component.html',
  styleUrls: ['./admin-generic-page.component.css']
})
export class AdminGenericPageComponent implements OnInit {
  @Input() pageKey: 'donaciones' | 'nosotros' = 'donaciones';
  @Input() pageTitle = 'Donaciones';
  @Input() defaultHeroTitle = 'DONACIONES';
  @Input() defaultHeroSubtitle = 'Tu aporte ayuda a sostener la obra.';

  pageContent: {
    hero: {
      title: string;
      subtitle: string;
      badge?: string;
      backgroundImageUrl?: string;
      backgroundImageUrlLight?: string;
      backgroundImageUrlDark?: string;
      backgroundVideoUrl?: string;
      bgColorLight?: string;
      bgColorDark?: string;
      fadeEnabled?: boolean;
      fadeColorLight?: string;
      fadeColorDark?: string;
    };
    intro: { title: string; content: string };
    /** Donaciones: tarjetas “por qué dar” con imagen */
    whyGive?: Array<{ title: string; content: string; imageUrl?: string }>;
    /** Donaciones: transferencia, MP, etc. */
    paymentMethods?: Array<{
      label: string;
      description?: string;
      detail: string;
      icon?: string;
      imageUrl?: string;
    }>;
    donacionesCta?: {
      title: string;
      subtitle?: string;
      buttonText?: string;
      buttonUrl?: string;
      imageUrl?: string;
    };
    highlights?: Array<{ title: string; content: string; linkText?: string; linkUrl?: string }>;
    leadership?: {
      pastorName?: string;
      pastorRole?: string;
      pastorImageUrl?: string;
      pastoraName?: string;
      pastoraRole?: string;
      pastoraImageUrl?: string;
      groupTitle?: string;
      groupRole?: string;
      groupImageUrl?: string;
    };
    sections: Array<{ type: string; title?: string; content?: string; imageUrl?: string; videoUrl?: string; caption?: string; layout?: string }>;
  } = {
    hero: {
      title: '',
      subtitle: '',
      bgColorLight: '#ffffff',
      bgColorDark: '#000000',
      fadeEnabled: true,
      fadeColorLight: '#000000',
      fadeColorDark: '#000000'
    },
    intro: { title: '', content: '' },
    whyGive: [],
    paymentMethods: [],
    donacionesCta: { title: '', subtitle: '', buttonText: '', buttonUrl: '/contacto', imageUrl: '' },
    highlights: [],
    leadership: {
      pastorName: '',
      pastorRole: '',
      pastorImageUrl: '',
      pastoraName: '',
      pastoraRole: '',
      pastoraImageUrl: '',
      groupTitle: '',
      groupRole: '',
      groupImageUrl: ''
    },
    sections: []
  };

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  apiBase = environment.apiBaseUrl;

  constructor(private apiService: ApiService, private http: HttpClient) {}

  ngOnInit() {
    this.loadContent();
  }

  loadContent() {
    this.apiService.getGenericPage(this.pageKey).subscribe({
      next: (data) => {
        const pc = data.pageContent || {};
        this.pageContent = {
          hero: {
            title: pc.hero?.title || this.defaultHeroTitle,
            subtitle: pc.hero?.subtitle || this.defaultHeroSubtitle,
            badge: pc.hero?.badge,
            backgroundImageUrl: pc.hero?.backgroundImageUrl,
            backgroundImageUrlLight: pc.hero?.backgroundImageUrlLight,
            backgroundImageUrlDark: pc.hero?.backgroundImageUrlDark,
            backgroundVideoUrl: pc.hero?.backgroundVideoUrl,
            bgColorLight: pc.hero?.bgColorLight || '#ffffff',
            bgColorDark: pc.hero?.bgColorDark || '#000000',
            fadeEnabled: pc.hero?.fadeEnabled !== false,
            fadeColorLight: pc.hero?.fadeColorLight || '#000000',
            fadeColorDark: pc.hero?.fadeColorDark || '#000000'
          },
          intro: { title: pc.intro?.title || '', content: pc.intro?.content || '' },
          whyGive: Array.isArray(pc.whyGive) ? [...pc.whyGive] : [],
          paymentMethods: Array.isArray(pc.paymentMethods) ? [...pc.paymentMethods] : [],
          donacionesCta: {
            title: pc.donacionesCta?.title || '',
            subtitle: pc.donacionesCta?.subtitle || '',
            buttonText: pc.donacionesCta?.buttonText || '',
            buttonUrl: pc.donacionesCta?.buttonUrl || '/contacto',
            imageUrl: pc.donacionesCta?.imageUrl || ''
          },
          highlights: Array.isArray(pc.highlights) ? [...pc.highlights] : [],
          leadership: {
            pastorName: pc.leadership?.pastorName || '',
            pastorRole: pc.leadership?.pastorRole || '',
            pastorImageUrl: pc.leadership?.pastorImageUrl || '',
            pastoraName: pc.leadership?.pastoraName || '',
            pastoraRole: pc.leadership?.pastoraRole || '',
            pastoraImageUrl: pc.leadership?.pastoraImageUrl || '',
            groupTitle: pc.leadership?.groupTitle || '',
            groupRole: pc.leadership?.groupRole || '',
            groupImageUrl: pc.leadership?.groupImageUrl || ''
          },
          sections: Array.isArray(pc.sections) ? [...pc.sections] : []
        };
      }
    });
  }

  saveAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.updateGenericPage(this.pageKey, this.pageContent).subscribe({
        next: () => {
          this.showToastMsg('Guardado correctamente');
          resolve();
        },
        error: (e) => {
          this.showToastMsg('Error al guardar', 'error');
          reject(e);
        }
      });
    });
  }

  addSection() {
    this.pageContent.sections.push({ type: 'text', title: '', content: '' });
  }

  addWhyGive() {
    if (!this.pageContent.whyGive) this.pageContent.whyGive = [];
    this.pageContent.whyGive.push({ title: '', content: '', imageUrl: '' });
  }

  removeWhyGive(i: number) {
    this.pageContent.whyGive?.splice(i, 1);
  }

  addPaymentMethod() {
    if (!this.pageContent.paymentMethods) this.pageContent.paymentMethods = [];
    this.pageContent.paymentMethods.push({ label: '', description: '', detail: '', icon: '💰', imageUrl: '' });
  }

  removePaymentMethod(i: number) {
    this.pageContent.paymentMethods?.splice(i, 1);
  }

  onWhyGiveImageSelected(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        if (this.pageContent.whyGive?.[index]) {
          this.pageContent.whyGive[index].imageUrl = res.path || res.url || '';
        }
        this.showToastMsg('Imagen subida');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  onPaymentMethodImageSelected(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        if (this.pageContent.paymentMethods?.[index]) {
          this.pageContent.paymentMethods[index].imageUrl = res.path || res.url || '';
        }
        this.showToastMsg('Imagen subida');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  onDonacionesCtaImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        if (!this.pageContent.donacionesCta) this.pageContent.donacionesCta = { title: '', buttonUrl: '/contacto' };
        this.pageContent.donacionesCta.imageUrl = res.path || res.url || '';
        this.showToastMsg('Imagen subida');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  addHighlight() {
    if (!this.pageContent.highlights) this.pageContent.highlights = [];
    this.pageContent.highlights.push({ title: '', content: '', linkText: 'Leer más', linkUrl: '' });
  }

  removeHighlight(i: number) {
    this.pageContent.highlights?.splice(i, 1);
  }

  removeSection(i: number) {
    this.pageContent.sections.splice(i, 1);
  }

  onHeroImageSelected(event: Event, mode: 'light' | 'dark') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        const imagePath = res.path || res.url || '';
        if (mode === 'light') this.pageContent.hero.backgroundImageUrlLight = imagePath;
        else this.pageContent.hero.backgroundImageUrlDark = imagePath;
        this.showToastMsg('Imagen subida');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  onSectionImageSelected(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        if (this.pageContent.sections[index]) {
          this.pageContent.sections[index].imageUrl = res.path || res.url || '';
        }
        this.showToastMsg('Imagen subida');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  onLeadershipImageSelected(event: Event, key: 'pastorImageUrl' | 'pastoraImageUrl' | 'groupImageUrl') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        if (!this.pageContent.leadership) this.pageContent.leadership = {};
        this.pageContent.leadership[key] = res.path || res.url || '';
        this.showToastMsg('Imagen subida');
      },
      error: () => this.showToastMsg('Error al subir', 'error')
    });
  }

  resolveUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let p = path.startsWith('/') ? path : '/' + path;
    if (p.startsWith('/images/') || p.startsWith('/videos/') || p.startsWith('/icons/')) {
      p = '/uploads' + p;
    }
    return this.apiBase + p;
  }

  private showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
