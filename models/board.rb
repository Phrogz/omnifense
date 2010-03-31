class Board < Sequel::Model
	one_to_many :ignores, class: :BoardIgnore
	one_to_many :levels
	many_to_one :creator,  class: :User, key: :created_by
	# def to_json
	# 	json_from %w[ name orientation m n width height col_offset row_offset
	# 	              row_spacing col_spacing tile_width tile_height
	# 	              background overlay created_on created_by ]
	# end
end

class BoardIgnore < Sequel::Model
	many_to_one :board
end