tripwire.autoMapper = function(from, to) {
    // Testing
    // from = $.map(tripwire.systems, function(system, id) { return system.name == from ? id : null; })[0];
    // to = $.map(tripwire.systems, function(system, id) { return system.name == to ? id : null; })[0];
    var pods = [33328, 670];

    // Make sure from and to are valid systems
    if (!tripwire.systems[from] || !tripwire.systems[to])
        return false;

    // Is auto-mapper toggled?
    if (!$("#toggle-automapper").hasClass("active"))
        return false;

    // Is pilot in a pod?
    if ($.inArray(parseInt(tripwire.client.EVE.shipTypeID), pods) >= 0)
        return false;

    // Is this a gate?
    if (typeof(tripwire.map.shortest[from - 30000000]) != "undefined" && typeof(tripwire.map.shortest[from - 30000000][to - 30000000]) != "undefined")
        return false;

    // Is this an existing connection?
    if ($.map(chain.data.rawMap, function(sig) { return (sig.systemID == from && sig.connectionID == to) || (sig.connectionID == from && sig.systemID == to) ? sig : null })[0])
        return false;

    var data = {"request": {"signatures": {"add": [], "update": []}}};
    var sig, toClass = null;

    if (tripwire.systems[to].class)
        toClass = "Class " + tripwire.systems[to].class;
    else if (tripwire.systems[to].security >= 0.45)
        toClass = "High-Sec";
    else if (tripwire.systems[to].security > 0)
        toClass = "Low-Sec";
    else
        toClass = "Null-Sec";

    sig = $.map(chain.data.rawMap, function(sig) { return sig.systemID == from && sig.mass && ((tripwire.wormholes[sig.type] && tripwire.wormholes[sig.type].leadsTo == toClass && sig.connectionID <= 0) || sig.connection == toClass) ? sig : null; })
    if (sig.length) {
        if (sig.length > 1) {
            $("#dialog-msg").dialog({
                autoOpen: true,
                buttons: {
                    Cancel: function() {
                        $(this).dialog("close");
                    },
                    Ok: function() {
                        var x = $("#dialog-msg #msg [name=sig]:checked").val();

                        data.request.signatures.update.push({
                            id: sig[x].id,
                            side: "parent",
                            signatureID: sig[x].signatureID,
                            systemID: sig[x].systemID,
                            systemName: sig[x].system,
                            type: "Wormhole",
                            whType: sig[x].type,
                            sig2ID: sig[x].sig2ID,
                            sig2Type: sig[x].sig2Type,
                            connectionName: tripwire.systems[to].name,
                            connectionID: to,
                            whLife: sig[x].life,
                            whMass: sig[x].mass,
                            lifeLength: sig[x].lifeLength
                        });

                        data.systemID = viewingSystemID;

                        var success = function(data) {
                            if (data && data.result == true) {
                                $("#dialog-msg").dialog("close");
                            }
                        }

                        tripwire.refresh('refresh', data, success);
                    }
                },
                open: function() {
                    $("#dialog-msg #msg").html("Which signature would you like to update?<br/><br/>");

                    $.each(sig, function(index) {
                        $("#dialog-msg #msg").append("<input type='radio' name='sig' value='"+index+"' />"+this.signatureID+"<br/>");
                    });
                }
            });
        } else if (sig.length) {
            sig = sig[0];

            data.request.signatures.update.push({
                id: sig.id,
                side: "parent",
                signatureID: sig.signatureID,
                systemID: sig.systemID,
                systemName: sig.system,
                type: "Wormhole",
                whType: sig.type,
                sig2ID: sig.sig2ID,
                sig2Type: sig.sig2Type,
                connectionName: tripwire.systems[to].name,
                connectionID: to,
                whLife: sig.life,
                whMass: sig.mass,
                lifeLength: sig.lifeLength
            });
        }
    } else if (sig = $.map(chain.data.rawMap, function(sig) { return sig.systemID == from && sig.connectionID <= 0 && (sig.type == "???" || sig.type == "K162") ? sig : null; })) {
        if (sig.length > 1) {
            $("#dialog-msg").dialog({
                autoOpen: true,
                buttons: {
                    Cancel: function() {
                        $(this).dialog("close");
                    },
                    Ok: function() {
                        var x = $("#dialog-msg #msg [name=sig]:checked").val();

                        data.request.signatures.update.push({
                            id: sig[x].id,
                            side: "parent",
                            signatureID: sig[x].signatureID,
                            systemID: sig[x].systemID,
                            systemName: sig[x].system,
                            type: "Wormhole",
                            whType: sig[x].type,
                            sig2ID: sig[x].sig2ID,
                            sig2Type: sig[x].sig2Type,
                            connectionName: tripwire.systems[to].name,
                            connectionID: to,
                            whLife: sig[x].life,
                            whMass: sig[x].mass,
                            lifeLength: sig[x].lifeLength
                        });

                        data.systemID = viewingSystemID;

                        var success = function(data) {
                            if (data && data.result == true) {
                                $("#dialog-msg").dialog("close");
                            }
                        }

                        tripwire.refresh('refresh', data, success);
                    }
                },
                open: function() {
                    $("#dialog-msg #msg").html("Which signature would you like to update?<br/><br/>");

                    $.each(sig, function(index) {
                        $("#dialog-msg #msg").append("<input type='radio' name='sig' value='"+index+"' /> "+this.signatureID+"<br/>");
                    });
                }
            });
        } else if (sig.length) {
            sig = sig[0];

            data.request.signatures.update.push({
                id: sig.id,
                side: "parent",
                signatureID: sig.signatureID,
                systemID: sig.systemID,
                systemName: sig.system,
                type: "Wormhole",
                whType: sig.type,
                sig2ID: sig.sig2ID,
                sig2Type: sig.sig2Type,
                connectionName: tripwire.systems[to].name,
                connectionID: to,
                whLife: sig.life,
                whMass: sig.mass,
                lifeLength: sig.lifeLength
            });
        }
    }

    if (sig.length == 0) {
        data.request.signatures.add.push({
            signatureID: "???",
            systemID: from,
            type: "Wormhole",
            whType: "???",
            class: sigClass(tripwire.systems[from].name, "???"),
            class2: sigClass(tripwire.systems[to].name, null),
            connectionName: "",
            connectionID: to
        });
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

        tripwire.refresh('refresh', data, success);
    }
}
