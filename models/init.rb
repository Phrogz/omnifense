DB = Sequel.sqlite('models/data.db')

#require 'logger'
#DB.loggers << Logger.new($stdout)

Sequel::Inflections.singular('waves','wave')
require 'models/enumerations'
require 'models/user'
require 'models/board'
require 'models/level'
require 'models/game'
