export const CRITIQUE_TAGS = [
  'Composición',
  'Iluminación',
  'Edición',
  'Técnica',
  'Concepto',
] as const;

export type CritiqueTag = (typeof CRITIQUE_TAGS)[number];
