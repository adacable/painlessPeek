import type { Filter } from './types';

export function recomputeBackdropFilter(
  filterDiv: HTMLElement,
  filters: Filter[]
): void {
  const active = filters
    .filter((f) => !f.peek && filterDiv.classList.contains(f.name))
    .map((f) => buildFilterString(f, filterDiv));
  filterDiv.style.backdropFilter = active.join(' ');
}

function buildFilterString(filter: Filter, filterDiv: HTMLElement): string {
  if (!filter.filterString) return '';
  let result = filter.filterString;
  for (const [optName, opt] of Object.entries(filter.options)) {
    if (optName === 'enabled') continue;
    const val = filterDiv.getAttribute('data-' + optName) ?? String(opt.value);
    const unit = opt.unit ?? '';
    result = result.replace(optName, val + unit);
  }
  return result;
}

export function wrapElement(element: HTMLElement): HTMLElement {
  const savedElement = element.cloneNode(true) as HTMLElement;
  const newWrap = document.createElement('div');
  for (let i = element.attributes.length - 1; i >= 0; --i) {
    newWrap.attributes.setNamedItem(element.attributes[i].cloneNode() as Attr);
  }

  let imgSrc = '';
  if (element.tagName === 'IMG') {
    imgSrc = (savedElement as HTMLImageElement).src;
  } else if (element.style.backgroundImage?.startsWith('url')) {
    imgSrc = element.style.backgroundImage.startsWith('url("')
      ? element.style.backgroundImage.slice(5, -2)
      : element.style.backgroundImage.slice(4, -1);
  }

  newWrap.style.backgroundImage = '';
  newWrap.style.display = 'inline-block';

  const innerWrap = document.createElement('div');
  innerWrap.classList.add('painlessPeek-filter-wrapper');

  const img = document.createElement('img');
  if (imgSrc) img.src = imgSrc;
  img.classList.add('painlessPeek-filter-image');
  innerWrap.appendChild(img);

  const filtersDiv = document.createElement('div');
  filtersDiv.classList.add('painlessPeek-filter');
  innerWrap.appendChild(filtersDiv);

  newWrap.appendChild(innerWrap);
  element.parentNode?.replaceChild(newWrap, element);
  return newWrap;
}
