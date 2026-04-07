import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  activeTab = 'header';
  tabs: TabItem[] = [
    { id: 'header', label: 'Header' },
    { id: 'videos', label: 'Videos YT' },
    { id: 'ministries', label: 'Ministerios' },
    { id: 'meetings', label: 'Dias de Reunion' }
  ];

  heroForm: FormGroup;
  videosForm: FormGroup;
  celebrationsForm: FormGroup;
  meetingDaysForm: FormGroup;
  ministriesForm: FormGroup;

  // Videos 2x2 (día x modo)
  hasVideoDomLight = false;
  videoDomLightName = '';
  videoDomLightPreview: string | null = null;
  isUploadingDomLight = false;
  hasVideoDomDark = false;
  videoDomDarkName = '';
  videoDomDarkPreview: string | null = null;
  isUploadingDomDark = false;
  hasVideoMierLight = false;
  videoMierLightName = '';
  videoMierLightPreview: string | null = null;
  isUploadingMierLight = false;
  hasVideoMierDark = false;
  videoMierDarkName = '';
  videoMierDarkPreview: string | null = null;
  isUploadingMierDark = false;

  // Íconos 2x2 (día x modo)
  hasIconDomLight = false;
  iconDomLightName = '';
  iconDomLightPreview: string | null = null;
  isUploadingIconDomLight = false;
  hasIconDomDark = false;
  iconDomDarkName = '';
  iconDomDarkPreview: string | null = null;
  isUploadingIconDomDark = false;
  hasIconMierLight = false;
  iconMierLightName = '';
  iconMierLightPreview: string | null = null;
  isUploadingIconMierLight = false;
  hasIconMierDark = false;
  iconMierDarkName = '';
  iconMierDarkPreview: string | null = null;
  isUploadingIconMierDark = false;

  // Card images state: { [cardIndex]: { name, url } }
  cardImages: Record<number, { name: string; url: string }> = {};
  uploadingCardIndex: number | null = null;

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.heroForm = this.fb.group({
      heroTitle: ['', Validators.required],
      heroButton1Text: ['', Validators.required],
      heroButton1Link: ['', Validators.required],
      heroButton2Text: ['', Validators.required],
      heroButton2Link: ['', Validators.required],
      heroBgLightColor: ['#ffffff'],
      heroBgDarkColor: ['#000000'],
      heroFadeEnabled: [true],
      heroFadeLightColor: ['#ffffff'],
      heroFadeDarkColor: ['#000000'],
      heroVideoUrl: ['']
    });

    this.videosForm = this.fb.group({
      video1Url: [''],
      video2Url: ['']
    });

    this.celebrationsForm = this.fb.group({
      celebrations: this.fb.array([])
    });

    this.meetingDaysForm = this.fb.group({
      sectionTitle: ['', Validators.required],
      sectionSubtitle: [''],
      meetings: this.fb.array([])
    });

    this.ministriesForm = this.fb.group({
      sectionTitle: ['', Validators.required],
      sectionSubtitle: [''],
      ministryIds: [[] as string[]]
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  loadAllData(): void {
    console.log('[AdminHome] Cargando datos desde API...');
    this.apiService.getHome().subscribe({
      next: (data) => {
        console.log('[AdminHome] Datos recibidos:', data);

        this.heroForm.patchValue({
          heroTitle: data.heroTitle || '',
          heroButton1Text: data.heroButton1Text || '',
          heroButton1Link: data.heroButton1Link || '',
          heroButton2Text: data.heroButton2Text || '',
          heroButton2Link: data.heroButton2Link || '',
          heroBgLightColor: data.heroBgLightColor || '#ffffff',
          heroBgDarkColor: data.heroBgDarkColor || '#000000',
          heroFadeEnabled: data.heroFadeEnabled !== false,
          heroFadeLightColor: data.heroFadeLightColor || '#ffffff',
          heroFadeDarkColor: data.heroFadeDarkColor || '#000000',
          heroVideoUrl: data.heroVideoUrl || ''
        });
        this.hasVideoDomLight = !!data.hasVideoDomLight;
        this.videoDomLightName = data.heroVideoDomLightName || '';
        this.videoDomLightPreview = this.hasVideoDomLight ? `${environment.apiBaseUrl}/api/home/video-dom-light` : null;
        this.hasVideoDomDark = !!data.hasVideoDomDark;
        this.videoDomDarkName = data.heroVideoDomDarkName || '';
        this.videoDomDarkPreview = this.hasVideoDomDark ? `${environment.apiBaseUrl}/api/home/video-dom-dark` : null;
        this.hasVideoMierLight = !!data.hasVideoMierLight;
        this.videoMierLightName = data.heroVideoMierLightName || '';
        this.videoMierLightPreview = this.hasVideoMierLight ? `${environment.apiBaseUrl}/api/home/video-mier-light` : null;
        this.hasVideoMierDark = !!data.hasVideoMierDark;
        this.videoMierDarkName = data.heroVideoMierDarkName || '';
        this.videoMierDarkPreview = this.hasVideoMierDark ? `${environment.apiBaseUrl}/api/home/video-mier-dark` : null;

        this.hasIconDomLight = !!data.hasIconDomLight;
        this.iconDomLightName = data.heroIconDomLightName || '';
        this.iconDomLightPreview = this.hasIconDomLight ? `${environment.apiBaseUrl}/api/home/icon-dom-light` : null;
        this.hasIconDomDark = !!data.hasIconDomDark;
        this.iconDomDarkName = data.heroIconDomDarkName || '';
        this.iconDomDarkPreview = this.hasIconDomDark ? `${environment.apiBaseUrl}/api/home/icon-dom-dark` : null;
        this.hasIconMierLight = !!data.hasIconMierLight;
        this.iconMierLightName = data.heroIconMierLightName || '';
        this.iconMierLightPreview = this.hasIconMierLight ? `${environment.apiBaseUrl}/api/home/icon-mier-light` : null;
        this.hasIconMierDark = !!data.hasIconMierDark;
        this.iconMierDarkName = data.heroIconMierDarkName || '';
        this.iconMierDarkPreview = this.hasIconMierDark ? `${environment.apiBaseUrl}/api/home/icon-mier-dark` : null;

        if (data.cardImages) {
          this.cardImages = {};
          for (const [idx, img] of Object.entries(data.cardImages as Record<string, any>)) {
            this.cardImages[Number(idx)] = { name: img.imageName, url: `${environment.apiBaseUrl}/api/home/card-image/${idx}` };
          }
        }

        this.videosForm.patchValue({
          video1Url: data.video1Url || '',
          video2Url: data.video2Url || ''
        });

        this.loadCelebrationsData(data);
        this.loadMeetingDaysData(data);
        this.loadMinistriesData(data);
      },
      error: (err) => {
        console.error('[AdminHome] Error al cargar datos:', err);
        this.toast('Error al cargar los datos: ' + (err.message || err.status), 'error');
      }
    });
  }

  // --- Celebrations ---
  loadCelebrationsData(data: any): void {
    const arr = this.celebrationsForm.get('celebrations') as FormArray;
    arr.clear();
    (data?.celebrations || []).forEach((c: any) => arr.push(this.createCelebrationForm(c)));
  }

  createCelebrationForm(c?: any): FormGroup {
    return this.fb.group({
      title: [c?.title || '', Validators.required],
      subtitle: [c?.subtitle || ''],
      description: [c?.description || ''],
      videoId: [c?.videoId || '', Validators.required],
      startTime: [c?.startTime || 0]
    });
  }

  get celebrationsArray(): FormArray { return this.celebrationsForm.get('celebrations') as FormArray; }
  addCelebration(): void { this.celebrationsArray.push(this.createCelebrationForm()); }
  removeCelebration(i: number): void { this.celebrationsArray.removeAt(i); }

  // --- Meeting Days ---
  loadMeetingDaysData(data: any): void {
    const summary = data?.meetingDaysSummary || {};
    this.meetingDaysForm.patchValue({
      sectionTitle: summary.sectionTitle || 'DIAS DE REUNION',
      sectionSubtitle: summary.sectionSubtitle || ''
    });
    const arr = this.meetingDaysForm.get('meetings') as FormArray;
    arr.clear();
    (summary.meetings || []).forEach((m: any) => arr.push(this.createMeetingForm(m)));
  }

  createMeetingForm(m?: any): FormGroup {
    return this.fb.group({
      day: [m?.day || '', Validators.required],
      title: [m?.title || '', Validators.required],
      time: [m?.time || '', Validators.required],
      note: [m?.note || ''],
      colorFrom: [m?.colorFrom || '#4f46e5'],
      colorTo: [m?.colorTo || '#ec4899']
    });
  }

  get meetingsArray(): FormArray { return this.meetingDaysForm.get('meetings') as FormArray; }
  addMeeting(): void { this.meetingsArray.push(this.createMeetingForm()); }
  removeMeeting(i: number): void { this.meetingsArray.removeAt(i); }

  // --- Ministries (selector desde página Ministerios) ---
  allMinistries: Array<{ id: string; name: string }> = [];

  loadMinistriesData(data: any): void {
    const summary = data?.ministriesSummary || {};
    let ministryIds: string[] = [];
    if (Array.isArray(summary.ministryIds)) {
      ministryIds = summary.ministryIds.map((id: any) => String(id));
    } else if (Array.isArray(summary.ministries)) {
      ministryIds = (summary.ministries as any[]).map((m: any) => String(m.id ?? '')).filter(Boolean);
    }
    this.ministriesForm.patchValue({
      sectionTitle: summary.sectionTitle || 'NUESTROS MINISTERIOS',
      sectionSubtitle: summary.sectionSubtitle || '',
      ministryIds
    });
    this.loadAllMinistriesForSelect();
  }

  loadAllMinistriesForSelect(): void {
    this.apiService.getMinistriesContent().subscribe({
      next: (data) => {
        this.allMinistries = (data?.ministries || []).map((m: any) => ({
          id: String(m.id ?? ''),
          name: m.name || 'Sin nombre'
        })).filter((m: { id: string }) => m.id);
      },
      error: () => { this.allMinistries = []; }
    });
  }

  get selectedMinistriesForDisplay(): Array<{ id: string; name: string }> {
    const ids = this.ministriesForm.get('ministryIds')?.value as string[] || [];
    return ids.map(id => this.allMinistries.find(m => m.id === id)).filter(Boolean) as Array<{ id: string; name: string }>;
  }

  get availableMinistriesForSelect(): Array<{ id: string; name: string }> {
    const ids = this.ministriesForm.get('ministryIds')?.value as string[] || [];
    return this.allMinistries.filter(m => !ids.includes(m.id));
  }

  addMinistryToSelection(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const id = sel.value;
    if (!id) return;
    const ids = [...(this.ministriesForm.get('ministryIds')?.value || []), id];
    if (ids.length <= 4) {
      this.ministriesForm.patchValue({ ministryIds: ids });
    }
    sel.value = '';
  }

  removeMinistryFromSelection(index: number): void {
    const ids = [...(this.ministriesForm.get('ministryIds')?.value || [])];
    ids.splice(index, 1);
    this.ministriesForm.patchValue({ ministryIds: ids });
  }

  moveMinistryUp(index: number): void {
    if (index <= 0) return;
    const ids = [...(this.ministriesForm.get('ministryIds')?.value || [])];
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    this.ministriesForm.patchValue({ ministryIds: ids });
  }

  moveMinistryDown(index: number): void {
    const ids = [...(this.ministriesForm.get('ministryIds')?.value || [])];
    if (index >= ids.length - 1) return;
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    this.ministriesForm.patchValue({ ministryIds: ids });
  }

  // --- File Handlers ---
  onVideoDomLightSelected(event: Event): void { this.uploadVideoByKey(event, 'domLight'); }
  onVideoDomDarkSelected(event: Event): void { this.uploadVideoByKey(event, 'domDark'); }
  onVideoMierLightSelected(event: Event): void { this.uploadVideoByKey(event, 'mierLight'); }
  onVideoMierDarkSelected(event: Event): void { this.uploadVideoByKey(event, 'mierDark'); }

  // --- Extract YouTube ID ---
  extractVideoId(urlOrId: string): string {
    if (!urlOrId) return '';
    urlOrId = urlOrId.trim();
    if (!urlOrId.includes('http') && !urlOrId.includes('/') && !urlOrId.includes('?')) return urlOrId;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
      /youtu\.be\/([^?\n#]+)/
    ];
    for (const p of patterns) {
      const m = urlOrId.match(p);
      if (m?.[1]) return m[1];
    }
    return urlOrId;
  }

  // --- Save Methods ---
  saveHero(): void {
    if (!this.heroForm.valid) return this.toast('Complete los campos requeridos', 'error');
    console.log('[AdminHome] Guardando hero:', this.heroForm.value);
    this.apiService.updateHero(this.heroForm.value).subscribe({
      next: (res) => {
        console.log('[AdminHome] Hero guardado OK:', res);
        this.toast('Header guardado');
      },
      error: (err) => {
        console.error('[AdminHome] Error al guardar hero:', err);
        this.toast('Error al guardar: ' + (err.message || err.status), 'error');
      }
    });
  }

  saveVideos(): void {
    const data = this.videosForm.value;
    this.apiService.updateHome({ ...data }).subscribe({
      next: () => this.toast('Videos guardados'),
      error: () => this.toast('Error al guardar videos', 'error')
    });
  }

  saveCelebrations(): void {
    if (!this.celebrationsForm.valid) return this.toast('Complete los campos requeridos', 'error');
    const celebrations = this.celebrationsArray.value.map((c: any) => ({
      ...c,
      videoId: this.extractVideoId(c.videoId || '')
    }));
    this.apiService.updateCelebrations(celebrations).subscribe({
      next: () => this.toast('Celebraciones guardadas'),
      error: () => this.toast('Error al guardar', 'error')
    });
  }

  saveMeetingDays(): void {
    if (!this.meetingDaysForm.valid) return this.toast('Complete los campos requeridos', 'error');
    this.apiService.updateMeetingDaysSummary(this.meetingDaysForm.value).subscribe({
      next: () => this.toast('Dias de Reunion guardados'),
      error: () => this.toast('Error al guardar', 'error')
    });
  }

  saveMinistries(): void {
    if (!this.ministriesForm.valid) return this.toast('Complete los campos requeridos', 'error');
    const val = this.ministriesForm.value;
    const ministriesSummary = {
      sectionTitle: val.sectionTitle,
      sectionSubtitle: val.sectionSubtitle,
      ministryIds: (val.ministryIds || []).slice(0, 4)
    };
    this.apiService.updateMinistriesSummary(ministriesSummary).subscribe({
      next: () => this.toast('Ministerios guardados'),
      error: () => this.toast('Error al guardar', 'error')
    });
  }

  saveAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      let pending = 0;
      let errors = 0;
      const done = () => { pending--; if (pending <= 0) errors > 0 ? reject() : resolve(); };
      const fail = () => { errors++; done(); };

      pending++;
      this.apiService.updateHero(this.heroForm.value).subscribe({ next: done, error: fail });

      pending++;
      this.apiService.updateHome(this.videosForm.value).subscribe({ next: done, error: fail });

      pending++;
      const celebrations = this.celebrationsArray.value.map((c: any) => ({
        ...c, videoId: this.extractVideoId(c.videoId || '')
      }));
      this.apiService.updateCelebrations(celebrations).subscribe({ next: done, error: fail });

      pending++;
      this.apiService.updateMeetingDaysSummary(this.meetingDaysForm.value).subscribe({ next: done, error: fail });

      pending++;
      const mVal = this.ministriesForm.value;
      this.apiService.updateMinistriesSummary({
        sectionTitle: mVal.sectionTitle,
        sectionSubtitle: mVal.sectionSubtitle,
        ministryIds: (mVal.ministryIds || []).slice(0, 4)
      }).subscribe({ next: done, error: fail });
    });
  }

  clearVideoDomLight(): void { this.deleteVideoByKey('domLight'); }
  clearVideoDomDark(): void { this.deleteVideoByKey('domDark'); }
  clearVideoMierLight(): void { this.deleteVideoByKey('mierLight'); }
  clearVideoMierDark(): void { this.deleteVideoByKey('mierDark'); }
  onIconDomLightSelected(event: Event): void { this.uploadIconByKey(event, 'domLight'); }
  onIconDomDarkSelected(event: Event): void { this.uploadIconByKey(event, 'domDark'); }
  onIconMierLightSelected(event: Event): void { this.uploadIconByKey(event, 'mierLight'); }
  onIconMierDarkSelected(event: Event): void { this.uploadIconByKey(event, 'mierDark'); }
  clearIconDomLight(): void { this.deleteIconByKey('domLight'); }
  clearIconDomDark(): void { this.deleteIconByKey('domDark'); }
  clearIconMierLight(): void { this.deleteIconByKey('mierLight'); }
  clearIconMierDark(): void { this.deleteIconByKey('mierDark'); }

  private uploadVideoByKey(event: Event, key: 'domLight' | 'domDark' | 'mierLight' | 'mierDark'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return this.toast('Formato no válido', 'error');
    const uploaders = {
      domLight: () => this.apiService.uploadHeroVideoDomLight(file),
      domDark: () => this.apiService.uploadHeroVideoDomDark(file),
      mierLight: () => this.apiService.uploadHeroVideoMierLight(file),
      mierDark: () => this.apiService.uploadHeroVideoMierDark(file),
    };
    const labels = { domLight: 'Domingo Día', domDark: 'Domingo Noche', mierLight: 'Miércoles Día', mierDark: 'Miércoles Noche' };
    (this as any)[`isUploading${key.charAt(0).toUpperCase()}${key.slice(1)}`] = true;
    uploaders[key]().subscribe({
      next: (res: any) => {
        (this as any)[`hasVideo${key.charAt(0).toUpperCase()}${key.slice(1)}`] = true;
        (this as any)[`video${key.charAt(0).toUpperCase()}${key.slice(1)}Name`] = res.name || res.heroVideoName || '';
        (this as any)[`video${key.charAt(0).toUpperCase()}${key.slice(1)}Preview`] = `${environment.apiBaseUrl}/api/home/video-${key.replace('Light', '-light').replace('Dark', '-dark').replace('dom', 'dom').replace('mier', 'mier')}?t=${Date.now()}`;
        (this as any)[`isUploading${key.charAt(0).toUpperCase()}${key.slice(1)}`] = false;
        this.toast(`Video ${labels[key]} guardado`);
      },
      error: (err: any) => {
        (this as any)[`isUploading${key.charAt(0).toUpperCase()}${key.slice(1)}`] = false;
        this.toast('Error: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  private deleteVideoByKey(key: 'domLight' | 'domDark' | 'mierLight' | 'mierDark'): void {
    const deleters = {
      domLight: () => this.apiService.deleteHeroVideoDomLight(),
      domDark: () => this.apiService.deleteHeroVideoDomDark(),
      mierLight: () => this.apiService.deleteHeroVideoMierLight(),
      mierDark: () => this.apiService.deleteHeroVideoMierDark(),
    };
    deleters[key]().subscribe({
      next: () => {
        (this as any)[`video${key.charAt(0).toUpperCase()}${key.slice(1)}Preview`] = null;
        (this as any)[`hasVideo${key.charAt(0).toUpperCase()}${key.slice(1)}`] = false;
        (this as any)[`video${key.charAt(0).toUpperCase()}${key.slice(1)}Name`] = '';
        this.toast('Video eliminado');
      },
      error: () => this.toast('Error al eliminar', 'error')
    });
  }

  private uploadIconByKey(event: Event, key: 'domLight' | 'domDark' | 'mierLight' | 'mierDark'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return this.toast('Formato no válido', 'error');
    const uploaders = {
      domLight: () => this.apiService.uploadIconDomLight(file),
      domDark: () => this.apiService.uploadIconDomDark(file),
      mierLight: () => this.apiService.uploadIconMierLight(file),
      mierDark: () => this.apiService.uploadIconMierDark(file),
    };
    (this as any)[`isUploadingIcon${key.charAt(0).toUpperCase()}${key.slice(1)}`] = true;
    uploaders[key]().subscribe({
      next: (res: any) => {
        (this as any)[`hasIcon${key.charAt(0).toUpperCase()}${key.slice(1)}`] = true;
        (this as any)[`icon${key.charAt(0).toUpperCase()}${key.slice(1)}Name`] = res.name || res.iconName || '';
        (this as any)[`icon${key.charAt(0).toUpperCase()}${key.slice(1)}Preview`] = `${environment.apiBaseUrl}/api/home/icon-${key.replace('Light', '-light').replace('Dark', '-dark').replace('dom', 'dom').replace('mier', 'mier')}?t=${Date.now()}`;
        (this as any)[`isUploadingIcon${key.charAt(0).toUpperCase()}${key.slice(1)}`] = false;
        this.toast('Ícono guardado');
      },
      error: (err: any) => {
        (this as any)[`isUploadingIcon${key.charAt(0).toUpperCase()}${key.slice(1)}`] = false;
        this.toast('Error: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  private deleteIconByKey(key: 'domLight' | 'domDark' | 'mierLight' | 'mierDark'): void {
    const deleters = {
      domLight: () => this.apiService.deleteIconDomLight(),
      domDark: () => this.apiService.deleteIconDomDark(),
      mierLight: () => this.apiService.deleteIconMierLight(),
      mierDark: () => this.apiService.deleteIconMierDark(),
    };
    deleters[key]().subscribe({
      next: () => {
        (this as any)[`icon${key.charAt(0).toUpperCase()}${key.slice(1)}Preview`] = null;
        (this as any)[`hasIcon${key.charAt(0).toUpperCase()}${key.slice(1)}`] = false;
        (this as any)[`icon${key.charAt(0).toUpperCase()}${key.slice(1)}Name`] = '';
        this.toast('Ícono eliminado');
      },
      error: () => this.toast('Error al eliminar', 'error')
    });
  }

  onCardImageSelected(event: Event, cardIndex: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return this.toast('Formato no válido', 'error');

    this.uploadingCardIndex = cardIndex;
    this.apiService.uploadCardImage(cardIndex, file).subscribe({
      next: (res) => {
        this.cardImages[cardIndex] = { name: res.imageName, url: `${environment.apiBaseUrl}/api/home/card-image/${cardIndex}?t=${Date.now()}` };
        this.uploadingCardIndex = null;
        this.toast('Imagen de card guardada');
      },
      error: (err) => {
        this.uploadingCardIndex = null;
        this.toast('Error: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  clearCardImage(cardIndex: number): void {
    this.apiService.deleteCardImage(cardIndex).subscribe({
      next: () => {
        delete this.cardImages[cardIndex];
        this.toast('Imagen de card eliminada');
      },
      error: () => this.toast('Error al eliminar', 'error')
    });
  }

  private toast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
