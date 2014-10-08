/**
 * Sketch Select – A simple selector engine for Sketch
 * Usage: $("MSLayer"), $("List Item"), $("MSLayer", artboard), $("MSArtboardGroup").each(function() {})
 *
 * Florian Schulz, 2014
 */

var classNames = [
    "MSArtboardGroup",
    "MSDocument",
    "MSLayer",
    "MSLayerGroup",
    "MSOvalShape",
    "MSPage",
    "MSRectangleShape",
    "MSShapeGroup",
    "MSShapePathLayer",
    "MSTextLayer"
];

function $(selector, context) {
    var elements = null;

    // if no context is defined, look for the elements on the current page
    if (context === undefined) {
        context = doc.currentPage();
    }

    if (classNames.indexOf(selector) != -1) {
        elements = $.fn.getElementsByClass(selector, context);
    } else {
        elements = $.fn.getElementsByName(selector, context);
    }

    return elements;
}

$.fn = {

    getElementsByClass: function (selector, context) {

        var elements = [];
        var layers = null;

        if (classNames.indexOf(String(context.className())) != -1) {

            switch (String(context.className())) {

                // Search on a specific Artboard
                case "MSArtboardGroup":
                case "MSLayerGroup":
                    elements.pushArray($.fn.children(selector, context));
                break;

                // Search on a specific Page

                case "MSPage":
                    switch (selector) {
                        case "MSArtboardGroup":

                            // loop through all artboards and execute the function
                            var artboards = context.artboards().objectEnumerator();
                            while (artboard = artboards.nextObject()) {
                                elements.push(artboard);
                            }

                        break;

                        case "MSLayer":
                        case "MSLayerGroup":
                        case "MSOvalShape":
                        case "MSShapeGroup":
                        case "MSShapePathLayer":
                        case "MSRectangleShape":
                        case "MSTextLayer":

                            elements.pushArray($.fn.children(selector, context));

                        break;

                        case "MSPage":
                            elements = context;
                        break;

                        default:
                            log("Unknown selector");
                        break;
                    }
                break;

                default:
                    log("Invalid context");
                break;
            }
        } else {
            log("Unknown context.")
        }
        return elements;
    },
    getElementsByName: function (selector, context) {

        var elements = [];

        // loop through all layers of current page and execute the function
        var layers = context.children().objectEnumerator();
        while (layer = layers.nextObject()) {
            if (layer.name() == selector) {
                elements.push(layer);
            }
        }
        return elements;
    },
    children: function (selector, context) {

        var elements = [];

        var layers = context.children().objectEnumerator();
        while (layer = layers.nextObject()) {
            if (selector == "MSLayer") {
                elements.push(layer);
            } else {
                if (String(layer.className()) === selector) elements.push(layer);
            }
        }
        return elements;
    }
}

Array.prototype.each = function (callback, args) {
    for (var i = 0; i < this.length; i++) {
        callback.call(this[i], i);
    }
}

Array.prototype.pushArray = function(arr) {
    this.push.apply(this, arr);
};