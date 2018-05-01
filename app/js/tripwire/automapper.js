tripwire.autoMapper = function(from, to) {
    var pods = [33328, 670];
    var undo = [];

    // Make sure from and to are valid systems
    if (!tripwire.systems[from] || !tripwire.systems[to])
        return false;

    // Make sure the automapper is turned on & not disabled
    if (!$("#toggle-automapper").hasClass("active") || $("#toggle-automapper").hasClass("disabled"))
        return false;

    // Is pilot in a pod?
    if ($.inArray(parseInt(tripwire.client.EVE.shipTypeID), pods) >= 0)
        return false;

    // Is this a gate?
    if (typeof(tripwire.map.shortest[from - 30000000]) != "undefined" && typeof(tripwire.map.shortest[from - 30000000][to - 30000000]) != "undefined")
        return false;

    // Is this an existing connection?
    if ($.map(tripwire.client.wormholes, function(wormhole) { return (tripwire.client.signatures[wormhole.initialID].systemID == from && tripwire.client.signatures[wormhole.secondaryID].systemID == to) || (tripwire.client.signatures[wormhole.initialID].systemID == to && tripwire.client.signatures[wormhole.secondaryID].systemID == from) ? wormhole : null; }).length > 0)
        return false;

    var payload = {"signatures": {"add": [], "update": []}};
    var sig, toClass = null;

    if (tripwire.systems[to].class)
        toClass = "Class " + tripwire.systems[to].class;
    else if (tripwire.systems[to].security >= 0.45)
        toClass = "High-Sec";
    else if (tripwire.systems[to].security > 0)
        toClass = "Low-Sec";
    else
        toClass = "Null-Sec";

    // Find wormholes that have no set Leads To system, and either leads To matches toClass or type matches toClass
    var wormholes = $.map(tripwire.client.wormholes, function(wormhole) {
        if (tripwire.client.signatures[wormhole.initialID].systemID == from && !tripwire.systems[tripwire.client.signatures[wormhole.secondaryID].systemID]) {
            if (tripwire.aSigSystems[tripwire.client.signatures[wormhole.secondaryID].systemID] == toClass) {
                return wormhole;
            } else if (wormhole.type && tripwire.wormholes[wormhole.type] && tripwire.wormholes[wormhole.type].leadsTo == toClass) {
                return wormhole;
            }
        }
    });
    if (wormholes.length) {
        if (wormholes.length > 1) {
            $("#dialog-msg").dialog({
                autoOpen: true,
                title: "Which Signature?",
                buttons: {
                    Cancel: function() {
                        $(this).dialog("close");
                    },
                    Ok: function() {
                        var i = $("#dialog-msg #msg [name=sig]:checked").val();
                        var wormhole = wormholes[i];
                        var signature = tripwire.client.signatures[wormhole.initialID];
                        var signature2 = tripwire.client.signatures[wormhole.secondaryID];

                        payload.signatures.update.push({
                            "wormhole": {
                                "id": wormhole.id
                            },
                            "signatures": [
                                {
                                    "id": signature.id
                                },
                                {
                                    "id": signature2.id,
                                    "systemID": to
                                }
                            ]
                        });

                        var success = function(data) {
                            if (data.resultSet && data.resultSet[0].result == true) {
                                undo.push({"wormhole": wormhole, "signatures": [signature, signature2]});
                                $("#dialog-msg").dialog("close");
                            }
                        }

                        tripwire.refresh('refresh', payload, success);
                    }
                },
                open: function() {
                    $("#dialog-msg #msg").html("Which signature would you like to update?<br/><br/>");

                    $.each(wormholes, function(i) {
                        $("#dialog-msg #msg").append("<input type='radio' name='sig' value='"+i+"' />"+tripwire.client.signatures[wormholes[i].initialID].signatureID+"<br/>");
                    });
                }
            });
        } else {
            var wormhole = wormholes[0];
            var signature = tripwire.client.signatures[wormhole.initialID];
            var signature2 = tripwire.client.signatures[wormhole.secondaryID];

            payload.signatures.update.push({
                "wormhole": {
                    "id": wormhole.id
                },
                "signatures": [
                    {
                        "id": signature.id
                    },
                    {
                        "id": signature2.id,
                        "systemID": to
                    }
                ]
            });
            undo.push({"wormhole": wormhole, "signatures": [signature, signature2]});
        }
    }

    if (wormholes.length == 0) {
        // Find wormholes that have no set Leads To system at all
        var wormholes = $.map(tripwire.client.wormholes, function(wormhole) {
            if (tripwire.client.signatures[wormhole.initialID].systemID == from && !tripwire.systems[tripwire.client.signatures[wormhole.secondaryID].systemID]) {
                if (!tripwire.client.signatures[wormhole.secondaryID].systemID) {
                    return wormhole;
                }
            }
        });
        if (wormholes.length) {
            // Find wormholes that have no set Leads To system, and have no type or are a K162
            if (wormholes.length > 1) {
                $("#dialog-msg").dialog({
                    autoOpen: true,
                    title: "Which Signature?",
                    buttons: {
                        Cancel: function() {
                            $(this).dialog("close");
                        },
                        Ok: function() {
                            var i = $("#dialog-msg #msg [name=sig]:checked").val();
                            var wormhole = wormholes[i];
                            var signature = tripwire.client.signatures[wormhole.initialID];
                            var signature2 = tripwire.client.signatures[wormhole.secondaryID];

                            payload.signatures.update.push({
                                "wormhole": {
                                    "id": wormhole.id
                                },
                                "signatures": [
                                    {
                                        "id": signature.id
                                    },
                                    {
                                        "id": signature2.id,
                                        "systemID": to
                                    }
                                ]
                            });

                            var success = function(data) {
                                if (data.resultSet && data.resultSet[0].result == true) {
                                    undo.push({"wormhole": wormhole, "signatures": [signature, signature2]});
                                    $("#dialog-msg").dialog("close");
                                }
                            }

                            tripwire.refresh('refresh', payload, success);
                        }
                    },
                    open: function() {
                        $("#dialog-msg #msg").html("Which signature would you like to update?<br/><br/>");

                        $.each(wormholes, function(i) {
                            $("#dialog-msg #msg").append("<input type='radio' name='sig' value='"+i+"' />"+tripwire.client.signatures[wormholes[i].initialID].signatureID+"<br/>");
                        });
                    }
                });
            } else {
                var wormhole = wormholes[0];
                var signature = tripwire.client.signatures[wormhole.initialID];
                var signature2 = tripwire.client.signatures[wormhole.secondaryID];

                payload.signatures.update.push({
                    "wormhole": {
                        "id": wormhole.id
                    },
                    "signatures": [
                        {
                            "id": signature.id
                        },
                        {
                            "id": signature2.id,
                            "systemID": to
                        }
                    ]
                });
                undo.push({"wormhole": wormhole, "signatures": [signature, signature2]});
            }
        } else {
            // Nothing matches, create a new wormhole
            payload.signatures.add.push({
                "wormhole": {
                    "type": null,
                    "parent": "initial",
                    "life": "stable",
                    "mass": "stable"
                },
                "signatures": [
                    {
                        "signatureID": null,
                        "systemID": from,
                        "type": "wormhole",
                        "name": null
                    },
                    {
                        "signatureID": null,
                        "systemID": to,
                        "type": "wormhole",
                        "name": null
                    }
                ]
            });
        }
    }

    if (payload.signatures.add.length || payload.signatures.update.length) {
        var success = function(data) {
            if (data.resultSet && data.resultSet[0].result == true) {
                $("#undo").removeClass("disabled");

                if (data.results) {
                    if (viewingSystemID in tripwire.signatures.undo) {
                        tripwire.signatures.undo[viewingSystemID].push({action: "add", signatures: data.results});
                    } else {
                        tripwire.signatures.undo[viewingSystemID] = [{action: "add", signatures: data.results}];
                    }
                }

                if (undo.length) {
                    if (viewingSystemID in tripwire.signatures.undo) {
                        tripwire.signatures.undo[viewingSystemID].push({action: "update", signatures: undo});
                    } else {
                        tripwire.signatures.undo[viewingSystemID] = [{action: "update", signatures: undo}];
                    }
                }

                sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
            }
        }

        tripwire.refresh('refresh', payload, success);
    }
}
