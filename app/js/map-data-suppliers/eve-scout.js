const eveScout = new _EveScoutSignatureConnection();

function _EveScoutSignatureConnection() {
	const _this = this;
	
	this.links = [];
	
	this.active = function() {
		return 'undefined' !== typeof options && options.chain.tabs[options.chain.active] && options.chain.tabs[options.chain.active].evescout;
	}
	
	this.nodeNameSuffix = 'eve-scout';
	
	this.findLinks = function(systemID, ids) {
		if(!this.active()) { return []; }
		
		const r = [];
		for(var ti = 0; ti < this.links.length; ti++) {
			var theraNode;
			const theraLink = this.links[ti];
			const theraID = 'T-' + theraLink.id;
			
			const nodeDefaults = {
				life: theraLink.wormholeEol,
				mass: theraLink.wormholeMass,
				id: theraID,
			};
			
			if(theraLink.solarSystemId == systemID) {	// Connection from this hole
				r.push(Object.assign({
					
					parent: {
						id: ids.parentID,
						systemID: systemID,
						signatureID: theraLink.wormholeDestinationSignatureId,
						type: theraLink.sourceWormholeType.name,
					},	child: {
						id: ids.nextChildID++,
						systemID: theraLink.wormholeDestinationSolarSystemId,
						signatureID: theraLink.signatureId,
						type: theraLink.destinationWormholeType.name,								
					}
				}, nodeDefaults));
			} else if(theraLink.wormholeDestinationSolarSystemId == systemID) { // Connection to this hole
				r.push(Object.assign({
					parent: {
						id: ids.parentID,
						systemID: systemID,
						signatureID: theraLink.signatureId,
						type: theraLink.destinationWormholeType.name,
					},	child: {
						id: ids.nextChildID++,
						systemID: theraLink.solarSystemId,
						signatureID: theraLink.wormholeDestinationSignatureId,
						type: theraLink.sourceWormholeType.name,								
					}
				}, nodeDefaults));				
			}
		}
		
		return r;
	}
	
	/** Refresh the signature data from the public Eve-Scout API */
	this.refresh = function() {
		if(!_this.active()) {
			return;	// only look for Thera data if on a tab with the option selected
		}
		
		$.ajax({
			url: 'cached_third_party.php?key=eve-scout-signatures',
			type: "GET",
			dataType: "JSON"
		}).done(function(data, status, xhr) {	
			if(!_.isEqual(data, _this.links)) {
				console.info('Updating map for EvE Scout update');
				_this.links = data;
				chain.redraw();
			}
		}).fail(function(xhr, status, error) {
			console.warn('Failed to fetch signatures from eve-scout.com: ' + status, error);
		});
	};
	
	setInterval(this.refresh, 60000);
	this.refresh();
}