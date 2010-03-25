function Board(maxM,maxN,canvas,tiles){
	this.maxM = maxM;
	this.maxN = maxN;
	this.features = [];
	this.path = [];
	this.holes = [];
	this.tiles = tiles || {};
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	for (var m=0;m<=this.maxM;++m) this.holes[m] = [];
};
Board.prototype.inBounds = function(cell){
	var m=cell.m, n=cell.n;
	return m>=0 && m<=this.maxM && n>=0 && n<=(this.maxN-(m%2==0 ? 1 : 0));
}
Board.prototype.redraw = function(){
	var ctx = this.context, tiles=this.tiles;
	ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
	ctx.drawImage(tiles.border,0,0);
	for ( var i=0,len=this.features.length; i<len; ++i ){
		var cell = this.features[i];
		ctx.drawImage( tiles[cell.tile], cell.x-HEX_WIDTH/2-.5, cell.y-HEX_HEIGHT/2 );
	}
	for ( var i=0,len=this.path.length; i<len; ++i ){
		var cell = this.path[i];
		ctx.drawImage( tiles[cell.tile], cell.x-HEX_WIDTH/2-.5, cell.y-HEX_HEIGHT/2 );
	} 
	ctx.drawImage( tiles.hexgrid, 0, 0 );
}

Board.prototype.shortestPath = function(a,b){
	var distance = [];
	var previous = [];
	for (var m=0;m<=this.maxM;++m){
		distance[m]=[];
		previous[m]=[];
	}
	distance[a.m] = [];
	distance[b.m] = [];
	distance[a.m][a.n] = 0;
	a.__distance = 0;
	var cellsByDistance = [a];
	var spot;
	while (cell=cellsByDistance.shift()){
		if (cell.sameAs(b)){
			var path = [];
			while (cell.__previous){
				path.unshift( cell );
				cell = cell.__previous;
			}
			return path;
		}else{
			var neighbors = [
				cell.offset(1,0,0),
				cell.offset(-1,0,0),
				cell.offset(0,1,0),
				cell.offset(0,-1,0),
				cell.offset(0,0,1),
				cell.offset(0,0,-1)
			];
			for (var i=0;i<6;++i){
				var neighbor = neighbors[i];
				var m = neighbor.m, n=neighbor.n;
				if (this.holes[m] && this.holes[m][n]) continue;
				if (neighbor.sameAs(b) || this.inBounds(neighbor)){
					var alt = cell.__distance + 1;
					var existing_distance = distance[m][n];
					if (!existing_distance || alt<existing_distance){
						neighbor.__distance = distance[m][n] = alt;
						var indexToInsert=0,tmp;
						while ((tmp=cellsByDistance[indexToInsert]) && tmp.__distance<alt ) indexToInsert++;
						cellsByDistance.splice(indexToInsert,0,neighbor);
						neighbor.__previous = cell;
					}
				}
			}
		}
	}
	return false;
}
