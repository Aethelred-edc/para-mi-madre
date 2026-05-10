let profileData = null;

function detectTarget() {
  const params = new URLSearchParams(window.location.search);
  let v = params.get('v');

  if (!v) {
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash) v = atob(hash);
    } catch (_) {
      v = null;
    }
  }

  if (!v) return 'm';

  const lv = v.trim().toLowerCase();
  if (lv === 'm' || lv === 'madre') return 'm';
  if (lv === 's' || lv === 'suegra') return 's';

  try {
    const decoded = atob(v).trim().toLowerCase();
    if (decoded === 'm' || decoded === 'madre') return 'm';
    if (decoded === 's' || decoded === 'suegra') return 's';
  } catch (_) {}

  return 'm';
}

async function loadProfile() {
  const key = detectTarget();

  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    if (!data[key]) throw new Error('key missing');
    profileData = { ...data[key], _target: key };
    return profileData;
  } catch (_) {
    profileData = getFallbackProfile(key);
    return profileData;
  }
}

function getFallbackProfile(key) {
  const defaults = {
    m: {
      target_id: 'madre',
      autor: 'Denilson Jhosseph',
      destinatario: 'Wendy Karina',
      titulo: 'Para la mujer que me dio la vida',
      saludo: '¡Feliz día, Mamá!',
      poema: 'Eres el primer amor que conocí,\nla voz que calmó mis miedos nocturnos,\nlas manos que guiaron mis primeros pasos\ny el corazón que nunca dejó de latir por mí.\n\nHoy y siempre, gracias por ser mi hogar.',
      reto_tipo: 'input',
      reto_instruccion: 'Para abrir tu regalo, necesito que recuerdes el año en que nací. ¿Cuál fue ese año especial?',
      reto_hint: 'Solo el año (4 dígitos)',
      reto_respuesta: '2009',
      reto_tipo_2: 'opciones',
      reto_instruccion_2: '¿Cuál es tu flor favorita?',
      reto_opciones: ['Rosa', 'Tulipán', 'Girasol', 'Orquídea'],
      reto_respuesta_2: 'Rosa',
      mensaje_victoria: 'Mamá, llegaste hasta aquí porque así eres tú: perseverante, inteligente y llena de amor.\n\n¡Feliz Día de las Madres! Te amo con todo mi corazón.',
      color_primario: '#641220',
      color_acento: '#E8829A',
      _target: 'm'
    },
    s: {
      target_id: 'suegra',
      autor: 'Zabdi Zimei',
      destinatario: 'Mami',
      titulo: 'Para ti, que me enseñaste a querer',
      saludo: '¡Feliz día, Mami!',
      subtitulo: 'Hoy quiero que sientas todo lo que significa para mí.',
      poema: 'Llegué a tu vida sin saber lo que encontraría,\ny me diste un lugar entre los tuyos sin dudarlo.\nMe enseñaste con el ejemplo lo que es el amor de madre,\ny sin buscarlo, te convertiste en la mía.\n\nGracias por abrirme tus brazos, tu casa y tu corazón.',
      reto_tipo: 'input',
      reto_instruccion: '¿En qué año llegué a formar parte de tu familia?',
      reto_hint: 'El año que nos conocimos (4 dígitos)',
      reto_respuesta: '2009',
      reto_tipo_2: 'opciones',
      reto_instruccion_2: '¿Cuál es el platillo que más me gusta cuando cocinas?',
      reto_opciones: ['Pollo frito', 'Sopa de res', 'Baleadas', 'Tamales'],
      reto_respuesta_2: 'Pollo frito',
      mensaje_victoria: '¡Lo lograste, Mami! Eso no me sorprende para nada.\n\nQuiero que sepas que te admiro, que te quiero,\ny que me siento muy afortunada de tenerte en mi vida.\n\n¡Feliz Día de las Madres! — Zabdi Zimei',
      color_primario: '#641220',
      color_acento: '#C9A84C',
      _target: 's'
    }
  };
  return defaults[key] || defaults['m'];
}

function getProfile() {
  return profileData;
}

export { loadProfile, getProfile, detectTarget };