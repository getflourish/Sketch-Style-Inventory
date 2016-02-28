 /**
 * This plugin selects all layers with the same layer name based on the selected layer.
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

        var layer = selection[0];
        var referenceName = layer.name();
        var scope = doc.currentPage().children();
        var result = com.getflourish.layers.selectLayersByName(referenceName, scope);

        doc.showMessage(result.count() + " layers of " + scope.count() + " selected. " + referenceName);

    } else {
        doc.showMessage("Please select a reference layer.");
    }
}