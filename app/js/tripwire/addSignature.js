// Hanldes adding to Signatures section
// ToDo: Use native JS
tripwire.addSig = function(add, option, disabled) {
    var option = option || {};
    var animate = typeof(option.animate) !== 'undefined' ? option.animate : true;
    var disabled = disabled || false;

    if (add.mass) {
        var nth = add.systemID == viewingSystemID ? add.nth : add.nth2;
        var sigID = add.systemID == viewingSystemID ? add.signatureID : add.sig2ID;
        var sigtype = add.systemID == viewingSystemID ? add.type : add.sig2Type;
        var sigTypeBM = add.systemID == viewingSystemID ? add.typeBM : add.type2BM;
        var systemID = add.systemID == viewingSystemID ? add.connectionID : add.systemID;
        var name = add.systemID == viewingSystemID ? add.connection : add.system;
        var system = tripwire.systems[systemID] ? "<a href='.?system="+tripwire.systems[systemID].name+"'>"+(name ? name : tripwire.systems[systemID].name)+"</a>" : name;

        switch (add.life) {
            case "Stable":
                var lifeClass = "stable";
                break;
            case "Critical":
                var lifeClass = "critical";
                break;
            default:
                var lifeClass = "";
        }

        switch (add.mass) {
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

        var row = "<tr data-id='"+add.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+sigID+"</td>"
            //+ "<td class='type-tooltip' title=\""+this.whTooltip(add)+"\">"+(nth>1?'&nbsp;&nbsp;&nbsp;':'')+(sigtype)+(nth>1?' '+nth:'')+"</td>"
            + "<td class='type-tooltip "+ options.signatures.alignment.sigType +"' data-tooltip=\""+this.whTooltip(add)+"\">"+sigtype+sigFormat(sigTypeBM, "type")+"</td>"
            + "<td class=\"age-tooltip "+ options.signatures.alignment.sigAge +"\" data-tooltip='"+this.ageTooltip(add)+"'><span data-age='"+add.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"'>"+system+"</td>"
            + "<td class='"+lifeClass+" "+ options.signatures.alignment.sigLife +"'>"+add.life+"</td>"
            + "<td class='"+massClass+" "+ options.signatures.alignment.sigMass +"'>"+add.mass+"</td>"
            + "<td><a href='' class='sigDelete' "+ (disabled ? 'disabled="disabled"' : '') +">X</a></td>"
            + "<td><a href='' class='sigEdit' "+ (disabled ? 'disabled="disabled"' : '') +"><</a></td>"
            + "</tr>";

        var tr = $(row);
    } else {
        var row = "<tr data-id='"+add.id+"' data-tooltip='' "+ (disabled ? 'disabled="disabled"' : '') +">"
            + "<td class='"+ options.signatures.alignment.sigID +"'>"+add.signatureID+"</td>"
            + "<td class='"+ options.signatures.alignment.sigType +"'>"+add.type+"</td>"
            + "<td class='age-tooltip "+ options.signatures.alignment.sigAge +"' data-tooltip='"+this.ageTooltip(add)+"'><span data-age='"+add.lifeTime+"'></span></td>"
            + "<td class='"+ options.signatures.alignment.leadsTo +"' colspan='3'>"+(add.name?linkSig(add.name):'')+"</td>"
            + "<td><a href='' class='sigDelete' "+ (disabled ? 'disabled="disabled"' : '') +">X</a></td>"
            + "<td><a href='' class='sigEdit' "+ (disabled ? 'disabled="disabled"' : '') +"><</a></td>"
            + "</tr>";

        var tr = $(row);
    }

    Tooltips.attach($(tr).find("[data-tooltip]"));
    //Tooltips.attach($(tr))

    $("#sigTable").append(tr);

    $("#sigTable").trigger("update");

    // Add counter
    if (add.life == "Critical") {
        $(tr).find('span[data-age]').countdown({until: new Date(add.lifeLeft), onExpiry: this.pastEOL, alwaysExpire: true, compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
            .countdown('pause')
            .addClass('critical')
            .countdown('resume');
    } else {
        $(tr).find('span[data-age]').countdown({since: new Date(add.lifeTime), compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
            .countdown('pause')
            .countdown('resume');
    }

    if (animate) {
        $(tr)
            .find('td')
            .wrapInner('<div class="hidden" />')
            .parent()
            .find('td > div')
            .slideDown(700, function(){
                $set = $(this);
                $set.replaceWith($set.contents());
            });

        $(tr).find("td").animate({backgroundColor: "#004D16"}, 1000).delay(1000).animate({backgroundColor: "#111"}, 1000, null, function() {$(this).css({backgroundColor: ""});});
    }
}
