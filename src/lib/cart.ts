import type { CartLine, ColorId } from '../types';

export const MAX_QTY = 10;

const same = (a: CartLine, productId: string, color: ColorId) => a.productId === productId && a.color === color;

/** Add qty of a product/colour. Quantity is clamped to min(stock, MAX_QTY). */
export function addLine(lines: CartLine[], productId: string, color: ColorId, qty: number, stock: number): CartLine[] {
  const limit = Math.min(stock, MAX_QTY);
  if (limit <= 0 || qty <= 0) return lines;
  const existing = lines.find((l) => same(l, productId, color));
  if (!existing) return [...lines, { productId, color, qty: Math.min(qty, limit) }];
  return lines.map((l) => (l === existing ? { ...l, qty: Math.min(l.qty + qty, limit) } : l));
}

/** Set an exact quantity; 0 or less removes the line. */
export function setLineQty(lines: CartLine[], productId: string, color: ColorId, qty: number, stock: number): CartLine[] {
  if (qty <= 0) return removeLine(lines, productId, color);
  const q = Math.min(Math.floor(qty), stock, MAX_QTY);
  if (q <= 0) return removeLine(lines, productId, color);
  return lines.map((l) => (same(l, productId, color) ? { ...l, qty: q } : l));
}

export function removeLine(lines: CartLine[], productId: string, color: ColorId): CartLine[] {
  return lines.filter((l) => !same(l, productId, color));
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}
