 /**
 * This plugin selects all layers with the same text style based on the selected layer.
 * Scope: current page
 *
 * Florian Schulz Copyright 2014, MIT License
 */

@import '../../inventory.js'

var onRun = function (context) {

    // old school variable
    doc = context.document;
    selection = context.selection;

    var scope = doc.currentPage().children();

    if (selection.count() === 1) {

        // the selected layer
        var selected = selection[0];

        // Only proceed if a text layer is selected
        if (selected.isKindOfClass(MSTextLayer)) {
            doc.showMessage("Looking for similar text layers…");

            var textStyle = selected.style().textStyle();
            var results = com.getflourish.layers.selectLayersByTextStyle(textStyle, scope);

            // Show how many layers have been selected
            doc.showMessage(results.count() + " text layers selected");

        } else {
            doc.showMessage("Please select a text layer.");
        }
    } else {
       doc.showMessage("Please select a text layer.");
    }
}