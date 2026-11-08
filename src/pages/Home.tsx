import { Link } from 'react-router-dom';
import { api } from '../api';
import { ErrorState, GridSkeleton } from '../components/States';
import { Illustration } from '../components/Illustration';
import { ProductCard } from '../components/ProductCard';
import { useAsync } from '../hooks';
import { useI18n } from '../i18n';
import { COLOR_HEX } from '../mock/fixtures';
import type { Room } from '../types';

const ROOM_TILES: { room: Room; bg: string; kind: 'sofa' | 'table' | 'rug' | 'lamp' | 'vase'; c: string; d: string }[] = [
  { room: 'living', bg: '#C9D3E8', kind: 'sofa', c: COLOR_HEX.indigo, d: COLOR_HEX.saffron },
  { room: 'dining', bg: '#F1D9A6', kind: 'table', c: COLOR_HEX.oat, d: COLOR_HEX.indigo },
  { room: 'bedroom', bg: '#DCE8DA', kind: 'rug', c: COLOR_HEX.sage, d: '#F1D9A6' },
  { room: 'lighting', bg: '#E4D3C6', kind: 'lamp', c: COLOR_HEX.indigo, d: '#EEF1F0' },
  { room: 'decor', bg: '#C9D3E8', kind: 'vase', c: COLOR_HEX.saffron, d: COLOR_HEX.indigo },
];

export function Home() {
  const { t, num } = useI18n();
  const all = useAsync(() => api.listProducts({ pageSize: 100 }), 'home-all');
  const fresh = useAsync(() => api.listProducts({ sort: 'newest', pageSize: 4 }), 'home-new');
  const counts = new Map<Room, number>();
  if (all.status === 'ready') for (const p of all.data.items) counts.set(p.room, (counts.get(p.room) ?? 0) + 1);

  return (
    <>
      <section className="hero">
        <div className="wrap hero__row">
          <div className="hero__text">
            <p className="eyebrow">{t('home.eyebrow')}</p>
            <h1>{t('home.title')}</h1>
            <p className="lead">{t('home.lead')}</p>
            <Link className="btn btn--lg" to="/products">{t('home.cta')}</Link>
          </div>
          <div className="hero__art" role="img" aria-label={t('home.art')}>
            <Illustration kind="sofa" c={COLOR_HEX.indigo} d={COLOR_HEX.saffron} />
            <Illustration kind="lamp" c={COLOR_HEX.indigo} d="#EEF1F0" />
          </div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="rooms-h">
        <h2 id="rooms-h">{t('home.rooms')}</h2>
        <div className="rooms">
          {ROOM_TILES.map((r) => (
            <Link key={r.room} className="room" to={`/products?room=${r.room}`} style={{ background: r.bg }}>
              <Illustration kind={r.kind} c={r.c} d={r.d} />
              <span className="room__name">{t(`room.${r.room}`)}</span>
              <span className="room__n">{all.status === 'ready' ? t('home.pieces', { n: num(counts.get(r.room) ?? 0) }) : ' '}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap section" aria-labelledby="new-h">
        <div className="section__head">
          <h2 id="new-h">{t('home.new')}</h2>
          <Link to="/products">{t('home.all')}</Link>
        </div>
        {fresh.status === 'loading' && <GridSkeleton count={4} />}
        {fresh.status === 'error' && <ErrorState error={fresh.error} onRetry={fresh.reload} />}
        {fresh.status === 'ready' && (
          <div className="grid grid--4">{fresh.data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        )}
      </section>

      <section className="wrap section promises">
        {(['1', '2', '3'] as const).map((n) => (
          <div key={n} className="promise">
            <h3>{t(`home.p${n}.t`)}</h3>
            <p>{t(`home.p${n}.d`)}</p>
          </div>
        ))}
      </section>
    </>
  );
}
