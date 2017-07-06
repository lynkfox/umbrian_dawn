tripwire.undo = function() {
    if (tripwire.signatures.undo[viewingSystemID].length > 0) {
        $("#undo").addClass("disabled");
        var lastIndex = tripwire.signatures.undo[viewingSystemID].length -1;
        var data = {"systemID": viewingSystemID,"request": {"signatures": {"add": [], "delete": [], "update": []}}};

        var undoItem = tripwire.signatures.undo[viewingSystemID][lastIndex];

        switch(undoItem.action) {
            case "add":
                data.request.signatures.delete = data.request.signatures.delete.concat($.map(undoItem.signatures, function(signature) { return signature.id }));
                break;
            case "delete":
                data.request.signatures.add = data.request.signatures.add.concat(undoItem.signatures);
                break;
            case "update":
                data.request.signatures.update = data.request.signatures.update.concat(undoItem.signatures);
                break;
        }

        var signatures = tripwire.client.signatures;

        var success = function(data) {
            if (data.result == true) {
                tripwire.signatures.undo[viewingSystemID].pop();

                $("#redo").removeClass("disabled");
                if (viewingSystemID in tripwire.signatures.redo) {
                    if (undoItem.action == "update") {
                        tripwire.signatures.redo[viewingSystemID].push({"action": undoItem.action, "signatures": $.map(undoItem.signatures, function(signature) { return signatures[signature.id]; })});
                    } else {
                        tripwire.signatures.redo[viewingSystemID].push({"action": undoItem.action, "signatures": undoItem.signatures});
                    }
                } else {
                    if (undoItem.action == "update") {
                        tripwire.signatures.redo[viewingSystemID] = [{"action": undoItem.action, "signatures": $.map(undoItem.signatures, function(signature) { return signatures[signature.id]; })}];
                    } else {
                        tripwire.signatures.redo[viewingSystemID] = [{"action": undoItem.action, "signatures": undoItem.signatures}];
                    }
                }

                sessionStorage.setItem("tripwire_undo", JSON.stringify(tripwire.signatures.undo));
                sessionStorage.setItem("tripwire_redo", JSON.stringify(tripwire.signatures.redo));
            }
        }

        var always = function(data) {
            if (tripwire.signatures.undo[viewingSystemID].length > 0) {
                $("#undo").removeClass("disabled");
            }
        }

        tripwire.refresh('refresh', data, success, always);
    }
}
