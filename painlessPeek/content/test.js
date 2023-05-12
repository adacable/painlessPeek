function filterSels(selectors){
    selectors.forEach(function (selector) {
        selector.urls.forEach(function (urlPattern) {
            if (document.URL.match(urlPattern)) {
                if (typeof selector.selector == "function") {
                    elements = selector.selector();
                }else{
                    elements = document.querySelectorAll(selector.selector);
                }
                elements.forEach(function (element) {
                    element.classList.add("painlessPeek-"+selector.name);
                    addWatcher(element,selector);
                });
            };
        });
    } );
}
function addWatcher(element,selector){
    element.addEventListener("mouseover", function (event) {
        wrap(element,selector);
    });
}
function wrap(element,selector){
    var wrapper = document.createElement("div");
    wrapper.classList.add("painlessPeek-wrapper");
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    filterDiv = document.createElement("div");
    filterDiv.classList.add("painlessPeek-filter");
    wrapper.appendChild(filterDiv);
    if (selector.peeks.letterbox.enabled) {
        addLetterbox(filterDiv,wrapper,selector);
    }
    wrapper.addEventListener("mouseout", function (event) {
        unwrap(wrapper);
    });
}
function addLetterbox(filterDiv,wrapper,selector){
    filterDiv.classList.add("painlessPeek-letterbox");
    filterDiv.setAttribute("data-width",selector.peeks.letterbox.vars.width.value + selector.peeks.letterbox.vars.width.unit);
    filterDiv.setAttribute("data-height",selector.peeks.letterbox.vars.height.value + selector.peeks.letterbox.vars.height.unit);
    wrapper.addEventListener("mousemove", function (event) {
        moveFilter(event, filterDiv, wrapper);
    });
}
function moveFilter(e,letterbox,outer) {
    //make letterbox follow mouse if over image
    offset = outer.getBoundingClientRect();
    leftOffset = offset.left;
    topOffset = offset.top;
    boxWidth = outer.offsetWidth;
    boxHeight = outer.offsetHeight;
    //fix mouse in cenre
    xpos = e.clientX - leftOffset - (3*boxWidth / 2);
    ypos = e.clientY - topOffset - (3*boxHeight / 2);
    //move letterbox
    letterbox.style.left = xpos + 'px';
    letterbox.style.top = ypos + 'px';
}


function unwrap(wrapper){
    element = wrapper.firstChild;
    wrapper.parentNode.insertBefore(element, wrapper);
    wrapper.remove();
}
defaultPeeks = {
    "letterbox" : {
        "enabled": false,
        "vars": {
            "width": {
                "humanName": "Width",
                "type": "number",
                "value": 10,
                "unit": "%",
                "max": 100,
                "min": 0
            },
            "height": {
                "humanName": "Height",
                "type": "number",
                "value": 10,
                "unit": "%",
                "max": 100,
                "min": 0
            }
        }
    }
};
defaultFilters = {
    "blur" : {
        "enabled": true,
        "filterString": "blur(radius)",
        "vars": {
            "radius": {
                "humanName": "Blur radius",
                "type": "number",
                "value": 5,
                "unit": "px",
                "max": 50,
                "min": 0
            }
        }
    },
    "grayscale" : {
        "enabled": false,
        "filterString": "grayscale(percent)",
        "vars": {
            "percent": {
                "humanName": "Percent",
                "type": "number",
                "value": 100,
                "unit": "%",
                "max": 100,
                "min": 0
            }
        }
    },
    "hue-rotate" : {
        "enabled": false,
        "filterString": "hue-rotate(deg)",
        "vars": {
            "deg": {
                "humanName": "Rotation",
                "type": "number",
                "value": 90,
                "unit": "deg",
                "humanUnit": "&deg;",
                "max": 360,
                "min": 0
            }
        }
    }
}
selectors = [
    {
        "name" : "images",
        "urls": [
            ".*" //all urls
        ],
        "selector" : function () {
            raw_images = document.querySelectorAll("img");
            background_images = document.querySelectorAll("*[style*='background-image']");
            images = [];
            raw_images.forEach(function (image) {
                images.push(image);
            });
            background_images.forEach(function (image) {
                images.push(image);
            });
            return images;
        },
        "peeks" : defaultPeeks,
        "filters" : defaultFilters
    }
]

