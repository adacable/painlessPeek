
var defaultSelectors = [
    {
        "name": "images",
        "selector": "img",
        "url": "*",
    },{
        "name": "videos",
        "selector": "video",
        "url": "*",
        "filters": []
    },{
        "name": "images on t.me",
        "selector": "tgme_widget_message_photo_wrap",
        "url": "t.me/*",
        "filters": []
    }
]
var defaultFilters = [{
    "name": "greyscale",
    "description": "Make the image black and white",
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
    'options': {
        "enabled": {
            'value': false,
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
    console.log(filter);
    form = document.createElement("form");
    h3 = document.createElement("h3");
    h3.innerHTML = filter["name"];
    form.appendChild(h3);
    form.className = "filter";
    form.id = filter["name"]
    options = filter["options"]
    form.appendChild(makeOptionDiv(options["enabled"],"enabled"));
    for (var key in options) {
        if (key == "enabled") {
            continue;
        }
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
    if (option["description"]) {
        p = document.createElement("p");
        p.innerHTML = option["description"];
        div.appendChild(p);
    }
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
