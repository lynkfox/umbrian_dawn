tripwire.parse = function(server, mode) {
    var data = $.extend(true, {}, server);

    if (options.chain.active == null || (options.chain.tabs[options.chain.active] && options.chain.tabs[options.chain.active].evescout != true)) {
        if (options.masks.active != "273.0") {
            for (var key in data.signatures) {
                if (data.signatures[key].mask == "273.0") {
                    delete data.signatures[key];
                }
            }
        }
    }

    if (mode == 'refresh') {
        for (var key in data.signatures) {
            var disabled = data.signatures[key].mask == "273.0" && options.masks.active != "273.0" ? true : false;

            // Check for differences
            if (!tripwire.signatures.list[key]) {
                this.addSig(data.signatures[key], {animate: true}, disabled);
            } else if (tripwire.signatures.list[key].time !== data.signatures[key].time) {
                var edit = false;
                for (column in data.signatures[key]) {
                    if (data.signatures[key][column] != tripwire.signatures.list[key][column] && column != "time" && column != "editing") {
                        edit = true;
                    }
                }

                if (edit) {
                    this.editSig(data.signatures[key], disabled);
                } else {
                    this.sigEditing(data.signatures[key]);
                }
            }
        }

        // Sigs needing removal
        for (var key in tripwire.signatures.list) {
            if (!data.signatures[key]) {
                this.deleteSig(key);
            }
        }

        //client and server should now match
        this.client = server;
    } else if (mode == 'init' || mode == 'change') {

        for (var key in data.signatures) {
            var disabled = data.signatures[key].mask == "273.0" && options.masks.active != "273.0" ? true : false;

            this.addSig(data.signatures[key], {animate: false}, disabled);

            if (data.signatures[key].editing) {
                this.sigEditing(data.signatures[key]);
            }
        }

        this.client = server;
    }

    tripwire.signatures.list = data.signatures;

    // set the sig count in the UI
    $("#signature-count").html(data.signatures.length || Object.size(data.signatures) || 0);
}
