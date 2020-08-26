const systemAnalysis = new function() {
	const mutators = [];
	this.addMutator = function(m) { mutators.push(m); }
	
	/** Extract attributes of the system, and allow mutators to add/modify them.
		Optionally, pass in a system object */
	this.analyse = function(systemID, system) {
		if(!system) { system = tripwire.systems[systemID]; }
		if(!system) { return system; }
		const r = Object.assign({}, system);
		
		// Defaults or saved original values
		r.baseSecurity = 1 * system.security;
		r.pathSymbol = '■';
		r.systemTypeModifiers = [];		
		
		mutators.forEach(function(m) { m.mutate(r, systemID); });
		
		// Calculated final values
		r.systemTypeClass = r.class ? 'wh class-' + r.class :
			r.security >= 0.45 ? 'hisec' :
			r.security > 0.0 ? 'lowsec' :
			r.security <= 0.0 ? 'nullsec' :
			'unknown';
		r.systemTypeName = r.class ? 'C' + r.class :
			r.baseSecurity >= 0.45 ? 'HS' :
			r.baseSecurity > 0.0 ? 'LS' :
			r.baseSecurity <= 0.0 ? 'NS' :
			' ';
			
		return r;
	};

}