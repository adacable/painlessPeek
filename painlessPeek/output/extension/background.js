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

