*****
**Important note:** These plugins are still in development and may not work as expected. Keep an eye for the `experimental` flag ;)
*****

# Style Inventory for Sketch

Design requires free, sometimes chaotic exploration. But design also means organisation and structure. Sketch can be good in both aspects, but moving from exploration to structured layouts with text styles and unified colors is hard. Either you start clean files from scratch, or you use what you have and try to tidy it up. The Style Inventory is meant to help you with that. It gives you an overview of all your used styles and helps you to merge styles of similar layers into one. This repositiory also contains a few other helpful plugins.


## Plugin Directory

#### Artboards
* Duplicate Artboard `shift` + `⌘` + `D`
* Fit Artboard Height `ctrl` + `shift` + `A`
* Sort Artboards

#### Inventory
* Export/Symbols to PNG
* Export/Text Styles to CSS
* Generate/Color Inventory `experimental`
* Generate/Style Inventory `experimental`
* Generate/Text Style Inventory `experimental`
* Misc/Rename Selected Layers

#### Selection
* Artboard/Select All Artboards `ctrl` + `⌘` + `A`
* Artboard/Select Layers by Color on Artboard `ctrl` + `⌘` + `C`
* Artboard/Select Layers by Name `ctrl` + `⌘` + `N`
* Document/Select Layers by Color `experimental`
* Document/Select Next/Previous Layer by Color
* Document/Select Next/Previous Layer by Text Style
* Document/Select Similar Text Layers by Style `experimental`
* Document/Select Similar Text Layers by Style on Artboard
* Group/Select Layers of Group `ctrl` + `⌘` + `G`

#### Sorting
* Sort Layers `ctrl` + `⌘` + `⌥` + `S`
* Reverse Positions

#### Text
Set Line Height `⌘` + `L`


## Installation

To install all plugins, [download](https://github.com/getflourish/Sketch-Style-Inventory/archive/master.zip) them all first, unzip the archive, and place the folder contents in your Sketch Plugins folder by navigating to `Sketch > Plugins > Reveal Plugins Folder…`

To install only a selection of plugins, you will first need to place the library file `inventory.js` in the root of your Sketch Plugins directory. This is very important as all plugins rely on its functionality.

You can then install selected plugins by double-clicking the file, or alternatively, drag and drop the file onto the Sketch app icon. This will automatically copy the plugin to your Sketch Plugins folder.

## Keyboard Shortcuts

Most plugins have a pre-defined keyboard shortcut. You can always change it by editing the shortcut written in parenthesis at the end of the first line of a plugin.

For example, the first line of `Duplicate Artboard.sketchplugin`:

> // Duplicates the current artboard right next to it. (shift command d)

You can use modifier keys such as `option`, `command`, `control`, `shift`

## Artboards

### Duplicate Artboard (next to the current artboard)

This improves the built in behavior of artboard duplication in Sketch. If the current artboard is in the middle of other artboards, all artboards on the right side will be shifted to the right before the artboard is duplicated. Requires any layer of an artboard to be selected.

**Shortcut:** `shift` + `⌘` + `D`

![Duplicate Artboard Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Duplicate%20Artboard.gif)

### Fit Artboard

Resizes the artboard to fit the height of its layers. Useful when designing lists.

**Shortcut:** `shift` + `ctrl` + `A`

![Resize Artboard Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Resize%20Artboard.gif)


### Sort Artboards

Sorts selected artboard layers by their horizontal position. Useful when your layer list does not reflect the artboard arrangement on your canvas.


## Text

### Set Line Height

Plugin that allows you to set the line height of a text layer as a multiple of the font size. It’s like using em in CSS.

**Shortcut:** `⌘` + `L`

![Screenshot](https://dl.dropboxusercontent.com/u/974773/_keepalive/Sketch-Line-Height.png)

## Selection

A set of plugins that select layers based on color, name & text style.

### Select All Artboards

Selects all artboards on the current page.

**Shortcut:** `ctrl` + `⌘` + `A`

### Select Layers by Color on Artboard

Based on a selected layer, all layers on the current artboard that match the fill or text color will be selected.

**Shortcut:** `ctrl` + `⌘` + `C`

![Selection Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Select%20by%20Color.gif)

### Select Layers by Color

`experimental` Based on a selected layer, all document layers that match the fill or text color will be selected.

### Select Layers by Name

Based on a selected layer, all layers that match the name of the reference layer will be selected. This will also include layers that have appended numbers from duplication (e.g. Rectangle 1, Rectangle 2, …)

**Shortcut:** `ctrl` + `⌘` + `N`

![Selection Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Select%20by%20Name.gif)

### Select Layers of Group
Selects the layers of a group.

**Shortcut:** `ctrl` + `⌘` + `G`

### Select Next Layer by Color

`experimental` Based on a selection, the next layer with the same fill color will be selected.

### Select Next Layer by Text Style

`experimental` Based on a selection, the next layer with the same text style will be selected.

![Screenshot](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Select%20Layer%20by%20Similar%20Style.png)

## Sorting

### Sort Layers

Sorts the selected layers or artboards. Note: This plugin will also reorder the layers in the layer list to match the visual order. For best results, group your layers before sorting.

**Options:** `Text (A->Z)`, `Text (Z->A)`, `Layer Name (A->Z)`, `Layer Name (Z->A)`, `Top`, `Left`, `Random`

**Shortcut:** `ctrl` + `⌘` + `⌥` + `S`

![Selection Animation](https://dl.dropboxusercontent.com/u/974773/_keepalive/Style%20Inventory/Sorting.gif)

### Reverse Positions
This plugin reverses the positions of selected layers.


## Style Inventory
Generate a visual style sheet with all colors and text styles that you are using. This will help you to get an overview of your used styles so you can merge styles that are very close together. This will also export a CSS file with text styles.

### Export/Symbols to PNG
`experimental` Exports symbols on the current page as PNG to the project folder. In a future release, this plugin may export all symbols from the document.

### Export/Text Styles to CSS

This plugin generates an overview of all your text styles and exports it as CSS. [Watch the demo](https://vimeo.com/102635978 "Demo")
This is more proof of concept and only the foundation of a set of helpful plugins that will follow soon.

To do: export opacity, remove attributes that have the default value

[![Demo on Vimeo](https://dl.dropboxusercontent.com/u/974773/_keepalive/Sketch%20CSS%20Vimeo.png)](https://vimeo.com/102635978)

![Screenshot](https://dl.dropboxusercontent.com/u/974773/_keepalive/Sketch%20CSS.png)

### Generate/Color Inventory
Generates an artboard with all colors that are used in the document.

### Generate/Style Inventory
Generates both, the color and text style inventory.

### Generate/Text Style Inventory
Generates an artboard with all text styles that are used in the document.

### Rename/Rename selected layers
`experimental` A simple wizard that will guide you through your styles that are missing variable names. This will be used to to provide more information for SASS and JSON export. 
