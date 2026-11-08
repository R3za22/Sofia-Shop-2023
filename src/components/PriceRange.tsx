import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useI18n } from '../i18n';
import { moveThumb, toLimits } from '../lib/range';
import './price-range.css';

const STEP = 100000;
const DEBOUNCE_MS = 250;

type Range = [number, number];

export interface PriceRangeProps {
  bounds: { min: number; max: number };
  /** Applied lower limit; undefined means unlimited (thumb at the bound). */
  min?: number;
  /** Applied upper limit; undefined means unlimited (thumb at the bound). */
  max?: number;
  onCommit: (min?: number, max?: number) => void;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

function fromProps(min: number | undefined, max: number | undefined, bMin: number, bMax: number): Range {
  const lo = clamp(min ?? bMin, bMin, bMax);
  return [lo, Math.max(lo, clamp(max ?? bMax, bMin, bMax))];
}

export function PriceRange({ bounds, min, max, onCommit }: PriceRangeProps) {
  const { t, num } = useI18n();
  const bMin = bounds.min;
  const bMax = bounds.max;
  const span = Math.max(bMax - bMin, 1);

  const [range, setRange] = useState<Range>(() => fromProps(min, max, bMin, bMax));
  // Latest local values, read by timers and key/pointer handlers without stale closures.
  const rangeRef = useRef<Range>(range);
  // Last values reported to the parent (or received from it); used to skip no-op commits.
  const committedRef = useRef<Range>(range);
  const timerRef = useRef<number | undefined>(undefined);
  const commitRef = useRef<() => void>(() => {});

  // Re-sync local state when the applied limits or the bounds change.
  useEffect(() => {
    const next = fromProps(min, max, bMin, bMax);
    committedRef.current = next;
    const cur = rangeRef.current;
    if (next[0] !== cur[0] || next[1] !== cur[1]) {
      rangeRef.current = next;
      setRange(next);
    }
  }, [min, max, bMin, bMax]);

  const clearTimer = () => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const commit = () => {
    clearTimer();
    const cur = rangeRef.current;
    const done = committedRef.current;
    if (cur[0] === done[0] && cur[1] === done[1]) return;
    committedRef.current = cur;
    const limits = toLimits(cur[0], cur[1], { min: bMin, max: bMax });
    onCommit(limits.min, limits.max);
  };

  useEffect(() => {
    commitRef.current = commit;
  });

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    };
  }, []);

  const onThumbChange = (which: 'min' | 'max') => (e: ChangeEvent<HTMLInputElement>) => {
    const [lo, hi] = rangeRef.current;
    const next = moveThumb(lo, hi, which, Number(e.target.value), { min: bMin, max: bMax });
    rangeRef.current = next;
    setRange(next);
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      commitRef.current();
    }, DEBOUNCE_MS);
  };

  const [lo, hi] = range;
  const frac = (v: number) => (clamp(v, bMin, bMax) - bMin) / span;
  const a = frac(lo);
  const b = frac(hi);
  // Thumb centres travel between half a thumb in from each edge, so the fill is offset by that inset.
  const fillStyle: CSSProperties = {
    insetInlineStart: `calc(var(--pr-thumb) / 2 + (100% - var(--pr-thumb)) * ${a.toFixed(6)})`,
    inlineSize: `calc((100% - var(--pr-thumb)) * ${(b - a).toFixed(6)})`,
  };
  const minOnTop = lo >= bMin + span / 2;
  const atBounds = lo <= bMin && hi >= bMax;

  return (
    <div className="price-range">
      <div className="price-range__slider">
        <div className="price-range__track" />
        <div className="price-range__fill" style={fillStyle} />
        <input
          type="range"
          className="price-range__input"
          data-testid="price-min"
          aria-label={t('list.min')}
          min={bMin}
          max={bMax}
          step={STEP}
          value={lo}
          style={{ zIndex: minOnTop ? 3 : 2 }}
          onChange={onThumbChange('min')}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
        <input
          type="range"
          className="price-range__input"
          data-testid="price-max"
          aria-label={t('list.max')}
          min={bMin}
          max={bMax}
          step={STEP}
          value={hi}
          style={{ zIndex: minOnTop ? 2 : 3 }}
          onChange={onThumbChange('max')}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
      </div>
      <p className="price-range__readout" aria-live="polite">
        {atBounds ? t('list.priceAny') : t('list.priceRange', { a: num(lo), b: num(hi) })}
      </p>
    </div>
  );
}
