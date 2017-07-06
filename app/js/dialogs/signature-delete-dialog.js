$("#sigTable").on("click", ".sigDelete", function(e) {
	e.preventDefault();

	if ($(this).closest("tr").attr("disabled")) {
		return false;
	} else if ($("#dialog-sigEdit").hasClass("ui-dialog-content") && $("#dialog-sigEdit").dialog("isOpen")) {
		$("#dialog-sigEdit").parent().effect("shake", 300);
		return false;
	}

	$(this).closest("tr").addClass("selected");
	//$(this).addClass("invisible");

	// check if dialog is open
	if (!$("#dialog-deleteSig").hasClass("ui-dialog-content")) {
		$("#dialog-deleteSig").dialog({
			resizable: false,
			minHeight: 0,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Delete: function() {
					// Prevent duplicate submitting
					$("#dialog-deleteSig").parent().find(":button:contains('Delete')").button("disable");

					var ids = $.map($("#sigTable tr.selected"), function(n) { return $(n).data("id"); });
					var data = {"request": {"signatures": {"delete": ids}}, "systemID": viewingSystemID};
					var undo = $.map(ids, function(id) { return tripwire.client.signatures[id] });

					var success = function(data) {
						if (data && data.result == true) {
							$("#dialog-deleteSig").dialog("close");

							$("#undo").removeClass("disabled");
							if (viewingSystemID in tripwire.signatures.undo) {
								tripwire.signatures.undo[viewingSystemID].push({action: "delete", signatures: undo});
							} else {
								tripwire.signatures.undo[viewingSystemID] = [{action: "delete", signatures: undo}];
							}

							sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
						}
					}

					var always = function(data) {
						$("#dialog-deleteSig").parent().find(":button:contains('Delete')").button("enable");
					}

					tripwire.refresh('refresh', data, success, always);
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			close: function() {
				$("#sigTable tr.selected").removeClass("selected");
				//$("#sigTable .sigDelete").removeClass("invisible");
			}
		});
	} else if (!$("#dialog-deleteSig").dialog("isOpen")) {
		$("#dialog-deleteSig").dialog("open");
	}
});
