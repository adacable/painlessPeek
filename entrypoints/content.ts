import type { FilterImpl, FilterState, SelectorState } from '../shared/types';
import { defaultFilters } from '../shared/config';
import { mergeFilterStates } from '../shared/state';
import { recomputeBackdropFilter, wrapElement } from '../shared/content-utils';
import './content-styles.css';

// WeakMap stores bound event handlers per wrapper so removeEventListener works correctly.
const letterboxHandlers = new WeakMap<
    HTMLElement,
    { move: (e: MouseEvent) => void; leave: () => void }
>();

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        function getImages(): HTMLElement[] {
            const standard = Array.from(document.getElementsByTagName('img'));
            const bg = Array.from(document.querySelectorAll<HTMLElement>("[style*='background-image']"));
            return [...standard, ...bg];
        }

        const filterImpls: Record<string, FilterImpl> = {
            greyscale: {},
            blur: {},
            reveal: {},
            'hue-rotate': {},
            letterbox: {
                add(wrapper: HTMLElement) {
                    const letterbox = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
                    if (!letterbox) return;
                    letterbox.classList.add('letterbox');
                    applyLetterboxSize(letterbox);

                    const onMove = (e: MouseEvent) => moveLetterbox(e, letterbox, wrapper);
                    const onLeave = () => {
                        letterbox.style.left = '';
                        letterbox.style.top = '';
                    };

                    letterboxHandlers.set(wrapper, { move: onMove, leave: onLeave });
                    wrapper.addEventListener('mousemove', onMove);
                    wrapper.addEventListener('mouseleave', onLeave);
                },
                remove(wrapper: HTMLElement) {
                    const letterbox = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
                    letterbox?.classList.remove('letterbox');

                    const handlers = letterboxHandlers.get(wrapper);
                    if (handlers) {
                        wrapper.removeEventListener('mousemove', handlers.move);
                        wrapper.removeEventListener('mouseleave', handlers.leave);
                        letterboxHandlers.delete(wrapper);
                    }
                },
                update(wrapper: HTMLElement, state: FilterState) {
                    const letterbox = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
                    if (!letterbox) return;
                    if (state.enabled && !letterbox.classList.contains('letterbox')) {
                        filterImpls.letterbox.add!(wrapper);
                    } else if (!state.enabled && letterbox.classList.contains('letterbox')) {
                        filterImpls.letterbox.remove!(wrapper);
                    }
                    if (typeof state.width === 'number') letterbox.setAttribute('data-width', String(state.width));
                    if (typeof state.height === 'number') letterbox.setAttribute('data-height', String(state.height));
                    if (letterbox.classList.contains('letterbox')) applyLetterboxSize(letterbox);
                },
            },
        };

        function applyLetterboxSize(letterbox: HTMLElement) {
            const width = letterbox.getAttribute('data-width') ?? '5';
            const height = letterbox.getAttribute('data-height') ?? '5';
            letterbox.style.setProperty('--rect-width', width + '%');
            letterbox.style.setProperty('--rect-height', height + '%');
        }

        function moveLetterbox(e: MouseEvent, letterbox: HTMLElement, outer: HTMLElement) {
            const offset = outer.getBoundingClientRect();
            const xpos = e.clientX - offset.left - (3 * outer.offsetWidth) / 2;
            const ypos = e.clientY - offset.top - (3 * outer.offsetHeight) / 2;
            letterbox.style.left = xpos + 'px';
            letterbox.style.top = ypos + 'px';
        }

        function updateSelector(selectorState: SelectorState) {
            const filterStates = mergeFilterStates(defaultFilters, selectorState.filterStates);
            const elements = getImages();
            const wrappers: HTMLElement[] = elements.map((element) => {
                if (element.classList.contains('painlessPeek-filter-image')) {
                    return element.parentNode as HTMLElement;
                }
                return wrapElement(element);
            });
            wrappers.forEach((wrapper) => {
                defaultFilters.forEach((filter) => {
                    updateFilter(wrapper, filter.name, filterStates[filter.name]);
                });
            });
        }

        function updateFilter(wrapper: HTMLElement, filterName: string, state: FilterState) {
            const impl = filterImpls[filterName];
            if (impl.update) {
                impl.update(wrapper, state);
                return;
            }
            const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
            if (!filterDiv) return;

            if (state.enabled && !filterDiv.classList.contains(filterName)) {
                addFilter(wrapper, filterName);
            } else if (!state.enabled && filterDiv.classList.contains(filterName)) {
                removeFilter(wrapper, filterName);
            }

            for (const [key, value] of Object.entries(state)) {
                if (key === 'enabled') continue;
                filterDiv.setAttribute('data-' + key, String(value));
            }
            recomputeBackdropFilter(filterDiv, defaultFilters);
        }

        function addFilter(wrapper: HTMLElement, filterName: string) {
            const impl = filterImpls[filterName];
            const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
            if (!filterDiv) return;
            if (impl.add) {
                impl.add(wrapper);
            } else {
                filterDiv.classList.add(filterName);
                recomputeBackdropFilter(filterDiv, defaultFilters);
            }
        }

        function removeFilter(wrapper: HTMLElement, filterName: string) {
            const impl = filterImpls[filterName];
            const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
            if (!filterDiv) return;
            if (impl.remove) {
                impl.remove(wrapper);
            } else {
                filterDiv.classList.remove(filterName);
                recomputeBackdropFilter(filterDiv, defaultFilters);
            }
        }

        let currentSelectorStates: SelectorState[] = [];

        function updateSelectors(selectorStates: SelectorState[]) {
            selectorStates.forEach((s) => updateSelector(s));
            currentSelectorStates = selectorStates;
        }

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.selectors) {
                updateSelectors(changes.selectors.newValue as SelectorState[]);
            }
        });

        function watchDom() {
            const observer = new MutationObserver((mutations) => {
                const hasNewNodes = mutations.some((m) => m.addedNodes.length > 0);
                if (hasNewNodes) {
                    updateSelectors(currentSelectorStates);
                }
            });
            observer.observe(document, { childList: true, subtree: true });
        }

        chrome.storage.sync.get('selectors').then((result) => {
            const selectorStates = (result.selectors as SelectorState[] | undefined) ?? [];
            updateSelectors(selectorStates);
            watchDom();
        });
    },
});
