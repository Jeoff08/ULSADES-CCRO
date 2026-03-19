export const MARRIAGE_ANNOTATION_MODES = {
  nullity: 'nullity',
  divorce: 'divorce',
  art42: 'art42',
}

export function resolveMarriageAnnotationMode(raw) {
  if (raw === MARRIAGE_ANNOTATION_MODES.art42) return MARRIAGE_ANNOTATION_MODES.art42
  if (raw === MARRIAGE_ANNOTATION_MODES.divorce) return MARRIAGE_ANNOTATION_MODES.divorce
  return MARRIAGE_ANNOTATION_MODES.nullity
}
