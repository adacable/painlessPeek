import type { Filter, Selector } from './types';

export const defaultFilters: Filter[] = [
  {
    name: 'greyscale',
    description: 'Make the image black and white',
    peek: false,
    filterString: 'grayscale(percent)',
    options: {
      enabled: {
        value: false,
        type: 'checkbox',
        description: 'Enable greyscale filter',
      },
      percent: {
        value: 100,
        type: 'range',
        min: 0,
        max: 100,
        unit: '%',
        description: 'Greyscale amount',
      },
    },
  },
  {
    name: 'blur',
    description: 'Blur the image',
    peek: false,
    filterString: 'blur(radius)',
    options: {
      enabled: {
        value: false,
        type: 'checkbox',
        description: 'Enable blur filter',
      },
      radius: {
        value: 20,
        type: 'range',
        min: 0,
        max: 50,
        unit: 'px',
        description: 'Blur radius',
      },
    },
  },
  {
    name: 'reveal',
    description: 'Reveal the image on hover',
    peek: true,
    options: {
      enabled: {
        value: false,
        type: 'checkbox',
        description: 'Reveal the image slowly on hover',
      },
    },
  },
  {
    name: 'hue-rotate',
    description:
      'Rotate the hue of the image, to make colours appear different',
    peek: false,
    filterString: 'hue-rotate(deg)',
    options: {
      enabled: {
        value: false,
        type: 'checkbox',
        description: 'Enable hue-rotate filter',
      },
      deg: {
        value: 90,
        type: 'range',
        min: 0,
        max: 360,
        unit: 'deg',
        description: 'Hue rotation amount',
      },
    },
  },
  {
    name: 'letterbox',
    description: 'Reveal a small rectangle of the image on hover',
    peek: true,
    options: {
      enabled: {
        value: true,
        type: 'checkbox',
        description: 'Enable letterbox filter',
      },
      width: {
        value: 5,
        type: 'range',
        min: 0,
        max: 50,
        unit: '%',
        description: 'Letterbox window width',
      },
      height: {
        value: 5,
        type: 'range',
        min: 0,
        max: 50,
        unit: '%',
        description: 'Letterbox window height',
      },
    },
  },
];

export const defaultSelectors: Selector[] = [
  { name: 'Images', selector: 'img', url: '*' },
];
