DB = Sequel.sqlite('models/data.db')
Sequel::Inflections.singular('waves','wave')
require 'models/enumerations'
require 'models/user'
require 'models/board'
require 'models/level'
require 'models/game'
