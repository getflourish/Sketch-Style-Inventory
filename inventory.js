// Namespaced library of functions common across multiple plugins
var inventory = inventory || {};

// Get the path of the plugin, without the name of the plugin
// todo: Could need some regex love for sure

var pluginPath = sketch.scriptPath;
var lastSlash = pluginPath.lastIndexOf("/");
var basePath = pluginPath.substr(0, lastSlash);

inventory.config = {
	background_image: basePath + "/_assets/pattern.png",
	pageName: "Style Sheet",
	textStylePlaceholder: "The big brown fox jumps over the lazy dog.",
	maxColorsPerRow: 5
}

inventory.common = {
	// Adds an artboard to the given page
	addArtboard: function(page, name) {
		artboard = MSArtboardGroup.new();
		frame = artboard.frame();
		frame.width = 400;
		frame.height = 400;
		frame.constrainProportions = false;
		page.addLayer(artboard);
		artboard.setName(name);
		return artboard;
	},
	addCheckeredBackground: function(artboard) {
		var layer = artboard.addLayerOfType("rectangle");
		layer.frame().setWidth(artboard.frame().width())
		layer.frame().setHeight(artboard.frame().height())
		layer.style().fills().addNewStylePart();
		layer.style().fill().setFillType(4);
		layer.setName("Background");

		var image = [[NSImage alloc] initWithContentsOfFile:inventory.config.background_image];

		layer.style().fill().setPatternImage(image)
		return layer;
	},
	addSolidBackground: function (artboard, hex_string) {
		var layer = artboard.addLayerOfType("rectangle");
		layer.frame().setWidth(artboard.frame().width());
		layer.frame().setHeight(artboard.frame().height());
		layer.style().fills().addNewStylePart();
		layer.style().fill().setFillType(0);
		layer.setName("Background");

		color = [MSColor colorWithHex: hex_string alpha: 1];

		layer.style().fill().setColor(color)

		return layer;
	},
	// Adds a new page to the document
	addPage: function(name) {
		// look for existing style sheet, otherwise create a new page with the styles
		var page = doc.addBlankPage();
		page.setName(name);
		doc.setCurrentPage(page);
		// inventory.common.refreshPage();
		return page;
	},
	addTextLayer: function (artboard, label) {
		var textLayer = artboard.addLayerOfType("text");
		textLayer.setStringValue(label)
		textLayer.setName(label)
	},
	// Returns the page if it exists or creates a new page
	getPageByName: function(name) {
		for (var i = 0; i < doc.pages().count(); i++) {
			var page = doc.pages().objectAtIndex(i);
			if (page.name() == name) {
				doc.setCurrentPage(page);
				return page;
			}
		}
		var page = inventory.common.addPage(name);
		return page;
	},
	addTextLayer: function(target, label) {
		var textLayer = target.addLayerOfType("text");
		textLayer.setStringValue(label)
		textLayer.setName(label)
		return textLayer;
	},
	// Returns an artboard from a given page
	getArtboardByPageAndName: function(page, name) {
		for (var i = 0; i < page.artboards().count(); i++) {
			var artboard = page.artboards().objectAtIndex(i);
			if (artboard.name() == name) {
				[artboard select:true byExpandingSelection:false]
				return artboard;
			}
		}
		var artboard = inventory.common.addArtboard(page, name);
		return artboard;
	},
	isIncluded: function(arr, obj) {
	  return (arr.indexOf(obj) != -1);
	},
	refreshPage: function() {
		var c = doc.currentPage();
		doc.setCurrentPage(0);
		doc.setCurrentPage(doc.pages().count() - 1);
		doc.setCurrentPage(c);
	},
	// Removes all layers from an artboard
	removeAllLayersFromArtboard: function(artboard) {

		var layers = artboard.children().objectEnumerator();
		while (layer = layers.nextObject()) {
			artboard.removeLayer(layer);
		}
	},
	resize: function(layer, width, height) {
		var frame = layer.frame();
		frame.setWidth(width);
		frame.setHeight(height);
	},
	// Saves a string to a file
	save_file_from_string: function (filename, the_string) {
  		var path = [@"" stringByAppendingString:filename],
      	str = [@"" stringByAppendingString:the_string];

  		if (in_sandbox()) {
  		  sandboxAccess.accessFilePath_withBlock_persistPermission(filename, function(){
  		    [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
  		  }, true)
  		} else {
  		  [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
  		}
	}
}

inventory.colors = {
	// Draws a colour palette from a array of colors
	// Based on alessndro_library.js
	drawColourPalette: function(base_layer, colours_array) {

		// todo: make this a proper color chip
    	var first_colour = colours_array[0];
    	var palette_layers = [base_layer];

    	var first_fill = base_layer.style().fills().firstObject();
    	first_fill.setColor(first_colour);

    	var hex_string = "#" + first_colour.hexValue();
    	base_layer.setName("Color Swatch " + hex_string);

    	for(var i = 1; i < colours_array.length; i++) {
    	  	var previous_layer = palette_layers[palette_layers.length -1];
    	 	var new_colour_layer = previous_layer.duplicate();
    	 	var new_colour = colours_array[i];
    	 	new_colour_layer.style().fills().firstObject().setColor(new_colour);

    	 	var frame = new_colour_layer.frame().width();
    	 	var current_x_pos = frame.x();
    	 	var new_x_position = current_x_pos + frame.width();
    	 	frame.setX(new_x_position + 10);
    	 	hex_string = "#" + new_colour.hexValue();
    	 	new_colour_layer.setName("Color Swatch " + hex_string);
    	 	palette_layers.push(new_colour_layer);
    	}
  	},
  	createColorSheet: function (artboard, colors_array) {
  		// create color chip for each color
  		var left = 0;
  		var top = 30;
  		var margin = 30;
  		var width = 0;

  		inventory.common.removeAllLayersFromArtboard(artboard);

  		for (var i = 0; i < colors_array.length; i++) {
  			left += margin;
  			var colorChip = inventory.colors.addColorChip(artboard, colors_array[i]);

  			width = colorChip.frame().width();
  			// offset color chip
  			colorChip.frame().setX(left);
  			colorChip.frame().setY(top);
  			left += width;

  			// todo: crash happens below this line

  			// after x color chips, star a new row
  			if ((i + 1) % inventory.config.maxColorsPerRow == 0) {
  				top += width + margin;
  				left = 0;
  			}
  		}
  		inventory.common.resize(artboard, 680, top + margin + width);
  	},
  	addColorChip: function (artboard, color) {
  		var padding = 5;
  		// get hex color
  		var hex_string = "#" + color.hexValue();
  		// add layer group
  		var group = artboard.addLayerOfType("group");
  		var group_name = "Color Swatch " + hex_string;
  		group.setName(group_name);
  		// draw square color
  		var colorSquare = inventory.colors.addColorShape(group, color, 100, 100);
  		// draw white label rectangle
  		var label = inventory.common.addTextLayer(group, hex_string);
  		label.frame().setY(colorSquare.frame().height() + padding);
  		// draw text with variable name / color
  		//var variable_label = inventory.common.addTextLayer(group, hex_string);
  		//variable_label.frame().setY(label.frame().y() + label.frame().height() + padding)

  		return group;
  	},
  	addColorShape: function (artboard, color, width, height) {
  		// add layer
  		var layer = artboard.addLayerOfType("rectangle");
  		layer.frame().setWidth(width);
  		layer.frame().setHeight(height);
  		layer.style().fills().addNewStylePart();
  		layer.style().fill().setFillType(0);
  		layer.style().fill().setColor(color);
  		var hex_string = "#" + color.hexValue();
  		layer.setName("Color Swatch " + hex_string);

  		return layer;
  	},
  	getColorOf: function(layer) {
  		var color = null;
  		var fill = null;
  		var className = layer.className();
  		if (className != "MSBitmapLayer" && className != "MSLayerGroup") {
  			try {
  				fill = [[[layer style] fills] firstObject];
  			} catch (error) {
  			}
  			if (fill !== null && [fill isEnabled] && [fill fillType] === 0) color = [fill color];
  		}
  		return color;
	}

}

inventory.clipboard = {
	// store the pasetboard object
	pasteBoard : null,

	// save the pasteboard object
	init: function() {
		this.pasteBoard = NSPasteboard.generalPasteboard();
	},
	// set the clipboard to the given text
	set: function(text) {
		if(typeof text === 'undefined') return null;

		if(!this.pasteBoard)
			this.init();

		this.pasteBoard.declareTypes_owner([NSPasteboardTypeString], null);
		this.pasteBoard.setString_forType(text, NSPasteboardTypeString);

		return true;
	},
	// get text from the clipbaoard
	get: function() {
		if(!this.pasteBoard)
			this.init();

		var text = this.pasteBoard.stringForType(NSPasteboardTypeString);

		return text.toString();
	}
};

inventory.view = {
	centerTo: function(layer) {
		var selected_object = layer;
    	var view = doc.currentView();
		view.centerRect(selected_object.absoluteRect());
	},
	zoomTo: function (layer) {
		var view = doc.currentView();
		view.zoomToFitRect(layer.absoluteRect());
	}
}

inventory.css = {
	/**
 	* createRuleSetStr by Tyler Gaw https://gist.github.com/tylergaw/adc3d6ad044f5afac446
 	**/

	createRuleSetStr: function (layer) {
 		var str = '';
 		var selector = '.' + layer.name().toLowerCase().replace(/ /gi, '-');
 		var attrs = layer.CSSAttributes();

 		str += selector + ' {';

 		for (var i = 0; i < attrs.count(); i += 1) {
 			var declaration = attrs.objectAtIndex(i);

    		if (declaration.indexOf('/*') < 0) {
    			str += '\n\t' + declaration;
    		}
		}
		str += '\n}';
		return str;
	},

	generateStyleSheet: function (layers) {
		var stylesheet = '';
		var stylesheet = "/* Text Styles from Sketch */";

		for (var i = 0; i < layers.count(); i += 1) {
			var layer = layers.objectAtIndex(i);

    		// only get CSS for text layers
    		if([layer isKindOfClass:MSTextLayer]) {
    			stylesheet += '\n\n' + inventory.css.createRuleSetStr(layer);
    		}
		}
		return stylesheet;
	}
}