export const backdropFilterValues: Record<string, string> = {
    greyscale: 'grayscale(100%)',
    blur: 'blur(20px)',
    'hue-rotate': 'hue-rotate(90deg)',
};

export function recomputeBackdropFilter(filterDiv: HTMLElement): void {
    const active = Object.keys(backdropFilterValues)
        .filter((name) => filterDiv.classList.contains(name))
        .map((name) => backdropFilterValues[name]);
    filterDiv.style.backdropFilter = active.join(' ');
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
