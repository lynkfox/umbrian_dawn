wormholeAnalysis = new function() {
	/** Finds the ID for a target system or system type for the given system name text and wormhole type.
	@param systemText The name of a system, or a system class from appData.genericSystemTypes, e.g. 'Low-Sec'
	@param wormholeType The type text of a wormhole e.g. 'U210'
	@return An ID - either a systemID (31001031), a system type ID (7) or null if there isn't enough information */
	this.targetSystemID = function(systemText, wormholeType) {
		if (systemText && Object.index(appData.systems, "name", systemText, true)) {
			// Leads To is a normal EVE system, so use the sytem ID
			return Object.index(appData.systems, "name", systemText, true)
		} else if (wormholeType && appData.wormholes[wormholeType.toUpperCase()]) {
			// Leads To can be determined by the wormhole type, so lets use what we know it leads to
			if (appData.genericSystemTypes.findIndex((item) => appData.wormholes[wormholeType.toUpperCase()].leadsTo.replace(' ', '-').toLowerCase() === item.toLowerCase()) > -1) {
				return appData.genericSystemTypes.findIndex((item) => appData.wormholes[wormholeType.toUpperCase()].leadsTo.replace(' ', '-').toLowerCase() === item.toLowerCase());
			}
		} else if (systemText && appData.genericSystemTypes.findIndex((item) => systemText.toLowerCase() === item.toLowerCase()) !== -1) {
			// Leads To is one of the valid types we allow, so use of of those indexes as reference
			return appData.genericSystemTypes.findIndex((item) => systemText.toLowerCase() === item.toLowerCase());
		} else { return null; }
	}

}