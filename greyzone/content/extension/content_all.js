console.log("initiated content_all.js");

filters = {
    "greyscale": {
    },
    "blur": {
    },
    "reveal": {
    },
    "hue-rotate": {
    },
    "letterbox": {
        "add": function(element, options) {
            //wrap image in outer
            image = element
            var outer = document.createElement('div');
            outer.classList.add('greyzone-filter');
            image.parentNode.insertBefore(outer, image);
            outer.appendChild(image);
            //create letterbox
            var letterbox = document.createElement('div');
            letterbox.classList.add('letterbox');
            //set iptions
            letterbox.style.setProperty('--rect-height', options["rect-height"]);
            letterbox.style.setProperty('--rect-width', options["rect-width"]);
            outer.appendChild(letterbox);
        },
        "remove": function(element) {
            image = element
            wrapper = element.parentNode;
            orignialParent = wrapper.parentNode;
            orignialParent.insertBefore(image, wrapper);
            orignialParent.removeChild(wrapper);
        },
        "update": function(element, options) {
            image = element
            wrapper = element.parentNode;
            orignialParent = wrapper.parentNode;
            orignialParent.insertBefore(image, wrapper);
            orignialParent.removeChild(wrapper);
        }
    }
};


function updateSelector(selector) {
    elements = document.querySelectorAll(selector.selector);
    wrappers = []
    elements.forEach((element) => {
        //check if wrapped by greyzone
        if (element.parentNode.classList.contains("greyzone-filter-wrapper")) {
            wrappers.push(element.parentNode);
        }else{
            wrapper = wrapElement(element);
            wrappers.push(wrapper);
        }
    });
    wrappers.forEach((wrapper) => {
        selector.filters.forEach((filterOpts) => {
            filterName = filterOpts["name"];
            opts = filterOpts["options"];
            filter = filters[filterName];
            if (filter.add != undefined) {
                filter.add(wrapper, opts);
            }else{
                updateFilter(wrapper, filterName, opts);
            }
        })
    })
};

function wrapElement(element) {
    //wrap image in .greyzone-filter
    var wrapper = document.createElement('div');
    wrapper.classList.add('greyzone-filter-wrapper');
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    filtersDiv = document.createElement('div');
    filtersDiv.classList.add('greyzone-filters');
    for (let filterName in filters) {
        filterDiv = document.createElement('div');
        filterDiv.classList.add(filterName);
        filterDiv.classList.add('greyzone-filter');
        filtersDiv.appendChild(filterDiv);
    };
    wrapper.appendChild(filtersDiv);
    return wrapper;
}

function addFilter(element, filterName, options) {
    filter = filters[filterName];
    wrapper = wrapElement(element)
    filter.add(wrapper, options);
}
function updateFilter(wrapper,filterName, options) {
    filter = filters[filterName];
    if (filter.update != undefined) {
        filter.update(wrapper, options);
    }else{
        filterDiv = wrapper.querySelector('.'+filterName);
        console.log(filterDiv);
        for (let [optionName, optionValue] of Object.entries(options)) {
            val =optionValue["value"];
            console.log(val);
            filterDiv.setAttribute("data-" + optionName,val);
            if (optionName == "enabled") {
                if (val == true) {
                    filterDiv.addClass("enabled");
                }else{
                    filterDiv.removeClass("enabled");
                }
            }
        }
    }
}
function removeFilter(wrapper, filterName) {
    filter = filters[filterName];
    wrapper = element.parentNode;
    if (filter.remove != undefined) {
        filter.remove(wrapper);
    }else{
        filterDiv = wrapper.querySelector('.'+filterName);
        filterDiv.style.display = "none";
    }
}



function updateSelectors(newSelectors) {
    changedSelectors = [];
    prevSelectors = currentSelectors;
    newSelectors.forEach((newSelector) => {
        if (!(newSelector in prevSelectors)) {
            changedSelectors.push(newSelector);
        }       
    });
    changedSelectors.forEach((changedSelector) => {
        updateSelector(changedSelector);
    });
    currentSelectors = newSelectors;
}





//run on selectors change
currentSelectors = {};
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == "selectors") {
            updateSelectors(newValue);
        };
    };
    currentSelectors = selectors;
});
//run on load
currentSelectors = {}
chrome.storage.sync.get("selectors").then((result) => {
    selectors = result.selectors;
    updateSelectors(selectors);
});


//append css to page
var body = document.getElementsByTagName("body")[0];
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
.greyzone-filter-wrapper{
    position: relative;
    }

.greyzone-filters{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.greyzone-filters .greyzone-filter{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.greyzone-filter.greyscale.enabled{
    backdrop-filter: grayscale(100%);
}
.greyzone-filters .blur .enabled {
    backdrop-filter: blur(20px) !important;
    }
.greyzone-filters .letterbox .enabled {
    position: absolute;
    top: 0;
    left: 0;
    width:200vh;
    height:200vh;
    --rect-height: 10px;
    --rect-width: 100%;
      clip-path: polygon( evenodd,
    /* outer rect */
    0 0, /* top - left */
    100% 0, /* top - right */
    100% 100%, /* bottom - right */
    0% 100%, /* bottom - left */
    0 0, /* and top - left again */
    /* do the same with inner rect */
    /*y,x*/
    /*top left*/

    calc(50% - var(--rect-width)) calc(50% - var(--rect-height)),
    calc(50% + var(--rect-width)) calc(50% - var(--rect-height)),
    calc(50% + var(--rect-width)) calc(50% + var(--rect-height)),
    calc(50% - var(--rect-width)) calc(50% + var(--rect-height)),
    calc(50% - var(--rect-width)) calc(50% - var(--rect-height))
    );
    backdrop-filter: blur(10px);
}
`
b = `
.greyzone-filters  .greyscale.blur {filter: blur(20px) saturate(0) !important} 
.greyzone-filters   .reveal:hover {filter: none!important;}
.greyzone-filters   .hue-rotate {filter:hue-rotate(90deg);}`
body.appendChild(style);
