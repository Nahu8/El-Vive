import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme.service';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  type: 'reunion' | 'especial' | 'celebración' | 'estudio';
  color: string;
  icon: string;
  iconUrl?: string;
  backgroundUrl?: string;
  location: string;
  speakers?: string[];
  registrationLink?: string;
}

@Component({
  selector: 'app-dias-reunion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dias-reunion.component.html',
  styleUrls: ['./dias-reunion.component.css']
})
export class DiasReunionComponent implements OnInit {
  // Hero
  heroBadgeText: string = 'Calendario en tiempo real';
  heroTitle: string = 'CALENDARIO DE EVENTOS';
  heroSubtitle: string = 'Planifica tu participación en nuestras reuniones y eventos especiales';
  heroImageUrl: string | null = null;
  heroImageUrlLight: string | null = null;
  heroImageUrlDark: string | null = null;
  heroBgLightColor = '#ffffff';
  heroBgDarkColor = '#000000';
  heroFadeEnabled = true;
  heroFadeLightColor = '#000000';
  heroFadeDarkColor = '#000000';
  
  // Calendario
  sectionTitle: string = 'CALENDARIO DE EVENTOS';
  sectionSubtitle: string = 'Planifica tu participación en nuestras reuniones y eventos especiales';
  
  // Próximos eventos
  upcomingEventsTitle: string = 'Próximos Eventos';
  upcomingEventsSubtitle: string = 'No te pierdas los eventos de los próximos días';
  upcomingEventsIconUrl: string | null = null;
  calendarIconUrl: string | null = null;
  
  // CTA de eventos
  eventCtaBadge: string = '¿Tienes un evento?';
  eventCtaTitle: string = '¿Quieres programar un evento especial?';
  eventCtaDescription: string = 'Si deseas organizar un evento especial, boda, bautizo o reunión en nuestras instalaciones, contáctanos.';
  eventCtaButtonText: string = 'Contactar coordinador';
  eventCtaButtonLink: string = '/contacto';

  // Calendario
  currentDate: Date = new Date();
  currentMonth: string = '';
  currentYear: number = 2025;
  daysInMonth: Date[] = [];
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Eventos del calendario
  calendarEvents: CalendarEvent[] = [];
  selectedDate: Date | null = null;
  eventsForSelectedDate: CalendarEvent[] = [];
  
  // Eventos de la sección "Próximos Eventos"
  upcomingEventsList: CalendarEvent[] = [];

  // Filtros
  filterType: string = 'todos';
  eventTypes = [
    { id: 'todos', name: 'Todos los eventos', iconUrl: null as string | null, color: 'from-indigo-500 to-purple-500' },
    { id: 'reunion', name: 'Reuniones', iconUrl: null as string | null, color: 'from-blue-500 to-cyan-500' },
    { id: 'especial', name: 'Eventos especiales', iconUrl: null as string | null, color: 'from-pink-500 to-rose-500' },
    { id: 'celebración', name: 'Celebraciones', iconUrl: null as string | null, color: 'from-yellow-500 to-orange-500' },
    { id: 'estudio', name: 'Estudios bíblicos', iconUrl: null as string | null, color: 'from-green-500 to-emerald-500' }
  ];

  constructor(
    private apiService: ApiService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Cargar primero los datos generales, luego los eventos del calendario
    this.loadMeetingDays();
    // loadCalendarEvents se llama después para asegurar que los datos estén disponibles
    setTimeout(() => {
      this.loadCalendarEvents();
    }, 100);
  }

