 /**
 * This plugin selects all same-colored layers based on the selected layer.
 * Scope: current page
 *
 * Florian Schulz Copyright 2014, MIT License
 */

@import '../../inventory.js'

var onRun = function (context) {

    // old school variable
    doc = context.document;
    selection = context.selection;

    if (selection.count() == 1) {
        var referenceLayer = selection[0];
        var scope = doc.currentPage().children();
        var result = com.getflourish.layers.selectLayersByColor(referenceLayer, scope);

        // display message
        doc.showMessage(result.count() + " layers of " + scope.count() + " selected.");
    } else {
        doc.showMessage("Please select a reference layer.");
    }
}