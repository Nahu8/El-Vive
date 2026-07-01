const UNSPLASH = {
  heroHands: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80',
  community: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
};

export const DEFAULT_DONACIONES_PAGE_CONTENT = {
  hero: {
    title: 'OFRENDAS',
    badge: 'Ofrenda voluntaria',
    subtitle: 'Tu participación voluntaria sostiene el ministerio y nos permite seguir acompañando a más personas.',
    backgroundImageUrlLight: UNSPLASH.heroHands,
    backgroundImageUrlDark: UNSPLASH.heroHands,
    bgColorLight: '#ecfdf5',
    bgColorDark: '#022c22',
    fadeEnabled: true,
    fadeColorLight: '#ffffff',
    fadeColorDark: '#000000',
  },
  intro: {
    title: 'Participá con tus ofrendas',
    content:
      'Si confiás en el ministerio y en el trabajo que realizamos como iglesia, comunicate con nosotros para conocer cómo podés participar con tus ofrendas. Cada aporte voluntario nos ayuda a seguir llevando adelante esta obra y acompañando a más personas.',
  },
  whyGive: [],
  paymentMethods: [],
  donacionesCta: {
    title: '¿Querés ofrendar?',
    subtitle: 'Escribinos y te orientamos sobre cómo participar.',
    buttonText: 'Contactanos',
    buttonUrl: '/contacto',
    imageUrl: UNSPLASH.community,
  },
  sections: [],
};

export function enrichDonacionesPageContent(pc) {
  const d = DEFAULT_DONACIONES_PAGE_CONTENT;
  if (!pc || typeof pc !== 'object') {
    return JSON.parse(JSON.stringify(d));
  }
  const out = {
    ...d,
    ...pc,
    hero: { ...d.hero, ...(pc.hero || {}) },
    intro: { ...d.intro, ...(pc.intro || {}) },
    donacionesCta: { ...d.donacionesCta, ...(pc.donacionesCta || {}) },
  };
  // ponytail: ofrendas ya no muestra medios de pago ni tarjetas de impacto por defecto
  out.whyGive = Array.isArray(pc.whyGive) ? pc.whyGive : [];
  out.paymentMethods = [];
  out.sections = Array.isArray(pc.sections) ? pc.sections : [];
  return out;
}
