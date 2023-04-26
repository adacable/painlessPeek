{
    "name": "greyscale",
    "selectors": [
        "img"
    ],
    "enabled": false,
    "saturation": {
        "type": "number",
        "max": 100,
        "min": 0,
        "default": 0
    }
    "function": function(element) {
        //simple js to apply css to all elements selected by selector
        properties = "filter: saturate(0)!important; ";
        //compose css
        css = selector + "{" + properties + "}";
        //add css to page
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
    }
}
