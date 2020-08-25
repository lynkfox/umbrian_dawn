const invasions = new _Invasions();
systemAnalysis.addMutator(invasions);

function _Invasions() {
	const _this = this;
	const pathSymbolMap = {
		stellar_reconnaissance: '◆',
		
		triglavian_minor_victory: '▽',
		final_liminality: '▼',
		
		edencom_minor_victory: '△',
		fortress: '▲',
	};
	
	this.invasions = {};
	
	/** Update the system */
	this.mutate = function(system, systemID) {
		const systemInvasion = this.invasions[systemID];
		if(systemInvasion) {
			if(systemInvasion.derived_security_status) { system.security = 1 * systemInvasion.derived_security_status; }
			system.pathSymbol = pathSymbolMap[systemInvasion.status];
		}
	}
	
	/** Refresh the invasion data from the public Kybernauts API */
	this.refresh = function() {
		$.ajax({
			url: 'https://cors-anywhere.herokuapp.com/https://kybernaut.space/invasions.json',
			type: "GET",
			dataType: "JSON"
		}).done(function(data, status, xhr) {	
			if(!_.isEqual(data, _this.invasions)) {
				console.info('Updating map for invasions update');
				_this.invasions = _.keyBy(data, function(x) { return x.system_id; });
				chain.redraw();
			}
		}).fail(function(xhr, status, error) {
			console.warn('Failed to fetch invasion data from kybernaut.space: ' + status, error);
		});
	};
	
	setInterval(this.refresh, 3600000);
	this.refresh();
}