import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

// Interfaces para los eventos
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  type: 'reunion' | 'especial' | 'celebración' | 'estudio';
  color: string;
  icon: string;
  location: string;
  speakers?: string[];
  registrationLink?: string;
}

interface MeetingDay {
  day: string;
  title: string;
  time: string;
  note: string;
  colorFrom: string;
  colorTo: string;
}

@Component({
  selector: 'app-admin-dias-reunion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dias-reunion.component.html',
  styleUrls: ['./admin-dias-reunion.component.css']
})
export class AdminDiasReunionComponent implements OnInit {
  // Formularios principales
  heroForm: FormGroup;
  calendarEventsForm: FormGroup;
  upcomingEventsForm: FormGroup;
  eventCtaForm: FormGroup;
  
  // Pestañas
  activeTab: string = 'hero';

  // Hero image
  hasHeroImage = false;
  heroImageName = '';
  heroImagePreview: string | null = null;
  isUploadingImage = false;

  // Event media (icon & background) - index -> preview URL
  eventIconPreviews: { [index: number]: string } = {};
  eventBackgroundPreviews: { [index: number]: string } = {};
  eventIconUploading: { [index: number]: boolean } = {};
  eventBackgroundUploading: { [index: number]: boolean } = {};
  upcomingEventsIconPreview: string | null = null;
  calendarIconPreview: string | null = null;

  // Previews y estados
  showToast: boolean = false;
  toastMessage: string = '';

  // Opciones para selects
  eventTypes = [
    { value: 'reunion', label: 'Reunión', icon: 'fas fa-hands-praying', color: 'from-blue-500 to-cyan-500' },
    { value: 'especial', label: 'Evento Especial', icon: 'fas fa-party-horn', color: 'from-pink-500 to-rose-500' },
    { value: 'celebración', label: 'Celebración', icon: 'fas fa-birthday-cake', color: 'from-yellow-500 to-orange-500' },
    { value: 'estudio', label: 'Estudio Biblico', icon: 'fas fa-book-open', color: 'from-green-500 to-emerald-500' }
  ];

  eventIcons = [
    { value: 'fas fa-hands-praying', label: 'Oración' },
    { value: 'fas fa-book-open', label: 'Biblia' },
    { value: 'fas fa-music', label: 'Música' },
    { value: 'fas fa-wine-glass', label: 'Santa Cena' },
    { value: 'fas fa-fire', label: 'Fuego' },
    { value: 'fas fa-star', label: 'Estrella' },
    { value: 'fas fa-tree', label: 'Navidad' },
    { value: 'fas fa-fireworks', label: 'Fuegos Artificiales' },
    { value: 'fas fa-users', label: 'Grupo' },
    { value: 'fas fa-eye', label: 'Profecia' },
    { value: 'fas fa-star', label: 'Especial' },
    { value: 'fas fa-calendar', label: 'Calendario' }
  ];

  daysOfWeek = [
    { value: 'Lunes', label: 'Lunes' },
    { value: 'Martes', label: 'Martes' },
    { value: 'Miércoles', label: 'Miércoles' },
    { value: 'Jueves', label: 'Jueves' },
    { value: 'Viernes', label: 'Viernes' },
    { value: 'Sábado', label: 'Sábado' },
    { value: 'Domingo', label: 'Domingo' }
  ];

