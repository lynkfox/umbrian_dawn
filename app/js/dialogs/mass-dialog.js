
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
				document.getElementById('mass-jumped').innerText = '?';
				document.getElementById('mass-capacity').innerText = '?';

				var payload = {wormholeID: wormhole.id};

				$.ajax({
					url: "mass.php",
					type: "POST",
					data: payload,
					dataType: "JSON"
				}).done(function(data) {
					if (data && data.jumps) {
						const massData = parseMassData(data.jumps);
						document.getElementById('mass-jumped').innerText = wormholeRendering.renderMass(massData.totalMass);
						document.getElementById('mass-capacity').innerText = wormholeType.mass ? wormholeRendering.renderMass(wormholeType.mass) : 'Unknown';
						document.getElementById('mass-placeholder-desc').style.display = wormholeType.dummy ? '' : 'none';
						for (x in massData.jumps) {
							const j = massData.jumps[x];
							$("#dialog-mass #massTable tbody").append("<tr><td>"+j.characterName+"</td><td>"+(j.targetSystem == systemID ? "Into " + systemRendering.renderSystem(toSystem, 'span') : "Return to " + systemRendering.renderSystem(fromSystem, 'span'))+"</td><td>"+j.shipName+"</td><td>"+wormholeRendering.renderMass(j.mass)+"</td><td>"+j.time+"</td></tr>");
						}
                        $("#dialog-mass #massTable tbody").append("<tr><td></td><td></td><td></td><th>"+ wormholeRendering.renderMass(massData.totalMass) +"</th><td></td></tr>");
					}
				});
			}
		});

function parseMassData(jumps) {
	const result = { totalMass: 0, jumps: [] };
	for (x in jumps) {
		const shipData = appData.mass[jumps[x].shipTypeID];
		if(!shipData) { continue; }	// sometimes ship is not recorded, or ship isn't in SDE dump yet
		const jumpMass = parseFloat(shipData.mass);
		result.totalMass += jumpMass;
		result.jumps.push( { 
			mass: jumpMass, higgs: false, prop: false, shipName: shipData.typeName,
			targetSystem: jumps[x].toID, 
			characterName: jumps[x].characterName,
			time: jumps[x].time 
		});
	}
	return result;
}