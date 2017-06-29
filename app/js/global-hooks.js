if (window.location.href.indexOf("galileo") != -1) {
	Notify.trigger("This is the test version of Tripwire.<br/>Please use <a href='https://tripwire.cloud-things.com'>Tripwire</a>")
}

$("body").on("click", "a[href^='.?system=']", function(e) {
	e.preventDefault();

	var system = $(this).attr("href").replace(".?system=", "");
	var systemID = Object.index(tripwire.systems, "name", system);

	tripwire.systemChange(systemID);
});

$("body").on("submit", "#systemSearch", function(e) {
	e.preventDefault();

	var system = $(this).find("[name='system']").val();
	var systemID = Object.index(tripwire.systems, "name", system) || false;

	if (systemID !== false) {
		tripwire.systemChange(systemID);
		$(this).find("[name='system']").val("");
		$("#search").click();
	}
});

$("body").on("click", "#undo:not(.disabled)", function() {
	tripwire.undo();
});

$("body").on("click", "#redo:not(.disabled)", function() {
	tripwire.redo();
});

$(document).keydown(function(e)	{
	if ((e.metaKey || e.ctrlKey) && (e.keyCode == 89 || e.keyCode == 90)) {
		//Abort - user is in input or textarea
		if ($(document.activeElement).is("textarea, input")) return;

		e.preventDefault();

		if (e.keyCode == 89 && !$("#redo").hasClass("disabled")) {
			$("#redo").click();
			Notify.trigger("Redoing last undo");
		} else if (e.keyCode == 90 && !$("#undo").hasClass("disabled")) {
			$("#undo").click();
			Notify.trigger("Undoing last action");
		}
	}
});
