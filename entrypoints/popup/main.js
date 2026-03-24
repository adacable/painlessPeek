
var defaultSelectors = [
    {
        "name": "Images",
        "selector": "img",
        "url": "*",
    }
]
var defaultFilters = [{
    "name": "greyscale",
    "description": "Make the image black and white",
    "peek" : false,
    'options': {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable greyscale filter"
        }
    }

}, {
    "name": "blur",
    "description": "Blur the image",
    "peek" : false,
    'options': {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable blur filter"
        }
    }
},{
    "name": "reveal",
    "description": "Reveal the image on hover",
    "peek" : true,
    'options': {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "reveal the image slowly on hover"
        }
    }

},{
    "name": "hue-rotate",
    "description": "Rotate the hue of the image, to make colours appear different",
    "peek" : false,
    'options': {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable hue-rotate filter"
        }
    }
},{
    "name": "letterbox",
    "description": "Reveal a small rectangle of the image on hover",
    "peek" : true,
    'options': {
        "enabled": {
            'value': true,
            'type': "checkbox",
            "description": "Enable letterbox filter"
        },
    }
}
];


function initialiseSelectors(selectors, filters) {
    selectors.forEach(function(selector) {
        selector["filters"] = filters;
    });
    chrome.storage.sync.set({"selectors": selectors}).then(function() {})
    return selectors;
}
function resetSelectors() {
    return initialiseSelectors(defaultSelectors, defaultFilters);
}
function makeUI(selectors){
    var selectordiv = document.getElementById("selectors");
    selectors.forEach((selector) => {
        var appendDiv = makeSelectorDiv(selector)
        selectordiv.appendChild(appendDiv);
    })
}

