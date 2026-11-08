import type { CheckoutInput } from '../types';
import { normalizeDigits } from './digits';
import { CITIES } from './pricing';

export type FieldError = 'required' | 'phone' | 'postal' | 'address' | 'card' | 'expiry' | 'cvv';
export type Errors = Partial<Record<'name' | 'phone' | 'city' | 'postal' | 'address' | 'card' | 'expiry' | 'cvv', FieldError>>;

export function digitsOnly(s: string): string {
  return normalizeDigits(s).replace(/\D/g, '');
}

export function luhn(num: string): boolean {
  if (!/^\d{13,19}$/.test(num)) return false;
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function validPhone(p: string): boolean {
  return /^09\d{9}$/.test(digitsOnly(p));
}

export function validPostal(p: string): boolean {
  return /^\d{10}$/.test(digitsOnly(p));
}

/** Expiry as MM/YY; valid through the last day of that month. */
export function validExpiry(value: string, now: Date = new Date()): boolean {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(normalizeDigits(value).trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export function validateCheckout(input: CheckoutInput, now: Date = new Date()): Errors {
  const e: Errors = {};
  if (input.name.trim().length < 2) e.name = 'required';
  if (!input.phone.trim()) e.phone = 'required';
  else if (!validPhone(input.phone)) e.phone = 'phone';
  if (!CITIES.includes(input.city)) e.city = 'required';
  if (input.method === 'home') {
    if (!input.postal.trim()) e.postal = 'required';
    else if (!validPostal(input.postal)) e.postal = 'postal';
    if (!input.address.trim()) e.address = 'required';
    else if (input.address.trim().length < 10) e.address = 'address';
  }
  const num = digitsOnly(input.card.number);
  if (!num) e.card = 'required';
  else if (!luhn(num)) e.card = 'card';
  if (!input.card.expiry.trim()) e.expiry = 'required';
  else if (!validExpiry(input.card.expiry, now)) e.expiry = 'expiry';
  if (!input.card.cvv.trim()) e.cvv = 'required';
  else if (!/^\d{3,4}$/.test(digitsOnly(input.card.cvv))) e.cvv = 'cvv';
  return e;
}
