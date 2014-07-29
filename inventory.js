// Namespaced library of functions common across multiple plugins
var inventory = inventory || {};

inventory.config = {
	background_image: "Plugins/Style Inventory/pattern.png",
	name: "Style Sheet",
	textStylePlaceholder: "The big brown fox jumps over the lazy dog."
}

inventory.common = {
	addArtboard: function(page, name) {
		artboard = [MSArtboardGroup new]
		frame = [artboard frame];
		frame.width = 400;
		frame.height = 400;
		page.addLayer(artboard);
		artboard.setName(name);
		return artboard;
	},

	getPageByName: function(name) {
		for (var i = 0; i < doc.pages().count(); i++) {
			var page = doc.pages().objectAtIndex(i);
			if (page.name() == name) {
				[page select:true byExpandingSelection:false]
				[doc setCurrentPage:page]
				return page;
			}
		}
		var page = addPage(name);
		return page;
	},
	getArtboardByPageAndName: function(page, name) {
		for (var i = 0; i < page.artboards().count(); i++) {
			var artboard = page.artboards().objectAtIndex(i);
			if (artboard.name() == name) {
				[artboard select:true byExpandingSelection:false]
				return artboard;
			}
		}
		var artboard = this.addArtboard(page, name);
		return artboard;
	},
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
