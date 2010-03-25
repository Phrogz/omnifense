function Cell(a,b,c,n){
	var nCache=Cell.n, xCache=Cell.x, yCache=Cell.y;
	if (c){ a+=c; b-=c }
	this.a = a;
	this.b = b;
	this.m = a;
	if (n!=null){
		if (!nCache[a]) nCache[a]={};
		this.n = nCache[a][b] = n;
	}else{
		if (!nCache[a]) nCache[a]={};
		this.n = (nCache[a][b]==null) ? (nCache[a][b]=b+Math.ceil(a/2)) : nCache[a][b];
	}
	if (xCache[a]==null){
		this.x = xCache[a] = COL_OFFSET+(a+1)*COL_WIDTH;
	}else{
		this.x = xCache[a];
	}
	if (!yCache[a]) yCache[a]={};
	if (yCache[a][b]==null){
		this.y = yCache[a][b] = CEL_OFFSET+(a+2*b+1)*CEL_HEIGHT/2;
	}else{
		this.y = yCache[a][b];
	}
}

// Premature optimization: cache values
Cell.b = {}; //indexed by [m][n]
Cell.n = {}; //indexed by [a][b]
Cell.x = {}; //indexed by [a]
Cell.y = {}; //indexed by [a][b]

Cell.prototype.offset = function(a,b,c){
	return new Cell( this.a+a, this.b+b, c );
}
Cell.prototype.sameAs = function(otherCell){
	return this.a==otherCell.a && this.b==otherCell.b;
}
Cell.prototype.toString = function(){
	return "<ab:"+this.a+","+this.b+"; mn:"+this.m+","+this.n+">"
}

Cell.fromXY = function(x,y){
	var a = Math.round( ( x - COL_OFFSET - COL_WIDTH ) / COL_WIDTH );
	var b = Math.round( ( y - CEL_OFFSET - (a+1)*CEL_HEIGHT/2 ) / CEL_HEIGHT );
	return new Cell(a,b);
}
Cell.fromMN = function(m,n){
	if (!Cell.b[m]) Cell.b[m]={};
	var b = Cell.b[m][n]==null ? (Cell.b[m][n]=n-Math.ceil(m/2)) : Cell.b[m][n];
	return new Cell(m,b,0,n);
}
