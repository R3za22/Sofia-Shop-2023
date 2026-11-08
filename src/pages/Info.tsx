import { Link, useParams } from 'react-router-dom';
import { useI18n, type Key } from '../i18n';
import { NotFound } from './NotFound';
import './info.css';

const PAGES = ['delivery', 'returns', 'care'] as const;
type InfoPage = (typeof PAGES)[number];

function isInfoPage(v: string | undefined): v is InfoPage {
  return PAGES.includes(v as InfoPage);
}

export function Info() {
  const { t } = useI18n();
  const { page } = useParams();
  if (!isInfoPage(page)) return <NotFound />;

  const k = (suffix: string) => t(`info.${page}.${suffix}` as Key);
  return (
    <div className="wrap page prose info-narrow">
      <h1>{k('t')}</h1>
      <h2>{k('h1')}</h2>
      <p>{k('p1')}</p>
      <h2>{k('h2')}</h2>
      <p>{k('p2')}</p>
      <h2>{k('h3')}</h2>
      <p>{k('p3')}</p>
      <Link className="btn" to="/contact">{t('footer.contact')}</Link>
    </div>
  );
}