  loadMeetingDays(): void {
    this.apiService.getMeetingDays().subscribe({
      next: (data) => {
        // Cargar Hero
        if (data.hero) {
          this.heroBadgeText = data.hero.badgeText || this.heroBadgeText;
          this.heroTitle = data.hero.title || this.heroTitle;
          this.heroSubtitle = data.hero.subtitle || this.heroSubtitle;
        }
        if (data.hasHeroImage) {
          this.heroImageUrl = `${environment.apiBaseUrl}/api/meeting-days/hero-image`;
        }
        this.heroImageUrlLight = data.hero?.heroImageUrlLight ? this.apiService.resolveAssetUrl(data.hero.heroImageUrlLight) : null;
        this.heroImageUrlDark = data.hero?.heroImageUrlDark ? this.apiService.resolveAssetUrl(data.hero.heroImageUrlDark) : null;
        this.heroBgLightColor = data.hero?.bgColorLight || '#ffffff';
        this.heroBgDarkColor = data.hero?.bgColorDark || '#000000';
        this.heroFadeEnabled = data.hero?.fadeEnabled !== false;
        this.heroFadeLightColor = data.hero?.fadeColorLight || '#000000';
        this.heroFadeDarkColor = data.hero?.fadeColorDark || '#000000';
        
        // Cargar datos del calendario (usar hero como fallback si no hay calendarEvents)
        if (data.calendarEvents) {
          this.sectionTitle = data.calendarEvents.sectionTitle || this.sectionTitle;
          this.sectionSubtitle = data.calendarEvents.sectionSubtitle || this.sectionSubtitle;
        } else if (data.hero) {
          this.sectionTitle = data.hero.title || this.sectionTitle;
          this.sectionSubtitle = data.hero.subtitle || this.sectionSubtitle;
        }
        
        // Cargar sección de próximos eventos
        this.upcomingEventsIconUrl = data.upcomingEventsIconUrl ? this.apiService.resolveAssetUrl(data.upcomingEventsIconUrl) : null;
        this.calendarIconUrl = data.calendarIconUrl ? this.apiService.resolveAssetUrl(data.calendarIconUrl) : null;
        if (data.upcomingEvents) {
          this.upcomingEventsTitle = data.upcomingEvents.sectionTitle || this.upcomingEventsTitle;
          this.upcomingEventsSubtitle = data.upcomingEvents.sectionSubtitle || this.upcomingEventsSubtitle;
          
          // Cargar eventos específicos de la sección
          if (data.upcomingEvents.events && Array.isArray(data.upcomingEvents.events)) {
            this.upcomingEventsList = data.upcomingEvents.events.map((event: any) => ({
              id: event.id || String(Math.random()),
              title: event.title || '',
              description: event.description || '',
              date: event.date ? new Date(event.date) : new Date(),
              time: event.time || '',
              type: event.type || 'reunion',
              color: event.color || 'from-blue-500 to-cyan-500',
              icon: event.icon || 'fas fa-calendar',
              iconUrl: event.iconUrl ? this.apiService.resolveAssetUrl(event.iconUrl) : undefined,
              backgroundUrl: event.backgroundUrl ? this.apiService.resolveAssetUrl(event.backgroundUrl) : undefined,
              location: event.location || '',
              speakers: event.speakers ? (typeof event.speakers === 'string' ? event.speakers.split(',').map((s: string) => s.trim()) : event.speakers) : [],
              registrationLink: event.registrationLink
            }));
          }
        }
        
        // Cargar CTA de eventos
        if (data.eventCta) {
          this.eventCtaBadge = data.eventCta.badgeText || this.eventCtaBadge;
          this.eventCtaTitle = data.eventCta.title || this.eventCtaTitle;
          this.eventCtaDescription = data.eventCta.description || this.eventCtaDescription;
          this.eventCtaButtonText = data.eventCta.buttonText || this.eventCtaButtonText;
          this.eventCtaButtonLink = data.eventCta.buttonLink || this.eventCtaButtonLink;
        }
      },
      error: (error) => {
        console.error('Error cargando Meeting Days:', error);
      }
    });
  }

  loadCalendarEvents(): void {
    this.apiService.getMeetingDays().subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);
        
        // calendarEvents es un objeto con { sectionTitle, sectionSubtitle, events }
        let events: any[] = [];
        
        if (data.calendarEvents) {
          // Si calendarEvents es un objeto con la propiedad events
          if (data.calendarEvents.events && Array.isArray(data.calendarEvents.events)) {
            events = data.calendarEvents.events;
          } 
          // Si calendarEvents es directamente un array (fallback)
          else if (Array.isArray(data.calendarEvents)) {
            events = data.calendarEvents;
          }
        }
        
        console.log('Eventos extraídos:', events);
        
        this.calendarEvents = events.map((event: any) => {
          // Manejar la fecha correctamente
          let eventDate: Date;
          if (event.date) {
            if (typeof event.date === 'string') {
              eventDate = new Date(event.date);
            } else if (event.date instanceof Date) {
              eventDate = event.date;
            } else {
              eventDate = new Date();
            }
          } else {
            eventDate = new Date();
          }
          
          // Manejar speakers
          let speakers: string[] = [];
          if (event.speakers) {
            if (typeof event.speakers === 'string') {
              speakers = event.speakers.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            } else if (Array.isArray(event.speakers)) {
              speakers = event.speakers;
            }
          }
          
          return {
            id: event.id || String(Math.random()),
            title: event.title || '',
            description: event.description || '',
            date: eventDate,
            time: event.time || '',
            type: event.type || 'reunion',
            color: event.color || 'from-blue-500 to-cyan-500',
            icon: event.icon || 'fas fa-calendar',
            iconUrl: event.iconUrl ? this.apiService.resolveAssetUrl(event.iconUrl) : undefined,
            backgroundUrl: event.backgroundUrl ? this.apiService.resolveAssetUrl(event.backgroundUrl) : undefined,
            location: event.location || '',
            speakers: speakers,
            registrationLink: event.registrationLink || '',
            colorFrom: event.colorFrom || '#3b82f6',
            colorTo: event.colorTo || '#06b6d4'
          };
        });
        
