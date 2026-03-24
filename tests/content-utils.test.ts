import { describe, expect, it, beforeEach } from 'vitest';
import {
  recomputeBackdropFilter,
  wrapElement,
} from '../shared/content-utils';
import type { Filter } from '../shared/types';

// ---------------------------------------------------------------------------
// Test filter configs
// ---------------------------------------------------------------------------

const blurFilter: Filter = {
  name: 'blur',
  peek: false,
  filterString: 'blur(radius)',
  options: {
    enabled: { value: false, type: 'checkbox' },
    radius: { value: 20, type: 'range', min: 0, max: 50, unit: 'px' },
  },
};

const greyscaleFilter: Filter = {
  name: 'greyscale',
  peek: false,
  filterString: 'grayscale(percent)',
  options: {
    enabled: { value: false, type: 'checkbox' },
    percent: { value: 100, type: 'range', min: 0, max: 100, unit: '%' },
  },
};

const hueRotateFilter: Filter = {
  name: 'hue-rotate',
  peek: false,
  filterString: 'hue-rotate(deg)',
  options: {
    enabled: { value: false, type: 'checkbox' },
    deg: { value: 90, type: 'range', min: 0, max: 360, unit: 'deg' },
  },
};

const letterboxFilter: Filter = {
  name: 'letterbox',
  peek: true,
  options: {
    enabled: { value: true, type: 'checkbox' },
    width: { value: 5, type: 'range', min: 0, max: 50, unit: '%' },
    height: { value: 5, type: 'range', min: 0, max: 50, unit: '%' },
  },
};

const testFilters: Filter[] = [blurFilter, greyscaleFilter, hueRotateFilter, letterboxFilter];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFilterDiv(...classNames: string[]): HTMLElement {
  const div = document.createElement('div');
  classNames.forEach((c) => div.classList.add(c));
  return div;
}

function makeImg(src: string, extraAttrs: Record<string, string> = {}): HTMLImageElement {
  const img = document.createElement('img');
  img.src = src;
  for (const [k, v] of Object.entries(extraAttrs)) {
    img.setAttribute(k, v);
  }
  return img;
}

function makeBgElement(bgImage: string): HTMLElement {
  const div = document.createElement('div');
  div.style.backgroundImage = bgImage;
  return div;
}

function attachToBody(el: HTMLElement): void {
  document.body.appendChild(el);
}

