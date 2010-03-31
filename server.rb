require 'sinatra'
require 'haml'
require 'sequel'
require 'models/init'
require 'lib/tojs'

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
end

get '/' do
	login_required
	@id     = :index
	@title  = "Welcome to"
	@me     = User[session[:user]]
	@my_games_on_offense = @me.games(:offense)
	@my_games_on_defense = @me.games(:offense)
	@games_with_open_o   = Game.filter( offense_user_id:nil ).eager(:defense).all
	@games_with_open_d   = Game.filter( defense_user_id:nil ).eager(:offense).all
	haml :index
end

get '/login' do
	@users = User.all
	haml :login
end

post '/login' do
	check_login
end

get '/new_game' do
	@js = 'new_game.js'
	@boards = Board.eager(:levels).all
	haml :new_game
end