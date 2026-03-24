import { describe, expect, it } from 'vitest';
import { defaultFilters, defaultSelectors } from '../shared/config';
import {
  defaultFilterStates,
  mergeFilterStates,
  mergeSelectorStates,
  selectorStateFromStorage,
  stateToStorage,
} from '../shared/state';
import type { FilterState, SelectorState } from '../shared/types';

// ---------------------------------------------------------------------------
// defaultFilterStates
// ---------------------------------------------------------------------------

describe('defaultFilterStates', () => {
  it('returns an entry for every filter', () => {
    const states = defaultFilterStates(defaultFilters);
    defaultFilters.forEach((f) => {
      expect(states).toHaveProperty(f.name);
    });
  });

  it('each state has an enabled key matching the config default', () => {
    const states = defaultFilterStates(defaultFilters);
    defaultFilters.forEach((f) => {
      expect(states[f.name].enabled).toBe(f.options.enabled.value);
    });
  });

  it('each state includes all non-enabled option values', () => {
    const states = defaultFilterStates(defaultFilters);
    const blur = states['blur'];
    expect(blur.radius).toBe(20);
  });

  it('blur default state has enabled=false and radius=20', () => {
    const states = defaultFilterStates(defaultFilters);
    expect(states['blur'].enabled).toBe(false);
    expect(states['blur'].radius).toBe(20);
  });

  it('greyscale default state has enabled=false and percent=100', () => {
    const states = defaultFilterStates(defaultFilters);
    expect(states['greyscale'].enabled).toBe(false);
    expect(states['greyscale'].percent).toBe(100);
  });

  it('hue-rotate default state has enabled=false and deg=90', () => {
    const states = defaultFilterStates(defaultFilters);
    expect(states['hue-rotate'].enabled).toBe(false);
    expect(states['hue-rotate'].deg).toBe(90);
  });

  it('letterbox default state has enabled=true and width=5, height=5', () => {
    const states = defaultFilterStates(defaultFilters);
    expect(states['letterbox'].enabled).toBe(true);
    expect(states['letterbox'].width).toBe(5);
    expect(states['letterbox'].height).toBe(5);
  });

  it('does not include filter metadata (filterString, description, type, unit, min, max)', () => {
    const states = defaultFilterStates(defaultFilters);
    const blur = states['blur'] as Record<string, unknown>;
    expect(blur).not.toHaveProperty('filterString');
    expect(blur).not.toHaveProperty('description');
    expect(blur).not.toHaveProperty('type');
    expect(blur).not.toHaveProperty('unit');
    expect(blur).not.toHaveProperty('min');
    expect(blur).not.toHaveProperty('max');
  });

  it('returns a fresh object each call — not shared references', () => {
    const a = defaultFilterStates(defaultFilters);
    const b = defaultFilterStates(defaultFilters);
    a['blur'].enabled = true;
    expect(b['blur'].enabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mergeFilterStates
// ---------------------------------------------------------------------------

describe('mergeFilterStates', () => {
  it('uses stored value when present', () => {
    const stored: Record<string, FilterState> = {
      blur: { enabled: true, radius: 10 },
    };
    const merged = mergeFilterStates(defaultFilters, stored);
    expect(merged['blur'].enabled).toBe(true);
    expect(merged['blur'].radius).toBe(10);
  });

  it('falls back to default when filter is missing from storage', () => {
    const stored: Record<string, FilterState> = {};
    const merged = mergeFilterStates(defaultFilters, stored);
    expect(merged['blur'].enabled).toBe(false);
    expect(merged['blur'].radius).toBe(20);
  });

  it('falls back to default for missing options on a stored filter', () => {
    // Simulates adding a new option to an existing filter — migration is automatic
    const stored: Record<string, FilterState> = {
      blur: { enabled: true }, // radius missing — new option added after user stored
    };
    const merged = mergeFilterStates(defaultFilters, stored);
    expect(merged['blur'].enabled).toBe(true);
    expect(merged['blur'].radius).toBe(20); // default
  });

  it('returns entries for all filters, even those absent from storage', () => {
    const stored: Record<string, FilterState> = {
      blur: { enabled: true, radius: 5 },
    };
    const merged = mergeFilterStates(defaultFilters, stored);
    defaultFilters.forEach((f) => {
      expect(merged).toHaveProperty(f.name);
    });
  });

  it('does not mutate stored state', () => {
    const stored: Record<string, FilterState> = {
      blur: { enabled: false, radius: 10 },
    };
    mergeFilterStates(defaultFilters, stored);
    expect(stored['blur'].radius).toBe(10);
  });

  it('stored value takes precedence over default for every option', () => {
    const stored: Record<string, FilterState> = {
      greyscale: { enabled: true, percent: 50 },
      'hue-rotate': { enabled: true, deg: 180 },
      letterbox: { enabled: false, width: 20, height: 10 },
    };
    const merged = mergeFilterStates(defaultFilters, stored);
    expect(merged['greyscale'].percent).toBe(50);
    expect(merged['hue-rotate'].deg).toBe(180);
    expect(merged['letterbox'].width).toBe(20);
    expect(merged['letterbox'].height).toBe(10);
    expect(merged['letterbox'].enabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// selectorStateFromStorage / stateToStorage (round-trip)
// ---------------------------------------------------------------------------

describe('stateToStorage and selectorStateFromStorage', () => {
  it('stateToStorage produces SelectorState with only name and filterStates', () => {
    const states = defaultFilterStates(defaultFilters);
    const stored = stateToStorage('Images', states);
    expect(stored).toEqual({
      name: 'Images',
      filterStates: states,
    });
    // Must not include selector, url, filter metadata
    expect(stored).not.toHaveProperty('selector');
    expect(stored).not.toHaveProperty('url');
    expect(stored).not.toHaveProperty('filters');
  });

  it('selectorStateFromStorage merges stored state with config defaults', () => {
    const partial: SelectorState = {
      name: 'Images',
      filterStates: {
        blur: { enabled: true, radius: 7 },
      },
    };
    const merged = selectorStateFromStorage(partial, defaultFilters);
    // Stored value respected
    expect(merged['blur'].radius).toBe(7);
    // Missing filter gets default
    expect(merged['greyscale'].enabled).toBe(false);
    expect(merged['greyscale'].percent).toBe(100);
  });

  it('round-trip: store then load returns same values', () => {
    const states = defaultFilterStates(defaultFilters);
    states['blur'].enabled = true;
    states['blur'].radius = 15;

    const stored = stateToStorage('Images', states);
    const loaded = selectorStateFromStorage(stored, defaultFilters);

    expect(loaded['blur'].enabled).toBe(true);
    expect(loaded['blur'].radius).toBe(15);
  });

  it('round-trip preserves all filter states', () => {
    const states = defaultFilterStates(defaultFilters);
    states['greyscale'].enabled = true;
    states['greyscale'].percent = 75;
    states['hue-rotate'].deg = 270;

    const stored = stateToStorage('Images', states);
    const loaded = selectorStateFromStorage(stored, defaultFilters);

    expect(loaded['greyscale'].percent).toBe(75);
    expect(loaded['hue-rotate'].deg).toBe(270);
  });
});

// ---------------------------------------------------------------------------
// Type safety — FilterState index signature
// ---------------------------------------------------------------------------

describe('FilterState type constraints', () => {
  it('enabled is always boolean', () => {
    const states = defaultFilterStates(defaultFilters);
    Object.values(states).forEach((state) => {
      expect(typeof state.enabled).toBe('boolean');
    });
  });

  it('all option values are boolean or number', () => {
    const states = defaultFilterStates(defaultFilters);
    Object.values(states).forEach((state) => {
      Object.values(state).forEach((val) => {
        expect(['boolean', 'number']).toContain(typeof val);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// mergeSelectorStates
// ---------------------------------------------------------------------------

describe('mergeSelectorStates', () => {
  it('returns stored selectors unchanged when all default selectors are present', () => {
    const stored: SelectorState[] = [
      { name: 'Images', filterStates: { blur: { enabled: true, radius: 10 } } },
    ];
    const result = mergeSelectorStates(stored, defaultFilters);
    expect(result).toHaveLength(1);
    expect(result[0].filterStates['blur'].radius).toBe(10);
  });

  it('appends a new default selector missing from storage', () => {
    const stored: SelectorState[] = [
      { name: 'Images', filterStates: {} },
    ];
    // Simulate a second selector having been added to defaultSelectors
    const extendedSelectors = [
      ...defaultSelectors,
      { name: 'Videos', selector: 'video', url: '*' },
    ];
    const result = mergeSelectorStates(stored, defaultFilters, extendedSelectors);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name)).toContain('Videos');
  });

  it('new selector gets full default filter states', () => {
    const stored: SelectorState[] = [
      { name: 'Images', filterStates: {} },
    ];
    const extendedSelectors = [
      ...defaultSelectors,
      { name: 'Videos', selector: 'video', url: '*' },
    ];
    const result = mergeSelectorStates(stored, defaultFilters, extendedSelectors);
    const videos = result.find((s) => s.name === 'Videos')!;
    expect(videos.filterStates['blur'].enabled).toBe(false);
    expect(videos.filterStates['blur'].radius).toBe(20);
    expect(videos.filterStates['letterbox'].enabled).toBe(true);
  });

  it('preserves existing selector state while adding new selectors', () => {
    const stored: SelectorState[] = [
      { name: 'Images', filterStates: { blur: { enabled: true, radius: 7 } } },
    ];
    const extendedSelectors = [
      ...defaultSelectors,
      { name: 'Videos', selector: 'video', url: '*' },
    ];
    const result = mergeSelectorStates(stored, defaultFilters, extendedSelectors);
    const images = result.find((s) => s.name === 'Images')!;
    expect(images.filterStates['blur'].radius).toBe(7);
  });

  it('does not duplicate selectors already in storage', () => {
    const stored: SelectorState[] = [
      { name: 'Images', filterStates: {} },
    ];
    const result = mergeSelectorStates(stored, defaultFilters);
    expect(result.filter((s) => s.name === 'Images')).toHaveLength(1);
  });

  it('returns empty array when both stored and defaultSelectors are empty', () => {
    const result = mergeSelectorStates([], defaultFilters, []);
    expect(result).toHaveLength(0);
  });

  it('initialises all default selectors when storage is empty', () => {
    const result = mergeSelectorStates([], defaultFilters);
    expect(result).toHaveLength(defaultSelectors.length);
    expect(result[0].name).toBe('Images');
  });

  it('new selector filter states are merged (new options get defaults)', () => {
    // If a new selector is added AND a filter has a new option, both should get defaults
    const stored: SelectorState[] = [];
    const result = mergeSelectorStates(stored, defaultFilters);
    const images = result.find((s) => s.name === 'Images')!;
    expect(images.filterStates['greyscale'].percent).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Integration with defaultSelectors
// ---------------------------------------------------------------------------

describe('integration with defaultSelectors config', () => {
  it('defaultSelectors has one selector named Images', () => {
    expect(defaultSelectors).toHaveLength(1);
    expect(defaultSelectors[0].name).toBe('Images');
  });

  it('can produce SelectorState for every default selector', () => {
    const states = defaultFilterStates(defaultFilters);
    const selectorStates = defaultSelectors.map((s) => stateToStorage(s.name, states));
    expect(selectorStates).toHaveLength(1);
    expect(selectorStates[0].name).toBe('Images');
    expect(selectorStates[0].filterStates).toHaveProperty('blur');
  });
});
