export const DEFAULT_NOSOTROS_PAGE_CONTENT = {
  hero: {
    title: 'NOSOTROS',
    subtitle: 'Conocé nuestra historia, valores y el liderazgo que guía esta comunidad de fe.',
    bgColorLight: '#f8fafc',
    bgColorDark: '#0f172a',
    fadeEnabled: true,
    fadeColorLight: '#ffffff',
    fadeColorDark: '#000000',
  },
  intro: {
    title: 'Una comunidad con propósito',
    content:
      'Somos una iglesia cristiana que anhela la Palabra, la presencia y el poder del Señor. Existimos para reconciliar al hombre con Dios, creyendo que hay un nuevo comienzo para cada vida.',
  },
  leadership: {
    pastorName: 'Hugo Aranda',
    pastorRole: 'Pastor Principal',
    pastorImageUrl: '',
    pastoraName: 'Débora Aranda',
    pastoraRole: 'Pastora Principal',
    pastoraImageUrl: '',
    groupTitle: 'Equipo Pastoral',
    groupRole: 'Cobertura y acompañamiento',
    groupImageUrl: '',
  },
  pastor: {
    name: 'Hugo Aranda',
    role: 'Pastor Principal',
    description: '',
    quote: '',
    imageUrl: '',
  },
  leadershipIntro: {
    title: 'Pastores principales',
    subtitle: 'Hugo y Débora Aranda lideran el ministerio pastoral de nuestra iglesia.',
  },
  pastoralCoverage: {
    title: 'Cobertura pastoral',
    description:
      'Además del liderazgo principal, contamos con pastores y líderes que acompañan distintas áreas y zonas de la iglesia.',
    zones: [],
  },
  pastorProfile: {
    title: 'Conocé al Pastor',
    name: 'Hugo Aranda',
    role: 'Pastor Principal',
    description: '',
    ministryInfo: '',
    imageUrl: '',
  },
  proyectoPastor: {
    title: 'Proyecto Pastor',
    subtitle: 'Iniciativas y tareas específicas del ministerio pastoral.',
    projects: [],
  },
  highlights: [
    {
      title: 'Nuestras Creencias',
      content: 'Vean cómo vemos a Dios, a la Biblia y a los fundamentos que guían nuestra misión.',
      linkText: 'Leer más',
      linkUrl: '',
    },
    {
      title: 'Nuestros Valores',
      content: 'Conocé los valores que sostienen nuestra visión y nuestra forma de vivir la fe.',
      linkText: 'Leer más',
      linkUrl: '',
    },
    {
      title: 'Nuestro Equipo',
      content: 'Conocé a los pastores y al equipo ministerial que sirve cada semana en la iglesia.',
      linkText: 'Leer más',
      linkUrl: '',
    },
  ],
  sections: [],
};

export function enrichNosotrosPageContent(pc) {
  const d = DEFAULT_NOSOTROS_PAGE_CONTENT;
  if (!pc || typeof pc !== 'object') {
    return JSON.parse(JSON.stringify(d));
  }
  const out = {
    ...d,
    ...pc,
    hero: { ...d.hero, ...(pc.hero || {}) },
    intro: { ...d.intro, ...(pc.intro || {}) },
    leadership: { ...d.leadership, ...(pc.leadership || {}) },
    pastor: { ...d.pastor, ...(pc.pastor || {}) },
    leadershipIntro: { ...d.leadershipIntro, ...(pc.leadershipIntro || {}) },
    pastoralCoverage: {
      ...d.pastoralCoverage,
      ...(pc.pastoralCoverage || {}),
      zones: Array.isArray(pc.pastoralCoverage?.zones) ? pc.pastoralCoverage.zones : d.pastoralCoverage.zones,
    },
    pastorProfile: { ...d.pastorProfile, ...(pc.pastorProfile || {}) },
    proyectoPastor: {
      ...d.proyectoPastor,
      ...(pc.proyectoPastor || {}),
      projects: Array.isArray(pc.proyectoPastor?.projects) ? pc.proyectoPastor.projects : d.proyectoPastor.projects,
    },
  };
  out.highlights = Array.isArray(pc.highlights) && pc.highlights.length ? pc.highlights : [...d.highlights];
  out.sections = Array.isArray(pc.sections) ? pc.sections : [];
  return out;
}
