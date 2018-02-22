$("#add-signature2").click(function(e) {
	e.preventDefault();

	if (!$("#dialog-signature").hasClass("ui-dialog-content")) {
		$("#dialog-signature").dialog({
			autoOpen: true,
			resizable: false,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			position: {my: "center", at: "center", of: $("#signaturesWidget")},
			buttons: {
				Add: function() {
					$("#form-signature").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			create: function() {
				var aSigWormholes = $.map(tripwire.wormholes, function(item, index) { return index;});
				aSigWormholes.splice(26, 0, "K162");
				aSigWormholes.push("GATE");

				$("#dialog-signature [name='signatureType'], #dialog-signature [name='signatureLife']").selectmenu({width: 100});
				$("#dialog-signature [name='wormholeLife'], #dialog-signature [name='wormholeMass']").selectmenu({width: 80});
				$("#dialog-signature [data-autocomplete='sigSystems']").inlinecomplete({source: tripwire.aSigSystems, maxSize: 10, delay: 0});
				$("#dialog-signature [data-autocomplete='sigType']").inlinecomplete({source: aSigWormholes, maxSize: 10, delay: 0});

				$("#dialog-signature #durationPicker").durationPicker();

				// Ensure first signature ID field only accepts letters
				$("#dialog-signature [name='signatureID_Alpha'], #dialog-signature [name='signatureID2_Alpha']").on("input", function() {
					while (!/^[a-zA-Z?]*$/g.test(this.value)) {
						this.value = this.value.substring(0, this.value.length -1);
					}
				});

				// Ensure second signature ID field only accepts numbers
				$("#dialog-signature [name='signatureID_Numeric'], #dialog-signature [name='signatureID2_Numeric']").on("input", function() {
					while (!/^[0-9?]*$/g.test(this.value)) {
						this.value = this.value.substring(0, this.value.length -1);
					}
				});

				// Select value on click
				$("#dialog-signature .signatureID, #dialog-signature .wormholeType").on("click", function() {
					$(this).select();
				});

				// Auto fill opposite side wormhole w/ K162
				$("#dialog-signature .wormholeType").on("input, change", function() {
					if ($(this).val().length > 0 && $.inArray($(this).val(), aSigWormholes) != -1 && $(this).val() != "K162") {
						$("#dialog-signature .wormholeType").not(this).val("K162");

						// Also auto calculate duration
						$("#dialog-signature #durationPicker").val(tripwire.wormholes[$(this).val()].life.substring(0, 2) * 60 * 60).change();
					}
				});

				// Toggle between wormhole and regular signatures
				$("#dialog-signature").on("selectmenuchange", "[name='signatureType']", function() {
					if (this.value == "wormhole") {
						$("#dialog-signature #site").slideUp(200, function() { $(this).hide(0); });
						$("#dialog-signature #wormhole").slideDown(200, function() { $(this).show(200); });
					} else {
						$("#dialog-signature #site").slideDown(200, function() { $(this).show(200); });
						$("#dialog-signature #wormhole").slideUp(200, function() { $(this).hide(0); });
					}

					ValidationTooltips.close();
				});

				$("#form-signature").submit(function(e) {
					e.preventDefault();
					var form = $(this).serializeObject();
					var valid = true;
					ValidationTooltips.close();

					// Validate full signature ID fields (blank | 3 characters)
					$.each($("#dialog-signature .signatureID:visible"), function() {
						if ($(this).val().length > 0 && $(this).val().length < 3) {
							ValidationTooltips.open({target: $(this)}).setContent("Must be 3 characters in length!");
							$(this).select();
							valid = false;
							return false;
						}
					});
					if (!valid) return false;

					// Validate life length (> 5 minutes)
					if (isNaN(parseInt($("#dialog-signature #durationPicker").val())) || !(parseInt($("#dialog-signature #durationPicker").val()) >= 300)) {
						ValidationTooltips.open({target: $("#dialog-signature #durationPicker + .bdp-input")}).setContent("Must be at least 5 minutes!");
						$("#dialog-signature #durationPicker").select();
						return false;
					}

					// Validate wormhole types (blank | wormhole)
					$.each($("#dialog-signature .wormholeType:visible"), function() {
						if ($(this).val().length > 0 && $.inArray($(this).val(), aSigWormholes) == -1) {
							ValidationTooltips.open({target: $(this)}).setContent("Must be a valid wormhole type!");
							$(this).select();
							valid = false;
							return false;
						}
					});
					if (!valid) return false;

					// Validate first leads to (system)
					if ($("#dialog-signature .leadsTo:visible")[0] && $.inArray($("#dialog-signature .leadsTo:visible:first").val(), tripwire.aSigSystems) == -1) {
						ValidationTooltips.open({target: $("#dialog-signature .leadsTo:visible:first")}).setContent("Must be a valid leads to system!");
						$(this).select();
						return false;
					}

					// Validate leads to system (blank | system)
					$.each($("#dialog-signature .leadsTo:visible"), function() {
						if ($(this).val().length > 0 && $.inArray($(this).val(), tripwire.aSigSystems) == -1) {
							ValidationTooltips.open({target: $(this)}).setContent("Must be a valid leads to system!");
							$(this).select();
							valid = false;
							return false;
						}
					});
					if (!valid) return false;

					console.log(form);

					var payload = {};
					if (form.signatureType === "wormhole") {
						var signature = {
							"signatureID": form.signatureID_Alpha + form.signatureID_Numeric,
							"systemID": viewingSystemID,
							"type": "wormhole",
							"name": form.wormholeName
						};
						var signature2 = {
							"signatureID": form.signatureID2_Alpha + form.signatureID2_Numeric,
							"systemID": Object.index(tripwire.systems, "name", form.leadsTo) ? Object.index(tripwire.systems, "name", form.leadsTo) : $.inArray(form.leadsTo, tripwire.aSigSystems),
							"type": "wormhole",
							"name": form.wormholeName2
						};
						var wormhole = {
							"type": tripwire.wormholes[form.wormholeType] ? form.wormholeType : (tripwire.wormholes[form.wormholeType2] ? form.wormholeType2 : ""),
							"life": form.wormholeLife,
							"mass": form.wormholeMass
						};
						payload = {"wormholes": {"add": [{"wormhole": wormhole, "signatures": [signature, signature2]}]}};
					} else {
						var signature = {
							"signatureID": form.signatureID_Alpha + form.signatureID_Numeric,
							"systemID": viewingSystemID,
							"type": form.signatureType,
							"name": form.signatureName
						};
						payload = {"signatures": {"add": [signature]}};
					}

					$.ajax({
						url: "signatures2.php",
						method: "POST",
						data: payload,
						dataType: "JSON"
					}).done(function(result) {
						if (result.resultSet[0].result == true) {
							$("#dialog-signature").dialog("close");
						}
					}).always(function(result) {
						console.log(result);
					})
				});
			},
			open: function() {
				$("#dialog-signature input").val("");
				$("#dialog-signature [name='signatureType']").val("combat").selectmenu("refresh");

				$("#dialog-signature #site").show();
				$("#dialog-signature #wormhole").hide();

				// Side labels
				$("#dialog-signature .sideLabel:first").html(viewingSystem + " Side");
				$("#dialog-signature .sideLabel:last").html("Other Side");

				// Default signature life
				$("#dialog-signature #durationPicker").val(options.signatures.pasteLife * 60 * 60).change();
			},
			close: function() {
				ValidationTooltips.close();
			}
		});
	} else if (!$("#dialog-signature").dialog("isOpen")) {
		$("#dialog-signature").dialog("open");
	}
});
