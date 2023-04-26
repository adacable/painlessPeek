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
            var outer = element;
            image = element.querySelector("img");
            //create letterbox
            var letterbox = element.querySelector(".greyzone-filter");
            letterbox.classList.add('letterbox');
            //set iptions
            outer.addEventListener('mousemove', function(e) {
                moveLetterbox(e,letterbox,outer);
            });
        },
        "remove": function(element) {
            element.removeEventListener('mousemove', moveLetterbox);
            letterbox = element.querySelector(".greyzone-filter");
            letterbox.classList.remove('letterbox');
        }
    }
};
function moveLetterbox(e,letterbox,outer) {
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
            updateFilter(wrapper, filterName, opts);
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
    filtersDiv.classList.add('greyzone-filter');
    wrapper.appendChild(filtersDiv);
    return wrapper;
}

function updateFilter(wrapper,filterName, options) {
    filter = filters[filterName];
    if (filter.update != undefined) {
        filter.update(wrapper, options);
    }else{
        filterDiv = wrapper.querySelector('.greyzone-filter');
        for (let [optionName, optionValue] of Object.entries(options)) {
            val = optionValue["value"];
            if (optionName == "enabled") {
                if (val == true) {
                    if (!(filterDiv.classList.contains(filterName))) {
                        addFilter(wrapper, filterName);
                    }
                }else{
                    if (filterDiv.classList.contains(filterName)) {
                        removeFilter(wrapper, filterName);
                    }
                }
            }else{
                filterDiv.setAttribute("data-" + optionName,val);
            }
        }
    }
}
function  addFilter(wrapper, filterName){
    filter = filters[filterName];
    console.log("adding filter: " + filterName);
    filterDiv = wrapper.querySelector('.greyzone-filter');
    if ('add' in filter) {
        filter.add(wrapper);
    }else{
        filterDiv.classList.add(filterName);
    }
}
function removeFilter(wrapper, filterName) {
    filter = filters[filterName];
    console.log("removing filter: " + filterName);
    filterDiv = wrapper.querySelector('.greyzone-filter');
    if ('remove' in filter) {
        filter.remove(wrapper);
    }else{
        filterDiv.classList.remove(filterName);
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
    if (changedSelectors.length != 0) {
        console.log("changed selectors: " + changedSelectors);
        console.log(newSelectors);
        changedSelectors.forEach((changedSelector) => {
            updateSelector(changedSelector);
        });
    }
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
    overflow: hidden;
    width: fit-content;
    height: fit-content;
    }
.greyzone-filter{
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300vh;
    height: 300vh;
    }
.greyzone-filter.greyscale{
    backdrop-filter: grayscale(100%);
    }
.greyzone-filter.blur {
    backdrop-filter: blur(20px);
    }
.greyzone-filter.blur.greyscale {
    backdrop-filter: blur(20px) grayscale(100%);
    }
.greyzone-filter.hue-rotate {
    backdrop-filter:hue-rotate(90deg);
    }
.greyzone-filter.letterbox{
    position: absolute;
    top: 0;
    left: 0;
    width:300%;
    height:300%;
    --rect-height: 5%;
    --rect-width: 5%;
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
}

.greyzone-filters.letterbox:hover{
    cursor: none;
}
.greyzone-filter.reveal{
    transition: backdrop-filter 5s;
}
.greyzone-filter.reveal:hover {
    backdrop-filter: none!important;
}

`


body.appendChild(style);
