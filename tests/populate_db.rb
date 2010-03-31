require 'sequel'
$: << '..'
require 'models/init'

noob = RunnerType.create id:1, name:"noob"
hole = TowerType.create  id:1, name:"hole"

gk = User.create email:'!@phrogz.net', nick:'Phrogz', passhash:'no', cookey:'abcdefg'
hh = User.create email:'hhausman@gmail.com', nick:'hrrld', passhash:'in'
board = Board.create name:'Standard', background:'standard-back.png', overlay:'standard-over.png', thumbnail:'standard-thumb.png'
board.creator = gk
board.save
0.step(22,2){ |i| board.add_ignore m:i, n:15 }

level = board.add_level name:'Ole Blanky', lives:5, thumbnail:'standard-blanky-thumb.png'
level.add_start  m:-1, n:15
level.add_finish m:23, n:2
level.add_wave wave_number:0, runners:2, towers:3, duration:10
level.add_wave wave_number:1, runners:1, towers:4, duration:10
level.add_wave wave_number:2, runners:4, towers:3, duration:10
level.add_wave wave_number:3, runners:1, towers:4
level.creator = gk
level.save

game = level.add_game( name:"Test", offense_key:"letmein", defense_key:"stopit" )
game.offense = gk
game.save

GameDefenseMove.unrestrict_primary_key
GameOffenseMove.unrestrict_primary_key
GameOffensePath.unrestrict_primary_key
[
	[
		[[-1,5],[0,4],[0,3],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[10,1],[10,2],[10,3],[10,4],[10,5],[11,5],[12,4],[13,4],[14,3],[14,2],[14,1],[15,1],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],[21,0],[22,0],[22,1],[23,2]],
		[[-1,5],[0,5],[1,6],[2,6],[3,7],[4,7],[5,8],[6,8],[7,9],[8,9],[9,10],[10,10],[11,11],[12,11],[13,12],[14,12],[15,13],[16,13],[17,14],[18,14],[19,15],[19,14],[18,13],[17,13],[16,12],[15,12],[14,11],[13,11],[12,10],[11,10],[10,9],[9,9],[10,8],[11,8],[12,7],[13,7],[14,6],[15,6],[15,5],[15,4],[16,3],[16,2],[17,3],[18,3],[19,3],[20,3],[21,3],[22,3],[22,2],[23,2]]
	],
	[
		[[-1,5],[0,4],[1,5],[2,4],[3,5],[4,5],[5,5],[6,5],[7,5],[8,4],[9,4],[10,4],[11,5],[12,5],[13,6],[14,5],[15,5],[16,4],[17,4],[18,3],[18,2],[18,1],[19,1],[19,0],[20,0],[21,0],[22,0],[22,1],[23,2]]
	]
].each.with_index { |paths,wave|
	paths.each{ |path|
		move = game.add_offense_move wave_number:wave, runner_type_id:noob.id
		path.each.with_index{ |(m,n),i|
			move.add_path( m:m, n:n, step_number:i )
		}
	}	
}

[
	[[22,1],[0,5],[21,2]],
	[[0,3],[1,4],[2,4],[2,5]]
].each.with_index{ |holes,wave|
	holes.each{ |m,n|
		game.add_defense_move wave_number:wave, m:m, n:n, tower_type_id:hole.id
	}
}
GameDefenseMove.restrict_primary_key
GameOffenseMove.restrict_primary_key
GameOffensePath.restrict_primary_key
