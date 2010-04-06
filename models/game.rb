class Game < Sequel::Model
	many_to_one :level, eager: [:waves]
	many_to_one :offense,       class: :User, key: :offense_user_id
	many_to_one :defense,       class: :User, key: :defense_user_id
	many_to_one :creator,       class: :User, key: :created_by
	one_to_many :offense_moves, class: :GameOffenseMove, order: :wave_number, eager: [:paths]
	one_to_many :defense_moves, class: :GameDefenseMove, order: :wave_number
	def to_js( side )
		hash = values.slice( :id, :name, :lives )
		hash[:oMoves] = offense_moves.map{ |m|
			{
				type: m.type.name,
				path: m.paths.to_a.map{ |s|
					[s.m,s.n]
				}
			}
		}
		hash[:dMoves] = defense_moves.map{ |m| { type: m.type.name, at: [ m.m, m.n ] } }
		hash.to_js		
	end
end

class GameOffenseMove < Sequel::Model
	many_to_one :game
	one_to_many :paths, class: :GameOffensePath, order: :step_number, key: :move_id
	many_to_one :type,  class: :RunnerType, key: :runner_type_id
end

class GameOffensePath < Sequel::Model
	many_to_one :offense_move, class: :GameOffenseMove, key: :move_id
end

class GameDefenseMove < Sequel::Model
	many_to_one :game
	many_to_one :type,  class: :TowerType, key: :tower_type_id
end