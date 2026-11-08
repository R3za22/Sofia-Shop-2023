/** Keep a dual-thumb range valid: the moved thumb pushes against, never past, the other. */
export function moveThumb(lo: number, hi: number, which: 'min' | 'max', value: number, bounds: { min: number; max: number }): [number, number] {
  const v = Math.min(Math.max(value, bounds.min), bounds.max);
  return which === 'min' ? [Math.min(v, hi), hi] : [lo, Math.max(v, lo)];
}

/** A thumb at its bound means "no limit" for the URL/API. */
export function toLimits(lo: number, hi: number, bounds: { min: number; max: number }): { min?: number; max?: number } {
  return { min: lo > bounds.min ? lo : undefined, max: hi < bounds.max ? hi : undefined };
}
