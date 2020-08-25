const systemAnalysis = new function() {
	const mutators = [];
	this.addMutator = function(m) { mutators.push(m); }
	
	/** Extract attributes of the system, and allow mutators to add/modify them. */
	this.analyse = function(systemID) {
		const system = tripwire.systems[systemID];
		if(!system) { return system; }
		const r = Object.assign({}, system);
		
		// Defaults or saved original values
		r.baseSecurity = system.security;
		r.pathSymbol = '■';
		
		mutators.forEach(function(m) { m.mutate(r, systemID); });
		return r;
	};

}