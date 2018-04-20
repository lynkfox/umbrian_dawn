// Dialog effects
$("#wrapper").addClass("transition");

$(document).on("dialogopen", ".ui-dialog", function (event, ui) {
	// Add additional full screen overlay for 2nd level dialog
	if ($(".ui-dialog:visible").length == 2 && $(this).hasClass("dialog-modal"))
		$("body").append($("<div id='overlay' class='overlay' />").css("z-index", $(this).css("z-index") - 1));
	else if ($("#overlay"))
		$("#overlay").css("z-index", $(this).css("z-index") - 1);

	if (!$(this).hasClass("dialog-noeffect"))
		$("#wrapper").addClass("blur");
});

$(document).on("dialogclose", ".ui-dialog", function (event, ui) {
	if (!$(".ui-dialog").is(":visible"))
		$("#wrapper").removeClass("blur");

	if ($(".ui-dialog:visible").length == 1)
		$("#overlay").remove();
	else if ($("#overlay"))
		$("#overlay").css("z-index", $(this).css("z-index") - 2);

	//if ($(".ui-dialog:visible").length == 0 && options.buttons.follow && viewingSystemID != tripwire.client.EVE.systemID)
	//	window.location = "?system="+tripwire.client.EVE.systemName;
});

// Signature overwrite
$(document).on("click", "#overwrite", function() {
	var data = {request: {signatures: {"delete": [$(this).data("id")]}}, systemID: viewingSystemID};

	$("#overwrite").attr("disable", true);

	var success = function(data) {
		$("th.critical").removeClass("critical");
		ValidationTooltips.close();

		$("#dialog-sigEdit").parent().find(".ui-button-text:contains(Save)").click();
	}

	var always = function(data) {
		$("#overwrite").removeAttr("disable");
	}

	tripwire.refresh('refresh', data, success, always);
});
