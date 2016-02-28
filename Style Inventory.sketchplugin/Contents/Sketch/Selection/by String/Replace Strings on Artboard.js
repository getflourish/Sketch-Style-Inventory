 /**
 * This plugin replaces all strings based on the selected text layer
 * Scope: current artboard
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
        var scope = doc.currentPage().currentArtboard().children();

        var referenceString = layer.stringValue();

        // Prompt user for input of new button text
        var newString = [doc askForUserInput:"New text" initialValue:[layer stringValue]];

        var result = com.getflourish.layers.selectLayersByString(referenceString, scope);

        doc.showMessage("Changed text for " + result.count() + " layers.");

        for (var i = 0; i < result.count(); i++) {
            layer.setTextBehaviour(0)
            layer.adjustFrameToFit();

            // set the new value
            result.objectAtIndex(i).setStringValue(newString);

            // refresh text layout
            layer.setTextBehaviour(0)
            layer.adjustFrameToFit();
        }

        doc.reloadInspector();

        // refresh view
        var view = [doc currentView];
        view.refresh();

    } else {
        doc.showMessage("Please select a reference layer.");
    }
}