        console.log('Calendar Events procesados:', this.calendarEvents);
        console.log('Número de eventos:', this.calendarEvents.length);
        
        // Actualizar el calendario después de cargar los eventos
        this.updateCalendar();
      },
      error: (error) => {
        console.error('Error cargando Calendar Events:', error);
        // Si falla, usar eventos por defecto
        this.generateCalendarEvents();
      }
    });
  }

  // Generar eventos de calendario por defecto (fallback)
  generateCalendarEvents(): void {
    const december2025Events: CalendarEvent[] = [
      {
        id: '1',
        title: 'SLR - Servicio y Estudio',
        description: 'Reunión semanal de estudio bíblico y oración',
        date: new Date(2025, 11, 3), // 3 de Diciembre 2025
        time: '19:00',
        type: 'reunion',
        color: 'from-blue-500 to-cyan-500',
        icon: 'fas fa-hands-praying',
        location: 'Templo Principal',
        speakers: ['Pastor Juan Pérez']
      },
      {
        id: '2',
        title: 'Escuela Bíblica',
        description: 'Clase bíblica para todas las edades',
        date: new Date(2025, 11, 6), // 6 de Diciembre 2025
        time: '09:00',
        type: 'estudio',
        color: 'from-green-500 to-emerald-500',
        icon: 'fas fa-book-open',
        location: 'Salón de Clases',
        speakers: ['Prof. María García', 'Prof. Carlos López']
      },
      {
        id: '3',
        title: 'Santa Cena',
        description: 'Celebración de la Santa Cena dominical',
        date: new Date(2025, 11, 7), // 7 de Diciembre 2025
        time: '10:00',
        type: 'celebración',
        color: 'from-purple-500 to-pink-500',
        icon: 'fas fa-wine-glass',
        location: 'Templo Principal',
        speakers: ['Pastor Juan Pérez']
      },
      {
        id: '4',
        title: 'Culto de Jóvenes',
        description: 'Reunión especial para jóvenes',
        date: new Date(2025, 11, 12), // 12 de Diciembre 2025
        time: '20:00',
        type: 'reunion',
        color: 'from-indigo-500 to-violet-500',
        icon: 'fas fa-fire',
        location: 'Salón de Jóvenes',
        speakers: ['Líder Juvenil Ana Martínez']
      },
      {
        id: '5',
        title: 'Noche de Alabanza',
        description: 'Noche especial de alabanza y adoración',
        date: new Date(2025, 11, 14), // 14 de Diciembre 2025
        time: '19:30',
        type: 'celebración',
        color: 'from-yellow-500 to-orange-500',
        icon: 'fas fa-music',
        location: 'Templo Principal',
        speakers: ['Grupo de Alabanza']
      },
      {
        id: '6',
        title: 'Estudio de Profecía',
        description: 'Estudio profundo sobre las profecías bíblicas',
        date: new Date(2025, 11, 17), // 17 de Diciembre 2025
        time: '19:00',
        type: 'estudio',
        color: 'from-teal-500 to-blue-500',
        icon: 'fas fa-eye',
        location: 'Biblioteca',
        speakers: ['Dr. Roberto Sánchez']
      },
      {
        id: '7',
        title: 'Cena Navideña',
        description: 'Cena de celebración navideña familiar',
        date: new Date(2025, 11, 21), // 21 de Diciembre 2025
        time: '18:00',
        type: 'especial',
        color: 'from-red-500 to-pink-500',
        icon: 'fas fa-tree',
        location: 'Patio de la Iglesia',
        registrationLink: '/registro/cena-navidena'
      },
      {
        id: '8',
        title: 'Culto de Navidad',
        description: 'Celebración especial de Navidad',
        date: new Date(2025, 11, 24), // 24 de Diciembre 2025
        time: '22:00',
        type: 'celebración',
        color: 'from-green-500 to-red-500',
        icon: 'fas fa-star',
        location: 'Templo Principal',
        speakers: ['Pastor Juan Pérez', 'Coro Navideño']
      },
      {
        id: '9',
        title: 'Culto de Fin de Año',
        description: 'Reunión de agradecimiento por el año',
        date: new Date(2025, 11, 31), // 31 de Diciembre 2025
        time: '22:00',
        type: 'especial',
        color: 'from-gold-500 to-yellow-500',
        icon: 'fas fa-sparkles',
        location: 'Templo Principal',
        speakers: ['Pastor Juan Pérez']
      }
    ];

    this.calendarEvents = december2025Events;
  }

    // Método para calcular días restantes
  getDaysUntil(eventDate: Date): number {
    const today = new Date();
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  }

  // Resto del código permanece igual...
  // ... [mantén el resto del código como estaba] ...

  get upcomingEvents(): CalendarEvent[] {
    // Si hay eventos específicos configurados en el backoffice, usarlos
    if (this.upcomingEventsList.length > 0) {
      return this.upcomingEventsList
        .filter(event => {
          const eventDate = new Date(event.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return eventDate >= today;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    
    // Si no hay eventos específicos, calcular desde el calendario (comportamiento anterior)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.calendarEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5); // Solo los próximos 5 eventos
  }

  // Actualizar calendario
  updateCalendar(): void {
    this.currentMonth = this.months[this.currentDate.getMonth()];
    this.currentYear = this.currentDate.getFullYear();

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);

    // Días del mes
    this.daysInMonth = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      this.daysInMonth.push(new Date(year, month, day));
    }

    // Agregar días del mes anterior para completar la primera semana
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      this.daysInMonth.unshift(prevDate);
    }

    // Completar con días del siguiente mes para tener 42 celdas (6 semanas)
    const totalCells = 42; // 6 semanas * 7 días
    const daysToAdd = totalCells - this.daysInMonth.length;
    for (let i = 1; i <= daysToAdd; i++) {
      const nextDate = new Date(year, month + 1, i);
      this.daysInMonth.push(nextDate);
    }
  }

  // Navegación del calendario
  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.updateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.updateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.updateCalendar();
  }

  // Seleccionar fecha
  selectDate(date: Date): void {
    this.selectedDate = date;
    this.eventsForSelectedDate = this.getEventsForDate(date);
  }

  // Obtener eventos para una fecha específica
  getEventsForDate(date: Date): CalendarEvent[] {
    const filteredEvents = this.calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });

    // Aplicar filtro de tipo si no es "todos"
    if (this.filterType !== 'todos') {
      return filteredEvents.filter(event => event.type === this.filterType);
    }

    return filteredEvents;
  }

  // Verificar si un día tiene eventos
  hasEvents(date: Date): boolean {
    return this.getEventsForDate(date).length > 0;
  }

  // Obtener eventos filtrados
  get filteredEvents(): CalendarEvent[] {
    if (this.filterType === 'todos') {
      return this.calendarEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    return this.calendarEvents
      .filter(event => event.type === this.filterType)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Cambiar filtro
  setFilter(type: string): void {
    this.filterType = type;
    if (this.selectedDate) {
      this.eventsForSelectedDate = this.getEventsForDate(this.selectedDate);
    }
  }

  // Verificar si es hoy
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  // Verificar si es el mes actual
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth() &&
      date.getFullYear() === this.currentDate.getFullYear();
  }

  // Formatear fecha
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener color para tipo de evento
  getEventTypeColor(type: string): string {
    const typeMap: { [key: string]: string } = {
      'reunion': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'especial': 'bg-gradient-to-r from-pink-500 to-rose-500',
      'celebración': 'bg-gradient-to-r from-yellow-500 to-orange-500',
      'estudio': 'bg-gradient-to-r from-green-500 to-emerald-500'
    };
    return typeMap[type] || 'bg-gradient-to-r from-gray-500 to-gray-700';
  }

  get currentHeroImageUrl(): string | null {
    const themed = this.themeService.isDarkMode()
      ? (this.heroImageUrlDark || this.heroImageUrlLight)
      : (this.heroImageUrlLight || this.heroImageUrlDark);
    return themed || this.heroImageUrl;
  }

  get heroBgColor(): string {
    return this.themeService.isDarkMode() ? this.heroBgDarkColor : this.heroBgLightColor;
  }

  get heroFadeStyle(): string {
    const fadeColor = this.themeService.isDarkMode() ? this.heroFadeDarkColor : this.heroFadeLightColor;
    return `linear-gradient(to top, ${fadeColor}, transparent)`;
  }

  get pageBgColor(): string {
    return this.themeService.isDarkMode() ? this.heroBgDarkColor : this.heroBgLightColor;
  }

}