import type { CartLine, ColorId } from '../types';

export const MAX_QTY = 10;

const same = (a: CartLine, productId: string, color: ColorId, size?: string) =>
  a.productId === productId && a.color === color && a.size === size;

/** Add qty of a product/colour/size. Quantity is clamped to min(stock, MAX_QTY). */
export function addLine(lines: CartLine[], productId: string, color: ColorId, qty: number, stock: number, size?: string): CartLine[] {
  const limit = Math.min(stock, MAX_QTY);
  if (limit <= 0 || qty <= 0) return lines;
  const existing = lines.find((l) => same(l, productId, color, size));
  if (!existing) return [...lines, size ? { productId, color, size, qty: Math.min(qty, limit) } : { productId, color, qty: Math.min(qty, limit) }];
  return lines.map((l) => (l === existing ? { ...l, qty: Math.min(l.qty + qty, limit) } : l));
}

/** Set an exact quantity; 0 or less removes the line. */
export function setLineQty(lines: CartLine[], productId: string, color: ColorId, qty: number, stock: number, size?: string): CartLine[] {
  if (qty <= 0) return removeLine(lines, productId, color, size);
  const q = Math.min(Math.floor(qty), stock, MAX_QTY);
  if (q <= 0) return removeLine(lines, productId, color, size);
  return lines.map((l) => (same(l, productId, color, size) ? { ...l, qty: q } : l));
}

export function removeLine(lines: CartLine[], productId: string, color: ColorId, size?: string): CartLine[] {
  return lines.filter((l) => !same(l, productId, color, size));
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}
