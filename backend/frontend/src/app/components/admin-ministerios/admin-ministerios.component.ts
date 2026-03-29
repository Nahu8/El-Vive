import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

// Interfaces para datos de ministerios
interface Ministry {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  videoUrl?: string;
  colorFrom: string;
  colorTo: string;
  features: string[];
  schedule: string;
  location: string;
  leader: string;
  contactEmail: string;
  requirements: string[];
  status: 'active' | 'inactive' | 'full';
  volunteerCount: number;
  impactStats: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  ministry: string;
  content: string;
  rating: number;
  image?: string;
  date: string;
}

interface ProcessStep {
  id: string;
  number: number;
  icon: string;
  title: string;
  description: string;
  colorFrom: string;
  colorTo: string;
}

interface FAQ {
  id: string;
  icon: string;
  question: string;
  answer: string;
  category: string;
}

interface HeroContent {
  badgeText: string;
  title: string;
  subtitle: string;
  ctaButton1: { text: string; link: string; icon: string };
  ctaButton2: { text: string; link: string; icon: string };
  backgroundGradient: { from: string; via: string; to: string };
}

interface PageContent {
  ministriesTitle: string;
  ministriesSubtitle: string;
  processTitle: string;
  processSubtitle: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  faqTitle: string;
  faqSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBadgeText: string;
}

@Component({
  selector: 'app-admin-ministerios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-ministerios.component.html',
  styleUrls: ['./admin-ministerios.component.css']
})
export class AdminMinisteriosComponent implements OnInit {
  // Formularios principales
  heroForm: FormGroup;
  ministriesForm: FormGroup;
  processForm: FormGroup;
  testimonialsForm: FormGroup;
  faqForm: FormGroup;
  pageContentForm: FormGroup;

  // Estado y configuraciones
  activeTab: string = 'hero';
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  sectionIconPreviews: { [key: string]: string } = {};
  heroIconLightPreview: string | null = null;
  heroIconDarkPreview: string | null = null;
  showMinistryModal: boolean = false;
  showTestimonialModal: boolean = false;
  showFAQModal: boolean = false;

  // Datos temporales para modales
  currentMinistry: any = null;
  currentTestimonial: any = null;
  currentFAQ: any = null;
  ministryModalForm!: FormGroup;

  // Opciones para selects
  ministryStatuses = [
    { value: 'active', label: 'Activo', color: 'from-green-500 to-emerald-500' },
    { value: 'inactive', label: 'Inactivo', color: 'from-gray-500 to-gray-600' },
    { value: 'full', label: 'Cupo Lleno', color: 'from-yellow-500 to-orange-500' }
  ];

  ministryIcons = [
    { value: 'fas fa-book', label: 'Libro', category: 'Educación' },
    { value: 'fas fa-users', label: 'Grupo', category: 'Comunidad' },
    { value: 'fas fa-music', label: 'Música', category: 'Alabanza' },
    { value: 'fas fa-hands-praying', label: 'Oración', category: 'Espiritual' },
    { value: 'fas fa-child', label: 'Niños', category: 'Niños' },
    { value: 'fas fa-palette', label: 'Arte', category: 'Creatividad' },
    { value: 'fas fa-seedling', label: 'Crecimiento', category: 'Desarrollo' },
    { value: 'fas fa-hands-helping', label: 'Servicio', category: 'Voluntariado' },
    { value: 'fas fa-comments', label: 'Conversación', category: 'Comunicación' },
    { value: 'fas fa-heart', label: 'Amor', category: 'Cuidado' },
    { value: 'fas fa-star', label: 'Estrella', category: 'Destacado' },
    { value: 'fas fa-fire', label: 'Fuego', category: 'Pasión' }
  ];

  featureOptions = [
    'Reuniones semanales',
    'Capacitaciones',
    'Material incluido',
    'Certificación',
    'Transporte',
    'Refrigerio',
    'Grupo de WhatsApp',
    'Retiros anuales',
    'Mentoría personal',
    'Eventos especiales',
    'Servicio comunitario',
    'Red de contactos'
  ];

  requirementOptions = [
    'Mayor de 18 años',
    'Disponibilidad semanal',
    'Entrevista personal',
    'Capacitación inicial',
    'Compromiso de 6 meses',
    'Carta de recomendación',
    'Antecedentes penales',
    'Examen médico',
    'Uniforme específico',
    'Herramientas propias',
    'Conocimiento bíblico',
    'Experiencia previa'
  ];

  faqCategories = [
    'General',
    'Inscripción',
    'Requisitos',
    'Horarios',
    'Liderazgo',
    'Voluntariado',
    'Eventos',
    'Recursos'
  ];

  colorPresets = [
    { from: '#4f46e5', to: '#ec4899', name: 'Índigo a Rosa' },
    { from: '#3b82f6', to: '#06b6d4', name: 'Azul a Cian' },
    { from: '#8b5cf6', to: '#e11d48', name: 'Violeta a Rojo' },
    { from: '#10b981', to: '#3b82f6', name: 'Verde a Azul' },
    { from: '#f59e0b', to: '#ef4444', name: 'Amarillo a Rojo' },
    { from: '#ec4899', to: '#f472b6', name: 'Rosa a Rosa Claro' },
    { from: '#6366f1', to: '#8b5cf6', name: 'Índigo a Violeta' },
    { from: '#059669', to: '#10b981', name: 'Verde Oscuro a Verde' }
  ];

