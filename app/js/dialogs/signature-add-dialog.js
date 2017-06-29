$("#add-signature").click(function(e) {
	e.preventDefault();

	$("#dialog-sigAdd").dialog({
		autoOpen: false,
		resizable: false,
		minHeight: 150,
		dialogClass: "dialog-noeffect",
		buttons: {
			Add: function() {
				$("#sigAddForm").submit();
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		},
		open: function() {
			$("#sigAddForm #sigID").val('');
			$("#sigAddForm #sigType").val("Sites").selectmenu("refresh").trigger("selectmenuchange");
			$("#sigAddForm #sigLife").val(72).selectmenu("refresh");
			$("#sigAddForm #sigName").val('');
			$("#sigAddForm #whType").val('');
			$("#sigAddForm #connection").val('');
			$("#sigAddForm #autoAdd")[0].checked = false;
			$("#sigAddForm #autoAdd").button("refresh");
			$("#sigAddForm #whLife").val("Stable").selectmenu("refresh");
			$("#sigAddForm #whMass").val("Stable").selectmenu("refresh");

			if (tripwire.client.EVE && tripwire.client.EVE.systemName) {
				$("#autoAdd").button("enable");
			} else {
				$("#autoAdd").button("disable");
			}
		},
		close: function() {
			$("th.critical").removeClass("critical");
			ValidationTooltips.close();
		},
		create: function() {
			$("#autoAdd").button().click(function() {
				$("#sigAddForm #connection").val(tripwire.client.EVE.systemName);
			});

			$("#sigAddForm #sigType, #sigAddForm #sigLife").selectmenu({width: 100});
			$("#sigAddForm #whLife, #sigAddForm #whMass").selectmenu({width: 80});
			$("#sigAddForm .sigSystemsAutocomplete").inlinecomplete({source: tripwire.aSigSystems, maxSize: 10, delay: 0});
			$("#sigAddForm .typesAutocomplete").inlinecomplete({source: whList, maxSize: 10, delay: 0});

			$("#sigAddForm #whType, #sigAddForm #sigID").blur(function(e) {
				if (this.value == "") {
					this.value = "???";
				}
			});

			$("#sigAddForm #whType, #sigAddForm #sigID").focus(function(e) {
				$(this).select();
			});
		}
	});

	$("#dialog-sigAdd").dialog("open");
});

$("#sigAddForm").submit(function(e) {
	e.preventDefault();

	// Trim ending whitespace
	$("#sigAddForm #connection").val($("#sigAddForm #connection").val().trim());

	$("th.critical").removeClass("critical");
	ValidationTooltips.close();

	// Check for !empty and length == 3
	if ($("#sigAddForm #sigID").val() == '' || $("#sigAddForm #sigID").val().length !== 3) {
		$("#sigAddForm #sigID").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #sigID")}).setContent("Must be 3 Letters in length!");
		return;
	}

	// Check for letters only
	if ($("#sigAddForm #sigID").val() !== "???") {
		var i = $("#sigAddForm #sigID").val().length;
		while (i--) {
			if ($("#sigAddForm #sigID").val()[i].toLowerCase() === $("#sigAddForm #sigID").val()[i].toUpperCase()) {
				$("#sigAddForm #sigID").focus().parent().prev("th").addClass("critical");
				ValidationTooltips.open({target: $("#sigAddForm #sigID")}).setContent("Must be only letters!");
				return;
			}
		}

		// Check for existing ID
		if ($.map(tripwire.client.signatures, function(sig) {return sig.mask == "273.0" && ((options.chain.active != null && !options.chain.tabs[options.chain.active].evescout) || options.chain.active == null) ? null : (viewingSystemID == sig.systemID ? sig.signatureID : sig.sig2ID)}).indexOf($("#sigAddForm #sigID").val().toUpperCase()) !== -1) {
			$("#sigAddForm #sigID").focus().parent().prev("th").addClass("critical");
			ValidationTooltips.open({target: $("#sigAddForm #sigID")}).setContent("Signature ID already exists!");
			return;
		}
	}

	// Check for !empty WH type
	if ($("#sigAddForm #sigType").val() == "Wormhole" && $("#sigAddForm #whType").val() == '') {
		$("#sigAddForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #whType")}).setContent("Must specify a wormhole type!");
		return;
	}

	// Check for valid WH type
	if ($("#sigAddForm #sigType").val() == "Wormhole" && whList.indexOf($("#sigAddForm #whType").val()) == -1) {
		$("#sigAddForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #whType")}).setContent("Not a valid wormhole type!");
		return;
	}

	// Check for valid Leads To
	if ($("#sigAddForm #sigType").val() == "Wormhole" && $("#sigAddForm #connection").val() && tripwire.aSigSystems.indexOf($("#sigAddForm #connection").val()) == -1) {
		$("#sigAddForm #connection").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #connection")}).setContent("Not a valid leads to system!");
		return;
	}

	var form = $(this).serializeObject();
	form.systemID = viewingSystemID;
	form.lifeLength = tripwire.wormholes[form.whType] ? tripwire.wormholes[form.whType].life.split(" ")[0] : 72;
	form.class = sigClass(viewingSystem, form.whType);
	if (Object.index(tripwire.systems, "name", form.connectionName)) {
		form.connectionID = Object.index(tripwire.systems, "name", form.connectionName);
		form.class2 = sigClass(form.connectionName, null);
		form.connectionName = null;
	}

	var data = {"request": {"signatures": {"add": form}}};

	// Prevent duplicate submitting
	$("#sigAddForm input[type=submit]").attr("disabled", true);
	$("#dialog-sigAdd").parent().find(":button:contains('Add')").button("disable");

	var success = function(data) {
		if (data.result == true) {
			$("#dialog-sigAdd").dialog("close");

			$("#undo").removeClass("disabled");
			var undo = $.map(data.resultSet, function(id) { return data.signatures[id] });
			if (viewingSystemID in tripwire.signatures.undo) {
				tripwire.signatures.undo[viewingSystemID].push({action: "add", signatures: undo});
			} else {
				tripwire.signatures.undo[viewingSystemID] = [{action: "add", signatures: undo}];
			}

			sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
		}
	}

	var always = function(data) {
		$("#sigAddForm input[type=submit]").removeAttr("disabled");
		$("#dialog-sigAdd").parent().find(":button:contains('Add')").button("enable");
	}

	tripwire.refresh('refresh', data, success, always);
});
