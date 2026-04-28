import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Ministerio {
  id: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface Evento {
  id: string;
  day: string;
  title: string;
  time: string;
  note: string;
}

export interface ContactInfo {
  id: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface HomePageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroVideoUrl: string;
  celebrationTitle: string;
  celebrationSubtitle: string;
}

export interface MeetingDaysPageContent {
  pageTitle: string;
  pageSubtitle: string;
}

export interface ContactPageContent {
  pageTitle: string;
  pageSubtitle: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface Celebration {
  title: string;
  subtitle: string;
  description: string;
  videoId: string;
  startTime?: number;
}

export interface MeetingDaySummary {
  day: string;
  title: string;
  time: string;
  note: string;
  colorFrom?: string;
  colorTo?: string;
}

export interface MinistrySummary {
  name: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface HomePageData {
  heroTitle: string;
  heroButton1Text: string;
  heroButton1Link: string;
  heroButton2Text: string;
  heroButton2Link: string;
  heroVideoUrl: string;

  celebrations?: Celebration[];
  meetingDaysSummary?: {
    sectionTitle: string;
    sectionSubtitle: string;
    meetings: MeetingDaySummary[];
  };
  ministriesSummary?: {
    sectionTitle: string;
    sectionSubtitle: string;
    ministries: MinistrySummary[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private ministeriosSubject = new BehaviorSubject<Ministerio[]>([]);
  public ministerios$ = this.ministeriosSubject.asObservable();

  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  public eventos$ = this.eventosSubject.asObservable();

  private contactSubject = new BehaviorSubject<ContactInfo | null>(null);
  public contact$ = this.contactSubject.asObservable();

  private homeContentSubject = new BehaviorSubject<HomePageContent | null>(null);
  public homeContent$ = this.homeContentSubject.asObservable();

  private meetingDaysContentSubject = new BehaviorSubject<MeetingDaysPageContent | null>(null);
  public meetingDaysContent$ = this.meetingDaysContentSubject.asObservable();

  private contactPageContentSubject = new BehaviorSubject<ContactPageContent | null>(null);
  public contactPageContent$ = this.contactPageContentSubject.asObservable();

  private changesSubject = new BehaviorSubject<boolean>(false);
  public hasChanges$ = this.changesSubject.asObservable();

  private homeData = new BehaviorSubject<any>({
    heroTitle: 'ÉL VIVE IGLESIA',
    heroSubtitle: 'Una comunidad de fe, esperanza y amor. Únete a nosotros en nuestro viaje espiritual',
    heroButtonText: 'VER EVENTOS',
    heroVideoUrl: 'assets/videos/MinisteriosServicios Pantalla.mp4',

    celebrations: [
      {
        title: 'CELEBRACIÓN',
        subtitle: 'Título de Celebración',
        description: 'Bajada o descripción de la celebración. Aquí puedes agregar información sobre este evento especial.',
        videoId: '3wuQUvXiLv8'
      },
      {
        title: 'SOBRE LA ROCA',
        subtitle: 'Título de Sobre la Roca',
        description: 'Bajada o descripción sobre este ministerio. Comparte información relevante sobre este programa.',
        videoId: '2O1cS9zjM90'
      },
      {
        title: 'SANTA CENA',
        subtitle: 'Título de Santa Cena',
        description: 'Bajada o descripción sobre la Santa Cena. Información sobre este momento especial de comunión.',
        videoId: '94Dje21syOA',
        startTime: 57
      }
    ]
  });

  constructor() {
    this.loadData();
  }

  markChangesPending(section: string): void {
    this.changesSubject.next(true);
  }

  getHomeData(): HomePageData {
    return this.homeData.value;
  }

  saveHomeData(data: any): void {
    this.homeData.next(data);
    this.changesSubject.next(true);
  }

  updateHomeData(data: any): void {
    this.homeData.next(data);
    this.changesSubject.next(true);
  }

  homeData$ = this.homeData.asObservable();

  private loadData(): void {
    const storedMinisterios = localStorage.getItem('ministerios');
    const storedEventos = localStorage.getItem('eventos');
    const storedContact = localStorage.getItem('contact');
    const storedHomeContent = localStorage.getItem('homeContent');
    const storedMeetingDaysContent = localStorage.getItem('meetingDaysContent');
    const storedContactPageContent = localStorage.getItem('contactPageContent');
    const storedHomeData = localStorage.getItem('iglesia_home_data');

    if (storedHomeData) {
      this.homeData.next(JSON.parse(storedHomeData));
    }

    if (storedMinisterios) {
      this.ministeriosSubject.next(JSON.parse(storedMinisterios));
    } else {
      this.ministeriosSubject.next(this.getDefaultMinisterios());
    }

    if (storedEventos) {
      this.eventosSubject.next(JSON.parse(storedEventos));
    } else {
      this.eventosSubject.next(this.getDefaultEventos());
    }

    if (storedContact) {
      this.contactSubject.next(JSON.parse(storedContact));
    } else {
      this.contactSubject.next(this.getDefaultContact());
    }

    if (storedHomeContent) {
      this.homeContentSubject.next(JSON.parse(storedHomeContent));
    } else {
      this.homeContentSubject.next(this.getDefaultHomeContent());
    }

    if (storedMeetingDaysContent) {
      this.meetingDaysContentSubject.next(JSON.parse(storedMeetingDaysContent));
    } else {
      this.meetingDaysContentSubject.next(this.getDefaultMeetingDaysContent());
    }

    if (storedContactPageContent) {
      this.contactPageContentSubject.next(JSON.parse(storedContactPageContent));
    } else {
      this.contactPageContentSubject.next(this.getDefaultContactPageContent());
    }
  }

  private getDefaultMinisterios(): Ministerio[] {
    return [
      {
        id: '1',
        name: 'Ministerio Escuela Bíblica',
        description: 'Enseñanza bíblica formativa para todas las edades; estudios y formación espiritual.',
        icon: 'book',
        image: 'assets/imagenes/ministerio-1.jpg'
      },
      {
        id: '2',
        name: 'Ministerio Efraín',
        description: 'Acompañamiento pastoral y programas de apoyo comunitario bajo el nombre Efraín.',
        icon: 'people',
        image: 'assets/imagenes/ministerio-2.jpg'
      },
      {
        id: '3',
        name: 'Ministerio de Jóvenes',
        description: 'Encuentros, estudios y actividades para jóvenes que buscan crecer en su fe.',
        icon: 'spark',
        image: 'assets/imagenes/ministerio-3.jpg'
      },
      {
        id: '4',
        name: 'Remendando Redes',
        description: 'Iniciativa de apoyo y reinserción social, trabajo comunitario y redes de ayuda.',
        icon: 'network',
        image: 'assets/imagenes/ministerio-4.jpg'
      },
      {
        id: '5',
        name: 'Ministerio de Oración',
        description: 'Grupo dedicado a la intercesión y acompañamiento espiritual en oración.',
        icon: 'spark',
        image: 'assets/imagenes/ministerio-5.jpg'
      },
      {
        id: '6',
        name: 'Ministerio de Música',
        description: 'Equipo musical y de alabanza que lidera el culto y los eventos musicales.',
        icon: 'people',
        image: 'assets/imagenes/ministerio-6.jpg'
      },
      {
        id: '7',
        name: 'Ministerio de Niños',
        description: 'Actividades, enseñanza y cuidado orientado a los niños de la iglesia.',
        icon: 'book',
        image: 'assets/imagenes/ministerio-7.jpg'
      },
      {
        id: '8',
        name: 'Servicio Comunitario',
        description: 'Proyectos y acciones sociales para ayudar a la comunidad local.',
        icon: 'network',
        image: 'assets/imagenes/ministerio-8.jpg'
      }
    ];
  }

  private getDefaultEventos(): Evento[] {
    return [
      {
        id: '1',
        day: 'Miércoles',
        title: 'SLR',
        time: '19:00',
        note: 'Servicio y estudio'
      },
      {
        id: '2',
        day: 'Sábado',
        title: 'Escuelita Bíblica',
        time: '10:00',
        note: 'Ministerio infantil'
      },
      {
        id: '3',
        day: 'Domingo',
        title: 'Celebración',
        time: '10:00',
        note: 'Servicio dominical'
      }
    ];
  }

  private getDefaultContact(): ContactInfo {
    return {
      id: '1',
      email: 'contacto@iglesia.com',
      phone: '+1 (234) 567-890',
      address: 'Calle Principal 123',
      city: 'Ciudad, País'
    };
  }

  private getDefaultHomeContent(): HomePageContent {
    return {
      heroTitle: 'ÉL VIVE IGLESIA',
      heroSubtitle: 'Una comunidad de fe, esperanza y amor. Únete a nosotros en nuestro viaje espiritual',
      heroButtonText: 'Conoce Más',
      heroVideoUrl: 'assets/videos/MinisteriosServicios Pantalla.mp4',
      celebrationTitle: 'NUESTRAS CELEBRACIONES',
      celebrationSubtitle: 'Vive experiencias transformadoras en nuestras reuniones semanales'
    };
  }

  private getDefaultMeetingDaysContent(): MeetingDaysPageContent {
    return {
      pageTitle: 'DÍAS DE REUNIÓN',
      pageSubtitle: 'Únete a nosotros en nuestros próximos encuentros'
    };
  }

  private getDefaultContactPageContent(): ContactPageContent {
    return {
      pageTitle: 'CONTACTO',
      pageSubtitle: 'Ponte en contacto con nosotros',
      email: 'contacto@iglesia.com',
      phone: '+1 (234) 567-890',
      address: 'Calle Principal 123',
      city: 'Ciudad, País'
    };
  }

  getHomeContent(): HomePageContent | null {
    return this.homeContentSubject.value;
  }

  updateHomeContent(content: HomePageContent): void {
    this.homeContentSubject.next(content);
    this.changesSubject.next(true);
  }

  getMeetingDaysContent(): MeetingDaysPageContent | null {
    return this.meetingDaysContentSubject.value;
  }

  updateMeetingDaysContent(content: MeetingDaysPageContent): void {
    this.meetingDaysContentSubject.next(content);
    this.changesSubject.next(true);
  }

  getContactPageContent(): ContactPageContent | null {
    return this.contactPageContentSubject.value;
  }

  updateContactPageContent(content: ContactPageContent): void {
    this.contactPageContentSubject.next(content);
    this.changesSubject.next(true);
  }

  getMinisterios(): Ministerio[] {
    return this.ministeriosSubject.value;
  }

  addMinisterio(ministerio: Ministerio): void {
    const current = this.ministeriosSubject.value;
    ministerio.id = Date.now().toString();
    this.ministeriosSubject.next([...current, ministerio]);
    this.changesSubject.next(true);
  }

  updateMinisterio(id: string, ministerio: Ministerio): void {
    const current = this.ministeriosSubject.value;
    const index = current.findIndex(m => m.id === id);
    if (index >= 0) {
      const updated = [...current];
      updated[index] = { ...ministerio, id };
      this.ministeriosSubject.next(updated);
      this.changesSubject.next(true);
    }
  }

  deleteMinisterio(id: string): void {
    const current = this.ministeriosSubject.value;
    this.ministeriosSubject.next(current.filter(m => m.id !== id));
    this.changesSubject.next(true);
  }

  getEventos(): Evento[] {
    return this.eventosSubject.value;
  }

  addEvento(evento: Evento): void {
    const current = this.eventosSubject.value;
    evento.id = Date.now().toString();
    this.eventosSubject.next([...current, evento]);
    this.changesSubject.next(true);
  }

  updateEvento(id: string, evento: Evento): void {
    const current = this.eventosSubject.value;
    const index = current.findIndex(e => e.id === id);
    if (index >= 0) {
      const updated = [...current];
      updated[index] = { ...evento, id };
      this.eventosSubject.next(updated);
      this.changesSubject.next(true);
    }
  }

  deleteEvento(id: string): void {
    const current = this.eventosSubject.value;
    this.eventosSubject.next(current.filter(e => e.id !== id));
    this.changesSubject.next(true);
  }

  getContact(): ContactInfo | null {
    return this.contactSubject.value;
  }

  updateContact(contact: ContactInfo): void {
    this.contactSubject.next(contact);
    this.changesSubject.next(true);
  }

  publishChanges(): void {
    const homeData = this.homeData.value;
    const ministerios = this.ministeriosSubject.value;
    const eventos = this.eventosSubject.value;
    const contact = this.contactSubject.value;
    const homeContent = this.homeContentSubject.value;
    const meetingDaysContent = this.meetingDaysContentSubject.value;
    const contactPageContent = this.contactPageContentSubject.value;

    localStorage.setItem('iglesia_home_data', JSON.stringify(homeData));
    localStorage.setItem('ministerios', JSON.stringify(ministerios));
    localStorage.setItem('eventos', JSON.stringify(eventos));
    if (contact) localStorage.setItem('contact', JSON.stringify(contact));
    if (homeContent) localStorage.setItem('homeContent', JSON.stringify(homeContent));
    if (meetingDaysContent) localStorage.setItem('meetingDaysContent', JSON.stringify(meetingDaysContent));
    if (contactPageContent) localStorage.setItem('contactPageContent', JSON.stringify(contactPageContent));

    this.changesSubject.next(false);
  }

  hasChanges(): boolean {
    return this.changesSubject.value;
  }

  getCalendarData(): any {
    const data = localStorage.getItem('calendarData');
    return data ? JSON.parse(data) : { events: [] };
  }

  saveCalendarData(data: any): void {
    localStorage.setItem('calendarData', JSON.stringify(data));
    this.markChangesPending('calendar');
  }

  getEventSettings(): any {
    const settings = localStorage.getItem('eventSettings');
    return settings ? JSON.parse(settings) : {
      showPastEvents: true,
      showEventCountdown: true,
      defaultEventColor: '#3b82f6',
      defaultEventDuration: '120',
      enableEventRegistration: true,
      emailNotifications: true,
      reminderDaysBefore: '1'
    };
  }

  saveEventSettings(settings: any): void {
    localStorage.setItem('eventSettings', JSON.stringify(settings));
    this.markChangesPending('calendar');
  }

  updateAllMinisterios(ministerios: Ministerio[]): void {
    this.ministeriosSubject.next(ministerios);
    this.changesSubject.next(true);
  }

  getMinisteriosSubject(): BehaviorSubject<Ministerio[]> {
    return this.ministeriosSubject;
  }
}