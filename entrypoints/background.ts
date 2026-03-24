import type { Selector } from '../shared/types';

export default defineBackground(() => {
    console.log("background.js loaded");

    const defaultSelectors: Selector[] = [
        {
            name: "images",
            selector: "img",
            url: "*",
            filters: []
        }
    ];

    chrome.storage.sync.get("selectors", function(data: { selectors?: Selector[] }) {
    });
});
