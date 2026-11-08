import { describe, expect, it } from 'vitest';
import { moveThumb, toLimits } from './range';

const b = { min: 100, max: 1000 };
describe('price range', () => {
  it('clamps to bounds and never crosses the other thumb', () => {
    expect(moveThumb(100, 500, 'min', 700, b)).toEqual([500, 500]);
    expect(moveThumb(300, 1000, 'max', 200, b)).toEqual([300, 300]);
    expect(moveThumb(100, 1000, 'min', -5, b)).toEqual([100, 1000]);
    expect(moveThumb(100, 1000, 'max', 5000, b)).toEqual([100, 1000]);
  });
  it('treats thumbs at the bounds as unlimited', () => {
    expect(toLimits(100, 1000, b)).toEqual({ min: undefined, max: undefined });
    expect(toLimits(200, 900, b)).toEqual({ min: 200, max: 900 });
  });
});
