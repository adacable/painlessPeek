console.log("background.js loaded");

var defaultSelectors = [
    {
        "name": "images",
        "selector": "img",
        "url": "*",
        "filters": []
    }
]
var installedSelectors = {}
var selectors = {}
chrome.storage.sync.get("selectors", function(data) {
});