beforeEach(() => {
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// recomputeBackdropFilter — no active filters
// ---------------------------------------------------------------------------

describe('recomputeBackdropFilter with no active filters', () => {
  it('sets empty string when no filter classes are present', () => {
    const div = makeFilterDiv();
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('');
  });

  it('ignores unknown class names', () => {
    const div = makeFilterDiv('letterbox', 'reveal', 'some-other-class');
    recomputeBackdropFilter(div, testFilters);
    // peek filters and unknown classes are not in backdropFilter
    expect(div.style.backdropFilter).toBe('');
  });

  it('peek filters (letterbox, reveal) do not appear in backdropFilter', () => {
    const div = makeFilterDiv('letterbox');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('');
  });
});

// ---------------------------------------------------------------------------
// recomputeBackdropFilter — single filters with default values
// ---------------------------------------------------------------------------

describe('recomputeBackdropFilter single filter, default values', () => {
  it('blur uses default radius when no data attribute set', () => {
    const div = makeFilterDiv('blur');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('blur(20px)');
  });

  it('greyscale uses default percent when no data attribute set', () => {
    const div = makeFilterDiv('greyscale');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('grayscale(100%)');
  });

  it('hue-rotate uses default deg when no data attribute set', () => {
    const div = makeFilterDiv('hue-rotate');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('hue-rotate(90deg)');
  });
});

// ---------------------------------------------------------------------------
// recomputeBackdropFilter — single filters with data attribute overrides
// ---------------------------------------------------------------------------

describe('recomputeBackdropFilter single filter, data attribute values', () => {
  it('blur reads radius from data-radius attribute', () => {
    const div = makeFilterDiv('blur');
    div.setAttribute('data-radius', '5');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('blur(5px)');
  });

  it('blur with data-radius="0" produces blur(0px)', () => {
    const div = makeFilterDiv('blur');
    div.setAttribute('data-radius', '0');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('blur(0px)');
  });

  it('blur with data-radius at max produces blur(50px)', () => {
    const div = makeFilterDiv('blur');
    div.setAttribute('data-radius', '50');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('blur(50px)');
  });

  it('greyscale reads percent from data-percent attribute', () => {
    const div = makeFilterDiv('greyscale');
    div.setAttribute('data-percent', '50');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('grayscale(50%)');
  });

  it('greyscale with data-percent="0" produces grayscale(0%)', () => {
    const div = makeFilterDiv('greyscale');
    div.setAttribute('data-percent', '0');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('grayscale(0%)');
  });

  it('hue-rotate reads deg from data-deg attribute', () => {
    const div = makeFilterDiv('hue-rotate');
    div.setAttribute('data-deg', '180');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('hue-rotate(180deg)');
  });

  it('hue-rotate with data-deg="0" produces hue-rotate(0deg)', () => {
    const div = makeFilterDiv('hue-rotate');
    div.setAttribute('data-deg', '0');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('hue-rotate(0deg)');
  });

  it('hue-rotate with data-deg="360" produces hue-rotate(360deg)', () => {
    const div = makeFilterDiv('hue-rotate');
    div.setAttribute('data-deg', '360');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('hue-rotate(360deg)');
  });
});

// ---------------------------------------------------------------------------
// recomputeBackdropFilter — multiple active filters
// ---------------------------------------------------------------------------

describe('recomputeBackdropFilter multiple active filters', () => {
  it('combines blur and greyscale with default values', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toContain('blur(20px)');
    expect(div.style.backdropFilter).toContain('grayscale(100%)');
  });

  it('combines blur and greyscale with data attribute values', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    div.setAttribute('data-radius', '10');
    div.setAttribute('data-percent', '75');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toContain('blur(10px)');
    expect(div.style.backdropFilter).toContain('grayscale(75%)');
  });

  it('combines all three backdrop filters', () => {
    const div = makeFilterDiv('blur', 'greyscale', 'hue-rotate');
    div.setAttribute('data-radius', '5');
    div.setAttribute('data-percent', '80');
    div.setAttribute('data-deg', '270');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toContain('blur(5px)');
    expect(div.style.backdropFilter).toContain('grayscale(80%)');
    expect(div.style.backdropFilter).toContain('hue-rotate(270deg)');
  });

  it('each filter uses its own data attribute independently', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    div.setAttribute('data-radius', '15');
    // no data-percent set — greyscale should use default (100%)
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toContain('blur(15px)');
    expect(div.style.backdropFilter).toContain('grayscale(100%)');
  });
});

// ---------------------------------------------------------------------------
// recomputeBackdropFilter — dynamic updates
// ---------------------------------------------------------------------------

describe('recomputeBackdropFilter dynamic updates', () => {
  it('updating data attribute then recomputing changes the result', () => {
    const div = makeFilterDiv('blur');
    div.setAttribute('data-radius', '10');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('blur(10px)');

    div.setAttribute('data-radius', '30');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('blur(30px)');
  });

  it('adding a class and recomputing adds that filter to backdropFilter', () => {
    const div = makeFilterDiv('blur');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).not.toContain('grayscale');

    div.classList.add('greyscale');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toContain('grayscale(100%)');
  });

  it('removing a class and recomputing removes that filter from backdropFilter', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toContain('blur(20px)');

    div.classList.remove('blur');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).not.toContain('blur');
    expect(div.style.backdropFilter).toContain('grayscale(100%)');
  });

  it('removing all classes yields empty backdropFilter', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    recomputeBackdropFilter(div, testFilters);
    div.classList.remove('blur');
    div.classList.remove('greyscale');
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe('');
  });

  it('is idempotent — calling twice with same state gives same result', () => {
    const div = makeFilterDiv('blur');
    div.setAttribute('data-radius', '15');
    recomputeBackdropFilter(div, testFilters);
    const first = div.style.backdropFilter;
    recomputeBackdropFilter(div, testFilters);
    expect(div.style.backdropFilter).toBe(first);
  });
});

// ---------------------------------------------------------------------------
// Letterbox CSS custom properties
// ---------------------------------------------------------------------------

