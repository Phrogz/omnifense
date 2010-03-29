class User < Sequel::Model
	one_to_many :boards_created, key: :created_by,      class: :Board
	one_to_many :levels_created, key: :created_by,      class: :Level
	one_to_many :games_created,  key: :created_by,      class: :Game
	one_to_many :offense_games,  key: :offense_user_id, class: :Game
	one_to_many :defense_games,  key: :defense_user_id, class: :Game
end