import { describe, expect, it } from 'vitest';
import type { Filter, FilterOption, SelectorState } from '../shared/types';
import { defaultFilterStates, mergeSelectorStates } from '../shared/state';

const defaultFilters: Filter[] = [
  {
    name: 'greyscale',
    description: 'Make the image black and white',
    peek: false,
    filterString: 'grayscale(percent)',
    options: {
      enabled: { value: false, type: 'checkbox' },
      percent: { value: 100, type: 'range', min: 0, max: 100, unit: '%' },
    },
  },
  {
    name: 'letterbox',
    description: 'Reveal a small rectangle of the image on hover',
    peek: true,
    options: {
      enabled: { value: true, type: 'checkbox' },
      width: { value: 5, type: 'range', min: 0, max: 50, unit: '%' },
      height: { value: 5, type: 'range', min: 0, max: 50, unit: '%' },
    },
  },
  {
    name: 'blur',
    description: 'Blur the image',
    peek: false,
    filterString: 'blur(radius)',
    options: {
      enabled: { value: false, type: 'checkbox' },
      radius: { value: 20, type: 'range', min: 0, max: 50, unit: 'px' },
    },
  },
];

// ---------------------------------------------------------------------------
// Popup UI helpers (replicated from entrypoints/popup/main.ts for testing)
// ---------------------------------------------------------------------------

function makeOptionDiv(
  option: FilterOption,
  optionName: string
): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'option';
  div.classList.add(optionName);
  const input = document.createElement('input');
  input.type = option.type;
  input.name = optionName;
  input.className = 'option';
  if (input.type === 'checkbox') input.checked = option.value as boolean;
  if (input.type === 'range') {
    input.max = String(option.max);
    input.min = String(option.min);
    input.value = String(option.value);
  }
  div.appendChild(input);
  const label = document.createElement('label');
  label.textContent = optionName;
  div.appendChild(label);
  return div;
}

function makeFilterDiv(filter: Filter): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'filter';
  form.id = filter.name;
  for (const key in filter.options) {
    form.appendChild(makeOptionDiv(filter.options[key], key));
  }
  return form;
}

function makeDefaultSelectorStates(): SelectorState[] {
  return [
    { name: 'Images', filterStates: defaultFilterStates(defaultFilters) },
  ];
}

function initialise(): SelectorState[] {
  const states = makeDefaultSelectorStates();
  chrome.storage.sync.set({ selectors: states });
  return states;
}

function isValidSelectorState(s: unknown): s is SelectorState {
  return typeof s === 'object' && s !== null && 'filterStates' in s;
}

function checkSelsLoaded(result: { selectors?: unknown[] }): SelectorState[] {
  if (!result.selectors || !result.selectors.every(isValidSelectorState))
    return initialise();
  return mergeSelectorStates(result.selectors, defaultFilters);
}

describe('checkSelsLoaded', () => {
  it('returns stored selectors when present and valid', () => {
    const stored: SelectorState[] = makeDefaultSelectorStates();
    const result = checkSelsLoaded({ selectors: stored });
    expect(result[0].name).toBe('Images');
    expect(result[0].filterStates['blur'].radius).toBe(20);
  });

  it('resets and returns defaults when storage is empty', () => {
    const result = checkSelsLoaded({});
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Images');
    expect(result[0].filterStates['blur'].radius).toBe(20);
  });

  it('reinitialises when selectors are in old format (no filterStates)', () => {
    const oldFormat = [
      { name: 'Images', selector: 'img', url: '*', filters: [] },
    ];
    const result = checkSelsLoaded({ selectors: oldFormat });
    expect(result[0].filterStates).toBeDefined();
    expect(result[0].filterStates['blur'].radius).toBe(20);
  });

  it('writes defaults to storage when resetting', () => {
    checkSelsLoaded({});
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      selectors: expect.arrayContaining([
        expect.objectContaining({ name: 'Images' }),
      ]),
    });
  });
});

describe('initialise', () => {
  it('creates SelectorState with filterStates for each filter', () => {
    const states = initialise();
    expect(states[0].filterStates['greyscale']).toBeDefined();
    expect(states[0].filterStates['blur']).toBeDefined();
    expect(states[0].filterStates['letterbox']).toBeDefined();
  });

  it('persists to storage', () => {
    const states = initialise();
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ selectors: states });
  });

  it('returns the selector states', () => {
    const states = initialise();
    expect(states).toHaveLength(1);
  });
});

describe('peek vs cosmetic filter split', () => {
  it('correctly identifies peek filters', () => {
    const peeks = defaultFilters.filter((f) => f.peek);
    expect(peeks.map((f) => f.name)).toContain('letterbox');
  });

  it('correctly identifies cosmetic filters', () => {
    const cosmetic = defaultFilters.filter((f) => !f.peek);
    expect(cosmetic.map((f) => f.name)).toContain('greyscale');
    expect(cosmetic.map((f) => f.name)).toContain('blur');
  });

  it('no filter appears in both groups', () => {
    const peeks = defaultFilters.filter((f) => f.peek);
    const cosmetic = defaultFilters.filter((f) => !f.peek);
    const overlap = peeks.filter((f) => cosmetic.includes(f));
    expect(overlap).toHaveLength(0);
  });
});

