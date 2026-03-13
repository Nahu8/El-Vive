import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicApiService } from '../../services/public-api.service';

interface Ministry {
  id: string;
  name: string;
  description: string;
  icon?: string;
  iconUrl?: string;
  image?: string;
  colorFrom?: string;
  colorTo?: string;
  status?: string;
  schedule?: string;
  leader?: string;
}

interface Testimonial {
  name: string;
  role: string;
  ministry: string;
  content: string;
}

interface FAQ {
  icon: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-ministerios',
  templateUrl: './ministerios.component.html',
  styleUrls: ['./ministerios.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MinisteriosComponent implements OnInit {
  // Datos del Hero
  heroBadgeText = 'Tu lugar para servir';
  heroTitle = 'Nuestros Ministerios';
  heroSubtitle = 'Descubre cómo puedes servir y crecer en nuestra comunidad. Cada ministerio es una oportunidad para usar tus dones y hacer una diferencia eterna.';
  heroBackgroundGradient = { from: '#4f46e5', via: '#7c3aed', to: '#000000' };

  // Datos de secciones
  sectionTitle = 'Nuestros Ministerios';
  sectionSubtitle = 'Descubre cómo puedes servir y crecer en nuestra comunidad. Cada ministerio es una oportunidad para usar tus dones y hacer una diferencia eterna.';
  sectionIconUrl: string | null = null;
  processIconUrl: string | null = null;
  testimonialsIconUrl: string | null = null;
  faqIconUrl: string | null = null;

  ministries: Ministry[] = [];
  testimonials: Testimonial[] = [];
  testimonialsTitle: string = 'Testimonios';
  testimonialsSubtitle: string = 'Historias de transformación';
  faqs: FAQ[] = [];
  faqTitle: string = 'Preguntas Frecuentes';
  faqSubtitle: string = 'Respuestas a las dudas más comunes sobre nuestros ministerios';
  
  // Datos del proceso
  processTitle = 'Como Unirte';
  processSubtitle = 'Tres sencillos pasos para comenzar tu jornada de servicio';
  processSteps: any[] = [];
  backgroundColor = '#000000';

  constructor(private publicApi: PublicApiService) {}

  ngOnInit(): void {
    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadMinistriesContent();
  }

  loadMinistriesContent(): void {
    this.publicApi.getMinistriesConfig().subscribe({
      next: (data) => {
        // Cargar datos del Hero
        if (data.hero) {
          this.heroBadgeText = data.hero.badgeText || this.heroBadgeText;
          this.heroTitle = data.hero.title || this.heroTitle;
          this.heroSubtitle = data.hero.subtitle || this.heroSubtitle;
          if (data.hero.backgroundGradient) {
            this.heroBackgroundGradient = {
              from: data.hero.backgroundGradient.from || this.heroBackgroundGradient.from,
              via: data.hero.backgroundGradient.via || this.heroBackgroundGradient.via,
              to: data.hero.backgroundGradient.to || this.heroBackgroundGradient.to
            };
          }
        }

        // Cargar título y subtítulo desde pageContent
        if (data.pageContent) {
          this.sectionTitle = data.pageContent.sectionTitle || data.pageContent.ministriesTitle || this.sectionTitle;
          this.sectionSubtitle = data.pageContent.sectionSubtitle || data.pageContent.ministriesSubtitle || this.sectionSubtitle;
          this.testimonialsTitle = data.pageContent.testimonialsTitle || this.testimonialsTitle;
          this.testimonialsSubtitle = data.pageContent.testimonialsSubtitle || this.testimonialsSubtitle;
          this.faqTitle = data.pageContent.faqTitle || this.faqTitle;
          this.faqSubtitle = data.pageContent.faqSubtitle || this.faqSubtitle;
          this.sectionIconUrl = data.pageContent.sectionIconUrl ? this.publicApi.resolveAssetUrl(data.pageContent.sectionIconUrl) : null;
          this.processIconUrl = data.pageContent.processIconUrl ? this.publicApi.resolveAssetUrl(data.pageContent.processIconUrl) : null;
          this.testimonialsIconUrl = data.pageContent.testimonialsIconUrl ? this.publicApi.resolveAssetUrl(data.pageContent.testimonialsIconUrl) : null;
          this.faqIconUrl = data.pageContent.faqIconUrl ? this.publicApi.resolveAssetUrl(data.pageContent.faqIconUrl) : null;
        }

        // Cargar ministerios
        if (data.pageContent?.backgroundColor) {
          this.backgroundColor = data.pageContent.backgroundColor;
        }

        if (data.ministries && Array.isArray(data.ministries)) {
          this.ministries = data.ministries
            .filter((m: any) => m.status !== 'inactive')
            .map((m: any) => ({
              id: m.id || String(Math.random()),
              name: m.name || '',
              description: m.description || '',
              icon: m.icon || '',
              iconUrl: m.iconUrl ? 'http://127.0.0.1:3000' + m.iconUrl : null,
              image: m.cardImageUrl ? 'http://127.0.0.1:3000' + m.cardImageUrl : (m.image || ''),
              colorFrom: m.colorFrom || '#4f46e5',
              colorTo: m.colorTo || '#ec4899',
              status: m.status || 'active',
              schedule: m.schedule || '',
              leader: m.leader || '',
            }));
        }

        // Cargar testimonios
        if (data.testimonials && Array.isArray(data.testimonials)) {
          this.testimonials = data.testimonials.map((t: any) => ({
            name: t.name || '',
            role: t.role || '',
            ministry: t.ministry || '',
            content: t.content || ''
          }));
        }

        // Cargar FAQs
        if (data.faqs && Array.isArray(data.faqs)) {
          this.faqs = data.faqs.map((f: any) => ({
            question: f.question || '',
            answer: f.answer || ''
          }));
        }

        // Cargar datos del proceso
        if (data.process) {
          this.processTitle = data.process.title || this.processTitle;
          this.processSubtitle = data.process.subtitle || this.processSubtitle;
          if (data.process.steps && Array.isArray(data.process.steps)) {
            this.processSteps = data.process.steps.map((step: any) => ({
              number: step.number || 1,
              icon: step.icon || '🔍',
              title: step.title || '',
              description: step.description || '',
              colorFrom: step.colorFrom || '#3b82f6',
              colorTo: step.colorTo || '#8b5cf6'
            }));
          }
        }
      },
      error: (error) => {
        console.error('Error cargando Ministries Content:', error);
        // Valores por defecto si falla
        this.ministries = [];
        this.testimonials = [];
        this.faqs = [];
      }
    });
  }

  getDefaultMinisterios(): Ministry[] {
    return [
      {
        id: '1',
        name: 'Ministerio Escuela Bíblica',
        description: 'Enseñanza bíblica formativa para todas las edades. Ofrecemos estudios profundos, grupos pequeños y formación espiritual continua.',
        icon: 'book',
        image: 'assets/imagenes/ministerio-1.jpg'
      },
      {
        id: '2',
        name: 'Ministerio Efraín',
        description: 'Acompañamiento pastoral y programas de apoyo comunitario. Ayudamos a familias en situaciones difíciles con consejería y recursos.',
        icon: 'people',
        image: 'assets/imagenes/ministerio-2.jpg'
      },
      {
        id: '3',
        name: 'Ministerio de Jóvenes',
        description: 'Encuentros semanales, retiros espirituales y actividades para jóvenes que buscan crecer en su fe y formar amistades significativas.',
        icon: 'spark',
        image: 'assets/imagenes/ministerio-3.jpg'
      },
      {
        id: '4',
        name: 'Remendando Redes',
        description: 'Iniciativa de apoyo y reinserción social. Trabajamos con personas en situación de vulnerabilidad, ofreciendo esperanza y oportunidades.',
        icon: 'network',
        image: 'assets/imagenes/ministerio-4.jpg'
      },
      {
        id: '5',
        name: 'Ministerio de Oración',
        description: 'Grupo dedicado a la intercesión y acompañamiento espiritual. Organizamos vigilias de oración y grupos de intercesión por necesidades específicas.',
        icon: 'spark',
        image: 'assets/imagenes/ministerio-5.jpg'
      },
      {
        id: '6',
        name: 'Ministerio de Música',
        description: 'Equipo musical y de alabanza que lidera el culto dominical y eventos especiales. Incluye vocalistas, músicos y equipo técnico.',
        icon: 'people',
        image: 'assets/imagenes/ministerio-6.jpg'
      },
      {
        id: '7',
        name: 'Ministerio de Niños',
        description: 'Actividades, enseñanza y cuidado orientado a los niños de la iglesia. Creamos un ambiente seguro y divertido para el aprendizaje bíblico.',
        icon: 'children',
        image: 'assets/imagenes/ministerio-7.jpg'
      },
      {
        id: '8',
        name: 'Servicio Comunitario',
        description: 'Proyectos y acciones sociales para ayudar a la comunidad local. Alimentamos, vestimos y apoyamos a quienes más lo necesitan.',
        icon: 'community',
        image: 'assets/imagenes/ministerio-8.jpg'
      }
    ];
  }


  // Método para manejar errores en la carga de imágenes
  handleImageError(event: any): void {
    event.target.src = 'assets/imagenes/placeholder.jpg';
  }
}