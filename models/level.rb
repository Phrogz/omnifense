class Level < Sequel::Model
	many_to_one :board
	one_to_many :starts,   class: :LevelStart
	one_to_many :finishes, class: :LevelFinish
	one_to_many :features, class: :LevelFeature
	one_to_many :waves,    class: :LevelWave, order: :wave_number
	one_to_many :games
	many_to_one :creator,  class: :User, key: :created_by
end

class LevelStart < Sequel::Model
	many_to_one :level
end

class LevelFinish < Sequel::Model
	many_to_one :level
end

class LevelFeature < Sequel::Model
	many_to_one :level
end

class LevelWave < Sequel::Model
	many_to_one :level
end