function makeOptions(selectors){
    var optionDiv = document.getElementById("painlessPeekoptions");
    selectors.forEach(function (selector) {
        var selectorDiv = document.createElement("div");
        selectorDiv.classList.add("painlessPeek-selector");
        selectorDiv.id = "painlessPeek-selector-"+selector.name;
        var selectorName = document.createElement("h2");
        selectorName.innerHTML = selector.name;
        selectorDiv.appendChild(selectorName);
        var selectorFilters = document.createElement("form");
        selectorFilters.classList.add("painlessPeek-filters");
        peeksDiv = document.createElement("div");
        peeksDiv.classList.add("painlessPeek-peeks");
        Object.keys(selector.peeks).forEach(function (peekName) {
            var peekDiv = document.createElement("div");
            peekDiv.classList.add("painlessPeek-peek-options");
            peekDiv.id = "painlessPeek-peek-"+peekName;
            var peekNameDiv = document.createElement("h3");
            peekNameDiv.innerHTML = peekName;
            peekDiv.appendChild(peekNameDiv);
            var peekEnabled = document.createElement("input");
            peekEnabled.type = "checkbox";
            peekEnabled.checked = selector.peeks[peekName].enabled;
            peekEnabled.addEventListener("change", function (event) {
                selector.peeks[peekName].enabled = peekEnabled.checked;
                updatePageSels(selectors);
            });
            peekDiv.appendChild(peekEnabled);
            peeksDiv.appendChild(peekDiv);
        });
        selectorDiv.appendChild(peeksDiv);
        selectorDiv.appendChild(selectorFilters);
        Object.keys(selector.filters).forEach(function (filterName) {
            var filterDiv = document.createElement("div");
            filterDiv.classList.add("painlessPeek-filter-options");
            filterDiv.id = "painlessPeek-filter-"+filterName;
            var filterNameDiv = document.createElement("h3");
            filterNameDiv.innerHTML = filterName;
            filterDiv.appendChild(filterNameDiv);
            var filterEnabled = document.createElement("input");
            filterEnabled.type = "checkbox";
            filterEnabled.checked = selector.filters[filterName].enabled;
            filterEnabled.addEventListener("change", function (event) {
                selector.filters[filterName].enabled = filterEnabled.checked;
                updatePageSels(selectors);
            });
            filterDiv.appendChild(filterEnabled);
            var vars = selector.filters[filterName].vars;
            Object.keys(vars).forEach(function (varName) {
                var v = vars[varName];
                var varDiv = document.createElement("div");
                varDiv.id = "painlessPeek-filter-"+filterName+"-"+varName;
                var varNameDiv = document.createElement("h4");
                varNameDiv.innerHTML = varName;
                varDiv.appendChild(varNameDiv);
                var varInput = document.createElement("input");
                varInput.type = "range";
                varInput.min = v.min;
                varInput.max = v.max;
                varInput.value = v.value;
                valueDiv = document.createElement("div");
                valueDiv.id = "painlessPeek-filter-"+filterName+"-"+varName+"-value";
                if (v.humanUnit){
                    valueDiv.innerHTML = v.value + v.humanUnit;
                }else{
                    valueDiv.innerHTML = v.value + v.unit;
                }
                varDiv.appendChild(varInput);
                varDiv.appendChild(valueDiv);
                filterDiv.appendChild(varDiv);
                varInput.addEventListener("change", function (event) {
                    v.value = varInput.value;
                    updatePageSels(selectors);
                    updateDiv = document.getElementById("painlessPeek-filter-"+filterName+"-"+varName+"-value");
                    if (v.humanUnit){
                        updateDiv.innerHTML = v.value + v.humanUnit;
                    }else{
                        updateDiv.innerHTML = v.value + v.unit;
                        }       
                    })
                });
            selectorFilters.appendChild(filterDiv);
        });
        selectorDiv.appendChild(selectorFilters);
        optionDiv.appendChild(selectorDiv);
    });
}       


function getFilterString(filter){
    filterString = filter.filterString;
    Object.keys(filter.vars).forEach(function (varName) {
        str = filter.vars[varName].value + filter.vars[varName].unit;
        filterString = filterString.replace(varName, str);
    });
    return filterString;
}
function updateCSS(selectors){
    var styleElements = document.querySelectorAll("style.painlessPeekStyle");
    if (styleElements.length == 0) {
        styleElement = document.createElement("style");
        styleElement.classList.add("painlessPeekStyle");
        document.head.appendChild(styleElement);
    } else {
        styleElement = styleElements[0];
    }
    var styleContent = "";
    selectors.forEach(function (selector) {
        var filterString = ""
        Object.keys(selector.filters).forEach(function (filterName) {
            filter = selector.filters[filterName];
            if (filter.enabled) {
                filterString += getFilterString(filter) + " ";
            }
        });
        styleContent +=  ".painlessPeek-"+selector.name+" { filter: "+filterString+" !important; }";
        styleContent += ".painlessPeek-wrapper .painlessPeek-"+selector.name+" { filter: none !important; }";
        styleContent += ".painlessPeek-wrapper .painlessPeek-filter { backdrop-filter: "+filterString+" !important; }";
    });
    styleElement.innerHTML = styleContent;
}
function initialCSS(){
    cssFile = "test.css";
    cssContents = "";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", cssFile, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            cssContents = xhr.responseText;
            var styleElement = document.createElement("style");
            styleElement.classList.add("painlessPeekCoreStyle");
            styleElement.innerHTML = cssContents;
            document.head.appendChild(styleElement);
        }
    }
    xhr.send();
}
function updateSelectors(selectors){
    updateCSS(selectors);
    filterSels(selectors);
}
function firstRun(){
    initialCSS();
    getSels = 
    updateSelectors(pageSels);
}
function updatePageSels(selectors){
    pageSels = selectors;
    pageSelsUpdated();
}
function pageSelsUpdated(){
    updateCSS(pageSels);
}
optSels = selectors;
pageSels = selectors;
firstRun();
makeOptions(selectors);
