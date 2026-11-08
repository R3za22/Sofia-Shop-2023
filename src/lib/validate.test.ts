import { describe, expect, it } from 'vitest';
import { luhn, validateCheckout, validateContact, validExpiry } from './validate';
import type { CheckoutInput } from '../types';

const now = new Date('2026-11-08T00:00:00Z');
const ok: CheckoutInput = {
  name: 'Sara Karimi',
  phone: '09121234567',
  city: 'ahvaz',
  postal: '6135712345',
  address: 'Kianpars, Street 5, No. 12',
  method: 'home',
  card: { number: '4242 4242 4242 4242', expiry: '12/29', cvv: '123' },
};

describe('validation', () => {
  it('accepts a complete valid order', () => {
    expect(validateCheckout(ok, now)).toEqual({});
  });

  it('accepts Persian digits', () => {
    const fa = { ...ok, phone: '۰۹۱۲۱۲۳۴۵۶۷', postal: '۶۱۳۵۷۱۲۳۴۵', card: { number: '۴۲۴۲ ۴۲۴۲ ۴۲۴۲ ۴۲۴۲', expiry: '۱۲/۲۹', cvv: '۱۲۳' } };
    expect(validateCheckout(fa, now)).toEqual({});
  });

  it('flags each bad field', () => {
    const e = validateCheckout(
      { ...ok, name: '', phone: '123', postal: '61357', address: 'short', card: { number: '4242 4242 4242 4243', expiry: '01/20', cvv: '1' } },
      now,
    );
    expect(e).toEqual({ name: 'required', phone: 'phone', postal: 'postal', address: 'address', card: 'card', expiry: 'expiry', cvv: 'cvv' });
  });

  it('does not require an address for showroom pickup', () => {
    expect(validateCheckout({ ...ok, method: 'pickup', postal: '', address: '' }, now)).toEqual({});
  });

  it('checks Luhn and expiry boundaries', () => {
    expect(luhn('4242424242424242')).toBe(true);
    expect(luhn('4000000000000002')).toBe(true);
    expect(luhn('4242424242424241')).toBe(false);
    expect(validExpiry('11/26', now)).toBe(true);
    expect(validExpiry('10/26', now)).toBe(false);
    expect(validExpiry('13/30', now)).toBe(false);
  });
});

describe('contact validation', () => {
  it('accepts an email or a mobile number', () => {
    expect(validateContact({ name: 'Sara', contact: 'sara@example.com', message: 'Is the Alma sofa in stock?' })).toEqual({});
    expect(validateContact({ name: 'Sara', contact: '۰۹۱۲۱۲۳۴۵۶۷', message: 'Is the Alma sofa in stock?' })).toEqual({});
  });
  it('flags missing and malformed fields', () => {
    expect(validateContact({ name: '', contact: '', message: '' })).toEqual({ name: 'required', contact: 'required', message: 'required' });
    expect(validateContact({ name: 'Sara', contact: 'nope', message: 'short' })).toEqual({ contact: 'contact', message: 'message' });
  });
});
