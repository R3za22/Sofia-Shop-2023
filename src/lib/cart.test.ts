import { describe, expect, it } from 'vitest';
import { addLine, countItems, MAX_QTY, removeLine, setLineQty } from './cart';

describe('cart', () => {
  it('adds a new line and merges the same product and colour', () => {
    let l = addLine([], 'p1', 'indigo', 1, 5);
    l = addLine(l, 'p1', 'indigo', 2, 5);
    expect(l).toEqual([{ productId: 'p1', color: 'indigo', qty: 3 }]);
  });

  it('keeps different colours as separate lines', () => {
    let l = addLine([], 'p1', 'indigo', 1, 5);
    l = addLine(l, 'p1', 'sage', 1, 5);
    expect(l).toHaveLength(2);
    expect(countItems(l)).toBe(2);
  });

  it('clamps to stock and to the per-line maximum', () => {
    expect(addLine([], 'p1', 'oat', 9, 3)[0].qty).toBe(3);
    expect(addLine([], 'p1', 'oat', 50, 99)[0].qty).toBe(MAX_QTY);
    expect(addLine([{ productId: 'p1', color: 'oat', qty: 3 }], 'p1', 'oat', 1, 3)[0].qty).toBe(3);
  });

  it('ignores sold-out products and non-positive quantities', () => {
    expect(addLine([], 'p1', 'oat', 1, 0)).toEqual([]);
    expect(addLine([], 'p1', 'oat', 0, 5)).toEqual([]);
  });

  it('sets an exact quantity, removing the line at zero', () => {
    const base = [{ productId: 'p1', color: 'oat' as const, qty: 2 }];
    expect(setLineQty(base, 'p1', 'oat', 4, 9)[0].qty).toBe(4);
    expect(setLineQty(base, 'p1', 'oat', 0, 9)).toEqual([]);
    expect(setLineQty(base, 'p1', 'oat', 7, 5)[0].qty).toBe(5);
  });

  it('treats sizes as separate lines', () => {
    let l = addLine([], 'p1', 'oat', 1, 5, 'two');
    l = addLine(l, 'p1', 'oat', 1, 5, 'three');
    l = addLine(l, 'p1', 'oat', 1, 5, 'two');
    expect(l).toEqual([{ productId: 'p1', color: 'oat', size: 'two', qty: 2 }, { productId: 'p1', color: 'oat', size: 'three', qty: 1 }]);
    expect(setLineQty(l, 'p1', 'oat', 4, 9, 'three')[1].qty).toBe(4);
    expect(removeLine(l, 'p1', 'oat', 'two')).toHaveLength(1);
  });

  it('removes only the matching line', () => {
    const base = [
      { productId: 'p1', color: 'oat' as const, qty: 1 },
      { productId: 'p2', color: 'oat' as const, qty: 1 },
    ];
    expect(removeLine(base, 'p1', 'oat')).toEqual([base[1]]);
  });
});
