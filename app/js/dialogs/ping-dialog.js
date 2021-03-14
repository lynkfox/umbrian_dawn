		$("#dialog-ping").dialog({
			autoOpen: false,
			height: "auto",
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Send: function() {
					var payload = {systemName: this.systemName, systemText: this.systemText, message: $('#ping-text').val() };
					const _this = this;
					$.ajax({
						url: "ping.php",
						type: "POST",
						data: payload,
						dataType: "JSON"
					}).done(function(data) {	$(_this).dialog("close"); })
					.error(function(data) { alert((data && data.error) ? data.error : data); });
				},
				Cancel: function() {
					$(this).dialog("close");
				},
			},
			open: function() {
				const wormholeID = $(this).data("id");
				const systemID = $(this).data("systemID");
				const wormhole = tripwire.client.wormholes[wormholeID];
				const fromSignature = wormhole ? tripwire.client.signatures[wormhole.initialID] : { name: null};
				
				this.systemName = tripwire.systems[systemID].name;
				this.systemText = this.systemName + (fromSignature.name !== null && fromSignature.name.length ? ' (' + fromSignature.name + ')' : '');
				
				$("#dialog-ping").dialog("option", "title", "Ping about "+this.systemText);
				$('#ping-text').val('');
				$('#ping-text').focus();
			}
			
			/*
				$("#dialog-mass #massTable tbody tr").remove();

				var payload = {wormholeID: wormhole.id};

				$.ajax({
					url: "mass.php",
					type: "POST",
					data: payload,
					dataType: "JSON"
				}).done(function(data) {
					if (data && data.mass) {
                        var totalMass = 0;
						for (x in data.mass) {
                            totalMass += parseFloat(data.mass[x].mass);
							$("#dialog-mass #massTable tbody").append("<tr><td>"+data.mass[x].characterName+"</td><td>"+(data.mass[x].toID == systemID ? "In" : "Out")+"</td><td>"+data.mass[x].shipType+"</td><td>"+numFormat(data.mass[x].mass)+"Kg</td><td>"+data.mass[x].time+"</td></tr>");
						}
                        $("#dialog-mass #massTable tbody").append("<tr><td></td><td></td><td></td><th>"+ numFormat(totalMass) +"Kg</th><td></td></tr>");
					}
				});
			}*/
		});