function openSigEdit(e) {
	e.preventDefault();

	if ($(this).closest("tr").attr("disabled")) {
		return false;
	} else if ($("#dialog-deleteSig").hasClass("ui-dialog-content") && $("#dialog-deleteSig").dialog("isOpen")) {
		$("#dialog-deleteSig").parent().effect("shake", 300);
		return false;
	} else if ($("#dialog-sigEdit").hasClass("ui-dialog-content") && $("#dialog-sigEdit").dialog("isOpen")) {
		$("#dialog-sigEdit").parent().effect("shake", 300);
		return false;
	}

	$(this).closest("tr").addClass("selected");

	// check if dialog is open
	if (!$("#dialog-sigEdit").hasClass("ui-dialog-content")) {
		$("#dialog-sigEdit").dialog({
			resizable: false,
			minHeight: 150,
			dialogClass: "ui-dialog-shadow dialog-noeffect",
			buttons: {
				Save: function() {
					$("#sigEditForm").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				var id = $("#sigTable tr.selected").data("id");
				$("#sigEditForm").data("id", id);
				var sig = tripwire.client.signatures[id];
				tripwire.activity.editSig = id;
				tripwire.refresh('refresh');

				$("#autoEdit")[0].checked = false;
				$("#autoEdit").button("refresh");

				// First check if it is a WH
				if (sig.life || sig.mass) {
					// Check which side we are editing
					if (sig.systemID == viewingSystemID) {
						$("#dialog-sigEdit #sigID").val(sig.signatureID);
						$("#dialog-sigEdit #sigType").val("Wormhole").selectmenu("refresh").trigger("selectmenuchange");
						$("#dialog-sigEdit #whType").val(sig.type);
						$("#dialog-sigEdit #connection").val(tripwire.systems[sig.connectionID] ? tripwire.systems[sig.connectionID].name : sig.connection);
						$("#dialog-sigEdit #whLife").val(sig.life).selectmenu("refresh");
						$("#dialog-sigEdit #whMass").val(sig.mass).selectmenu("refresh");

						$("#dialog-sigEdit [name=side]").val("parent");
					} else {
						$("#dialog-sigEdit #sigID").val(sig.sig2ID);
						$("#dialog-sigEdit #sigType").val("Wormhole").selectmenu("refresh").trigger("selectmenuchange");
						$("#dialog-sigEdit #whType").val(sig.sig2Type);
						$("#dialog-sigEdit #connection").val(tripwire.systems[sig.systemID] ? tripwire.systems[sig.systemID].name : sig.system);
						$("#dialog-sigEdit #whLife").val(sig.life).selectmenu("refresh");
						$("#dialog-sigEdit #whMass").val(sig.mass).selectmenu("refresh");

						$("#dialog-sigEdit [name=side]").val("child");
					}

					$("#dialog-sigEdit #sigLife").val(72).selectmenu("refresh");
					$("#dialog-sigEdit #sigName").val("");
				} else {
					// Its not a WH
					$("#dialog-sigEdit #sigID").val(sig.signatureID);//.attr("name", "signatureID");
					$("#dialog-sigEdit #sigType").val(sig.type == "???" ? "Sites" : sig.type).selectmenu("refresh").trigger("selectmenuchange");
					$("#dialog-sigEdit #sigLife").val(sig.lifeLength).selectmenu("refresh");
					$("#dialog-sigEdit #sigName").val(sig.name);

					$("#dialog-sigEdit #whType").val("");
					$("#dialog-sigEdit #connection").val("");
					$("#dialog-sigEdit #whLife").val("Stable").selectmenu("refresh");
					$("#dialog-sigEdit #whMass").val("Stable").selectmenu("refresh");

					$("#dialog-sigEdit [name=side]").val("parent");
				}

				if (tripwire.client.EVE && tripwire.client.EVE.systemName) {
					$("#autoEdit").button("enable");
				} else {
					$("#autoEdit").button("disable");
				}

				// Auto select ID field
				$("#dialog-sigEdit #sigID").select();
			},
			close: function(e, ui) {
				delete tripwire.activity.editSig;
				tripwire.refresh('refresh');

				$(this).data("id", "");

				$("th.critical").removeClass("critical");
				ValidationTooltips.close();

				$("#sigTable tr.selected").removeClass("selected");
			},
			create: function() {
				$("#autoEdit").button().click(function() {
					$("#sigEditForm #connection").val(tripwire.client.EVE.systemName);
				});

				$("#sigEditForm #sigType, #sigEditForm #sigLife").selectmenu({width: 100});
				$("#sigEditForm #whLife, #sigEditForm #whMass").selectmenu({width: 80});
				$("#sigEditForm .sigSystemsAutocomplete").inlinecomplete({source: tripwire.aSigSystems, maxSize: 10, delay: 0});
				$("#sigEditForm .typesAutocomplete").inlinecomplete({source: whList, maxSize: 10, delay: 0});

				$("#sigEditForm #whType, #sigEditForm #sigID").blur(function(e) {
					if (this.value == "") {
						this.value = "???";
					}
				});

				$("#sigEditForm #whType, #sigEditForm #sigID").focus(function(e) {
					$(this).select();
				});
			}
		});
	} else if (!$("#dialog-sigEdit").dialog("isOpen")) {
		$("#dialog-sigEdit").dialog("open");
	}
}

$("#sigTable").on("click", ".sigEdit", openSigEdit);
$("#sigTable tbody").on("dblclick", "tr", openSigEdit);

$("#sigEditForm").submit(function(e) {
	e.preventDefault();

	// Trim ending whitespace
	$("#sigEditForm #connection").val($("#sigEditForm #connection").val().trim());

	$("th.critical").removeClass("critical");
	ValidationTooltips.close();

	// Check for !empty and length == 3
	if ($("#sigEditForm #sigID").val() == '' || $("#sigEditForm #sigID").val().length !== 3) {
		$("#sigEditForm #sigID").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #sigID")}).setContent("Must be 3 letters in length!");
		return;
	}

	// Check for letters only
	if ($("#sigEditForm #sigID").val() !== "???") {
		var i = $("#sigEditForm #sigID").val().length;
		while (i--) {
			if ($("#sigEditForm #sigID").val()[i].toLowerCase() === $("#sigEditForm #sigID").val()[i].toUpperCase()) {
				$("#sigEditForm #sigID").focus().parent().prev("th").addClass("critical");
				ValidationTooltips.open({target: $("#sigEditForm #sigID")}).setContent("Must be only letters!");
				return;
			}
		}

		// Check for existing ID
		if ($("#sigEditForm #sigID").val().toUpperCase() !== (viewingSystemID == tripwire.client.signatures[$(this).data("id")].systemID ? tripwire.client.signatures[$(this).data("id")].signatureID : tripwire.client.signatures[$(this).data("id")].sig2ID) && $.map(tripwire.client.signatures, function(sig) {return sig.mask == "273.0" && ((options.chain.active != null && !options.chain.tabs[options.chain.active].evescout) || options.chain.active == null) ? null : (viewingSystemID == sig.systemID ? sig.signatureID : sig.sig2ID)}).indexOf($("#sigEditForm #sigID").val().toUpperCase()) !== -1) {
			$("#sigEditForm #sigID").focus().parent().prev("th").addClass("critical");
			ValidationTooltips.open({target: $("#sigEditForm #sigID")}).setContent("Signature ID already exists! <input type='button' autofocus='true' id='overwrite' value='Overwrite' style='margin-bottom: -4px; margin-top: -4px; font-size: 0.8em;' data-id='"+ $("#sigTable tr:has(td:first-child:contains("+$("#sigEditForm #sigID").val().toUpperCase()+"))").data("id") +"' />");
			$("#overwrite").focus();
			return;
		}
	}

	// Check for empty WH type
	if ($("#sigEditForm #sigType").val() == "Wormhole" && $("#sigEditForm #whType").val() == '') {
		$("#sigEditForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #whType")}).setContent("Must specify a wormhole type!");
		return;
	}

	// Check for valid WH type
	if ($("#sigEditForm #sigType").val() == "Wormhole" && whList.indexOf($("#sigEditForm #whType").val()) == -1) {
		$("#sigEditForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #whType")}).setContent("Not a valid wormhole type!");
		return;
	}

	// Check for valid Leads To
	if ($("#sigEditForm #sigType").val() == "Wormhole" && $("#sigEditForm #connection").val() && tripwire.aSigSystems.indexOf($("#sigEditForm #connection").val()) == -1) {
		$("#sigEditForm #connection").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #connection")}).setContent("Not a valid leads to system!");
		return;
	}


	var form = $(this).serializeObject();
	form.id = $(this).data("id");
	form.systemID = viewingSystemID; // needed??

	if (tripwire.wormholes[form.whType]) {
		form.lifeLength = tripwire.wormholes[form.whType].life.split(" ")[0];
	} else if (form.side == "parent") {
		form.lifeLength = tripwire.wormholes[tripwire.client.signatures[form.id].sig2Type] ? tripwire.wormholes[tripwire.client.signatures[form.id].sig2Type].life.split(" ")[0] : form.lifeLength;
	} else {
		form.lifeLength = tripwire.wormholes[tripwire.client.signatures[form.id].type] ? tripwire.wormholes[tripwire.client.signatures[form.id].type].life.split(" ")[0] : form.lifeLength;
	}

	form.connectionID = form.connectionName ? Object.index(tripwire.systems, "name", form.connectionName) || null : null;
	form.connectionName = form.connectionID ? (form.side == "parent" ? (tripwire.client.signatures[form.id].connectionID > 0 ? tripwire.client.signatures[form.id].connection : null) : (tripwire.client.signatures[form.id].systemID > 0 ? tripwire.client.signatures[form.id].system : null)) : form.connectionName;
	//form.connectionName = tripwire.systems[form.connectionID] ? (form.side == "parent" ? tripwire.client.signatures[form.id].connection : tripwire.client.signatures[form.id].system) || null : form.connectionName;
	form.whLife = tripwire.client.signatures[form.id].life != form.whLife ? form.whLife : null;
	form.whLife = !tripwire.client.signatures[form.id].life ? "New " + form.whLife : form.whLife;
	form.sig2ID = form.side == "parent" ? tripwire.client.signatures[form.id].sig2ID : tripwire.client.signatures[form.id].signatureID;
	form.sig2Type = form.side == "parent" ? tripwire.client.signatures[form.id].sig2Type : tripwire.client.signatures[form.id].type;
	form.class = sigClass(viewingSystem, form.sig2Type);
	form.class2 = sigClass(form.connectionID ? tripwire.systems[form.connectionID].name : null, form.whType);
	var data = {"request": {"signatures": {"update": form}}};
	var undo = [tripwire.client.signatures[form.id]];

	// Prevent duplicate submitting
	$("#sigEditForm input[type=submit]").attr("disabled", true);
	$("#dialog-sigEdit").parent().find(":button:contains('Save')").button("disable");

	var success = function(data) {
		if (data.result == true) {
			$("#dialog-sigEdit").dialog("close");

			$("#undo").removeClass("disabled");
			if (viewingSystemID in tripwire.signatures.undo) {
				tripwire.signatures.undo[viewingSystemID].push({action: "update", signatures: undo});
			} else {
				tripwire.signatures.undo[viewingSystemID] = [{action: "update", signatures: undo}];
			}

			sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
		}
	}

	var always = function(data) {
		$("#sigEditForm input[type=submit]").removeAttr("disabled");
		$("#dialog-sigEdit").parent().find(":button:contains('Save')").button("enable");
	}

	tripwire.refresh('refresh', data, success, always);
});
