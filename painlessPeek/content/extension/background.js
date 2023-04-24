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
    if (data["selectors"] == undefined || Object.keys(data["selectors"]).length == 0) {
        selectors = defaultSelectors;
        console.log(selectors)
        console.log("no selectors found, using default selectors")
    }else{
        selectors = data["selectors"];
        console.log("selectors found, using selectors")
    }
    chrome.storage.sync.set({"selectors": selectors}).then(function() {})
});


chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
      id: "ApplyFilter",
      title: "Apply a filter",
      type: 'normal',
      contexts: ['all']
    });
});


chrome.contextMenus.onClicked.addListener((item, tab) => {
    const filterID = item.menuItemId;
    const filter = filters.find(filter => filter.name === filterID);
    chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [filter["script"]]
  });
});

