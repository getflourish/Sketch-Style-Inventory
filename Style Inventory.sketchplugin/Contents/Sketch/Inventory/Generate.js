/**
 * Style Inventory Generator
 *
 * This command shows a configuration dialog before running the selected inventories.
 * If the export checkbox is selected, the styles will be exported to a export folder near the Sketch file.
 */

@import '../inventory.js'
@import '../sandbox.js'
@import '../persistence.js'

var colors;
var textStyles;
var symbols;
var exportMetadata;
var artboards;

// turn the text styles panel on / off
var showTextStylesPanel = false;

var ca, ta, sa;


function layout (artboards) {
    var x = 0;
    var artboard;
    for (var i = 0; i < artboards.length; i++) {
        artboard = artboards[i];
        artboard.frame().setX(x);
        x += artboard.frame().width() + 100;
    }

}

function handleExport () {

    // let the user choose the export location
    // var fileURL = com.getflourish.common.fileSaver();
    // path = fileURL.path();

    var documentPath = [[doc fileURL] path].split([doc displayName] + ".sketch")[0];

    // export path + "/" + filename
    //

    // get authorization to write to the export folder
    new AppSandbox().authorize(documentPath, function () {

        // Everything will be exported to a new folder in the .sketch file's parent folder
        var baseExportPath = documentPath + 'export/' + doc.displayName().split(".sketch") + '/';
        createFolder(baseExportPath);

        var exportPath;


        if (colors == 1) {

            // set the export path
            exportPath = baseExportPath + "colors/";

            // create the folder
            createFolder(exportPath);

            // export
            com.getflourish.colorInventory.export(exportPath);

            com.getflourish.doc.showMessage("colors done")

        }

        if (textStyles == 1) {

            com.getflourish.doc.showMessage("exporting text")

            // set the export path
            exportPath = baseExportPath + "typography/";

            // create the folder
            createFolder(exportPath);

            // export
            com.getflourish.textStyleInventory.export(ta, exportPath, showTextStylesPanel)

            com.getflourish.doc.showMessage("exported text")
        }

        if (symbols == 1) {

            // set the export path
            exportPath = baseExportPath + "symbols/";

            // create the folder
            createFolder(exportPath);

            // export
            com.getflourish.symbolInventory.export(exportPath);
        }

        com.getflourish.utils.openInFinder(baseExportPath);
    });

}

function createFolder(name) {
  var fileManager = [NSFileManager defaultManager];
  [fileManager createDirectoryAtPath:name withIntermediateDirectories:true attributes:nil error:nil];
}

function showConfigurationDialog (states) {
    var accessoryView = NSView.alloc().initWithFrame(NSMakeRect(0.0, 0.0, 200.0, 90.0))

    var buttonStates = states || [1, 1, 1, 0];

    if (persist.get('com.getflourish.inventory.configuration') != null) {
        buttonStates = persist.get('com.getflourish.inventory.configuration');
    }

    var buttonOne = NSButton.alloc().initWithFrame(NSMakeRect(0.0, 70.0, 200.0, 20.0))
    buttonOne.setButtonType(NSSwitchButton)
    buttonOne.setTitle("Colors")
    buttonOne.setState(buttonStates[0])
    buttonOne.setCOSJSTargetFunction(function(sender){
      buttonStates[0] = buttonStates[0] == 0 ? 1 : 0
    })
    accessoryView.addSubview(buttonOne)

    var buttonTwo = NSButton.alloc().initWithFrame(NSMakeRect(0.0, 50.0, 200.0, 20.0))
    buttonTwo.setButtonType(NSSwitchButton)
    buttonTwo.setTitle("Text Styles")
    buttonTwo.setState(buttonStates[1])
    buttonTwo.setCOSJSTargetFunction(function(sender){
      buttonStates[1] = buttonStates[1] == 0 ? 1 : 0
    })
    accessoryView.addSubview(buttonTwo)

    var buttonThree = NSButton.alloc().initWithFrame(NSMakeRect(0.0, 30.0, 200.0, 20.0))
    buttonThree.setButtonType(NSSwitchButton)
    buttonThree.setTitle("Symbols")
    buttonThree.setState(buttonStates[2])
    buttonThree.setCOSJSTargetFunction(function(sender){
      buttonStates[2] = buttonStates[2] == 0 ? 1 : 0
    })
    accessoryView.addSubview(buttonThree)

    var buttonFour = NSButton.alloc().initWithFrame(NSMakeRect(0.0, 0.0, 200.0, 20.0))
    buttonFour.setButtonType(NSSwitchButton)
    buttonFour.setTitle("Export Metadata")
    buttonFour.setState(buttonStates[3])
    buttonFour.setCOSJSTargetFunction(function(sender){
      buttonStates[3] = buttonStates[3] == 0 ? 1 : 0
    })
    accessoryView.addSubview(buttonFour)

    var alert = NSAlert.alloc().init()
    alert.messageText = "Style Inventory Configuration"
    alert.addButtonWithTitle("Generate")
    alert.addButtonWithTitle("Cancel")
    alert.setAccessoryView(accessoryView)

    var responseCode = alert.runModal()

    return [responseCode, buttonStates]
}

var onRun = function (context) {

    // old school variable
    doc = context.document;
    selection = context.selection;

    com.getflourish.common.init(context);

    com.getflourish.config.samePage = false;

    // if (colorInventory != null) rma = colorInventory;

    var states = persist.get('com.getflourish.inventory.configuration');

    com.getflourish.common.getStyleSheetPage();

    var configuration = showConfigurationDialog(states);

    if (configuration[0] == 1000) {
        states = configuration[1];

        persist.set('com.getflourish.inventory.configuration', states)

        colors = states[0];
        textStyles = states[1];
        symbols = states[2];
        exportMetadata = states[3];
        artboards = [];

        if (colors == 1) {
            ca = com.getflourish.colorInventory.generate();
            if (ca) artboards.push(ca);
        }
        if (textStyles == 1) {
            ta = com.getflourish.textStyleInventory.generate(showTextStylesPanel);
            artboards.push(ta);
        }
        if (symbols == 1) {
            sa = com.getflourish.symbolInventory.generate();
            artboards.push(sa);
        }
        if (exportMetadata == 1) handleExport();

        layout(artboards)

        var view = doc.documentWindow();
        com.getflourish.utils.selectLayers(artboards);

        com.getflourish.view.zoomToLayers(artboards);
        // view.refresh();

        doc.scheduleLayerListRefresh()
        doc.reloadInspector()
        doc.reloadView()

        com.getflourish.utils.selectLayers([]);
        com.getflourish.utils.sendAction("collapseGroupsInLayerList:");
        doc.showMessage("Generated Style Inventory");
    }

}