  colorPresets = [
    { from: '#4f46e5', to: '#ec4899', name: 'Índigo a Rosa' },
    { from: '#3b82f6', to: '#06b6d4', name: 'Azul a Cian' },
    { from: '#8b5cf6', to: '#06b6d4', name: 'Violeta a Cian' },
    { from: '#10b981', to: '#3b82f6', name: 'Verde a Azul' },
    { from: '#f59e0b', to: '#ef4444', name: 'Amarillo a Rojo' },
    { from: '#ec4899', to: '#f472b6', name: 'Rosa a Rosa Claro' },
    { from: '#f59e0b', to: '#f97316', name: 'Amarillo a Naranja' },
    { from: '#10b981', to: '#059669', name: 'Verde a Verde Oscuro' }
  ];

  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService, private http: HttpClient) {
    // Formulario para Hero de la página
    this.heroForm = this.fb.group({
      badgeText: ['Calendario en tiempo real', Validators.required],
      title: ['CALENDARIO DE EVENTOS', Validators.required],
      subtitle: ['Planifica tu participación en nuestras reuniones y eventos especiales', Validators.required]
    });

    // Formulario para eventos del calendario
    this.calendarEventsForm = this.fb.group({
      sectionTitle: ['CALENDARIO DE EVENTOS', Validators.required],
      sectionSubtitle: ['Planifica tu participación en nuestras reuniones y eventos especiales', Validators.required],
      events: this.fb.array([])
    });

    // Formulario para sección de próximos eventos
    this.upcomingEventsForm = this.fb.group({
      sectionTitle: ['Próximos Eventos', Validators.required],
      sectionSubtitle: ['No te pierdas los eventos de los próximos días', Validators.required],
      events: this.fb.array([]) // Array de eventos específicos para esta sección
    });

    // Formulario para CTA de eventos
    this.eventCtaForm = this.fb.group({
      badgeText: ['¿Tienes un evento?', Validators.required],
      title: ['¿Quieres programar un evento especial?', Validators.required],
      description: ['Si deseas organizar un evento especial, boda, bautizo o reunión en nuestras instalaciones, contáctanos.', Validators.required],
      buttonText: ['Contactar coordinador', Validators.required],
      buttonLink: ['/contacto', Validators.required]
    });

  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    // Cargar datos desde la API
    this.apiService.getMeetingDays().subscribe({
      next: (meetingDaysData) => {
        // Cargar estado de imagen hero
        this.hasHeroImage = !!meetingDaysData.hasHeroImage;
        this.heroImageName = meetingDaysData.heroImageName || '';
        this.heroImagePreview = this.hasHeroImage ? 'http://127.0.0.1:3000/api/meeting-days/hero-image' : null;
        this.upcomingEventsIconPreview = meetingDaysData.upcomingEventsIconUrl
          ? this.apiService.resolveAssetUrl(meetingDaysData.upcomingEventsIconUrl) + '?t=' + Date.now() : null;
        this.calendarIconPreview = meetingDaysData.calendarIconUrl
          ? this.apiService.resolveAssetUrl(meetingDaysData.calendarIconUrl) + '?t=' + Date.now() : null;

        // Cargar Hero
        if (meetingDaysData.hero) {
          this.heroForm.patchValue(meetingDaysData.hero);
        } else {
          // Si no hay hero, usar los datos del calendario como fallback
          if (meetingDaysData.calendarEvents) {
            this.heroForm.patchValue({
              badgeText: 'Calendario en tiempo real',
              title: meetingDaysData.calendarEvents.sectionTitle || 'CALENDARIO DE EVENTOS',
              subtitle: meetingDaysData.calendarEvents.sectionSubtitle || 'Planifica tu participación en nuestras reuniones y eventos especiales'
            });
          }
        }

        // Cargar eventos del calendario
        if (meetingDaysData.calendarEvents) {
          this.loadCalendarEventsData(meetingDaysData.calendarEvents);
        }

        // Cargar sección de próximos eventos
        if (meetingDaysData.upcomingEvents) {
          this.loadUpcomingEventsData(meetingDaysData.upcomingEvents);
        } else {
          this.upcomingEventsForm.patchValue({
            sectionTitle: 'Próximos Eventos',
            sectionSubtitle: 'No te pierdas los eventos de los próximos días'
          });
          const upcomingEventsArray = this.upcomingEventsForm.get('events') as FormArray;
          upcomingEventsArray.clear();
        }

        // Cargar CTA de eventos
        if (meetingDaysData.eventCta) {
          this.eventCtaForm.patchValue(meetingDaysData.eventCta);
        }

      },
      error: (error) => {
        console.error('Error cargando Meeting Days:', error);
        this.showToastMessage('Error al cargar los datos', 'error');
      }
    });

  }

  loadCalendarEventsData(calendarEvents: any): void {
    this.calendarEventsForm.patchValue({
      sectionTitle: calendarEvents.sectionTitle || 'CALENDARIO DE EVENTOS',
      sectionSubtitle: calendarEvents.sectionSubtitle || 'Planifica tu participación en nuestras reuniones y eventos especiales'
    });

    const eventsArray = this.calendarEventsForm.get('events') as FormArray;
    eventsArray.clear();
    this.eventIconPreviews = {};
    this.eventBackgroundPreviews = {};

    const events = calendarEvents?.events || [];

    events.forEach((event: any, i: number) => {
      eventsArray.push(this.createEventForm(event));
      if (event.iconUrl) {
        this.eventIconPreviews[i] = this.apiService.resolveAssetUrl(event.iconUrl) + '?t=' + Date.now();
      }
      if (event.backgroundUrl) {
        this.eventBackgroundPreviews[i] = this.apiService.resolveAssetUrl(event.backgroundUrl) + '?t=' + Date.now();
      }
    });
  }

  loadUpcomingEventsData(upcomingEvents: any): void {
    this.upcomingEventsForm.patchValue({
      sectionTitle: upcomingEvents.sectionTitle || 'Próximos Eventos',
      sectionSubtitle: upcomingEvents.sectionSubtitle || 'No te pierdas los eventos de los próximos días'
    });

    const upcomingEventsArray = this.upcomingEventsForm.get('events') as FormArray;
    upcomingEventsArray.clear();

    const events = upcomingEvents?.events || [];
    events.forEach((event: any) => {
      upcomingEventsArray.push(this.createEventForm(event));
    });
  }

  saveEventCta(): void {
    if (this.eventCtaForm.valid) {
      const eventCta = this.eventCtaForm.value;
      console.log('Guardando Event CTA:', eventCta);

      this.apiService.updateEventCta(eventCta).subscribe({
        next: (response: any) => {
          console.log('Event CTA guardado exitosamente:', response);
          this.showToastMessage('CTA de eventos guardado exitosamente');
          // Recargar los datos para asegurar que se muestren los valores actualizados
          this.loadAllData();
        },
        error: (error: any) => {
          console.error('Error guardando Event CTA:', error);
          console.error('Detalles del error:', error.error);
          this.showToastMessage('Error al guardar el CTA de eventos: ' + (error.error?.error || error.message), 'error');
        }
      });
    } else {
      console.log('Formulario Event CTA inválido:', this.eventCtaForm.errors);
      this.showToastMessage('Por favor complete los campos requeridos', 'error');
      this.markFormGroupTouched(this.eventCtaForm);
    }
  }

  // CRUD para eventos del calendario
  createEventForm(event?: any): FormGroup {
    const eventDate = event?.date ? new Date(event.date) : new Date();

    return this.fb.group({
      id: [event?.id || this.generateId()],
      title: [event?.title || '', Validators.required],
      description: [event?.description || '', Validators.required],
      date: [eventDate.toISOString().split('T')[0], Validators.required],
      time: [event?.time || '19:00', Validators.required],
      type: [event?.type || 'reunion', Validators.required],
      icon: [event?.icon || 'fas fa-hands-praying', Validators.required],
      location: [event?.location || 'Templo Principal', Validators.required],
      speakers: [event?.speakers?.join(', ') || ''],
      registrationLink: [event?.registrationLink || ''],
      colorFrom: [event?.colorFrom || '#3b82f6'],
      colorTo: [event?.colorTo || '#06b6d4']
    });
  }

  get eventsArray(): FormArray {
    return this.calendarEventsForm.get('events') as FormArray;
  }

  get upcomingEventsArray(): FormArray {
    return this.upcomingEventsForm.get('events') as FormArray;
  }

  addEvent(): void {
    this.eventsArray.push(this.createEventForm());
    this.scrollToBottom('events-section');
  }

  removeEvent(index: number): void {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      this.eventsArray.removeAt(index);
      this.reindexEventPreviews(this.eventIconPreviews, index);
      this.reindexEventPreviews(this.eventBackgroundPreviews, index);
      this.showToastMessage('Evento eliminado');
    }
  }

  private reindexEventPreviews(obj: { [k: number]: string }, removedIndex: number): void {
    const next: { [k: number]: string } = {};
    const arr = this.eventsArray;
    for (let i = 0; i < arr.length; i++) {
      const oldIdx = i < removedIndex ? i : i + 1;
      if (obj[oldIdx]) next[i] = obj[oldIdx];
    }
    Object.keys(obj).forEach(k => delete obj[+k]);
    Object.assign(obj, next);
  }

  duplicateEvent(index: number): void {
    const event = this.eventsArray.at(index).value;
    const newEvent = { ...event, id: this.generateId() };
    this.eventsArray.insert(index + 1, this.createEventForm(newEvent));
    this.shiftEventPreviews(index + 1, 1);
    this.showToastMessage('Evento duplicado');
  }

  private shiftEventPreviews(fromIndex: number, delta: number): void {
    const iconNext: { [k: number]: string } = {};
    const bgNext: { [k: number]: string } = {};
    Object.keys(this.eventIconPreviews).forEach(k => {
      const i = +k;
      if (i >= fromIndex) iconNext[i + delta] = this.eventIconPreviews[i];
      else iconNext[i] = this.eventIconPreviews[i];
    });
    Object.keys(this.eventBackgroundPreviews).forEach(k => {
      const i = +k;
      if (i >= fromIndex) bgNext[i + delta] = this.eventBackgroundPreviews[i];
      else bgNext[i] = this.eventBackgroundPreviews[i];
    });
    this.eventIconPreviews = iconNext;
    this.eventBackgroundPreviews = bgNext;
  }

  // CRUD para reuniones recurrentes

  // Métodos auxiliares
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getDate()} de ${this.months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  getEventTypeLabel(type: string): string {
    return this.eventTypes.find(t => t.value === type)?.label || type;
  }

  getEventTypeIcon(type: string): string {
    return this.eventTypes.find(t => t.value === type)?.icon || 'fas fa-calendar';
  }

  getEventIconLabel(icon: string): string {
    return this.eventIcons.find(i => i.value === icon)?.label || 'Ícono';
  }

  scrollToBottom(sectionId: string): void {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  }

  onEventIconSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const eventId = this.eventsArray.at(index).get('id')?.value;
    if (!eventId) return;
    this.eventIconUploading[index] = true;
    this.apiService.uploadEventIcon(eventId, file).subscribe({
      next: () => {
        this.eventIconPreviews[index] = this.apiService.getEventIconUrl(eventId) + '?t=' + Date.now();
        this.eventIconUploading[index] = false;
        this.showToastMessage('Ícono subido');
        input.value = '';
      },
      error: (err) => {
        this.eventIconUploading[index] = false;
        this.showToastMessage('Error al subir ícono: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  removeEventIcon(index: number): void {
    const eventId = this.eventsArray.at(index).get('id')?.value;
    if (!eventId) return;
    this.apiService.deleteEventIcon(eventId).subscribe({
      next: () => {
        delete this.eventIconPreviews[index];
        this.showToastMessage('Ícono eliminado');
      },
      error: (err) => this.showToastMessage('Error al eliminar ícono', 'error')
    });
  }

  onEventBackgroundSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const eventId = this.eventsArray.at(index).get('id')?.value;
    if (!eventId) return;
    this.eventBackgroundUploading[index] = true;
    this.apiService.uploadEventBackground(eventId, file).subscribe({
      next: () => {
        this.eventBackgroundPreviews[index] = this.apiService.getEventBackgroundUrl(eventId) + '?t=' + Date.now();
        this.eventBackgroundUploading[index] = false;
        this.showToastMessage('Imagen de fondo subida');
        input.value = '';
      },
      error: (err) => {
        this.eventBackgroundUploading[index] = false;
        this.showToastMessage('Error al subir imagen: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  removeEventBackground(index: number): void {
    const eventId = this.eventsArray.at(index).get('id')?.value;
    if (!eventId) return;
    this.apiService.deleteEventBackground(eventId).subscribe({
      next: () => {
        delete this.eventBackgroundPreviews[index];
        this.showToastMessage('Imagen de fondo eliminada');
      },
      error: () => this.showToastMessage('Error al eliminar imagen', 'error')
    });
  }

  onUpcomingEventsIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.apiService.uploadSectionIcon('meeting-days', 'upcoming-events', file).subscribe({
      next: () => {
        this.upcomingEventsIconPreview = this.apiService.getSectionIconUrl('meeting-days', 'upcoming-events') + '?t=' + Date.now();
        this.showToastMessage('Ícono subido');
        input.value = '';
      },
      error: (err) => this.showToastMessage('Error al subir: ' + (err.error?.error || err.message), 'error')
    });
  }

  removeUpcomingEventsIcon(): void {
    this.apiService.deleteSectionIcon('meeting-days', 'upcoming-events').subscribe({
      next: () => {
        this.upcomingEventsIconPreview = null;
        this.showToastMessage('Ícono eliminado');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  onCalendarIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.apiService.uploadSectionIcon('meeting-days', 'calendar', file).subscribe({
      next: () => {
        this.calendarIconPreview = this.apiService.getSectionIconUrl('meeting-days', 'calendar') + '?t=' + Date.now();
        this.showToastMessage('Ícono subido');
        input.value = '';
      },
      error: (err) => this.showToastMessage('Error al subir: ' + (err.error?.error || err.message), 'error')
    });
  }

  removeCalendarIcon(): void {
    this.apiService.deleteSectionIcon('meeting-days', 'calendar').subscribe({
      next: () => {
        this.calendarIconPreview = null;
        this.showToastMessage('Ícono eliminado');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  // Métodos para guardar
  saveCalendarEvents(): void {
    // Validar que al menos los campos básicos estén completos
    if (this.calendarEventsForm.get('sectionTitle')?.valid && this.calendarEventsForm.get('sectionSubtitle')?.valid) {
      // Obtener los valores del formulario
      const formValue = this.calendarEventsForm.value;
      
      // Procesar los eventos del FormArray
      const events = this.eventsArray.value.map((event: any) => {
        // Convertir speakers de string a array si es necesario
        let speakers = event.speakers;
        if (typeof speakers === 'string' && speakers.trim()) {
          speakers = speakers.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        } else if (!speakers || (Array.isArray(speakers) && speakers.length === 0)) {
          speakers = [];
        }
        
        return {
          id: event.id || this.generateId(),
          title: event.title || '',
          description: event.description || '',
          date: event.date || new Date().toISOString().split('T')[0],
          time: event.time || '19:00',
          type: event.type || 'reunion',
          icon: event.icon || 'fas fa-hands-praying',
          location: event.location || 'Templo Principal',
          speakers: speakers,
          registrationLink: event.registrationLink || '',
          colorFrom: event.colorFrom || '#3b82f6',
          colorTo: event.colorTo || '#06b6d4'
        };
      });

      const calendarEvents = {
        sectionTitle: formValue.sectionTitle || 'CALENDARIO DE EVENTOS',
        sectionSubtitle: formValue.sectionSubtitle || 'Planifica tu participación en nuestras reuniones y eventos especiales',
        events: events,
        lastUpdated: new Date().toISOString()
      };

      console.log('Guardando Calendar Events:', calendarEvents);
      console.log('Número de eventos:', events.length);

      this.apiService.updateCalendarEvents(calendarEvents).subscribe({
        next: (response) => {
          console.log('Calendar Events guardados exitosamente:', response);
          this.showToastMessage(`Eventos del calendario guardados exitosamente (${events.length} eventos)`);
          // Recargar los datos para asegurar que se muestren los valores actualizados
          this.loadAllData();
        },
        error: (error) => {
          console.error('Error guardando Calendar Events:', error);
          console.error('Detalles del error:', error.error);
          this.showToastMessage('Error al guardar los eventos del calendario: ' + (error.error?.error || error.message), 'error');
        }
      });
    } else {
      console.log('Formulario Calendar Events inválido:', this.calendarEventsForm.errors);
      this.showToastMessage('Por favor complete los campos requeridos', 'error');
      this.markFormGroupTouched(this.calendarEventsForm);
    }
  }



  saveAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      let pending = 4;
      let errors = 0;
      const done = () => { pending--; if (pending <= 0) errors > 0 ? reject() : resolve(); };
      const fail = () => { errors++; done(); };

      this.apiService.updateMeetingDaysHero(this.heroForm.value).subscribe({ next: done, error: fail });

      const calForm = this.calendarEventsForm.value;
      const calEvents = this.eventsArray.value.map((e: any) => {
        let speakers = e.speakers;
        if (typeof speakers === 'string' && speakers.trim()) speakers = speakers.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        else if (!speakers || (Array.isArray(speakers) && speakers.length === 0)) speakers = [];
        return { ...e, speakers };
      });
      this.apiService.updateCalendarEvents({ sectionTitle: calForm.sectionTitle, sectionSubtitle: calForm.sectionSubtitle, events: calEvents }).subscribe({ next: done, error: fail });

      const upForm = this.upcomingEventsForm.value;
      const upEvents = this.upcomingEventsArray.value.map((e: any) => {
        let speakers = e.speakers;
        if (typeof speakers === 'string' && speakers.trim()) speakers = speakers.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        else if (!speakers || (Array.isArray(speakers) && speakers.length === 0)) speakers = [];
        return { ...e, speakers };
      });
      this.apiService.updateUpcomingEvents({ sectionTitle: upForm.sectionTitle, sectionSubtitle: upForm.sectionSubtitle, events: upEvents }).subscribe({ next: done, error: fail });

      this.apiService.updateEventCta(this.eventCtaForm.value).subscribe({ next: done, error: fail });
    });
  }

  saveHero(): void {
    if (this.heroForm.valid) {
      const heroData = this.heroForm.value;
      console.log('Guardando Hero con datos:', heroData);
      
      this.apiService.updateMeetingDaysHero(heroData).subscribe({
        next: (response) => {
          console.log('Hero guardado exitosamente:', response);
          this.showToastMessage('Hero guardado exitosamente');
          // Recargar los datos para asegurar que se muestren los valores actualizados
          this.loadAllData();
        },
        error: (error) => {
          console.error('Error guardando Hero:', error);
          console.error('Detalles del error:', error.error);
          this.showToastMessage('Error al guardar el Hero: ' + (error.error?.error || error.message), 'error');
        }
      });
    } else {
      console.log('Formulario Hero inválido:', this.heroForm.errors);
      this.showToastMessage('Por favor completa todos los campos requeridos', 'error');
    }
  }

  saveUpcomingEvents(): void {
    // Validar que al menos los campos básicos estén completos
    if (this.upcomingEventsForm.get('sectionTitle')?.valid && this.upcomingEventsForm.get('sectionSubtitle')?.valid) {
      // Obtener los valores del formulario
      const formValue = this.upcomingEventsForm.value;
      
      // Procesar los eventos del FormArray
      const events = this.upcomingEventsArray.value.map((event: any) => {
        // Convertir speakers de string a array si es necesario
        let speakers = event.speakers;
        if (typeof speakers === 'string' && speakers.trim()) {
          speakers = speakers.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        } else if (!speakers || (Array.isArray(speakers) && speakers.length === 0)) {
          speakers = [];
        }
        
        return {
          id: event.id || this.generateId(),
          title: event.title || '',
          description: event.description || '',
          date: event.date || new Date().toISOString().split('T')[0],
          time: event.time || '19:00',
          type: event.type || 'reunion',
          icon: event.icon || 'fas fa-hands-praying',
          location: event.location || 'Templo Principal',
          speakers: speakers,
          registrationLink: event.registrationLink || '',
          colorFrom: event.colorFrom || '#3b82f6',
          colorTo: event.colorTo || '#06b6d4'
        };
      });

      const upcomingEvents = {
        sectionTitle: formValue.sectionTitle || 'Próximos Eventos',
        sectionSubtitle: formValue.sectionSubtitle || 'No te pierdas los eventos de los próximos días',
        events: events
      };

      console.log('Guardando Upcoming Events:', upcomingEvents);
      console.log('Número de eventos:', events.length);

      this.apiService.updateUpcomingEvents(upcomingEvents).subscribe({
        next: (response: any) => {
          console.log('Upcoming Events guardados exitosamente:', response);
          this.showToastMessage(`Sección de próximos eventos guardada exitosamente (${events.length} eventos)`);
          // Recargar los datos para asegurar que se muestren los valores actualizados
          this.loadAllData();
        },
        error: (error: any) => {
          console.error('Error guardando Upcoming Events:', error);
          console.error('Detalles del error:', error.error);
          this.showToastMessage('Error al guardar la sección de próximos eventos: ' + (error.error?.error || error.message), 'error');
        }
      });
    } else {
      console.log('Formulario Upcoming Events inválido:', this.upcomingEventsForm.errors);
      this.showToastMessage('Por favor complete los campos requeridos', 'error');
      this.markFormGroupTouched(this.upcomingEventsForm);
    }
  }

  addUpcomingEvent(): void {
    this.upcomingEventsArray.push(this.createEventForm());
    this.scrollToBottom('upcoming-section');
  }

  removeUpcomingEvent(index: number): void {
    if (confirm('¿Está seguro de que desea eliminar este evento?')) {
      this.upcomingEventsArray.removeAt(index);
      this.showToastMessage('Evento eliminado');
    }
  }

  duplicateUpcomingEvent(index: number): void {
    const event = this.upcomingEventsArray.at(index).value;
    const newEvent = { ...event, id: this.generateId() };
    this.upcomingEventsArray.insert(index + 1, this.createEventForm(newEvent));
    this.showToastMessage('Evento duplicado');
  }

  selectEventFromCalendar(eventIndex?: number): void {
    // Si no se especifica índice, mostrar un selector
    if (eventIndex === undefined) {
      // Agregar el primer evento disponible como ejemplo
      if (this.eventsArray.length > 0) {
        const calendarEvent = this.eventsArray.at(0).value;
        const newEvent = { ...calendarEvent, id: this.generateId() };
        this.upcomingEventsArray.push(this.createEventForm(newEvent));
        this.showToastMessage('Evento agregado desde el calendario. Puedes seleccionar otros eventos manualmente.');
      } else {
        this.showToastMessage('No hay eventos en el calendario para agregar', 'error');
      }
    } else {
      const calendarEvent = this.eventsArray.at(eventIndex).value;
      const newEvent = { ...calendarEvent, id: this.generateId() };
      this.upcomingEventsArray.push(this.createEventForm(newEvent));
      this.showToastMessage('Evento agregado desde el calendario');
    }
  }

  // Métodos para Toast
  showToastMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Método para marcar todos los campos como tocados
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }


  // Método para aplicar un preset de color
  applyColorPreset(eventIndex: number, presetIndex: number): void {
    const preset = this.colorPresets[presetIndex];
    const eventGroup = this.eventsArray.at(eventIndex) as FormGroup;
    eventGroup.patchValue({
      colorFrom: preset.from,
      colorTo: preset.to
    });
  }


  // Método para ordenar eventos por fecha
  sortEventsByDate(): void {
    const events = this.eventsArray.value;
    events.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.eventsArray.clear();
    events.forEach((event: any) => {
      this.eventsArray.push(this.createEventForm(event));
    });

    this.showToastMessage('Eventos ordenados por fecha');
  }

  // Método para exportar eventos
  exportEvents(): void {
    const events = this.eventsArray.value;
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `eventos-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    this.showToastMessage('Eventos exportados exitosamente');
  }

  // Método para importar eventos
  importEvents(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const events = JSON.parse(e.target?.result as string);
          if (Array.isArray(events)) {
            this.eventsArray.clear();
            events.forEach((eventData: any) => {
              this.eventsArray.push(this.createEventForm(eventData));
            });
            this.showToastMessage(`${events.length} eventos importados exitosamente`);
          } else {
            this.showToastMessage('Formato de archivo inválido', 'error');
          }
        } catch (error) {
          this.showToastMessage('Error al leer el archivo', 'error');
        }
      };

      reader.readAsText(file);
    }
  }

  // Método para contar eventos próximos
  getUpcomingEventsCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.eventsArray.value.filter((event: any) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }).length;
  }

  // Método para contar días únicos con eventos
  getUniqueDaysCount(): number {
    const uniqueDays = new Set();

    this.eventsArray.value.forEach((event: any) => {
      if (event.date) {
        const date = new Date(event.date);
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        uniqueDays.add(dayKey);
      }
    });

    return uniqueDays.size;
  }

  // Método para obtener eventos próximos (próximos 30 días)
  getUpcomingEvents(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    return this.eventsArray.value
      .filter((event: any) => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && eventDate <= nextMonth;
      })
      .sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }

  // Método para obtener eventos por tipo
  getEventsByType(type: string): number {
    return this.eventsArray.value.filter((event: any) => event.type === type).length;
  }

  onHeroImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showToastMessage('Formato no válido. Use JPG, PNG, WebP, etc.', 'error');
      return;
    }

    this.isUploadingImage = true;
    this.showToastMessage('Subiendo imagen a la base de datos...');
    this.apiService.uploadMeetingDaysHeroImage(file).subscribe({
      next: (res) => {
        this.hasHeroImage = true;
        this.heroImageName = res.heroImageName;
        this.heroImagePreview = 'http://127.0.0.1:3000/api/meeting-days/hero-image?t=' + Date.now();
        this.isUploadingImage = false;
        this.showToastMessage('Imagen guardada en la base de datos');
      },
      error: (err) => {
        console.error('Error subiendo imagen:', err);
        this.isUploadingImage = false;
        this.showToastMessage('Error al subir imagen: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  clearHeroImage(): void {
    this.apiService.deleteMeetingDaysHeroImage().subscribe({
      next: () => {
        this.heroImagePreview = null;
        this.hasHeroImage = false;
        this.heroImageName = '';
        this.showToastMessage('Imagen eliminada de la base de datos');
      },
      error: () => this.showToastMessage('Error al eliminar imagen', 'error')
    });
  }
}