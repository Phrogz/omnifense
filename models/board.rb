class Board < Sequel::Model
	one_to_many :ignores, class: :BoardIgnore
	one_to_many :levels
	many_to_one :creator,  class: :User, key: :created_by
	def to_js
		hash = values.slice( :name, :orientation,  :m,:n, :width,:height,
		                     :col_offset,:row_offset,:col_spacing,:row_spacing,
		                     :tile_width,:tile_height, :background,:overlay )
		hash[:ignores] = ignores.map{ |i| [i.m,i.n] }
		hash.to_js
	end
end

class BoardIgnore < Sequel::Model
	many_to_one :board
end