get '/login' do
	@users = User.all
	haml :login
end

post '/login' do
	check_login
end

get '/logout' do
	logout
	redirect '/login'
end

get '/' do
	login_required
	@id     = :index
	@js     = %w[ index jquery.autovalidate.js ]
	@title  = 'Welcome to'
	@me ||= User[session[:user]]
	@my_games_on_offense = @me.games(:offense)
	@my_games_on_defense = @me.games(:defense)
	@games_with_open_o   = Game.filter(offense_user_id:nil).eager(:defense).all
	@games_with_open_d   = Game.filter(defense_user_id:nil).eager(:offense).all
	haml :index
end

get '/new_game' do
	login_required
	@id		 = :new_game
	@js    = %w[ new_game jquery.autovalidate.js ]
	@title = 'Start a Game'
	@boards = Board.eager(:levels).all
	haml :new_game
end

post '/new_game' do
	key_nibbles = 8
	max_key_int = 2**(4*key_nibbles)
	hex_format	= "%0#{key_nibbles}x"
	login_required
	side = :"#{params.delete('offense')=='true' ? :offense : :defense}_user_id"
	params.merge! side=>session[:user], created_by:session[:user],
	              offense_key:hex_format%rand(max_key_int),
	              defense_key:hex_format%rand(max_key_int)

	Game.create params
	redirect '/'
end

post '/join' do
	login_required

	#TODO: Better error message
	redirect '/' unless game = Game.eager(:offense,:defense)[params[:game_id]]

	game.offense ? (game.defense = @me) : (game.offense = @me)
	game.save
	
	redirect "/play/#{game.pk}"
end

get '/play' do
	redirect "/play/#{params[:game_id]}"
end

get '/play/:game_id' do
	login_required
	@id	= :play
	@js = %w[ board level cell game play ]

	#TODO: Better error message
	redirect '/' unless @game = Game.eager(:offense,:defense,:level=>[:board,:starts,:finishes,{features: :type},:waves])[params[:game_id]]

	@side,@opponent = case @me
		when @game.offense then [:offense,:defense]
		when @game.defense then [:defense,:offense]
		else redirect '/' #TODO: Better error message
	end

	@title = "#{@game.level.name} versus #{@game.send(@opponent).nick}"
		
	haml :play
end
