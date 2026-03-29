import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

// Interfaces extendidas
interface ContactInfo {
  id: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  schedules?: Schedules;
  departments?: Departments;
  mapEmbed?: string;
  additionalInfo?: string;
}

interface Schedules {
  sunday: string;
  wednesday: string;
  friday: string;
  officeHours: string;
  emergencyHours: string;
}

interface Departments {
  youth: string;
  kids: string;
  music: string;
  prayer: string;
  volunteer: string;
}

interface ScheduleItem {
  id: keyof Schedules;
  title: string;
  icon: string;
  description: string;
  color: string;
}

interface DepartmentItem {
  id: keyof Departments;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-admin-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-contacto.component.html',
  styleUrls: ['./admin-contacto.component.css']
})
export class AdminContactoComponent implements OnInit {
  // Formularios
  basicInfoForm: FormGroup;
  schedulesForm: FormGroup;
  departmentsForm: FormGroup;

  // Estado
  activeTab: string = 'pageContent';
  isEditing: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'success';

  // Datos
  contactInfo: ContactInfo = this.getDefaultContact();

  pageContent: {
    hero: {
      title: string;
      subtitle: string;
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
    map: { title: string; description: string; imageUrl?: string; googleMapsUrl?: string; mapEmbed?: string };
    sections: Array<{ type: string; title?: string; content?: string; imageUrl?: string; videoUrl?: string; caption?: string; layout?: string }>;
  } = {
    hero: {
      title: 'CONTACTO',
      subtitle: 'Estamos aquí para servirte. No dudes en contactarnos.',
      bgColorLight: '#ffffff',
      bgColorDark: '#000000',
      fadeEnabled: true,
      fadeColorLight: '#000000',
      fadeColorDark: '#000000'
    },
    intro: { title: '', content: '' },
    map: { title: 'Nuestra ubicación', description: '', googleMapsUrl: '', mapEmbed: '' },
    sections: []
  };

  private apiBase = environment.apiBaseUrl;

  // Opciones - usando tipos específicos
  scheduleItems: ScheduleItem[] = [
    { id: 'sunday', title: 'Servicio Dominical', icon: 'fas fa-hands-praying', description: 'Culto principal de adoración', color: 'from-blue-500 to-cyan-500' },
    { id: 'wednesday', title: 'Estudio Bíblico', icon: 'fas fa-book', description: 'Estudio profundo de la Palabra', color: 'from-purple-500 to-pink-500' },
    { id: 'friday', title: 'Jóvenes', icon: 'fas fa-users', description: 'Reunión especial para jóvenes', color: 'from-yellow-500 to-orange-500' },
    { id: 'officeHours', title: 'Horario de Oficina', icon: 'fas fa-building', description: 'Atención administrativa', color: 'from-green-500 to-emerald-500' },
    { id: 'emergencyHours', title: 'Horario de Emergencia', icon: 'fas fa-exclamation-triangle', description: 'Para necesidades urgentes', color: 'from-red-500 to-rose-500' }
  ];

  departmentsList: DepartmentItem[] = [
    { id: 'youth', name: 'Ministerio de Jóvenes', icon: 'fas fa-users', color: 'from-blue-400 to-blue-600' },
    { id: 'kids', name: 'Ministerio de Niños', icon: 'fas fa-child', color: 'from-purple-400 to-pink-600' },
    { id: 'music', name: 'Ministerio de Música', icon: 'fas fa-music', color: 'from-yellow-400 to-orange-600' },
    { id: 'prayer', name: 'Ministerio de Oración', icon: 'fas fa-hands-praying', color: 'from-green-400 to-emerald-600' },
    { id: 'volunteer', name: 'Voluntariado', icon: 'fas fa-hands-helping', color: 'from-indigo-400 to-purple-600' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    // Formulario de Información Básica
    this.basicInfoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      mapEmbed: ['']
    });

    // Formulario de Horarios
    this.schedulesForm = this.fb.group({
      sunday: ['10:00 AM - 12:00 PM', Validators.required],
      wednesday: ['7:00 PM - 9:00 PM', Validators.required],
      friday: ['7:00 PM - 9:00 PM', Validators.required],
      officeHours: ['Lunes a Viernes: 9:00 AM - 5:00 PM', Validators.required],
      emergencyHours: ['24/7 - Línea de emergencia', Validators.required]
    });

    // Formulario de Departamentos
    this.departmentsForm = this.fb.group({
      youth: ['Pastor de Jóvenes: Juan Pérez - jovenes@iglesia.com', Validators.required],
      kids: ['Directora: María González - ninos@iglesia.com', Validators.required],
      music: ['Director: Carlos Rodríguez - musica@iglesia.com', Validators.required],
      prayer: ['Coordinador: Ana Martínez - oracion@iglesia.com', Validators.required],
      volunteer: ['Coordinador: Luis Fernández - voluntarios@iglesia.com', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadContactData();
  }

  loadContactData(): void {
    this.apiService.getContactInfo().subscribe({
      next: (data) => {
        this.contactInfo = data;
        this.loadForms();
      },
      error: (error) => {
        console.error('Error loading contact data:', error);
        this.contactInfo = this.getDefaultContact();
        this.loadForms();
      }
    });
  }

    loadForms(): void {
    // pageContent
    const pc = (this.contactInfo as any).pageContent || {};
    this.pageContent = {
      hero: { ...this.pageContent.hero, ...pc.hero },
      intro: { ...this.pageContent.intro, ...pc.intro },
      map: { ...this.pageContent.map, ...pc.map, mapEmbed: pc.map?.mapEmbed ?? (this.contactInfo as any).mapEmbed ?? '' },
      sections: Array.isArray(pc.sections) ? [...pc.sections] : []
    };

    // Información básica
    this.basicInfoForm.patchValue({
      email: this.contactInfo.email,
      phone: this.contactInfo.phone,
      address: this.contactInfo.address,
      city: this.contactInfo.city,
      mapEmbed: this.contactInfo.mapEmbed || ''
    });

    // Horarios
    if (this.contactInfo.schedules) {
      this.schedulesForm.patchValue(this.contactInfo.schedules);
    }

    // Departamentos
    if (this.contactInfo.departments) {
      this.departmentsForm.patchValue(this.contactInfo.departments);
    }
  }

  getDefaultContact(): ContactInfo {
    return {
      id: '1',
      email: 'contacto@iglesiaadonai.com',
      phone: '+1 (555) 123-4567',
      address: 'Av. Principal 1234',
      city: 'Ciudad, País 12345',
      schedules: {
        sunday: '10:00 AM - 12:00 PM',
        wednesday: '7:00 PM - 9:00 PM',
        friday: '7:00 PM - 9:00 PM',
        officeHours: 'Lunes a Viernes: 9:00 AM - 5:00 PM',
        emergencyHours: '24/7 - Línea de emergencia'
      },
      departments: {
        youth: 'Pastor de Jóvenes: Juan Pérez - jovenes@iglesia.com',
        kids: 'Directora: María González - ninos@iglesia.com',
        music: 'Director: Carlos Rodríguez - musica@iglesia.com',
        prayer: 'Coordinador: Ana Martínez - oracion@iglesia.com',
        volunteer: 'Coordinador: Luis Fernández - voluntarios@iglesia.com'
      },
      mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a21c3ff3b5d%3A0x2f2b5b5b5b5b5b5b!2s123%20Main%20St%2C%20Brooklyn%2C%20NY%2011201!5e0!3m2!1sen!2sus!4v1617225317444!5m2!1sen!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
      additionalInfo: 'Estamos aquí para servirte. No dudes en contactarnos para cualquier necesidad espiritual o administrativa.'
    };
  }

  // Métodos para copiar al portapapeles (actualizados)
  copyScheduleToClipboard(schedule: ScheduleItem): void {
    const value = this.getScheduleValue(schedule.id);
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        this.showToastMessage(`${schedule.title} copiado`, 'success');
      });
    }
  }

