const wormholeAnalysis = new function() {
	/** Finds the ID for a target system or system type for the given system name text and wormhole type.
	@param systemText The name of a system, or a system class from appData.genericSystemTypes, e.g. 'Low-Sec'
	@param wormholeType The type text of a wormhole e.g. 'U210'
	@return An ID - either a systemID (31001031), a system type ID (7) or null if there isn't enough information */
	this.targetSystemID = function(systemText, wormholeType) {
		const lookupText = systemText || (appData.wormholes[(wormholeType + '').toUpperCase()] || {}).leadsTo;
		if(!lookupText) { return null; }
		if (Object.index(appData.systems, "name", lookupText, true)) {
			// Leads To is a normal EVE system, so use the sytem ID
			return Object.index(appData.systems, "name", lookupText, true)
		} else if (wormholeType && appData.wormholes[wormholeType.toUpperCase()]) {
			// Leads To can be determined by the wormhole type, so lets use what we know it leads to
			if (appData.genericSystemTypes.findIndex((item) => lookupText.replace(' ', '-').toLowerCase() === item.toLowerCase()) > -1) {
				return appData.genericSystemTypes.findIndex((item) => lookupText.replace(' ', '-').toLowerCase() === item.toLowerCase());
			}
		} else if (appData.genericSystemTypes.findIndex((item) => lookupText.toLowerCase() === item.toLowerCase()) !== -1) {
			// Leads To is one of the valid types we allow, so use of of those indexes as reference
			return appData.genericSystemTypes.findIndex((item) => systemText.toLowerCase() === item.toLowerCase());
		} else { return null; }
	};
	
	/** Get all the eligible wormhole types for this connection.
	If both systems are known (e.g. C3 to C2) then only wormhole types matching that specific connection will be returned. If either side is unknown then all connections to/from the known side are listed, which will be quite large. If both are unknown then return null (as it could be any wormhole).
	@param sourceID The system ID, type ID (into genericSystemType) or chain format string (e.g. 2|1232) for the source system
	@param targetID As above for the target system
	@param dataSource A source set of wormhole types to evaluate (defaults to appData.wormholes)
	@return An object of the form { from: [...], to: [...] } where each list is the wormhole types (from appData.wormholes) eligible for that direction */
	this.eligibleWormholeTypes = function(sourceDef, targetDef, dataSource) {
		const coerce = function(def) { return def === undefined || def === null || def.genericSystemType ? def : systemAnalysis.analyse(def); };
		const source = coerce(sourceDef), target = coerce(targetDef);
		
		if(!source && !target) { return null; }
		
		const from = [], to = [];
		const matches = function(possibleSystems, exclusions, system) {
			if(typeof possibleSystems === 'string') { possibleSystems = [possibleSystems]; }
			return (!system) || (
				((!possibleSystems) || (possibleSystems.indexOf(system.name) >= 0 || possibleSystems.indexOf(system.genericSystemType) >= 0)) && 
				((!exclusions) || exclusions.indexOf(system.genericSystemType) < 0)	// no exclusion
			);
		}
		Object.entries(dataSource || appData.wormholes).forEach(function(e) {
			const wt = e[1], key = e[0];
			if(matches(wt.from, wt.notFrom, source) && matches(wt.leadsTo, wt.notLeadsTo, target)) { from.push(Object.assign( { key: key}, wt)); }
			if(matches(wt.from, wt.notFrom, target) && matches(wt.leadsTo, wt.notLeadsTo, source)) { to.push(Object.assign( { key: key}, wt)); }
		});
		return { from: from, to: to };
	}
}