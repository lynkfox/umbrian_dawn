tripwire.redo = function() {
    if (tripwire.signatures.redo[viewingSystemID].length > 0) {
        $("#redo").addClass("disabled");
        var lastIndex = tripwire.signatures.redo[viewingSystemID].length -1;
        var data = {"systemID": viewingSystemID, "request": {"signatures": {"add": [], "delete": [], "update": []}}};

        var redoItem = tripwire.signatures.redo[viewingSystemID][lastIndex];

        switch(redoItem.action) {
            case "add":
                data.request.signatures.add = data.request.signatures.add.concat(redoItem.signatures);
                break;
            case "delete":
                data.request.signatures.delete = data.request.signatures.delete.concat($.map(redoItem.signatures, function(signature) { return signature.id }));
                break;
            case "update":
                data.request.signatures.update = data.request.signatures.update.concat(redoItem.signatures);
                break;
        }

        var signatures = tripwire.client.signatures;

        var success = function(data) {
            if (data.result == true) {
                tripwire.signatures.redo[viewingSystemID].pop();

                $("#undo").removeClass("disabled");
                if (viewingSystemID in tripwire.signatures.undo) {
                    if (redoItem.action == "update") {
                        tripwire.signatures.undo[viewingSystemID].push({"action": redoItem.action, "signatures": $.map(redoItem.signatures, function(signature) { return signatures[signature.id]; })});
                    } else {
                        tripwire.signatures.undo[viewingSystemID].push({action: redoItem.action, signatures: redoItem.signatures});
                    }
                } else {
                    if (redoItem.action == "update") {
                        tripwire.signatures.undo[viewingSystemID] = [{"action": redoItem.action, "signatures": $.map(redoItem.signatures, function(signature) { return signatures[signature.id]; })}];
                    } else {
                        tripwire.signatures.undo[viewingSystemID] = [{action: redoItem.action, signatures: redoItem.signatures}];
                    }
                }

                sessionStorage.setItem("tripwire_redo", JSON.stringify(tripwire.signatures.redo));
                sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
            }
        }

        var always = function(data) {
            if (tripwire.signatures.redo[viewingSystemID].length > 0) {
                $("#redo").removeClass("disabled");
            }
        }

        tripwire.refresh('refresh', data, success, always);
    }
}
