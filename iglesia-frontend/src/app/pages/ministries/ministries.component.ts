import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ViewChild, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  // Renamed selector to avoid collision with moved component; this file is kept as backup
  selector: 'app-ministries-old',
  imports: [CommonModule],
  templateUrl: './ministries.component.html',
  styleUrls: ['./ministries.component.css']
})
export class MinistriesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('minCard', { read: ElementRef }) cards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('minHeader', { read: ElementRef }) header!: ElementRef<HTMLElement>;

  // Observer for scroll-synced animations
  private _observer: IntersectionObserver | null = null;
  headerAnimated = false;

  ministries: Array<{ name: string; description: string; contact?: string; icon?: string; animated?: boolean }> = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadMinistries();
  }

  loadMinistries() {
    // Lista solicitada por el usuario (datos estáticos)
    this.ministries = [
      {
        name: 'Ministerio Escuela Bíblica',
        description: 'Enseñanza bíblica formativa para todas las edades; estudios y formación espiritual.',
        icon: 'book'
      },
      {
        name: 'Ministerio Efraín',
        description: 'Acompañamiento pastoral y programas de apoyo comunitario bajo el nombre Efraín.',
        icon: 'people'
      },
      {
        name: 'Ministerio de Jóvenes',
        description: 'Encuentros, estudios y actividades para jóvenes que buscan crecer en su fe.',
        icon: 'spark'
      },
      {
        name: 'Remendando Redes',
        description: 'Iniciativa de apoyo y reinserción social, trabajo comunitario y redes de ayuda.',
        icon: 'network',
        animated: false
      }
    ];
  }

  ngAfterViewInit(): void {
    // Set up IntersectionObserver to sync animations with scroll
    const options = { root: null, rootMargin: '200px 0px 200px 0px', threshold: [0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1] };
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target as HTMLElement;
        const indexAttr = target.getAttribute('data-min-index');
        const i = indexAttr ? parseInt(indexAttr, 10) : -1;
        const ratio = entry.intersectionRatio;
        // If this is a card (has index) handle card animation
        if (i >= 0) {
          // If already animated, ensure final state and skip
          if (this.ministries[i].animated) {
            target.style.opacity = '1';
            target.style.transform = 'translateX(0px) translateY(0px)';
            if (this._observer) { this._observer.unobserve(target); }
            return;
          }

          const baseDirection = (i % 2 === 1) ? 120 : -120;
          const clamped = Math.min(Math.max(ratio, 0), 1);
          const eased = Math.pow(clamped, 0.5);
          const translateX = (1 - eased) * baseDirection;
          // small vertical lift for more dynamism
          const translateY = (1 - eased) * 12; // px

          target.style.opacity = String(eased);
          target.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;

          // When sufficiently visible mark as animated and unobserve
          if (ratio >= 0.6) {
            this.ministries[i].animated = true;
            target.style.opacity = '1';
            target.style.transform = 'translateX(0px) translateY(0px)';
            if (this._observer) { this._observer.unobserve(target); }
          }
          return;
        }

        // If not a card, check if this is the header element
        const isHeader = target.getAttribute('data-min-header') === 'true';
        if (isHeader) {
          // If already animated, ensure final state and unobserve
          if (this.headerAnimated) {
            target.style.opacity = '1';
            target.style.transform = 'translateY(0px)';
            if (this._observer) { this._observer.unobserve(target); }
            return;
          }

          const clamped = Math.min(Math.max(ratio, 0), 1);
          const eased = Math.pow(clamped, 0.5);
          const translateY = (1 - eased) * 30; // make header movement more noticeable
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

    // Observe each card and initialize style/transition
    this.cards.forEach((cardEl, idx) => {
      const el = cardEl.nativeElement as HTMLElement;
      el.setAttribute('data-min-index', String(idx));
      // initial hidden state
      const dir = (idx % 2 === 1) ? 120 : -120;
      el.style.opacity = '0';
      el.style.transform = `translateX(${dir}px) translateY(12px)`;
      el.style.transition = 'opacity 600ms ease, transform 700ms cubic-bezier(.22,.84,.35,1)';
      this._observer?.observe(el);
    });

    // Initialize header initial state and observe it
    if (this.header && this.header.nativeElement) {
      const h = this.header.nativeElement as HTMLElement;
      h.setAttribute('data-min-header', 'true');
      h.style.opacity = '0';
      h.style.transform = 'translateY(30px)';
      h.style.transition = 'opacity 600ms ease, transform 700ms cubic-bezier(.22,.84,.35,1)';
      this._observer?.observe(h);
    }
  }

  ngOnDestroy(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}
