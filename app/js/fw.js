const fw = new _FactionWarfare();

function _FactionWarfare() {
	const _this = this;
	this.listeners = [];
	this.data = null;
	
	/** Refresh the FW data from the public ESI endpoint */
	this.refresh = function() {
		$.ajax({
			url: 'cached_third_party.php?key=fw',
			type: "GET",
			dataType: "JSON"
		}).done(function(data, status, xhr) {	
			if(!_.isEqual(data, _this.links)) {
				console.info('Updating faction warfare status');
				_this.data = data;
				//this.notify();
			}
		}).fail(function(xhr, status, error) {
			console.warn('Failed to fetch Thera from eve-scout.com: ' + status, error);
		});
	};	
	
	setInterval(this.refresh, 3600000);
	this.refresh();	
}