/**
 * Define Swatches
 *
 * This command can be used to define a color swatch. After generating the Color Inventory, select a color swatch (layer group) and
 * run this command which will show a dialog where a name can be entered.
 */

@import '../inventory.js'


var onRun = function (context) {

    // old school variable
    doc = context.document;
    selection = context.selection;

    com.getflourish.common.init(context);

    com.getflourish.doc.currentPage().deselectAllLayers();

    var selected = selection;

    for (var i = 0; i < selected.count(); i++) {
        var layer = selected.objectAtIndex(i);
        layer.setIsSelected(true);
        com.getflourish.view.centerTo(layer);

        var name = [doc askForUserInput:"Color name: (e.g. Primary > Blue)" initialValue:""]
        if(name != "") {
            layer.setName(name);
            var children = layer.children();
            for (var j = 0; j < children.count(); j++) {
                if(children[j].name() == "Swatch Name") {
                    var label = children[j];
                    label.setStringValue(name);
                    label.adjustFrameToFit();
                    label.setTextAlignment(0);
                }
            }
        } else {
            break;
        }
        layer.setIsSelected(false);
    }

    com.getflourish.view.centerTo(com.getflourish.doc.currentPage().currentArtboard());

    com.getflourish.colorInventory.generate();


}