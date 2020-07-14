const thera = new _TheraConnection();

function _TheraConnection() {
	const _this = this;
	
	this.links = [];
	
	/** Refresh the Thera data from the public Eve-Scout API */
	this.refresh = function() {
		if(!(options.chain.tabs[options.chain.active] && options.chain.tabs[options.chain.active].evescout)) {
			return;	// only look for Thera data if on a tab with the option selected
		}
		
		$.ajax({
			url: 'https://cors-anywhere.herokuapp.com/https://www.eve-scout.com/api/wormholes',
			type: "GET",
			dataType: "JSON"
		}).done(function(data, status, xhr) {	
			if(!_.isEqual(data, _this.links)) {
				console.info('Updating map for Thera update');
				_this.links = data;
				chain.redraw();
			}
		}).fail(function(xhr, status, error) {
			console.warn('Failed to fetch Thera from eve-scout.com: ' + status, error);
		});
	};
	
	setInterval(this.refresh, 60000);
	this.refresh();
}