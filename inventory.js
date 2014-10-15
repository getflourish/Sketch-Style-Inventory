// Namespaced library of functions common across multiple plugins
var com = com || {};

// todo: update pattern code to [self setPatternImage:image collection:self.documentData.images]

// Get the path of the plugin, without the name of the plugin
// todo: Could need some regex love for sure

com.getflourish = (function() {
  var my = {};

  my.execute = function(block) {
    try
    {
      block();
    }
    catch (e)
    {
      log("Execution failed: " + e);
    }
  }

  my.config = {
    colorInventoryName: "Color Inventory",
    pageName: "Style Sheet",
    textStylePlaceholder: "The big brown fox jumps over the lazy dog.",
    maxColorsPerRow: 5
  }

  var pluginPath = sketch.scriptPath;
  var lastSlash = pluginPath.lastIndexOf("/");
  var basePath = pluginPath.substr(0, lastSlash);

  my.config.background_image = basePath + "/pattern.png";

  my.common = {
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
      layer.setName("Background");

          var image = NSImage.alloc().initWithContentsOfFile(my.config.background_image);

          var fill = layer.style().fills().addNewStylePart();
          if (fill) {
              fill.setFillType(4);
              fill.setPatternImage(image);
              fill.setPatternFillType(0);
              fill.setPatternTileScale(1);
          }
          doc.currentPage().deselectAllLayers();
          layer.setIsSelected(true);
          my.utils.sendToBack();
          layer.setIsLocked(true);

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
      // my.common.refreshPage();
      return page;
    },
    addTextLayer: function(target, label) {
        var textLayer = target.addLayerOfType("text");
        textLayer.setStringValue(label)
        textLayer.setName(label)
        return textLayer;
    },
    addTextLayerEmphasis: function(target, label) {
          var textLayer = target.addLayerOfType("text");
          textLayer.setStringValue(label)
          textLayer.setName(label)
          textLayer.setFontPostscriptName("HelveticaNeue-Bold");
          return textLayer;
      },
    addTextLayerTitle: function(target, label) {
        var textLayer = target.addLayerOfType("text");
        textLayer.setStringValue(label)
        textLayer.setName(label)
        textLayer.setFontSize(44);
        textLayer.setFontPostscriptName("HelveticaNeue-Thin");
        return textLayer;
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
      var page = my.common.addPage(name);
      return page;
    },
      dump: function (obj) {
          log("#####################################################################################")
          log("## Dumping object " + obj )
          log("## obj class is: " + [obj className])
          log("#####################################################################################")
          log("obj.properties:")
          log([obj class].mocha().properties())
          log("obj.propertiesWithAncestors:")
          log([obj class].mocha().propertiesWithAncestors())
          log("obj.classMethods:")
          log([obj class].mocha().classMethods())
          log("obj.classMethodsWithAncestors:")
          log([obj class].mocha().classMethodsWithAncestors())
          log("obj.instanceMethods:")
          log([obj class].mocha().instanceMethods())
          log("obj.instanceMethodsWithAncestors:")
          log([obj class].mocha().instanceMethodsWithAncestors())
          log("obj.protocols:")
          log([obj class].mocha().protocols())
          log("obj.protocolsWithAncestors:")
          log([obj class].mocha().protocolsWithAncestors())
          log("obj.treeAsDictionary():")
          log(obj.treeAsDictionary())
      },
    // Returns an artboard from a given page
    getArtboardByPageAndName: function(page, name) {
          var theArtboard = null;
          var abs = page.artboards().objectEnumerator();

          while (a = abs.nextObject()) {
              if (a.name() == name) {
                  theArtboard = a;
                  break;
              }
          }
          if (theArtboard == null) theArtboard = my.common.addArtboard(page, name);
      return theArtboard;
    },
    isIncluded: function(arr, obj) {
      return (arr.indexOf(obj) != -1);
    },
    showMarginsOf: function (layer) {
      // calculates margins and displays them
      var parent = layer.parentGroup();
      var ml = layer.absoluteRect().x() - parent.absoluteRect().x();
      var mt = layer.absoluteRect().y() - parent.absoluteRect().y();
      var mr = parent.frame().width() - ml - layer.frame().width();
      var mb = parent.absoluteRect().y() + parent.frame().height() - layer.absoluteRect().y() - layer.frame().height();

      var margin = "x: " + ml + ", y: " + mt + " / right: " + mr + ", bottom: " + mb;
      doc.showMessage(margin);
    },
    refreshPage: function() {
      var c = doc.currentPage();
      doc.setCurrentPage(0);
      doc.setCurrentPage(doc.pages().count() - 1);
      doc.setCurrentPage(c);
    },
      removeArtboardFromPage: function (page, name) {
          var theArtboard = null;
          var abs = page.artboards().objectEnumerator();

          while (a = abs.nextObject()) {
              if (a.name() == name) {
                  page.removeLayer(a)
                  break;
              }
          }
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

  my.colors = {

    // compares two colors and returns true if they are equal
    areEqual: function(a, b) {

        var ca = null;
        var cb = null;
        var hex_a = null;
        var hex_b = null;

        try {
            ca = String(a.className());
            cb = String(b.className());

            log("received classnames " + ca + " / " + cb);
        } catch (error) {
            log("could not receive classnames");
        }

        try {
          if (ca === "MSColor" && cb === "MSColor") {
              try {
                  hex_a = String(a.hexValue());
              } catch (error) {
                  log("couldn’t get hex a");
              }

              try {
                  hex_b = String(b.hexValue());
              } catch (error) {
                  log("couldn’t get hex a");
              }

              if (hex_a && hex_b) {
                  return hex_a === hex_b;
              }
          } else if (ca === "MSStyleFill" && cb === "MSStyleFill") {
              switch (a.fillType()) {
                  // pattern
                  case 4:
                      if (a.image() == b.image()) return true;
                  break;
                  // gradient
                  case 1:
                      // check if both gradients have the same number of stops
                      var stopsA = a.gradient().stops();
                      var stopsB = b.gradient().stops();

                      if (stopsA.count() == stopsB.count()) {
                          for (var i = 0; i < stopsA.count(); i++) {
                              if (stopsA.objectAtIndex(i).color() != stopsB.objectAtIndex(i).color() || stopsA.objectAtIndex(i).position() != stopsB.objectAtIndex(i).position()) {
                                  return false;
                              }
                          }
                          return true;
                      }
                  break;

                  default:
                      log("default");
                  break;
              }
          }
        } catch (error) {
            log("error comparing " + a.fillType() + " / " + b.fillType());
        }
        return false;
    },
    createColorSheet: function (artboard, palettes) {
      // create color chip for each color
      var left = 0;
      var top = 30;
      var margin = 45;
      var margin_top = 125;
      var width = 0;

      my.common.removeAllLayersFromArtboard(artboard);

      for (var i = 0; i < palettes.length; i++) {
        var palette = palettes[i];

        // add a title if palette has colors
        if(palette.swatches.length > 0) {
          var title = com.getflourish.common.addTextLayerTitle(artboard, palette.name);
          title.frame().setY(top)
          title.frame().setX(margin);
          top += 80;
        }

        for (var j = 0; j < palette.swatches.length; j++) {
          left += margin;
          var colorChip = my.colors.addColorChip(artboard, palette.swatches[j]);

          width = colorChip.frame().width();
          // offset color chip
          colorChip.frame().setX(left);
          colorChip.frame().setY(top);
          left += width;

          // after x color chips, star a new row
          if ((j + 1) % my.config.maxColorsPerRow == 0) {
            top += width + margin_top;
            left = 0;
          }
        }
        // move next palette
        if (left != 0) {
          left = 0;
          top += colorChip.frame().height() + 1.2 * margin_top;
        }
      }
      my.common.resize(artboard, 790, top + margin_top + width);
    },
    // todo: change method to accept a color object with name and color value
    addColorChip: function (artboard, swatch) {
      var padding = 8;

      // get hex color
      var hex_string = "#" + swatch.color.hexValue();
      var color = swatch.color;
      var colorName = "";

      // add layer group
      var group = artboard.addLayerOfType("group");
      var group_name = "";
      if(swatch.name == "Untitled Color Swatch") {
        swatch.name = "Untitled Color Swatch";
        colorName = "Untitled";
      } else {
        if (swatch.name.indexOf(">") != -1) {
          colorName = swatch.name.substring(swatch.name.indexOf(">") + 2);
        } else {
          colorName = swatch.name;
        }
      }
      group.setName(swatch.name);

      // draw white label rectangle
      var white = [MSColor colorWithHex: "#FFFFFF" alpha: 0];
      var labelBG = my.colors.addColorShape(group, white, 120, 195);
      labelBG.frame().setY(0);
      labelBG.setName("Background");
      labelBG.setIsSelected(true);

      white = [MSColor colorWithHex: "#FFFFFF" alpha: 1];
      var bottomBG = my.colors.addColorShape(group, white, 120, 75);
      bottomBG.frame().setY(120);
      bottomBG.setName("Background-Bottom");
      bottomBG.setIsSelected(true);

      // draw square color
      var colorSquare = my.colors.addColorShape(group, color, 120, 120);
      var hex_string = "#" + color.hexValue();
      colorSquare.setName("Color Swatch " + hex_string);
      colorSquare.setIsSelected(true);

      // Name Label
      var nameLabel = my.common.addTextLayerEmphasis(group, colorName);
      nameLabel.frame().setY(colorSquare.frame().height() + padding);
      nameLabel.frame().setX(8);
      nameLabel.setName("Swatch Name");

      // Name Label
      if (swatch.occurences == null) swatch.occurences = 0;
      
      var countLabel = my.common.addTextLayerEmphasis(group, "Test");
      countLabel.frame().setY(8);
      countLabel.frame().setX(85);
      countLabel.setTextAlignment(1);
      countLabel.setStringValue("" + swatch.occurences + "×");
      countLabel.adjustFrameToFit();
      countLabel.setTextAlignment(1);
      countLabel.setName("Swatch Count");
      countLabel.setTextColor(white);
      // Shadow
      var textShadow = countLabel.style().shadows().addNewStylePart();

      var black = [MSColor colorWithHex: "#000" alpha:0.5];
      textShadow.setOffsetX(0);
      textShadow.setOffsetY(1);
      textShadow.setBlurRadius(2);
      textShadow.setSpread(0);

      textShadow.setColor(black)

      // Hex Label
      var hexLabel = my.common.addTextLayer(group, hex_string);
      hexLabel.frame().setY(nameLabel.frame().y() + 14 + padding);
      hexLabel.frame().setX(8);
      hexLabel.setName("Hex Label");

      // RGB Label
      var rgb = String(Math.ceil(color.red() * 255)) + ", " + String(Math.ceil(color.green() * 255)) + ", " + String(Math.ceil(color.blue() * 255)) + ", " + String(color.alpha().toFixed(2));
      var rgbLabel = my.common.addTextLayer(group, rgb);
      rgbLabel.frame().setY(hexLabel.frame().y() + 14 + padding);
      rgbLabel. adjustFrameToFit();
      rgbLabel.frame().setX(8);
      rgbLabel.setName("RGB Label");

      // Shadow
      var shadow = labelBG.style().shadows().addNewStylePart();

      black = [MSColor colorWithHex: "#000" alpha:0.2];
      shadow.setOffsetX(0);
      shadow.setOffsetY(2);
      shadow.setBlurRadius(3);
      shadow.setSpread(0);

      shadow.setColor(black)


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

      return layer;
    },
    getColorOf: function(_layer) {
        var color = null,
        fill = null,
        style = null,
        fills = null,
        className = String(_layer.className());

        switch (className) {

            case "MSTextLayer":

                try {
                    // get the text color
                    color = _layer.textColor();

                    // check if the text layer has a fill color
                    fill = layer.style().fills().firstObject();
                    if (fill != undefined && fill.isEnabled()) {
                        color = fill.color();
                    }
                } catch (error) {
                    log(error);
                }
            break;
                case "MSOvalShape":
                case "MSShapeGroup":
                case "MSShapePathLayer":
                case "MSRectangleShape":
                    try {
                        // try to determin the fill type
                        style = _layer.style();
                        if (style.fills()) {
                            fills = style.fills();
                            if (fills.count() > 0) {
                                fill = fills.firstObject();
                                if (fill != null && fill.isEnabled()) {
                                    if(fill.fillType() == 0) {
                                        // solid color
                                        color = fill.color();
                                    } else {
                                        // any other fill
                                        color = fill;
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        log("could not get color");
                    }
            break;
            }
        return color;
    },
    getTextColorOf: function (layer) {
      var color = null;

      // check if layer is a text layer
      if (layer.className() == "MSTextLayer") {

        // get the text color
        color = layer.textColor();

        // check if the text layer has a fill color
        var fill = layer.style().fills().firstObject();
        if (fill != undefined && fill.isEnabled()) {
          color = fill.color();
        }
      }
      return color;
    }
  }

  my.clipboard = {
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

  my.view = {
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

  my.utils = {
      sendAction: function (commandToPerform) {
          try {
              [NSApp sendAction:commandToPerform to:nil from:doc];
          } catch(e) {
              my.log(e)
          }
      },
      sendToBack: function () {
          my.utils.sendAction('moveToBack:');
      },
      sendBackward: function () {
          my.utils.sendAction('moveBackward:');
      },
      sendDelete: function () {
          my.utils.sendAction('delete:');
      },
      sendAlignBottom: function () {
          my.utils.sendAction('alignLayersBottom:');
      },
      sendAlignLeft: function () {
          my.utils.sendAction('alignLayersLeft:');
      },
      sendAlignHorizontally: function () {
          my.utils.sendAction('alignLayersCenter:');
      },
      sendAlignVertically: function () {
          my.utils.sendAction('alignLayersMiddle:');
      },
      sendAlignRight: function () {
          my.utils.sendAction('alignLayersRight:');
      },
      sendAlignTop: function () {
          my.utils.sendAction('alignLayersTop:');
      },
      sendDistributeVertically: function () {
          my.utils.sendAction('distributeVertically:');
      },
      sendDistributeHorizontally: function () {
          my.utils.sendAction('distributeHorizontally:');
      },
      sendForward: function () {
          my.utils.sendAction('moveForward:');
      },
      sendPasteInPlace: function () {
          my.utils.sendAction('pasteInPlace:');
      },
  }

  my.css = {
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
            stylesheet += '\n\n' + my.css.createRuleSetStr(layer);
          }
      }
      return stylesheet;
    }
  }

  my.layers = {
      areEqual: function (layer1, layer2) {
          return layer1.objectID() === layer2.objectID();
      },
      select: function (layers) {
          // deselect first
          doc.currentPage().deselectAllLayers();

          // then select all layers from the original selection
          for (var i = 0; i < layers.count(); i++) {
              layers[i].setIsSelected(true);
          }
      },
      sortIndices: function (array) {
          // Orders the array in the layer list
          for (var i = 0; i < array.length - 1; i++) {

              // get two array
              var a = array[i];
              var b = array[i + 1];

              // check if both layers are in the same group
              var parent_a = a.parentGroup();
              var parent_b = b.parentGroup();

              if (parent_a == parent_b) {
                  var parent = parent_a;

                  if (parent.indexOfLayer(a) > parent.indexOfLayer(b)) {
                      // swap index
                      my.layers.swapIndex(b, a);
                  }
              } else {
                  doc.showMessage("couldn’t sort indices");
              }
          }
      },
      swapIndex: function (layer1, layer2) {
          var a = layer1;
          var b = layer2;

          // check if both layers are in the same group
          var parent_a = null;
          var parent_b = null;

          try {
            parent_a = a.parentGroup();
            parent_b = b.parentGroup();
          } catch (error) {
          }

          if (parent_a == parent_b) {

              var parent = parent_a;

              // deselect all layers
              doc.currentPage().deselectAllLayers();

              // select b
              a.setIsSelected(true);

              var steps = Math.abs(parent.indexOfLayer(b) - parent.indexOfLayer(a));

              for (var i = 0; i < steps; i++) {
                  my.utils.sendForward();
              }
          } else {
              doc.showMessage("Please select layers of the same group")
          }
      },
      reverseLayerOrder: function (layers) {
          // Reverses the layer order
          for (var i = 0; i < layers.length; i++) {
              var first = layers[i].layer;
              var next = layers[layers.length-1].layer;

             my.layers.swapIndex(first, next);
          }
      }
  }

  return my;
}());