  copyDepartmentToClipboard(department: DepartmentItem): void {
    const value = this.getDepartmentValue(department.id);
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        this.showToastMessage(`${department.name} copiado`, 'success');
      });
    }
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.loadForms();
    }
  }

  saveAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      const updatedContact: any = {
        ...this.contactInfo,
        ...this.basicInfoForm.value,
        schedules: this.schedulesForm.value,
        departments: this.departmentsForm.value,
        mapEmbed: this.pageContent.map.mapEmbed ?? this.basicInfoForm.value.mapEmbed,
        pageContent: this.pageContent
      };
      this.apiService.updateContactInfo(updatedContact).subscribe({
        next: (response) => {
          this.contactInfo = response;
          this.isEditing = false;
          resolve();
        },
        error: (error) => {
          console.error('Error saving contact data:', error);
          reject(error);
        }
      });
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadContactData();
    this.showToastMessage('Cambios cancelados', 'info');
  }

  resetToDefaults(): void {
    if (confirm('¿Estás seguro de restablecer todos los datos de contacto a los valores por defecto? Esto no se puede deshacer.')) {
      this.contactInfo = this.getDefaultContact();
      localStorage.removeItem('contactoAdminData');
      this.loadForms();
      this.showToastMessage('Datos restablecidos a valores por defecto', 'info');
    }
  }

  exportData(): void {
    const dataStr = JSON.stringify(this.contactInfo, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = `contacto-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();

    this.showToastMessage('Datos exportados exitosamente', 'success');
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          this.contactInfo = data;
          localStorage.setItem('contactoAdminData', JSON.stringify(data));
          this.loadForms();
          this.showToastMessage('Datos importados exitosamente', 'success');
        } catch (error) {
          this.showToastMessage('Error al importar el archivo', 'error');
          console.error('Import error:', error);
        }
      };

      reader.readAsText(file);
    }
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Métodos auxiliares

  getScheduleValue(scheduleId: keyof Schedules): string {
    if (!this.contactInfo.schedules) return '';
    return this.contactInfo.schedules[scheduleId] || '';
  }

  getDepartmentValue(departmentId: keyof Departments): string {
    if (!this.contactInfo.departments) return '';
    return this.contactInfo.departments[departmentId] || '';
  }
  getScheduleIcon(scheduleId: string): string {
    const schedule = this.scheduleItems.find(s => s.id === scheduleId);
    return schedule ? schedule.icon : 'fas fa-clock';
  }

  getScheduleColor(scheduleId: string): string {
    const schedule = this.scheduleItems.find(s => s.id === scheduleId);
    return schedule ? schedule.color : 'from-gray-600 to-gray-800';
  }

  getScheduleTitle(scheduleId: string): string {
    const schedule = this.scheduleItems.find(s => s.id === scheduleId);
    return schedule ? schedule.title : scheduleId;
  }

  getDepartmentIcon(departmentId: string): string {
    const department = this.departmentsList.find(d => d.id === departmentId);
    return department ? department.icon : 'fas fa-building';
  }

  getDepartmentColor(departmentId: string): string {
    const department = this.departmentsList.find(d => d.id === departmentId);
    return department ? department.color : 'from-gray-600 to-gray-800';
  }

  // Método para generar vista previa del mapa
  getMapPreview(): string {
    const mapEmbed = this.basicInfoForm.get('mapEmbed')?.value || this.contactInfo.mapEmbed;
    return mapEmbed || '';
  }

  // Método para validar URL
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  onPageContentChange(): void {}

  resolvePageContentUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let p = path.startsWith('/') ? path : '/' + path;
    if (p.startsWith('/images/') || p.startsWith('/videos/') || p.startsWith('/icons/')) {
      p = '/uploads' + p;
    }
    return this.apiBase + p;
  }

  onHeroImageSelected(event: Event, mode: 'light' | 'dark'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        const imagePath = res.path || res.url || '';
        if (mode === 'light') this.pageContent.hero.backgroundImageUrlLight = imagePath;
        else this.pageContent.hero.backgroundImageUrlDark = imagePath;
        this.showToastMessage('Imagen subida');
      },
      error: () => this.showToastMessage('Error al subir', 'error')
    });
  }

  onMapImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        this.pageContent.map.imageUrl = res.path || res.url || '';
        this.showToastMessage('Imagen subida');
      },
      error: () => this.showToastMessage('Error al subir', 'error')
    });
  }

  onSectionImageSelected(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<any>(`${this.apiBase}/api/media/upload`, fd).subscribe({
      next: (res) => {
        if (this.pageContent.sections[index]) {
          this.pageContent.sections[index].imageUrl = res.path || res.url || '';
        }
        this.showToastMessage('Imagen subida');
      },
      error: () => this.showToastMessage('Error al subir', 'error')
    });
  }

  addSection(): void {
    this.pageContent.sections.push({ type: 'text', title: '', content: '' });
  }

  removeSection(i: number): void {
    this.pageContent.sections.splice(i, 1);
  }

  getSafeMapEmbed(html?: string): SafeHtml {
    const raw = html ?? this.contactInfo.mapEmbed ?? this.basicInfoForm?.get('mapEmbed')?.value ?? '';
    return raw ? this.sanitizer.bypassSecurityTrustHtml(raw) : '';
  }

  // Método para copiar al portapapeles
  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showToastMessage(`${label} copiado`, 'success');
    }).catch(() => {
      this.showToastMessage('Error al copiar', 'error');
    });
  }

}