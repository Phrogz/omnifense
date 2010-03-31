class Object
	alias_method :to_js, :inspect
end
class String
	alias_method :to_js, :inspect
end
class Array
	def to_js
		"[#{map{|o|o.to_js}.join(',')}]"
	end
end
class Hash
	JS_ID_RE = /^[a-z_$][\w$]*$/i
	def to_js
		"{#{
			map{ |k,v|
				ks = k.to_s
				"#{ks[JS_ID_RE] ? ks : ks.inspect}:#{v.to_js}"
			}.join(',')
		}}"
	end
end