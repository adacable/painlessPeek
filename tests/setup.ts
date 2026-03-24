import { beforeEach, vi } from 'vitest';

const store: Record<string, unknown> = {};

const chromeMock = {
  storage: {
    sync: {
      get: vi.fn((keys: string | string[], cb?: (result: Record<string, unknown>) => void) => {
        const key = Array.isArray(keys) ? keys[0] : keys;
        const result = { [key]: store[key] };
        if (cb) {
          cb(result);
          return undefined;
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>, cb?: () => void) => {
        Object.assign(store, items);
        if (cb) {
          cb();
          return undefined;
        }
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
  },
};

// Reset store between tests
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.clearAllMocks();
});

Object.assign(global, { chrome: chromeMock });
