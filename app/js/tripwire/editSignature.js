// Handles changing Signatures section
// ToDo: Use native JS
tripwire.editSig = function(edit, disabled) {
    var disabled = disabled || false;

    if (edit.mass) {
        var nth = edit.systemID == viewingSystemID ? edit.nth : edit.nth2;
        var sigID = edit.systemID == viewingSystemID ? edit.signatureID : edit.sig2ID;
        var sigtype = edit.systemID == viewingSystemID ? edit.type : edit.sig2Type;
        var sigTypeBM = edit.systemID == viewingSystemID ? edit.typeBM : edit.type2BM;
        var systemID = edit.systemID == viewingSystemID ? edit.connectionID : edit.systemID;
        var name = edit.systemID == viewingSystemID ? edit.connection : edit.system;
        var system = tripwire.systems[systemID] ? "<a href='.?system="+tripwire.systems[systemID].name+"'>"+(name ? name : tripwire.systems[systemID].name)+"</a>" : name;

        switch (edit.life) {
            case "Stable":
                var lifeClass = "stable";
                break;
            case "Critical":
                var lifeClass = "critical";
                break;
            default:
                var lifeClass = "";
        }

        switch (edit.mass) {
            case "Stable":
                var massClass = "stable";
                break;
            case "Destab":
                var massClass = "destab";
                break;
            case "Critical":
                var massClass = "critical";
                break;
            default:
                var massClass = "";
        }

        var row = "<tr data-id='"+edit.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+sigID+"</td>"
            //+ "<td class='type-tooltip' title=\""+this.whTooltip(edit)+"\">"+(nth>1?'&nbsp;&nbsp;&nbsp;':'')+(sigtype)+(nth>1?' '+nth:'')+"</td>"
            + "<td class='type-tooltip "+ options.signatures.alignment.sigType +"' data-tooltip=\""+this.whTooltip(edit)+"\">"+sigtype+sigFormat(sigTypeBM, "type")+"</td>"
            + "<td class=\"age-tooltip "+ options.signatures.alignment.sigAge +"\" data-tooltip='"+this.ageTooltip(edit)+"'><span data-age='"+edit.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"'>"+system+"</td>"
            + "<td class='"+lifeClass+" "+ options.signatures.alignment.sigLife +"'>"+edit.life+"</td>"
            + "<td class='"+massClass+" "+ options.signatures.alignment.sigMass +"'>"+edit.mass+"</td>"
            + "</tr>";

        var tr = $(row);
    } else {
        var row = "<tr data-id='"+edit.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+edit.signatureID.substring(0, 3)+"-"+edit.signatureID.substring(3, 6)+"</td>"
            + "<td class='"+ options.signatures.alignment.sigType +"'>"+edit.type+"</td>"
            + "<td class='age-tooltip "+ options.signatures.alignment.sigAge +"' data-tooltip='"+this.ageTooltip(edit)+"'><span data-age='"+edit.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"' colspan='3'>"+(edit.name?linkSig(edit.name):'')+"</td>"
            + "</tr>";

        var tr = $(row);
    }

    Tooltips.attach($(tr).find("[data-tooltip]"));

    $("#sigTable tr[data-id='"+edit.id+"']").replaceWith(tr);

    //coloring();
    $("#sigTable").trigger("update");
    // Add counter
    $(tr).find('span[data-age]').countdown("destroy");
    if (edit.life == "Critical") {
        $(tr).find('span[data-age]').countdown({until: moment.utc(edit.lifeLeft).toDate(), onExpiry: this.pastEOL, alwaysExpire: true, compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
            .addClass('critical');
    } else {
        $(tr).find('span[data-age]').countdown({since: moment.utc(edit.lifeTime).toDate(), compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime});
    }

    $(tr).effect("pulsate");
}
