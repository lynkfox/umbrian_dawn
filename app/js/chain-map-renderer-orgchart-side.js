const ChainMapRendererOrgchartSide = function(owner) {
	ChainMapRendererBase.apply(this, arguments);
	
	const GRID_SIZE = { x: 90, y: 50 };
	
	this.initialRads = function(minArc) { return minArc * 0.5; }
	
	this.setPosition = function(node, ci, rad_centre) {
		node.position = {
			x: ci * GRID_SIZE.x * options.chain.nodeSpacing.x,
			y: rad_centre * GRID_SIZE.y * options.chain.nodeSpacing.y
		};
	}
	
	this.drawConnection = function(ctx, node) {
		const ave_x = 0.5 * (node.position.x + node.parent.position.x);
		const cp1 = { x: node.parent.position.x, y: node.parent.position.y };
		const cp2 = { x: node.parent.position.x, y: node.position.y };
		
		ctx.bezierCurveTo(cp2.x, cp2.y, cp1.x, cp1.y, node.parent.position.x, node.parent.position.y);
	}
	
	this.drawGridlines = function(ctx, ci) {
		ctx.beginPath();
		// todo
		
		ctx.strokeStyle = propertyFromCssClass('grid-default', 'color');
		ctx.stroke();		
	}		
};

ChainMapRendererOrgchartSide.prototype = new ChainMapRendererBase();