import { describe, expect, it, beforeEach } from 'vitest';
import {
  backdropFilterValues,
  recomputeBackdropFilter,
  wrapElement,
} from '../shared/content-utils';

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

// Attach element to DOM so parentNode is present for wrapElement
function attachToBody(el: HTMLElement): void {
  document.body.appendChild(el);
}

beforeEach(() => {
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// backdropFilterValues
// ---------------------------------------------------------------------------

describe('backdropFilterValues', () => {
  it('contains entries for greyscale, blur, and hue-rotate', () => {
    expect(backdropFilterValues).toHaveProperty('greyscale');
    expect(backdropFilterValues).toHaveProperty('blur');
    expect(backdropFilterValues).toHaveProperty('hue-rotate');
  });

  it('greyscale value is a valid CSS grayscale filter', () => {
    expect(backdropFilterValues['greyscale']).toMatch(/grayscale\(\d+%\)/);
  });

  it('blur value is a valid CSS blur filter', () => {
    expect(backdropFilterValues['blur']).toMatch(/blur\(\d+px\)/);
  });

  it('hue-rotate value is a valid CSS hue-rotate filter', () => {
    expect(backdropFilterValues['hue-rotate']).toMatch(/hue-rotate\(\d+deg\)/);
  });
});

// ---------------------------------------------------------------------------
// recomputeBackdropFilter
// ---------------------------------------------------------------------------

describe('recomputeBackdropFilter', () => {
  it('sets empty string when no filter classes are present', () => {
    const div = makeFilterDiv();
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).toBe('');
  });

  it('sets correct value for greyscale alone', () => {
    const div = makeFilterDiv('greyscale');
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).toBe(backdropFilterValues['greyscale']);
  });

  it('sets correct value for blur alone', () => {
    const div = makeFilterDiv('blur');
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).toBe(backdropFilterValues['blur']);
  });

  it('sets correct value for hue-rotate alone', () => {
    const div = makeFilterDiv('hue-rotate');
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).toBe(backdropFilterValues['hue-rotate']);
  });

  it('combines blur and greyscale', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    recomputeBackdropFilter(div);
    const result = div.style.backdropFilter;
    expect(result).toContain(backdropFilterValues['blur']);
    expect(result).toContain(backdropFilterValues['greyscale']);
  });

  it('combines all three filters', () => {
    const div = makeFilterDiv('greyscale', 'blur', 'hue-rotate');
    recomputeBackdropFilter(div);
    const result = div.style.backdropFilter;
    expect(result).toContain(backdropFilterValues['greyscale']);
    expect(result).toContain(backdropFilterValues['blur']);
    expect(result).toContain(backdropFilterValues['hue-rotate']);
  });

  it('order of combined filters matches backdropFilterValues key order, not class order', () => {
    // Add classes in reverse order — result should still follow object key order
    const div = makeFilterDiv('hue-rotate', 'blur', 'greyscale');
    recomputeBackdropFilter(div);
    const expected = [
      backdropFilterValues['greyscale'],
      backdropFilterValues['blur'],
      backdropFilterValues['hue-rotate'],
    ].join(' ');
    expect(div.style.backdropFilter).toBe(expected);
  });

  it('ignores unknown class names', () => {
    const div = makeFilterDiv('letterbox', 'reveal', 'some-other-class');
    recomputeBackdropFilter(div);
    // None of these are in backdropFilterValues, so result should be empty
    expect(div.style.backdropFilter).toBe('');
  });

  it('updating after removing a class clears that filter', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).toContain(backdropFilterValues['blur']);

    div.classList.remove('blur');
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).not.toContain(backdropFilterValues['blur']);
    expect(div.style.backdropFilter).toContain(backdropFilterValues['greyscale']);
  });

  it('updating after removing all classes yields empty string', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    recomputeBackdropFilter(div);
    div.classList.remove('blur');
    div.classList.remove('greyscale');
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).toBe('');
  });

  it('is idempotent — calling twice gives the same result', () => {
    const div = makeFilterDiv('blur', 'greyscale');
    recomputeBackdropFilter(div);
    const first = div.style.backdropFilter;
    recomputeBackdropFilter(div);
    expect(div.style.backdropFilter).toBe(first);
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
    const innerImg = wrapper.querySelector('.painlessPeek-filter-image');
    expect(innerImg).not.toBeNull();
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
    // This documents current behaviour — alt on a div is semantically wrong,
    // but the current implementation copies ALL attributes
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
    // jsdom resolves relative URLs against the document base
    expect(innerImg?.src).toContain('photo.jpg');
  });

  it('does not create nested wrappers when called twice on already-replaced img', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    wrapElement(img);
    // At this point `img` is detached. Calling wrapElement again on it has no parent,
    // so parentNode?.replaceChild is a no-op — the second call should not throw.
    expect(() => wrapElement(img)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// wrapElement — background-image elements (URL format variants)
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

  it('parses single-quoted url(\'...\') format correctly', () => {
    // This is a known edge case: the code only checks for url(" (double-quote)
    // Single-quoted URLs hit the else branch: slice(4, -1) leaves a leading single-quote
    const div = makeBgElement("url('http://example.com/photo.jpg')");
    attachToBody(div);
    const wrapper = wrapElement(div);
    const innerImg = wrapper.querySelector<HTMLImageElement>('.painlessPeek-filter-image');
    // If this test fails, single-quote URL parsing is broken
    expect(innerImg?.src).toBe('http://example.com/photo.jpg');
  });

  it('inner img src is empty when no image source is found', () => {
    // img.src is only set when imgSrc is non-empty — avoids an unintended
    // request to the page URL that browsers make when src is set to ''.
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
    // Both imports should be the same module instance
    const { defaultFilters: a } = await import('../shared/config');
    const { defaultFilters: b } = await import('../shared/config');
    expect(a).toBe(b);
  });

  it('mutating a defaultFilter option value persists across re-imports (documents the hazard)', async () => {
    const { defaultFilters } = await import('../shared/config');
    const original = defaultFilters[0].options.enabled.value;

    // Simulate what initialiseSelectors does: assign the same array to a selector,
    // then what popup does: mutate the option value
    defaultFilters[0].options.enabled.value = !original;

    const { defaultFilters: reImported } = await import('../shared/config');
    // The mutation persists because ES module instances are singletons
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
    // Replicate what initialiseSelectors does
    selectors.forEach((s) => { s.filters = defaultFilters; });

    // Both selectors share the same reference — mutating one affects the other
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
  it('adding a filter class and recomputing applies backdropFilter', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter')!;

    filterDiv.classList.add('blur');
    recomputeBackdropFilter(filterDiv);

    expect(filterDiv.style.backdropFilter).toBe(backdropFilterValues['blur']);
  });

  it('enabling then disabling a filter leaves backdropFilter empty', () => {
    const img = makeImg('http://example.com/photo.jpg');
    attachToBody(img);
    const wrapper = wrapElement(img);
    const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter')!;

    filterDiv.classList.add('greyscale');
    recomputeBackdropFilter(filterDiv);
    filterDiv.classList.remove('greyscale');
    recomputeBackdropFilter(filterDiv);

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
    recomputeBackdropFilter(filter1);

    // filter2 should be unaffected
    expect(filter2.style.backdropFilter).toBe('');
  });
});
