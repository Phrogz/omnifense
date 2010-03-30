class User < Sequel::Model
	one_to_many :boards_created, key: :created_by,      class: :Board
	one_to_many :levels_created, key: :created_by,      class: :Level
	one_to_many :games_created,  key: :created_by,      class: :Game
	one_to_many :offense_games,  key: :offense_user_id, class: :Game, eager:[:defense]
	one_to_many :defense_games,  key: :defense_user_id, class: :Game, eager:[:offense]
	
	def games(side=:offense,open=false)
		case side
			when :offense
				if open
					offense_games_dataset.filter(defense_user_id:nil).all
				else
					offense_games_dataset.filter(~{defense_user_id:nil}).all
				end
			when :defense
				if open
					defense_games_dataset.filter(offense_user_id:nil).all
				else
					defense_games_dataset.filter(~{offense_user_id:nil}).all
				end
		end
	end
end