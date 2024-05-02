$("#track").on("click", ".tracking-clone", function() {
	var characterID =$(this).attr("data-characterid");
	$("#tracking .tracking-clone").removeClass("active");

	if (options.tracking.active == characterID) {
		options.tracking.active = null;
		tripwire.EVE(false, true);
		$("#removeESI").attr("disabled", "disabled");
	} else {
		options.tracking.active = characterID;

		if (tripwire.esi.characters[options.tracking.active]) {
			$("#tracking .tracking-clone[data-characterid='"+ options.tracking.active +"']").addClass("active");
			tripwire.EVE(tripwire.esi.characters[options.tracking.active], true);
		}

		$("#removeESI").removeAttr("disabled");
	}
	set_tracking_text();
	options.save();
});

$("#login").on("click", "#removeESI", function() {
	var characterID = options.tracking.active;

	options.tracking.active = null;
	tripwire.EVE(false, true);
	options.save();

	$("#tracking .tracking-clone[data-characterid='"+ characterID +"']").remove();

	$("#removeESI").attr("disabled", "disabled");

	if ($.isArray(tripwire.data.esi.delete)) {
		tripwire.data.esiDelete.push(characterID);
	} else {
		tripwire.data.esiDelete = [characterID];
	}
});


/** Set UI text based on the current tracked character */
function set_tracking_text() {
	if(tripwire.esi.characters[options.tracking.active]) {
		document.getElementById('user-track-name').textContent = tripwire.esi.characters[options.tracking.active].characterName;
		document.getElementById('user-track').style.display = '';
		document.getElementById('user-no-track').style.display = 'none';
	} else {
		document.getElementById('user-track').style.display = 'none';
		document.getElementById('user-no-track').style.display = '';	
	}
}
