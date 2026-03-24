import { defaultFilters } from '@shared/config';
import { defaultFilterStates } from '@shared/state';
import { recomputeBackdropFilter, wrapElement } from '@shared/content-utils';
import type { Filter, FilterState } from '@shared/types';

// ---------------------------------------------------------------------------
// Letterbox handlers
// ---------------------------------------------------------------------------

const letterboxHandlers = new WeakMap<
  HTMLElement,
  { move: (e: MouseEvent) => void; leave: () => void }
>();

function applyLetterboxSize(letterbox: HTMLElement) {
  const width = letterbox.getAttribute('data-width') ?? '5';
  const height = letterbox.getAttribute('data-height') ?? '5';
  letterbox.style.setProperty('--rect-width', width + '%');
  letterbox.style.setProperty('--rect-height', height + '%');
}

function addLetterbox(wrapper: HTMLElement) {
  const letterbox = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
  if (!letterbox) return;
  letterbox.classList.add('letterbox');
  applyLetterboxSize(letterbox);
  const onMove = (e: MouseEvent) => {
    const offset = wrapper.getBoundingClientRect();
    letterbox.style.left =
      e.clientX - offset.left - (3 * wrapper.offsetWidth) / 2 + 'px';
    letterbox.style.top =
      e.clientY - offset.top - (3 * wrapper.offsetHeight) / 2 + 'px';
  };
  const onLeave = () => {
    letterbox.style.left = '';
    letterbox.style.top = '';
  };
  letterboxHandlers.set(wrapper, { move: onMove, leave: onLeave });
  wrapper.addEventListener('mousemove', onMove);
  wrapper.addEventListener('mouseleave', onLeave);
}

function removeLetterbox(wrapper: HTMLElement) {
  const letterbox = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
  letterbox?.classList.remove('letterbox');
  const handlers = letterboxHandlers.get(wrapper);
  if (handlers) {
    wrapper.removeEventListener('mousemove', handlers.move);
    wrapper.removeEventListener('mouseleave', handlers.leave);
    letterboxHandlers.delete(wrapper);
  }
}

// ---------------------------------------------------------------------------
// Apply filter state to wrapped elements
// ---------------------------------------------------------------------------

function applyFilters(
  wrappers: HTMLElement[],
  filterStates: Record<string, FilterState>
) {
  wrappers.forEach((wrapper) => {
    const filterDiv = wrapper.querySelector<HTMLElement>(
      '.painlessPeek-filter'
    );
    if (!filterDiv) return;

    defaultFilters.forEach((filter) => {
      const state = filterStates[filter.name];
      if (!state) return;

      if (filter.name === 'letterbox') {
        if (typeof state.width === 'number')
          filterDiv.setAttribute('data-width', String(state.width));
        if (typeof state.height === 'number')
          filterDiv.setAttribute('data-height', String(state.height));
        if (state.enabled && !filterDiv.classList.contains('letterbox'))
          addLetterbox(wrapper);
        else if (!state.enabled && filterDiv.classList.contains('letterbox'))
          removeLetterbox(wrapper);
        else if (state.enabled) applyLetterboxSize(filterDiv);
        return;
      }

      for (const [key, val] of Object.entries(state)) {
        if (key === 'enabled') continue;
        filterDiv.setAttribute('data-' + key, String(val));
      }
      if (state.enabled && !filterDiv.classList.contains(filter.name)) {
        filterDiv.classList.add(filter.name);
      } else if (!state.enabled && filterDiv.classList.contains(filter.name)) {
        filterDiv.classList.remove(filter.name);
      }
      recomputeBackdropFilter(filterDiv, defaultFilters);
    });
  });
}

// ---------------------------------------------------------------------------
// Popup UI
// ---------------------------------------------------------------------------

function makePopup(
  container: HTMLElement,
  filterStates: Record<string, FilterState>,
  onChange: (states: Record<string, FilterState>) => void
) {
  container.innerHTML = '';

  const peeks = defaultFilters.filter((f) => f.peek);
  const cosmetic = defaultFilters.filter((f) => !f.peek);

  // Peek select
  const select = document.createElement('select');
  select.className = 'peeks';
  const noneOpt = document.createElement('option');
  noneOpt.textContent = 'none';
  noneOpt.value = '';
  select.appendChild(noneOpt);
  peeks.forEach((f) => {
    const opt = document.createElement('option');
    opt.textContent = f.name;
    opt.value = f.name;
    if (filterStates[f.name]?.enabled) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    peeks.forEach((f) => {
      filterStates[f.name].enabled = f.name === select.value;
    });
    onChange(filterStates);
  });
  container.appendChild(select);

  // Cosmetic filter forms
  cosmetic.forEach((filter) => {
    const state = filterStates[filter.name];
    const form = document.createElement('form');
    form.className = 'filter';
    form.id = filter.name;
    const h3 = document.createElement('h3');
    h3.textContent = filter.name;
    form.appendChild(h3);

    for (const [optName, opt] of Object.entries(filter.options)) {
      form.appendChild(
        makeOptionDiv(optName, opt, state, filter, filterStates, onChange)
      );
    }
    container.appendChild(form);
  });
}

function makeOptionDiv(
  optName: string,
  opt: Filter['options'][string],
  state: FilterState,
  filter: Filter,
  filterStates: Record<string, FilterState>,
  onChange: (states: Record<string, FilterState>) => void
): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'option';
  div.classList.add(optName);

  const input = document.createElement('input');
  input.type = opt.type;
  input.name = optName;
  input.className = 'option';

  if (opt.type === 'checkbox') {
    input.checked = state[optName] as boolean;
  } else {
    input.min = String(opt.min);
    input.max = String(opt.max);
    input.value = String(state[optName]);
  }

  input.addEventListener('change', () => {
    const val = opt.type === 'checkbox' ? input.checked : Number(input.value);
    filterStates[filter.name][optName] = val;
    onChange(filterStates);
  });

  div.appendChild(input);
  const label = document.createElement('label');
  label.textContent = optName;
  label.classList.add(optName);
  div.appendChild(label);

  return div;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function init() {
  const demoImages = Array.from(
    document.querySelectorAll<HTMLElement>('.demo img')
  );
  if (demoImages.length === 0) return;

  const wrappers = demoImages.map((img) => wrapElement(img));
  const filterStates = defaultFilterStates(defaultFilters);

  const popupContainer = document.querySelector<HTMLElement>('.popup-demo');
  if (popupContainer) {
    makePopup(popupContainer, filterStates, (states) =>
      applyFilters(wrappers, states)
    );
  }

  applyFilters(wrappers, filterStates);
}

document.addEventListener('DOMContentLoaded', init);
