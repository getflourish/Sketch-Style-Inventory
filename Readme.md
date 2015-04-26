*****
**Important note:** The plugin has been updated to work with Sketch 3.3+
*****

# Style Inventory for Sketch

Design requires free, sometimes chaotic exploration. But design also means organisation and structure. Sketch can be good in both aspects, but moving from exploration to structured layouts with text styles and unified colors is hard. Either you start clean files from scratch, or you use what you have and try to tidy it up. The Style Inventory is meant to help you with that. It gives you an overview of all your used styles and helps you to merge styles of similar layers into one.

![Generate dialog](http://f.cl.ly/items/3c1N0F3K0i2T1x3z0F2X/Bildschirmfoto%202015-04-26%20um%2022.05.10.png)

## Change Log

**April 26, 2015**
* added Symbols Inventory
* simplified export
* added configurator

**April 14, 2015**
Updated plugins for Sketch 3.3+

**December 7, 2014**
* Moved all unreleated plugins to a new repository called [Sketch Mate](https://github.com/getflourish/Sketch-Mate). It will take a few days to update the documentation for the new plugins.

## Plugin Directory

#### Inventory
* Generate `ctrl` + `⌘` + `⌥` + `I`

#### Selection
* by Color/Select Layers by Color `shift` + `ctrl` + `⌘` + `C`
* by Color/Select Layers by Color on Artboard `ctrl` + `⌘` + `C`
* by Name/Select Layers by Name `shift` + `ctrl` + `⌘` + `N`
* by Name/Select Layers by Name on Artboard `ctrl` + `⌘` + `N`
* by String/Replace String `shift` + `⌘` + `K`
* by Text Style/Select Similar Text Layers `shift` + `ctrl` + `⌘` + `T`
* by Text Style/Select Similar Text Layers on Artboard `⌘` + `control` + `T`


## Installation

To install all plugins, [download](https://github.com/getflourish/Sketch-Style-Inventory/archive/master.zip) them all first, unzip the archive, and place the folder contents in your Sketch Plugins folder by navigating to `Sketch > Plugins > Reveal Plugins Folder…`

To install only a selection of plugins, you will first need to place the library file `inventory.js` in the root of your Sketch Plugins directory. This is very important as all plugins rely on its functionality.

You can then install selected plugins by double-clicking the file, or alternatively, drag and drop the file onto the Sketch app icon. This will automatically copy the plugin to your Sketch Plugins folder.

## Keyboard Shortcuts

Most plugins have a pre-defined keyboard shortcut. You can always change it by editing the shortcut written in parenthesis at the end of the first line of a plugin.

For example, the first line of `Duplicate Artboard.sketchplugin`:

> // Duplicates the current artboard right next to it. (shift command d)

You can use modifier keys such as `option`, `command`, `control`, `shift`


### Generate

This command can generate artboards that collect all colors, text styles and symbols of a document. Choose what you want to generate in the configurator. The artboards will be generated on a new page called "Style Inventory".

**Shortcut:** `ctrl` + `⌘` + `⌥` + `I`

![Generate dialog](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/generate.gif)

### Export Metadata

When you select this option in the generator, Sketch will export metadata and images of your project that you can use in development. Colors as JSON, symbols as PNG, text styles as JSON.

**Shortcut:** `ctrl` + `⌘` + `⌥` + `I`

![Generate dialog](http://f.cl.ly/items/3944230o3a0V1u2u463t/export%20metadata.gif)

### Select Layers by Color on Artboard

Based on a selected layer, all layers on the current artboard that match the fill or text color will be selected.

**Shortcut:** `ctrl` + `⌘` + `C`

![Selection Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Select%20by%20Color.gif)

### Select Layers by Color

`experimental` Based on a selected layer, all document layers that match the fill or text color will be selected.

### Select Layers by Name

Based on a selected layer, all layers that match the name of the reference layer will be selected. This will also include layers that have appended numbers from duplication (e.g. Rectangle 1, Rectangle 2, …)

**Shortcut:** `ctrl` + `⌘` + `N`

### Replace String

Replaces all occurences of the text string found in the selected text layer

**Shortcut:** `shift` + `⌘` + `K`

![Selection Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Select%20by%20Name.gif)

### Select Next Layer by Color

`experimental` Based on a selection, the next layer with the same fill color will be selected.

### Select Next Layer by Text Style

`experimental` Based on a selection, the next layer with the same text style will be selected.

![Screenshot](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Select%20Layer%20by%20Similar%20Style.png)

## Style Inventory
Generate a visual style sheet with all colors and text styles that you are using. This will help you to get an overview of your used styles so you can merge styles that are very close together. This will also export a CSS file with text styles.

### Generate/Text Style Inventory
Generates an artboard with all text styles that are used in the document.
![Selection Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Sketch%20CSS.gif)


### Generate/Color Inventory
Generates an artboard with all colors that are used on the current page.

![Screenshot](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Colors.png)

### Rename/Rename selected layers
`experimental` A simple wizard that will guide you through your styles that are missing variable names. This will be used to to provide more information for SASS and JSON export.