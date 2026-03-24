import type { FilterImpl, FilterOption, Selector } from '../shared/types';
import './content-styles.css';

// Maps filter names to their backdrop-filter CSS values.
// Composing these in JS means we never need hardcoded combination rules in CSS.
const backdropFilterValues: Record<string, string> = {
    greyscale: 'grayscale(100%)',
    blur: 'blur(20px)',
    'hue-rotate': 'hue-rotate(90deg)',
};

function recomputeBackdropFilter(filterDiv: HTMLElement) {
    const active = Object.keys(backdropFilterValues)
        .filter((name) => filterDiv.classList.contains(name))
        .map((name) => backdropFilterValues[name]);
    filterDiv.style.backdropFilter = active.join(' ');
}

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

        const filters: Record<string, FilterImpl> = {
            greyscale: {},
            blur: {},
            reveal: {},
            'hue-rotate': {},
            letterbox: {
                add(wrapper: HTMLElement) {
                    const letterbox = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
                    if (!letterbox) return;
                    letterbox.classList.add('letterbox');

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
            },
        };

        function moveLetterbox(e: MouseEvent, letterbox: HTMLElement, outer: HTMLElement) {
            const offset = outer.getBoundingClientRect();
            const xpos = e.clientX - offset.left - (3 * outer.offsetWidth) / 2;
            const ypos = e.clientY - offset.top - (3 * outer.offsetHeight) / 2;
            letterbox.style.left = xpos + 'px';
            letterbox.style.top = ypos + 'px';
        }

        function updateSelector(selector: Selector) {
            const elements = getImages();
            const wrappers: HTMLElement[] = elements.map((element) => {
                if (element.classList.contains('painlessPeek-filter-image')) {
                    return element.parentNode as HTMLElement;
                }
                return wrapElement(element);
            });
            wrappers.forEach((wrapper) => {
                selector.filters.forEach((filterOpts) => {
                    updateFilter(wrapper, filterOpts.name, filterOpts.options);
                });
            });
        }

        function wrapElement(element: HTMLElement): HTMLElement {
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
            img.src = imgSrc;
            img.classList.add('painlessPeek-filter-image');
            innerWrap.appendChild(img);

            const filtersDiv = document.createElement('div');
            filtersDiv.classList.add('painlessPeek-filter');
            innerWrap.appendChild(filtersDiv);

            newWrap.appendChild(innerWrap);
            element.parentNode?.replaceChild(newWrap, element);
            return newWrap;
        }

        function updateFilter(wrapper: HTMLElement, filterName: string, options: Record<string, FilterOption>) {
            const filter = filters[filterName];
            if (filter.update) {
                filter.update(wrapper, options);
                return;
            }
            const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
            if (!filterDiv) return;
            for (const [optionName, optionValue] of Object.entries(options)) {
                if (optionName === 'enabled') {
                    if (optionValue.value === true && !filterDiv.classList.contains(filterName)) {
                        addFilter(wrapper, filterName);
                    } else if (optionValue.value !== true && filterDiv.classList.contains(filterName)) {
                        removeFilter(wrapper, filterName);
                    }
                } else {
                    filterDiv.setAttribute('data-' + optionName, String(optionValue.value));
                }
            }
        }

        function addFilter(wrapper: HTMLElement, filterName: string) {
            const filter = filters[filterName];
            const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
            if (!filterDiv) return;
            if (filter.add) {
                filter.add(wrapper);
            } else {
                filterDiv.classList.add(filterName);
                recomputeBackdropFilter(filterDiv);
            }
        }

        function removeFilter(wrapper: HTMLElement, filterName: string) {
            const filter = filters[filterName];
            const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
            if (!filterDiv) return;
            if (filter.remove) {
                filter.remove(wrapper);
            } else {
                filterDiv.classList.remove(filterName);
                recomputeBackdropFilter(filterDiv);
            }
        }

        let currentSelectors: Selector[] = [];

        function updateSelectors(newSelectors: Selector[]) {
            newSelectors.forEach((selector) => updateSelector(selector));
            currentSelectors = newSelectors;
        }

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.selectors) {
                updateSelectors(changes.selectors.newValue as Selector[]);
            }
        });

        function watchDom() {
            const observer = new MutationObserver((mutations) => {
                const hasNewNodes = mutations.some((m) => m.addedNodes.length > 0);
                if (hasNewNodes) {
                    updateSelectors(currentSelectors);
                }
            });
            observer.observe(document, {
                childList: true,
                subtree: true,
            });
        }

        chrome.storage.sync.get('selectors').then((result) => {
            const selectors = result.selectors as Selector[];
            updateSelectors(selectors);
            watchDom();
        });
    },
});
