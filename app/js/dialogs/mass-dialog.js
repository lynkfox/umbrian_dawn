
		$("#dialog-mass").dialog({
			autoOpen: false,
			width: "auto",
			height: "auto",
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Close: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				var wormholeID = $(this).data("id");
				var systemID = $(this).data("systemID");
				var wormhole = tripwire.client.wormholes[wormholeID];
				var signature = tripwire.client.signatures[wormhole.initialID];
				var otherSignature = tripwire.client.signatures[wormhole.secondaryID];
				
				const fromSystem = systemAnalysis.analyse(signature.systemID), toSystem = systemAnalysis.analyse(otherSignature.systemID);
				
				const wormholeType = wormhole.type ? tripwire.wormholes[wormhole.type] : 
					Object.assign({from: fromSystem.genericSystemType, leadsTo: toSystem.genericSystemType }, wormholeAnalysis.likelyWormhole(signature.systemID, otherSignature.systemID));

				$("#dialog-mass").dialog("option", "title", "From "+fromSystem.name+" to "+toSystem.name);
				document.getElementById('mass-systems').innerHTML = "From "+systemRendering.renderSystem(fromSystem)+
				" To "+systemRendering.renderSystem(toSystem) +
				" via "+wormholeRendering.renderWormholeType(wormholeType, wormhole.type, fromSystem, toSystem);

				$("#dialog-mass #massTable tbody tr").remove();

				var payload = {wormholeID: wormhole.id};

				$.ajax({
					url: "mass.php",
					type: "POST",
					data: payload,
					dataType: "JSON"
				}).done(function(data) {
					if (data && data.jumps) {
                        var totalMass = 0;
						for (x in data.jumps) {
							if(!appData.mass[data.jumps[x].shipTypeID]) { continue; }	// sometimes ship is not recorded, or ship isn't in SDE dump yet
							const jumpMass = parseFloat(appData.mass[data.jumps[x].shipTypeID].mass);
                            totalMass += jumpMass;
							$("#dialog-mass #massTable tbody").append("<tr><td>"+data.jumps[x].characterName+"</td><td>"+(data.jumps[x].toID == systemID ? "In" : "Return")+"</td><td>"+appData.mass[data.jumps[x].shipTypeID].typeName+"</td><td>"+wormholeRendering.renderMass(jumpMass)+"</td><td>"+data.jumps[x].time+"</td></tr>");
						}
                        $("#dialog-mass #massTable tbody").append("<tr><td></td><td></td><td></td><th>"+ wormholeRendering.renderMass(totalMass) +"</th><td></td></tr>");
					}
				});
			}
		});