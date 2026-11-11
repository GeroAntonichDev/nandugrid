import { PHOTO_CATEGORIES, PhotoCategory } from './photo-categories';

export interface AiSuggestion {
  category: PhotoCategory;
  tags: string[];
  confidence: number;
}

interface SuggestionRule {
  category: PhotoCategory;
  keywords: string[];
  tags: string[];
}

const RULES: SuggestionRule[] = [
  {
    category: 'Paisaje',
    keywords: [
      'paisaje',
      'montana',
      'cordillera',
      'valle',
      'amanecer',
      'atardecer',
      'horizonte',
      'lago',
      'mar',
      'playa',
      'cielo',
      'litoral',
      'landscape',
      'sunset',
      'sunrise',
    ],
    tags: ['luz natural', 'horizonte', 'gran angular'],
  },
  {
    category: 'Retrato',
    keywords: ['retrato', 'modelo', 'persona', 'rostro', 'estudio', 'editorial', 'portrait', 'look'],
    tags: ['retrato', 'luz suave', '50mm'],
  },
  {
    category: 'Naturaleza',
    keywords: [
      'naturaleza',
      'flora',
      'fauna',
      'ave',
      'pajaro',
      'planta',
      'hoja',
      'bosque',
      'animal',
      'insecto',
      'macro',
      'flor',
    ],
    tags: ['macro', 'detalle', 'verde'],
  },
  {
    category: 'Nocturna',
    keywords: [
      'noche',
      'nocturna',
      'estrellas',
      'astro',
      'via lactea',
      'luna',
      'nocturno',
      'milky',
      'larga exposicion',
    ],
    tags: ['larga exposición', 'trípode', 'ISO alto'],
  },
  {
    category: 'Producto',
    keywords: [
      'producto',
      'packshot',
      'bodegon',
      'marca',
      'ecommerce',
      'objeto',
      'catalogo',
      'comercial',
    ],
    tags: ['fondo limpio', 'iluminación controlada', 'detalle'],
  },
  {
    category: 'Evento',
    keywords: ['evento', 'boda', 'concierto', 'fiesta', 'ceremonia', 'cumpleanos', 'show', 'festival'],
    tags: ['momento', 'flash', 'documental'],
  },
  {
    category: 'Calle',
    keywords: ['calle', 'urbano', 'street', 'ciudad', 'arquitectura', 'mural', 'mercado', 'espontaneo'],
    tags: ['urbano', 'espontáneo', 'contraste'],
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function suggestFromText(text: string): AiSuggestion | null {
  const normalized = normalize(text);
  if (!normalized.trim()) {
    return null;
  }

  let best: { rule: SuggestionRule; hits: string[] } | null = null;
  for (const rule of RULES) {
    const hits = rule.keywords.filter((keyword) => normalized.includes(normalize(keyword)));
    if (!best || hits.length > best.hits.length) {
      best = { rule, hits };
    }
  }

  if (!best || best.hits.length === 0) {
    return null;
  }

  const extraTags = best.hits.slice(0, 2).map((hit) => normalize(hit));
  const tags = [...new Set([...best.rule.tags, ...extraTags])].slice(0, 5);
  const confidence = Math.min(95, 45 + best.hits.length * 15);

  return { category: best.rule.category, tags, confidence };
}

export function isPhotoCategory(value: string): value is PhotoCategory {
  return (PHOTO_CATEGORIES as readonly string[]).includes(value);
}
