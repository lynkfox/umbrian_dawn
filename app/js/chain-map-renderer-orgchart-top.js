const ChainMapRendererOrgchartTop = function(owner) {
	ChainMapRendererBase.apply(this, arguments);
	
	const GRID_SIZE = { x: 60, y: 70 };
	
	this.initialRads = function(minArc) { return minArc * 0.5; }
	
	this.setPosition = function(node, ci, rad_centre) {
		node.position = {
			x: rad_centre * GRID_SIZE.x * options.chain.nodeSpacing.x,
			y: ci * GRID_SIZE.y * options.chain.nodeSpacing.y
		};
	}
	
	this.drawConnection = function(ctx, node) {
		const ave_y = 0.5 * (node.position.y + node.parent.position.y);
		const cp1 = { x: node.parent.position.x, y: node.parent.position.y };
		const cp2 = { x: node.position.x, y: node.parent.position.y };
		
		ctx.bezierCurveTo(cp2.x, cp2.y, cp1.x, cp1.y, node.parent.position.x, node.parent.position.y);
	}
	
	this.drawGridlines = function(ctx, ci) {
		ctx.beginPath();
		// todo
		
		ctx.strokeStyle = propertyFromCssClass('grid-default', 'color');
		ctx.stroke();		
	}		
};

ChainMapRendererOrgchartTop.prototype = new ChainMapRendererBase();