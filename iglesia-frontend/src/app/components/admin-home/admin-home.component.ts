import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

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

  // Video Domingos (Thu-Sun)
  hasVideoDomingo = false;
  videoDomingoName = '';
  videoDomingoPreview: string | null = null;
  isUploadingDomingo = false;

  // Video Miercoles (Mon-Wed)
  hasVideoMiercoles = false;
  videoMiercolesName = '';
  videoMiercolesPreview: string | null = null;
  isUploadingMiercoles = false;

  // Icons Domingos / Miercoles
  hasIconDomingo = false;
  iconDomingoName = '';
  iconDomingoPreview: string | null = null;
  isUploadingIconDom = false;

  hasIconMiercoles = false;
  iconMiercolesName = '';
  iconMiercolesPreview: string | null = null;
  isUploadingIconMier = false;

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
          heroVideoUrl: data.heroVideoUrl || ''
        });
        this.hasVideoDomingo = !!data.hasVideoDomingo;
        this.videoDomingoName = data.heroVideoDomingoName || '';
        this.videoDomingoPreview = this.hasVideoDomingo ? 'http://127.0.0.1:3000/api/home/video' : null;

        this.hasVideoMiercoles = !!data.hasVideoMiercoles;
        this.videoMiercolesName = data.heroVideoMiercolesName || '';
        this.videoMiercolesPreview = this.hasVideoMiercoles ? 'http://127.0.0.1:3000/api/home/video2' : null;

        this.hasIconDomingo = !!data.hasIconDomingo;
        this.iconDomingoName = data.heroIconDomingoName || '';
        this.iconDomingoPreview = this.hasIconDomingo ? 'http://127.0.0.1:3000/api/home/icon-dom' : null;

        this.hasIconMiercoles = !!data.hasIconMiercoles;
        this.iconMiercolesName = data.heroIconMiercolesName || '';
        this.iconMiercolesPreview = this.hasIconMiercoles ? 'http://127.0.0.1:3000/api/home/icon-mier' : null;

        if (data.cardImages) {
          this.cardImages = {};
          for (const [idx, img] of Object.entries(data.cardImages as Record<string, any>)) {
            this.cardImages[Number(idx)] = { name: img.imageName, url: `http://127.0.0.1:3000/api/home/card-image/${idx}` };
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
  onVideoDomingoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return this.toast('Formato no válido', 'error');

    this.isUploadingDomingo = true;
    this.toast('Subiendo video Domingos...');
    this.apiService.uploadHeroVideo(file).subscribe({
      next: (res) => {
        this.hasVideoDomingo = true;
        this.videoDomingoName = res.heroVideoName;
        this.videoDomingoPreview = 'http://127.0.0.1:3000/api/home/video?t=' + Date.now();
        this.isUploadingDomingo = false;
        this.toast('Video Domingos guardado');
      },
      error: (err) => {
        this.isUploadingDomingo = false;
        this.toast('Error: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  onVideoMiercolesSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return this.toast('Formato no válido', 'error');

    this.isUploadingMiercoles = true;
    this.toast('Subiendo video Miércoles...');
    this.apiService.uploadHeroVideo2(file).subscribe({
      next: (res) => {
        this.hasVideoMiercoles = true;
        this.videoMiercolesName = res.heroVideoName;
        this.videoMiercolesPreview = 'http://127.0.0.1:3000/api/home/video2?t=' + Date.now();
        this.isUploadingMiercoles = false;
        this.toast('Video Miércoles guardado');
      },
      error: (err) => {
        this.isUploadingMiercoles = false;
        this.toast('Error: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

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

  clearVideoDomingo(): void {
    this.apiService.deleteHeroVideo().subscribe({
      next: () => {
        this.videoDomingoPreview = null;
        this.hasVideoDomingo = false;
        this.videoDomingoName = '';
        this.toast('Video Domingos eliminado');
      },
      error: () => this.toast('Error al eliminar', 'error')
    });
  }

  clearVideoMiercoles(): void {
    this.apiService.deleteHeroVideo2().subscribe({
      next: () => {
        this.videoMiercolesPreview = null;
        this.hasVideoMiercoles = false;
        this.videoMiercolesName = '';
        this.toast('Video Miércoles eliminado');
      },
      error: () => this.toast('Error al eliminar', 'error')
    });
  }

  onIconDomSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return this.toast('Formato no válido', 'error');
    this.isUploadingIconDom = true;
    this.apiService.uploadIconDom(file).subscribe({
      next: (res) => {
        this.hasIconDomingo = true;
        this.iconDomingoName = res.iconName;
        this.iconDomingoPreview = 'http://127.0.0.1:3000/api/home/icon-dom?t=' + Date.now();
        this.isUploadingIconDom = false;
        this.toast('Ícono Domingos guardado');
      },
      error: (err) => { this.isUploadingIconDom = false; this.toast('Error: ' + (err.error?.error || err.message), 'error'); }
    });
  }

  clearIconDom(): void {
    this.apiService.deleteIconDom().subscribe({
      next: () => { this.iconDomingoPreview = null; this.hasIconDomingo = false; this.iconDomingoName = ''; this.toast('Ícono eliminado'); },
      error: () => this.toast('Error al eliminar', 'error')
    });
  }

  onIconMierSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return this.toast('Formato no válido', 'error');
    this.isUploadingIconMier = true;
    this.apiService.uploadIconMier(file).subscribe({
      next: (res) => {
        this.hasIconMiercoles = true;
        this.iconMiercolesName = res.iconName;
        this.iconMiercolesPreview = 'http://127.0.0.1:3000/api/home/icon-mier?t=' + Date.now();
        this.isUploadingIconMier = false;
        this.toast('Ícono Miércoles guardado');
      },
      error: (err) => { this.isUploadingIconMier = false; this.toast('Error: ' + (err.error?.error || err.message), 'error'); }
    });
  }

  clearIconMier(): void {
    this.apiService.deleteIconMier().subscribe({
      next: () => { this.iconMiercolesPreview = null; this.hasIconMiercoles = false; this.iconMiercolesName = ''; this.toast('Ícono eliminado'); },
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
        this.cardImages[cardIndex] = { name: res.imageName, url: `http://127.0.0.1:3000/api/home/card-image/${cardIndex}?t=${Date.now()}` };
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
