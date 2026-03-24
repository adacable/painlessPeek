import { defaultFilters, defaultSelectors } from '../../shared/config';
import type { Filter, FilterOption, Selector } from '../../shared/types';

function initialiseSelectors(selectors: Selector[], filters: Filter[]): Selector[] {
    selectors.forEach(function(selector) {
        selector.filters = filters;
    });
    chrome.storage.sync.set({ selectors }).then(function() {});
    return selectors;
}

function resetSelectors(): Selector[] {
    return initialiseSelectors(defaultSelectors, defaultFilters);
}

function makeUI(selectors: Selector[]) {
    const selectordiv = document.getElementById("selectors");
    if (!selectordiv) return;
    selectors.forEach((selector) => {
        const appendDiv = makeSelectorDiv(selector);
        selectordiv.appendChild(appendDiv);
    });
}

function makeSelectorDiv(selector: Selector): HTMLElement {
    const div = document.createElement("div");
    div.id = selector.name;
    div.className = "selector";
    const name = document.createElement("h2");
    name.textContent = selector.name;
    div.appendChild(name);
    return addFilters(selector.filters, selector, div);
}

function addFilters(filters: Filter[], selector: Selector, selectordiv: HTMLElement): HTMLElement {
    const peeks = filters.filter((f) => f.peek);
    const cosmeticFilters = filters.filter((f) => !f.peek);
    selectordiv.appendChild(makePeekSel(peeks));
    cosmeticFilters.forEach((filter) => {
        selectordiv.appendChild(makeFilterDiv(filter));
    });
    return selectordiv;
}

function makePeekSel(peeks: Filter[]): HTMLSelectElement {
    const peeksSelector = document.createElement("select");
    peeksSelector.className = "peeks";
    peeks.forEach((peek) => {
        const peekOpt = document.createElement("option");
        peekOpt.textContent = peek.name;
        if (peek.options.enabled.value) {
            peekOpt.selected = true;
        }
        peeksSelector.appendChild(peekOpt);
    });
    peeksSelector.addEventListener("change", updatePeeks);
    return peeksSelector;
}

function updatePeeks(e: Event) {
    const target = e.target as HTMLSelectElement;
    chrome.storage.sync.get("selectors", function(data: { selectors: Selector[] }) {
        const sels = data.selectors;
        const thisSelID = target.parentElement?.id;
        const thisSel = sels.find((sel) => sel.name === thisSelID);
        if (!thisSel) return;
        const selIndex = sels.indexOf(thisSel);
        const peekEnabled = target.value;
        thisSel.filters.filter((f) => f.peek).forEach((peek) => {
            const filterIndex = thisSel.filters.indexOf(peek);
            peek.options.enabled.value = peek.name === peekEnabled;
            thisSel.filters[filterIndex] = peek;
        });
        sels[selIndex] = thisSel;
        chrome.storage.sync.set({ selectors: sels }).then(function() {});
    });
}

function makeFilterDiv(filter: Filter): HTMLFormElement {
    const form = document.createElement("form");
    form.className = "filter";
    form.id = filter.name;
    const header = document.createElement("h3");
    header.textContent = filter.name;
    form.appendChild(header);
    for (const key in filter.options) {
        form.appendChild(makeOptionDiv(filter.options[key], key));
    }
    return form;
}

function makeOptionDiv(option: FilterOption, optionName: string): HTMLDivElement {
    const div = document.createElement("div");
    div.className = "option";
    div.classList.add(optionName);

    const input = document.createElement("input");
    input.type = option.type;
    input.name = optionName;
    input.className = "option";
    if (input.type === "checkbox") {
        input.checked = option.value as boolean;
    }
    if (input.type === "range") {
        input.max = String(option.max);
        input.min = String(option.min);
        input.value = String(option.value);
    }
    input.addEventListener("change", updateFilters);
    div.appendChild(input);

    const label = document.createElement("label");
    label.textContent = optionName;
    label.classList.add(optionName);
    label.htmlFor = optionName;
    div.appendChild(label);

    return div;
}

function updateFilters(e: Event) {
    const target = e.target as HTMLInputElement;
    chrome.storage.sync.get("selectors", function(data: { selectors: Selector[] }) {
        const sels = data.selectors;
        const thisSelID = target.parentElement?.parentElement?.parentElement?.id;
        const thisSel = sels.find((sel) => sel.name === thisSelID);
        if (!thisSel) return;
        const selIndex = sels.indexOf(thisSel);
        const thisFilterID = target.parentElement?.parentElement?.id;
        const thisFilter = thisSel.filters.find((f) => f.name === thisFilterID);
        if (!thisFilter) return;
        const filterIndex = thisSel.filters.indexOf(thisFilter);
        const thisOption = thisFilter.options[target.name];
        if (thisOption.type === "checkbox") {
            thisOption.value = target.checked;
        }
        if (thisOption.type === "range") {
            thisOption.value = Number(target.value);
        }
        thisFilter.options[target.name] = thisOption;
        thisSel.filters[filterIndex] = thisFilter;
        sels[selIndex] = thisSel;
        chrome.storage.sync.set({ selectors: sels }).then(function() {});
    });
}

function checkSelsLoaded(result: { selectors?: Selector[] }): Selector[] {
    if (!result.selectors) {
        return resetSelectors();
    }
    return result.selectors;
}

chrome.storage.sync.get('selectors').then((result) => {
    const sels = checkSelsLoaded(result as { selectors?: Selector[] });
    makeUI(sels);
});
