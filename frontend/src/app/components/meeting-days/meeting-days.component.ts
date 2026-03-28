import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ViewChild, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PublicApiService } from '../../services/public-api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-meeting-days',
  imports: [CommonModule],
  templateUrl: './meeting-days.component.html',
  styleUrls: ['./meeting-days.component.css']
})
export class MeetingDaysComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('mdCard', { read: ElementRef }) cards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('mdHeader', { read: ElementRef }) header!: ElementRef<HTMLElement>;

  private _observer: IntersectionObserver | null = null;
  headerAnimated = false;

  sectionTitle: string = 'DÍAS DE REUNIÓN';
  sectionSubtitle: string = 'Próximas reuniones y horarios — mantente al tanto.';
  meetings: Array<{ day: string; title: string; time: string; note: string; colorFrom?: string; colorTo?: string; imageUrl?: string; animated?: boolean }> = [];

  constructor(
    private apiService: ApiService,
    private publicApi: PublicApiService
  ) {}

  ngOnInit() {
    this.loadMeetingDays();
  }

  loadMeetingDays() {
    this.publicApi.getHomeConfig().subscribe({
      next: (data) => {
        console.log('Datos recibidos de Home para Meeting Days:', data);
        const meetingDaysSummary = data.meetingDaysSummary;
        console.log('Meeting Days Summary:', meetingDaysSummary);
        if (meetingDaysSummary) {
          this.sectionTitle = meetingDaysSummary.sectionTitle || this.sectionTitle;
          this.sectionSubtitle = meetingDaysSummary.sectionSubtitle || this.sectionSubtitle;
          const meetings = meetingDaysSummary.meetings || [];
          const cardImgs = data.cardImages || {};
          this.meetings = meetings.map((m: any, idx: number) => ({
            day: m.day || '',
            title: m.title || '',
            time: m.time || '',
            note: m.note || '',
            colorFrom: m.colorFrom || '#4f46e5',
            colorTo: m.colorTo || '#ec4899',
            imageUrl: cardImgs[idx] ? `${environment.apiBaseUrl}/api/home/card-image/${idx}` : undefined,
            animated: false
          }));
          console.log('Meetings procesadas:', this.meetings);
        } else {
          console.warn('No hay meetingDaysSummary en los datos');
        }
      },
      error: (error) => {
        console.error('Error cargando Meeting Days:', error);
        // Valores por defecto si falla
        this.meetings = [
          { day: 'Miércoles', title: 'SLR', time: '19:00', note: 'Servicio y estudio', colorFrom: '#4f46e5', colorTo: '#ec4899', animated: false },
          { day: 'Sábado', title: 'Escuelita Bíblica', time: '10:00', note: 'Ministerio infantil', colorFrom: '#3b82f6', colorTo: '#8b5cf6', animated: false },
          { day: 'Domingo', title: 'Celebración', time: '10:00', note: 'Servicio dominical', colorFrom: '#ec4899', colorTo: '#f59e0b', animated: false }
        ];
      }
    });
  }

  ngAfterViewInit(): void {
    // Esperar a que los datos se carguen antes de inicializar animaciones
    if (this.meetings.length > 0) {
      this.initializeAnimations();
    } else {
      // Si aún no hay datos, esperar un poco y reintentar
      setTimeout(() => {
        if (this.meetings.length > 0) {
          this.initializeAnimations();
        }
      }, 500);
    }
  }

  private initializeAnimations(): void {
    const options = { root: null, rootMargin: '200px 0px 200px 0px', threshold: [0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1] };
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target as HTMLElement;
        const indexAttr = target.getAttribute('data-meet-index');
        const i = indexAttr ? parseInt(indexAttr, 10) : -1;
        const ratio = entry.intersectionRatio;

        if (i >= 0) {
          if (this.meetings[i].animated) {
            target.style.opacity = '1';
            target.style.transform = 'translateX(0px) translateY(0px)';
            if (this._observer) { this._observer.unobserve(target); }
            return;
          }

          const baseDirection = (i % 2 === 1) ? 120 : -120;
          const clamped = Math.min(Math.max(ratio, 0), 1);
          const eased = Math.pow(clamped, 0.5);
          const translateX = (1 - eased) * baseDirection;
          const translateY = (1 - eased) * 12;

          target.style.opacity = String(eased);
          target.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;

          if (ratio >= 0.6) {
            this.meetings[i].animated = true;
            target.style.opacity = '1';
            target.style.transform = 'translateX(0px) translateY(0px)';
            if (this._observer) { this._observer.unobserve(target); }
          }
          return;
        }

        const isHeader = target.getAttribute('data-meet-header') === 'true';
        if (isHeader) {
          if (this.headerAnimated) {
            target.style.opacity = '1';
            target.style.transform = 'translateY(0px)';
            if (this._observer) { this._observer.unobserve(target); }
            return;
          }

          const clamped = Math.min(Math.max(ratio, 0), 1);
          const eased = Math.pow(clamped, 0.5);
          const translateY = (1 - eased) * 30;
          target.style.opacity = String(eased);
          target.style.transform = `translateY(${translateY}px)`;

          if (ratio >= 0.6) {
            this.headerAnimated = true;
            target.style.opacity = '1';
            target.style.transform = 'translateY(0px)';
            if (this._observer) { this._observer.unobserve(target); }
          }
          return;
        }
      });
    }, options);

    // Usar setTimeout para asegurar que las cards estén en el DOM
    setTimeout(() => {
      this.cards.forEach((cardEl, idx) => {
        const el = cardEl.nativeElement as HTMLElement;
        el.setAttribute('data-meet-index', String(idx));
        const dir = (idx % 2 === 1) ? 120 : -120;
        el.style.opacity = '0';
        el.style.transform = `translateX(${dir}px) translateY(12px)`;
        el.style.transition = 'opacity 600ms ease, transform 700ms cubic-bezier(.22,.84,.35,1)';
        this._observer?.observe(el);
      });

      if (this.header && this.header.nativeElement) {
        const h = this.header.nativeElement as HTMLElement;
        h.setAttribute('data-meet-header', 'true');
        h.style.opacity = '0';
        h.style.transform = 'translateY(30px)';
        h.style.transition = 'opacity 600ms ease, transform 700ms cubic-bezier(.22,.84,.35,1)';
        this._observer?.observe(h);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}
