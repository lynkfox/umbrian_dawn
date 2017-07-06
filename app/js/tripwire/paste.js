// Handles pasting sigs from EVE
tripwire.pasteSignatures = function() {
    var processing = false;
    var paste;

    var rowParse = function(row) {
        var scanner = {group: "", type: ""};
        var columns = row.split("	"); // Split by tab
        var validScanGroups = ["Cosmic Signature", "Cosmic Anomaly", "Kosmische Anomalie", "Kosmische Signatur",
                                "Источники сигналов", "Космическая аномалия"];
        var validGroups = ["Wormhole", "Relic Site", "Gas Site", "Ore Site", "Data Site", "Combat Site",
                            "Wurmloch", "Reliktgebiet", "Gasgebiet", "Mineraliengebiet", "Datengebiet", "Kampfgebiet",
                            "Червоточина", "АРТЕФАКТЫ: район поиска артефактов", "ГАЗ: район добычи газа", "РУДА: район добычи руды", "ДАННЫЕ: район сбора данных", "ОПАСНО: район повышенной опасности"];

        for (var x in columns) {
            if (columns[x].match(/([A-Z]{3}[-]\d{3})/)) {
                scanner.id = columns[x].split("-");
                continue;
            }

            if (columns[x].match(/(\d([.|,]\d)?[ ]?(%))/) || columns[x].match(/(\d[.|,]?\d+\s(AU|AE|km|m|а.е.|км|м))/i)) { // Exclude scan % || AU
                continue;
            }

            if ($.inArray(columns[x], validScanGroups) != -1) {
                scanner.scanGroup = columns[x];
                continue;
            }

            if ($.inArray(columns[x], validGroups) != -1) {
                scanner.group = columns[x];
                continue;
            }

            if (columns[x] != "") {
                scanner.type = columns[x];
            }
        }

        if (!scanner.id || scanner.id.length !== 2) {
            return false;
        }

        return scanner;
    }

    this.pasteSignatures.parsePaste = function(data) {
        var rows = data.split("\n");
        var data = {"request": {"signatures": {"add": [], "update": []}}};
        var ids = $.map(tripwire.client.signatures, function(sig) {return sig.mask == "273.0" && ((options.chain.active != null && !options.chain.tabs[options.chain.active].evescout) || options.chain.active == null) ? null : (viewingSystemID == sig.systemID ? sig.signatureID : sig.sig2ID)});
        var wormholeGroups = ["Wormhole", "Wurmloch", "Червоточина"];
        var siteGroups = ["Combat Site", "Kampfgebiet", "ОПАСНО: район повышенной опасности"];
        var otherGroups = {"Gas Site": "Gas", "Data Site": "Data", "Relic Site": "Relic", "Ore Site": "Ore",
                            "Gasgebiet": "Gas", "Datengebiet": "Data", "Reliktgebiet": "Relic", "Mineraliengebiet": "Ore",
                            "ГАЗ: район добычи газа": "Gas", "ДАННЫЕ: район сбора данных": "Data", "АРТЕФАКТЫ: район поиска артефактов": "Relic", "РУДА: район добычи руды": "Ore"};

        for (var row in rows) {
            var scanner = rowParse(rows[row]);

            if (scanner.id) {
                if ($.inArray(scanner.group, wormholeGroups) != -1) {
                    type = "Wormhole";
                    whType = "???";
                    sigName = null;
                } else if ($.inArray(scanner.group, siteGroups) != -1) {
                    type = 'Sites';
                    sigName = scanner.type;
                } else if (otherGroups[scanner.group]) {
                    type = otherGroups[scanner.group];
                    sigName = scanner.type;
                } else {
                    type = null;
                    sigName = null;
                }

                if (ids.indexOf(scanner.id[0]) !== -1) {
                    // Update signature
                    sig = $.map(tripwire.client.signatures, function(sig) {return sig.mask == "273.0" && ((options.chain.active != null && !options.chain.tabs[options.chain.active].evescout) || options.chain.active == null) ? null : (viewingSystemID == sig.systemID ? (sig.signatureID == scanner.id[0]?sig:null):(sig.sig2ID == scanner.id[0]?sig:null))})[0];
                    if (sig && viewingSystemID == sig.systemID) {
                        // Parent side
                        if ((type && sig.type != type) || (sigName && sig.name != sigName)) {
                            if ((type == "Wormhole" && sig.life == null) || type !== "Wormhole") {
                                data.request.signatures.update.push({
                                    id: sig.id,
                                    side: "parent",
                                    signatureID: scanner.id[0],
                                    systemID: viewingSystemID,
                                    systemName: "",
                                    type: type || sig.type || "???",
                                    name: sigName || sig.name,
                                    sig2ID: sig.sig2ID || "???",
                                    connectionName: sig.connection || null,
                                    connectionID: sig.connectionID || null,
                                    whLife: sig.life || "New Stable",
                                    whMass: sig.mass || "Stable",
                                    lifeLength: sig.lifeLength || 24,
                                    life: sig.lifeLength || 24
                                });
                            }
                        }
                    } else {
                        // Child side
                        if (sig && ((type && sig.sig2Type != type) || (sigName && sig.name != sigName))) {
                            if ((type == "Wormhole" && sig.life == null) || type !== "Wormhole") {
                                data.request.signatures.update.push({
                                    id: sig.id,
                                    side: "child",
                                    sig2ID: scanner.id[0],
                                    systemID: sig.connectionID || null,
                                    systemName: sig.connectionName || null,
                                    type: type || sig.sig2Type || "???",
                                    name: sigName || sig.name,
                                    connectionName: "",
                                    connectionID: viewingSystemID,
                                    whLife: sig.life || "New Stable",
                                    whMass: sig.mass || "Stable",
                                    lifeLength: sig.lifeLength || 24,
                                    life: sig.lifeLength || 24
                                });
                            }
                        }
                    }
                } else {
                    // Add signature
                    ids.push(scanner.id[0]);

                    data.request.signatures.add.push({
                        signatureID: scanner.id[0],
                        systemID: viewingSystemID,
                        connectionName: "",
                        type: type || "???",
                        name: sigName,
                        life: options.signatures.pasteLife,
                        lifeLength: options.signatures.pasteLife
                    });
                }
            }
        }

        if (data.request.signatures.add.length || data.request.signatures.update.length) {
            data.systemID = viewingSystemID;

            var update = $.map(data.request.signatures.update, function(signature) { return tripwire.client.signatures[signature.id]; });
            var success = function(data) {
                if (data.result == true) {
                    $("#undo").removeClass("disabled");
                    if (viewingSystemID in tripwire.signatures.undo) {
                        if (data.resultSet) {
                            tripwire.signatures.undo[viewingSystemID].push({action: "add", signatures: $.map(data.resultSet, function(id) { return data.signatures[id]; })});
                        }

                        if (update.length) {
                            tripwire.signatures.undo[viewingSystemID].push({action: "update", signatures: update});
                        }
                    } else {
                        if (data.resultSet) {
                            tripwire.signatures.undo[viewingSystemID] = [{action: "add", signatures: $.map(data.resultSet, function(id) { return data.signatures[id]; })}];
                        }

                        if (update.length) {
                            tripwire.signatures.undo[viewingSystemID] = [{action: "update", signatures: update}];
                        }
                    }

                    sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
                }
            }

            var always = function(data) {
                processing = false;
            }

            tripwire.refresh('refresh', data, success, always);
        } else {
            processing = false;
        }
    }

    this.pasteSignatures.init = function() {
        $(document).keydown(function(e)	{
            if ((e.metaKey || e.ctrlKey) && (e.keyCode == 86 || e.keyCode == 91) && !processing) {
                //Abort - user is in input or textarea
                if ($(document.activeElement).is("textarea, input")) return;

                $("#clipboard").focus();
            }
        });

        $("body").on("click", "#fullPaste", function(e) {
            e.preventDefault();

            var rows = paste.split("\n");
            var pasteIDs = [];
            var deletes = [];
            var undo = [];

            for (var x in rows) {
                if (scan = rowParse(rows[x])) {
                    pasteIDs.push(scan.id[0]);
                }
            }

            for (var i in tripwire.client.signatures) {
                var sig = tripwire.client.signatures[i];

                if (sig.systemID == viewingSystemID && $.inArray(sig.signatureID, pasteIDs) == -1 && sig.type !== "GATE" && sig.signatureID !== "???") {
                    deletes.push(sig.id);
                    undo.push(sig);
                } else if (sig.connectionID == viewingSystemID && $.inArray(sig.sig2ID, pasteIDs) == -1 && sig.sig2Type !== "GATE" && sig.sig2ID !== "???") {
                    deletes.push(sig.id);
                    undo.push(sig);
                }
            }

            if (deletes.length > 0) {
                var data = {"request": {"signatures": {"delete": deletes}}};

                var success = function(data) {
                    if (data.result == true) {
                        $("#undo").removeClass("disabled");
                        if (viewingSystemID in tripwire.signatures.undo) {
                            tripwire.signatures.undo[viewingSystemID].push({action: "delete", signatures: undo});
                        } else {
                            tripwire.signatures.undo[viewingSystemID] = [{action: "delete", signatures: undo}];
                        }

                        sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
                    }
                }

                tripwire.refresh('refresh', data, success);
            }
        });

        $("#clipboard").on("paste", function(e) {
            e.preventDefault();
            var data = window.clipboardData ? window.clipboardData.getData("Text") : (e.originalEvent || e).clipboardData.getData('text/plain');

            $("#clipboard").blur();

            processing = true;
            paste = data;
            Notify.trigger("Paste detected<br/>(<a id='fullPaste' href=''>Click to delete missing sigs</a>)");
            tripwire.pasteSignatures.parsePaste(data);
        });
    }

    this.pasteSignatures.init();
}
tripwire.pasteSignatures();
