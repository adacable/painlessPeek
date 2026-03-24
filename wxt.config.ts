import { defineConfig } from 'wxt';
import { version } from './package.json';

export default defineConfig({
  outDir: 'output',
  manifest: {
    name: 'Painless Peek',
    version,
    description:
      'A browser extension to make it easier to more safely view traumatic imagery.',
    permissions: ['scripting', 'activeTab', 'storage', 'tabs', 'contextMenus'],
    host_permissions: ['<all_urls>'],
    browser_specific_settings: {
      gecko: {
        id: 'painless-peek@betterorganising.systems',
        strict_min_version: '128.0',
      },
    },
  },
});
