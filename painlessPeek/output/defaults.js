const defaultPeeks = {
    "letterbox" : {
        "enabled": true,
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
const defaultFilters = {
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
        "enabled": true,
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
const defaultSels = [
    {
        "name" : "images",
        "urls": [
            ".*" //all urls
        ],
        "selector" : function () {
            var raw_images = document.querySelectorAll("img");
            var background_images = document.querySelectorAll("*[style*='background-image']");
            var images = [];
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
const egSels = [
    {
        "name" : "Example",
        "urls": [
            ".*" //all urls
        ],
        "selector" : ".demo img",
        "peeks" : defaultPeeks,
        "filters" : defaultFilters
    }
]
export { defaultSels, egSels };
