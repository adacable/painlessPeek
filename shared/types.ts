export interface FilterOption {
  value: boolean | number;
  type: 'checkbox' | 'range';
  description?: string;
  max?: number;
  min?: number;
}

export interface Filter {
  name: string;
  description?: string;
  peek: boolean;
  options: Record<string, FilterOption>;
}

export interface Selector {
  name: string;
  selector: string;
  url: string;
  filters: Filter[];
}

export interface FilterImpl {
  add?: (wrapper: HTMLElement) => void;
  remove?: (wrapper: HTMLElement) => void;
  update?: (wrapper: HTMLElement, options: Record<string, FilterOption>) => void;
}
