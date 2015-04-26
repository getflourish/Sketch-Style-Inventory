@import 'sandbox.js'
@import 'persistence.js'

// Namespaced library of functions common across multiple plugins
var com = com || {};

// todo: update pattern code to [self setPatternImage:image collection:self.documentData.images]

// Get the path of the plugin, without the name of the plugin
// todo: Could need some regex love for sure

com.getflourish = (function () {
    var my = {};

    // for 3.3
    var doc = context.document;

    my.execute = function (block) {
        try {
            block();
        } catch (e) {
            log("Execution failed: " + e);
        }
    }

    my.config = {
        colorInventoryName: "Color Inventory",
        pageName: "Style Inventory",
        samePage: false,
        textStylePlaceholder: "The big brown fox jumps over the lazy dog.",
        maxColorsPerRow: 5,
        BACKGROUND_COLOR: "#E7EAEE",
        CARD_COLOR: "#ffffff",
        FONT: "HelveticaNeue-Bold",
        TEXT_COLOR: "#333333",
        TEXTSTYLE_NAME: "Style Inventory / Label"
    }


    var pluginPath = sketch.scriptPath;
    var lastSlash = pluginPath.lastIndexOf("/");
    var basePath = pluginPath.substr(0, lastSlash);

    my.config.background_image = basePath + "/pattern.png";

    // define where the style sheet will be placed
    // either on the same page or a separate page?

    my.common = {
        // Adds an artboard to the given page
        addArtboard: function (page, name) {
            var artboard = MSArtboardGroup.new();
            frame = artboard.frame();
            frame.setWidth(400);
            frame.setHeight(400);
            frame.setConstrainProportions(false);
            page.addLayers([artboard]);
            artboard.setName(name);
            return artboard;
        },
        addCheckeredBackground: function (artboard) {
            var layer = my.common.addRectangleLayer(artboard)

            layer.frame()
                .setWidth(artboard.frame()
                    .width());
            layer.frame()
                .setHeight(artboard.frame()
                    .height());
            layer.setName("Background");

            var image = NSImage.alloc()
                .initWithContentsOfFile(my.config.background_image);

            var fill = layer.style()
                .fills()
                .addNewStylePart();
            if (fill) {
                fill.setFillType(4);
                var coll = layer.style()
                    .fills()
                    .firstObject()
                    .documentData()
                    .images();
              [fill setPatternImage: image collection: coll]
                fill.setPatternFillType(0);
                fill.setPatternTileScale(1);
            }
            doc.currentPage()
                .deselectAllLayers();
            // layer.setIsSelected(true);
            // my.utils.sendToBack();
            layer.setIsLocked(true);

            return layer;
        },
        addSolidBackground: function (artboard, hex_string) {
            var layer = my.common.addRectangleLayer(artboard)
            layer.frame()
                .setWidth(artboard.frame()
                    .width());
            layer.frame()
                .setHeight(artboard.frame()
                    .height());
            layer.style()
                .fills()
                .addNewStylePart();
            layer.style()
                .fill()
                .setFillType(0);
            layer.setName("Background");

            var color = MSColor.colorWithSVGString(hex_string);

            layer.style()
                .fill()
                .setColor(color)

            return layer;
        },
        // Adds a new page to the document
        addPage: function (name) {
            // look for existing style sheet, otherwise create a new page with the styles
            var page = doc.addBlankPage();
            page.setName(name);
            doc.setCurrentPage(page);
            // my.common.refreshPage();
            return page;
        },
        addRectangleLayer: function (target) {
            // var shape = MSRectangleShape.alloc().init();
            // var shapeGroup = [MSShapeGroup shapeWithPath:shape];
            // target.addLayers([shapeGroup]);

            var layer = target.addLayerOfType("rectangle");
            return layer;
        },
        addTextLayer: function (target, label) {
            var textLayer = target.addLayerOfType("text");
            textLayer.setStringValue(label)
            textLayer.setName(label)
            return textLayer;
        },
        addTextLayerEmphasis: function (target, label) {
            var textLayer = target.addLayerOfType("text");
            textLayer.setStringValue(label)
            textLayer.setName(label)
            textLayer.setFontPostscriptName("HelveticaNeue-Bold");
            return textLayer;
        },
        addTextLayerTitle: function (target, label) {
            var textLayer = target.addLayerOfType("text");
            textLayer.setStringValue(label)
            textLayer.setName(label)
            textLayer.setFontSize(44);
            textLayer.setFontPostscriptName("HelveticaNeue-Thin");
            return textLayer;
        },
        areOfEqualClass: function (layers) {
            var baseClass = layers[0].className();
            for (var i = 0; i < layers.count(); i++) {
                if (layers[i].className() != baseClass) {
                    return false;
                }
            }
            return true;
        },
        createSelect: function (msg, items, selectedItemIndex) {
            selectedItemIndex = selectedItemIndex || 0

            var accessory = [[NSComboBox alloc] initWithFrame: NSMakeRect(0, 0, 200, 25)]
            [accessory addItemsWithObjectValues: items]
            [accessory selectItemAtIndex: selectedItemIndex]

            var alert = [[NSAlert alloc] init]
            [alert setMessageText: msg]
            [alert addButtonWithTitle: 'OK']
            [alert addButtonWithTitle: 'Cancel']
            [alert setAccessoryView: accessory]

            var responseCode = [alert runModal]
            var sel = [accessory indexOfSelectedItem]
            var value = [accessory stringValue]

            return [responseCode, sel, value]
        },
        createWebView: function (url) {
            // WebView tests (shift alt ctrl y)

            /**
             * The first script call creates the panel with the saved HTML page.
             * The following script calls execute the JavaScript calls in the webView.
             */

            // Add a hint to whomever is instantiating us,
            // that we'd like to stick around for a while.
            coscript.shouldKeepAround = true;

            // Include additionl frameworks.
            framework('WebKit');
            framework('AppKit');

            // Define a WebViewLoad delegate function - should be converted to an ObjC class.
            // See https://github.com/logancollins/Mocha
            var WebViewLoadDelegate = function () {};

            // Add the initiating delegate (callback) function.
            WebViewLoadDelegate.prototype.webView_didClearWindowObject_forFrame = function (sender, scriptObject, frame) {
                var jswrapper = 'try {[[js]]} catch (e) {e.toString();}',
                    jscode = 'document.body.innerHTML;',
                    js = jswrapper.replace('[[js]]', jscode);

                var result = scriptObject.evaluateWebScript(js);
                log(result);
            };

            // Add the delegate (callback) function which is called when the page has loaded.
            WebViewLoadDelegate.prototype.webView_didFinishLoadForFrame = function (sender, frame) {
                var jswrapper = 'try {[[js]]} catch (e) {e.toString();}',
                    jscode = 'document.body.innerHTML;',
                    js = jswrapper.replace('[[js]]', jscode);

                var scriptObject = sender.windowScriptObject();

                var result = scriptObject.evaluateWebScript(js);
                log(result);
            };

            // Prepare the function that will be used as an object added to the
            // scriptObject. The object should be visible with it's methods and properties
            // from the page JavaScript and should be usable to call Sketch script
            // functions from the page JavaScript.
            var runThis = function runThis() {
                var that = function () {};

                // Property visible to JavaScript.
                that.fixed = "Property named fixed";
                // Method visible to JavaScript.
                that.log = function () {
                    log('Called from JavaScript via the Sketch script RunThis object.');
                    return true;
                };
                // Method returns whether a selector should be hidden
                // from the scripting environment. If "false" is returned none is hidden.
                that.isSelectorExcludedFromWebScript = function (selector) {
                    log('selector');
                    log(selector);
                    return false;
                };
                // Method returns whether a key should be hidden
                // from the scripting environment. If "false" is returned none is hidden.
                that.isKeyExcludedFromWebScript = function (key) {
                    log('key');
                    log(key);
                    return false;
                };

                return that;
            };

            // Set the url to the saved webpage
            // Split the scriptpath into an array, remove last item which is
            // the script name, create a string from the array again and wrap the
            // path with 'file://' and the html file name.
            var URL = '';
            var path = url.split('/');

            path.pop();
            path = path.join('/') + '/';
            URL = encodeURI('file://' + url + "styles.html");
            log(URL)

            /**
             * Prepare the panel, show it and save it into the persistent store.
             */
            var setupWebViewPanel = function () {
                // Prepare the panel:
                // Set the panel size and
                // initialize the webview and load the URL
                var frame = NSMakeRect(0, 0, 320, 480);
                var webView = WebView.alloc()
                    .initWithFrame(frame);
                var webViewFrame = webView.mainFrame();

                // The FrameLoadDelegate offers the webView_didFinishLoadForFrame
                // method which is called when the web page is loaded.
                // !!! The methods never fire because:
                // - it is implemented wrong?
                // - the delegate's method never is called because the script ends before the
                //   page is loaded?
                var loadDelegate = new WebViewLoadDelegate();
                webView.setFrameLoadDelegate(loadDelegate);

                webViewFrame.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(URL)));

                // Set up the panel window
                var mask = NSTitledWindowMask + NSClosableWindowMask + NSMiniaturizableWindowMask + NSUtilityWindowMask;
                var panel = NSPanel.alloc()
                    .initWithContentRect_styleMask_backing_defer(frame, mask, NSBackingStoreBuffered, true);

                // Add the webView to the prepared panel
                panel.contentView()
                    .addSubview(webView);

                // Show the panel
                panel.makeKeyAndOrderFront(panel);

                // persist the panel and the webView.
                persist.set('panel', panel);
                persist.set('webView', webView);
            };

            var update = function () {
                var webView = persist.get('webView')
                    .mainFrame()
                    .loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(URL)));
            }

            var doScript = function () {
                var jswrapper = 'try {[[js]]} catch (e) {e.toString();}',
                    jscode = '',
                    js = jswrapper.replace('[[js]]', jscode);

                // var result = webView.stringByEvaluatingJavaScriptFromString(js);

                // Get the windowScriptObject as the scripting connector
                var scriptObject = webView.windowScriptObject();

                // Add the RunThis object with the key 'callThis'. The callThis
                // object should be accessible by the page JavaScript.
                // !!! The object is seen by the page JavaScript but the methods/porperties
                // are not present.
                var runThisFunc = runThis();
                scriptObject.setValue_forKey(runThisFunc, 'callThis');

                // Add a text line.
                jscode = 'de.unodo.writeTest("From the Sketch script ' + new Date() + '");';
                js = jswrapper.replace('[[js]]', jscode);
                var result = scriptObject.evaluateWebScript(js);
                log(result);

                // Call the callback function to check if the 'callThis' class is visible
                // in the page for JavaScript.
                jscode = 'de.unodo.callBack();';
                js = jswrapper.replace('[[js]]', jscode);
                var result = scriptObject.evaluateWebScript(js);
                log(result);

                // Get the form data.
                jscode = 'de.unodo.getFormData();';
                js = jswrapper.replace('[[js]]', jscode);
                var result = scriptObject.evaluateWebScript(js);
                log('Formfield "Name" value: ' + result);
            };

            var panel = persist.get('panel');
            var webView = persist.get('webView');

            // If the panel does not exisit (null is returned from persist.get),
            // set the panel up and show it.
            // Else make the panel the front window and run the JavaScript functions.
            if (panel === null) {
                log('setupWebViewPanel');
                setupWebViewPanel();
            } else {
                // Show the panel
                update();
                panel.makeKeyAndOrderFront(panel);

                // var loadDelegate = new WebViewLoadDelegate;
                // webView.setFrameLoadDelegate(loadDelegate);

                // Run the scripts
                // doScript();
            }

            log('done');

        },
        filePicker: function (url, fileTypes) {
            // Panel
            var openPanel = [NSOpenPanel openPanel]

      [openPanel setTitle: "Import Colors"]
      [openPanel setMessage: "Select a JSON file containing color information."];
      [openPanel setPrompt: "Import"];

      [openPanel setCanCreateDirectories: false]
      [openPanel setCanChooseFiles: true]
      [openPanel setCanChooseDirectories: false]
      [openPanel setAllowsMultipleSelection: false]
      [openPanel setShowsHiddenFiles: false]
      [openPanel setExtensionHidden: false]
      [openPanel setAllowedFileTypes: fileTypes]

            // [openPanel setDirectoryURL:url]

            var openPanelButtonPressed = [openPanel runModal]
            if (openPanelButtonPressed == NSFileHandlingPanelOKButton) {
                allowedUrl = [openPanel URL]
            }
            return allowedUrl
        },
        fileSaver: function () {
            // Panel
            var openPanel = [NSOpenPanel openPanel]

      [openPanel setTitle: "Choose a location…"]
      [openPanel setMessage: "Select the export location…"];
      [openPanel setPrompt: "Export"];

      [openPanel setCanCreateDirectories: true]
      [openPanel setCanChooseFiles: false]
      [openPanel setCanChooseDirectories: true]
      [openPanel setAllowsMultipleSelection: false]
      [openPanel setShowsHiddenFiles: false]
      [openPanel setExtensionHidden: false]

            // [openPanel setDirectoryURL:url]

            var openPanelButtonPressed = [openPanel runModal]
            if (openPanelButtonPressed == NSFileHandlingPanelOKButton) {
                allowedUrl = [openPanel URL]
            }
            return allowedUrl
        },
        // Returns the page if it exists or creates a new page
        getPageByName: function (name) {
            for (var i = 0; i < doc.pages()
                .count(); i++) {
                var page = doc.pages()
                    .objectAtIndex(i);
                if (page.name() == name) {
                    doc.setCurrentPage(page);
                    return page;
                }
            }
            var page = my.common.addPage(name);
            return page;
        },
        getStyleSheetPage: function () {
            if (my.config.samePage == true) {
                return doc.currentPage();
            } else {
                if (my.config.stylesheetPage == null) {
                    my.config.stylesheetPage = my.common.getPageByName(my.config.pageName);
                }
                return my.config.stylesheetPage;
            }
        },
        dump: function (obj) {
            log("#####################################################################################")
            log("## Dumping object " + obj)
            log("## obj class is: " + [obj className])
            log("#####################################################################################")
            log("obj.properties:")
            log([obj class].mocha()
                .properties())
            log("obj.propertiesWithAncestors:")
            log([obj class].mocha()
                .propertiesWithAncestors())
            log("obj.classMethods:")
            log([obj class].mocha()
                .classMethods())
            log("obj.classMethodsWithAncestors:")
            log([obj class].mocha()
                .classMethodsWithAncestors())
            log("obj.instanceMethods:")
            log([obj class].mocha()
                .instanceMethods())
            log("obj.instanceMethodsWithAncestors:")
            log([obj class].mocha()
                .instanceMethodsWithAncestors())
            log("obj.protocols:")
            log([obj class].mocha()
                .protocols())
            log("obj.protocolsWithAncestors:")
            log([obj class].mocha()
                .protocolsWithAncestors())
            log("obj.treeAsDictionary():")
            log(obj.treeAsDictionary())
        },
        // Returns an artboard from a given page
        getArtboardByPageAndName: function (page, name) {

            var scope = page.children();
            // setup predicate
            var predicate = NSPredicate.predicateWithFormat("name == %@ AND className == %@", name, "MSArtboardGroup");

            // get the color artboard
            var results = scope.filteredArrayUsingPredicate(predicate);

            if (results.count() > 0) {
                return results.objectAtIndex(0);
            } else {
                return my.common.addArtboard(page, name);
            }
        },
        isIncluded: function (arr, obj) {
            return (arr.indexOf(obj) != -1);
        },
        getDirectoryFromBrowserForFilename: function (filename) {
            // Path and file access
            var document_path = [[doc fileURL] path].split([doc displayName])[0];
            var path = document_path + filename;

            var fileTypes = [];
            var fileURL = my.common.fileSaver();
            path = fileURL.path();

            // Authorize Sketch to save a file
            new AppSandbox()
                .authorize(path, function () {});

            return path;

        },
        getTextStyleByName: function (name) {
            var textStyles = doc.documentData().layerTextStyles();

            if (textStyles) {
                // get index
                for (var i = 0; i < textStyles.objects().count(); i++) {
                    if (textStyles.objects().objectAtIndex(i).name() == name) {
                        return textStyles.objects().objectAtIndex(i);
                    }
                }
            }
            return null;
        },
        getLayerStyleByName: function (name) {
            var layerStyles = doc.documentData().layerStyles();

            if (layerStyles) {
                // get index
                for (var i = 0; i < layerStyles.objects().count(); i++) {
                    if (layerStyles.objects().objectAtIndex(i).name() == name) {
                        return layerStyles.objects().objectAtIndex(i);
                    }
                }
            }
            return null;
        },
        placeNextTo: function (self, other) {
            var x = other.frame().x() + other.frame().width() + 100;
            var y = other.frame().y();
            self.frame().setX(x);
            self.frame().setY(y);
        },
        showMarginsOf: function (layer) {
            // calculates margins and displays them
            var parent = layer.parentGroup();
            var ml = layer.absoluteRect()
                .x() - parent.absoluteRect()
                .x();
            var mt = layer.absoluteRect()
                .y() - parent.absoluteRect()
                .y();
            var mr = parent.frame()
                .width() - ml - layer.frame()
                .width();
            var mb = parent.absoluteRect()
                .y() + parent.frame()
                .height() - layer.absoluteRect()
                .y() - layer.frame()
                .height();

            var margin = "x: " + ml + ", y: " + mt + " / right: " + mr + ", bottom: " + mb;
            doc.showMessage(margin);
        },
        refreshPage: function () {
            var c = doc.currentPage();
            doc.setCurrentPage(0);
            doc.setCurrentPage(doc.pages()
                .count() - 1);
            doc.setCurrentPage(c);
        },
        removeArtboardFromPage: function (page, name) {
            var theArtboard = null;
            var abs = page.artboards()
                .objectEnumerator();

            while (a = abs.nextObject()) {
                if (a.name() == name) {
                    page.removeLayer(a)
                    break;
                }
            }
        },
        // Removes all layers from an artboard
        removeAllLayersFromArtboard: function (artboard) {

            var layers = artboard.children()
                .objectEnumerator();
            while (layer = layers.nextObject()) {
                artboard.removeLayer(layer);
            }
        },
        resize: function (layer, width, height) {
            var frame = layer.frame();
            frame.setWidth(width);
            frame.setHeight(height);
        },
        // Saves a string to a file
        // save_file_from_string: function (filename, the_string) {
        //     var path = [@"" stringByAppendingString:filename],
        //       str = [@"" stringByAppendingString:the_string];
        //
        //     if (in_sandbox()) {
        //       sandboxAccess.accessFilePath_withBlock_persistPermission(filename, function(){
        //         [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
        //       }, true)
        //     } else {
        //       [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
        //     }
        // },
        save_file_from_string: function (filename, the_string) {
            var path = [@""
                    stringByAppendingString: filename],
                str = [@""
                    stringByAppendingString: the_string];
            str.dataUsingEncoding_(NSUTF8StringEncoding)
                .writeToFile_atomically_(path, true)
        }
    }

    my.colorInventory = {
        generate: function (palettes) {
            var currentlySelectedArtboard = doc.currentPage()
                .currentArtboard();
            if (currentlySelectedArtboard == null) {
                doc.showMessage("Please select an artboard. The Inventory will be placed next to it.");
            }

            log("generating")

            var exists = false;

            // start tracking the time
            var startTime = new Date();

            // page that the artboard will be created on
            var styleSheetPage = my.common.getStyleSheetPage();

            // the right most artboard
            var rma;
            if (currentlySelectedArtboard != null) rma = my.layers.getRightmostArtboard();

            // get hex colors from document
            var hexColors = my.colorInventory.getDocumentColors();

            if (hexColors.length > 0) {

                // feedback
                doc.showMessage("Analyzing Colors…");

                // setup predicate
                var predicate = NSPredicate.predicateWithFormat("name == %@ AND className == %@", my.config.colorInventoryName, "MSArtboardGroup");

                // get the color artboard
                var colorArtboard = styleSheetPage.children()
                    .filteredArrayUsingPredicate(predicate);
                if (colorArtboard.count() == 0) {
                    // todo: adding is broken
                    colorArtboard = my.common.addArtboard(styleSheetPage, my.config.colorInventoryName);
                } else {
                    colorArtboard = colorArtboard[0];
                    exists = true;
                }

                // if no palettes are provided, analyse the document to get them
                if (palettes == null) {
                    // get hex colors from color artboard
                    var colorArtboardColors = my.utils.arrayFromImmutableArray(my.colorInventory.getColorArtboardColors(colorArtboard));

                    // get defined colors
                    var queryResult = my.colorInventory.getDefinedColors(colorArtboard);

                    // todo: optimize
                    var palettes = my.colorInventory.getPalettesFromMergingColors(queryResult, hexColors);

                    // add text colors to the palettes

                }

                // clear the artboard before adding swatches
                colorArtboard.removeAllLayers();

                // Add background
                var bg = my.common.addCheckeredBackground(colorArtboard);

                var execTime = (new Date() - startTime) / 1000;
                doc.showMessage("Painting Swatches… " + execTime + " s");

                // create colorsheet by passing palettes that contain multiple color objects (name, value)
                my.colors.createColorSheet(colorArtboard, palettes);

                // finish it up
                my.colorInventory.finish(colorArtboard);

                // resize background
                bg.frame()
                    .setWidth(colorArtboard.frame()
                        .width())
                bg.frame()
                    .setHeight(colorArtboard.frame()
                        .height())


                // Feedback
                var execTime = (new Date() - startTime) / 1000;
                doc.showMessage("Generated Color Inventory in " + execTime + " s");

                return colorArtboard;

            } else {
                doc.showMessage("No colors found :(");
                return null;
            }
        },
        getColorArtboardColors: function (colorArtboard) {

            // get all layers of the current page
            var layers = colorArtboard.children();

            // analyse the colors
            var rawHexColors = [layers valueForKeyPath: "@distinctUnionOfObjects.style.fill.color.hexValue"];
            return rawHexColors;
        },
        getColorURL: function () {
            var url = [doc askForUserInput: "Paste URL from Coolors or Hailpixel…"
                initialValue: "http://coolors.co/e0e086-acbe14-2c1f19-327a76-bce2d7"]
            return url;
        },
        getColorsFromCoolorsString: function (string) {
            var pos = string.lastIndexOf("/") + 1;
            var colorString = string.substring(pos);
            var colors = colorString.split("-");
            var swatches = [];
            for (var i = 0; i < colors.length; i++) {
                var color = colors[i];
                swatches.push({
                    name: "Imported Color",
                    color: color
                })
            }
            return swatches;
        },
        getColorsFromHailString: function (string) {
            var pos = string.lastIndexOf("/#") + 1;
            var colorString = string.substring(pos);
            var colors = colorString.split(",");
            var swatches = [];
            for (var i = 0; i < colors.length; i++) {
                var color = colors[i];
                if (color != ",") {
                    swatches.push({
                        name: "Imported Color",
                        color: color
                    })
                }
            }
            return swatches;
        },
        getColorsFromURL: function (url) {
            if (url.indexOf("http://color.hailpixel.com/") == 0) {
                return my.colorInventory.getColorsFromHailString(url);
            } else if (url.indexOf("http://coolors.co/") == 0) {
                return my.colorInventory.getColorsFromCoolorsString(url);
            }
            return null;
        },
        getDefinedColors: function (artboard) {
            // get defined colors, rename existing swatches
            var predicate = NSPredicate.predicateWithFormat("NOT (name BEGINSWITH %@) && className == %@", "Untitled", "MSLayerGroup");
            var queryResult = artboard.children()
                .filteredArrayUsingPredicate(predicate);
            return queryResult;
        },
        getDocumentColors: function () {
            var borderColors = my.colorInventory.getDocumentBorderColors();
            var gradients = my.colorInventory.getDocumentGradients();
            var imageFills = my.colorInventory.getDocumentImageFills();
            var solidFillColors = my.colorInventory.getDocumentSolidFillColors();
            var textColors = my.colorInventory.getDocumentTextColors();

            // concat
            // todo: concat and display by type
            var allColors = solidFillColors.concat(textColors)
                .unique();
            return allColors;
        },
        getDocumentBorderColors: function () {
            return my.colorInventory.getDestinctProperties("style.border.color");
        },
        getDocumentGradients: function () {
            return my.colorInventory.getDestinctProperties("style.fill.gradient");
        },
        getDocumentImageFills: function () {
            return my.colorInventory.getDestinctProperties("style.fill.image");
        },
        getDocumentSolidFillColors: function () {
            return my.colorInventory.getDestinctProperties("style.fill.color");
        },
        getDocumentTextColors: function () {
            return my.colorInventory.getDestinctProperties("textColor");
        },
        getDestinctProperties: function (keyPath, scope) {
            // get all layers of the current page, except the ones used on the color artboard
            // todo: should accept scope
            var props = [];
            for (var i = 0; i < doc.pages().count(); i++) {
                var page = doc.pages().objectAtIndex(i);
                var layers = page.children();
                var predicate = NSPredicate.predicateWithFormat("NOT(parentArtboard.name == %@)", my.config.colorInventoryName);
                var result = layers.filteredArrayUsingPredicate(predicate);

                // analyse the colors
                var keyPath = "@distinctUnionOfObjects." + keyPath;
                var objects = [result valueForKeyPath: keyPath];
                var properties = my.utils.arrayFromImmutableArray(objects);
                props.push(properties);
            }
            props = [].concat.apply([], props)
            log(props)

            return props;
        },
        export: function (exportPath) {
            var data = {};
            var colorName = null;
            var colorSheet = my.common.getArtboardByPageAndName(doc.currentPage(), my.config.colorInventoryName);
            var hexColor = null;
            var pName;

            // get defined colors, rename existing swatches
            var predicate = NSPredicate.predicateWithFormat("className == %@ AND name != %@", "MSLayerGroup", "Untitled Color Swatch");
            var queryResult = colorSheet.children()
                .filteredArrayUsingPredicate(predicate);

            for (var j = 0; j < queryResult.count(); j++) {
                // check if there are swatches (groups of color swatches)

                var group = queryResult[j];
                colorName = group.name();
                pName = "Defined";

                // loop through all child layers to find the color
                var layers = group.layers()
                    .array();
                for (var i = 0; i < layers.count(); i++) {

                    // get the current layer
                    var currentLayer = layers[i];
                    if (currentLayer.name()
                        .indexOf("Color Swatch") == 0) {
                        hexColor = currentLayer.name()
                            .substr(13);

                        // remember color and name
                        // todo: format string for use in SCSS?
                        colorName = colorName;

                        // check for palette in name
                        if (colorName.indexOf(">") != -1) {
                            pName = colorName.substr(0, colorName.indexOf(">") - 1);
                            colorName = colorName.substr(colorName.indexOf(">") + 2);
                        }
                        if (data[pName] == null) data[pName] = {};
                        data[pName][colorName] = hexColor;
                    }
                }
            }

            var output = JSON.stringify(data, undefined, 2);

            if (output == "{}") {
                doc.showMessage("Nothing to export. You need to define swatches.")
            } else {
                exportPath += "/colors.json";
                my.common.save_file_from_string(exportPath, output);
                doc.showMessage("Exported to " + exportPath);
            }
        },
        import: function () {

            // let user select a json file from the file browser
            var fileTypes = ["json"];
            var document_path = [[doc fileURL] path].split([doc displayName])[0];
            var fileURL = my.common.filePicker(document_path, fileTypes);
            var str = JSON.parse(NSString.stringWithContentsOfFile(fileURL));

            var importedPalettes = [];
            var newSwatches = [];

            var color;
            var newSwatch;

            if (str != null) {
                for (var key in str) {
                    if (str.hasOwnProperty(key)) {
                        var palette = str[key];
                        var swatches = [];
                        for (var swatch in palette) {
                            color = palette[swatch].replace("#", "");
                            newSwatch = {
                                name: swatch,
                                color: color
                            }
                            newSwatches.push(newSwatch);
                        }
                        var newPalette = {
                            name: key,
                            swatches: newSwatches
                        }
                        importedPalettes.push(newPalette);
                        newSwatches = [];
                    }
                }
            }

            if (importedPalettes.length > 0) {
                my.colorInventory.generate(importedPalettes);
            } else {
                doc.showMessage("Nothing to import.");
            }
        },
        importFromURL: function () {
            // get coolors url from user input
            var url = my.colorInventory.getColorURL();

            // get colors from url
            var swatches = my.colorInventory.getColorsFromURL(url);

            // add them to palettes
            var palettes = [];

            palettes.push({
                name: "Imported",
                swatches: swatches
            })

            // create a new artboard
            var artboard = my.common.getArtboardByPageAndName(doc.currentPage(), "Imported Colors");
            artboard.removeAllLayers();
            var bg = my.common.addCheckeredBackground(artboard);

            // generate color sheet
            my.colors.createColorSheet(artboard, palettes);

            // finish
            my.colorInventory.finish(artboard);

            // resize background
            bg.frame()
                .setWidth(artboard.frame()
                    .width())
            bg.frame()
                .setHeight(artboard.frame()
                    .height())
        },
        getPalettesFromMergingColors: function (queryResult, definedColors) {

            var documentColors = [];
            var primaryColors = [];
            var palettes = [];
            var paletteNames = [];

            for (var i = 0; i < queryResult.count(); i++) {

                var group = queryResult[i];

                // check if there are swatches (groups of color swatches)

                colorName = group.name();

                // check if the color swatch has a defined name

                predicate2 = NSPredicate.predicateWithFormat("name BEGINSWITH %@", "Color Swatch");
                querySwatches = group.children()
                    .filteredArrayUsingPredicate(predicate2);
                // do something with the color swatch
                if (querySwatches.count() == 1) {
                    // get color
                    c = querySwatches[0].style()
                        .fill()
                        .color();

                    index = definedColors.indexOf(c);
                    primaryIndex = primaryColors.indexOf(c);

                    // see wether the color name contains palette information
                    pIndex = colorName.indexOf(">");
                    if (pIndex != -1) {

                        // has palette name
                        pName = colorName.substr(0, pIndex);

                        // add new palette
                        if (paletteNames.indexOf(pName) == -1) {
                            paletteNames.push(pName);

                            // push the palette
                            palettes.push({
                                name: pName,
                                swatches: []
                            });
                        }
                        var foo = NSPredicate.predicateWithFormat("(style.fill != NULL) && (style.fill.color isEqual:%@) && NOT(parentArtboard.name == %@)", c, my.config.colorInventoryName);
                        var bar = doc.currentPage()
                            .children()
                            .filteredArrayUsingPredicate(foo);

                        palettes[paletteNames.indexOf(pName)].swatches.push({
                            name: colorName,
                            color: c,
                            occurences: bar.count()
                        });
                        definedColors.splice(index, 1);
                    } else {
                        // not part of a palette
                        var foo = NSPredicate.predicateWithFormat("(style.fill != NULL) && (style.fill.color isEqual:%@) && NOT(parentArtboard.name == %@)", c, my.config.colorInventoryName);
                        var bar = doc.currentPage()
                            .children()
                            .filteredArrayUsingPredicate(foo);
                        primaryColors.push({
                            name: colorName,
                            color: c,
                            occurences: bar.count()
                        });
                        definedColors.splice(index, 1);
                    }
                    // check if defined color is still part of the documents colors
                    if (index == -1) {
                        // do not remove the color from the defined swatches
                        // definedColors.splice(index, 1);
                        // primaryColors.splice(primaryIndex, 1);
                    }
                }
            };

            for (var i = 0; i < definedColors.length; i++) {
                predicate = NSPredicate.predicateWithFormat("(style.fill != NULL) && (style.fill.color isEqual:%@) && NOT(parentArtboard.name == %@)", definedColors[i], my.config.colorInventoryName);
                queryResult = doc.currentPage()
                    .children()
                    .filteredArrayUsingPredicate(predicate);

                documentColors.push({
                    name: "Untitled Color Swatch",
                    color: definedColors[i],
                    occurences: queryResult.count()
                });
            }

            documentColors.sort(function (a, b) {
                return b.occurences - a.occurences;
            });

            palettes.push({
                name: "Defined Colors",
                swatches: primaryColors
            });
            palettes.push({
                name: "Undefined Colors",
                swatches: documentColors
            });

            // experimental border colors
            // var borderColors = my.colorInventory.getDocumentBorderColors();
            // log(borderColors)
            // var borderSwatches = [];
            // for (var i = 0; i < borderColors.length; i++) {
            //  borderSwatches.push({
            //    name: "Untitled Color Swatch",
            //    color: borderColors[i].hexValue()
            //  })
            // }
            // palettes.push({
            //     name: "Border Colors",
            //     swatches: borderSwatches
            // });


            return palettes;

        },
        positionArtboard: function (what, where) {
            // Position the artboard next to the last artboard
            // The actual position that we want is the right edge of the
            // rightmost artboard plus a margin of 100px.


            // the right most artboard
            var rma = my.layers.getRightmostArtboard();
            // var rma = where;

            if (rma.name() != what.name()) {
                // var shift = what.frame().width();
                // my.colorInventory.shiftArtboardsFromArtboardBy(where, shift);
                var left = rma.frame()
                    .width() + rma.frame()
                    .x() + 100;
                var top = rma.frame()
                    .y();
                what.frame()
                    .setX(left);
                what.frame()
                    .setY(top);
            } else {
                var left = rma.frame()
                    .x();
                var top = rma.frame()
                    .y();
                what.frame()
                    .setX(left);
                what.frame()
                    .setY(top);
            }
        },
        shiftArtboardsFromArtboardBy: function (artboard, shift) {
            // Make sure an artboard is selected
            var selectedArtboard = artboard;
            doc.currentPage()
                .deselectAllLayers();
            selectedArtboard.setIsSelected(true);
            var width = selectedArtboard.frame()
                .width();

            artboards = doc.currentPage()
                .artboards();

            // Move all artboards that are next to the selected one
            for (var i = 0; i < artboards.count(); i++)  {
                // only move artboards on the same y position
                if (artboards[i] != selectedArtboard) {
                    if (artboards[i].frame()
                        .y() == selectedArtboard.frame()
                        .y() && artboards[i].frame()
                        .x() > selectedArtboard.frame()
                        .x()) {
                        var newX = artboards[i].frame()
                            .x() + shift + 100;
                        artboards[i].frame()
                            .setX(newX);
                    }
                }

            }
        },
        finish: function (artboard) {

            // deselect all layers
            doc.currentPage()
                .deselectAllLayers();

            // select current artboard
            artboard.setIsSelected(true);

            // refresh
            // todo: this is costly

            // collapse artboards
            my.utils.sendAction("collapseGroupsInLayerList:");
            artboard.setIsSelected(true);

            // focus the view on the artboard
            // my.view.centerTo(artboard);
        }
    }

    my.colors = {

        // compares two colors and returns true if they are equal
        areEqual: function (a, b) {

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
                    } catch (error)  {
                        log("couldn’t get hex a");
                    }

                    try {
                        hex_b = String(b.hexValue());
                    } catch (error)  {
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
                        var stopsA = a.gradient()
                            .stops();
                        var stopsB = b.gradient()
                            .stops();

                        if (stopsA.count() == stopsB.count()) {
                            for (var i = 0; i < stopsA.count(); i++) {
                                if (stopsA.objectAtIndex(i)
                                    .color() != stopsB.objectAtIndex(i)
                                    .color() || stopsA.objectAtIndex(i)
                                    .position() != stopsB.objectAtIndex(i)
                                    .position()) {
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

            for (var i = 0; i < palettes.length; i++) {
                var palette = palettes[i];

                // add a title if palette has colors
                if (palette.swatches.length > 0) {
                    var title = my.common.addTextLayerTitle(artboard, palette.name);
                    title.frame()
                        .setY(top)
                    title.frame()
                        .setX(margin);
                    top += 80;


                    // var colorChip = my.colors.addColorChip(artboard, palette.swatches[0]);

                    // colorChip.frame().setX(left);
                    // colorChip.frame().setY(top);
                    var colorChip;

                    for (var j = 0; j < palette.swatches.length; j++) {
                        // colorChip.duplicate()
                        left += margin;
                        colorChip = my.colors.addColorChip(artboard, palette.swatches[j]);

                        width = colorChip.frame()
                            .width();
                        // offset color chip
                        colorChip.frame()
                            .setX(left);
                        colorChip.frame()
                            .setY(top);
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
                        top += colorChip.frame()
                            .height() + 1.2 * margin_top;
                    }
                }
            }
            my.common.resize(artboard, 790, top);
        },
        update: function () {
            var scope = doc.currentPage()
                .children();
            var result = my.layers.selectLayersByName("Untitled Color Swatch", scope);
            var swatches = result.objectEnumerator();
            var left = 0;
            var top = 0;
            var margin = 0;
            var width = 0;

            while (swatch = swatches.nextObject()) {
                left += margin;
                swatch = my.colors.addColorChip(artboard, palette.swatches[j]);

                width = swatch.frame()
                    .width();
                // offset color chip
                swatch.frame()
                    .setX(left);
                swatch.frame()
                    .setY(top);
                left += width;

                // after x color chips, star a new row
                if ((j + 1) % my.config.maxColorsPerRow == 0) {
                    top += width + margin_top;
                    left = 0;
                }
            }
            my.common.resize(artboard, 790, top);
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
            if (swatch.name == "Untitled Color Swatch") {
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
            var white = MSColor.colorWithSVGString("#FFFFFF");
            var labelBG = my.colors.addColorShape(group, white, 120, 195);
            labelBG.frame()
                .setY(0);
            labelBG.setName("Background");
            labelBG.setIsSelected(true);

            var bottomBG = my.colors.addColorShape(group, white, 120, 75);
            bottomBG.frame()
                .setY(120);
            bottomBG.setName("Background-Bottom");
            bottomBG.setIsSelected(true);

            // draw square color
            var colorSquare = my.colors.addColorShape(group, color, 120, 120);
            colorSquare.setName("Color Swatch " + hex_string);
            colorSquare.setIsSelected(true);

            // Name Label
            var nameLabel = my.common.addTextLayerEmphasis(group, colorName);
            nameLabel.frame()
                .setY(colorSquare.frame()
                    .height() + padding);
            nameLabel.frame()
                .setX(8);
            nameLabel.setName("Swatch Name");

            // Name Label
            if (swatch.occurences == null) swatch.occurences = 0;

            var countLabel = my.common.addTextLayerEmphasis(group, "Test");
            countLabel.frame()
                .setY(8);
            countLabel.frame()
                .setX(85);
            countLabel.setTextAlignment(1);
            countLabel.setStringValue("" + swatch.occurences + "×");
            countLabel.adjustFrameToFit();
            countLabel.setTextAlignment(1);
            countLabel.setName("Swatch Count");
            countLabel.setTextColor(white);
            // Shadow
            var textShadow = countLabel.style()
                .shadows()
                .addNewStylePart();

            var black = MSColor.colorWithSVGString("#000000");
            black.alpha = 0.5;
            textShadow.setOffsetX(0);
            textShadow.setOffsetY(1);
            textShadow.setBlurRadius(2);
            textShadow.setSpread(0);

            textShadow.setColor(black)

            // Hex Label
            var hexLabel = my.common.addTextLayer(group, hex_string);
            hexLabel.frame()
                .setY(nameLabel.frame()
                    .y() + 14 + padding);
            hexLabel.frame()
                .setX(8);
            hexLabel.setName("Hex Label");

            // RGB Label
            var rgb = String(Math.ceil(color.red()
                .toFixed(2) * 255)) + ", " + String(Math.ceil(color.green()
                .toFixed(2) * 255)) + ", " + String(Math.ceil(color.blue()
                .toFixed(2) * 255)) + ", " + String(color.alpha()
                .toFixed(2));

            var rgbLabel = my.common.addTextLayer(group, rgb);
            rgbLabel.frame()
                .setY(hexLabel.frame()
                    .y() + 14 + padding);
            rgbLabel.adjustFrameToFit();
            rgbLabel.frame()
                .setX(8);
            rgbLabel.setName("RGB Label");

            // Shadow
            var shadow = labelBG.style()
                .shadows()
                .addNewStylePart();

            black.alpha = 0.2;
            shadow.setOffsetX(0);
            shadow.setOffsetY(2);
            shadow.setBlurRadius(3);
            shadow.setSpread(0);

            shadow.setColor(black);


            return group;

        },
        addColorShape: function (artboard, color, width, height) {
            // add layer
            var layer = my.common.addRectangleLayer(artboard)
            layer.frame()
                .setWidth(width);
            layer.frame()
                .setHeight(height);
            layer.style()
                .fills()
                .addNewStylePart();
            layer.style()
                .fill()
                .setFillType(0);
            layer.style()
                .fill()
                .setColor(color);

            return layer;
        },
        addGradientShape: function (artboard, gradient, width, height) {
            // add layer
            var layer = my.common.addRectangleLayer(artboard)
            layer.frame()
                .setWidth(width);
            layer.frame()
                .setHeight(height);
            layer.style()
                .fills()
                .addNewStylePart();
            layer.style()
                .fill()
                .setFillType(1);
            layer.style()
                .fill()
                .setGradient(gradient);

            return layer;
        },
        getColorOf: function (_layer) {
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
                    fill = layer.style()
                        .fills()
                        .firstObject();
                    if (fill != undefined && fill.isEnabled()) {
                        color = fill.color();
                    }
                } catch (error) {
                    // log(error);
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
                                if (fill.fillType() == 0) {
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
        getNameForColor: function (hexColor) {
            var predicate = NSPredicate.predicateWithFormat("name == %@", "Color Swatch #" + hexColor);

            // get the color artboard
            var result = doc.currentPage()
                .children()
                .filteredArrayUsingPredicate(predicate);

            if (result.count() > 0 && result[0].parentGroup()
                .name() != "Untitled Color Swatch") {
                return result[0].parentGroup()
                    .name();
            } else {
                return null;
            }
        },
        hasColorInventory: function () {
            // setup predicate
            var predicate = NSPredicate.predicateWithFormat("name == %@", my.config.colorInventoryName);

            // get the color artboard
            var result = doc.currentPage()
                .artboards()
                .filteredArrayUsingPredicate(predicate);
            if (result.count() != 0) {
                return true;
            } else {
                return false;
            }
        },
        getColorInventory: function () {
            // setup predicate
            var predicate = NSPredicate.predicateWithFormat("name == %@", my.config.colorInventoryName);

            // get the color artboard
            var result = doc.currentPage()
                .artboards()
                .filteredArrayUsingPredicate(predicate);
            if (result.count() != 0) {
                return result.objectAtIndex(0);
            } else {
                return null;
            }
        },
        getTextColorOf: function (layer) {
            var color = null;

            // check if layer is a text layer
            if (layer.className() == "MSTextLayer") {

                // get the text color
                color = layer.textColor();

                // check if the text layer has a fill color
                var fill = layer.style()
                    .fills()
                    .firstObject();
                if (fill != undefined && fill.isEnabled()) {
                    color = fill.color();
                }
            }
            return color;
        },
        // Convert Hexadecimal value to RGB
        // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        hexToRgb: function (hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b
            })

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null
        }
    }

    my.clipboard = {
        // store the pasetboard object
        pasteBoard: null,

        // save the pasteboard object
        init: function () {
            this.pasteBoard = NSPasteboard.generalPasteboard();
        },
        // set the clipboard to the given text
        set: function (text) {
            if (typeof text === 'undefined') return null;

            if (!this.pasteBoard)
                this.init();

            this.pasteBoard.declareTypes_owner([NSPasteboardTypeString], null);
            this.pasteBoard.setString_forType(text, NSPasteboardTypeString);

            return true;
        },
        // get text from the clipbaoard
        get: function () {
            if (!this.pasteBoard)
                this.init();

            var text = this.pasteBoard.stringForType(NSPasteboardTypeString);

            return text.toString();
        }
    };

    my.view = {
        centerTo: function (layer) {
            var selected_object = layer;
            var view = doc.currentView();
            // view.centerRect(selected_object.absoluteRect().rect());
        },
        zoomTo: function (layer) {
            var view = doc.currentView();
            layer.setIsSelected(true);
            view.zoomToSelection();
            view.refresh();
        }
    }

    my.utils = {
        openInFinder: function(path) {
            var finderTask = [[NSTask alloc] init],
                openFinderArgs = [NSArray arrayWithObjects:"-R", path, nil];

            [finderTask setLaunchPath:"/usr/bin/open"];
            [finderTask setArguments:openFinderArgs];
            [finderTask launch];
        },
        sendAction: function (commandToPerform) {
            try {
            [NSApp sendAction: commandToPerform to: nil from: doc];
            } catch (e) {
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
        arrayFromImmutableArray: function (nsarray) {
            var output = [];
            // convert immutable NSArray to mutable array
            for (var i = 0; i < nsarray.count(); i++) {
                output.push(nsarray[i]);
            }
            return output;
        },
        naturalSort: function (a, b) {
            /*
             * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
             * Author: Jim Palmer (based on chunking idea from Dave Koelle)
             */

            var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
                sre = /(^[ ]*|[ ]*$)/g,
                dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
                hre = /^0x[0-9a-f]+$/i,
                ore = /^0/,
                i = function(s) { return my.utils.naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
                // convert all to strings strip whitespace
                x = i(a).replace(sre, '') || '',
                y = i(b).replace(sre, '') || '',
                // chunk/tokenize
                xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                // numeric, hex or date detection
                xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
                yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
                oFxNcL, oFyNcL;
            // first try and sort Hex codes or Dates
            if (yD)
                if ( xD < yD ) return -1;
                else if ( xD > yD ) return 1;
            // natural sorting through split numeric strings and default strings
            for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
                // find floats not starting with '0', string or 0 if not defined (Clint Priest)
                oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
                oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
                // handle numeric vs string comparison - number < string - (Kyle Adams)
                if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
                // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                else if (typeof oFxNcL !== typeof oFyNcL) {
                    oFxNcL += '';
                    oFyNcL += '';
                }
                if (oFxNcL < oFyNcL) return -1;
                if (oFxNcL > oFyNcL) return 1;
            }
            return 0;

        },
        sortName: function (_a, _b) {
            var a = _a.name;
            var b = _b.name;

            return my.utils.naturalSort(a, b);
        }
    }

    my.css = {
        /**
         * createRuleSetStr by Tyler Gaw https://gist.github.com/tylergaw/adc3d6ad044f5afac446
         **/

        createRuleSetStr: function (layer) {

            var baseunit = my.css.getBaseUnit();

            var str = '';

            var selector = "." + my.css.getClassName(layer);

            // get the css attributes from sketch, yay!
            var attrs = layer.CSSAttributes();

            str += selector + ' {';

            for (var i = 0; i < attrs.count(); i += 1) {
                // raw css declaration provided by Sketch
                var declaration = attrs.objectAtIndex(i);

                // formatted declaration
                // for example font-size and line height will be expressed in relative units instead of pixels
                var property = declaration.substring(0, declaration.indexOf(":"));
                var value = declaration.substring(declaration.indexOf(":") + 1, declaration.indexOf("px"));

                switch (property) {
                case "font-size":
                    if (my.css.formatOptions.useRelativeFontSize) {
                        value = value / baseunit;
                        declaration = property + ": " + value + "rem;";
                    }
                    break;
                case "line-height":
                    if (my.css.formatOptions.useRelativeLineHeight) {
                        value = my.css.getRelativeLineHeight(layer);
                        declaration = property + ": " + value + "em;";
                    }
                    break;
                    // case "color":
                    //   if (my.css.formatOptions.useSassColorVariables) {
                    //     var value = declaration.substring(declaration.indexOf("#"), declaration.indexOf(";"));
                    //     value = my.colors.getNameForColor(value)
                    //     declaration = property + ": " + value + ";";
                    //     log(declaration)
                    //   }
                    // break;
                default:
                    break;
                }

                if (declaration.indexOf('/*') < 0) {
                    str += '\n\t' + declaration;
                }
            }
            str += '\n}';
            return str;
        },
        formatOptions: {
            useRelativeFontSize: true,
            useRelativeLineHeight: true,
            useSassColorVariables: true,
            splitFontFamily: true
        },
        getBaseUnit: function () {
            // access the base unit for formatting purposes
            var persistent = [[NSThread mainThread] threadDictionary];

            if (persistent["my.baseunit"] == null) {
                var value = parseFloat([doc askForUserInput: "Base unit:"
                    initialValue: 16]);
                persistent["my.baseunit"] = value;
            }

            var baseunit = persistent["my.baseunit"];
            return baseunit;
        },
        getClassName: function (layer) {
            // get the layer name
            var name = layer.name()
                .toLowerCase();

            // replace special characters by a dash
            var regex = new RegExp("[/:(). ]", "g");
            name = name.replace(regex, "-");

            // construct the css selector
            var selector = name;

            return selector;
        },
        getRelativeFontSize: function (textLayer, baseunit) {

            var relativeFontSize = null;

            if (layer.className() == "MSTextLayer") {
                var fontSize = layer.fontSize();
                relativeFontSize = fontSize / baseunit;
            }
            return relativeFontSize;
        },
        getRelativeLineHeight: function (textLayer) {

            var relativeLineHeight = null;

            if (textLayer.className() == "MSTextLayer") {
                var fontSize = textLayer.fontSize();
                var lineSpacing = textLayer.lineSpacing();
                relativeLineHeight = (lineSpacing / fontSize)
                    .toFixed(2);
            }
            return relativeLineHeight;
        },

        generateStyleSheet: function (layers) {
            var stylesheet = '';
            var stylesheet = "/* Text Styles from Sketch */";

            for (var i = 0; i < layers.count(); i++) {

                var layer = layers.objectAtIndex(i);

                // only get CSS for text layers
                if ([layer isKindOfClass: MSTextLayer] && layer.style()
                    .sharedObjectID() != null) {
                    stylesheet += '\n\n' + my.css.createRuleSetStr(layer);
                }
            }
            return stylesheet;
        },
        generateMarkup: function (layers) {
            var markup = '<!DOCTYPE html>';
            markup += '\n';
            markup += '<html lang="en">';
            markup += '\n';
            markup += '<head>';
            markup += '\n\t';
            markup += '<meta charset="UTF-8">';
            markup += '\n\t';
            markup += '<title>Style Inventory</title>';
            markup += '\n\t';
            markup += '<link rel="stylesheet" href="typography.css">';
            markup += '\n\t';
            markup += '<style type="text/css">';
            markup += '\n\t\t';
            markup += 'body {background-color: #fff;background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.01) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0,0.01) 75%, rgba(0, 0, 0,0.01)), linear-gradient(45deg, rgba(0, 0, 0,0.01) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0,0.01) 75%, rgba(0, 0, 0, 0.01));background-size: 30px 30px;background-position: 0 0, 15px 15px; font-family: "Helvetica Neue"; line-height: 1.3em;font-size: 16px;}';
            markup += '\n\t\t';
            markup += '.code {font-family: monospace; font-size: 0.6em; color: #999; line-height: 1.3em; margin: 0}';
            markup += 'h1 {margin-bottom: 5px;cursor: pointer; font-weight: normal}';
            markup += '.small {font-size: 0.8em}';

            // markup += 'header {position: fixed; top: 0px; overflow: scroll; height: 200px;background: white}';
            markup += '\n\t';
            markup += '</style>';
            markup += '\n';
            markup += '</head>';

            markup += '\n';
            markup += '<body>';
            markup += '\n\t';
            markup += '<span class="small">' + new Date() + '</span>';
            markup += '\n\t';
            // markup += '<header><p id="lorem">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Temporibus fugit voluptatem aliquam dolore ipsa, ut sapiente? Sunt unde eius cumque quia eos. Rem inventore possimus error sapiente atque, id, nisi!</p></header>';
            for (var i = 0; i < layers.count(); i++) {

                var layer = layers.objectAtIndex(i);

                // only get CSS for text layers
                if ([layer isKindOfClass: MSTextLayer] && layer.style()
                    .sharedObjectID() != null) {
                    // markup += "<td>" + my.css.createRuleSetStr(layer) + "</td>";
                    markup += '\n\t' + my.css.createMarkupStr(layer);
                    markup += '\n\t';
                    markup += '<span class="code">\n\t\t' + my.css.createRuleSetStr(layer) + '\n\t</span>';
                    markup += '\n';
                }
            }
            markup += '\n';
            // markup += '<script type="text/javascript">';
            // markup += 'var lorem = document.getElementById("lorem");var allElements = document.querySelectorAll("*");for (var i = 0; i < allElements.length; i++) {var element = allElements[i];element.onclick=function(element) {lorem.className = element.target.className;}}';
            // markup += '</script>';
            markup += '</body>';
            markup += '\n';
            markup += '</html>';
            return markup;
        },
        createMarkupStr: function (layer) {
            var selector = my.css.getClassName(layer);
            var html = "\<h1 class=\"" + selector + "\">" + layer.name() + "</h1>";
            return html;
        }
    }

    my.layers = {
        alignLayersHorizontally: function (layers) {
            if (layers.count() == 1)  {
                var layer = layers[0];
                var parent = layer.parentGroup();
                var midX = parent.absoluteRect()
                    .midX();
                var targetX = Math.ceil(midX - layer.frame()
                    .width() / 2);
                layer.absoluteRect()
                    .setX(targetX);
            } else if (layers.count() > 1) {
                for (var i = 0; i < layers.count(); i++) {

                }
            }
        },
        alignLayersVertically: function (layers) {
            if (layers.count() == 1)  {
                var layer = layers[0];
                var parent = layer.parentGroup();
                var midY = parent.absoluteRect()
                    .midY();
                var targetY = Math.ceil(midY - layer.frame()
                    .height() / 2);
                layer.absoluteRect()
                    .setY(targetY);
            } else if (layers.count() > 1) {
                for (var i = 0; i < layers.count(); i++) {

                }
            }
        },
        areEqual: function (layer1, layer2) {
            return layer1.objectID() === layer2.objectID();
        },
        /**
         * Returns the x position of the rightmost artboard
         * @return {artboard} artboard
         */
        getRightmostArtboard: function () {
            var rma = null;

            var scope = doc.currentPage()
                .artboards();
            if(scope.count() > 0) {
                var maxX = [scope valueForKeyPath: "@max.frame.maxX"];
                var predicate = NSPredicate.predicateWithFormat("frame.maxX == %@", maxX);
                var artboard = scope.filteredArrayUsingPredicate(predicate);
                rma = artboard[0];
            }

            return rma;
        },
        getLayersSortedByName: function (layers) {
            var layer;
            var layersMeta = [];

            for (var i = 0; i < layers.count(); i++) {

                layer = layers.objectAtIndex(i);

                layersMeta.push({
                    "name": layer.name(),
                    "layer": layer
                });
            }

            return layersMeta.sort(my.utils.sortName);
        },
        getLayersByTextStyle: function (textStyle, scope) {
            var predicate = NSPredicate.predicateWithFormat("(style.textStyle != NULL) && (FUNCTION(style.textStyle, 'isEqualForSync:asPartOfSymbol:', %@, nil) == YES)", textStyle);
            // query page layers
            var queryResult = scope.filteredArrayUsingPredicate(predicate);

            return queryResult;
        },
        getLayersByLayerStyle: function (layerStyle, scope) {
            var predicate = NSPredicate.predicateWithFormat("(style.fill != NULL) && (FUNCTION(style.fill, 'isEqualForSync:asPartOfSymbol:', %@, nil) == YES)", layerStyle.fill());
            // query page layers
            var queryResult = scope.filteredArrayUsingPredicate(predicate);

            return queryResult;
        },
        getLayersBySize: function (referenceLayer, scope) {
            var predicate = NSPredicate.predicateWithFormat("(frame != NULL) && frame.width == %@ && frame.height == %@ && className == %@", referenceLayer.frame().width(), referenceLayer.frame().height());
            var queryResult = scope.filteredArrayUsingPredicate(predicate);

            return queryResult;
        },
        getEqualLayers: function (referenceLayer, scope) {
            var predicate = NSPredicate.predicateWithFormat("(FUNCTION(self, 'isEqualForSync:asPartOfSymbol:', %@, nil) == YES)", context.selection[0]);
            var queryResult = scope.filteredArrayUsingPredicate(predicate);
            return queryResult;
        },
        select: function (layers) {
            // deselect first
            doc.currentPage()
                .deselectAllLayers();

            // then select all layers from the original selection
            for (var i = 0; i < layers.count(); i++) {
                layers[i].setIsSelected(true);
            }
        },
        selectLayersByColor: function (referenceLayer, scope) {
            var color = null,
                results = 0,
                referenceColor = null,
                selected = null;

            // deselect
            doc.documentData()
                .deselectAllLayers();

            // get color of selected layer
            color = my.colors.getColorOf(referenceLayer);

            var ftype = 0;

            try {
                ftype = color.fillType();
            } catch (error) {}

            // init predicate
            var predicate = null;

            // use appropriate predicate depending on the selected layer class

            switch (String(referenceLayer.className())) {
            case "MSTextLayer":
                predicate = NSPredicate.predicateWithFormat("textColor.hexValue == %@ && textColor.alpha == %@", color.hexValue(), color.alpha());
                break;
            case "MSOvalShape":
            case "MSShapeGroup":
            case "MSShapePathLayer":
            case "MSRectangleShape":
                // check if color is solid
                if (ftype != 0) {
                    predicate = NSPredicate.predicateWithFormat("(style.fill != NULL) && (style.fill isEqual:%@)", color);
                } else {
                    predicate = NSPredicate.predicateWithFormat("(style.fill != NULL) && (style.fill.fillType == 0) && style.fill.color.hexValue == %@ && style.fill.color.alpha == %@", color.hexValue(), color.alpha());
                }
                break;
            default:

                break;
            }

            // query page layers
            var queryResult = scope.filteredArrayUsingPredicate(predicate);

            // select all results
            doc.currentPage()
                .selectLayers(queryResult);

            return queryResult;
        },
        selectLayersByBorderColor: function (referenceLayer, scope) {
            var color = null,
                results = 0,
                referenceColor = null,
                selected = null;

            // deselect
            doc.documentData()
                .deselectAllLayers();

            // get color of selected layer
            color = my.colors.getColorOf(referenceLayer);

            var predicate = NSPredicate.predicateWithFormat("(style.border != NULL) && style.border.color.hexValue == %@", color.hexValue());

            // query page layers
            var queryResult = scope.filteredArrayUsingPredicate(predicate);

            // select all results
            doc.currentPage()
                .selectLayers(queryResult);

            return queryResult;
        },
        selectLayersByName: function (referenceName, scope) {

            // deselect
            doc.documentData()
                .deselectAllLayers();

            // init predicate
            var predicate = null;

            // define base name
            var baseName = referenceName;

            // Get the last part of the layer name and check if it is an appended number
            var end = referenceName.lastIndexOf(" ");
            if (end != -1) {
                var endString = referenceName.substring(end);
                // Check if the last part is a number
                var numberRegex = new RegExp("[0-9]");
                if (endString.match(numberRegex) != null) {
                    // Found a number, so the search string needs to be trimmed
                    baseName = referenceName.substring(0, end);
                }
            }

            // setup predicate
            var predicate = NSPredicate.predicateWithFormat("name beginswith[c] %@", baseName);

            // query page layers
            var result = scope.filteredArrayUsingPredicate(predicate);

            // select all results
            doc.currentPage()
                .selectLayers(result);

            return result;
        },
        selectLayersBySize: function (width, height, scope) {

            // deselect
            doc.documentData()
                .deselectAllLayers();

            // init predicate
            var predicate = null;

            // setup predicate
            var predicate = NSPredicate.predicateWithFormat("frame.width == %@ AND frame.height == %@", width, height);

            // query page layers
            var result = scope.filteredArrayUsingPredicate(predicate);

            // select all results
            doc.currentPage()
                .selectLayers(result);

            return result;
        },
        selectLayersByString: function (referenceString, scope) {

            // deselect
            doc.documentData()
                .deselectAllLayers();

            // init predicate
            var predicate = null;

            // setup predicate
            var predicate = NSPredicate.predicateWithFormat("stringValue == %@", referenceString);

            // query page layers
            var result = scope.filteredArrayUsingPredicate(predicate);

            // select all results
            doc.currentPage()
                .selectLayers(result);

            return result;
        },
        selectLayersByTextStyle: function (textStyle, scope) {
            var predicate = NSPredicate.predicateWithFormat("(style.textStyle != NULL) && (FUNCTION(style.textStyle, 'isEqualForSync:asPartOfSymbol:', %@, nil) == YES)", textStyle);

            // query page layers
            var queryResult = scope.filteredArrayUsingPredicate(predicate);

            // select all results
            doc.currentPage()
                .selectLayers(queryResult);

            return queryResult;
        },
        selectParentGroup: function (layer) {

            // Selects the parent group of a layer (option cmd g)

            // get parent
            var parent = layer.parentGroup();

            // deselect all layers
            doc.currentPage()
                .deselectAllLayers();

            // select parent group
            parent.setIsSelected(true);

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
            } catch (error) {}

            if (parent_a == parent_b) {

                var parent = parent_a;

                // deselect all layers
                doc.currentPage()
                    .deselectAllLayers();

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
                var next = layers[layers.length - 1].layer;

                my.layers.swapIndex(first, next);
            }
        }
    }

    my.textStyleInventory = {

        generate: function (_virtual) {

            // start tracking the time
            var startTime = new Date();

            var virtual = _virtual || false;
            // ask for base unit
            if (my.css.formatOptions.useRelativeFontSize == true) var baseunit = my.css.getBaseUnit();

            // get defined text styles
            var definedTextStyles = my.textStyleInventory.analyseTextStyles();

            // for large files, sketch crashes after adding the style sheet page (a second time)
            var styleSheetPage = my.common.getStyleSheetPage();
            var artboard = my.common.getArtboardByPageAndName(styleSheetPage, "Text Styles Inventory");
            artboard.removeAllLayers();

            if (virtual) my.textStyleInventory.createTextStylesVirtual(artboard, definedTextStyles);

            artboard.removeAllLayers();
            my.textStyleInventory.createTextStyles(artboard, definedTextStyles);

            var bg = my.common.addCheckeredBackground(artboard);


            // resize background
            bg.frame()
                .setWidth(artboard.frame()
                    .width())
            bg.frame()
                .setHeight(artboard.frame()
                    .height())

            doc.currentPage().deselectAllLayers();
            bg.setIsSelected(true);
            my.utils.sendToBack();
            doc.currentPage().deselectAllLayers();

            // my.textStyleInventory.exportStyles(artboard, path);

            if (virtual) {
                doc.currentPage().removeLayer(artboard);
            }

            // Feedback
            var execTime = (new Date() - startTime) / 1000;
            doc.showMessage("Generated Text Styles in " + execTime + " s");

            return artboard;

        },

        analyseTextStyles: function ()  {
            var definedTextStyles = [];
            var styles = doc.documentData()
                .layerTextStyles()
                .objects();

            for (var i = 0; i < styles.count(); i++) {
                var style = styles.objectAtIndex(i);
                var attributes = style.style()
                    .textStyle()
                    .attributes();
                var textStyle = style
                if (!my.common.isIncluded(definedTextStyles, textStyle) && style.name().indexOf("Style Inventory") == -1) {
                    definedTextStyles.push({
                        "attributes": attributes,
                        "textStyle": style,
                        "name": style.name()
                    });
                }
            }
            // sort by font size
            definedTextStyles.sort(my.textStyleInventory.compareTextStyleFontSize);
            return definedTextStyles;
        },

        compareTextStyleFontSize: function (b, a) {
            if (a.attributes.NSFont.fontDescriptor()
                .objectForKey(NSFontSizeAttribute) < b.attributes.NSFont.fontDescriptor()
                .objectForKey(NSFontSizeAttribute))
                return -1;
            if (a.attributes.NSFont.fontDescriptor()
                .objectForKey(NSFontSizeAttribute) > b.attributes.NSFont.fontDescriptor()
                .objectForKey(NSFontSizeAttribute))
                return 1;
            return 0;
        },
        createTextStylesVirtual: function (artboard, definedTextStyles) {


            for (var i = 0; i < definedTextStyles.length; i++) {

                var definedTextStyle = definedTextStyles[i];
                var textLayer = artboard.addLayerOfType("text");

                textLayer.setStyle(definedTextStyle.textStyle.newInstance());
                textLayer.setName(definedTextStyle.name);
            }
        },
        createTextStyles: function (artboard, definedTextStyles) {

            var has = my.colors.hasColorInventory();
            var top = 30;
            var margin = 20;
            var maxWidth = 0;
            var colorName;

            for (var i = 0; i < definedTextStyles.length; i++) {

                var $grey = MSColor.colorWithSVGString("#000000");
                $grey.alpha = 0.5;

                var definedTextStyle = definedTextStyles[i];
                var textLayer = artboard.addLayerOfType("text");

                var fontString = String(definedTextStyle.attributes.NSFont);
                var font = fontString.substring(1, fontString.indexOf("pt."));
                var label = "" + font + "pt";

                colorName = null;

                // Text layer holding the style name
                var styleName = definedTextStyle.name;
                var styleNameLayer = artboard.addLayerOfType("text");

                textLayer.setTextAlignment(0);
                textLayer.setStringValue(styleName);
                textLayer.adjustFrameToFit();
                textLayer.setTextAlignment(0);

                textLayer.setStyle(definedTextStyle.textStyle.newInstance());
                textLayer.setTextAlignment(0);
                textLayer.setName(definedTextStyle.name);
                var theWidth = textLayer.frame()
                    .width();

                var color = textLayer.textColor();

                var hexColor = color.hexValue();
                var rgb = String(Math.ceil(color.red() * 255)) + ", " + String(Math.ceil(color.green() * 255)) + ", " + String(Math.ceil(color.blue() * 255)) + ", " + String(color.alpha()
                    .toFixed(2));

                var alpha = String(color.alpha()
                    .toFixed(2) * 100);
                if (has == true) colorName = my.colors.getNameForColor(hexColor);

                if (colorName == null) {
                    colorName = "#" + hexColor;
                    if (alpha != 100) colorName += " @" + alpha + "%"
                }


                var label = textLayer.fontPostscriptName() + "\n" + textLayer.fontSize() + "pt, " + colorName;
                styleNameLayer.setStringValue(label);
                styleNameLayer.setName(definedTextStyle.name);
                styleNameLayer.setTextColor($grey);
                styleNameLayer.setLineSpacing(18);

                if (theWidth > maxWidth) maxWidth = theWidth;
                textLayer.frame()
                    .setX(margin + 150);
                textLayer.frame()
                    .setY(top);

                // position the style name layer
                styleNameLayer.frame()
                    .setX(margin);
                styleNameLayer.frame()
                    .setY(top);

                top += textLayer.frame()
                    .height();
                top += styleNameLayer.frame()
                    .height();
            }

            // centerView(textLayer)

            // Resize artboard and background to match the newly created text layers
            var bounds = MSLayerGroup.groupBoundsForLayers(artboard.layers()
                .array());

            var scope = artboard.children();
            var predicate = NSPredicate.predicateWithFormat("className == %@", "MSTextLayer");
            var result = scope.filteredArrayUsingPredicate(predicate);

            var maxWidth = [result valueForKeyPath: "@max.frame.width"];

            artboard.frame()
                .setWidth(maxWidth + 150 + 2 * margin);
            artboard.frame()
                .setHeight(bounds.size.height);


        },
        export: function (artboard, path, virtual) {

            // ask for base unit
            var baseunit = my.css.getBaseUnit();

            // Document path
            if (doc.fileURL() != null) {

                // generate css
                var styleSheetString = my.css.generateStyleSheet(artboard.children());
                var markup = my.css.generateMarkup(artboard.children());

                // save css
                my.common.save_file_from_string(path + "typography.css", styleSheetString);
                my.common.save_file_from_string(path + "styles.html", markup);

                // refresh view
                var view = [doc currentView];
                view.refresh();

                // create web view and show the generated html
                if (virtual) my.common.createWebView(path);
            } else {
                doc.showMessage("Export failed. Please save your file first.")
            }
        }
    }

    /**
     * [symbolInventory description]
     * @type {Object}
     */
    my.symbolInventory = {
        addSymbolsSheetToPage: function (page) {

            // get symbols
            var symbols = doc.documentData().layerSymbols().objects();

            // add an artboard where all symbols will be placed

            var artboard = MSArtboardGroup.new();
            artboard.setName("Symbols");
            var frame = artboard.frame();
            frame.setX(0);
            frame.setY(0);
            frame.setConstrainProportions(false);
            frame.setWidth(800)
            frame.setHeight(500)

            // add artboard to page
            page.addLayers([artboard])

            for (var i = 0; i < symbols.count(); i++) {

                // get symbol reference
                var symbolRef = symbols.objectAtIndex(i);

                // add layer from symbol to document
                var symbol = symbols.objectAtIndex(i).newInstance();

                // set name
                symbol.setName(symbolRef.name());

                // add symbol to page
                artboard.addLayers([symbol]);
            }
            my.symbolInventory.layout(artboard);
            return artboard;

        },
        generate: function () {

            // start tracking the time
            var startTime = new Date();

            // get page
            var page = my.common.getStyleSheetPage();
            var artboard = my.common.getArtboardByPageAndName(page, "Symbols");

            // clear existing artboard
            page.removeLayer(artboard);
            artboard = my.symbolInventory.addSymbolsSheetToPage(page);

            var execTime = (new Date() - startTime) / 1000;
            doc.showMessage("Generated Symbols in " + execTime + " s");

            return artboard;
        },

        layout: function (artboard) {

            /**
             * Very basic layout routine that places all layers with the same base name next to each other.
             * Every time a new base name is found, a new row will be started.
             * The nameing convention is: set/element/state
             *
             * e.g.     ui/checkbox/normal
             *          ui/checkbox/selected
             *
             * todo: improve rendering time
             */

            var name;
            var moduleName;
            var prevName = "";
            var layer;
            var layers = my.layers.getLayersSortedByName(artboard.layers());

            var padding = 200;
            var nextX = padding;
            var nextY = 0;
            var gridX = 80;
            var gridY = 200;
            var maxX = 0;
            var maxY = 0;

            var artboardWidth = 0;

            // storage
            var cards = [];
            var lines = [];
            var card;

            for (var i = 0; i < layers.length; i++) {
                layer = layers[i].layer;
                name = layer.name();
                moduleName = name.substr(0, name.lastIndexOf("/"));

                // new group
                if (moduleName != prevName) {

                    var nextX = padding;

                    // finish up the card
                    if (card) {
                        card.frame().setHeight(nextY - card.frame().y() + maxY + gridY / 4);
                        card.frame().setX(nextX);
                        card.frame().setWidth(maxX - padding);
                    }

                    if (line) {
                        line.frame().setWidth(maxX - padding - gridX);
                    }

                    // add a margin before the next group
                    nextY += gridY + maxY;
                    nextX += gridX / 2;

                    // add a card background
                    card = my.symbolInventory.addCard(artboard);
                    card.setName("card");
                    card.frame().setY(nextY - gridY / 4);

                    // resize card
                    cards.push(card);

                    // add a label
                    var label = my.symbolInventory.addLabel(artboard, moduleName, nextX, nextY);

                    // add margin before separator
                    nextY += 24;

                    // draw a separator
                    var line = my.symbolInventory.addLine(artboard);
                    line.frame().setX(nextX);
                    line.frame().setY(nextY);
                    line.frame().setWidth(maxX - padding - gridX);
                    lines.push(line);

                    nextY += gridY / 4;

                    if (maxX > artboardWidth) artboardWidth = maxX;

                    maxX = 0;
                    maxY = 0;

                    // set the prevname
                    prevName = moduleName;

                } else {
                    nextX += gridX;
                }
                if (layer.frame().height() > maxY) {
                    maxY = layer.frame().height();
                }

                // in any case: add the symbol
                layer.frame().setX(nextX);
                layer.frame().setY(nextY);

                var r = layer.frame().x() + layer.frame().width() + gridX / 2;
                if (r > maxX) maxX = r;

                nextX += layer.frame().width();
            }

            // fix the very last card
            if (card) {
                card.frame().setHeight(nextY - card.frame().y() + maxY + gridY / 4);
                card.frame().setX(padding)
                card.frame().setWidth(maxX - padding)
                line.frame().setWidth(maxX - padding - gridX);
            }

            // resize artboard
            artboard.frame().setHeight(nextY + padding + maxY)
            artboard.frame().setWidth(artboardWidth + padding)

            // add background
            my.symbolInventory.addBackground(artboard);
        },

        addLabel: function (artboard, string, x, y) {

            if (string == "") {
                string = "undefined";
            }

            // add module name as text layer
            var label = my.common.addTextLayer(artboard, string.toUpperCase());

            label.setFontSize(15);
            label.setFontPostscriptName(my.config.FONT);
            label.setCharacterSpacing(2);

            // color
            var color = MSColor.colorWithSVGString(my.config.TEXT_COLOR);

            // position
            label.frame().setX(x);
            label.frame().setY(y);

            // set text style
            label.setTextColor(color);

            // add shared style
            var sharedStyles = doc.documentData().layerTextStyles();

            var styleName = "Style Inventory / Label";
            var textStyle = my.common.getTextStyleByName(styleName);

            if (textStyle == null) {
                sharedStyles.addSharedStyleWithName_firstInstance(styleName, label.style());
            } else {
                // apply style
                my.symbolInventory.styleAllTextLayersBasedOnLayerWithTextStyle(label, textStyle);
            }

            return label;
        },

        addBackground: function (artboard) {
            // add background
            var bg = my.common.addSolidBackground(artboard, my.config.BACKGROUND_COLOR);

            // add shared style
            var sharedStyles = doc.documentData().layerStyles();

            var styleName = "Style Inventory / Background";
            var layerStyle = my.common.getLayerStyleByName(styleName);

            if (layerStyle == null) {
                sharedStyles.addSharedStyleWithName_firstInstance("Style Inventory / Background", bg.style());
            } else {
                // apply style
                my.symbolInventory.styleAllLayersBasedOnLayerWithLayerStyle(bg, layerStyle);
            }

            doc.currentPage().selectLayers([bg]);
            my.utils.sendToBack();
            bg.setIsLocked(true);
            bg.setIsSelected(false);
        },

        addCard: function (artboard) {
            // add background
            var color = MSColor.colorWithSVGString(my.config.CARD_COLOR);
            var card = my.colors.addColorShape(artboard, color, 100, 100);

            // Shadow
            var shadow = card.style()
                .shadows()
                .addNewStylePart();

            var black = MSColor.colorWithSVGString("#000000");
            black.alpha = 0.1;
            shadow.setOffsetX(0);
            shadow.setOffsetY(2);
            shadow.setBlurRadius(3);
            shadow.setSpread(0);

            shadow.setColor(black);

            // add shared style
            var sharedStyles = doc.documentData().layerStyles();

            var styleName = "Style Inventory / Card";
            var layerStyle = my.common.getLayerStyleByName(styleName);

            if (layerStyle == null) {
                sharedStyles.addSharedStyleWithName_firstInstance("Style Inventory / Card", card.style());
            } else {
                // apply style
                my.symbolInventory.styleAllLayersBasedOnLayerWithLayerStyle(card, layerStyle);
            }

            doc.currentPage().deselectAllLayers();
            card.setIsSelected(true);
            my.utils.sendToBack();
            return card;

        },

        addLine: function (target) {
            var black = MSColor.colorWithSVGString("#000000");
            black.alpha = 0.15;
            var line = my.colors.addColorShape(target, black, 100, 1);
            line.setName("separator");

            // add shared style
            var sharedStyles = doc.documentData().layerStyles();

            var styleName = "Style Inventory / Separator";
            var layerStyle = my.common.getLayerStyleByName(styleName);

            if (layerStyle == null) {
                sharedStyles.addSharedStyleWithName_firstInstance("Style Inventory / Separator", line.style());
            } else {
                // apply style
                my.symbolInventory.styleAllLayersBasedOnLayerWithLayerStyle(line, layerStyle);
            }

            return line;
        },
        /**
         * Exports all symbols as PNG
         */
        export: function (exportPath) {

            var scope = doc.currentPage().children();
            var predicate = NSPredicate.predicateWithFormat("parentOrSelfIsSymbol == %@ && className != %@", false, "MSArtboardGroup");

            // hide non symbols
            var results = scope.filteredArrayUsingPredicate(predicate);

            var layers = results.objectEnumerator();

            while (layer = layers.nextObject()) {
                layer.setIsVisible(false);
            }

            /**
             * export
             */

            var exportLayers = doc.currentPage().children().objectEnumerator();

            while (slice = exportLayers.nextObject()) {
              if (slice.isSymbol()) {
                var rect = slice.absoluteRect().rect();
                var rect = slice.absoluteInfluenceRect();
                [doc saveArtboardOrSlice:[GKRect rectWithRect:rect] toFile:exportPath + slice.name() + '.png'];
                // [doc saveArtboardOrSlice:slice toFile:exportPath + slice.name() + '.png'];
              }
            }

            /**
             * show symbols
             */

            layers = results.objectEnumerator();
            while (layer = layers.nextObject()) {
                layer.setIsVisible(true);
            }

            doc.showMessage('Symbols exported to: ' + exportPath);
        },

        styleAll: function (layers, style) {
            for (var i = 0; i < layers.count(); i++) {
                my.symbolInventory.styleLayer(layers[i], style);
            }
        },

        styleLayer: function (layer, style) {
            layer.setStyle(style.newInstance());
        },

        styleAllTextLayersBasedOnLayerWithTextStyle: function (layer, textStyle) {

            // get all text layers that match the style
            var layers = my.layers.getLayersByTextStyle(layer.style().textStyle(), doc.currentPage().children());
            my.symbolInventory.styleAll(layers, textStyle);
            return layers;
        },

        styleAllLayersBasedOnLayerWithLayerStyle: function (layer, layerStyle) {

            // get all text layers that match the style
            var layers = my.layers.getLayersByLayerStyle(layer.style(), doc.currentPage().children());
            my.symbolInventory.styleAll(layers, layerStyle);
            return layers;
        },

        selectTextStyle: function (preselect) {
            var preselect = preselect || 0;
            var textStyles = [];
            var textItems = [];

            var selection;

            var styles = doc.documentData().layerTextStyles().objects();
            if (styles.count() != 0) {
                for (var i = 0; i < styles.count(); i++) {
                  var style = styles.objectAtIndex(i);
                    textStyles.push({
                        "textStyle": style,
                        "name": style.name()
                    });
                    textItems.push(style.name());
                }
                if (textItems) selection = my.common.createSelect("Select a text style or create a new one", textItems, preselect);
            } else {
                return;
            }
            return selection;
        },

        selectLayerStyle: function () {
            var layerStyles = [];
            var layerStyleItems = [];

            var selection;

            var styles = doc.documentData().layerStyles().objects();
            if (styles.count() != 0) {
                for (var i = 0; i < styles.count(); i++) {
                  var style = styles.objectAtIndex(i);
                    layerStyles.push({
                        "layerStyle": style,
                        "name": style.name()
                    });
                    layerStyleItems.push(style.name());
                }
                if (layerStyleItems) selection = my.common.createSelect("Select a style or create a new one", layerStyleItems, 0);
            } else {
                return;
            }
            return selection;
        }
    }

    return my;
}());

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i].hexValue() === a[j].hexValue())
                a.splice(j--, 1);
        }
    }

    return a;
};