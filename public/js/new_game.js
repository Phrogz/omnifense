$(function(){
	var lvSelect = $('#level');
	$('#board').change(function(){
		lvSelect[0].options.length=0;
		var levels = $levelsByBoard[this.value];
		for (var i=0,len=levels.length;i<len;++i){
			var lv  = levels[i];
			var val = lv.id;
			var txt = lv.name+' ('+lv.lives+' '+( lv.lives==1 ? 'life' : 'lives' )+')'
			lvSelect.append( new Option(txt,val) );
		}
	});
});