describe('storage round-trip', () => {
  it('stores and retrieves selector states correctly', async () => {
    const states = initialise();
    const result = await (chrome.storage.sync.get('selectors') as Promise<{
      selectors: SelectorState[];
    }>);
    expect(result.selectors[0].filterStates).toEqual(states[0].filterStates);
  });

  it('range option values survive a storage round-trip', async () => {
    initialise();
    const result = await (chrome.storage.sync.get('selectors') as Promise<{
      selectors: SelectorState[];
    }>);
    expect(result.selectors[0].filterStates['blur'].radius).toBe(20);
    expect(result.selectors[0].filterStates['greyscale'].percent).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Range slider UI rendering
// ---------------------------------------------------------------------------

describe('makeOptionDiv — range inputs', () => {
  it('renders a range input for a range-type option', () => {
    const option: FilterOption = {
      value: 20,
      type: 'range',
      min: 0,
      max: 50,
      unit: 'px',
    };
    const div = makeOptionDiv(option, 'radius');
    const input = div.querySelector<HTMLInputElement>('input');
    expect(input?.type).toBe('range');
  });

  it('range input has correct min, max and value attributes', () => {
    const option: FilterOption = {
      value: 20,
      type: 'range',
      min: 0,
      max: 50,
      unit: 'px',
    };
    const div = makeOptionDiv(option, 'radius');
    const input = div.querySelector<HTMLInputElement>('input')!;
    expect(input.min).toBe('0');
    expect(input.max).toBe('50');
    expect(input.value).toBe('20');
  });

  it('range input name matches optionName', () => {
    const option: FilterOption = {
      value: 20,
      type: 'range',
      min: 0,
      max: 50,
      unit: 'px',
    };
    const div = makeOptionDiv(option, 'radius');
    const input = div.querySelector<HTMLInputElement>('input')!;
    expect(input.name).toBe('radius');
  });

  it('renders a label for the range option', () => {
    const option: FilterOption = {
      value: 90,
      type: 'range',
      min: 0,
      max: 360,
      unit: 'deg',
    };
    const div = makeOptionDiv(option, 'deg');
    const label = div.querySelector('label');
    expect(label).not.toBeNull();
    expect(label?.textContent).toBe('deg');
  });

  it('greyscale percent range input renders with correct bounds', () => {
    const form = makeFilterDiv(defaultFilters[0]); // greyscale
    const rangeInput = form.querySelector<HTMLInputElement>(
      'input[type="range"]'
    );
    expect(rangeInput).not.toBeNull();
    expect(rangeInput?.min).toBe('0');
    expect(rangeInput?.max).toBe('100');
    expect(rangeInput?.value).toBe('100');
  });

  it('blur radius range input renders with correct bounds', () => {
    const form = makeFilterDiv(defaultFilters[2]); // blur
    const rangeInput = form.querySelector<HTMLInputElement>(
      'input[type="range"]'
    );
    expect(rangeInput).not.toBeNull();
    expect(rangeInput?.min).toBe('0');
    expect(rangeInput?.max).toBe('50');
    expect(rangeInput?.value).toBe('20');
  });

  it('letterbox renders two range inputs (width and height)', () => {
    const form = makeFilterDiv(defaultFilters[1]); // letterbox
    const rangeInputs = form.querySelectorAll<HTMLInputElement>(
      'input[type="range"]'
    );
    expect(rangeInputs).toHaveLength(2);
  });

  it('letterbox width and height inputs both have min 0', () => {
    const form = makeFilterDiv(defaultFilters[1]);
    const rangeInputs = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[type="range"]')
    );
    rangeInputs.forEach((input) => expect(input.min).toBe('0'));
  });

  it('checkbox option still renders as checkbox (not affected by range changes)', () => {
    const option: FilterOption = { value: false, type: 'checkbox' };
    const div = makeOptionDiv(option, 'enabled');
    const input = div.querySelector<HTMLInputElement>('input')!;
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(false);
  });

  it('a filter with both enabled checkbox and range options renders both input types', () => {
    const form = makeFilterDiv(defaultFilters[0]); // greyscale
    const checkbox = form.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    );
    const range = form.querySelector<HTMLInputElement>('input[type="range"]');
    expect(checkbox).not.toBeNull();
    expect(range).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Range slider value persistence
// ---------------------------------------------------------------------------

describe('range slider value persistence', () => {
  it('updating a range option value and saving persists the new value', async () => {
    initialise();
    const stored = await (chrome.storage.sync.get('selectors') as Promise<{
      selectors: SelectorState[];
    }>);
    const sels = stored.selectors;
    sels[0].filterStates['blur'].radius = 10;
    chrome.storage.sync.set({ selectors: sels });

    const updated = await (chrome.storage.sync.get('selectors') as Promise<{
      selectors: SelectorState[];
    }>);
    expect(updated.selectors[0].filterStates['blur'].radius).toBe(10);
  });

  it('updating one filter range value does not affect other filters', async () => {
    initialise();
    const stored = await (chrome.storage.sync.get('selectors') as Promise<{
      selectors: SelectorState[];
    }>);
    const sels = stored.selectors;
    sels[0].filterStates['blur'].radius = 10;
    chrome.storage.sync.set({ selectors: sels });

    const updated = await (chrome.storage.sync.get('selectors') as Promise<{
      selectors: SelectorState[];
    }>);
    expect(updated.selectors[0].filterStates['greyscale'].percent).toBe(100); // unchanged
  });
});
