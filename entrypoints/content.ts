import type { Filter, FilterImpl, FilterOption, Selector } from '../shared/types';

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        function getImages(): HTMLElement[] {
            const standard = Array.from(document.getElementsByTagName("img"));
            const bg = Array.from(document.querySelectorAll<HTMLElement>("[style*='background-image']"));
            return [...standard, ...bg];
        }

        const filters: Record<string, FilterImpl> = {
            "greyscale": {},
            "blur": {},
            "reveal": {},
            "hue-rotate": {},
            "letterbox": {
                add(wrapper: HTMLElement) {
                    const letterbox = wrapper.querySelector<HTMLElement>(".painlessPeek-filter");
                    if (!letterbox) return;
                    letterbox.classList.add('letterbox');
                    wrapper.addEventListener('mouseover', function() {
                        wrapper.addEventListener('mousemove', function(e: MouseEvent) {
                            moveLetterbox(e, letterbox, wrapper);
                        });
                        wrapper.addEventListener('mouseleave', function() {
                            wrapper.removeEventListener('mousemove', moveLetterbox as EventListener);
                            letterbox.style.left = '';
                            letterbox.style.top = '';
                            letterbox.style.width = '';
                            letterbox.style.height = '';
                        });
                    });
                },
                remove(wrapper: HTMLElement) {
                    wrapper.removeEventListener('mousemove', moveLetterbox as EventListener);
                    const letterbox = wrapper.querySelector<HTMLElement>(".painlessPeek-filter");
                    letterbox?.classList.remove('letterbox');
                }
            }
        };

        function moveLetterbox(e: MouseEvent, letterbox: HTMLElement, outer: HTMLElement) {
            const offset = outer.getBoundingClientRect();
            const xpos = e.clientX - offset.left - (3 * outer.offsetWidth / 2);
            const ypos = e.clientY - offset.top - (3 * outer.offsetHeight / 2);
            letterbox.style.left = xpos + 'px';
            letterbox.style.top = ypos + 'px';
        }

        function updateSelector(selector: Selector) {
            const elements = getImages();
            const wrappers: HTMLElement[] = [];
            elements.forEach((element) => {
                if (element.classList.contains("painlessPeek-filter-image")) {
                    wrappers.push(element.parentNode as HTMLElement);
                } else {
                    wrappers.push(wrapElement(element));
                }
            });
            wrappers.forEach((wrapper) => {
                selector.filters.forEach((filterOpts) => {
                    updateFilter(wrapper, filterOpts.name, filterOpts.options);
                });
            });
        }

        function wrapElement(element: HTMLElement): HTMLElement {
            const savedElement = element.cloneNode(true) as HTMLElement;
            const newWrap = document.createElement("div");
            for (let i = element.attributes.length - 1; i >= 0; --i) {
                newWrap.attributes.setNamedItem(element.attributes[i].cloneNode() as Attr);
            }

            let imgSrc = '';
            if (element.tagName === "IMG") {
                imgSrc = (savedElement as HTMLImageElement).src;
            } else if (element.style.backgroundImage?.startsWith("url")) {
                imgSrc = element.style.backgroundImage.startsWith("url(\"")
                    ? element.style.backgroundImage.slice(5, -2)
                    : element.style.backgroundImage.slice(4, -1);
            }

            newWrap.style.backgroundImage = "";
            newWrap.style.display = "inline-block";

            const innerWrap = document.createElement("div");
            innerWrap.classList.add('painlessPeek-filter-wrapper');

            const img = document.createElement("img");
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
            } else {
                const filterDiv = wrapper.querySelector<HTMLElement>('.painlessPeek-filter');
                if (!filterDiv) return;
                for (const [optionName, optionValue] of Object.entries(options)) {
                    const val = optionValue.value;
                    if (optionName === "enabled") {
                        if (val === true) {
                            if (!filterDiv.classList.contains(filterName)) {
                                addFilter(wrapper, filterName);
                            }
                        } else {
                            if (filterDiv.classList.contains(filterName)) {
                                removeFilter(wrapper, filterName);
                            }
                        }
                    } else {
                        filterDiv.setAttribute("data-" + optionName, String(val));
                    }
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
            }
        }

        let currentSelectors: Selector[] = [];

        function updateSelectors(newSelectors: Selector[]) {
            newSelectors.forEach((newSelector) => {
                updateSelector(newSelector);
            });
            currentSelectors = newSelectors;
        }

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.selectors) {
                updateSelectors(changes.selectors.newValue as Selector[]);
            }
        });

        function watchDom() {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length !== 0) {
                        updateSelectors(currentSelectors);
                    }
                });
            });
            observer.observe(document, {
                attributes: true,
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        chrome.storage.sync.get("selectors").then((result) => {
            const selectors = result.selectors as Selector[];
            updateSelectors(selectors);
            watchDom();
        });

        const body = document.getElementsByTagName("body")[0];
        const style = document.createElement('style');
        style.innerHTML = `
.painlessPeek-filter-wrapper{
    position: relative;
    overflow: hidden;
    max-width: 100%;
    width: fit-content;
    max-height: 100%;
    height: fit-content;
    }
.painlessPeek-filter{
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300vh;
    height: 300vh;
    z-index:9999999999999;
    }
.painlessPeek-filter.greyscale{
    backdrop-filter: grayscale(100%);
    }
.painlessPeek-filter.blur {
    backdrop-filter: blur(20px);
    }
.painlessPeek-filter.blur.greyscale {
    backdrop-filter: blur(20px) grayscale(100%);
    }
.painlessPeek-filter.hue-rotate {
    backdrop-filter:hue-rotate(90deg);
    }
.painlessPeek-filter.letterbox{
    position: absolute;
    top: 0;
    left: 0;
    width:300%;
    height:300%;
    --rect-height: 5%;
    --rect-width: 5%;
    clip-path: polygon( evenodd,
    0 0,
    100% 0,
    100% 100%,
    0% 100%,
    0 0,
    calc(50% - var(--rect-width)) calc(50% - var(--rect-height)),
    calc(50% + var(--rect-width)) calc(50% - var(--rect-height)),
    calc(50% + var(--rect-width)) calc(50% + var(--rect-height)),
    calc(50% - var(--rect-width)) calc(50% + var(--rect-height)),
    calc(50% - var(--rect-width)) calc(50% - var(--rect-height))
    );
}
.painlessPeek-filters.letterbox:hover{
    cursor: none;
}
.painlessPeek-filter.reveal{
    transition: backdrop-filter 5s;
}
.painlessPeek-filter.reveal:hover {
    backdrop-filter: none!important;
}
`;
        body.appendChild(style);
    }
});
