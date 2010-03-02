unless Object.const_defined?(:BUDDING_ROOT)
  BUDDING_ROOT = File.expand_path(File.join(File.dirname(__FILE__), '..'))
  $:.push(BUDDING_ROOT) 
end

require 'rubygems'

require 'sinatra'
require 'sequel'
require 'sinatra/sequel'

module Budding
  DBPARAMS = YAML::load(open(File.join(BUDDING_ROOT, 'conf', 'database.yml')))
  autoload :Frontend, 'budding/frontend'
  def self.setup_environment()
    for path in ['public', 'log']
      Dir.mkdir(File.join(BUDDING_ROOT, path)) unless File.exist?(File.join(BUDDING_ROOT, path))
    end
  end
  setup_environment()
end