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
			if(!_.isEqual(data, _this.data)) {
				console.info('Updating faction warfare status');
				_this.data = data;
				_this.parse(data);
				//this.notify();
			}
		}).fail(function(xhr, status, error) {
			console.warn('Failed to fetch FW data from ESI: ' + status, error);
		});
	};	
	
	this.parse = function(data) {
		this.systems = {};
		for(var i = 0; i < data.length; i++) { this.systems[data[i].solar_system_id] = data[i]; }
	}
	
	setInterval(this.refresh, 3600000);
	this.refresh();	
}