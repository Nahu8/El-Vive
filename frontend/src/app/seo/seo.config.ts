export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  noindex?: boolean;
}

export const DEFAULT_SEO: SeoConfig = {
  title: 'Él Vive Iglesia | Comunidad de fe en La Matanza',
  description:
    'Él Vive Iglesia es una comunidad cristiana en Virrey del Pino, La Matanza, Buenos Aires. Reuniones, ministerios, eventos y una familia de fe.',
  keywords:
    'él vive iglesia, iglesia cristiana, virrey del pino, la matanza, buenos aires, iglesia evangélica, ministerios, culto',
  ogType: 'website',
};

export const ROUTE_SEO: Record<string, SeoConfig> = {
  '': DEFAULT_SEO,
  nosotros: {
    title: 'Nosotros | Él Vive Iglesia',
    description:
      'Conocé la historia, valores y visión de Él Vive Iglesia. Una comunidad de fe dedicada a servir a Dios y a nuestra comunidad.',
    keywords: 'nosotros, historia iglesia, pastoral, valores, visión, él vive iglesia',
  },
  ministerios: {
    title: 'Ministerios | Él Vive Iglesia',
    description:
      'Descubrí los ministerios de Él Vive Iglesia y cómo podés servir y crecer en la comunidad.',
    keywords: 'ministerios, servicio, iglesia, jóvenes, niños, alabanza, él vive iglesia',
  },
  'dias-reunion': {
    title: 'Días de Reunión y Eventos | Él Vive Iglesia',
    description:
      'Calendario de reuniones, cultos y eventos de Él Vive Iglesia. Planificá tu participación.',
    keywords: 'días de reunión, eventos, culto, calendario, horarios, él vive iglesia',
  },
  contacto: {
    title: 'Contacto | Él Vive Iglesia',
    description:
      'Contactá a Él Vive Iglesia. Dirección, teléfono, email y redes sociales. Estamos en Virrey del Pino, La Matanza.',
    keywords: 'contacto, dirección, teléfono, email, él vive iglesia, virrey del pino',
  },
  donaciones: {
    title: 'Donaciones | Él Vive Iglesia',
    description:
      'Tu aporte ayuda a sostener la obra de Él Vive Iglesia y bendecir a nuestra comunidad.',
    keywords: 'donaciones, ofrendas, aporte, él vive iglesia',
  },
  login: {
    title: 'Acceso administración | Él Vive Iglesia',
    description: 'Panel de administración de Él Vive Iglesia.',
    noindex: true,
  },
  admin: {
    title: 'Administración | Él Vive Iglesia',
    description: 'Panel de administración de Él Vive Iglesia.',
    noindex: true,
  },
  mantenimiento: {
    title: 'Sitio en mantenimiento | Él Vive Iglesia',
    description: 'Él Vive Iglesia está realizando tareas de mantenimiento. Volvé pronto.',
    noindex: true,
  },
};
