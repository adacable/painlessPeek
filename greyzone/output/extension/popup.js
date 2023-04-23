
var defaultSelectors = [
    {
        "name": "images",
        "selector": "img",
        "url": "*",
    },{
        "name": "videos",
        "selector": "video",
        "url": "*",
    },{
        "name": "images on t.me",
        "selector": "img",
        "url": "t.me/*",
    }
]
var defaultFilters = [{
    "name": "greyscale",
    options: {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable greyscale filter"
        }
    }

}, {
    "name": "blur",
    options: {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable blur filter"
        }
    }
},{
    "name": "reveal",
    options: {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable reveal filter"
        }
    }

},{
    "name": "hue-rotate",
    options: {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable hue-rotate filter"
        },
        "angle": {
            'value': 90,
            'type': "range",
            'max': 360,
            'min': 0,
            "description": "The angle of the hue-rotate filter"
        }
    }
},{
    "name": "letterbox",
    options: {
        "enabled": {
            'value': false,
            'type': "checkbox",
            "description": "Enable letterbox filter"
        },
        "rect-width": {
            'value': 20,
            'type': "range",
            'max': 100,
            'min': 0,
            "description": "The width of the unfiltered letterbox, as a percentage"
        },
        "rect-height": {
            'value': 20,
            'type': "range",
            'max': 100,
            'min': 0,
            "description": "The height of the unfiltered letterbox, as a percentage"
        }
    }
}
];
function initialiseSelectors(selectors, filters) {
    selectors.forEach(function(selector) {
        selector["filters"] = filters;
    });
    chrome.storage.sync.set({"selectors": selectors}).then(function() {})
}
function resetSelectors() {
    initialiseSelectors(defaultSelectors, defaultFilters);
}
function makeUI(selectors){
    console.log(selectors);
    var selectordiv = document.getElementById("selectors");  
    selectors.forEach((selector) => {
        console.log(selector);
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
    div = addFilters(filters,selector,div);
    return div;
};
function addFilters(filters,selector,selectordiv) {
    filters.forEach((filter) => {
        filterdiv = makeFilterDiv(filter,selector);
        selectordiv.appendChild(filterdiv);
    });
    return selectordiv;
}
function makeFilterDiv(filter) {
    form = document.createElement("form");
    h3 = document.createElement("h3");
    h3.innerHTML = filter["name"];
    form.appendChild(h3);
    form.className = "filter";
    form.id = filter["name"]
    options = filter["options"]
    if (options["enabled"] != undefined) {
        options["enabled"]["value"] = false;
    }
    isEnabled = options["enabled"]["value"];
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
    label = document.createElement("label");
    label.innerHTML = optionName;
    label.htmlFor = optionName;
    div.appendChild(label);
    input = document.createElement("input");
    input.type = option["type"];
    input.name = optionName;
    input.className = "option";
    if (input.type == "checkbox") {
        input.checked = option["value"];
    }else
    if (input.type == "range") {
        input.max = option["max"];
        input.min = option["min"];
        input.value = option["value"];
    }
    input.addEventListener("change", updateSelectors);
    div.appendChild(input);
    return div;
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
                    optName = key;
                    optionDiv = filterDiv.querySelector("input[name='"+key+"']");
                    if (optionDiv.type == "checkbox") {
                        val = optionDiv.checked;
                    }else if (optionDiv.type == "range") {
                        val = optionDiv.value;
                    }
                    newsels[i]["filters"][j]["options"][optName]["value"] = val;
                }

            }
        };
        chrome.storage.sync.set({"selectors": newsels}).then(function() {})
    })
}



chrome.storage.sync.get('selectors').then((result) => {
    console.log(result["selectors"])
    sels = result["selectors"]
    makeUI(sels);
})

