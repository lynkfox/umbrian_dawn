var viewingSystem = $("meta[name=system]").attr("content");
var viewingSystemID = $("meta[name=systemID]").attr("content");
var server = $("meta[name=server]").attr("content");

// Page cache indicator
if (getCookie("loadedFromBrowserCache") == "true") {
	$("#pageTime").html("Page is Cached");
}

setCookie('loadedFromBrowserCache', true);
