import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'output',
  manifest: {
    name: 'Painless Peek',
    version: '0.0.1',
    description: 'A browser extension to make it easier to more safely view traumatic imagery.',
    permissions: ['scripting', 'activeTab', 'storage', 'tabs', 'contextMenus'],
    host_permissions: ['<all_urls>'],
  },
});
