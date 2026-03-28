/**
 * Contenido por defecto y enriquecimiento para la página Donaciones (generic_pages.page_key = donaciones).
 * Imágenes: Unsplash (HTTPS) para que funcionen sin subir archivos.
 */

const UNSPLASH = {
  heroHands: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80',
  community: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
  mission: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&q=80',
  heart: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&q=80',
  bank: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  mp: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
};

export const DEFAULT_DONACIONES_PAGE_CONTENT = {
  hero: {
    title: 'DONACIONES',
    badge: 'Generosidad que sostiene la misión',
    subtitle: 'Cada gesto de generosidad sostiene la misión de Dios en nuestra ciudad y bendice a quienes servimos.',
    backgroundImageUrlLight: UNSPLASH.heroHands,
    backgroundImageUrlDark: UNSPLASH.heroHands,
    bgColorLight: '#ecfdf5',
    bgColorDark: '#022c22',
    fadeEnabled: true,
    fadeColorLight: '#ffffff',
    fadeColorDark: '#000000',
  },
  intro: {
    title: 'Por qué damos',
    content:
      'La Biblia nos invita a ser mayordomos fieles de lo que Dios nos confía. Tus donaciones financian cultos, ministerios, ayuda social y el mantenimiento de nuestro espacio. Gracias por ser parte.',
  },
  whyGive: [
    {
      title: 'Comunidad viva',
      content: 'Tu aporte permite reuniones, equipos de servicio y un lugar seguro para crecer en fe.',
      imageUrl: UNSPLASH.community,
    },
    {
      title: 'Misión y servicio',
      content: 'Proyectos locales, visitas y apoyo a familias que lo necesitan.',
      imageUrl: UNSPLASH.mission,
    },
    {
      title: 'Generosidad con propósito',
      content: 'Cada peso se usa con transparencia, priorizando el evangelio y el cuidado de las personas.',
      imageUrl: UNSPLASH.heart,
    },
  ],
  paymentMethods: [
    {
      label: 'Transferencia bancaria',
      description: 'Titular: [Nombre de la iglesia]. Enviá comprobante por WhatsApp o email para registrar tu ofrenda.',
      detail: 'CBU: 0000000000000000000000\nAlias: ELVIVE.IGLESIA\nBanco: [Nombre del banco]',
      icon: '🏦',
      imageUrl: UNSPLASH.bank,
    },
    {
      label: 'Mercado Pago / otros',
      description: 'Podés usar el link de pago o QR que compartimos en culto. Si necesitás el link, contactanos.',
      detail: 'https://link.mercadopago.com.ar/ejemplo-elvive',
      icon: '💳',
      imageUrl: UNSPLASH.mp,
    },
  ],
  donacionesCta: {
    title: '¿Necesitás datos o factura?',
    subtitle: 'Escríbenos y con gusto te orientamos.',
    buttonText: 'Ir a Contacto',
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
  out.whyGive = Array.isArray(pc.whyGive) ? pc.whyGive : [...d.whyGive];
  out.paymentMethods = Array.isArray(pc.paymentMethods) ? pc.paymentMethods : [...d.paymentMethods];
  out.sections = Array.isArray(pc.sections) ? pc.sections : [];
  return out;
}
