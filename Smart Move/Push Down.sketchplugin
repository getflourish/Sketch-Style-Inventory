// (shift cmd option ↓)

/**
 * This plugin pushed every layer below the current layer down by 10 pixels.
 */

// the selection
var selected = selection[0];

// get the parent group, or if it is an artboard, use the selected layer
var parent = selected.parentGroup();
// if (parent.className() == "MSArtboardGroup") parent = selected;

// top edge
var topEdge = selected.frame().y();

// storage
var persistent = [[NSThread mainThread] threadDictionary];

// offset
var offset;

if (persistent["com.getflourish.increments"] == null) {
	var value = parseFloat([doc askForUserInput:"Increments:" initialValue:10]);
	persistent["com.getflourish.increments"] = value;
}

offset = persistent["com.getflourish.increments"];


// loop through all layers on the same level as the parent group
var layers = parent.layers().array().objectEnumerator();
while (layer = layers.nextObject()) {

	if (layer != parent && selected != layer.parentGroup()) {

		// get the top position of the current layer
		currentTop = layer.frame().y();

		// push all layers below the selected one down
		if (currentTop > topEdge) {
			layer.frame().setY(currentTop + offset);
		}
	}
});

doc.showMessage("Pushed by " + persistent["com.getflourish.increments"] + "px");