export const PHOTO_CATEGORIES = [
  'Paisaje',
  'Retrato',
  'Naturaleza',
  'Nocturna',
  'Producto',
  'Evento',
  'Calle',
] as const;

export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];
