class Level < Sequel::Model
	many_to_one :board
	one_to_many :starts,   class: :LevelStart
	one_to_many :finishes, class: :LevelFinish
	one_to_many :features, class: :LevelFeature
	one_to_many :waves,    class: :LevelWave, order: :wave_number
	one_to_many :games
	many_to_one :creator,  class: :User, key: :created_by
	def to_js
		hash = values.slice( :name, :lives )
		hash[:starts]   = starts.map{ |i| [i.m,i.n] }
		hash[:finishes] = finishes.map{ |i| [i.m,i.n] }
		hash[:features] = features.map{ |i| [i.m,i.n,i.type.name] }
		hash[:waves]    = waves.map{ |w| { runners:w.runners, towers:w.towers, duration:w.duration } }
		hash.to_js
	end
end

class LevelStart < Sequel::Model
	many_to_one :level
end

class LevelFinish < Sequel::Model
	many_to_one :level
end

class LevelFeature < Sequel::Model
	many_to_one :level
	many_to_one :type, class: :FeatureType
end

class LevelWave < Sequel::Model
	many_to_one :level
end