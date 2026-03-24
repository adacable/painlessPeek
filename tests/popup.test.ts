import { describe, expect, it } from 'vitest';
import type { Filter, Selector } from '../shared/types';

const defaultFilters: Filter[] = [
  {
    name: 'greyscale',
    description: 'Make the image black and white',
    peek: false,
    options: { enabled: { value: false, type: 'checkbox' } },
  },
  {
    name: 'letterbox',
    description: 'Reveal a small rectangle of the image on hover',
    peek: true,
    options: { enabled: { value: true, type: 'checkbox' } },
  },
  {
    name: 'blur',
    description: 'Blur the image',
    peek: false,
    options: { enabled: { value: false, type: 'checkbox' } },
  },
];

function makeDefaultSelectors(): Selector[] {
  return [{ name: 'Images', selector: 'img', url: '*', filters: [] }];
}

function initialiseSelectors(selectors: Selector[], filters: Filter[]): Selector[] {
  selectors.forEach((s) => { s.filters = filters; });
  chrome.storage.sync.set({ selectors });
  return selectors;
}

function resetSelectors(): Selector[] {
  return initialiseSelectors(makeDefaultSelectors(), defaultFilters);
}

function checkSelsLoaded(result: { selectors?: Selector[] }): Selector[] {
  if (!result.selectors) return resetSelectors();
  return result.selectors;
}

describe('checkSelsLoaded', () => {
  it('returns stored selectors when present', () => {
    const stored: Selector[] = [
      { name: 'Images', selector: 'img', url: '*', filters: defaultFilters },
    ];
    expect(checkSelsLoaded({ selectors: stored })).toBe(stored);
  });

  it('resets and returns defaults when storage is empty', () => {
    const result = checkSelsLoaded({});
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Images');
    expect(result[0].filters).toEqual(defaultFilters);
  });

  it('writes defaults to storage when resetting', async () => {
    checkSelsLoaded({});
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      selectors: expect.arrayContaining([
        expect.objectContaining({ name: 'Images', filters: defaultFilters }),
      ]),
    });
  });
});

describe('initialiseSelectors', () => {
  it('assigns filters to every selector', () => {
    const selectors = makeDefaultSelectors();
    initialiseSelectors(selectors, defaultFilters);
    expect(selectors[0].filters).toBe(defaultFilters);
  });

  it('persists to storage', () => {
    const selectors = makeDefaultSelectors();
    initialiseSelectors(selectors, defaultFilters);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ selectors });
  });

  it('returns the selectors', () => {
    const selectors = makeDefaultSelectors();
    expect(initialiseSelectors(selectors, defaultFilters)).toBe(selectors);
  });
});

describe('peek vs cosmetic filter split', () => {
  it('correctly identifies peek filters', () => {
    const peeks = defaultFilters.filter((f) => f.peek);
    expect(peeks.map((f) => f.name)).toEqual(['letterbox']);
  });

  it('correctly identifies cosmetic filters', () => {
    const cosmetic = defaultFilters.filter((f) => !f.peek);
    expect(cosmetic.map((f) => f.name)).toEqual(['greyscale', 'blur']);
  });

  it('no filter appears in both groups', () => {
    const peeks = defaultFilters.filter((f) => f.peek);
    const cosmetic = defaultFilters.filter((f) => !f.peek);
    const overlap = peeks.filter((f) => cosmetic.includes(f));
    expect(overlap).toHaveLength(0);
  });
});

describe('storage round-trip', () => {
  it('stores and retrieves selectors correctly', async () => {
    const selectors = makeDefaultSelectors();
    initialiseSelectors(selectors, defaultFilters);
    const result = await (chrome.storage.sync.get('selectors') as Promise<{ selectors: Selector[] }>);
    expect(result.selectors[0].filters).toEqual(defaultFilters);
  });
});
