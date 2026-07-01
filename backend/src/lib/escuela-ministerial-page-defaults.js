export const DEFAULT_ESCUELA_MINISTERIAL_PAGE_CONTENT = {
  hero: {
    title: 'ESCUELA MINISTERIAL',
    subtitle: 'Formación y capacitación para quienes desean servir con excelencia en el ministerio.',
    bgColorLight: '#eef2ff',
    bgColorDark: '#1e1b4b',
    fadeEnabled: true,
    fadeColorLight: '#ffffff',
    fadeColorDark: '#000000',
  },
  intro: {
    title: 'Descripción del ministerio',
    content: 'La Escuela Ministerial es un espacio de formación bíblica y práctica para desarrollar dones y habilidades de servicio.',
  },
  objective: {
    title: 'Objetivo',
    content: 'Preparar a hombres y mujeres para servir con fundamento bíblico, carácter y compromiso.',
  },
  generalInfo: {
    title: 'Información general',
    content: 'Duración, modalidad, horarios y requisitos generales se publicarán aquí.',
  },
  program: {
    title: 'Programa',
    content: '',
    items: [],
  },
  requirements: {
    title: 'Requisitos',
    items: [],
  },
  registration: {
    title: 'Inscripción',
    content: 'Completá el formulario o descargá la ficha de inscripción para participar.',
    formUrl: '',
    pdfUrl: '',
  },
  presentationVideo: { url: '' },
  images: [],
  socialMedia: { facebook: '', instagram: '' },
  sections: [],
};

export function enrichEscuelaMinisterialPageContent(pc) {
  const d = DEFAULT_ESCUELA_MINISTERIAL_PAGE_CONTENT;
  if (!pc || typeof pc !== 'object') {
    return JSON.parse(JSON.stringify(d));
  }
  const out = {
    ...d,
    ...pc,
    hero: { ...d.hero, ...(pc.hero || {}) },
    intro: { ...d.intro, ...(pc.intro || {}) },
    objective: { ...d.objective, ...(pc.objective || {}) },
    generalInfo: { ...d.generalInfo, ...(pc.generalInfo || {}) },
    program: {
      ...d.program,
      ...(pc.program || {}),
      items: Array.isArray(pc.program?.items) ? pc.program.items : d.program.items,
    },
    requirements: {
      ...d.requirements,
      ...(pc.requirements || {}),
      items: Array.isArray(pc.requirements?.items) ? pc.requirements.items : d.requirements.items,
    },
    registration: { ...d.registration, ...(pc.registration || {}) },
    presentationVideo: { ...d.presentationVideo, ...(pc.presentationVideo || {}) },
    socialMedia: { ...d.socialMedia, ...(pc.socialMedia || {}) },
  };
  out.images = Array.isArray(pc.images) ? pc.images : [];
  out.sections = Array.isArray(pc.sections) ? pc.sections : [];
  return out;
}