  ratingOptions = [1, 2, 3, 4, 5];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    // Formulario para Hero Section
    this.heroForm = this.fb.group({
      badgeText: ['Tu lugar para servir', Validators.required],
      title: ['Nuestros Ministerios', Validators.required],
      subtitle: ['Descubre cómo puedes servir y crecer en nuestra comunidad. Cada ministerio es una oportunidad para usar tus dones y hacer una diferencia eterna.', Validators.required],
      bgColorLight: ['#ffffff'],
      bgColorDark: ['#000000'],
      fadeEnabled: [true],
      fadeColorLight: ['#000000'],
      fadeColorDark: ['#000000'],
      backgroundGradient: this.fb.group({
        from: ['#4f46e5'],
        via: ['#7c3aed'],
        to: ['#000000']
      })
    });

    // Formulario para Ministerios
    this.ministriesForm = this.fb.group({
      ministries: this.fb.array([])
    });

    // Formulario para Proceso
    this.processForm = this.fb.group({
      title: ['Cómo Unirte', Validators.required],
      subtitle: ['Tres sencillos pasos para comenzar tu jornada de servicio', Validators.required],
      steps: this.fb.array([])
    });

    // Formulario para Testimonios
    this.testimonialsForm = this.fb.group({
      testimonials: this.fb.array([])
    });

    // Formulario para FAQ
    this.faqForm = this.fb.group({
      faqs: this.fb.array([])
    });

