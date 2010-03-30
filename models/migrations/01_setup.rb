Class.new Sequel::Migration do
	def up
		create_table :boards do
			primary_key :id
			String      :name, null: false, unique: true
			String      :orientation, null: false, default: "vertical"
			Integer     :m, null: false, default: 22
			Integer     :n, null: false, default: 15
			Integer     :width,  null: false, default: 1024
			Integer     :height, null: false, default: 768
			Float       :col_offset,  null: false, default: 13.27
			Float       :col_spacing, null: false, default: 41.567
			Float       :row_offset,  null: false, default: 24
			Float       :row_spacing, null: false, default: 48
			Float       :tile_width,  null: false, default: 55
			Float       :tile_height, null: false, default: 48
			String      :background
			String      :overlay
			DateTime    :created_on, default: "current_timestamp".lit
			foreign_key :created_by, :users
		end
		create_table :board_ignores do
			foreign_key :board_id, :boards, null: false
			Integer     :m, null: false
			Integer     :n, null: false
			primary_key :board_id, :m, :n
		end
		create_table :levels do
			primary_key :id
			foreign_key :board_id, :boards, null: false
			String      :name, null: false, unique: true
			Integer     :lives, null: false
			DateTime    :created_on, default: "current_timestamp".lit
			foreign_key :created_by, :users
		end
		create_table :level_starts do
			foreign_key :level_id, :levels, null: false
			Integer     :m, null: false
			Integer     :n, null: false
			primary_key :level_id, :m, :n
		end
		create_table :level_finishes do
			foreign_key :level_id, :levels, null: false
			Integer     :m, null: false
			Integer     :n, null: false
			primary_key :level_id, :m, :n
		end
		create_table :level_features do
			foreign_key :level_id, :levels, null: false
			Integer     :m, null: false
			Integer     :n, null: false
			foreign_key :feature_type_id, :feature_types, null: false
			primary_key :level_id, :m, :n
		end
		create_table :level_waves do
			foreign_key :level_id, :levels, null: false
			Integer     :wave_number, null: false
			Integer     :runners,     null: false
			Integer     :towers,      null: false
			Integer     :duration
			primary_key :level_id, :wave_number
		end
		create_table :users do
			primary_key :id
			String      :email,    unique: true, null: false
			String      :nick,     unique: true
			String      :passhash, null: false
			String      :cookey
		end
		create_table :games do
			primary_key :id
			foreign_key :level_id, :levels, null: false
			foreign_key :offense_user_id, :users
			foreign_key :defense_user_id, :users
			String      :name
			String      :offense_key
			String      :defense_key
			DateTime    :created_on, default: "current_timestamp".lit
			foreign_key :created_by, :users
		end
		create_table :game_offense_moves do
			primary_key :id
			foreign_key :game_id, :games, null: false
			Integer     :wave_number, null: false
			foreign_key :runner_type_id, :runner_types, null: false
			DateTime    :created_on, default: "current_timestamp".lit
		end
		create_table :game_offense_paths do
			foreign_key :move_id, :game_offense_moves, null: false
			Integer     :step_number, null: false
			Integer     :m, null: false
			Integer     :n, null: false
			primary_key :move_id, :step_number
		end
		create_table :game_defense_moves do
			foreign_key :game_id, :games, null: false
			Integer     :wave_number, null: false
			Integer     :m, null: false
			Integer     :n, null: false
			foreign_key :tower_type_id, :tower_types, null: false
			DateTime    :created_on, default: "current_timestamp".lit
			primary_key :game_id, :wave_number, :m, :n
		end
		create_table :runner_types do
			Integer     :id
			String      :name
			primary_key :id
		end
		create_table :tower_types do
			Integer     :id
			String      :name
			primary_key :id
		end
		create_table :feature_types do
			Integer     :id
			String      :name
			primary_key :id
		end
	end
	def down
		drop_table :boards
		drop_table :board_ignores
		drop_table :levels
		drop_table :level_starts
		drop_table :level_finishes
		drop_table :level_features
		drop_table :level_waves
		drop_table :games
		drop_table :game_move_runners
		drop_table :game_move_runner_path
		drop_table :game_move_towers
		drop_table :runner_types
		drop_table :tower_types
		drop_table :feature_types
	end
end