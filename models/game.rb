class Game < Sequel::Model
	many_to_one :level, eager: [:waves]
	many_to_one :offense,       class: :User, key: :offense_user_id
	many_to_one :defense,       class: :User, key: :defense_user_id
	one_to_many :offense_moves, class: :GameOffenseMove, order: :wave_number, eager: [:paths]
	one_to_many :defense_moves, class: :GameDefenseMove, order: :wave_number
	def to_offense_json
		{
			id:          pk,
			name:        name,
			offense_key: offense_key,
			level:       level.to_json,
			offense:     offense_moves.map{ },
			defense:     defense_moves.map{ }
		}.to_json
	end
	def to_defense_json
		{
			id:          pk,
			name:        name,
			defense_key: defense_key,
			level:       level.to_json,
			offense:     offense_moves.map{ },
			defense:     defense_moves.map{ }
		}.to_json
	end
end

class GameOffenseMove < Sequel::Model
	many_to_one :game
	one_to_many :paths, class: :GameOffensePath, order: :step_number, key: :move_id
	many_to_one :runner_type,  class: :RunnerType
end

class GameOffensePath < Sequel::Model
	many_to_one :offense_move, class: :GameOffenseMove, key: :move_id
end

class GameDefenseMove < Sequel::Model
	many_to_one :game
	many_to_one :tower_type,  class: :RunnerType
end