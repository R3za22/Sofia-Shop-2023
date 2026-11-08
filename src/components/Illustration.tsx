import type { Kind } from '../types';

interface Props {
  kind: Kind;
  /** Main colour (the chosen product colour). */
  c: string;
  /** Accent colour. */
  d: string;
  /** Accessible description; decorative when omitted. */
  label?: string;
}

const INK = '#16263A';

/** Original vector product art, drawn for this project. */
export function Illustration({ kind, c, d, label }: Props) {
  return (
    <svg
      viewBox="0 0 200 160"
      className="art"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {kind === 'sofa' && (
        <g>
          <rect x="30" y="70" width="140" height="50" rx="10" fill={c} />
          <rect x="20" y="60" width="26" height="62" rx="10" fill={c} />
          <rect x="154" y="60" width="26" height="62" rx="10" fill={c} />
          <rect x="46" y="50" width="108" height="40" rx="12" fill={d} />
          <rect x="34" y="122" width="6" height="14" fill={INK} />
          <rect x="160" y="122" width="6" height="14" fill={INK} />
        </g>
      )}
      {kind === 'lamp' && (
        <g>
          <path d="M70 24L130 24L148 76L52 76Z" fill={d} />
          <rect x="98" y="76" width="4" height="56" fill={INK} />
          <ellipse cx="100" cy="136" rx="30" ry="6" fill={c} />
        </g>
      )}
      {kind === 'vase' && (
        <g>
          <path d="M88 30H112L108 58C142 76 136 130 100 130C64 130 58 76 92 58Z" fill={c} />
          <ellipse cx="100" cy="30" rx="12" ry="4" fill={d} />
        </g>
      )}
      {kind === 'table' && (
        <g>
          <rect x="28" y="70" width="144" height="12" rx="4" fill={c} />
          <rect x="42" y="82" width="8" height="52" fill={INK} />
          <rect x="150" y="82" width="8" height="52" fill={INK} />
          <circle cx="70" cy="58" r="12" fill={d} />
        </g>
      )}
      {kind === 'rug' && (
        <g>
          <rect x="20" y="36" width="160" height="94" rx="6" fill={c} />
          <rect x="34" y="48" width="132" height="70" rx="3" fill={d} />
          <rect x="48" y="60" width="104" height="46" fill={c} />
        </g>
      )}
      {kind === 'shelf' && (
        <g>
          <rect x="38" y="20" width="6" height="116" fill={INK} />
          <rect x="156" y="20" width="6" height="116" fill={INK} />
          <rect x="38" y="20" width="124" height="6" rx="2" fill={c} />
          <rect x="38" y="62" width="124" height="6" rx="2" fill={c} />
          <rect x="38" y="104" width="124" height="6" rx="2" fill={c} />
          <rect x="52" y="38" width="14" height="24" rx="2" fill={d} />
          <rect x="70" y="42" width="10" height="20" rx="2" fill={c} />
          <circle cx="126" cy="52" r="10" fill={d} />
          <rect x="56" y="78" width="30" height="26" rx="3" fill={d} />
          <rect x="112" y="84" width="22" height="20" rx="3" fill={c} />
        </g>
      )}
    </svg>
  );
}
