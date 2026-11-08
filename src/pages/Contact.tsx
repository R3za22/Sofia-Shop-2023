import { useRef, useState, type FormEvent } from 'react';
import { api } from '../api';
import { ApiError } from '../api/types';
import { useI18n, type Key } from '../i18n';
import { validateContact, type ContactErrors } from '../lib/validate';
import type { ContactReceipt } from '../types';
import './info.css';

type FieldName = keyof ContactErrors;
const ORDER: FieldName[] = ['name', 'contact', 'message'];

const EMPTY = { name: '', contact: '', message: '' };

export function Contact() {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [receipt, setReceipt] = useState<ContactReceipt | null>(null);
  const [sentName, setSentName] = useState('');

  function focusFirst(e: ContactErrors) {
    const first = ORDER.find((k) => e[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFailed(false);
    const local = validateContact(values);
    setErrors(local);
    if (Object.keys(local).length) {
      focusFirst(local);
      return;
    }
    const input = { name: values.name.trim(), contact: values.contact.trim(), message: values.message.trim() };
    setSending(true);
    try {
      const r = await api.sendContact(input);
      setSentName(input.name.split(/\s+/)[0]);
      setReceipt(r);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'validation' && e.fields) {
        const fe = e.fields as ContactErrors;
        setErrors(fe);
        focusFirst(fe);
      } else {
        setFailed(true);
      }
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setFailed(false);
    setReceipt(null);
  }

  const set = (f: FieldName) => (ev: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [f]: ev.target.value }));
  const field = (f: FieldName) => ({
    name: f,
    id: `f-${f}`,
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby': errors[f] ? `e-${f}` : undefined,
  });
  const msg = (f: FieldName) =>
    errors[f] && <span id={`e-${f}`} className="field__err">{t(`ct.err.${errors[f]}` as Key)}</span>;

  return (
    <div className="wrap page prose info-narrow">
      <h1>{t('ct.title')}</h1>
      <p>{t('ct.lead')}</p>
      <p className="muted small">{t('ct.hours')}</p>

      {receipt ? (
        <section className="panel" role="status">
          <h2>{t('ct.ok.t')}</h2>
          <p>{t('ct.ok.d', { n: sentName, id: receipt.id })}</p>
          <button className="btn" type="button" onClick={reset}>{t('ct.another')}</button>
        </section>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <label className="field field--wide" htmlFor="f-name"><span>{t('ct.name')}</span>
              <input {...field('name')} autoComplete="name" value={values.name} onChange={set('name')} />{msg('name')}</label>
            <label className="field field--wide" htmlFor="f-contact"><span>{t('ct.contact')}</span>
              <input {...field('contact')} type="text" dir="ltr" autoComplete="email" value={values.contact} onChange={set('contact')} />{msg('contact')}</label>
            <label className="field field--wide" htmlFor="f-message"><span>{t('ct.message')}</span>
              <textarea {...field('message')} rows={5} value={values.message} onChange={set('message')} />{msg('message')}</label>
          </div>
          {failed && <p className="msg msg--err" role="alert">{t('ct.failed')}</p>}
          <button className="btn" type="submit" disabled={sending}>
            {sending ? t('ct.sending') : t('ct.send')}
          </button>
        </form>
      )}
    </div>
  );
}