    // Formulario para Contenido de Página
    this.pageContentForm = this.fb.group({
      ministriesTitle: ['Nuestros Ministerios', Validators.required],
      ministriesSubtitle: ['Cada ministerio es una oportunidad para servir, crecer y ser parte de algo más grande.', Validators.required],
      processTitle: ['Cómo Unirte', Validators.required],
      processSubtitle: ['Tres sencillos pasos para comenzar tu jornada de servicio', Validators.required],
      testimonialsTitle: ['Historias de Transformación', Validators.required],
      testimonialsSubtitle: ['Lo que dicen quienes han encontrado propósito sirviendo en nuestros ministerios', Validators.required],
      faqTitle: ['Preguntas Frecuentes', Validators.required],
      faqSubtitle: ['Respuestas a las dudas más comunes sobre nuestros ministerios', Validators.required],
      ctaTitle: ['¿Listo para hacer la diferencia?', Validators.required],
      ctaSubtitle: ['Cada ministerio es una pieza vital en el cuerpo de Cristo. Tu servicio puede transformar vidas, empezando por la tuya.', Validators.required],
      ctaBadgeText: ['Tu momento es ahora', Validators.required],
      backgroundColor: ['#000000']
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }
  onHeroColorChange(which: 'from' | 'via' | 'to', event: Event): void {
    const input = event.target as HTMLInputElement;
    this.heroForm.get(`backgroundGradient.${which}`)?.setValue(input.value);
  }
  // ==================== MÉTODOS PARA CARGAR DATOS ====================
  loadAllData(): void {
    // Cargar datos desde la API
    this.apiService.getMinistriesContent().subscribe({
      next: (data) => {
        if (data.hero) this.loadHeroData(data.hero);
        if (data.ministries) {
          this.loadMinistriesData(data.ministries);
          setTimeout(() => this.loadMinistryMediaState(), 100);
        }
        if (data.process) this.loadProcessData(data.process);
        if (data.testimonials) this.loadTestimonialsData(data.testimonials);
        if (data.faqs) this.loadFAQData(data.faqs);
        if (data.pageContent) this.loadPageContentData(data.pageContent);
      },
      error: (error) => {
        console.error('Error cargando Ministries:', error);
        this.showToastMessage('Error al cargar los datos', 'error');
      }
    });
  }


  loadHeroData(data: any): void {
    this.heroForm.patchValue(data);
    this.heroIconLightPreview = data?.heroImageUrlLight ? environment.apiBaseUrl + data.heroImageUrlLight + '?t=' + Date.now() : null;
    this.heroIconDarkPreview = data?.heroImageUrlDark ? environment.apiBaseUrl + data.heroImageUrlDark + '?t=' + Date.now() : null;
  }

  loadMinistriesData(ministries: any[]): void {
    const ministriesArray = this.ministriesForm.get('ministries') as FormArray;
    ministriesArray.clear();

    ministries.forEach(ministry => {
      ministriesArray.push(this.createMinistryForm(ministry));
    });
  }

  loadProcessData(process: any): void {
    if (!process) {
      // Si no hay proceso, inicializar con valores por defecto
      this.processForm.patchValue({
        title: 'Cómo Unirte',
        subtitle: 'Tres sencillos pasos para comenzar tu jornada de servicio'
      });
      const stepsArray = this.processForm.get('steps') as FormArray;
      stepsArray.clear();
      return;
    }
    
    this.processForm.patchValue({
      title: process.title || 'Cómo Unirte',
      subtitle: process.subtitle || 'Tres sencillos pasos para comenzar tu jornada de servicio'
    });

    const stepsArray = this.processForm.get('steps') as FormArray;
    stepsArray.clear();

    if (process.steps && Array.isArray(process.steps) && process.steps.length > 0) {
      process.steps.forEach((step: any) => {
        // Asegurar que el paso tenga todos los campos necesarios
        const completeStep = {
          id: step.id || this.generateId(),
          number: step.number || (stepsArray.length + 1),
          icon: step.icon || '🔍',
          title: step.title || '',
          description: step.description || '',
          colorFrom: step.colorFrom || '#3b82f6',
          colorTo: step.colorTo || '#8b5cf6'
        };
        stepsArray.push(this.createProcessStepForm(completeStep));
      });
      // Actualizar números después de cargar
      this.updateStepNumbers();
    }
  }

  loadTestimonialsData(testimonials: any[]): void {
    const testimonialsArray = this.testimonialsForm.get('testimonials') as FormArray;
    testimonialsArray.clear();

    testimonials.forEach(testimonial => {
      testimonialsArray.push(this.createTestimonialForm(testimonial));
    });
  }

  loadFAQData(faqs: any[]): void {
    const faqArray = this.faqForm.get('faqs') as FormArray;
    faqArray.clear();

    faqs.forEach(faq => {
      faqArray.push(this.createFAQForm(faq));
    });
  }

  loadPageContentData(content: any): void {
    if (content) {
      const pageContentData = {
        ministriesTitle: content.ministriesTitle || 'Nuestros Ministerios',
        ministriesSubtitle: content.ministriesSubtitle || '',
        processTitle: content.processTitle || 'Cómo Unirte',
        processSubtitle: content.processSubtitle || '',
        testimonialsTitle: content.testimonialsTitle || 'Historias de Transformación',
        testimonialsSubtitle: content.testimonialsSubtitle || '',
        faqTitle: content.faqTitle || 'Preguntas Frecuentes',
        faqSubtitle: content.faqSubtitle || '',
        ctaTitle: content.ctaTitle || '¿Listo para hacer la diferencia?',
        ctaSubtitle: content.ctaSubtitle || '',
        ctaBadgeText: content.ctaBadgeText || 'Tu momento es ahora',
        backgroundColor: content.backgroundColor || '#000000'
      };
      this.pageContentForm.patchValue(pageContentData);
      this.sectionIconPreviews = {};
      const base = environment.apiBaseUrl;
      if (content.sectionIconUrl) this.sectionIconPreviews['section'] = base + content.sectionIconUrl + '?t=' + Date.now();
      if (content.processIconUrl) this.sectionIconPreviews['process'] = base + content.processIconUrl + '?t=' + Date.now();
      if (content.testimonialsIconUrl) this.sectionIconPreviews['testimonials'] = base + content.testimonialsIconUrl + '?t=' + Date.now();
      if (content.faqIconUrl) this.sectionIconPreviews['faq'] = base + content.faqIconUrl + '?t=' + Date.now();
    }
  }

  onSectionIconSelected(event: Event, sectionKey: string): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.apiService.uploadSectionIcon('ministries', sectionKey, file).subscribe({
      next: () => {
        this.sectionIconPreviews[sectionKey] = this.apiService.getSectionIconUrl('ministries', sectionKey) + '?t=' + Date.now();
        this.showToastMessage('Ícono subido');
        input.value = '';
      },
      error: (err) => this.showToastMessage('Error al subir: ' + (err.error?.error || err.message), 'error')
    });
  }

