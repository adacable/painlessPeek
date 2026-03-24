import { defaultFilters, defaultSelectors } from '../../shared/config';
import { defaultFilterStates, mergeFilterStates, mergeSelectorStates, stateToStorage } from '../../shared/state';
import type { Filter, FilterState, SelectorState } from '../../shared/types';

function initialise(): SelectorState[] {
    const states = defaultFilterStates(defaultFilters);
    const selectorStates = defaultSelectors.map((s) => stateToStorage(s.name, states));
    chrome.storage.sync.set({ selectors: selectorStates });
    return selectorStates;
}

function makeUI(selectorStates: SelectorState[]) {
    const container = document.getElementById('selectors');
    if (!container) return;
    selectorStates.forEach((selectorState) => {
        const merged = mergeFilterStates(defaultFilters, selectorState.filterStates);
        container.appendChild(makeSelectorDiv(selectorState.name, merged));
    });
}

function makeSelectorDiv(name: string, filterStates: Record<string, FilterState>): HTMLElement {
    const div = document.createElement('div');
    div.id = name;
    div.className = 'selector';
    const h2 = document.createElement('h2');
    h2.textContent = name;
    div.appendChild(h2);

    const peeks = defaultFilters.filter((f) => f.peek);
    const cosmetic = defaultFilters.filter((f) => !f.peek);

    div.appendChild(makePeekSel(peeks, filterStates, name));
    cosmetic.forEach((filter) => {
        div.appendChild(makeFilterForm(filter, filterStates[filter.name], name));
    });

    return div;
}

function makePeekSel(
    peeks: Filter[],
    filterStates: Record<string, FilterState>,
    selectorName: string
): HTMLSelectElement {
    const select = document.createElement('select');
    select.className = 'peeks';
    peeks.forEach((f) => {
        const opt = document.createElement('option');
        opt.textContent = f.name;
        opt.value = f.name;
        if (filterStates[f.name]?.enabled) opt.selected = true;
        select.appendChild(opt);
    });
    select.addEventListener('change', () => updatePeek(selectorName, peeks, select.value));
    return select;
}

function updatePeek(selectorName: string, peeks: Filter[], enabledName: string) {
    chrome.storage.sync.get('selectors', (data: { selectors: SelectorState[] }) => {
        const sels = data.selectors;
        const sel = sels.find((s) => s.name === selectorName);
        if (!sel) return;
        peeks.forEach((f) => {
            sel.filterStates[f.name] = { ...sel.filterStates[f.name], enabled: f.name === enabledName };
        });
        chrome.storage.sync.set({ selectors: sels });
    });
}

function makeFilterForm(filter: Filter, state: FilterState, selectorName: string): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'filter';
    form.id = filter.name;
    const h3 = document.createElement('h3');
    h3.textContent = filter.name;
    form.appendChild(h3);
    for (const [optionName, opt] of Object.entries(filter.options)) {
        form.appendChild(makeOptionDiv(optionName, opt.type, state[optionName], opt, filter.name, selectorName));
    }
    return form;
}

function makeOptionDiv(
    optionName: string,
    type: 'checkbox' | 'range',
    value: boolean | number,
    opt: Filter['options'][string],
    filterName: string,
    selectorName: string
): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'option';
    div.classList.add(optionName);

    const input = document.createElement('input');
    input.type = type;
    input.name = optionName;
    input.className = 'option';

    if (type === 'checkbox') {
        input.checked = value as boolean;
    } else {
        input.min = String(opt.min);
        input.max = String(opt.max);
        input.value = String(value);
    }

    input.addEventListener('change', () => {
        const newValue = type === 'checkbox' ? input.checked : Number(input.value);
        updateOption(selectorName, filterName, optionName, newValue);
    });

    div.appendChild(input);

    const label = document.createElement('label');
    label.textContent = optionName;
    label.classList.add(optionName);
    label.htmlFor = optionName;
    div.appendChild(label);

    return div;
}

function updateOption(
    selectorName: string,
    filterName: string,
    optionName: string,
    value: boolean | number
) {
    chrome.storage.sync.get('selectors', (data: { selectors: SelectorState[] }) => {
        const sels = data.selectors;
        const sel = sels.find((s) => s.name === selectorName);
        if (!sel) return;
        const existing = sel.filterStates[filterName] ?? defaultFilterStates(defaultFilters)[filterName];
        sel.filterStates[filterName] = { ...existing, [optionName]: value };
        chrome.storage.sync.set({ selectors: sels });
    });
}

function isValidSelectorState(s: unknown): s is SelectorState {
    return typeof s === 'object' && s !== null && 'filterStates' in s;
}

function checkSelsLoaded(result: { selectors?: unknown[] }): SelectorState[] {
    if (!result.selectors || !result.selectors.every(isValidSelectorState)) return initialise();
    return mergeSelectorStates(result.selectors, defaultFilters);
}

chrome.storage.sync.get('selectors').then((result) => {
    const selectorStates = checkSelsLoaded(result as { selectors?: SelectorState[] });
    makeUI(selectorStates);
});
