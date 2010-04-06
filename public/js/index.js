$(function(){
	$('form[action=play]').submit(function(e){
		e.stopImmediatePropagation();
		location.href = "/play/"+this.elements.game_id.value;
		return false;
	});
});