function makeSelectorDiv(selector) {
    var div = document.createElement("div");
    div.id = selector["name"]
    div.className = "selector"
    var name = document.createElement("h2");
    name.innerHTML = selector["name"]
    div.appendChild(name);
    var filters = selector["filters"]
    var filterDiv = addFilters(filters, selector, div);
    return filterDiv;
};
function addFilters(filters, selector, selectordiv) {
    var peeks = filters.filter((filter) => filter["peek"]);
    var cosmeticFilters = filters.filter((filter) => !(filter["peek"]));
    var peekSel = makePeekSel(peeks);
    selectordiv.appendChild(peekSel);
    cosmeticFilters.forEach((filter) => {
        var filterDiv = makeFilterDiv(filter);
        selectordiv.appendChild(filterDiv);
    });
    return selectordiv;
}
function makePeekSel(peeks) {
    var peeksSelector = document.createElement("select");
    peeksSelector.className = "peeks";
    peeks.forEach((peek) => {
        var peekOpt = document.createElement("option");
        peekOpt.innerHTML = peek["name"];
        if (peek["options"]["enabled"]["value"]) {
            peekOpt.selected = true;
        }
        peeksSelector.appendChild(peekOpt);
    });
    peeksSelector.addEventListener("change", updatePeeks);
    return peeksSelector;
}
function updatePeeks(e) {
    chrome.storage.sync.get("selectors", function(data) {
        var sels = data["selectors"];
        var thisSelID = e["srcElement"]["parentElement"]["id"];
        var thisSel = sels.find((sel) => sel["name"] == thisSelID);
        var selIndex = sels.indexOf(thisSel);
        var filters = thisSel["filters"];
        var peeks = thisSel["filters"].filter((filter) => filter["peek"]);
        var peekEnabled = e["srcElement"]["value"];
        peeks.forEach((peek) => {
            var filterIndex = filters.indexOf(peek);
            if (peek["name"] == peekEnabled) {
                peek["options"]["enabled"]["value"] = true;
            } else {
                peek["options"]["enabled"]["value"] = false;
            }
            filters[filterIndex] = peek;
        });
        thisSel["filters"] = filters;
        sels[selIndex] = thisSel;
        chrome.storage.sync.set({"selectors": sels}).then(function() {})
    })
}
function makeFilterDiv(filter) {
    var form = document.createElement("form");
    form.className = "filter";
    form.id = filter["name"]
    var options = filter["options"]
    var header = document.createElement("h3");
    header.innerHTML = filter["name"];
    form.appendChild(header);
    for (var key in options) {
        var option = options[key];
        var optionDiv = makeOptionDiv(option, key);
        form.appendChild(optionDiv);
    }
    return form;
}
function makeOptionDiv(option, optionName){
    var div = document.createElement("div");
    div.className = "option"
    div.classList.add(optionName);
    var input = document.createElement("input");
    input.type = option["type"];
    input.name = optionName;
    input.className = "option";
    if (input.type == "checkbox") {
        input.checked = option["value"];
    }
    if (input.type == "range") {
        input.max = option["max"];
        input.min = option["min"];
        input.value = option["value"];
    }
    input.addEventListener("change", updateFilters);
    div.appendChild(input);
    var label = document.createElement("label");
    label.innerHTML = optionName;
    label.classList.add(optionName);
    label.htmlFor = optionName;
    div.appendChild(label);
    return div;
}
function updateFilters(e) {
    chrome.storage.sync.get("selectors", function(data) {
        var sels = data["selectors"];
        var thisSelID = e["srcElement"]["parentElement"]["parentElement"]['parentElement']["id"];
        var thisSel = sels.find((sel) => sel["name"] == thisSelID);
        var selIndex = sels.indexOf(thisSel);
        var filters = thisSel["filters"];
        console.log(filters);
        var thisFilterID = e["srcElement"]["parentElement"]['parentElement']["id"];
        var thisFilter = filters.find((filter) => filter["name"] == thisFilterID);
        var filterIndex = filters.indexOf(thisFilter);
        var options = thisFilter["options"];
        var thisOptionName = e["srcElement"]["name"];
        var thisOption = options[thisOptionName];
        if (thisOption["type"] == "checkbox") {
            thisOption["value"] = e["srcElement"]["checked"];
        }
        if (thisOption["type"] == "range") {
            thisOption["value"] = e["srcElement"]["value"];
        }
        options[thisOptionName] = thisOption;
        thisFilter["options"] = options;
        filters[filterIndex] = thisFilter;
        thisSel["filters"] = filters;
        sels[selIndex] = thisSel;
        chrome.storage.sync.set({"selectors": sels}).then(function() {})
    })
}

function updateSelectors() {
    chrome.storage.sync.get("selectors", function(data) {
        var oldSels = data["selectors"];
        var newsels = oldSels;
        for (var i = 0; i < oldSels.length; i++) {
            var oldSel = oldSels[i];
            var selDiv = document.getElementById(oldSel["name"]);
            var selName = oldSel["name"];
            for (var j = 0; j < oldSel["filters"].length; j++) {
                var oldFilter = oldSel["filters"][j];
                var filterDiv = selDiv.querySelector("#"+oldFilter["name"]);
                var filterName = oldFilter["name"];
                for (var key in oldFilter["options"]) {
                    var oldOption = oldFilter["options"][key];
                    var optionDiv;
                    if (key == "enabled") {
                        optionDiv = filterDiv.querySelector("input[name='"+filterName+"']");
                    }else {
                        optionDiv = filterDiv.querySelector("input[name='"+key+"']");
                    }
                    var val;
                    if (optionDiv.type == "checkbox") {
                        val = optionDiv.checked;
                    }else if (optionDiv.type == "range") {
                        val = optionDiv.value;
                    }
                    newsels[i]["filters"][j]["options"][key]["value"] = val;
                }
            }
        };
        chrome.storage.sync.set({"selectors": newsels}).then(function() {})
    })
}
function checkSelsLoaded(result) {
    console.log(result);
    if (result["selectors"] == undefined) {
        return resetSelectors();
    }
    else {
        return result["selectors"];
    }
}

chrome.storage.sync.get('selectors').then((result) => {
    var sels = checkSelsLoaded(result);
    makeUI(sels);
})
