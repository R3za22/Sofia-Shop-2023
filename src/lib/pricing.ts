import type { City, DeliveryMethod, Quote } from '../types';

export const CITIES: City[] = ['ahvaz', 'shiraz', 'tehran'];

/** Flat home-delivery fee in Toman. Free inside Ahvaz; showroom pickup is always free. */
export const DELIVERY_FEE: Record<City, number> = { ahvaz: 0, shiraz: 650_000, tehran: 850_000 };

type CodeRule =
  | { type: 'percent'; value: number; minSubtotal?: number }
  | { type: 'fixed'; value: number; minSubtotal?: number };

export const DISCOUNT_CODES: Record<string, CodeRule> = {
  SOFIA10: { type: 'percent', value: 10 },
  NOWRUZ: { type: 'fixed', value: 500_000, minSubtotal: 5_000_000 },
};

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function deliveryFee(city: City, method: DeliveryMethod): number {
  return method === 'pickup' ? 0 : DELIVERY_FEE[city];
}

export function discountFor(code: string, subtotal: number): { discount: number; error?: Quote['codeError'] } {
  const key = normalizeCode(code);
  if (!key) return { discount: 0 };
  const rule = DISCOUNT_CODES[key];
  if (!rule) return { discount: 0, error: 'invalid' };
  if (rule.minSubtotal !== undefined && subtotal < rule.minSubtotal) return { discount: 0, error: 'min_subtotal' };
  const raw = rule.type === 'percent' ? Math.floor((subtotal * rule.value) / 100) : rule.value;
  return { discount: Math.min(raw, subtotal) };
}

export function quote(
  items: { price: number; qty: number }[],
  city: City,
  method: DeliveryMethod,
  code = '',
): Quote {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const { discount, error } = discountFor(code, subtotal);
  const delivery = items.length === 0 ? 0 : deliveryFee(city, method);
  const result: Quote = { subtotal, discount, delivery, total: subtotal - discount + delivery };
  if (error) result.codeError = error;
  return result;
}

/** Unit price for a product at a size (falls back to the base price). */
export function unitPrice(product: { price: number; sizes?: { id: string; price: number }[] }, size?: string): number {
  return product.sizes?.find((s) => s.id === size)?.price ?? product.price;
}
