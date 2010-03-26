function Board(maxM,maxN,canvas,imgs){
	this.maxM = maxM;
	this.maxN = maxN;
	this.path = null;
	this.imgs = imgs || {};
	this.canvas   = canvas;
	this.context  = canvas.getContext('2d');
	this.tileList = [];
	this.overlays = [];
	this.tiles = [];
	for (var m=0;m<=this.maxM;++m) this.tiles[m] = [];
};

Board.prototype.startAt = function(a,b){
	this.start = this.placeTile(new Cell(a,b),'start',true);
}

Board.prototype.finishAt = function(a,b){
	this.finish = this.placeTile(new Cell(a,b),'finish',true);
}

Board.prototype.placeTile = function(cell,type,allowOutOfBounds){
	if (!allowOutOfBounds && !this.inBounds(cell)) return;
	if (!this.tiles[cell.m]) this.tiles[cell.m] = [];
	if (this.tiles[cell.m][cell.n]) return;
	this.tiles[cell.m][cell.n] = cell;
	this.tileList.push(cell);
	if (type) cell.type = type;
	this.redraw();
	return cell;
}

Board.prototype.inBounds = function(cell){
	var m=cell.m, n=cell.n;
	return m>=0 && m<=this.maxM && n>=0 && n<=(this.maxN-(m%2==0 ? 1 : 0));
}

Board.prototype.tileOpen = function(cell){
	return !this.tiles[cell.m] || !this.tiles[cell.m][cell.n];
}

Board.prototype.redraw = function(){
	var ctx = this.context;
	ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
	ctx.drawImage(this.imgs.border,0,0);
	for (var i=0,len=this.tileList.length; i<len; ++i ) this.drawTile(this.tileList[i]);
	for (var i=0,len=this.overlays.length; i<len; ++i ) this.drawTile(this.overlays[i]);

	if (this.path && this.path.length>1){
		ctx.strokeStyle='rgba(0,0,0,0.5)';
		ctx.beginPath();
		ctx.moveTo(this.path[0].x,this.path[0].y);
		for (var i=1,len=this.path.length;i<len;++i) ctx.lineTo(this.path[i].x,this.path[i].y);
		ctx.stroke();
		
		// Dots on the bends
		ctx.fillStyle='rgba(255,255,255,0.9)';
		ctx.strokeStyle='rgba(0,0,0,0.9)';
		for (var i=0,len=this.path.length;i<len;++i){
			var cell=this.path[i];
			ctx.beginPath();
			ctx.arc(cell.x,cell.y,7,0,Math.PI*2,true);
			ctx.fill();
			ctx.stroke();
		}
	}

	ctx.drawImage( this.imgs.hexgrid, 0, 0 );
}
Board.prototype.drawTile = function( cell ){
	if (cell) this.context.drawImage( this.imgs[cell.type], cell.x-HEX_WIDTH/2-.5, cell.y-HEX_HEIGHT/2 );
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
				if (this.tiles[m] && this.tiles[m][n] && !neighbor.sameAs(b)) continue;
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
	console.log("No path from %s to %s",a+"",b+"");
	return false;
}
