import type { Filter, Selector } from './types';

export const defaultFilters: Filter[] = [
  {
    name: 'greyscale',
    description: 'Make the image black and white',
    peek: false,
    options: { enabled: { value: false, type: 'checkbox', description: 'Enable greyscale filter' } },
  },
  {
    name: 'blur',
    description: 'Blur the image',
    peek: false,
    options: { enabled: { value: false, type: 'checkbox', description: 'Enable blur filter' } },
  },
  {
    name: 'reveal',
    description: 'Reveal the image on hover',
    peek: true,
    options: { enabled: { value: false, type: 'checkbox', description: 'Reveal the image slowly on hover' } },
  },
  {
    name: 'hue-rotate',
    description: 'Rotate the hue of the image, to make colours appear different',
    peek: false,
    options: { enabled: { value: false, type: 'checkbox', description: 'Enable hue-rotate filter' } },
  },
  {
    name: 'letterbox',
    description: 'Reveal a small rectangle of the image on hover',
    peek: true,
    options: { enabled: { value: true, type: 'checkbox', description: 'Enable letterbox filter' } },
  },
];

export const defaultSelectors: Selector[] = [
  { name: 'Images', selector: 'img', url: '*', filters: [] },
];
