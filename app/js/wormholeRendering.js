/** Functions for rendering things relating to wormholes */
const wormholeRendering = new function() { 
	this.renderWormholeType = function(type, key, fromType, targetType) {
		return ((key || type.key) ? '<b>' + (key || type.key || '') + '</b>: ' : '') +
			formatEndTypes(fromType || type.from) + '➔' + formatEndTypes(targetType || type.leadsTo) +
			(type.jump ? ' (' + (type.jump / 1e6) + 'kt)' : '')
			;
	};
	
	function formatEndTypes(types) {
		if(!types) { return '?'; }
		types = Array.isArray(types) ? types : [ types ];
		return types.map(function(type) {
			const systemID = Object.index(appData.systems, "name", type, true) || type;	// look up real system ID first
			const system = systemAnalysis.analyse(systemID);
			return system ? '<span class="' + system.systemTypeClass + '">' + (system.name || system.systemTypeName) + '</span>' : undefined }
		).filter(function(x) { return x !== undefined; }).join(',');
	};
}