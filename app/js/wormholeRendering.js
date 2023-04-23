/** Functions for rendering things relating to wormholes */
const wormholeRendering = new function() { 
	this.renderWormholeType = function(type) {
		return '<b>' + type.key + '</b>' +
			(type.jump ? ' - Jump: ' + (type.jump / 1e6) + 'kt' : '')
			;
	};
	
}