import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function About() {
  const { t } = useI18n();
  return (
    <div className="wrap page prose">
      <h1>{t('about.title')}</h1>
      <p>{t('about.p1')}</p>
      <h2>{t('about.h.delivery')}</h2>
      <p>{t('about.p2')}</p>
      <h2>{t('about.h.privacy')}</h2>
      <p>{t('about.p3')}</p>
      <h2>{t('about.h.art')}</h2>
      <p>{t('about.p4')}</p>
      <Link className="btn" to="/products">{t('err.home')}</Link>
    </div>
  );
}