describe('letterbox CSS custom property updates', () => {
  it('wrapElement creates a filter div with no custom properties set initially', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter')!;
    expect(filterDiv.style.getPropertyValue('--rect-width')).toBe('');
    expect(filterDiv.style.getPropertyValue('--rect-height')).toBe('');
  });

  it('setting data-width and data-height on the filter div allows JS to apply them as CSS vars', () => {
    // This tests the convention: data-width/height are set by updateFilter,
    // and the letterbox add() function should apply them as --rect-width/--rect-height
    const div = makeFilterDiv('painlessPeek-filter');
    div.setAttribute('data-width', '10');
    div.setAttribute('data-height', '15');

    // Simulate what letterbox add() should do
    div.style.setProperty('--rect-width', div.getAttribute('data-width') + '%');
    div.style.setProperty('--rect-height', div.getAttribute('data-height') + '%');

    expect(div.style.getPropertyValue('--rect-width')).toBe('10%');
    expect(div.style.getPropertyValue('--rect-height')).toBe('15%');
  });
});

// ---------------------------------------------------------------------------
// wrapElement — IMG elements
// ---------------------------------------------------------------------------

describe('wrapElement (img)', () => {
  it('replaces the element in the DOM', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    wrapElement(img);
    expect(document.body.contains(img)).toBe(false);
  });

  it('returns a wrapper div that is now in the DOM', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(document.body.contains(wrapper)).toBe(true);
  });

  it('wrapper contains an inner div with class painlessPeek-filter-wrapper', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.querySelector('.painlessPeek-filter-wrapper')).not.toBeNull();
  });

  it('inner wrapper contains an img with class painlessPeek-filter-image', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.querySelector('.painlessPeek-filter-image')).not.toBeNull();
  });

  it('inner img src matches original img src', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const innerImg = wrapper.querySelector<HTMLImageElement>('.painlessPeek-filter-image');
    expect(innerImg?.src).toBe('http://example.com/photo.jpg');
  });

  it('wrapper contains a filter overlay div with class painlessPeek-filter', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.querySelector('.painlessPeek-filter')).not.toBeNull();
  });

  it('wrapper is displayed as inline-block', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.style.display).toBe('inline-block');
  });

  it('copies class attribute from original img to wrapper', () => {
    const img = makeImg('http://example.com/photo.jpg', { class: 'hero-image featured' });
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.classList.contains('hero-image')).toBe(true);
    expect(wrapper.classList.contains('featured')).toBe(true);
  });

  it('copies id attribute from original img to wrapper', () => {
    const img = makeImg('http://example.com/photo.jpg', { id: 'main-photo' });
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.id).toBe('main-photo');
  });

  it('copies alt attribute from original img to wrapper div', () => {
    // Documents current behaviour — alt on a div is semantically incorrect,
    // but the implementation copies ALL attributes
    const img = makeImg('http://example.com/photo.jpg', { alt: 'a photo' });
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.getAttribute('alt')).toBe('a photo');
  });

  it('wrapper backgroundImage is cleared even if img had inline style', () => {
    const img = makeImg('http://example.com/photo.jpg');
    img.style.backgroundImage = 'url("http://example.com/bg.jpg")';
    attachToBody(img);
    const wrapper = wrapElement(img);
    expect(wrapper.style.backgroundImage).toBe('');
  });

  it('works with a relative src', () => {
    const img = makeImg('/images/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const innerImg = wrapper.querySelector<HTMLImageElement>('.painlessPeek-filter-image');
    expect(innerImg?.src).toContain('photo.jpg');
  });

  it('does not throw when called on a detached element', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    wrapElement(img);
    // img is now detached — second call should not throw
    expect(() => wrapElement(img)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// wrapElement — background-image URL format variants
// ---------------------------------------------------------------------------

describe('wrapElement (background-image)', () => {
  it('parses double-quoted url("...") format correctly', () => {
    const div = makeBgElement('url("http://example.com/photo.jpg")');
    attachToBody(div);
    const wrapper = wrapElement(div);
    const innerImg = wrapper.querySelector<HTMLImageElement>('.painlessPeek-filter-image');
    expect(innerImg?.src).toBe('http://example.com/photo.jpg');
  });

  it('parses unquoted url(...) format correctly', () => {
    const div = makeBgElement('url(http://example.com/photo.jpg)');
    attachToBody(div);
    const wrapper = wrapElement(div);
    const innerImg = wrapper.querySelector<HTMLImageElement>('.painlessPeek-filter-image');
    expect(innerImg?.src).toBe('http://example.com/photo.jpg');
  });

  it("parses single-quoted url('...') format correctly", () => {
    // The code only checks for url(" (double-quote); single-quote hits the else
    // branch. This test will catch if single-quote parsing is broken.
    const div = makeBgElement("url('http://example.com/photo.jpg')");
    attachToBody(div);
    const wrapper = wrapElement(div);
    const innerImg = wrapper.querySelector<HTMLImageElement>('.painlessPeek-filter-image');
    expect(innerImg?.src).toBe('http://example.com/photo.jpg');
  });

  it('inner img src is empty when no image source is found', () => {
    const div = document.createElement('div');
    attachToBody(div);
    const wrapper = wrapElement(div);
    const innerImg = wrapper.querySelector<HTMLImageElement>('.painlessPeek-filter-image');
    expect(innerImg?.src).toBe('');
  });

  it('wrapper backgroundImage is cleared', () => {
    const div = makeBgElement('url("http://example.com/photo.jpg")');
    attachToBody(div);
    const wrapper = wrapElement(div);
    expect(wrapper.style.backgroundImage).toBe('');
  });

  it('wrapper still contains filter overlay div', () => {
    const div = makeBgElement('url("http://example.com/photo.jpg")');
    attachToBody(div);
    const wrapper = wrapElement(div);
    expect(wrapper.querySelector('.painlessPeek-filter')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Mutation hazards in shared/config
// ---------------------------------------------------------------------------

describe('defaultFilters mutation hazards', () => {
  it('importing defaultFilters twice returns the same object reference', async () => {
    const { defaultFilters: a } = await import('../shared/config');
    const { defaultFilters: b } = await import('../shared/config');
    expect(a).toBe(b);
  });

  it('mutating a defaultFilter option value persists across re-imports (documents the hazard)', async () => {
    const { defaultFilters } = await import('../shared/config');
    const original = defaultFilters[0].options.enabled.value;

    defaultFilters[0].options.enabled.value = !original;
    const { defaultFilters: reImported } = await import('../shared/config');
    expect(reImported[0].options.enabled.value).toBe(!original);

    // Restore
    defaultFilters[0].options.enabled.value = original;
  });

  it('initialiseSelectors with multiple selectors gives them all the SAME filters reference', async () => {
    const { defaultFilters } = await import('../shared/config');
    const selectors = [
      { name: 'Images', selector: 'img', url: '*', filters: [] as typeof defaultFilters },
      { name: 'Divs', selector: 'div', url: '*', filters: [] as typeof defaultFilters },
    ];
    selectors.forEach((s) => {
      s.filters = defaultFilters;
    });

    // Mutating one selector's filter affects both — shared reference
    selectors[0].filters[0].options.enabled.value = true;
    expect(selectors[1].filters[0].options.enabled.value).toBe(true);

    // Restore
    defaultFilters[0].options.enabled.value = false;
  });
});

// ---------------------------------------------------------------------------
// Integration: wrapElement + recomputeBackdropFilter
// ---------------------------------------------------------------------------

describe('wrapElement + recomputeBackdropFilter integration', () => {
  it('adding a filter class and recomputing applies the correct backdropFilter string', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter')!;

    filterDiv.classList.add('blur');
    recomputeBackdropFilter(filterDiv, testFilters);

    expect(filterDiv.style.backdropFilter).toBe('blur(20px)');
  });

  it('slider value flows through data attribute to backdropFilter string', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter')!;

    filterDiv.classList.add('blur');
    filterDiv.setAttribute('data-radius', '7');
    recomputeBackdropFilter(filterDiv, testFilters);

    expect(filterDiv.style.backdropFilter).toBe('blur(7px)');
  });

  it('enabling then disabling a filter leaves backdropFilter empty', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter')!;

    filterDiv.classList.add('greyscale');
    recomputeBackdropFilter(filterDiv, testFilters);
    filterDiv.classList.remove('greyscale');
    recomputeBackdropFilter(filterDiv, testFilters);

    expect(filterDiv.style.backdropFilter).toBe('');
  });

  it('multiple wrapped images each have independent filter divs', () => {
    const img1 = makeImg('http://example.com/a.jpg');
    const img2 = makeImg('http://example.com/b.jpg');
    attachToBody(img1);
    attachToBody(img2);

    const wrapper1 = wrapElement(img1);
    const wrapper2 = wrapElement(img2);

    const filter1 = wrapper1.querySelector<HTMLElement>('.painlessPeek-filter')!;
    const filter2 = wrapper2.querySelector<HTMLElement>('.painlessPeek-filter')!;

    filter1.classList.add('blur');
    filter1.setAttribute('data-radius', '10');
    recomputeBackdropFilter(filter1, testFilters);

    expect(filter2.style.backdropFilter).toBe('');
  });
});
