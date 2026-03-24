import { defaultSelectors } from './config';
import type { Filter, FilterState, Selector, SelectorState } from './types';

export function defaultFilterStates(
  filters: Filter[]
): Record<string, FilterState> {
  return Object.fromEntries(
    filters.map((f) => [
      f.name,
      Object.fromEntries(
        Object.entries(f.options).map(([key, opt]) => [key, opt.value])
      ) as FilterState,
    ])
  );
}

export function mergeFilterStates(
  filters: Filter[],
  stored: Record<string, FilterState> | undefined
): Record<string, FilterState> {
  const defaults = defaultFilterStates(filters);
  if (!stored) return defaults;
  return Object.fromEntries(
    Object.entries(defaults).map(([name, defaultState]) => [
      name,
      { ...defaultState, ...stored[name] },
    ])
  );
}

export function stateToStorage(
  name: string,
  filterStates: Record<string, FilterState>
): SelectorState {
  return { name, filterStates };
}

export function selectorStateFromStorage(
  stored: SelectorState,
  filters: Filter[]
): Record<string, FilterState> {
  return mergeFilterStates(filters, stored.filterStates);
}

export function mergeSelectorStates(
  stored: SelectorState[],
  filters: Filter[],
  selectors: Selector[] = defaultSelectors
): SelectorState[] {
  const storedNames = new Set(stored.map((s) => s.name));
  const defaults = defaultFilterStates(filters);
  const missing = selectors
    .filter((s) => !storedNames.has(s.name))
    .map((s) => stateToStorage(s.name, defaults));
  return [...stored, ...missing];
}
