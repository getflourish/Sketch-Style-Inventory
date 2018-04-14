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

    com.getflourish.colorInventory.import();


}
