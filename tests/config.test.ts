import { describe, expect, it } from 'vitest';
import { defaultFilters } from '../shared/config';
import type { Filter } from '../shared/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const backdropFilters = defaultFilters.filter((f) => !f.peek);
const peekFilters = defaultFilters.filter((f) => f.peek);

function getFilter(name: string): Filter {
  const f = defaultFilters.find((f) => f.name === name);
  if (!f) throw new Error(`Filter '${name}' not found in defaultFilters`);
  return f;
}

// ---------------------------------------------------------------------------
// Filter completeness
// ---------------------------------------------------------------------------

describe('defaultFilters completeness', () => {
  it('contains blur, greyscale, hue-rotate, reveal, and letterbox', () => {
    const names = defaultFilters.map((f) => f.name);
    expect(names).toContain('blur');
    expect(names).toContain('greyscale');
    expect(names).toContain('hue-rotate');
    expect(names).toContain('reveal');
    expect(names).toContain('letterbox');
  });

  it('every non-peek filter has a filterString', () => {
    backdropFilters.forEach((f) => {
      expect(f.filterString, `${f.name} is missing filterString`).toBeTruthy();
    });
  });

  it('peek filters do not need a filterString (they use clip-path / transitions)', () => {
    // Just documents the distinction — no assertion needed beyond type check
    peekFilters.forEach((f) => {
      expect(f.peek).toBe(true);
    });
  });

  it('every filter has an enabled checkbox option', () => {
    defaultFilters.forEach((f) => {
      expect(f.options.enabled, `${f.name} missing enabled option`).toBeDefined();
      expect(f.options.enabled.type).toBe('checkbox');
    });
  });
});

// ---------------------------------------------------------------------------
// blur
// ---------------------------------------------------------------------------

describe('blur filter config', () => {
  it('has filterString', () => {
    expect(getFilter('blur').filterString).toBeTruthy();
  });

  it('filterString contains the word "blur"', () => {
    expect(getFilter('blur').filterString).toMatch(/blur/);
  });

  it('has a radius range option', () => {
    const opt = getFilter('blur').options.radius;
    expect(opt).toBeDefined();
    expect(opt.type).toBe('range');
  });

  it('radius has unit px', () => {
    expect(getFilter('blur').options.radius.unit).toBe('px');
  });

  it('radius default value is within [min, max]', () => {
    const opt = getFilter('blur').options.radius;
    expect(opt.value as number).toBeGreaterThanOrEqual(opt.min!);
    expect(opt.value as number).toBeLessThanOrEqual(opt.max!);
  });

  it('radius min is 0', () => {
    expect(getFilter('blur').options.radius.min).toBe(0);
  });

  it('radius max is at least 20', () => {
    expect(getFilter('blur').options.radius.max).toBeGreaterThanOrEqual(20);
  });
});

// ---------------------------------------------------------------------------
// greyscale
// ---------------------------------------------------------------------------

describe('greyscale filter config', () => {
  it('has filterString', () => {
    expect(getFilter('greyscale').filterString).toBeTruthy();
  });

  it('filterString contains "grayscale"', () => {
    expect(getFilter('greyscale').filterString).toMatch(/grayscale/);
  });

  it('has a percent range option', () => {
    const opt = getFilter('greyscale').options.percent;
    expect(opt).toBeDefined();
    expect(opt.type).toBe('range');
  });

  it('percent has unit %', () => {
    expect(getFilter('greyscale').options.percent.unit).toBe('%');
  });

  it('percent default value is within [min, max]', () => {
    const opt = getFilter('greyscale').options.percent;
    expect(opt.value as number).toBeGreaterThanOrEqual(opt.min!);
    expect(opt.value as number).toBeLessThanOrEqual(opt.max!);
  });

  it('percent min is 0 and max is 100', () => {
    const opt = getFilter('greyscale').options.percent;
    expect(opt.min).toBe(0);
    expect(opt.max).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// hue-rotate
// ---------------------------------------------------------------------------

describe('hue-rotate filter config', () => {
  it('has filterString', () => {
    expect(getFilter('hue-rotate').filterString).toBeTruthy();
  });

  it('filterString contains "hue-rotate"', () => {
    expect(getFilter('hue-rotate').filterString).toMatch(/hue-rotate/);
  });

  it('has a deg range option', () => {
    const opt = getFilter('hue-rotate').options.deg;
    expect(opt).toBeDefined();
    expect(opt.type).toBe('range');
  });

  it('deg has unit deg', () => {
    expect(getFilter('hue-rotate').options.deg.unit).toBe('deg');
  });

  it('deg default value is within [min, max]', () => {
    const opt = getFilter('hue-rotate').options.deg;
    expect(opt.value as number).toBeGreaterThanOrEqual(opt.min!);
    expect(opt.value as number).toBeLessThanOrEqual(opt.max!);
  });

  it('deg min is 0 and max is 360', () => {
    const opt = getFilter('hue-rotate').options.deg;
    expect(opt.min).toBe(0);
    expect(opt.max).toBe(360);
  });
});

// ---------------------------------------------------------------------------
// letterbox
// ---------------------------------------------------------------------------

describe('letterbox filter config', () => {
  it('is a peek filter', () => {
    expect(getFilter('letterbox').peek).toBe(true);
  });

  it('has a width range option', () => {
    const opt = getFilter('letterbox').options.width;
    expect(opt).toBeDefined();
    expect(opt.type).toBe('range');
  });

  it('has a height range option', () => {
    const opt = getFilter('letterbox').options.height;
    expect(opt).toBeDefined();
    expect(opt.type).toBe('range');
  });

  it('width has unit %', () => {
    expect(getFilter('letterbox').options.width.unit).toBe('%');
  });

  it('height has unit %', () => {
    expect(getFilter('letterbox').options.height.unit).toBe('%');
  });

  it('width and height defaults are within [min, max]', () => {
    for (const key of ['width', 'height'] as const) {
      const opt = getFilter('letterbox').options[key];
      expect(opt.value as number).toBeGreaterThanOrEqual(opt.min!);
      expect(opt.value as number).toBeLessThanOrEqual(opt.max!);
    }
  });

  it('width and height min is 0', () => {
    expect(getFilter('letterbox').options.width.min).toBe(0);
    expect(getFilter('letterbox').options.height.min).toBe(0);
  });
});
