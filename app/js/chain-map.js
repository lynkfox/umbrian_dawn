var chain = new function() {
	this.map, this.view, this.options, this.drawing, this.data = {};

	this.newView = function(json) {
		this.view = new google.visualization.DataView(new google.visualization.DataTable(json));
		return this.view;
	};

	this.activity = function(data) {
		/*	function for adding recent activity to chain map nodes	*/
		//var data = typeof(data) !== "undefined" ? data : this.data.activity;

		// Hide all activity colored dots instead of checking each one
		$("#chainMap .nodeActivity > span:not(.invisible)").addClass("invisible");

		// Loop through passed data and show dots by system
		for (var x in data) {
			var systemID = data[x].systemID;
			var shipJumps = data[x].shipJumps;
			var podKills = data[x].podKills;
			var shipKills = data[x].shipKills;
			var npcKills = data[x].npcKills;
			var $node = $("#chainMap [data-nodeid="+systemID+"] > .nodeActivity");

			if (shipJumps > 0) {
				$node.find(".jumps").removeClass("invisible").attr("title", shipJumps+" Jumps");
			}

			if (podKills > 0) {
				$node.find(".pods").removeClass("invisible").attr("title", podKills+" Pod Kills");
			}

			if (shipKills > 0) {
				$node.find(".ships").removeClass("invisible").attr("title", shipKills+" Ship Kills");
			}

			if (npcKills > 0) {
				$node.find(".npcs").removeClass("invisible").attr("title", npcKills+" NPC Kills");
			}
		}

		$("#chainMap .nodeActivity > span[title]").jBox("Tooltip", {position: {y: "bottom"}});

		return data;
	}

	this.occupied = function(data) {
		/*	function for showing occupied icon  */

		// Hide all icons instead of checking each one
		$("#chainMap [data-icon='user'], #chainMap [data-icon='user'] + .badge").addClass("invisible");

		// Loop through passed data and show icons
		for (var x in data) {
			$("#chainMap [data-nodeid='"+data[x].systemID+"'] [data-icon='user']").removeClass("invisible")
			$("#chainMap [data-nodeid='"+data[x].systemID+"'] [data-icon='user'] + .badge").removeClass("invisible").html(data[x].count);
		}

		OccupiedToolTips.attach($("#chainMap [data-icon='user']:not(.invisible)"));

		return data;
	}

	this.flares = function(data) {
		/*	function for coloring chain map nodes via flares  */
		//var data = typeof(data) !== "undefined" ? data : this.data.flares;

		// Remove all current node coloring instead of checking each one
		$("#chainMap td.node").removeClass("redNode yellowNode greenNode");

		// Remove all coloring from chain grid
		$("#chainGrid tr").removeClass("red yellow green");

		// Loop through passed data and add classes by system
		if (data) {
			for (var x in data.flares) {
				var systemID = data.flares[x].systemID;
				var flare = data.flares[x].flare;

				var row = ($("#chainMap [data-nodeid="+systemID+"]").parent().addClass(flare+"Node").parent().index() - 1) / 3 * 2;

				if (row > 0) {
					$("#chainGrid tr:eq("+row+")").addClass(flare).next().addClass(flare);
				}
			}
		}

		return data;
	}

	this.grid = function() {
		/*  function for showing/hiding grid lines  */
		if (options.chain.gridlines == false) { $("#chainGrid tr").addClass("hidden"); return false; }

		$("#chainGrid tr").removeClass("hidden");
		//$("#chainGrid").css("width", "100%");

		var rows = $(".google-visualization-orgchart-table tr:has(.node)").length * 2 - 1;

		$("#chainGrid tr:gt("+rows+")").addClass("hidden");
	}

	this.lines = function(data) {
		//var data = typeof(data) !== "undefined" ? data : this.data.lines;

		function drawNodeLine(system, parent, mode, signatureID) {
			/*	function for drawing colored lines  */

			// Find node in chainmap
			//var $node = $("#chainMap [data-nodeid='"+system+"']").parent();
			var $node = $("#chainMap #node"+system).parent();

			if ($node.length == 0) {
				return false;
			}

			// Get node # in this line
			var nodeIndex = Math.ceil(($node[0].cellIndex + 1) / 2 - 1);

			// applly to my top line
			var $connector = $($node.parent().prev().children("td.google-visualization-orgchart-lineleft, td.google-visualization-orgchart-lineright")[nodeIndex]).addClass("left-"+mode+" right-"+mode);
			//var $connector = $($node.parent().prev().find("td:not([colspan])")[nodeIndex]).addClass("left-"+mode+" right-"+mode).attr("data-signatureid", signatureID);

			// Find parent node
			//var $parent = $("#chainMap [data-nodeid='"+parent+"']").parent();
			var $parent = $("#chainMap #node"+parent).parent();

			if ($parent.length == 0 || $connector.length == 0)
				return false;

			// Find the col of my top line
			var nodeCol = 0, connectorCell = $connector[0].cellIndex;
			$node.parent().prev().find("td").each(function(index) {
				nodeCol += this.colSpan;

				if (index == connectorCell) {
					return false;
				}
			});

			// Get node # in this line
			var parentIndex = Math.ceil(($parent[0].cellIndex + 1) / 2 - 1);

			// Compensate for non-parent nodes (slight performance hit ~10ms)
			var newparentIndex = parentIndex;
			for (var i = 0; i <= parentIndex; i++) {
				var checkSystem = 0;//$node.parent().prev().prev().prev().find("td:has([data-nodeid]):eq("+i+")").find("[data-nodeid]").data("nodeid");
				$node.parent().prev().prev().prev().find("td > [data-nodeid]").each(function(index) {
					if (index == i) {
						checkSystem = $(this).attr("id").replace("node", "");//$(this).data("nodeid");

						return false;
					}
				});

				if ($.map(data.map.rows, function(node) { return node.c[1].v == checkSystem ? node : null; }).length <= 0) {
					newparentIndex--;
				}
			}
			parentIndex = newparentIndex;

			// Apply to parent bottom line
			var $connecte = $($node.parent().prev().prev().children("td.google-visualization-orgchart-lineleft, td.google-visualization-orgchart-lineright")[parentIndex]).addClass("left-"+mode+" right-"+mode);
			//var $connecte = $($node.parent().prev().prev().find("td:not([colspan])")[parentIndex]).addClass("left-"+mode+" right-"+mode).attr("data-signatureid", signatureID);

			// the beans
			var col = 0, parent = false, me = false;
			$node.parent().prev().prev().find("td").each(function(index, value) {
				col += this.colSpan;

				if (me && parent) {
					// All done - get outta here
					return false;
				} else if (typeof($connecte[0]) != "undefined" && $connecte[0].cellIndex == index) {
					parent = true;

					$(this).addClass("left-"+mode);

					// remove bottom border that points to the right
					if (!me && col != nodeCol) {
						$(this).addClass("bottom-"+mode);
					}

					// parent and node are same - we are done
					if (nodeCol == col) {
						return false;
					}
				} else if (col == nodeCol) {
					me = true;

					$(this).addClass("bottom-"+mode);
				} else if (me || parent) {
					var tempCol = 0, breaker = false, skip = false;

					$node.parent().prev().find("td").each(function(index) {
						tempCol += this.colSpan;

						if (tempCol == col && ($(this).hasClass("google-visualization-orgchart-lineleft") || $(this).hasClass("google-visualization-orgchart-lineright"))) {
							if (parent == false) {
								// Stop looking cuz there is another node between us and parent
								breaker = true;
								$connecte.removeClass("left-"+mode+" right-"+mode);

								return false;
							} else if (parent == true) {
								// Lets make sure there isnt a node between the parent and me
								$connecte.removeClass("left-"+mode+" right-"+mode);

								$node.parent().prev().prev().find("td").each(function(index) {
									if (index >= $connecte[0].cellIndex) {
										// there is a node after parent but before me
										$(this).removeClass("bottom-"+mode);
									}
								});
								skip = true;
							}
						}
					});

					if (breaker) {
						return false;
					}

					if (!skip) {
						$(this).addClass("bottom-"+mode);
					}
				}
			});
		}

		for (var x in data.lines) {
			drawNodeLine(data.lines[x][0], data.lines[x][1], data.lines[x][2], data.lines[x][3]);
		}
	}

	this.nodes = function(map) {
		var chain = {cols: [{label: "System", type: "string"}, {label: "Parent", type: "string"}], rows: []};
		var frigTypes = ["Q003", "E004", "L005", "Z006", "M001", "C008", "G008", "A009"];
		var connections = [];

		function topLevel(systemID, id) {
			if (!systemID || !tripwire.systems[systemID])
				return false;

			// System type switch
			var systemType;
			if (tripwire.systems[systemID].class)
				systemType = "<span class='wh'>C" + tripwire.systems[systemID].class + "</span>";
			else if (tripwire.systems[systemID].security >= 0.45)
				systemType = "<span class='hisec'>HS</span>";
			else if (tripwire.systems[systemID].security > 0.0)
				systemType = "<span class='lowsec'>LS</span>";
			else if (tripwire.systems[systemID].security <= 0.0)
				systemType = "<span class='nullsec'>NS</span>";

			var effectClass = null, effect = null;
			if (tripwire.systems[systemID].class) {
				switch(tripwire.systems[systemID].effect) {
					case "Black Hole":
						effectClass = "blackhole";
						break;
					case "Cataclysmic Variable":
						effectClass = "cataclysmic-variable";
						break;
					case "Magnetar":
						effectClass = "magnetar";
						break;
					case "Pulsar":
						effectClass = "pulsar";
						break;
					case "Red Giant":
						effectClass = "red-giant";
						break;
					case "Wolf-Rayet Star":
						effectClass = "wolf-rayet";
						break;
				}

				effect = tripwire.systems[systemID].effect;
			}

			var system = {v: id};
			var chainNode = "<div id='node"+id+"' data-nodeid='"+systemID+"'>"
							+	"<div class='nodeIcons'>"
							+		"<div style='float: left;'>"
							+			"<i class='whEffect' "+(effectClass ? "data-icon='"+effectClass+"' data-tooltip='"+effect+"'" : null)+"></i>"
							+		"</div>"
							+		"<div style='float: right;'>"
							+			"<i data-icon='user' class='invisible'></i>"
							+			"<span class='badge' class='invisible'></span>"
							+		"</div>"
							+	"</div>"
							+	"<h4 class='nodeClass'>"+systemType+"</h4>"
							+	"<h4 class='nodeSystem'>"
							+		"<a href='.?system="+tripwire.systems[systemID].name+"'>"+(options.chain.tabs[options.chain.active] && options.chain.tabs[options.chain.active].systemID != 0 ? options.chain.tabs[options.chain.active].name : tripwire.systems[systemID].name)+"</a>"
							+	"</h4>"
							+	"<h4 class='nodeType'>&nbsp;</h4>"
							+	"<div class='nodeActivity'>"
							+		"<span class='jumps invisible'>&#9679;</span>&nbsp;<span class='pods invisible'>&#9679;</span>&nbsp;&nbsp;<span class='ships invisible'>&#9679;</span>&nbsp;<span class='npcs invisible'>&#9679;</span>"
							+	"</div>"
							+"</div>"

			system.f = chainNode;

			return system;
		}

		function findLinks(system) {
			if (system[0] <= 0) return false;

			var parentID = parseInt(system[1]), childID = chainList.length;

			for (var x in chainData) {
				var link = chainData[x];

				if ($.inArray(link.id, usedLinks) == -1) {
					if (link.systemID == system[0]) {
						var node = {};
						node.id = link.id;
						node.life = link.life;
						node.mass = link.mass;
						node.time = link.time;

						node.parent = {};
						node.parent.id = parentID;
						node.parent.systemID = link.systemID;
						node.parent.name = link.system;
						node.parent.type = link.sig2Type;
						node.parent.typeBM = link.type2BM;
						node.parent.classBM = link.class2BM;
						node.parent.nth = link.nth2;
						node.parent.signatureID = link.sig2ID;

						node.child = {};
						node.child.id = ++childID;
						node.child.systemID = link.connectionID;
						node.child.name = link.connection;
						node.child.type = link.type;
						node.child.typeBM = link.typeBM;
						node.child.classBM = link.classBM;
						node.child.nth = link.nth;
						node.child.signatureID = link.signatureID;

						chainLinks.push(node);
						chainList.push([node.child.systemID, node.child.id, system[2]]);
						usedLinks.push(node.id);
						//usedLinks[system[2]].push(node.id);

						if ($("#show-viewing").hasClass("active") && tripwire.systems[node.child.systemID] && !tripwire.systems[viewingSystemID].class && !tripwire.systems[node.child.systemID].class) {
							var jumps = guidance.findShortestPath(tripwire.map.shortest, [viewingSystemID - 30000000, node.child.systemID - 30000000]).length - 1;

							var calcNode = {};
							calcNode.life = "Gate";
							calcNode.parent = {};
							calcNode.parent.id = node.child.id;
							calcNode.parent.systemID = node.child.systemID;
							calcNode.parent.name = node.child.name;
							calcNode.parent.type = node.child.type;
							calcNode.parent.nth = node.child.nth;

							calcNode.child = {};
							calcNode.child.id = ++childID;
							calcNode.child.systemID = viewingSystemID
							calcNode.child.name = tripwire.systems[viewingSystemID].name;
							calcNode.child.type = jumps;
							calcNode.child.nth = null;
							calcNode.child.signatureID = jumps;

							chainLinks.push(calcNode);
							chainList.push([0, childID]);
						}

						if ($("#show-favorite").hasClass("active") && tripwire.systems[node.child.systemID]) {
							for (x in options.favorites) {
								if (tripwire.systems[options.favorites[x]].regionID >= 11000000 || tripwire.systems[node.child.systemID].regionID >= 11000000)
									continue;

								var jumps = guidance.findShortestPath(tripwire.map.shortest, [options.favorites[x] - 30000000, node.child.systemID - 30000000]).length - 1;

								var calcNode = {};
								calcNode.life = "Gate";
								calcNode.parent = {};
								calcNode.parent.id = node.child.id;
								calcNode.parent.systemID = node.child.systemID;
								calcNode.parent.name = node.child.name;
								calcNode.parent.type = node.child.type;
								calcNode.parent.nth = node.child.nth;

								calcNode.child = {};
								calcNode.child.id = ++childID;
								calcNode.child.systemID = options.favorites[x];
								calcNode.child.name = tripwire.systems[options.favorites[x]].name;
								calcNode.child.type = jumps;
								calcNode.child.nth = null;
								calcNode.child.signatureID = jumps;

								chainLinks.push(calcNode);
								chainList.push([0, childID]);
							}
						}
					} else if (link.connectionID == system[0]) {
						var node = {};
						node.id = link.id;
						node.life = link.life;
						node.mass = link.mass;
						node.time = link.time;

						node.parent = {};
						node.parent.id = parentID;
						node.parent.systemID = link.connectionID;
						node.parent.name = link.connection;
						node.parent.type = link.type;
						node.parent.typeBM = link.typeBM;
						node.parent.classBM = link.classBM;
						node.parent.nth = link.nth;
						node.parent.signatureID = link.signatureID;

						node.child = {};
						node.child.id = ++childID;
						node.child.systemID = link.systemID;
						node.child.name = link.system;
						node.child.type = link.sig2Type;
						node.child.typeBM = link.type2BM;
						node.child.classBM = link.class2BM;
						node.child.nth = link.nth2;
						node.child.signatureID = link.sig2ID;

						chainLinks.push(node);
						chainList.push([node.child.systemID, node.child.id, system[2]]);
						usedLinks.push(node.id);
						//usedLinks[system[2]].push(node.id);

						if ($("#show-viewing").hasClass("active") && tripwire.systems[node.child.systemID] && !tripwire.systems[viewingSystemID].class && !tripwire.systems[node.child.systemID].class) {
							var jumps = guidance.findShortestPath(tripwire.map.shortest, [viewingSystemID - 30000000, node.child.systemID - 30000000]).length - 1;

							var calcNode = {};
							calcNode.life = "Gate";
							calcNode.parent = {};
							calcNode.parent.id = node.child.id;
							calcNode.parent.systemID = node.child.systemID;
							calcNode.parent.name = node.child.name;
							calcNode.parent.type = node.child.type;
							calcNode.parent.nth = node.child.nth;

							calcNode.child = {};
							calcNode.child.id = ++childID;
							calcNode.child.systemID = viewingSystemID;
							calcNode.child.name = tripwire.systems[viewingSystemID].name;
							calcNode.child.type = jumps;
							calcNode.child.nth = null;
							calcNode.child.signatureID = jumps;

							chainLinks.push(calcNode);
							chainList.push([0, childID]);
						}

						if ($("#show-favorite").hasClass("active") && tripwire.systems[node.child.systemID]) {
							for (x in options.favorites) {
								if (tripwire.systems[options.favorites[x]].regionID >= 11000000 || tripwire.systems[node.child.systemID].regionID >= 11000000)
									continue;

								var jumps = guidance.findShortestPath(tripwire.map.shortest, [options.favorites[x] - 30000000, node.child.systemID - 30000000]).length - 1;

								var calcNode = {};
								calcNode.life = "Gate";
								calcNode.parent = {};
								calcNode.parent.id = node.child.id;
								calcNode.parent.systemID = node.child.systemID;
								calcNode.parent.name = node.child.name;
								calcNode.parent.type = node.child.type;
								calcNode.parent.nth = node.child.nth;

								calcNode.child = {};
								calcNode.child.id = ++childID;
								calcNode.child.systemID = options.favorites[x];
								calcNode.child.name = tripwire.systems[options.favorites[x]].name;
								calcNode.child.type = jumps;
								calcNode.child.nth = null;
								calcNode.child.signatureID = jumps;

								chainLinks.push(calcNode);
								chainList.push([0, childID]);
							}
						}
					}
				}
			}
		}

		if (false && $("#home").hasClass("active")) {
			$("#chainError").hide();

			var row = {c: []};
			var systemID = $.map(tripwire.systems, function(system, id) { return system.name == options.chain.home ? id : null; })[0];

			row.c.push(topLevel(systemID, 1), {v: null});

			chain.rows.push(row);

			var chainList = [[systemID, 1]];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		} else if (false && $("#k-space").hasClass("active")) {
			$("#chainError").hide();

			var chainList = [];//$.map(tripwire.systems, function(system, id) { return system.class ? null : [id, 1]; });
			var kspace = $.map(tripwire.systems, function(system, id) { return system.class ? null : id; });
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			var i = 0;
			for (var x in map) {
				if ($.inArray(map[x].systemID, kspace) != -1) {
					i++;
					chain.rows.push({c: [topLevel(map[x].systemID, i), {v: null}]});
					chainList.push([map[x].systemID, i]);
				} else if ($.inArray(map[x].connectionID, kspace) != -1) {
					i++;
					chain.rows.push({c: [topLevel(map[x].connectionID, i), {v: null}]});
					chainList.push([map[x].connectionID, i]);
				}
			}

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		} else if (false && $("#eve-scout").hasClass("active")) {
			$("#chainError").hide();

			var row = {c: []};
			var systemID = 31000005;

			row.c.push(topLevel(systemID, 1), {v: null});

			chain.rows.push(row);

			var chainList = [[systemID, 1]];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		} else if ($("#chainTabs .current").length > 0) {
			var systems = $("#chainTabs .current .name").data("tab").toString().split(",");
			var chainList = [];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			if (systems == 0) {
				var i = 0;
				for (var x in map) {
					if (typeof(tripwire.systems[map[x].systemID].class) == "undefined") {
						i++;
						//usedLinks[map[x].systemID] = [];
						chain.rows.push({c: [topLevel(map[x].systemID, i), {v: null}]});
						chainList.push([map[x].systemID, i, map[x].systemID]);
					} else if (tripwire.systems[map[x].connectionID] && typeof(tripwire.systems[map[x].connectionID].class) == "undefined") {
						i++;
						//usedLinks[map[x].connectionID] = [];
						chain.rows.push({c: [topLevel(map[x].connectionID, i), {v: null}]});
						chainList.push([map[x].connectionID, i, map[x].connectionID]);
					}
				}
			} else {
				for (var x in systems) {
					//usedLinks[systems[x]] = [];
					chain.rows.push({c: [topLevel(systems[x], parseInt(x) + 1), {v: null}]});
					chainList.push([systems[x], parseInt(x) + 1, systems[x]]);
				}
			}

			//var startTime = window.performance.now();
			for (var i = 0; i < chainList.length; i++) {
				findLinks(chainList[i]);
			}
			//console.log("stint: "+ (window.performance.now() - startTime));
		} else {
			$("#chainError").hide();

			var row = {c: []};
			var systemID = viewingSystemID;

			row.c.push(topLevel(systemID, 1), {v: null});

			chain.rows.push(row);

			var chainList = [[systemID, 1]];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		}

		for (var x in chainLinks) {
			var node = chainLinks[x];
			var row = {c: []};

			// System type switch
			var systemType;
			var nodeClass = tripwire.systems[node.child.systemID] ? tripwire.systems[node.child.systemID].class : null;
			var nodeSecurity = tripwire.systems[node.child.systemID] ? tripwire.systems[node.child.systemID].security : null;
			if (nodeClass == 6 || node.child.name == "Class-6" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 6"))
				systemType = "<span class='wh'>C6</span>";
			else if (nodeClass == 5 || node.child.name == "Class-5" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 5"))
				systemType = "<span class='wh'>C5</span>";
			else if (nodeClass == 4 || node.child.name == "Class-4" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 4"))
				systemType = "<span class='wh'>C4</span>";
			else if (nodeClass == 3 || node.child.name == "Class-3" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 3"))
				systemType = "<span class='wh'>C3</span>";
			else if (nodeClass == 2 || node.child.name == "Class-2" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 2"))
				systemType = "<span class='wh'>C2</span>";
			else if (nodeClass == 1 || node.child.name == "Class-1" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 1"))
				systemType = "<span class='wh'>C1</span>";
			else if (nodeClass > 6)
				systemType = "<span class='wh'>C" + nodeClass + "</span>";
			else if (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo.split(" ").length > 1)
				systemType = "<span class='wh'>C" + tripwire.wormholes[node.child.type].leadsTo.split(" ")[1] + "</span>";
			else if (nodeSecurity >= 0.45 || node.child.name == "High-Sec" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "High-Sec" && !nodeSecurity))
				systemType = "<span class='hisec'>HS</span>";
			else if (nodeSecurity > 0.0 || node.child.name == "Low-Sec" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Low-Sec" && !nodeSecurity))
				systemType = "<span class='lowsec'>LS</span>";
			else if ((nodeSecurity <= 0.0 && nodeSecurity != null) || node.child.name == "Null-Sec" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Null-Sec"))
				systemType = "<span class='nullsec'>NS</span>";
			else
				systemType = "<span>&nbsp;</span>";

			var effectClass = null, effect = null;
			if (typeof(tripwire.systems[node.child.systemID]) != "undefined") {
				switch(tripwire.systems[node.child.systemID].effect) {
					case "Black Hole":
						effectClass = "blackhole";
						break;
					case "Cataclysmic Variable":
						effectClass = "cataclysmic-variable";
						break;
					case "Magnetar":
						effectClass = "magnetar";
						break;
					case "Pulsar":
						effectClass = "pulsar";
						break;
					case "Red Giant":
						effectClass = "red-giant";
						break;
					case "Wolf-Rayet Star":
						effectClass = "wolf-rayet";
						break;
					default:
						effectClass = null;
						break;
				}

				effect = tripwire.systems[node.child.systemID].effect;
			}

			var child = {v: node.child.id};
			var chainNode = "<div id='node"+node.child.id+"' data-nodeid='"+node.child.systemID+"' data-sigid='"+node.id+"'>"
							+	"<div class='nodeIcons'>"
							+		"<div style='float: left;'>"
							+			"<i class='whEffect' "+(effectClass ? "data-icon='"+effectClass+"' data-tooltip='"+effect+"'" : null)+"></i>"
							+		"</div>"
							+		"<div style='float: right;'>"
							+			"<i data-icon='user' class='invisible'></i>"
							+			"<span class='badge' class='invisible'></span>"
							+		"</div>"
							+	"</div>"
							+	"<h4 class='nodeClass'>"+(systemType + sigFormat(node.child.classBM, "class"))+"</h4>"
							+	"<h4 class='nodeSystem'>"
							+ 	(tripwire.systems[node.child.systemID] ? "<a href='.?system="+tripwire.systems[node.child.systemID].name+"'>"+(node.child.name ? node.child.name : tripwire.systems[node.child.systemID].name)+"</a>" : "<a class='invisible'>system</a>")
							+	"</h4>"
							+	"<h4 class='nodeType'>"+(options.chain["node-reference"] == "id" ? node.child.signatureID : node.child.type + sigFormat(node.child.typeBM, "type") || "&nbsp;")+"</h4>"
							+	"<div class='nodeActivity'>"
							+		"<span class='jumps invisible'>&#9679;</span>&nbsp;<span class='pods invisible'>&#9679;</span>&nbsp;&nbsp;<span class='ships invisible'>&#9679;</span>&nbsp;<span class='npcs invisible'>&#9679;</span>"
							+	"</div>"
							+"</div>"

			child.f = chainNode;

			var parent = {v: node.parent.id};

			row.c.push(child, parent);
			chain.rows.push(row);

			if (node.life == "Critical" && ($.inArray(node.parent.type, frigTypes) != -1 || $.inArray(node.child.type, frigTypes) != -1))
				connections.push(Array(child.v, parent.v, "eol-frig", node.id));
			else if (node.life == "Critical" && node.mass == "Critical")
				connections.push(Array(child.v, parent.v, "eol-critical", node.id));
			else if (node.life == "Critical" && node.mass == "Destab")
				connections.push(Array(child.v, parent.v, "eol-destab", node.id));
			else if ($.inArray(node.parent.type, frigTypes) != -1 || $.inArray(node.child.type, frigTypes) != -1)
				connections.push(Array(child.v, parent.v, "frig", node.id));
			else if (node.life == "Critical")
				connections.push(Array(child.v, parent.v, "eol", node.id));
			else if (node.mass == "Critical")
				connections.push(Array(child.v, parent.v, "critical", node.id));
			else if (node.mass == "Destab")
				connections.push(Array(child.v, parent.v, "destab", node.id));
			else if (node.life == "Gate" || node.parent.type == "GATE" || node.child.type == "GATE")
				connections.push(Array(child.v, parent.v, "gate", node.id));
			//else
			//	connections.push(Array(child.v, parent.v, "", node.id));
		}

		// Apply critical/destab line colors
		connections.reverse(); // so we apply to outer systems first

		//this.data.map = chain;
		//this.data.lines = connections;
		return {"map": chain, "lines": connections};
	}

	this.redraw = function() {
		var data = $.extend(true, {}, this.data);
		data.map = $.extend(true, {}, data.rawMap);

		this.draw(data);
	}

	this.draw = function(data) {
		var data = typeof(data) !== "undefined" ? data : {};
		//var startTime = window.performance.now();

		if (data.map) {
			this.drawing = true;

			this.data.rawMap = $.extend(true, {}, data.map);

			if (options.chain.active == null || (options.chain.tabs[options.chain.active] && options.chain.tabs[options.chain.active].evescout == false)) {
				if (options.masks.active != "273.0") {
					for (var i in data.map) {
						if (data.map[i].mask == "273.0") {
							delete data.map[i];
						}
					}
				}
			}

			// Sort so we keep the chain map order the same
			Object.sort(data.map, "id");

			$.extend(data, this.nodes(data.map)); // 250ms -> <100ms
			$.extend(this.data, data);
			this.map.draw(this.newView(data.map), this.options); // 150ms

			if (options.chain.tabs[options.chain.active]) {
				for (var x in options.chain.tabs[options.chain.active].collapsed) {
					var node = $("#chainMap [data-nodeid='"+options.chain.tabs[options.chain.active].collapsed[x]+"']").attr("id");

					if (node) {
						node = node.split("node")[1];
						this.map.collapse(node - 1, true);
					}
				}
			}

			this.lines(data); // 300ms
			this.grid(); // 4ms

			// Apply current system style
			$("#chainMap [data-nodeid='"+viewingSystemID+"']").parent().addClass("currentNode"); // 1ms

			WormholeTypeToolTips.attach($("#chainMap .whEffect")); // 30ms
			this.drawing = false;
		}

		if (data.activity) // 100ms
			this.data.activity = this.activity(data.activity);

		if (data.occupied) // 3ms
			this.data.occupied = this.occupied(data.occupied);

		if (data.flares) // 20ms
			this.data.flares = this.flares(data.flares);

		if (data.last_modified)
			this.data.last_modified = data.last_modified;

		//console.log("stint: "+ (window.performance.now() - startTime));
	}

	this.collapse = function(c) {
		if (chain.drawing) return false;

		var collapsed = chain.map.getCollapsedNodes();
		options.chain.tabs[options.chain.active].collapsed = [];
		for (x in collapsed) {
			var systemID = $("#chainMap #node"+(collapsed[x] +1)).data("nodeid");
			options.chain.tabs[options.chain.active].collapsed.push(systemID);
		}

		chain.lines(chain.data);

		// Apply current system style
		$("#chainMap [data-nodeid='"+viewingSystemID+"']").parent().addClass("currentNode");

		WormholeTypeToolTips.attach($("#chainMap .whEffect"));

		chain.activity(chain.data.activity);

		chain.occupied(chain.data.occupied);

		chain.flares(chain.data.flares);

		chain.grid();

		options.save();
	}

	this.init = function() {
		this.map = new google.visualization.OrgChart(document.getElementById("chainMap"));
		this.options = {allowHtml: true, allowCollapse: true, size: "medium", nodeClass: "node"};

		google.visualization.events.addListener(this.map, "collapse", this.collapse);

		this.map.draw(new google.visualization.DataView(new google.visualization.DataTable({cols:[{label: "System", type: "string"}, {label: "Parent", type: "string"}]})), this.options);
	}

	//google.setOnLoadCallback(this.init());
	this.init();
}
