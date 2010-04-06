class Hash
	def slice( *keys )
		Hash[ *keys.zip( values_at(*keys) ).flatten(1) ]
	end
end