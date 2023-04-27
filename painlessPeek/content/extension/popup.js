
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
        appendDiv = makeSelectorDiv(selector)
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
    filters = selector["filters"]
    filterDiv = addFilters(filters,selector,div);
    return filterDiv;
};
function addFilters(filters,selector,selectordiv) {
    peeks = filters.filter((filter) => filter["peek"]);
    cosmeticFilters = filters.filter((filter) => !(filter["peek"]));
    peekSel = makePeekSel(peeks);
    selectordiv.appendChild(peekSel);
    cosmeticFilters.forEach((filter) => {
        filterDiv = makeFilterDiv(filter);
        selectordiv.appendChild(filterDiv);
    });
    return selectordiv;
}
function makePeekSel(peeks) {
    peeksSelector = document.createElement("select");
    peeksSelector.className = "peeks";
    peeks.forEach((peek) => {
        peekOpt = document.createElement("option");
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
        sels = data["selectors"];
        thisSelID = e["srcElement"]["parentElement"]["id"];
        thisSel = sels.find((sel) => sel["name"] == thisSelID);
        selIndex = sels.indexOf(thisSel);
        filters = thisSel["filters"];
        peeks = thisSel["filters"].filter((filter) => filter["peek"]);
        peekEnabled = e["srcElement"]["value"];
        peeks.forEach((peek) => {
            filterIndex = filters.indexOf(peek);
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
function updateFilters(e) {
    chrome.storage.sync.get("selectors", function(data) {
        sels = data["selectors"];
        thisSelID = e["srcElement"]["parentElement"]["parentElement"]["id"];
        thisSel = sels.find((sel) => sel["name"] == thisSelID);
        selIndex = sels.indexOf(thisSel);
        filters = thisSel["filters"];
        thisFilterID = e["srcElement"]["parentElement"]["id"];
        thisFilter = filters.find((filter) => filter["name"] == thisFilterID);
        filterIndex = filters.indexOf(thisFilter);
    })
}

function makeFilterDiv(filter) {
    form = document.createElement("form");
    form.className = "filter";
    form.id = filter["name"]
    options = filter["options"]
    header = document.createElement("h3");
    header.innerHTML = filter["name"];
    form.appendChild(header);
    for (var key in options) {
        option = options[key];
        optionDiv = makeOptionDiv(option,key);
        form.appendChild(optionDiv);
    }

    return form;
}
function makeOptionDiv(option,optionName){
    var div = document.createElement("div");
    div.className = "option"
    div.classList.add(optionName);
    input = document.createElement("input");
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
    label = document.createElement("label");
    label.innerHTML = optionName;
    label.classList.add(optionName);
    label.htmlFor = optionName;
    div.appendChild(label);
    return div;
}
function updateFilters(e) {
    chrome.storage.sync.get("selectors", function(data) {
        sels = data["selectors"];
        thisSelID = e["srcElement"]["parentElement"]["parentElement"]['parentElement']["id"];
        thisSel = sels.find((sel) => sel["name"] == thisSelID);
        selIndex = sels.indexOf(thisSel);
        filters = thisSel["filters"];
        console.log(filters);
        thisFilterID = e["srcElement"]["parentElement"]['parentElement']["id"];
        thisFilter = filters.find((filter) => filter["name"] == thisFilterID);
        filterIndex = filters.indexOf(thisFilter);
        options = thisFilter["options"];
        thisOptionName = e["srcElement"]["name"];
        thisOption = options[thisOptionName];
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
        oldSels = data["selectors"];
        var newsels = oldSels;
        for (var i = 0; i < oldSels.length; i++) {
            oldSel = oldSels[i];
            selDiv = document.getElementById(oldSel["name"]);
            selName = oldSel["name"];
            for (var j = 0; j < oldSel["filters"].length; j++) {
                oldFilter = oldSel["filters"][j];
                filterDiv=  selDiv.querySelector("#"+oldFilter["name"]);
                filterName = oldFilter["name"];
                for (var key in oldFilter["options"]) {
                    oldOption = oldFilter["options"][key];
                    if (key == "enabled") {
                        optionDiv = filterDiv.querySelector("input[name='"+filterName+"']");
                    }else {
                        optionDiv = filterDiv.querySelector("input[name='"+key+"']");
                    }
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
    if (result["selectors"] == undefined) {
        return resetSelectors();
    }
    else {
        return result["selectors"];
    }
}

chrome.storage.sync.get('selectors').then((result) => {
    sels = checkSelsLoaded(result);
    makeUI(sels);
})
