import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { COLOR_HEX } from '../mock/fixtures';
import type { Product } from '../types';
import { HeartButton } from './HeartButton';
import { Illustration } from './Illustration';

export function ProductCard({ p }: { p: Product }) {
  const { t, lang, money } = useI18n();
  return (
    <Link className="card" to={`/product/${p.id}`}>
      <div className="card__art" style={{ background: p.bg }}>
        <HeartButton product={p} className="heart--card" />
        {p.stock <= 0 ? <span className="badge badge--out">{t('badge.out')}</span> : p.isNew && <span className="badge badge--new">{t('badge.new')}</span>}
        <Illustration kind={p.kind} c={COLOR_HEX[p.colors[0]]} d={p.accent} />
      </div>
      <div className="card__body">
        <span className="card__cat">{t(`type.${p.type}`)}</span>
        <span className="card__name">{p.name[lang]}</span>
        <span className="card__price">{money(p.price)}</span>
      </div>
    </Link>
  );
}
