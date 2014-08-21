/*
This is a port to JSTalk of <https://github.com/leighmcculloch/AppSandboxFileAccess>

Here's the original license for AppSandboxFileAccess:

## License

Copyright (c) 2013, Leigh McCulloch All rights reserved.

BSD-2-Clause License: http://opensource.org/licenses/BSD-2-Clause

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var AppSandboxFileAccessPersist = {
  keyForBookmarkDataForURL: function(url) {
    log("AppSandboxFileAccessPersist.keyForBookmarkDataForURL("+url+")")
    var urlStr = [url absoluteString];
    log("> " + [NSString stringWithFormat:@"bd_%1$@", urlStr])
    return [NSString stringWithFormat:@"bd_%1$@", urlStr];
  },
  bookmarkDataForURL: function(url) {
    log("AppSandboxFileAccessPersist.bookmarkDataForURL('"+ url +"')")
    var defaults = [NSUserDefaults standardUserDefaults];

    // loop through the bookmarks one path at a time down the URL
    var subUrl = url;
    while ([subUrl path].length() > 1) { // give up when only '/' is left in the path
      var key = AppSandboxFileAccessPersist.keyForBookmarkDataForURL(subUrl);
      var bookmark = [defaults dataForKey:key];
      if (bookmark) { // if a bookmark is found, return it
        return bookmark;
      }
      subUrl = [subUrl URLByDeletingLastPathComponent];
    }
    // no bookmarks for the URL, or parent to the URL were found
    return nil;
  },
  setBookmarkData: function(data, url) {
    log("AppSandboxFileAccessPersist.setBookmarkData")
    log("data: " + data)
    log("URL: " + url)
    var defaults = [NSUserDefaults standardUserDefaults];
    var key = AppSandboxFileAccessPersist.keyForBookmarkDataForURL(url);
    [defaults setObject:data forKey:key];
  }
}

var AppSandboxFileAccess = {
  init: function(opts){
    this.message = opts.message || "Please authorize Sketch to write to this folder. You will only need to do this once."
    this.prompt = opts.prompt || "Authorize",
    this.title = opts.title || "Sketch Authorization"
    return this;
  },
  askPermissionForUrl: function(url) {
    log("AppSandboxFileAccess.askPermissionForUrl("+url+")")
    // this url will be the url allowed, it might be a parent url of the url passed in
    var allowedUrl;

    // create delegate that will limit which files in the open panel can be selected, to ensure only a folder
    // or file giving permission to the file requested can be selected
    // AppSandboxFileAccessOpenSavePanelDelegate *openPanelDelegate = [[AppSandboxFileAccessOpenSavePanelDelegate alloc] initWithFileURL:url];

    // check that the url exists, if it doesn't, find the parent path of the url that does exist and ask permission for that
    var fileManager = [NSFileManager defaultManager];
    var path = [url path];
    while (path.length() > 1) { // give up when only '/' is left in the path or if we get to a path that exists
      if ([fileManager fileExistsAtPath:path]) {
        break;
      }
      path = [path stringByDeletingLastPathComponent];
    }
    log("Looks like we have a winner: " + path)
    url = [NSURL fileURLWithPath:path];

    // display the open panel
    var openPanel = [NSOpenPanel openPanel];
    [openPanel setMessage:this.message];
    [openPanel setPrompt:this.prompt];
    [openPanel setTitle:this.title];
    // [openPanel setDelegate:openPanelDelegate];
    [openPanel setCanCreateDirectories:false];
    [openPanel setCanChooseFiles:true];
    [openPanel setCanChooseDirectories:true];
    [openPanel setAllowsMultipleSelection:false];
    [openPanel setShowsHiddenFiles:false];
    [openPanel setExtensionHidden:false];
    [openPanel setDirectoryURL:url];
    [[NSApplication sharedApplication] activateIgnoringOtherApps:true];
    var openPanelButtonPressed = [openPanel runModal];
    if (openPanelButtonPressed == NSFileHandlingPanelOKButton) {
      allowedUrl = [openPanel URL];
    }
    return allowedUrl;
  },
  persistPermissionPath: function(path) {
    this.persistPermissionURL([NSURL fileURLWithPath:path]);
  },
  persistPermissionURL: function(url) {
    log("AppSandboxFileAccess.persistPermissionURL("+url+")")
    // store the sandbox permissions
    url = [[url URLByStandardizingPath] URLByResolvingSymlinksInPath]
    var bookmarkData = [url bookmarkDataWithOptions:NSURLBookmarkCreationWithSecurityScope
                           includingResourceValuesForKeys:nil
                           relativeToURL:nil
                           error:null];
    if (bookmarkData) {
      AppSandboxFileAccessPersist.setBookmarkData(bookmarkData, url);
    }
  },
  accessFilePath_withBlock_persistPermission: function(path, block, persist) {
    log("AppSandboxFileAccess.accessFilePath_withBlock_persistPermission")
    log("path: " + path)
    return AppSandboxFileAccess.accessFileURL_withBlock_persistPermission([NSURL fileURLWithPath:path], block, persist);
  },
  accessFileURL_withBlock_persistPermission: function(fileUrl, block, persist) {
    log("AppSandboxFileAccess.accessFileURL_withBlock_persistPermission")
    log("fileUrl: " + fileUrl)
    log("block: " + block)
    log("persist: " + persist)
    var allowedUrl = false;
    // standardize the file url and remove any symlinks so that the url we lookup in bookmark data would match a url given by the askPermissionForUrl method
    var fileUrl = [[fileUrl URLByStandardizingPath] URLByResolvingSymlinksInPath];
    // lookup bookmark data for this url, this will automatically load bookmark data for a parent path if we have it
    var bookmarkData = AppSandboxFileAccessPersist.bookmarkDataForURL(fileUrl);

    if (bookmarkData) {
      log("Bookmark data found")
      // resolve the bookmark data into an NSURL object that will allow us to use the file
      var bookmarkDataIsStalePtr = MOPointer.alloc().init();
      allowedUrl = [NSURL URLByResolvingBookmarkData:bookmarkData options:NSURLBookmarkResolutionWithSecurityScope|NSURLBookmarkResolutionWithoutUI relativeToURL:nil bookmarkDataIsStale:bookmarkDataIsStalePtr error:null];
      // if the bookmark data is stale, we'll create new bookmark data further down
      if (bookmarkDataIsStalePtr.value()) {
        bookmarkData = nil;
      }
    } else {
      log("No bookmark data found")
    }

    // if allowed url is nil, we need to ask the user for permission
    if (!allowedUrl) {
      allowedUrl = AppSandboxFileAccess.askPermissionForUrl(fileUrl);
      if (!allowedUrl) {
        // if the user did not give permission, exit out here
        return false;
      }
    }
    // if we have no bookmark data, we need to create it, this may be because our bookmark data was stale, or this is the first time being given permission
    if (persist && !bookmarkData) {
      AppSandboxFileAccess.persistPermissionURL(allowedUrl);
    }
    // execute the block with the file access permissions
    try {
      [allowedUrl startAccessingSecurityScopedResource];
      block();
    } finally {
      [allowedUrl stopAccessingSecurityScopedResource];
    }
    return true;
  }
}

// Sandbox
function in_sandbox(){
  var environ = [[NSProcessInfo processInfo] environment];
  return (nil != [environ objectForKey:@"APP_SANDBOX_CONTAINER_ID"]);
}

var sandboxAccess = AppSandboxFileAccess.init({
  message: "Please authorize Sketch to write to this folder. You will only need to do this once per folder.",
  prompt:  "Authorize",
  title: "Sketch Authorization"
})