  onHeroThemeImageSelected(event: Event, mode: 'light' | 'dark'): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const sectionKey = mode === 'light' ? 'hero-light' : 'hero-dark';
    this.apiService.uploadSectionIcon('ministries', sectionKey, file).subscribe({
      next: () => {
        const url = this.apiService.getSectionIconUrl('ministries', sectionKey) + '?t=' + Date.now();
        if (mode === 'light') this.heroIconLightPreview = url;
        else this.heroIconDarkPreview = url;
        this.showToastMessage('Imagen de header subida');
        input.value = '';
      },
      error: () => this.showToastMessage('Error al subir imagen', 'error')
    });
  }

  removeHeroThemeImage(mode: 'light' | 'dark'): void {
    const sectionKey = mode === 'light' ? 'hero-light' : 'hero-dark';
    this.apiService.deleteSectionIcon('ministries', sectionKey).subscribe({
      next: () => {
        if (mode === 'light') this.heroIconLightPreview = null;
        else this.heroIconDarkPreview = null;
        this.showToastMessage('Imagen de header eliminada');
      },
      error: () => this.showToastMessage('Error al eliminar imagen', 'error')
    });
  }

  removeSectionIcon(sectionKey: string): void {
    this.apiService.deleteSectionIcon('ministries', sectionKey).subscribe({
      next: () => {
        delete this.sectionIconPreviews[sectionKey];
        this.showToastMessage('Ícono eliminado');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  loadMinistryMediaState(): void {
    this.ministriesArray.controls.forEach((ctrl) => {
      const mid = (ctrl as FormGroup).get('id')?.value;
      if (mid) {
        this.apiService.getMinistryMedia(mid).subscribe({
          next: (data) => {
            this.ministryMediaState[mid] = {
              ...data,
              iconUrl: data.iconUrl ? `${environment.apiBaseUrl}${data.iconUrl}` : null,
              cardImageUrl: data.cardImageUrl ? `${environment.apiBaseUrl}${data.cardImageUrl}` : null,
              photos: (data.photos || []).map((p: any) => ({ ...p, url: `${environment.apiBaseUrl}${p.url}` })),
              videos: (data.videos || []).map((v: any) => ({ ...v, url: `${environment.apiBaseUrl}${v.url}` })),
              hasPdf: !!data.pdfUrl
            };
          },
          error: () => {}
        });
      }
    });
  }

  // ==================== MÉTODOS PARA CREAR FORMULARIOS ====================
  createMinistryForm(ministry?: any): FormGroup {
    return this.fb.group({
      id: [ministry?.id || this.generateId()],
      name: [ministry?.name || '', Validators.required],
      description: [ministry?.description || '', Validators.required],
      longDescription: [ministry?.longDescription || ''],
      icon: [ministry?.icon || ''],
      image: [ministry?.image || ''],
      videoUrl: [ministry?.videoUrl || ''],
      videos: [ministry?.videos || []],
      colorFrom: [ministry?.colorFrom || '#3b82f6'],
      colorTo: [ministry?.colorTo || '#8b5cf6'],
      features: [ministry?.features || []],
      schedule: [ministry?.schedule || ''],
      location: [ministry?.location || ''],
      leader: [ministry?.leader || ''],
      contactEmail: [ministry?.contactEmail || ''],
      showContactSection: [ministry?.showContactSection !== false],
      requirements: [ministry?.requirements || []],
      status: [ministry?.status || 'active', Validators.required],
      volunteerCount: [ministry?.volunteerCount || 0],
      impactStats: [ministry?.impactStats || '']
    });
  }

  createProcessStepForm(step?: any): FormGroup {
    return this.fb.group({
      id: [step?.id || this.generateId()],
      number: [step?.number || 1, Validators.required],
      icon: [step?.icon || '🔍', Validators.required],
      title: [step?.title || '', Validators.required],
      description: [step?.description || '', Validators.required],
      colorFrom: [step?.colorFrom || '#3b82f6'],
      colorTo: [step?.colorTo || '#8b5cf6']
    });
  }

  createTestimonialForm(testimonial?: any): FormGroup {
    return this.fb.group({
      id: [testimonial?.id || this.generateId()],
      name: [testimonial?.name || '', Validators.required],
      role: [testimonial?.role || '', Validators.required],
      ministry: [testimonial?.ministry || '', Validators.required],
      content: [testimonial?.content || '', Validators.required],
      rating: [testimonial?.rating || 5, Validators.required],
      image: [testimonial?.image || ''],
      date: [testimonial?.date || new Date().toISOString().split('T')[0]]
    });
  }

  createFAQForm(faq?: any): FormGroup {
    return this.fb.group({
      id: [faq?.id || this.generateId()],
      icon: [faq?.icon || '❓', Validators.required],
      question: [faq?.question || '', Validators.required],
      answer: [faq?.answer || '', Validators.required],
      category: [faq?.category || 'General', Validators.required]
    });
  }

  // ==================== GETTERS PARA FORM ARRAYS ====================
  get ministriesArray(): FormArray {
    return this.ministriesForm.get('ministries') as FormArray;
  }

  get processStepsArray(): FormArray {
    return this.processForm.get('steps') as FormArray;
  }

  get testimonialsArray(): FormArray {
    return this.testimonialsForm.get('testimonials') as FormArray;
  }

  get faqsArray(): FormArray {
    return this.faqForm.get('faqs') as FormArray;
  }

  // Helper para obtener controles como FormGroup
  getMinistryControls(): FormGroup[] {
    return this.ministriesArray.controls as FormGroup[];
  }

  getProcessStepControls(): FormGroup[] {
    return this.processStepsArray.controls as FormGroup[];
  }

  getTestimonialControls(): FormGroup[] {
    return this.testimonialsArray.controls as FormGroup[];
  }

  getFAQControls(): FormGroup[] {
    return this.faqsArray.controls as FormGroup[];
  }

  // ==================== MÉTODOS CRUD PARA MINISTERIOS ====================
/*   openMinistryModal(ministry?: any): void {
    this.currentMinistry = ministry ? { ...ministry } : this.getEmptyMinistry();
    this.showMinistryModal = true;
  } */

  // Media state per ministry { [ministryId]: { hasIcon, iconUrl, iconName, photos: [] } }
  ministryMediaState: Record<string, any> = {};
  uploadingMediaFor: string | null = null;

  getEmptyMinistry(): any {
    return {
      id: '',
      name: '',
      description: '',
      longDescription: '',
      icon: '',
      image: '',
      videoUrl: '',
      videos: [],
      colorFrom: '#3b82f6',
      colorTo: '#8b5cf6',
      features: [],
      schedule: '',
      location: '',
      leader: '',
      contactEmail: '',
      showContactSection: true,
      requirements: [],
      status: 'active',
      volunteerCount: 0,
      impactStats: ''
    };
  }

  closeMinistryModal(): void {
    this.showMinistryModal = false;
    this.currentMinistry = null;
  }

  saveMinistry(): void {
    if (this.currentMinistry) {
      const formVals = this.ministryModalForm?.value || {};
      const merged = { ...formVals, ...this.currentMinistry, videos: this.currentMinistry.videos || [] };

      if (!merged.id) merged.id = this.generateId();

      const index = this.ministriesArray.controls.findIndex(
        (c: AbstractControl) => (c as FormGroup).get('id')?.value === merged.id
      );
      if (index >= 0) {
        this.ministriesArray.setControl(index, this.createMinistryForm(merged));
        this.showToastMessage('Ministerio actualizado correctamente');
      } else {
        this.ministriesArray.push(this.createMinistryForm(merged));
        this.showToastMessage('Ministerio agregado correctamente');
      }
      this.closeMinistryModal();
    }
  }

  deleteMinistry(index: number): void {
    if (confirm('¿Estás seguro de eliminar este ministerio?')) {
      this.ministriesArray.removeAt(index);
      this.showToastMessage('Ministerio eliminado correctamente');
    }
  }

  duplicateMinistry(index: number): void {
    const ministry = this.ministriesArray.at(index).value;
    const newMinistry = { ...ministry, id: this.generateId(), name: `${ministry.name} (Copia)` };
    this.ministriesArray.insert(index + 1, this.createMinistryForm(newMinistry));
    this.showToastMessage('Ministerio duplicado correctamente');
  }

  // ==================== MÉTODOS CRUD PARA TESTIMONIOS ====================
  openTestimonialModal(testimonial?: any): void {
    this.currentTestimonial = testimonial ? { ...testimonial } : {
      id: '',
      name: '',
      role: '',
      ministry: '',
      content: '',
      rating: 5,
      image: '',
      date: new Date().toISOString().split('T')[0]
    };
    this.showTestimonialModal = true;
  }

  closeTestimonialModal(): void {
    this.showTestimonialModal = false;
    this.currentTestimonial = null;
  }

  saveTestimonial(): void {
    if (this.currentTestimonial) {
      if (this.currentTestimonial.id) {
        const index = this.testimonialsArray.controls.findIndex(
          (c: AbstractControl) => (c as FormGroup).get('id')?.value === this.currentTestimonial.id
        );

        if (index >= 0) {
          // Reemplazar el FormGroup completo para asegurar que todos los campos se actualicen
          const updatedForm = this.createTestimonialForm(this.currentTestimonial);
          this.testimonialsArray.setControl(index, updatedForm);
          this.showToastMessage('Testimonio actualizado correctamente');
        }
      } else {
        this.currentTestimonial.id = this.generateId();
        const testimonialForm = this.createTestimonialForm(this.currentTestimonial);
        this.testimonialsArray.push(testimonialForm);
        this.showToastMessage('Testimonio agregado correctamente');
      }

      this.closeTestimonialModal();
    }
  }

  // ==================== MÉTODOS CRUD PARA FAQs ====================
  openFAQModal(faq?: any): void {
    this.currentFAQ = faq ? { ...faq } : {
      id: '',
      icon: '❓',
      question: '',
      answer: '',
      category: 'General'
    };
    this.showFAQModal = true;
  }

  closeFAQModal(): void {
    this.showFAQModal = false;
    this.currentFAQ = null;
  }

  saveFAQ(): void {
    if (this.currentFAQ) {
      if (this.currentFAQ.id) {
        const index = this.faqsArray.controls.findIndex(
          (c: AbstractControl) => (c as FormGroup).get('id')?.value === this.currentFAQ.id
        );

        if (index >= 0) {
          // Reemplazar el FormGroup completo para asegurar que todos los campos se actualicen
          const updatedForm = this.createFAQForm(this.currentFAQ);
          this.faqsArray.setControl(index, updatedForm);
          this.showToastMessage('Pregunta frecuente actualizada correctamente');
        }
      } else {
        this.currentFAQ.id = this.generateId();
        const faqForm = this.createFAQForm(this.currentFAQ);
        this.faqsArray.push(faqForm);
        this.showToastMessage('Pregunta frecuente agregada correctamente');
      }

      this.closeFAQModal();
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    window.scrollTo(0, 0);
  }


  applyColorPreset(target: string, presetIndex: number): void {
    const preset = this.colorPresets[presetIndex];

    switch (target) {
      case 'ministry':
        if (this.currentMinistry) {
          this.currentMinistry.colorFrom = preset.from;
          this.currentMinistry.colorTo = preset.to;
        }
        break;
      case 'hero':
        this.heroForm.patchValue({
          backgroundGradient: {
            from: preset.from,
            via: this.mixColors(preset.from, preset.to),
            to: '#000000'
          }
        });
        break;
    }
  }

  mixColors(color1: string, color2: string): string {
    return color2;
  }

  toggleFeature(feature: string, isChecked: boolean): void {
    if (!this.currentMinistry.features) {
      this.currentMinistry.features = [];
    }

    if (isChecked && !this.currentMinistry.features.includes(feature)) {
      this.currentMinistry.features.push(feature);
    } else if (!isChecked) {
      this.currentMinistry.features = this.currentMinistry.features.filter((f: string) => f !== feature);
    }
  }

  toggleRequirement(requirement: string, isChecked: boolean): void {
    if (!this.currentMinistry.requirements) {
      this.currentMinistry.requirements = [];
    }

    if (isChecked && !this.currentMinistry.requirements.includes(requirement)) {
      this.currentMinistry.requirements.push(requirement);
    } else if (!isChecked) {
      this.currentMinistry.requirements = this.currentMinistry.requirements.filter((r: string) => r !== requirement);
    }
  }


  // ==================== MÉTODOS PARA GUARDAR ====================
  savePageContent(): void {
    if (this.pageContentForm.valid) {
      const pageContent = this.pageContentForm.value;
      this.apiService.updatePageContent(pageContent).subscribe({
        next: () => {
          this.showToastMessage('Títulos de sección actualizados correctamente');
        },
        error: (error) => {
          console.error('Error actualizando page content:', error);
          this.showToastMessage('Error al actualizar los títulos', 'error');
        }
      });
    } else {
      this.showToastMessage('Por favor completa todos los campos requeridos', 'error');
    }
  }

  saveAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      const allData = {
        hero: this.heroForm.value,
        ministries: this.ministriesArray.value,
        process: this.processForm.value,
        testimonials: this.testimonialsArray.value,
        faqs: this.faqsArray.value,
        pageContent: this.pageContentForm.value
      };
      this.apiService.updateMinistriesContent(allData).subscribe({
        next: () => resolve(),
        error: (error) => { console.error('Error guardando Ministries:', error); reject(error); }
      });
    });
  }

  resetToDefaults(): void {
    if (confirm('¿Estás seguro de restablecer todos los datos a los valores por defecto? Esto no se puede deshacer.')) {
      this.loadAllData();
      this.showToastMessage('Datos restablecidos a valores por defecto', 'info');
    }
  }


  // ==================== MÉTODOS PARA CONTADORES ====================
  getActiveMinistriesCount(): number {
    return this.ministriesArray.value.filter((m: any) => m.status === 'active').length;
  }

  getTotalVolunteers(): number {
    return this.ministriesArray.value.reduce((total: number, m: any) => total + (m.volunteerCount || 0), 0);
  }

  getFeaturedMinistriesCount(): number {
    return this.ministriesArray.value.filter((m: any) =>
      m.features && m.features.includes('Eventos especiales')
    ).length;
  }

  getAverageRating(): number {
    if (this.testimonialsArray.length === 0) return 0;

    const total = this.testimonialsArray.value.reduce((sum: number, t: any) => sum + (t.rating || 0), 0);
    return Math.round((total / this.testimonialsArray.length) * 10) / 10;
  }

  // ==================== MÉTODOS PARA PASOS DEL PROCESO ====================
  addProcessStep(): void {
    const newStep: any = {
      id: this.generateId(),
      number: this.processStepsArray.length + 1,
      icon: '🔍',
      title: 'Nuevo Paso',
      description: 'Descripción del nuevo paso',
      colorFrom: '#3b82f6',
      colorTo: '#8b5cf6'
    };
    this.processStepsArray.push(this.createProcessStepForm(newStep));
    // Actualizar números de los pasos
    this.updateStepNumbers();
  }

  updateStepNumbers(): void {
    this.processStepsArray.controls.forEach((control, index) => {
      (control as FormGroup).patchValue({ number: index + 1 }, { emitEvent: false });
    });
  }

  removeProcessStep(index: number): void {
    if (confirm('¿Estás seguro de eliminar este paso?')) {
      this.processStepsArray.removeAt(index);
      this.updateStepNumbers();
      this.showToastMessage('Paso eliminado correctamente');
    }
  }

  // ==================== MÉTODOS PARA OBTENER ETIQUETAS ====================
  getStatusLabel(statusValue: string): string {
    const status = this.ministryStatuses.find(s => s.value === statusValue);
    return status ? status.label : 'Desconocido';
  }

  // ==================== MÉTODOS PARA FORMULARIOS MODALES ====================
  initializeModalForms(): void {
    if (this.showMinistryModal && !this.currentMinistry) {
      this.currentMinistry = this.getEmptyMinistry();
    }
  }

  openMinistryModal(ministry?: any): void {
    this.currentMinistry = ministry ? { ...ministry, videos: [...(ministry.videos || [])] } : this.getEmptyMinistry();
    // Asegurar que siempre haya un id para poder subir fotos/videos (incluso antes de guardar)
    if (!this.currentMinistry?.id) {
      this.currentMinistry.id = this.generateId();
    }
    this.ministryModalForm = this.createMinistryModalForm(this.currentMinistry);
    this.showMinistryModal = true;
    // Siempre cargar/refrescar media (icono, fotos, videos) al abrir el modal para reflejar el estado actual
    if (this.currentMinistry.id) {
      this.apiService.getMinistryMedia(this.currentMinistry.id).subscribe({
        next: (data) => {
          this.ministryMediaState[this.currentMinistry.id] = {
            ...data,
            iconUrl: data.iconUrl ? `${environment.apiBaseUrl}${data.iconUrl}` : null,
            cardImageUrl: data.cardImageUrl ? `${environment.apiBaseUrl}${data.cardImageUrl}` : null,
            photos: (data.photos || []).map((p: any) => ({ ...p, url: `${environment.apiBaseUrl}${p.url}` })),
            videos: (data.videos || []).map((v: any) => ({ ...v, url: `${environment.apiBaseUrl}${v.url}` })),
            hasPdf: !!data.pdfUrl
          };
        },
        error: () => {}
      });
    }
  }
  createMinistryModalForm(ministry?: any): FormGroup {
    return this.fb.group({
      id: [ministry?.id || this.generateId()],
      name: [ministry?.name || '', Validators.required],
      description: [ministry?.description || '', Validators.required],
      longDescription: [ministry?.longDescription || ''],
      icon: [ministry?.icon || ''],
      image: [ministry?.image || ''],
      videoUrl: [ministry?.videoUrl || ''],
      videos: [ministry?.videos || []],
      colorFrom: [ministry?.colorFrom || '#3b82f6'],
      colorTo: [ministry?.colorTo || '#8b5cf6'],
      features: [ministry?.features || []],
      schedule: [ministry?.schedule || ''],
      location: [ministry?.location || ''],
      leader: [ministry?.leader || ''],
      contactEmail: [ministry?.contactEmail || ''],
      showContactSection: [ministry?.showContactSection !== false],
      requirements: [ministry?.requirements || []],
      status: [ministry?.status || 'active', Validators.required],
      volunteerCount: [ministry?.volunteerCount || 0],
      impactStats: [ministry?.impactStats || '']
    });
  }

  // === MINISTRY ICON UPLOAD (PNG) ===
  onMinistryCardImageUpload(event: Event, ministryId: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!ministryId) { this.showToastMessage('Guarda el ministerio primero para subir medios', 'error'); return; }
    if (!file.type.startsWith('image/')) { this.showToastMessage('Formato no válido', 'error'); return; }
    this.uploadingMediaFor = ministryId;
    this.apiService.uploadMinistryCardImage(ministryId, file).subscribe({
      next: (res) => {
        if (!this.ministryMediaState[ministryId]) this.ministryMediaState[ministryId] = { photos: [], videos: [] };
        this.ministryMediaState[ministryId].hasCardImage = true;
        this.ministryMediaState[ministryId].cardImageUrl = `${environment.apiBaseUrl}${res.cardImageUrl}?t=${Date.now()}`;
        this.uploadingMediaFor = null;
        this.showToastMessage('Imagen de card guardada');
      },
      error: () => { this.uploadingMediaFor = null; this.showToastMessage('Error al subir imagen', 'error'); }
    });
  }

  deleteMinistryCardImage(ministryId: string): void {
    this.apiService.deleteMinistryCardImage(ministryId).subscribe({
      next: () => {
        if (this.ministryMediaState[ministryId]) {
          this.ministryMediaState[ministryId].hasCardImage = false;
          this.ministryMediaState[ministryId].cardImageUrl = null;
        }
        this.showToastMessage('Imagen de card eliminada');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  onMinistryIconUpload(event: Event, ministryId: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!ministryId) { this.showToastMessage('Guarda el ministerio primero para subir medios', 'error'); return; }
    if (!file.type.startsWith('image/')) { this.showToastMessage('Formato no válido', 'error'); return; }
    this.uploadingMediaFor = ministryId;
    this.apiService.uploadMinistryIcon(ministryId, file).subscribe({
      next: (res) => {
        if (!this.ministryMediaState[ministryId]) this.ministryMediaState[ministryId] = { photos: [] };
        this.ministryMediaState[ministryId].hasIcon = true;
        this.ministryMediaState[ministryId].iconUrl = `${environment.apiBaseUrl}${res.iconUrl}?t=${Date.now()}`;
        this.ministryMediaState[ministryId].iconName = res.imageName;
        this.uploadingMediaFor = null;
        this.showToastMessage('Ícono PNG guardado');
      },
      error: () => { this.uploadingMediaFor = null; this.showToastMessage('Error al subir ícono', 'error'); }
    });
  }

  deleteMinistryIcon(ministryId: string): void {
    this.apiService.deleteMinistryIcon(ministryId).subscribe({
      next: () => {
        if (this.ministryMediaState[ministryId]) {
          this.ministryMediaState[ministryId].hasIcon = false;
          this.ministryMediaState[ministryId].iconUrl = null;
        }
        this.showToastMessage('Ícono eliminado');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  // === MINISTRY PHOTO UPLOAD ===
  onMinistryPhotoUpload(event: Event, ministryId: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!ministryId) { this.showToastMessage('Guarda el ministerio primero para subir medios', 'error'); return; }
    if (!file.type.startsWith('image/')) { this.showToastMessage('Formato no válido', 'error'); return; }
    this.uploadingMediaFor = ministryId;
    this.apiService.uploadMinistryPhoto(ministryId, file).subscribe({
      next: (res) => {
        if (!this.ministryMediaState[ministryId]) this.ministryMediaState[ministryId] = { photos: [] };
        if (!this.ministryMediaState[ministryId].photos) this.ministryMediaState[ministryId].photos = [];
        this.ministryMediaState[ministryId].photos.push({
          id: res.photoId, name: res.imageName, url: `${environment.apiBaseUrl}${res.photoUrl}?t=${Date.now()}`
        });
        this.uploadingMediaFor = null;
        this.showToastMessage('Foto guardada');
      },
      error: () => { this.uploadingMediaFor = null; this.showToastMessage('Error al subir foto', 'error'); }
    });
  }

  deleteMinistryPhoto(ministryId: string, photoId: number): void {
    this.apiService.deleteMinistryPhoto(ministryId, photoId).subscribe({
      next: () => {
        if (this.ministryMediaState[ministryId]?.photos) {
          this.ministryMediaState[ministryId].photos =
            this.ministryMediaState[ministryId].photos.filter((p: any) => p.id !== photoId);
        }
        this.showToastMessage('Foto eliminada');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  onMinistryVideoUpload(event: Event, ministryId: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!ministryId) { this.showToastMessage('Guarda el ministerio primero para subir medios', 'error'); return; }
    if (!file.type.startsWith('video/')) {
      this.showToastMessage('Formato no válido. Debe ser un video (MP4, WebM, etc.)', 'error');
      return;
    }
    this.uploadingMediaFor = ministryId;
    this.apiService.uploadMinistryVideo(ministryId, file).subscribe({
      next: (res) => {
        if (!this.ministryMediaState[ministryId]) this.ministryMediaState[ministryId] = { photos: [], videos: [] };
        if (!this.ministryMediaState[ministryId].videos) this.ministryMediaState[ministryId].videos = [];
        this.ministryMediaState[ministryId].videos.push({
          id: res.videoId,
          name: res.videoName,
          url: `${environment.apiBaseUrl}${res.videoUrl}?t=${Date.now()}`
        });
        this.uploadingMediaFor = null;
        this.showToastMessage('Video guardado');
      },
      error: () => {
        this.uploadingMediaFor = null;
        this.showToastMessage('Error al subir video', 'error');
      }
    });
  }

  deleteMinistryVideo(ministryId: string, videoId: number): void {
    this.apiService.deleteMinistryVideo(ministryId, videoId).subscribe({
      next: () => {
        if (this.ministryMediaState[ministryId]?.videos) {
          this.ministryMediaState[ministryId].videos =
            this.ministryMediaState[ministryId].videos.filter((v: any) => v.id !== videoId);
        }
        this.showToastMessage('Video eliminado');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  onMinistryPdfUpload(event: Event, ministryId: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || file.type !== 'application/pdf') {
      this.showToastMessage('Debe ser un archivo PDF', 'error');
      return;
    }
    this.uploadingMediaFor = ministryId;
    this.apiService.uploadMinistryPdf(ministryId, file).subscribe({
      next: () => {
        if (!this.ministryMediaState[ministryId]) this.ministryMediaState[ministryId] = {};
        this.ministryMediaState[ministryId].hasPdf = true;
        this.uploadingMediaFor = null;
        this.showToastMessage('PDF guardado');
      },
      error: () => {
        this.uploadingMediaFor = null;
        this.showToastMessage('Error al subir PDF', 'error');
      }
    });
  }

  deleteMinistryPdf(ministryId: string): void {
    this.apiService.deleteMinistryPdf(ministryId).subscribe({
      next: () => {
        if (this.ministryMediaState[ministryId]) this.ministryMediaState[ministryId].hasPdf = false;
        this.showToastMessage('PDF eliminado');
      },
      error: () => this.showToastMessage('Error al eliminar', 'error')
    });
  }

  addVideoUrl(): void {
    if (!this.currentMinistry.videos) this.currentMinistry.videos = [];
    this.currentMinistry.videos.push('');
  }

  removeVideoUrl(index: number): void {
    this.currentMinistry.videos.splice(index, 1);
  }

  trackByIndex(index: number): number { return index; }

  // Manejo de archivos de imagen
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validaciones
      const maxSize = 5 * 1024 * 1024; // 5MB para imágenes
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (file.size > maxSize) {
        this.showToastMessage('La imagen es demasiado grande. Máximo 5MB.', 'error');
        return;
      }

      if (!allowedImageTypes.includes(file.type)) {
        this.showToastMessage('Formato de imagen no válido. Use JPEG, PNG, GIF o WebP.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (this.currentMinistry) {
          this.currentMinistry.image = result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getImagePreview(): string | null {
    return this.currentMinistry?.image || null;
  }
}