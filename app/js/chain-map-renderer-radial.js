const ChainMapRendererRadial = function(owner) {
	/** Is this renderer ready to accept draw calls? */
	this.ready = function() { return !this.drawing; }
	
	/** Switch to this renderer. The renderer can be in a blank state; draw() will be called after */
	this.switchTo = function() {
		if(!document.getElementById('map-container')) {
			const newDiv = document.createElement('div');
			newDiv.id = 'map-container';
			newDiv.className = 'radial-map';
			document.getElementById('chainMap').appendChild(newDiv);
		}
		this.container = document.getElementById('map-container');
		this.container.style.display = '';
	}
	
	/** Switch away from this renderer. All node divs should be removed from the DOM */
	this.switchFrom = function() {
		const div = document.getElementById('map-container');
		if(div) { div.parentNode.removeChild(div); }
		this.container = null;
	}
	
	this.collapse = function(systemID, collapse) {
		if(collapse) { this.mapData.collapsed.push(systemID); }
		else {  this.mapData.collapsed = this.mapData.collapsed.filter(x => x != systemID); }
		owner.updateCollapsed(this.mapData.collapsed);
		drawInner(this.mapData.map, this.mapData.lines, this.mapData.collapsed);
	}
	
	/** Redraw the map, based on the given node set, line overrides and list of collapsed systems */
	this.draw = function(map, lines, collapsed) {
		this.drawing = true;
		this.mapData = {map: map, lines: lines, collapsed: collapsed};
		
		// Clear the map for a new one
		//this.switchFrom(); this.switchTo();

		try { drawInner(map, lines, collapsed); }
		finally { this.drawing = false; }
	}
	
	const CIRCLE_SIZE = { x: 70, y: 60, first_ring_delta: 0.3,
		ringX: function(ci) { return ci == 0 ? 0 : (ci + this.first_ring_delta) * this.x},
		ringY: function(ci) { return ci == 0 ? 0 : (ci + this.first_ring_delta) * this.y},
	 };

	const _this = this;
	const drawInner = function(map, lines, collapsed) {
		const maps = [];
		const nodesById = {};
		
		// First pass: arrange nodes into rings
		for(var ri = 0; ri < map.rows.length; ri++) {
			const item = map.rows[ri];
			const inNode = item.c[0], id = inNode.v, parent = item.c[1].v;
			
			const mapNode = { id: id, children: [], systemID: inNode.systemID, minArc: 0 };
			
			if(parent == null) {
				const newMap =  { circles: [ { arc: 0, nodes: [ mapNode ] } ] };
				mapNode.map = newMap;
				mapNode.circle = 0;
				maps.push(newMap);
			} else {
				const parentNode = nodesById[parent];
				if(!parentNode) { throw 'Parent id ' + parent + ' not on map yet'; }
				parentNode.children.push(mapNode);
				mapNode.parent = parentNode;
				mapNode.connection = lines.filter(function(l) { return l[0] == id; })[0] || [id, parent, [], '?'];
				mapNode.styles = ['connection'].concat(mapNode.connection[2]);
				mapNode.map = parentNode.map;
				mapNode.circle = parentNode.circle + 1;
				if(mapNode.map.circles.length <= mapNode.circle) {
					mapNode.map.circles.push({ arc: 0, nodes:[mapNode] });
				} else { mapNode.map.circles[mapNode.circle].nodes.push(mapNode); }
			}
			nodesById[id] = mapNode;
			mapNode.markup = inNode.f;
		}

		// Second pass - for each map, find the allocation of arc needed for each node
		for(var mi = 0; mi < maps.length; mi++) {
			const map = maps[mi];
			for(var ci = map.circles.length - 1; ci >= 1; ci--) {	// don't need to calculate ring 0
				for(var ni = 0; ni < map.circles[ci].nodes.length; ni++) {
					const node = map.circles[ci].nodes[ni];
					node.minArc *= ci / (ci + 1.0);
					if(node.minArc < 1 || collapsed.indexOf(node.systemID * 1) >= 0) { node.minArc = 1; }
					node.parent.minArc += node.minArc;
					map.circles[ci].arc += node.minArc;
				}
			}
		}

		// Third pass - lay out each ring based on the arc values
		for(var mi = 0; mi < maps.length; mi++) {
			const map = maps[mi];
			var mapDiv = document.getElementById("map" + mi);
			if(!mapDiv) {
				mapDiv = document.createElement('div');
				mapDiv.id = "map" + mi;
				mapDiv.className = "map-chain-wrapper";
			}
			mapDiv.innerHTML = '<div class="map-outer-container"><div class="map-inner-container"><canvas class="map-drawing" id="map-canvas-' + mi + '"/></div></div>';
			const innerContainer = mapDiv.firstChild.firstChild;
			document.getElementById('map-container').appendChild(mapDiv);

			map.bounds = makeDivsForRing(innerContainer, 0, map.circles[0].nodes, 0, Math.PI * 2, collapsed);
			map.domNode = mapDiv;
			map.innerContainer = innerContainer;
		}

		// Fourth pass: update div and canvas bounds, and draw rings/links
		const CANVAS_SCALE = 1;
		for(var mi = 0; mi < maps.length; mi++) {
			const map = maps[mi];
			const finalPositions = {
				w: 200 + map.bounds.x[1] - map.bounds.x[0],
				h: 100 + map.bounds.y[1] - map.bounds.y[0],
				cx: 100 - map.bounds.x[0],
				cy: 50 - map.bounds.y[0]
			}
			
			// Fill the space available, if we didn't already
			if(maps.length == 1) {
				const parentWidth = -38 + _this.container.offsetWidth;	// 20px for map margins, 18 for scrollbar
				if(finalPositions.w < parentWidth) {
					finalPositions.cx += 0.5 * (parentWidth - finalPositions.w);
					finalPositions.w = parentWidth;
				}
			}			
			const parentHeight = document.getElementById('chainParent').offsetHeight;
			if(finalPositions.h < parentHeight) {
				finalPositions.cy += 0.5 * (parentHeight - finalPositions.h);
				finalPositions.h = parentHeight;
			}
			
			// If there's enough space to centre the top level node now, do it
			if(finalPositions.h >= 2 * (map.bounds.y[1] > -map.bounds.y[0] ? map.bounds.y[1] : -map.bounds.y[0])) {
				finalPositions.cy = finalPositions.h / 2;
			}
			if(finalPositions.w >= 2 * (map.bounds.x[1] > -map.bounds.x[0] ? map.bounds.x[1] : -map.bounds.x[0])) {
				finalPositions.cx = finalPositions.w / 2;
			}			
			map.domNode.style.width = finalPositions.w + 'px';
			map.domNode.style.height = finalPositions.h + 'px';
			const outerContainer = map.domNode.firstChild;
			outerContainer.style.left = finalPositions.cx + 'px';
			outerContainer.style.top = finalPositions.cy + 'px';
			const canvas = outerContainer.getElementsByTagName('canvas')[0];
			canvas.width = CANVAS_SCALE * finalPositions.w;
			canvas.style.width = finalPositions.w + 'px';
			canvas.height = CANVAS_SCALE * finalPositions.h;
			canvas.style.height = finalPositions.h + 'px';
			canvas.style.left = -finalPositions.cx + 'px';
			canvas.style.top = -finalPositions.cy + 'px';
			const ctx = canvas.getContext('2d');
			ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
			ctx.translate(finalPositions.cx, finalPositions.cy);
			
			for(var ci = map.bounds.maxCi; ci >= 1; ci--) {	// don't need to draw ring 0
				if(options.chain.gridlines) {
					ctx.beginPath();
					if(ctx.ellipse) {
						ctx.lineWidth = 0.5;
						ctx.setLineDash([]);
						ctx.ellipse(0, 0, CIRCLE_SIZE.ringX(ci), CIRCLE_SIZE.ringY(ci), 0, 0, Math.PI * 2);
					}
					ctx.strokeStyle = propertyFromCssClass('grid-default', 'color');
					ctx.stroke();		
				}
				if(ci >= map.circles.length) { continue; }
				
				ctx.save();
				for(var ni = 0; ni < map.circles[ci].nodes.length; ni++) {
					const node = map.circles[ci].nodes[ni];
					if(!node.position) { continue; }	// not drawn on map
					ctx.beginPath();
					ctx.moveTo(node.position.x, node.position.y);
					const cp1 = radToCartesian({ r: node.radPosition.r - 0.5, theta: (node.radPosition.theta + 2 * node.parent.radPosition.theta) / 3.0 });
					const cp2 = radToCartesian({ r: node.radPosition.r - 0.5, theta: (2 * node.radPosition.theta + node.parent.radPosition.theta) / 3.0 });
					
					if(ci > 1) {				
						ctx.bezierCurveTo(cp2.x, cp2.y, cp1.x, cp1.y, node.parent.position.x, node.parent.position.y);
					} else {
						ctx.lineTo(node.parent.position.x, node.parent.position.y);			
					}
					const dist2 = (node.position.y - node.parent.position);
					
					// draw aura first
					ctx.save();
					ctx.lineWidth = 1;
					const auraColor = propertyFromCssClass(node.styles, 'color');
					ctx.shadowBlur = 11;
					ctx.shadowColor = auraColor;
					ctx.strokeStyle = 'black';
					for(let ai = 0; ai < 8; ai++)
						ctx.stroke();
					ctx.restore();
					
					ctx.lineWidth = parseInt(propertyFromCssClass(node.styles, 'border-width')) || 2;
					ctx.strokeStyle = propertyFromCssClass(node.styles, 'border-top-color');
					ctx.setLineDash ({ dashed: [5, 3] }[propertyFromCssClass(node.styles, 'border-top-style')] || []);
					ctx.stroke();
				}
				ctx.restore();
			}	
		}
		
		// Remove any maps which aren't in use any more
		for(var mi = maps.length; ; mi++) {
			const div = document.getElementById('map' + mi);
			if(div) { div.parentNode.removeChild(div); }
			else { break; }
		}
	}
	
	function makeDivsForRing(innerContainer, ci, nodes, minRad, maxRad, collapsed) {
		const bounds = { x: [0, 0], y: [0, 0], maxCi: ci };
		if(!nodes.length) { return bounds; }
		const parentCollapsed = collapsed.indexOf(1 * (nodes[0].parent || {}).systemID) >= 0;
		const max_nodes_per_rad = 1.4;
		if(ci > 0 && !parentCollapsed) {
			var skipped = 0;
			while(++skipped < 2 && nodes.length > max_nodes_per_rad * ci * (maxRad - minRad)) { ci++; }
		}
		const totalArc = parentCollapsed ? nodes.length : nodes.reduce(function(acc, x) { return acc + x.minArc; }, 0);
		const rads_per_arc = (maxRad - minRad) / totalArc;
		var rad_offset = minRad;
		var alignment_delta = 0;
		
		for(var ni = 0; ni < nodes.length; ni++) {
			const node = nodes[ni];	
			
			// Make the node
			const frag = document.createRange().createContextualFragment('<div class="node-wrapper">' + node.markup + '</div>');
			node.domNode = frag.firstChild;
			innerContainer.appendChild(node.domNode);
			const systemID = 1 * node.systemID;
			$(node.domNode).dblclick(() => _this.collapse(systemID, collapsed.indexOf(systemID) < 0));
			
			// Position the node
			const dr = (parentCollapsed ? 1 : node.minArc) * rads_per_arc;
			const rad_centre = rad_offset + (dr / 2);
			
			if(ci == 1 && ni == 0) { // First node on first ring should be axis aligned
				alignment_delta -= rad_centre;
			}
			
			node.radPosition = { r: ci, theta: rad_centre + alignment_delta };
			node.position = radToCartesian(node.radPosition);
			
			if(node.position.x < bounds.x[0]) { bounds.x[0] = node.position.x; }
			if(node.position.x > bounds.x[1]) { bounds.x[1] = node.position.x; }
			if(node.position.y < bounds.y[0]) { bounds.y[0] = node.position.y; }
			if(node.position.y > bounds.y[1]) { bounds.y[1] = node.position.y; }
			
			node.domNode.style.left = node.position.x + 'px';
			node.domNode.style.top = node.position.y + 'px';
			
			if(parentCollapsed) {
				node.domNode.style.display = 'none';
			} else {				
				// Do the segment of the next circle
				const excess = (ci > 0 && dr > node.minArc * ci) ? dr - node.minArc * ci : 0;
				if(node.children.length) {
					const nextBounds = makeDivsForRing(innerContainer, ci + 1, node.children, rad_offset + (0.5 * excess) + alignment_delta, rad_offset - (0.5 * excess) + alignment_delta + dr, collapsed);
					if(nextBounds.x[0] < bounds.x[0]) { bounds.x[0] = nextBounds.x[0]; }
					if(nextBounds.x[1] > bounds.x[1]) { bounds.x[1] = nextBounds.x[1]; }
					if(nextBounds.y[0] < bounds.y[0]) { bounds.y[0] = nextBounds.y[0]; }
					if(nextBounds.y[1] > bounds.y[1]) { bounds.y[1] = nextBounds.y[1]; }
					if(nextBounds.maxCi > bounds.maxCi) { bounds.maxCi = nextBounds.maxCi; }
				}
			}
			rad_offset += dr;
		}
		
		return bounds;
	}

	function radToCartesian(rad) {
		return { 
			x: CIRCLE_SIZE.ringX(rad.r) * Math.sin(rad.theta), 
			y: CIRCLE_SIZE.ringY(rad.r) * Math.cos(rad.theta)
		};

	}

	/** https://stackoverflow.com/questions/40978050 */
	function propertyFromCssClass(className, property) {
		if(Array.isArray(className)) { className = className.join(' '); }
		var elem = document.getElementById('temp-div-' + className);
		if(!elem) {
		  elem = document.createElement("div");
		  elem.id = 'temp-div-' + className;
		  elem.style.cssText = "position:fixed;left:-100px;top:-100px;width:1px;height:1px;";
		  elem.className = className + ' temp';
		  document.body.appendChild(elem);  // required in some browsers
		  }
	  const prop = getComputedStyle(elem).getPropertyValue(property);
	  //document.body.removeChild(tmp);
	  return prop;
	}	
};