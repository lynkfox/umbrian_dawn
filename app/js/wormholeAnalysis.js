const wormholeAnalysis = new function() {
	/** Finds the ID for a target system or system type for the given system name text and wormhole type.
	@param systemText The name of a system, or a system class from tripwire.aSigSystems, e.g. 'Low-Sec'
	@param wormholeType The type text of a wormhole e.g. 'U210'
	@return An ID - either a systemID (31001031), a system type ID (7) or null if there isn't enough information */
	this.targetSystemID = function(systemText, wormholeType) {
		if (Object.index(tripwire.systems, "name", systemText, true)) {
			// Leads To is a normal EVE system, so use the sytem ID
			return Object.index(tripwire.systems, "name", systemText, true)
		} else if (appData.wormholes[wormholeType.toUpperCase()]) {
			// Leads To can be determined by the wormhole type, so lets use what we know it leads to
			if (tripwire.aSigSystems.findIndex((item) => appData.wormholes[wormholeType.toUpperCase()].leadsTo.replace(' ', '-').toLowerCase() === item.toLowerCase()) > -1) {
				return tripwire.aSigSystems.findIndex((item) => appData.wormholes[wormholeType.toUpperCase()].leadsTo.replace(' ', '-').toLowerCase() === item.toLowerCase());
			}
		} else if (tripwire.aSigSystems.findIndex((item) => systemText.toLowerCase() === item.toLowerCase()) !== -1) {
			// Leads To is one of the valid types we allow, so use of of those indexes as reference
			return tripwire.aSigSystems.findIndex((item) => systemText.toLowerCase() === item.toLowerCase());
		} else { return null; }
	}

}