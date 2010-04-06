require 'sinatra'
require 'haml'
require 'sequel'
require 'models/init'
require 'lib/tojs'
require 'lib/hash_slice'
require 'routes'

set :haml, { :format => :html4 }
set :environment, :development
enable :sessions

helpers do
	def login_required
		unless session[:user] || request.xhr?
			if id=request.cookies[:omniuser] && key=request.cookies[:omnicook]
				session[:user]=id if User[id:id, cookey:key]
			end
			unless session[:user]
				session[:return_to] = request.fullpath
				redirect '/login'
				pass rescue throw :pass
			end
		end
	end
	def check_login
    if user=User[params[:user_id]] || user=User.authenticate(params[:username], params[:password])
			session[:user] = user.id
			redirect_to_stored
    else
      redirect '/login'
    end
	end
	def redirect_to_stored
		if return_to = session[:return_to]
			session[:return_to] = nil
			redirect return_to
		else
			redirect '/'
		end
	end
	def logout
		session[:user] = nil
	end
end

before do
	@me = User[session[:user]] if session[:user]
end
