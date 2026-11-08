import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/types';
import { useI18n, type Key } from '../i18n';
import { useUser } from '../userContext';

export function SignIn({ notice }: { notice?: boolean }) {
  const { t } = useI18n();
  const { signIn } = useUser();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setWrong(false);
    setBusy(true);
    try {
      await signIn(email, password);
      setErrors({});
      navigate('/account');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'validation' && err.fields) setErrors(err.fields);
      else if (err instanceof ApiError && err.code === 'unauthorized') setWrong(true);
      else setErrors({});
    } finally {
      setBusy(false);
    }
  }
  const msg = (f: string) => errors[f] && <span id={`e-${f}`} className="field__err">{t(`si.err.${errors[f]}` as Key)}</span>;
  const inv = (f: string) => ({ 'aria-invalid': errors[f] ? true : undefined, 'aria-describedby': errors[f] ? `e-${f}` : undefined });

  return (
    <div className="wrap page narrow">
      <h1>{t('si.title')}</h1>
      {sp.get('out') && <p className="msg" role="status">{t('si.out')}</p>}
      {notice && <p className="msg" role="status">{t('si.needed')}</p>}
      <p className="muted">{t('si.lead')}</p>
      <form className="panel form-stack" onSubmit={onSubmit} noValidate>
        <label className="field" htmlFor="si-email"><span>{t('si.email')}</span>
          <input id="si-email" name="email" type="email" autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} {...inv('email')} />{msg('email')}</label>
        <label className="field" htmlFor="si-password"><span>{t('si.password')}</span>
          <input id="si-password" name="password" type="password" autoComplete="current-password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} {...inv('password')} />{msg('password')}</label>
        {wrong && <p className="msg msg--err" role="alert">{t('si.err.wrong')}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? t('si.submitting') : t('si.submit')}</button>
      </form>
    </div>
  );
}
