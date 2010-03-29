require 'sinatra'
require 'sequel'
require 'models/init'

get '/:game' do
	IO.read("data/games/#{params[:game]}.json")
end